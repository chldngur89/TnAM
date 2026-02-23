# 로컬에서 동작 확인하기 (Mac)

서버 배포 전에 Mac에서 앱이 정상 동작하는지 확인하는 방법입니다.

---

## 1. 사전 준비

- **Node.js 18+**: `node -v`
- **Docker Desktop** (로컬에 MariaDB 없을 때): [docker.com](https://www.docker.com/products/docker-desktop/)
- **Slack 앱**: [api.slack.com/apps](https://api.slack.com/apps) 에서 앱 생성 후 Bot Token, Signing Secret 복사
- **(선택) Ollama**: 자연어 처리 테스트 시 [ollama.ai](https://ollama.ai) 설치 후 `ollama run qwen2.5:7b`

---

## 2. DB 실행 (둘 중 하나)

### A) Docker로 MariaDB 띄우기 (권장)

```bash
cd backend
docker compose up -d
```

한 번만 실행 후, 아래 `.env` 의 `DATABASE_URL` 사용:

```env
DATABASE_URL=mysql://attendance:local@localhost:3306/attendance
```

### B) Mac에 이미 MySQL/MariaDB가 있는 경우

```bash
# 예: Homebrew MySQL
mysql -u root -e "CREATE DATABASE attendance; CREATE USER 'attendance'@'localhost' IDENTIFIED BY 'local'; GRANT ALL ON attendance.* TO 'attendance'@'localhost';"
```

`.env` 에 본인 설정에 맞게:

```env
DATABASE_URL=mysql://attendance:local@localhost:3306/attendance
```

---

## 3. 환경 변수 (.env)

`backend` 폴더에 `.env` 파일 생성:

```bash
cd backend
cp .env.example .env
```

`.env` 수정 (최소한 아래만 채우면 됨):

```env
PORT=3000
SLACK_SIGNING_SECRET=여기에_Slack_앱_Signing_Secret
SLACK_BOT_TOKEN=xoxb-여기에_Bot_User_OAuth_Token

# Docker MariaDB 사용 시
DATABASE_URL=mysql://attendance:local@localhost:3306/attendance

OLLAMA_BASE_URL=http://127.0.0.1:11435
OLLAMA_MODEL=qwen2.5:7b
```

Ollama를 쓰지 않으면 봇이 AI 대신 fallback 메시지를 보냅니다 (동작 확인에는 문제 없음).

---

## 4. 테이블 생성 & 앱 실행

```bash
cd backend
npm install
node src/attendance/migrate.js
npm run dev
```

콘솔에 `Slack Attendance AI listening on port 3000` 이 나오면 로컬 서버는 정상입니다.

---

## 5. Slack이 로컬로 요청 보내게 하기 (ngrok)

Slack은 인터넷에서 당신 PC로 요청을 보내야 하므로, 로컬 3000 포트를 공개 URL로 열어줘야 합니다.

### ngrok 설치 및 실행

1. [ngrok.com](https://ngrok.com) 가입 후 설치:
   ```bash
   brew install ngrok
   # 또는 https://ngrok.com/download 에서 다운로드
   ```
2. **다른 터미널**에서 (앱이 `npm run dev` 로 떠 있는 상태에서):
   ```bash
   ngrok http 3000
   ```
3. 터미널에 나오는 **HTTPS URL** 복사 (예: `https://abc123.ngrok-free.app`)

### Slack 앱 Request URL 설정

[api.slack.com/apps](https://api.slack.com/apps) → 해당 앱 선택 후:

| 메뉴 | Request URL |
|------|-------------|
| **Slash Commands** → /attendance | `https://abc123.ngrok-free.app/slack/events` |
| **Event Subscriptions** | `https://abc123.ngrok-free.app/slack/events` |
| **Interactivity & Shortcuts** | `https://abc123.ngrok-free.app/slack/events` |

`abc123.ngrok-free.app` 부분을 본인 ngrok URL로 바꾸세요.  
무료 ngrok은 재시작할 때마다 URL이 바뀌므로, 다시 실행하면 Slack URL도 새 주소로 갱신해야 합니다.

---

## 6. 동작 확인

1. Slack 워크스페이스에서 `/attendance` 입력 → Block Kit 메뉴(출근/퇴근/정정/주간 요약)가 보이면 성공.
2. **출근하기** 버튼 클릭 → "출근 완료" 메시지가 나오면 DB·Slack 연동 정상.
3. 봇을 멘션하고 "오늘 9시에 출근했어" 등 입력 → (Ollama가 떠 있으면) intent 추출 후 응답 확인.

---

## 7. 로컬 확인 후 서버 배포 시

- Slack 앱 Request URL을 **EC2 주소**로 다시 바꿈: `http://3.35.231.133:3000/slack/events`
- EC2에서 `DEPLOY_EC2.md` 대로 배포 진행

---

## 요약 체크리스트 (로컬)

| 단계 | 명령/확인 |
|------|-----------|
| 1 | `cd backend` |
| 2 | `docker compose up -d` (또는 로컬 MySQL에 DB 생성) |
| 3 | `cp .env.example .env` 후 Slack 토큰·`DATABASE_URL` 입력 |
| 4 | `npm install` → `node src/attendance/migrate.js` |
| 5 | `npm run dev` → "listening on port 3000" 확인 |
| 6 | 다른 터미널에서 `ngrok http 3000` → HTTPS URL 복사 |
| 7 | Slack 앱 Request URL을 `https://본인ngrokURL/slack/events` 로 설정 |
| 8 | Slack에서 `/attendance` 및 출근 버튼 테스트 |
