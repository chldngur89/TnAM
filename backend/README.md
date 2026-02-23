# Slack Attendance AI Assistant (Backend)

Slack 출퇴근 AI 도우미 백엔드. Slash command, 자연어 처리(Ollama), MariaDB, GPS 기반 자동 출퇴근(geofence) 지원.

## 로컬에서 동작 확인

서버 배포 전 **Mac에서 먼저 동작 확인**하려면 **[LOCAL_DEV.md](./LOCAL_DEV.md)** 를 보세요.

- Docker로 MariaDB 띄우기 → `.env` 설정 → `npm run db:migrate` → `npm run dev`
- Slack 연동 테스트는 **ngrok**으로 로컬 3000 포트를 공개 URL로 열고, Slack Request URL을 그 주소로 설정하면 됩니다.

## Architecture

- **Slack App**: AWS EC2 (Ubuntu)에서 실행
- **AI (Ollama)**: 개발자 Mac 로컬 실행 → EC2는 **reverse SSH tunnel**로 `http://127.0.0.1:11435` 접근
- **DB**: MariaDB/MySQL (attendance 저장, EC2 기본 MariaDB 사용)

## Reverse SSH Tunnel (필수)

Ollama는 Mac에서만 실행하고, EC2의 Bolt 서버가 로컬 Ollama를 쓰려면 **Mac에서** 다음 터널을 미리 띄워 두세요.

```bash
# Mac 터미널에서 실행 (Ollama 기본 포트 11435)
ssh -R 11435:127.0.0.1:11435 ubuntu@<EC2_PUBLIC_IP> -i <your-key.pem> -N
```

- EC2에서는 `http://127.0.0.1:11435` 로 접속하면 Mac의 Ollama로 프록시됨.
- 옵션: `autossh`로 터널 유지  
  `autossh -M 0 -R 11435:127.0.0.1:11435 ubuntu@<EC2_IP> -i <key.pem> -N -o ServerAliveInterval=30`

## Env

`backend/.env` (또는 배포 시 환경 변수):

```env
PORT=3000
SLACK_SIGNING_SECRET=<from Slack App credentials>
SLACK_BOT_TOKEN=xoxb-...
# Optional: Socket Mode 대신 HTTP면 SLACK_APP_TOKEN 없어도 됨

# Ollama (EC2에서는 127.0.0.1 로 터널 통해 접근)
OLLAMA_BASE_URL=http://127.0.0.1:11435
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_TIMEOUT_MS=5000
OLLAMA_RETRY_COUNT=1

# DB (MariaDB/MySQL)
DATABASE_URL=mysql://root:비밀번호@localhost:3306/attendance

# 출퇴근 기본값
ATTENDANCE_WORK_START=09:00
ATTENDANCE_WORK_END=18:00
ATTENDANCE_TIMEZONE=Asia/Seoul
ATTENDANCE_LATE_THRESHOLD_MINUTES=0
ATTENDANCE_AWAY_AUTO_CLOCKOUT_MINUTES=60

# Geofence (GPS 자동 출퇴근)
GEOFENCE_ENABLED=true
GEOFENCE_CENTER_LAT=37.5665
GEOFENCE_CENTER_LNG=126.9780
GEOFENCE_RADIUS_METERS=200
```

`.env` 로드가 필요하면 `npm i dotenv` 후 `app.js` 상단에 `import 'dotenv/config';` 추가.

## Run

```bash
cd backend
npm i
# EC2 MariaDB에서 DB 생성 (sudo mysql 후):
# CREATE DATABASE attendance; CREATE USER 'attendance'@'localhost' IDENTIFIED BY '비밀번호'; GRANT ALL ON attendance.* TO 'attendance'@'localhost'; FLUSH PRIVILEGES;
# .env 에 DATABASE_URL=mysql://attendance:비밀번호@localhost:3306/attendance 설정
node src/attendance/migrate.js
npm run dev
```

- Slash command: `/attendance` → Block Kit (출근하기, 퇴근하기, 시간 정정 요청, 주간 요약)
- 채널에서 봇 멘션 또는 DM으로 자연어 입력 → Ollama로 intent 추출 → 서버에서 출퇴근/요약 처리
- AI 불가 시 5초 타임아웃, 1회 재시도 후 fallback 메시지
- Security: Ollama는 `127.0.0.1`/`localhost`만 허용; Slack 요청은 Bolt가 signing secret으로 검증

## Core DB (2 tables)

이 버전은 핵심 운영에 필요한 2개 테이블만 사용합니다.

1. `users`  
   - Slack 사용자 식별, 근무시간 기본값, 타임존, 활성 상태
2. `attendance`  
   - 출근/퇴근 시각, 출퇴근 채널(source), 지각분(late_minutes), 근무분(worked_minutes), 기기/IP/좌표 메타데이터

필드 선정 근거는 `DB_DESIGN.md` 에 정리되어 있습니다.

## GPS 기반 자동 출퇴근 (선택)

- 건물 반경: `GEOFENCE_CENTER_*` + `GEOFENCE_RADIUS_METERS`
- `POST /api/location` 본문:
  `{ "slack_user_id": "U01234...", "lat": 37.5665, "lng": 126.978 }`
- 동작:
  1. 지오펜스 안으로 들어오고 미출근 상태면 자동 출근
  2. 지오펜스 밖에서 일정 시간(`ATTENDANCE_AWAY_AUTO_CLOCKOUT_MINUTES`) 지나면 자동 퇴근

## 주요 파일

| 파일 | 역할 |
|------|------|
| `src/app.js` | Bolt + Express, Slash/버튼/자연어/GPS API |
| `src/ollama.js` | Ollama 호출, 타임아웃/재시도, intent 파싱 |
| `src/slack/blocks.js` | Block Kit UI |
| `src/slack/signature.js` | Slack 요청 서명 검증 |
| `src/attendance/schema.sql` | MariaDB/MySQL 스키마 |
| `src/attendance/repository.js` | 출퇴근 CRUD |
| `src/attendance/rules.js` | 지각/근무시간 계산 (비즈니스 룰) |
| `src/attendance/geofence.js` | GPS 반경 기반 자동 출퇴근 |
