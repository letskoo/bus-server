# Trip Automation 검증 가이드

## 개요
DriverLocation 업데이트 시 자동으로 Trip ARRIVE 이벤트를 감지하고 알림을 발송하는 기능입니다.

## 사전 준비

### 1. 데이터베이스에 테스트 데이터 생성
Prisma Studio 또는 SQL로 다음을 생성:
- Organization 1개
- Route 1개 (organizationId 연결)
- Stop 2개 이상 (routeId 연결, orderNo=1,2,...)
- Student 1개 이상 (stopId=첫번째 stop)
- Trip 1개 (routeId 연결, status='RUNNING')

### 2. 서버 실행
```powershell
npm run start:dev
```

## 검증 시나리오

### Step 1: Trip 시작 확인
```powershell
# Active trip 조회
Invoke-RestMethod http://localhost:3000/trips/active?routeId=1&type=PICKUP
```

### Step 2: DriverLocation 업데이트 (정류장 근처)
```powershell
# 첫 번째 정류장 좌표 근처로 위치 업데이트
# 예: Stop(orderNo=1)의 좌표가 (36.35010, 127.38420)이라면
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/driver/location" `
  -ContentType "application/json" `
  -Body (@{
    routeId = 1
    latitude = 36.35010
    longitude = 127.38420
  } | ConvertTo-Json)
```

### Step 3: Prisma Studio에서 확인

#### StopEvent 테이블
- tripId, stopId, type='ARRIVE' 레코드 1건 생성 확인
- createdAt 타임스탬프 확인

#### NotificationLog 테이블
- 해당 stopId에 연결된 학생 수만큼 레코드 생성 확인
- type='ARRIVED'
- message="[도착] 정류장 {이름}에 도착했습니다."

#### Trip 테이블
- currentStopId가 해당 stopId로 업데이트 확인

### Step 4: 서버 로그 확인
다음 로그가 출력되어야 함:
```
[TripAutomationService] ETA_CHECK: tripId=1 nextStopId=1 distanceMeters=15.2
[TripAutomationService] ARRIVE_OK: tripId=1 stopId=1
[TripAutomationService] Notifications sent: stopId=1 count=2
```

## 주의사항

### 디바운스 (120초)
- 동일 tripId + stopId로 ARRIVE가 120초 이내에 이미 생성되었다면 스킵됩니다.
- 로그: `ARRIVE_SKIP: debounce`

### 반경 체크 (30m)
- 정류장 좌표로부터 30m 이내에 있어야 ARRIVE가 생성됩니다.
- 로그: `ARRIVE_SKIP: too_far distance=50.3m`

### 다음 정류장 순서
- orderNo가 가장 작은 정류장 중, 아직 ARRIVE가 없는 정류장이 자동 선택됩니다.

## 트러블슈팅

### ARRIVE가 생성되지 않는 경우
1. Trip이 RUNNING 상태인지 확인
2. Stop이 해당 routeId에 존재하는지 확인
3. 좌표가 정류장 반경 30m 이내인지 확인
4. 이미 ARRIVE가 생성되었는지 확인 (StopEvent 테이블)
5. 서버 로그에서 `ARRIVE_SKIP` 원인 확인
