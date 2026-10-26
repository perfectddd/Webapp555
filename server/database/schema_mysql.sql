-- ====================================================================
-- SASSADEE NAN - MySQL 8.4 Database Optimization & Schema Design
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_thai_520_w2
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `sassadee_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_thai_520_w2;

USE `sassadee_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 1. ตารางหลัก: ทหารกองเกินและการตรวจเลือก (tb_recuit)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `tb_recuit`;
CREATE TABLE `tb_recuit` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recruit_code` VARCHAR(25) NOT NULL COMMENT 'รหัสประจำตัวทหาร เช่น 55030147001',
  `id_card` CHAR(13) NOT NULL COMMENT 'เลขประจำตัวประชาชน 13 หลัก',
  
  -- ข้อมูลส่วนบุคคล
  `title` VARCHAR(20) DEFAULT 'นาย',
  `first_name` VARCHAR(100) NOT NULL COMMENT 'ชื่อตัว',
  `last_name` VARCHAR(100) NOT NULL COMMENT 'ชื่อสกุล',
  `birth_date` TINYINT UNSIGNED DEFAULT 1,
  `birth_month` VARCHAR(25) DEFAULT 'มกราคม',
  `birth_year` INT UNSIGNED NOT NULL COMMENT 'พ.ศ. เกิด',
  `religion` VARCHAR(50) DEFAULT 'พุทธ',
  `occupation` VARCHAR(100) DEFAULT 'รับจ้าง',
  `education` VARCHAR(100) DEFAULT 'มัธยมศึกษาปีที่ ๖',
  `mark` VARCHAR(255) DEFAULT 'ปกติ' COMMENT 'ตำหนิสำคัญ',
  `phone` VARCHAR(30) DEFAULT NULL,

  -- ข้อมูลภูมิลำเนาทหาร (จังหวัดน่าน)
  `province_name` VARCHAR(100) DEFAULT 'น่าน',
  `amphur_code` INT UNSIGNED NOT NULL DEFAULT 5501 COMMENT 'รหัสอำเภอ เช่น 5501 เมืองน่าน',
  `amphur_name` VARCHAR(100) NOT NULL DEFAULT 'เมืองน่าน',
  `district_code` INT UNSIGNED DEFAULT NULL COMMENT 'รหัสตำบล',
  `sub_district` VARCHAR(100) NOT NULL COMMENT 'ตำบล',
  `moo` INT UNSIGNED DEFAULT 1 COMMENT 'หมู่ที่',
  `house_number` VARCHAR(50) DEFAULT '',
  `road` VARCHAR(150) DEFAULT NULL,

  -- ข้อมูลครอบครัว
  `father_name` VARCHAR(100) DEFAULT NULL,
  `father_last_name` VARCHAR(100) DEFAULT NULL,
  `father_nationality` VARCHAR(50) DEFAULT 'ไทย',
  `mother_name` VARCHAR(100) DEFAULT NULL,
  `mother_last_name` VARCHAR(100) DEFAULT NULL,
  `mother_nationality` VARCHAR(50) DEFAULT 'ไทย',

  -- ข้อมูลทางทะเบียนทหาร (สด.9 & สด.1)
  `sd1_number` INT UNSIGNED DEFAULT NULL COMMENT 'เลขที่ในสมุดบัญชี สด.1',
  `sd9_book_number` VARCHAR(20) DEFAULT '1' COMMENT 'ใบสำคัญ สด.9 เล่มที่',
  `sd9_doc_number` VARCHAR(20) DEFAULT NULL COMMENT 'ใบสำคัญ สด.9 เลขที่',
  `reg_date` TINYINT UNSIGNED DEFAULT 1,
  `reg_month` VARCHAR(25) DEFAULT 'มกราคม',
  `reg_year` INT UNSIGNED NOT NULL COMMENT 'พ.ศ. ที่มาลงบัญชีทหารกองเกิน',
  `status` VARCHAR(50) NOT NULL DEFAULT 'ลงบัญชีแล้ว (สด.9)',

  -- ข้อมูลการตรวจเลือก (สด.43)
  `screening_category` TINYINT UNSIGNED DEFAULT NULL COMMENT 'จำพวก 1, 2, 3, 4',
  `height` DECIMAL(5,2) DEFAULT NULL COMMENT 'ส่วนสูง (cm)',
  `chest_normal` DECIMAL(5,2) DEFAULT NULL COMMENT 'รอบอกปกติ (cm)',
  `chest_expanded` DECIMAL(5,2) DEFAULT NULL COMMENT 'รอบอกหายใจเข้า (cm)',
  `weight` DECIMAL(5,2) DEFAULT NULL COMMENT 'น้ำหนัก (kg)',
  `draft_status` VARCHAR(50) DEFAULT NULL COMMENT 'สมัครใจ / สลากดำ / สลากแดง / ผ่อนผัน / พ้นตรวจเลือก',
  `military_soldier_type` VARCHAR(50) DEFAULT NULL COMMENT 'ทบ.1, ทบ.2, ทบ.ออนไลน์, ทร., ทอ.',

  -- ป้องกัน Write Conflict ใน Access ODBC และติดตามการแก้ไข
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_idcard` (`id_card`),
  UNIQUE KEY `ux_recruit_code` (`recruit_code`),
  
  -- Composite Index สำหรับค้นหาตามปีและพื้นที่
  KEY `ix_year_area` (`birth_year`, `amphur_code`, `sub_district`),
  KEY `ix_reg_year_amphur` (`reg_year`, `amphur_code`),
  KEY `ix_name` (`first_name`, `last_name`),
  KEY `ix_amphur_status` (`amphur_code`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;

-- --------------------------------------------------------------------
-- 2. ตารางรันลำดับเลขที่ สด.1 ป้องกัน Race Condition (tb_sd1_sequence)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `tb_sd1_sequence`;
CREATE TABLE `tb_sd1_sequence` (
  `amphur_code` INT UNSIGNED NOT NULL,
  `year_be` INT UNSIGNED NOT NULL,
  `current_number` INT UNSIGNED NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`amphur_code`, `year_be`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;

-- Stored Procedure รันเลข สด.1 ด้วย Row-level Locking (SELECT ... FOR UPDATE)
DELIMITER //
CREATE PROCEDURE `sp_get_next_sd1`(
  IN p_amphur_code INT UNSIGNED,
  IN p_year_be INT UNSIGNED,
  OUT p_next_num INT UNSIGNED
)
BEGIN
  DECLARE v_cur INT UNSIGNED DEFAULT 0;

  START TRANSACTION;
  
  SELECT `current_number` INTO v_cur
  FROM `tb_sd1_sequence`
  WHERE `amphur_code` = p_amphur_code AND `year_be` = p_year_be
  FOR UPDATE;

  IF v_cur IS NULL OR v_cur = 0 THEN
    INSERT INTO `tb_sd1_sequence` (`amphur_code`, `year_be`, `current_number`)
    VALUES (p_amphur_code, p_year_be, 1)
    ON DUPLICATE KEY UPDATE `current_number` = `current_number` + 1;
    
    SET p_next_num = 1;
  ELSE
    SET p_next_num = v_cur + 1;
    UPDATE `tb_sd1_sequence`
    SET `current_number` = p_next_num
    WHERE `amphur_code` = p_amphur_code AND `year_be` = p_year_be;
  END IF;

  COMMIT;
END //
DELIMITER ;

-- --------------------------------------------------------------------
-- 3. ตารางสรุปภาพรวมสำหรับ Dashboard (summary_by_amphur)
-- ทดแทน Materialized View โดยใช้ Stored Procedure และ Scheduled Event
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `summary_by_amphur`;
CREATE TABLE `summary_by_amphur` (
  `amphur_code` INT UNSIGNED NOT NULL,
  `amphur_name` VARCHAR(100) NOT NULL,
  `total_recruits` INT UNSIGNED NOT NULL DEFAULT 0,
  `registered_sd9` INT UNSIGNED NOT NULL DEFAULT 0,
  `target_birth_year_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `deferred_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_refreshed` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`amphur_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;

-- Stored Procedure สรุปยอด
DELIMITER //
CREATE PROCEDURE `sp_refresh_dashboard_summary`()
BEGIN
  INSERT INTO `summary_by_amphur` (`amphur_code`, `amphur_name`, `total_recruits`, `registered_sd9`, `target_birth_year_count`, `deferred_count`, `last_refreshed`)
  SELECT
    a.`amphur_code`,
    a.`amphur_th` AS `amphur_name`,
    COUNT(r.`id`) AS `total_recruits`,
    SUM(CASE WHEN r.`status` LIKE '%สด.9%' THEN 1 ELSE 0 END) AS `registered_sd9`,
    SUM(CASE WHEN r.`birth_year` = (YEAR(CURDATE()) + 543 - 17) THEN 1 ELSE 0 END) AS `target_birth_year_count`,
    SUM(CASE WHEN r.`draft_status` = 'ผ่อนผัน' THEN 1 ELSE 0 END) AS `deferred_count`,
    NOW() AS `last_refreshed`
  FROM `tb_amphur` a
  LEFT JOIN `tb_recuit` r ON a.`amphur_code` = r.`amphur_code`
  GROUP BY a.`amphur_code`, a.`amphur_th`
  ON DUPLICATE KEY UPDATE
    `total_recruits` = VALUES(`total_recruits`),
    `registered_sd9` = VALUES(`registered_sd9`),
    `target_birth_year_count` = VALUES(`target_birth_year_count`),
    `deferred_count` = VALUES(`deferred_count`),
    `last_refreshed` = NOW();
END //
DELIMITER ;

-- Event Scheduler รีเฟรชทุก 15 นาที
SET GLOBAL event_scheduler = ON;
DROP EVENT IF EXISTS `ev_refresh_dashboard_summary`;
CREATE EVENT `ev_refresh_dashboard_summary`
ON SCHEDULE EVERY 15 MINUTE
DO CALL `sp_refresh_dashboard_summary`();

-- --------------------------------------------------------------------
-- 4. ตารางบันทึกประวัติการใช้งาน (tb_audit_log & Archive)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `tb_audit_log`;
CREATE TABLE `tb_audit_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `username` VARCHAR(50) NOT NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, SEARCH, PRINT_SD9',
  `table_name` VARCHAR(50) NOT NULL DEFAULT 'tb_recuit',
  `record_id` VARCHAR(50) DEFAULT NULL,
  `old_values` JSON DEFAULT NULL,
  `new_values` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_audit_user_action` (`username`, `action`),
  KEY `ix_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;

DROP TABLE IF EXISTS `tb_audit_log_archive`;
CREATE TABLE `tb_audit_log_archive` LIKE `tb_audit_log`;

-- --------------------------------------------------------------------
-- 5. ตาราง Master Data จังหวัดน่าน และข้อมูลอ้างอิง
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `tb_amphur`;
CREATE TABLE `tb_amphur` (
  `amphur_id` INT UNSIGNED NOT NULL,
  `amphur_code` INT UNSIGNED NOT NULL,
  `amphur_th` VARCHAR(100) NOT NULL,
  `amphur_en` VARCHAR(100) DEFAULT NULL,
  `province_id` INT UNSIGNED NOT NULL DEFAULT 44,
  `shot` VARCHAR(10) DEFAULT 'อ.',
  PRIMARY KEY (`amphur_code`),
  KEY `ix_amphur_id` (`amphur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;

-- ใส่ข้อมูล 15 อำเภอ จังหวัดน่าน
INSERT INTO `tb_amphur` (`amphur_id`, `amphur_code`, `amphur_th`, `amphur_en`) VALUES
(583, 5501, 'เมืองน่าน', 'Mueang Nan'),
(584, 5502, 'แม่จริม', 'Mae Charim'),
(585, 5503, 'บ้านหลวง', 'Ban Luang'),
(586, 5504, 'นาน้อย', 'Na Noi'),
(587, 5505, 'ปัว', 'Pua'),
(588, 5506, 'ท่าวังผา', 'Tha Wang Pha'),
(589, 5507, 'เวียงสา', 'Wiang Sa'),
(590, 5508, 'ทุ่งช้าง', 'Thung Chang'),
(591, 5509, 'เชียงกลาง', 'Chiang Klang'),
(592, 5510, 'นาหมื่น', 'Na Muen'),
(593, 5511, 'สันติสุข', 'Santi Suk'),
(594, 5512, 'บ่อเกลือ', 'Bo Kluea'),
(595, 5513, 'สองแคว', 'Song Khwae'),
(596, 5514, 'ภูเพียง', 'Phu Phiang'),
(597, 5515, 'เฉลิมพระเกียรติ', 'Chaloem Phra Kiat')
ON DUPLICATE KEY UPDATE `amphur_th` = VALUES(`amphur_th`);

-- ตารางถนนและซอยสำหรับ Autocomplete
DROP TABLE IF EXISTS `tb_thanon`;
CREATE TABLE `tb_thanon` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thanon_name` VARCHAR(150) NOT NULL,
  `amphur_code` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_thanon_name` (`thanon_name`),
  KEY `ix_thanon_amphur` (`amphur_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;

DROP TABLE IF EXISTS `tb_sois`;
CREATE TABLE `tb_sois` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sois_name` VARCHAR(150) NOT NULL,
  `amphur_code` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_sois_name` (`sois_name`),
  KEY `ix_sois_amphur` (`amphur_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_thai_520_w2;

SET FOREIGN_KEY_CHECKS = 1;
