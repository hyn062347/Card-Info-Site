const OpenAI = require('openai');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { name, mana_cost, type_line, oracle_text } = event.queryStringParameters;

  if (!name || !type_line || !oracle_text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'All card details are required.' }),
    };
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing OpenAI API key in environment variables.' }),
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant specialized in Magic: The Gathering cards.',
        },
        {
          role: 'user',
          content: `Provide insights on the following Magic: The Gathering card details concisely in Korean (under 1500 characters):

Name: ${name}
Mana Cost: ${mana_cost}
Type Line: ${type_line}
Oracle Text: ${oracle_text}

What type of deck this card is commonly used in (e.g., aggro, control, combo).
When or under what circumstances this card is typically played or most effective (e.g., early game, late game, in response to a specific strategy).`,
        },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of response) {
            const content = part.choices[0]?.delta?.content || '';
            if (content) {
              const formattedContent = content.replace(/(\.\s*\n\n|\.\s*\n|\n\n|\n)/g, '<br>');
              controller.enqueue(encoder.encode(`data: ${formattedContent}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error streaming response:', error);
          controller.enqueue(encoder.encode('data: [ERROR]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to summarize card details.' }),
    };
  }
};
