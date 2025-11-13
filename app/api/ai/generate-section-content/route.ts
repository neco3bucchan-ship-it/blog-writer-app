import { NextRequest, NextResponse } from 'next/server';
import { generateSectionContent, GenerateSectionContentRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log('Received section content generation request');
    const body: GenerateSectionContentRequest = await request.json();
    
    console.log('Request body:', {
      sectionTitle: body.sectionTitle,
      theme: body.theme,
      targetAudience: body.targetAudience,
      heading: body.heading,
      hasDescription: !!body.sectionDescription
    });
    
    // バリデーション
    if (!body.sectionTitle || !body.theme || !body.targetAudience || !body.heading) {
      console.error('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'セクションタイトル、テーマ、ターゲット読者、見出しのすべてが必要です' },
        { status: 400 }
      );
    }

    if (body.sectionTitle.length < 2 || body.sectionTitle.length > 100) {
      console.error('Validation failed: Invalid section title length');
      return NextResponse.json(
        { error: 'セクションタイトルは2文字以上100文字以内で入力してください' },
        { status: 400 }
      );
    }

    console.log('Starting section content generation...');
    
    // Gemini APIでセクションコンテンツ生成
    const content = await generateSectionContent(body);
    
    console.log('Section content generated successfully, length:', content.length);
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('API Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'コンテンツの生成に失敗しました。しばらく待ってから再試行してください。',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

