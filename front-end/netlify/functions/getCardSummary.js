const OpenAI = require('openai');

exports.handler = async (event) => {
  console.log("🔍 API 요청 수신:", event.httpMethod, event.queryStringParameters); // ✅ API 요청 확인

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { name, mana_cost, type_line, oracle_text } = event.queryStringParameters;

  if (!name || !type_line || !oracle_text) {
    console.log("⚠️ 필수 파라미터 누락:", { name, mana_cost, type_line, oracle_text }); // ✅ 파라미터 확인
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'All card details are required.' }),
    };
  }

  try {
    console.log("📡 OpenAI API 요청:", { name, mana_cost, type_line, oracle_text }); // ✅ OpenAI API 요청 정보

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API Key 누락");
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
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
      stream: false,
    });

    console.log("🔄 OpenAI 응답 스트리밍 시작..."); // ✅ 스트리밍 시작 확인

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of response) {
            const content = part.choices[0]?.delta?.content || '';
            if (content) {
              console.log("📡 OpenAI 응답:", content); // ✅ OpenAI 응답 내용
              const formattedContent = content.replace(/(\.\s*\n\n|\.\s*\n|\n\n|\n)/g, '<br>');
              controller.enqueue(encoder.encode(`data: ${formattedContent}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          console.log("✅ OpenAI 응답 완료");
          controller.close();
        } catch (error) {
          console.error("❌ OpenAI 스트리밍 오류:", error);
          controller.enqueue(encoder.encode('data: [ERROR]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("❌ OpenAI API 오류:", error); // ✅ API 호출 중 에러 확인
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Failed to summarize card details.' }),
    };
  }
};
