#!/usr/bin/env python3
"""
Flask 서버: rembg를 사용한 배경 제거
포트: 5000
엔드포인트: POST /remove-bg
"""

from flask import Flask, request, jsonify, send_file
from rembg import remove
from PIL import Image
import io
import base64
import requests
from urllib.parse import urlparse
import os

app = Flask(__name__)

# 최대 파일 크기: 50MB
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024


@app.route('/remove-bg', methods=['POST'])
def remove_background():
    """
    배경 제거 API

    요청 형식:
    {
        "imageUrl": "https://example.com/image.jpg"  // 또는
        "imageBase64": "data:image/png;base64,..."
    }

    응답 형식:
    {
        "success": true/false,
        "imageUrl": "data:image/png;base64,...",
        "error": "에러 메시지 (실패 시)"
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "요청 본문이 없습니다"
            }), 400

        image_data = None

        # URL에서 이미지 다운로드
        if 'imageUrl' in data and data['imageUrl']:
            try:
                image_url = data['imageUrl']
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                image_data = Image.open(io.BytesIO(response.content))
            except Exception as e:
                return jsonify({
                    "success": False,
                    "error": f"이미지 다운로드 실패: {str(e)}"
                }), 400

        # Base64에서 이미지 디코드
        elif 'imageBase64' in data and data['imageBase64']:
            try:
                image_base64 = data['imageBase64']
                # data:image/png;base64,... 형식 처리
                if image_base64.startswith('data:'):
                    image_base64 = image_base64.split(',')[1]

                image_bytes = base64.b64decode(image_base64)
                image_data = Image.open(io.BytesIO(image_bytes))
            except Exception as e:
                return jsonify({
                    "success": False,
                    "error": f"이미지 디코드 실패: {str(e)}"
                }), 400

        else:
            return jsonify({
                "success": False,
                "error": "imageUrl 또는 imageBase64가 필요합니다"
            }), 400

        # 배경 제거
        output = remove(image_data)

        # PNG로 변환
        output_buffer = io.BytesIO()
        output.save(output_buffer, format='PNG')
        output_buffer.seek(0)

        # Base64로 인코딩
        image_base64 = base64.b64encode(output_buffer.getvalue()).decode()
        output_url = f"data:image/png;base64,{image_base64}"

        return jsonify({
            "success": True,
            "imageUrl": output_url,
            "message": "배경이 성공적으로 제거되었습니다"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"배경 제거 실패: {str(e)}"
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """헬스 체크 엔드포인트"""
    return jsonify({"status": "ok"}), 200


if __name__ == '__main__':
    # 개발 모드에서 실행
    app.run(host='127.0.0.1', port=5000, debug=False)
