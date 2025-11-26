import { NextRequest, NextResponse } from 'next/server';
import { NukkiResult } from '@/types';

/**
 * POST /api/photos/remove-bg
 * 이미지의 배경을 제거합니다 (누끼 따기).
 * - Replicate API를 사용하여 배경 제거
 * - 배경제거된 PNG를 반환
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

    // Replicate API Key 확인
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      console.error('REPLICATE_API_TOKEN 환경변수가 설정되지 않았습니다');
      return NextResponse.json(
        {
          success: false,
          imageUrl: '',
          error: 'API 토큰이 설정되지 않았습니다',
        },
        { status: 500 }
      );
    }

    // Replicate API를 통해 배경 제거
    // 사용 모델: fottoai/remove-bg-2
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${replicateToken}`,
      },
      body: JSON.stringify({
        version: 'd748bcc6882e5567ffe1468356323e6345736494dd9b827ff2871a68fca79be5',
        input: {
          image: imageUrl,
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json();
      console.error('Replicate API 에러:', error);
      console.error('Replicate 상태 코드:', replicateResponse.status);
      console.error('Replicate 응답 전체:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        {
          success: false,
          imageUrl: '',
          error: `Replicate API 호출 실패: ${error.detail || JSON.stringify(error)}`,
        },
        { status: 500 }
      );
    }

    const replicateData = await replicateResponse.json();
    const predictionId = replicateData.id;

    // Prediction이 완료될 때까지 폴링 (최대 30초)
    let prediction = replicateData;
    const maxRetries = 60;
    let retries = 0;

    while (
      (prediction.status === 'processing' || prediction.status === 'starting') &&
      retries < maxRetries
    ) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms 대기

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${replicateToken}`,
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error('Prediction 상태 조회 실패');
      }

      prediction = await statusResponse.json();
      retries++;
    }

    // 결과 확인
    if (prediction.status === 'succeeded' && prediction.output) {
      const outputUrl = prediction.output;

      return NextResponse.json({
        success: true,
        imageUrl: outputUrl,
        message: '배경이 성공적으로 제거되었습니다',
      });
    } else if (prediction.status === 'failed') {
      return NextResponse.json(
        {
          success: false,
          imageUrl: '',
          error: `배경 제거 실패: ${prediction.error || '알 수 없는 오류'}`,
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          imageUrl: '',
          error: `처리 시간 초과 (현재 상태: ${prediction.status})`,
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
