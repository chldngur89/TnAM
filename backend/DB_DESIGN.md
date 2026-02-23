# Attendance DB Design Notes

본 프로젝트는 운영 단순화를 위해 `users`, `attendance` 2개 테이블만 유지한다.

## 참고한 시중/오픈소스 구조

1. ERPNext Attendance
   - 상태값(`Present`, `Absent`, `Half Day`, `On Leave`) 기반 출결 분류
   - 참고: <https://docs.frappe.io/erpnext/v14/user/manual/en/human-resources/attendance>
2. ERPNext Employee Checkin
   - IN/OUT 로그, Device ID, 시간 기반 체크인 설계
   - 참고: <https://docs.frappe.io/erpnext/v14/user/manual/en/human-resources/employee_checkin>
3. Odoo HR Attendance model
   - `check_in`, `check_out`, `worked_hours`, 입력 모드/메타(브라우저, IP, GPS) 필드 사용
   - 참고: <https://raw.githubusercontent.com/odoo/odoo/18.0/addons/hr_attendance/models/hr_attendance.py>

## 최종 반영 필드

### users
- `slack_user_id`: Slack 고유 사용자 ID (PK)
- `employee_code`: 사번/사내 코드 (선택)
- `email`, `display_name`
- `timezone`: 사용자/조직 타임존
- `work_start_time`, `work_end_time`: 기본 근무시간
- `is_active`, `created_at`, `updated_at`

### attendance
- `slack_user_id`, `date`, `clock_in_at`, `clock_out_at`
- `source`, `clock_out_source`: 입력 채널 (slash/nl/gps/manual 등)
- `record_status`, `late_minutes`, `worked_minutes`
- `check_in_*`, `check_out_*`:
  - `ip`, `device_id`, `lat`, `lng`
- `note`, `created_at`, `updated_at`

## 설계 원칙

- 2개 테이블로도 Slack 출근/퇴근/주간요약이 가능한 최소 구조 유지
- 추후 승인/정정/캘린더를 붙일 때는 별도 테이블을 확장 모듈로 추가
