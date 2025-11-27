# 타임라인 사진 드래그 기능 - Supabase 설정 가이드

## 필수 설정: photo_positions 테이블 생성

타임라인 사진 드래그 기능을 사용하려면 Supabase에 `photo_positions` 테이블을 생성해야 합니다.

### Supabase SQL 쿼리 실행

Supabase 대시보드 → SQL Editor에서 다음 쿼리를 실행하세요:

```sql
CREATE TABLE photo_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL,
  time_block TEXT NOT NULL,
  x FLOAT NOT NULL DEFAULT 0,
  y FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(photo_id, time_block)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_photo_positions_photo_id ON photo_positions(photo_id);
CREATE INDEX idx_photo_positions_time_block ON photo_positions(time_block);
```

### RLS (Row Level Security) 설정

Supabase 대시보드 → Authentication → Policies에서:

1. **Enable RLS**를 활성화
2. 다음 정책 추가:
   - **SELECT**: 누구나 읽기 가능
   - **INSERT**: 누구나 삽입 가능
   - **UPDATE**: 누구나 업데이트 가능
   - **DELETE**: 누구나 삭제 가능

또는 SQL로:

```sql
ALTER TABLE photo_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read photo_positions"
ON photo_positions FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert photo_positions"
ON photo_positions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update photo_positions"
ON photo_positions FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete photo_positions"
ON photo_positions FOR DELETE
USING (true);
```

## 기능 설명

### 사진 드래그 동작
1. TimelineSection 내 사진을 **마우스로 클릭하여 드래그**
2. TimelineSection 범위 내에서만 이동 가능
3. 범위 밖으로 나가면 원위치로 자동 복구
4. 드래그 완료 시 위치가 Supabase에 자동 저장
5. **새로고침 후에도 저장된 위치가 유지**됨

### API 엔드포인트
- **GET** `/api/photos/positions/get?photoId=xxx&time=09:00` - 저장된 위치 조회
- **POST** `/api/photos/positions/save` - 위치 저장

### 데이터 구조
```typescript
// 데이터베이스에 저장되는 형식
{
  id: UUID,
  photo_id: UUID,
  time_block: "09:00",
  x: 100.5,      // px 단위
  y: 50.3,       // px 단위
  created_at: ISO8601,
  updated_at: ISO8601
}
```

## 주의사항

- 시간대(Time Block) 변경 기능은 없습니다 (같은 시간대 내에서만 이동)
- 기존 타임라인 UI 규칙을 모두 유지합니다
- 드래그 중에는 다른 액션(삭제, 꾸미기)은 불가능합니다

## 문제 해결

**Q: 사진을 드래그해도 저장되지 않아요**
A:
1. Supabase 테이블이 생성되었는지 확인
2. RLS 정책이 올바르게 설정되었는지 확인
3. 브라우저 콘솔에서 API 에러 메시지 확인

**Q: 새로고침 후 위치가 초기화돼요**
A: GET 요청이 실패하고 있을 가능성. API 응답 확인 필요

**Q: 드래그 중 범위 검증이 안 돼요**
A: TimelineSection의 `position: relative` 설정 확인 필요
