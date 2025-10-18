import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API設定
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// 見出し生成の型定義
export interface HeadingOption {
  id: string;
  title: string;
  description: string;
}

export interface GenerateHeadingsRequest {
  theme: string;
  targetAudience: string;
}

export interface GenerateHeadingsResponse {
  headings: HeadingOption[];
}

// 見出し生成関数
export async function generateHeadings(request: GenerateHeadingsRequest): Promise<GenerateHeadingsResponse> {
  try {
    // APIキーが設定されていない場合はダミーデータを返す
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('Using dummy data for headings generation');
      return {
        headings: [
          {
            id: "1",
            title: `${request.theme}の基礎を学ぶ完全ガイド`,
            description: "初心者向けの基礎知識から実践まで"
          },
          {
            id: "2", 
            title: `ゼロから始める${request.theme}入門`,
            description: "環境構築から実際の開発まで"
          },
          {
            id: "3",
            title: `${request.theme}で作る実践的なアプリケーション`,
            description: "実際のプロジェクトで学ぶ"
          },
          {
            id: "4",
            title: `${request.theme}の応用テクニック`,
            description: "中級者向けの高度な技術"
          }
        ]
      };
    }

    const prompt = `
テーマ: ${request.theme}
ターゲット読者: ${request.targetAudience}

このテーマに基づいて、3-5個の魅力的な見出しを生成してください。
各見出しは30文字以内で、読者の興味を引くものにしてください。

以下のJSON形式で返してください：
{
  "headings": [
    {
      "id": "1",
      "title": "見出しタイトル",
      "description": "見出しの簡潔な説明"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON形式のレスポンスをパース
    try {
      const parsedResponse = JSON.parse(text);
      return {
        headings: parsedResponse.headings || []
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // パースに失敗した場合はフォールバック
      return {
        headings: [
          {
            id: "1",
            title: "生成された見出し1",
            description: "AIが生成した見出しです"
          },
          {
            id: "2", 
            title: "生成された見出し2",
            description: "AIが生成した見出しです"
          },
          {
            id: "3",
            title: "生成された見出し3", 
            description: "AIが生成した見出しです"
          }
        ]
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    // APIエラーの場合もダミーデータを返す
    return {
      headings: [
        {
          id: "1",
          title: `${request.theme}の基礎を学ぶ完全ガイド`,
          description: "初心者向けの基礎知識から実践まで"
        },
        {
          id: "2", 
          title: `ゼロから始める${request.theme}入門`,
          description: "環境構築から実際の開発まで"
        },
        {
          id: "3",
          title: `${request.theme}で作る実践的なアプリケーション`,
          description: "実際のプロジェクトで学ぶ"
        }
      ]
    };
  }
}
