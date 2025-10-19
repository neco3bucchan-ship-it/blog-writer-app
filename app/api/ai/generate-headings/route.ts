import { NextRequest, NextResponse } from 'next/server';
import { generateHeadings, GenerateHeadingsRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateHeadingsRequest = await request.json();
    
    // バリデーション
    if (!body.theme || !body.targetAudience) {
      return NextResponse.json(
        { error: 'テーマとターゲット読者の両方が必要です' },
        { status: 400 }
      );
    }

    if (body.theme.length < 5 || body.theme.length > 500) {
      return NextResponse.json(
        { error: 'テーマは5文字以上500文字以内で入力してください' },
        { status: 400 }
      );
    }

    // Gemini APIで見出し生成
    const result = await generateHeadings(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '見出しの生成に失敗しました。しばらく待ってから再試行してください。' },
      { status: 500 }
    );
  }
}

