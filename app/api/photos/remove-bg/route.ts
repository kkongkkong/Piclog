import { NextRequest, NextResponse } from 'next/server';
import { NukkiResult } from '@/types';

/**
 * POST /api/photos/remove-bg
 * 이미지의 배경을 제거합니다 (누끼 따기).
 * - 로컬 Python rembg 서버를 사용하여 배경 제거
 * - 배경제거된 PNG를 Base64로 반환
 *
 * Body: { imageUrl: string }
 * Response: { success: boolean; imageUrl?: string; error?: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse<NukkiResult>> {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          imageUrl: '',
          error: '이미지 URL이 필요합니다',
        },
        { status: 400 }
      );
    }

    // Python 로컬 서버로 배경 제거 요청
    const pythonServerUrl = process.env.PYTHON_SERVER_URL || 'http://127.0.0.1:5000';

    const pythonResponse = await fetch(`${pythonServerUrl}/remove-bg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!pythonResponse.ok) {
      const error = await pythonResponse.json();
      console.error('Python 배경 제거 서버 에러:', error);
      return NextResponse.json(
        {
          success: false,
          imageUrl: '',
          error: `배경 제거 실패: ${error.error || '알 수 없는 오류'}`,
        },
        { status: 500 }
      );
    }

    const result = await pythonResponse.json();

    if (result.success && result.imageUrl) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        message: '배경이 성공적으로 제거되었습니다',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          imageUrl: '',
          error: result.error || '배경 제거 실패',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('배경 제거 중 오류:', error);
    const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      {
        success: false,
        imageUrl: '',
        error: `배경 제거 실패: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}
