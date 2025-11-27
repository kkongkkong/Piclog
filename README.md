# Piclog 📸

**무노력 자동 기록 서비스** - 사진만 찍어도 하루 기록이 자동으로 완성되는 타임라인 서비스

## 프로젝트 개요

Piclog는 사용자가 촬영한 사진을 자동으로 정렬하여 24시간 타임라인으로 표현하는 서비스입니다.

### 핵심 기능

- 📸 **자동 타임라인**: 촬영 시간(EXIF)을 기반으로 자동 정렬
- 🔄 **자동 동기화**: 1시간 주기의 백그라운드 갤러리 스캔
- 📱 **요약뷰**: 스크롤 없이 한눈에 보는 압축된 뷰
- 📝 **사진 선택/제외**: 타임라인에 표시할 사진 선택
- ✨ **누끼 따기**: AI 기반 배경 제거로 스티커 생성
- 🎨 **사진 꾸미기**: Canvas 기반의 이미지 편집 및 레이어 관리
- ⚡ **무로그인**: Guest 계정으로 즉시 시작

## 기술 스택

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **State Management**: React Hooks

## 프로젝트 구조

```
piclog/
├── app/                           # Next.js App Router
│   ├── page.tsx                  # 메인 페이지 (타임라인)
│   ├── decorate/                 # 꾸미기 페이지 (신규)
│   ├── layout.tsx                # 루트 레이아웃
│   └── api/                      # API 라우트
│       ├── photos/               # 사진 관련 API
│       │   ├── upload/           # 사진 업로드
│       │   ├── delete/           # 사진 삭제
│       │   ├── auto-sync/        # 자동 동기화
│       │   └── remove-bg/        # 배경 제거 (신규)
│       ├── timeline/             # 타임라인 조회
│       └── decorations/          # 꾸미기 데이터 (신규)
│           ├── save/             # 저장
│           └── get/              # 조회
├── components/
│   ├── timeline/                 # 기본 타임라인 컴포넌트
│   ├── decorate/                 # 꾸미기 컴포넌트 (신규)
│   │   ├── DecorateContainer.tsx
│   │   ├── DecorateCanvas.tsx
│   │   ├── NukkiButton.tsx
│   │   ├── ElementToolBar.tsx
│   │   └── LayerPanel.tsx
│   ├── compact/                  # 요약뷰 컴포넌트
│   └── common/                   # 공통 컴포넌트
├── hooks/                        # Custom React Hooks
│   └── useNukki.ts              # 배경 제거 Hook (신규)
├── types/                        # TypeScript 타입 정의
├── lib/                          # 유틸리티 함수
├── public/                       # 정적 에셋
├── .env.example                  # 환경변수 예시 (신규)
└── globals.css                   # 글로벌 스타일

```

## 설치 & 실행

### 1단계: 패키지 설치
```bash
npm install
```

### 2단계: 환경변수 설정 (.env.local)
```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Replicate API 설정 (누끼 따기 기능용)
# https://replicate.com/account/api-tokens 에서 토큰 생성
REPLICATE_API_TOKEN=your_replicate_api_token
```

### 3단계: Supabase 테이블 생성 (신규)
```sql
-- decorations 테이블
CREATE TABLE decorations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  photo_id UUID NOT NULL,
  decorations JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(photo_id)
);

-- stickers 스토리지 버킷 생성
-- Supabase 대시보드의 Storage에서 "stickers" 버킷 생성
```

### 4단계: 개발 서버 실행
```bash
npm run dev
```

### 5단계: 브라우저 접속
```
http://localhost:3000
```

## API 명세

### 사진 관련 API

- **POST /api/photos/upload** - 사진 업로드
- **GET /api/timeline?date=YYYY-MM-DD** - 타임라인 조회
- **POST /api/photos/auto-sync** - 자동 동기화 실행
- **DELETE /api/photos/delete** - 사진 삭제

### 누끼 & 꾸미기 API (신규)

- **POST /api/photos/remove-bg** - 배경 제거 (누끼)
  - Body: `{ imageUrl: string }`
  - Response: `{ success: boolean, imageUrl?: string, error?: string }`

- **POST /api/decorations/save** - 꾸미기 데이터 저장
  - Body: `{ photoId: string, decorations: DecorationElement[] }`
  - Response: `{ success: boolean, data?: object }`

- **GET /api/decorations/get?photoId=XXX** - 꾸미기 데이터 조회
  - Response: `{ photoId: string, decorations: DecorationElement[] }`

## 누끼 따기 (배경 제거) 사용 방법

### 사용자 시나리오
1. **타임라인에서 사진 선택**: 꾸미고 싶은 사진에 마우스 오버
2. **✨ 누끼 따기 버튼 클릭**: 꾸미기 페이지로 이동
3. **누끼 따기 실행**: "✨ 누끼 따기" 버튼으로 배경 제거
4. **요소 편집**: 크기 조정, 회전, 위치 변경 등
5. **저장**: "💾 저장" 버튼으로 데코레이션 저장

### 지원하는 작업
- ✨ **배경 제거**: AI를 사용한 자동 배경 제거
- 🎨 **레이어 관리**: 여러 요소의 겹침 순서 조정
- 📐 **위치 조정**: Drag & Drop으로 요소 이동
- 📏 **크기 조정**: 슬라이더로 크기 조절 (10% ~ 200%)
- 🔄 **회전**: 슬라이더로 0° ~ 360° 회전

## 개발 가이드

모든 개발은 **요구사항.md**를 기준으로 진행됩니다.

- [요구사항.md](./요구사항.md) - 전체 스펙 및 기능 정의
- 컴포넌트 및 훅의 상세 사양은 각 파일의 주석 참조

### 외부 API
- **Replicate**: 배경 제거 모델 (https://replicate.com/remove-background)
- **Supabase**: 데이터베이스 및 스토리지

## 라이센스

MIT
