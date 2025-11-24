# Piclog 📸

**무노력 자동 기록 서비스** - 사진만 찍어도 하루 기록이 자동으로 완성되는 타임라인 서비스

## 프로젝트 개요

Piclog는 사용자가 촬영한 사진을 자동으로 정렬하여 24시간 타임라인으로 표현하는 서비스입니다.

### 핵심 기능

- 📸 **자동 타임라인**: 촬영 시간(EXIF)을 기반으로 자동 정렬
- 🔄 **자동 동기화**: 1시간 주기의 백그라운드 갤러리 스캔
- 📱 **요약뷰**: 스크롤 없이 한눈에 보는 압축된 뷰
- 📝 **사진 선택/제외**: 타임라인에 표시할 사진 선택
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
│   ├── page.tsx                  # 메인 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   └── api/                      # API 라우트
│       ├── photos/               # 사진 관련 API
│       └── timeline/             # 타임라인 관련 API
├── components/
│   ├── timeline/                 # 기본 타임라인 컴포넌트
│   ├── compact/                  # 요약뷰 컴포넌트
│   └── common/                   # 공통 컴포넌트
├── hooks/                        # Custom React Hooks
├── types/                        # TypeScript 타입 정의
├── lib/                          # 유틸리티 함수
├── public/                       # 정적 에셋
└── globals.css                   # 글로벌 스타일

```

## 설치 & 실행

```bash
# 1. 패키지 설치
npm install

# 2. 환경변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 http://localhost:3000 접속
```

## API 명세

### POST /api/photos/upload
사진 업로드

### GET /api/timeline?date=YYYY-MM-DD
타임라인 조회

### POST /api/photos/auto-sync
자동 동기화 실행

## 개발 가이드

모든 개발은 **요구사항.md**를 기준으로 진행됩니다.

- [요구사항.md](./요구사항.md) - 전체 스펙 및 기능 정의
- 컴포넌트 및 훅의 상세 사양은 각 파일의 주석 참조

## 라이센스

MIT
