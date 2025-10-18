import { NextRequest, NextResponse } from 'next/server';
import { generateOutline, GenerateOutlineRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateOutlineRequest = await request.json();
    
    // バリデーション
    if (!body.heading || !body.targetAudience) {
      return NextResponse.json(
        { error: '見出しとターゲット読者の両方が必要です' },
        { status: 400 }
      );
    }

    if (body.heading.length < 5 || body.heading.length > 100) {
      return NextResponse.json(
        { error: '見出しは5文字以上100文字以内で入力してください' },
        { status: 400 }
      );
    }

    // Gemini APIでアウトライン生成
    const result = await generateOutline(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'アウトラインの生成に失敗しました。しばらく待ってから再試行してください。' },
      { status: 500 }
    );
  }
}
