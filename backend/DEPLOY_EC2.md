# EC2 배포 가이드 (Slack 출퇴근 봇)

- **EC2 접속**: `ssh -i ~/Desktop/cloudv/ssa-dev-slack.pem ubuntu@3.35.231.133`
- **MariaDB**: `sudo mysql` 로 접속

---

## ⚠️ 1. 디스크 공간 먼저 확보 (99.8% 사용 중이면 배포 불가)

```bash
# 큰 디렉터리 확인
sudo du -sh /var/* /home/* 2>/dev/null | sort -hr | head -20

# 불필요한 파일 정리 예시 (필요한 것만 실행)
sudo apt clean
sudo journalctl --vacuum-time=3d
docker system prune -af   # Docker 쓰는 경우만
```

루트(/) 사용량을 **최소 80% 이하**로 만든 뒤 다음 단계 진행하세요.

---

## 2. MariaDB: DB·유저 생성

EC2에서:

```bash
sudo mysql
```

MariaDB 프롬프트에서 아래 한 번에 붙여넣고 실행 (비밀번호는 원하는 값으로 변경):

```sql
CREATE DATABASE IF NOT EXISTS attendance
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'attendance'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON attendance.* TO 'attendance'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

접속 테스트:

```bash
mysql -u attendance -p attendance
# 비밀번호 입력 후 접속되면 성공. EXIT; 로 나가기
```

---

## 3. Node.js 설치 (없는 경우만)

```bash
node -v
```

버전이 안 나오면:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

---

## 4. 프로젝트 올리기

**방법 A – 로컬에서 SCP로 backend 폴더 복사**

로컬 Mac 터미널에서 (TnAM 프로젝트 있는 경로에서):

```bash
cd /Users/wh.choi/Desktop/slack/TnAM
scp -i ~/Desktop/cloudv/ssa-dev-slack.pem -r backend ubuntu@3.35.231.133:~/Choi/
```

**방법 B – EC2에서 Git clone (저장소가 있다면)**

```bash
cd ~/Choi
git clone <저장소URL> .
# backend 폴더만 쓰는 경우: 프로젝트 루트 클론 후 cd backend
```

---

## 5. EC2에서 백엔드 설정 및 실행

EC2 SSH 접속 후:

```bash
cd ~/Choi/backend
```

**환경 변수 파일 만들기**

```bash
nano .env
```

아래 내용 넣고 저장 (비밀번호·토큰은 본인 값으로):

```env
PORT=3000
SLACK_SIGNING_SECRET=여기에_Slack_앱_시크릿
SLACK_BOT_TOKEN=xoxb-여기에_봇_토큰

OLLAMA_BASE_URL=http://127.0.0.1:11435
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_TIMEOUT_MS=5000
OLLAMA_RETRY_COUNT=1

DATABASE_URL=mysql://attendance:YOUR_PASSWORD_HERE@localhost:3306/attendance

ATTENDANCE_WORK_START=09:00
ATTENDANCE_WORK_END=18:00
ATTENDANCE_LATE_THRESHOLD_MINUTES=0
ATTENDANCE_AWAY_AUTO_CLOCKOUT_MINUTES=60

GEOFENCE_ENABLED=false
GEOFENCE_CENTER_LAT=37.5665
GEOFENCE_CENTER_LNG=126.9780
GEOFENCE_RADIUS_METERS=200
```

`YOUR_PASSWORD_HERE` 는 2단계에서 정한 MariaDB 비밀번호로 바꾸세요.

**의존성 설치 & 테이블 생성**

```bash
npm install
node src/attendance/migrate.js
```

`Migration completed.` 가 나오면 성공.

**실행 (테스트)**

```bash
npm run dev
```

같은 터미널에서 `Slack Attendance AI listening on port 3000` 이 보이면 정상입니다.  
종료는 `Ctrl+C`.

---

## 6. Slack 앱 설정

1. [api.slack.com/apps](https://api.slack.com/apps) → 해당 앱 선택  
2. **Slash Commands** → Create New Command  
   - Command: `/attendance`  
   - Request URL: `http://3.35.231.133:3000/slack/events`  
   - (HTTPS 쓰려면 나중에 Nginx + Let’s Encrypt 필요)  
3. **Event Subscriptions** → Enable Events  
   - Request URL: `http://3.35.231.133:3000/slack/events`  
4. **Interactivity & Shortcuts** → Interactivity On  
   - Request URL: `http://3.35.231.133:3000/slack/events`  
5. **OAuth & Permissions** 에서 봇을 워크스페이스에 설치 (Reinstall to Workspace)

---

## 7. Ollama (자연어 AI) 쓰는 경우 – Mac에서 터널

Ollama는 Mac에서 실행하고, EC2가 그쪽으로 접속하게 할 때:

**Mac 터미널**에서 (Ollama 실행 중인 상태에서):

```bash
ssh -i ~/Desktop/cloudv/ssa-dev-slack.pem -R 11435:127.0.0.1:11435 ubuntu@3.35.231.133 -N
```

이 터널을 켜 둔 상태에서 EC2의 앱이 `http://127.0.0.1:11435` 로 Ollama를 사용합니다.

---

## 8. 백그라운드로 계속 실행 (pm2)

SSH 끊어도 앱이 계속 돌게 하려면:

```bash
sudo npm install -g pm2
cd ~/Choi/backend
pm2 start src/app.js --name attendance-bot
pm2 save
pm2 startup
```

이후:

- 로그: `pm2 logs attendance-bot`
- 재시작: `pm2 restart attendance-bot`
- 중지: `pm2 stop attendance-bot`

---

## 체크리스트

| 순서 | 작업 | 확인 |
|------|------|------|
| 1 | 디스크 사용량 80% 이하로 정리 | `df -h` |
| 2 | MariaDB `attendance` DB·유저 생성 | `mysql -u attendance -p attendance` |
| 3 | Node.js 설치 | `node -v` |
| 4 | backend 폴더 EC2에 복사 (scp 또는 git) | `ls ~/Choi/backend` |
| 5 | `.env` 작성 (DB 비밀번호, Slack 토큰) | `cat .env` (비밀번호만 가려서 확인) |
| 6 | `npm install` → `node src/attendance/migrate.js` | `Migration completed.` |
| 7 | `npm run dev` 로 동작 확인 | 포트 3000 리스닝 |
| 8 | Slack 앱 Request URL `http://3.35.231.133:3000/slack/events` | Slash command 테스트 |
| 9 | (선택) Ollama 쓰면 Mac에서 reverse SSH 터널 | 터널 유지 |
| 10 | (선택) pm2 로 상시 실행 | `pm2 list` |

문제 생기면:  
- EC2 방화벽에서 **3000 포트** 인바운드 허용  
- 보안 그룹: Inbound rule에 TCP 3000 (0.0.0.0/0 또는 본인 IP) 추가
