import { NextRequest, NextResponse } from 'next/server';
import { generateContent, GenerateContentRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentRequest = await request.json();
    
    // バリデーション
    if (!body.heading || !body.targetAudience || !body.outline || !Array.isArray(body.outline)) {
      return NextResponse.json(
        { error: '見出し、ターゲット読者、目次のすべてが必要です' },
        { status: 400 }
      );
    }

    if (body.heading.length < 5 || body.heading.length > 100) {
      return NextResponse.json(
        { error: '見出しは5文字以上100文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (body.outline.length === 0) {
      return NextResponse.json(
        { error: '目次が空です' },
        { status: 400 }
      );
    }

    // Gemini APIで本文生成
    const result = await generateContent(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '本文の生成に失敗しました。しばらく待ってから再試行してください。' },
      { status: 500 }
    );
  }
}

