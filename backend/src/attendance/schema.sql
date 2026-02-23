-- Slack Attendance (2-table core schema)
-- Table 1) users
-- Table 2) attendance

CREATE TABLE IF NOT EXISTS users (
  slack_user_id VARCHAR(191) PRIMARY KEY,
  employee_code VARCHAR(64) NULL UNIQUE,
  email VARCHAR(191) NULL,
  display_name VARCHAR(191) NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Seoul',
  work_start_time TIME NOT NULL DEFAULT '09:00:00',
  work_end_time TIME NOT NULL DEFAULT '18:00:00',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  slack_user_id VARCHAR(191) NOT NULL,
  date DATE NOT NULL,
  clock_in_at DATETIME(6) NOT NULL,
  clock_out_at DATETIME(6) NULL,

  -- Core source channel
  source VARCHAR(32) NOT NULL DEFAULT 'manual',
  clock_out_source VARCHAR(32) NULL,

  -- Common attendance states from market products
  -- present | late | manual_adjusted
  record_status VARCHAR(32) NOT NULL DEFAULT 'present',
  late_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  worked_minutes INT UNSIGNED NULL,

  -- Optional metadata (device/network/location)
  check_in_ip VARCHAR(64) NULL,
  check_out_ip VARCHAR(64) NULL,
  check_in_device_id VARCHAR(128) NULL,
  check_out_device_id VARCHAR(128) NULL,
  check_in_lat DOUBLE NULL,
  check_in_lng DOUBLE NULL,
  check_out_lat DOUBLE NULL,
  check_out_lng DOUBLE NULL,

  note TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  UNIQUE KEY uq_attendance_user_date_in (slack_user_id, date, clock_in_at),
  KEY idx_attendance_user_date (slack_user_id, date),
  KEY idx_attendance_user_open (slack_user_id, date, clock_out_at),
  KEY idx_attendance_clock_in (clock_in_at),
  CONSTRAINT fk_attendance_user
    FOREIGN KEY (slack_user_id) REFERENCES users(slack_user_id) ON DELETE CASCADE
);
