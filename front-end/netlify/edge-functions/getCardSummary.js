// netlify/edge-functions/summarize-stream.js

export default async (request, context) => {
  // URLSearchParams를 통해 쿼리 파라미터 읽기
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const mana_cost = searchParams.get("mana_cost");
  const type_line = searchParams.get("type_line");
  const oracle_text = searchParams.get("oracle_text");

  if (!name || !type_line || !oracle_text) {
    return new Response(
      JSON.stringify({ error: "모든 카드 정보를 제공해야 합니다." }),
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  // OpenAI API 호출에 사용할 payload 구성
  const payload = {
    model: "gpt-4o", // 사용하고자 하는 모델명 (환경에 맞게 수정하세요)
    messages: [
      {
        role: "system",
        content: "You are an assistant specialized in Magic: The Gathering cards.",
      },
      {
        role: "user",
        content: `Provide insights on the following Magic: The Gathering card details concisely in korean(under 1500 characters):

Name: ${name}
Mana Cost: ${mana_cost}
Type Line: ${type_line}
Oracle Text: ${oracle_text}

What type of deck this card is commonly used in (e.g., aggro, control, combo).
When or under what circumstances this card is typically played or most effective (e.g., early game, late game, in response to a specific strategy).
`,
      },
    ],
    stream: true,
  };

  // 환경 변수에서 OpenAI API 키 가져오기
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API 키가 설정되어 있지 않습니다." }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  // OpenAI API에 POST 요청 보내기
  const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!apiResponse.ok || !apiResponse.body) {
    const errText = await apiResponse.text();
    return new Response(
      JSON.stringify({ error: "카드 정보를 요약하는데 실패했습니다.", details: errText }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  const encoder = new TextEncoder();

  // ReadableStream을 생성하여 OpenAI API의 스트리밍 응답을 파싱 후 이벤트 스트림 형식으로 변환
  const stream = new ReadableStream({
    async start(controller) {
      const reader = apiResponse.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 받아온 chunk를 문자열로 디코딩
          const chunk = decoder.decode(value, { stream: true });
          // OpenAI API 스트림은 SSE 형식(data: ... )이므로 줄 단위로 분리
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice("data: ".length).trim();
              if (dataStr === "[DONE]") {
                // 스트림 종료를 알림
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  // 내용 내의 개행 문자 등을 <br> 태그로 치환 (원하는 포맷에 맞게 수정)
                  const formattedContent = content.replace(/(\.\s*\n\n|\.\s*\n|\n\n|\n)/g, "<br>");
                  controller.enqueue(encoder.encode(`data: ${formattedContent}\n\n`));
                }
              } catch (err) {
                // JSON 파싱 실패 시 무시
                console.error("JSON 파싱 에러:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("스트림 처리 중 에러:", err);
        controller.error(err);
      }
      controller.close();
    },
  });

  // Netlify Edge Functions의 Response 객체에 필요한 헤더(CORS, event-stream 등)를 추가
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
