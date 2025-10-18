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

// アウトライン生成の型定義
export interface OutlineSection {
  id: string;
  section: number;
  title: string;
  description: string;
}

export interface GenerateOutlineRequest {
  heading: string;
  targetAudience: string;
}

export interface GenerateOutlineResponse {
  outline: OutlineSection[];
}

// 本文生成の型定義
export interface ContentSection {
  id: string;
  section: number;
  title: string;
  content: string;
}

export interface GenerateContentRequest {
  heading: string;
  targetAudience: string;
  outline: OutlineSection[];
}

export interface GenerateContentResponse {
  content: ContentSection[];
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

// アウトライン生成関数
export async function generateOutline(request: GenerateOutlineRequest): Promise<GenerateOutlineResponse> {
  try {
    // APIキーが設定されていない場合はダミーデータを返す
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('Using dummy data for outline generation');
      return {
        outline: [
          {
            id: "1",
            section: 1,
            title: `${request.heading}とは何か？`,
            description: "基本的な概念と特徴を解説し、なぜ重要なのかを説明します"
          },
          {
            id: "2",
            section: 2,
            title: "環境構築の手順",
            description: "開発環境の準備から始めよう。必要なツールのインストールから始めます"
          },
          {
            id: "3",
            section: 3,
            title: "基礎的な使い方",
            description: "実際にコードを書いてみよう。シンプルな例から始めます"
          },
          {
            id: "4",
            section: 4,
            title: "応用テクニック",
            description: "より高度な機能やテクニックを学びます"
          },
          {
            id: "5",
            section: 5,
            title: "実践的なプロジェクト",
            description: "実際のプロジェクトで学ぶ。実用的なアプリケーションを作成してみましょう"
          }
        ]
      };
    }

    const prompt = `
見出し: ${request.heading}
ターゲット読者: ${request.targetAudience}

この見出しに基づいて、詳細な記事の目次を生成してください。
各セクションには以下の情報を含めてください：
- セクション番号
- セクションタイトル（30文字以内）
- 詳細説明（50-100文字）

3-7個のセクションで構成してください。

以下のJSON形式で返してください：
{
  "outline": [
    {
      "id": "1",
      "section": 1,
      "title": "セクションタイトル",
      "description": "詳細説明"
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
        outline: parsedResponse.outline || []
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // パースに失敗した場合はフォールバック
      return {
        outline: [
          {
            id: "1",
            section: 1,
            title: "生成されたセクション1",
            description: "AIが生成したセクションです"
          },
          {
            id: "2",
            section: 2,
            title: "生成されたセクション2",
            description: "AIが生成したセクションです"
          },
          {
            id: "3",
            section: 3,
            title: "生成されたセクション3",
            description: "AIが生成したセクションです"
          }
        ]
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    // APIエラーの場合もダミーデータを返す
    return {
      outline: [
        {
          id: "1",
          section: 1,
          title: `${request.heading}とは何か？`,
          description: "基本的な概念と特徴を解説し、なぜ重要なのかを説明します"
        },
        {
          id: "2",
          section: 2,
          title: "環境構築の手順",
          description: "開発環境の準備から始めよう。必要なツールのインストールから始めます"
        },
        {
          id: "3",
          section: 3,
          title: "基礎的な使い方",
          description: "実際にコードを書いてみよう。シンプルな例から始めます"
        },
        {
          id: "4",
          section: 4,
          title: "応用テクニック",
          description: "より高度な機能やテクニックを学びます"
        },
        {
          id: "5",
          section: 5,
          title: "実践的なプロジェクト",
          description: "実際のプロジェクトで学ぶ。実用的なアプリケーションを作成してみましょう"
        }
      ]
    };
  }
}

// 本文生成関数
export async function generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
  try {
    // APIキーが設定されていない場合はダミーデータを返す
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('Using dummy data for content generation');
      return {
        content: request.outline.map((section, index) => ({
          id: section.id,
          section: section.section,
          title: section.title,
          content: `${section.title}について詳しく解説します。\n\n${section.description}\n\nこのセクションでは、${request.targetAudience}向けに分かりやすく説明していきます。具体的な例や実践的な内容を含めて、読者が理解しやすいように構成しています。\n\n## 重要なポイント\n\n- 基本概念の理解\n- 実践的な例\n- よくある質問への回答\n\nこれらの内容を通じて、読者の理解を深めていきます。`
        }))
      };
    }

    const prompt = `
見出し: ${request.heading}
ターゲット読者: ${request.targetAudience}

以下の目次に基づいて、詳細な記事の本文を生成してください：

${request.outline.map(section => `${section.section}. ${section.title} - ${section.description}`).join('\n')}

各セクションについて、以下の形式で本文を生成してください：
- セクション番号とタイトル
- 詳細な説明文（200-500文字程度）
- 実践的な例や具体的な内容
- 読者が理解しやすい構成

以下のJSON形式で返してください：
{
  "content": [
    {
      "id": "1",
      "section": 1,
      "title": "セクションタイトル",
      "content": "詳細な本文内容"
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
        content: parsedResponse.content || []
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // パースに失敗した場合はフォールバック
      return {
        content: request.outline.map((section, index) => ({
          id: section.id,
          section: section.section,
          title: section.title,
          content: `${section.title}について詳しく解説します。\n\n${section.description}\n\nこのセクションでは、${request.targetAudience}向けに分かりやすく説明していきます。`
        }))
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    // APIエラーの場合もダミーデータを返す
    return {
      content: request.outline.map((section, index) => ({
        id: section.id,
        section: section.section,
        title: section.title,
        content: `${section.title}について詳しく解説します。\n\n${section.description}\n\nこのセクションでは、${request.targetAudience}向けに分かりやすく説明していきます。具体的な例や実践的な内容を含めて、読者が理解しやすいように構成しています。`
      }))
    };
  }
}
