import { GoogleGenAI, Type } from "@google/genai";

export interface TankaResult {
  famousTanka: {
    poem: string;
    poet: string;
    explanation: string;
  };
  manyoshuTanka: {
    poem: string;
    poet: string;
    explanation: string;
  };
  generatedTanka: {
    poem: string;
    explanation: string;
  };
}

export async function generateTanka(feeling: string): Promise<TankaResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("APIキーが見つかりません。設定を確認してください。");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
あなたは短歌の専門家です。ユーザーの「今の気持ち」を受け取り、以下の3つを提案してください。

1. 有名な歌人の短歌：
   - ユーザーの気持ちに近い、実在する有名な歌人（古今和歌集から現代短歌まで、万葉集以外）の作品を1つ選んでください。
   - 歌、作者名、なぜその気持ちに合うかの解説を含めてください。

2. 万葉集の短歌：
   - 万葉集の中から、ユーザーの気持ちに寄り添う作品を1つ選んでください。
   - 歌、作者名、なぜその気持ちに合うかの解説を含めてください。

3. AIによる新作短歌：
   - 以下のルールを厳守して作成してください。
   - 【ルール】
     ・必ず五・七・五・七・七の形式にする（多少の字余りは許容）。
     ・情景描写（風景・季節・光・音など）を必ず入れる。
     ・感情を直接言葉にせず、情景や余韻で表現する。
     ・現代的で共感しやすい言葉を使う。
     ・結句（最後の句）で軽い余韻や視点の転換を作る。
   - 歌と、その歌に込めた意図の解説を含めてください。

レスポンスは必ず指定されたJSON形式で返してください。
`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ role: "user", parts: [{ text: `今の気持ち: ${feeling}` }] }],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          famousTanka: {
            type: Type.OBJECT,
            properties: {
              poem: { type: Type.STRING, description: "有名な短歌（五七五七七）" },
              poet: { type: Type.STRING, description: "作者名" },
              explanation: { type: Type.STRING, description: "選定理由の解説" }
            },
            required: ["poem", "poet", "explanation"]
          },
          manyoshuTanka: {
            type: Type.OBJECT,
            properties: {
              poem: { type: Type.STRING, description: "万葉集の短歌（五七五七七）" },
              poet: { type: Type.STRING, description: "作者名" },
              explanation: { type: Type.STRING, description: "選定理由の解説" }
            },
            required: ["poem", "poet", "explanation"]
          },
          generatedTanka: {
            type: Type.OBJECT,
            properties: {
              poem: { type: Type.STRING, description: "AIが生成した短歌（五七五七七）" },
              explanation: { type: Type.STRING, description: "歌の解説" }
            },
            required: ["poem", "explanation"]
          }
        },
        required: ["famousTanka", "manyoshuTanka", "generatedTanka"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AIからの応答が空でした。");
  
  return JSON.parse(text) as TankaResult;
}
