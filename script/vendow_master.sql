-- ===================================
-- VENDOR MASTER DATABASE SCHEMA (MyISAM)
-- รองรับภาษาไทย (UTF8MB4)
-- ===================================

-- Create database
CREATE DATABASE IF NOT EXISTS vendor_master 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE vendor_master;

-- ===================================
-- 1. ตารางผู้ขาย (vendors) - ตารางหลัก
-- ===================================
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'รหัสผู้ขาย',
    vendor_name VARCHAR(255) NOT NULL COMMENT 'ชื่อผู้ขาย',
    company_name VARCHAR(255) NOT NULL COMMENT 'ชื่อบริษัท',
    tax_id VARCHAR(13) UNIQUE COMMENT 'เลขประจำตัวผู้เสียภาษี',
    business_type ENUM('individual', 'partnership', 'limited', 'public_limited', 'government', 'other') DEFAULT 'individual' COMMENT 'ประเภทธุรกิจ',
    
    -- ข้อมูลที่อยู่
    address_line1 VARCHAR(255) COMMENT 'ที่อยู่บรรทัดที่ 1',
    address_line2 VARCHAR(255) COMMENT 'ที่อยู่บรรทัดที่ 2',
    district VARCHAR(100) COMMENT 'ตำบล/แขวง',
    amphoe VARCHAR(100) COMMENT 'อำเภอ/เขต',
    province VARCHAR(100) COMMENT 'จังหวัด',
    postal_code VARCHAR(10) COMMENT 'รหัสไปรษณีย์',
    country VARCHAR(50) DEFAULT 'Thailand' COMMENT 'ประเทศ',
    
    -- ข้อมูลการติดต่อ
    phone VARCHAR(20) COMMENT 'เบอร์โทร',
    fax VARCHAR(20) COMMENT 'เบอร์แฟกซ์',
    email VARCHAR(100) COMMENT 'อีเมล',
    website VARCHAR(255) COMMENT 'เว็บไซต์',
    
    -- เงื่อนไขทางการค้า
    payment_terms INT DEFAULT 30 COMMENT 'เงื่อนไขการชำระเงิน (วัน)',
    credit_limit DECIMAL(15,2) DEFAULT 0.00 COMMENT 'วงเงินเครดิต',
    discount_percent DECIMAL(5,2) DEFAULT 0.00 COMMENT 'ส่วนลดพิเศษ (%)',
    
    -- สถานะและการจัดการ
    status ENUM('active', 'inactive', 'suspended', 'blacklist') DEFAULT 'active' COMMENT 'สถานะ',
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'สถานะการอนุมัติ',
    
    -- วันที่สำคัญ
    registration_date DATE COMMENT 'วันที่ลงทะเบียน',
    contract_start_date DATE COMMENT 'วันที่เริ่มสัญญา',
    contract_end_date DATE COMMENT 'วันที่สิ้นสุดสัญญา',
    
    -- ข้อมูลการสร้างและแก้ไข
    created_by INT COMMENT 'ผู้สร้างข้อมูล',
    updated_by INT COMMENT 'ผู้แก้ไขข้อมูลล่าสุด',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- หมายเหตุ
    remarks TEXT COMMENT 'หมายเหตุ',
    
    INDEX idx_vendor_code (vendor_code),
    INDEX idx_vendor_name (vendor_name(100)),
    INDEX idx_tax_id (tax_id),
    INDEX idx_status (status),
    INDEX idx_province (province),
    INDEX idx_created_by (created_by),
    INDEX idx_updated_by (updated_by)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลหลักของผู้ขาย';

-- ===================================
-- 2. ตารางหมวดหมู่ผู้ขาย (vendor_categories)
-- ===================================
CREATE TABLE vendor_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(10) NOT NULL UNIQUE COMMENT 'รหัสหมวดหมู่',
    category_name VARCHAR(100) NOT NULL COMMENT 'ชื่อหมวดหมู่',
    description TEXT COMMENT 'คำอธิบาย',
    parent_id INT COMMENT 'หมวดหมู่แม่',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category_code (category_code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางหมวดหมู่ผู้ขาย';

-- ===================================
-- 3. ตารางความสัมพันธ์ vendor และ category (vendor_category_mapping)
-- ===================================
CREATE TABLE vendor_category_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    category_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'หมวดหมู่หลัก',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_vendor_category (vendor_id, category_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_category_id (category_id),
    INDEX idx_is_primary (is_primary)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางความสัมพันธ์ vendor และหมวดหมู่';

-- ===================================
-- 4. ตารางข้อมูลผู้ติดต่อ (vendor_contacts)
-- ===================================
CREATE TABLE vendor_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    contact_type ENUM('primary', 'billing', 'technical', 'sales', 'other') DEFAULT 'primary' COMMENT 'ประเภทผู้ติดต่อ',
    title VARCHAR(20) COMMENT 'คำนำหน้าชื่อ',
    first_name VARCHAR(100) NOT NULL COMMENT 'ชื่อ',
    last_name VARCHAR(100) NOT NULL COMMENT 'นามสกุล',
    position VARCHAR(100) COMMENT 'ตำแหน่ง',
    department VARCHAR(100) COMMENT 'แผนก',
    phone VARCHAR(20) COMMENT 'เบอร์โทร',
    mobile VARCHAR(20) COMMENT 'เบอร์มือถือ',
    email VARCHAR(100) COMMENT 'อีเมล',
    line_id VARCHAR(50) COMMENT 'Line ID',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_contact_type (contact_type),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลผู้ติดต่อ';

-- ===================================
-- 5. ตารางข้อมูลบัญชีธนาคาร (vendor_bank_accounts)
-- ===================================
CREATE TABLE vendor_bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    bank_name VARCHAR(100) NOT NULL COMMENT 'ชื่อธนาคาร',
    bank_code VARCHAR(10) COMMENT 'รหัสธนาคาร',
    branch_name VARCHAR(100) COMMENT 'สาขา',
    account_number VARCHAR(20) NOT NULL COMMENT 'เลขที่บัญชี',
    account_name VARCHAR(255) NOT NULL COMMENT 'ชื่อบัญชี',
    account_type ENUM('savings', 'current', 'fixed') DEFAULT 'savings' COMMENT 'ประเภทบัญชี',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'บัญชีหลัก',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_account_number (account_number),
    INDEX idx_bank_name (bank_name),
    INDEX idx_is_primary (is_primary),
    INDEX idx_is_active (is_active)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลบัญชีธนาคาร';

-- ===================================
-- 6. ตารางเอกสารประกอบ (vendor_documents)
-- ===================================
CREATE TABLE vendor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    document_type ENUM('license', 'certificate', 'tax_document', 'bank_document', 'contract', 'other') NOT NULL COMMENT 'ประเภทเอกสาร',
    document_name VARCHAR(255) NOT NULL COMMENT 'ชื่อเอกสาร',
    file_name VARCHAR(255) NOT NULL COMMENT 'ชื่อไฟล์',
    file_path VARCHAR(500) NOT NULL COMMENT 'path ของไฟล์',
    file_size INT COMMENT 'ขนาดไฟล์ (bytes)',
    mime_type VARCHAR(100) COMMENT 'ประเภทไฟล์',
    issue_date DATE COMMENT 'วันที่ออกเอกสาร',
    expiry_date DATE COMMENT 'วันที่หมดอายุ',
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'ตรวจสอบแล้ว',
    verified_by INT COMMENT 'ผู้ตรวจสอบ',
    verified_at TIMESTAMP NULL COMMENT 'วันที่ตรวจสอบ',
    uploaded_by INT COMMENT 'ผู้อัพโหลด',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_document_type (document_type),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_is_verified (is_verified),
    INDEX idx_verified_by (verified_by),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเอกสารประกอบ';

-- ===================================
-- 7. ตารางการประเมินผู้ขาย (vendor_evaluations)
-- ===================================
CREATE TABLE vendor_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    evaluation_date DATE NOT NULL COMMENT 'วันที่ประเมิน',
    quality_score DECIMAL(3,2) COMMENT 'คะแนนคุณภาพ (1-5)',
    delivery_score DECIMAL(3,2) COMMENT 'คะแนนการส่งมอบ (1-5)',
    service_score DECIMAL(3,2) COMMENT 'คะแนนการบริการ (1-5)',
    price_score DECIMAL(3,2) COMMENT 'คะแนนราคา (1-5)',
    overall_score DECIMAL(3,2) COMMENT 'คะแนนรวม (1-5)',
    grade ENUM('A', 'B', 'C', 'D', 'F') COMMENT 'เกรดการประเมิน',
    comments TEXT COMMENT 'ความเห็นเพิ่มเติม',
    evaluated_by INT COMMENT 'ผู้ประเมิน',
    next_evaluation_date DATE COMMENT 'วันที่ประเมินครั้งถัดไป',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_evaluation_date (evaluation_date),
    INDEX idx_grade (grade),
    INDEX idx_overall_score (overall_score),
    INDEX idx_evaluated_by (evaluated_by)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางการประเมินผู้ขาย';

-- ===================================
-- 8. ตารางบันทึกการเปลี่ยนแปลงข้อมูล (vendor_audit_logs)
-- ===================================
CREATE TABLE vendor_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    action ENUM('create', 'update', 'delete', 'approve', 'reject', 'suspend', 'activate') NOT NULL COMMENT 'การกระทำ',
    table_name VARCHAR(50) NOT NULL COMMENT 'ชื่อตาราง',
    old_values JSON COMMENT 'ค่าเดิม',
    new_values JSON COMMENT 'ค่าใหม่',
    changed_fields TEXT COMMENT 'ฟิลด์ที่เปลี่ยนแปลง',
    reason TEXT COMMENT 'เหตุผลในการเปลี่ยนแปลง',
    performed_by INT NOT NULL COMMENT 'ผู้ดำเนินการ',
    ip_address VARCHAR(45) COMMENT 'IP Address',
    user_agent TEXT COMMENT 'User Agent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_performed_by (performed_by),
    INDEX idx_created_at (created_at)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางบันทึกการเปลี่ยนแปลงข้อมูล';

-- ===================================
-- INSERT ข้อมูลตัวอย่าง (SAMPLE DATA)
-- ===================================

-- เพิ่มข้อมูลหมวดหมู่ตัวอย่าง
INSERT INTO vendor_categories (category_code, category_name, description) VALUES
('RAW', 'วัตถุดิบ', 'ผู้จำหน่ายวัตถุดิบสำหรับการผลิต'),
('PACK', 'บรรจุภัณฑ์', 'ผู้จำหน่ายวัสดุบรรจุภัณฑ์'),
('EQUIP', 'เครื่องจักร', 'ผู้จำหน่ายเครื่องจักรและอุปกรณ์'),
('SERVICE', 'บริการ', 'ผู้ให้บริการต่างๆ'),
('IT', 'เทคโนโลยี', 'ผู้จำหน่ายด้านเทคโนโลยีสารสนเทศ'),
('OFFICE', 'เครื่องเขียน', 'ผู้จำหน่ายเครื่องเขียนและอุปกรณ์สำนักงาน'),
('MAINT', 'บำรุงรักษา', 'ผู้ให้บริการบำรุงรักษาและซ่อมแซม'),
('TRANS', 'ขนส่ง', 'ผู้ให้บริการขนส่งและโลจิสติกส์');

-- เพิ่มข้อมูล vendor ตัวอย่าง
INSERT INTO vendors (
    vendor_code, vendor_name, company_name, tax_id, business_type,
    address_line1, district, amphoe, province, postal_code,
    phone, email, payment_terms, credit_limit, status, registration_date, created_by
) VALUES
('V001', 'บริษัท ABC จำกัด', 'บริษัท ABC จำกัด', '0123456789012', 'limited',
'123 ถนนสุขุมวิท', 'คลองเตย', 'คลองเตย', 'กรุงเทพมหานคร', '10110',
'02-123-4567', 'contact@abc.co.th', 30, 100000.00, 'active', '2024-01-15', 1),

('V002', 'ห้างหุ้นส่วน XYZ', 'ห้างหุ้นส่วนจำกัด XYZ', '0987654321098', 'partnership',
'456 ถนนพหลโยธิน', 'จตุจักร', 'จตุจักร', 'กรุงเทพมหานคร', '10900',
'02-987-6543', 'info@xyz.co.th', 45, 200000.00, 'active', '2024-02-20', 1),

('V003', 'บริษัท เทคโนโลยี จำกัด', 'บริษัท เทคโนโลยี จำกัด', '1122334455667', 'limited',
'789 ถนนรัชดาภิเษก', 'ห้วยขวาง', 'ห้วยขวาง', 'กรุงเทพมหานคร', '10310',
'02-555-1234', 'sales@technology.co.th', 30, 500000.00, 'active', '2024-03-10', 1);

-- เพิ่มความสัมพันธ์ vendor กับหมวดหมู่
INSERT INTO vendor_category_mapping (vendor_id, category_id, is_primary) VALUES
(1, 1, TRUE),   -- ABC = วัตถุดิบ (หลัก)
(1, 2, FALSE),  -- ABC = บรรจุภัณฑ์ (รอง)
(2, 3, TRUE),   -- XYZ = เครื่องจักร (หลัก)
(3, 5, TRUE),   -- เทคโนโลยี = IT (หลัก)
(3, 4, FALSE);  -- เทคโนโลยี = บริการ (รอง)

-- เพิ่มข้อมูลผู้ติดต่อ
INSERT INTO vendor_contacts (vendor_id, contact_type, title, first_name, last_name, position, phone, mobile, email) VALUES
(1, 'primary', 'นาย', 'สมชาย', 'ใจดี', 'ผู้จัดการขาย', '02-123-4567', '081-234-5678', 'somchai@abc.co.th'),
(1, 'billing', 'นางสาว', 'สมหญิง', 'มีเงิน', 'เจ้าหน้าที่การเงิน', '02-123-4568', '081-234-5679', 'billing@abc.co.th'),
(2, 'primary', 'นาย', 'สมศักดิ์', 'รวยเงิน', 'กรรมการผู้จัดการ', '02-987-6543', '081-987-6543', 'somsak@xyz.co.th'),
(3, 'primary', 'นาง', 'สมพร', 'เก่งเทค', 'ผู้อำนวยการขาย', '02-555-1234', '081-555-1234', 'somporn@technology.co.th');

-- เพิ่มข้อมูลบัญชีธนาคาร
INSERT INTO vendor_bank_accounts (vendor_id, bank_name, bank_code, branch_name, account_number, account_name, account_type, is_primary) VALUES
(1, 'ธนาคารกรุงเทพ', 'BBL', 'สาขาสุขุมวิท', '1234567890', 'บริษัท ABC จำกัด', 'current', TRUE),
(2, 'ธนาคารไทยพาณิชย์', 'SCB', 'สาขาพหลโยธิน', '0987654321', 'ห้างหุ้นส่วนจำกัด XYZ', 'current', TRUE),
(3, 'ธนาคารกสิกรไทย', 'KBANK', 'สาขารัชดาภิเษก', '5555666677', 'บริษัท เทคโนโลยี จำกัด', 'current', TRUE);

-- เพิ่มการประเมินผู้ขาย
INSERT INTO vendor_evaluations (vendor_id, evaluation_date, quality_score, delivery_score, service_score, price_score, overall_score, grade, evaluated_by, next_evaluation_date) VALUES
(1, '2024-06-01', 4.5, 4.0, 4.2, 3.8, 4.1, 'B', 1, '2024-12-01'),
(2, '2024-06-01', 4.8, 4.5, 4.7, 4.0, 4.5, 'A', 1, '2024-12-01'),
(3, '2024-06-01', 4.2, 4.3, 4.5, 4.1, 4.3, 'B', 1, '2024-12-01');

-- ===================================
-- USEFUL QUERIES (ตัวอย่างการใช้งาน)
-- ===================================

/*
-- 1. ดูข้อมูล vendor พร้อมหมวดหมู่
SELECT 
    v.vendor_code,
    v.vendor_name,
    v.company_name,
    v.status,
    GROUP_CONCAT(vc.category_name) as categories
FROM vendors v
LEFT JOIN vendor_category_mapping vcm ON v.id = vcm.vendor_id
LEFT JOIN vendor_categories vc ON vcm.category_id = vc.id
WHERE v.status = 'active'
GROUP BY v.id
ORDER BY v.vendor_code;

-- 2. ดูเอกสารที่ใกล้หมดอายุ (30 วัน)
SELECT 
    v.vendor_name,
    vd.document_name,
    vd.document_type,
    vd.expiry_date,
    DATEDIFF(vd.expiry_date, CURDATE()) as days_until_expiry
FROM vendor_documents vd
JOIN vendors v ON vd.vendor_id = v.id
WHERE vd.expiry_date IS NOT NULL 
AND vd.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
AND vd.expiry_date >= CURDATE()
ORDER BY vd.expiry_date;

-- 3. ดูสถิติการประเมินผู้ขาย
SELECT 
    v.vendor_name,
    ve.evaluation_date,
    ve.overall_score,
    ve.grade,
    CASE 
        WHEN ve.overall_score >= 4.5 THEN 'Excellent'
        WHEN ve.overall_score >= 4.0 THEN 'Good'
        WHEN ve.overall_score >= 3.0 THEN 'Fair'
        ELSE 'Poor'
    END as performance_level
FROM vendor_evaluations ve
JOIN vendors v ON ve.vendor_id = v.id
ORDER BY ve.evaluation_date DESC, ve.overall_score DESC;

-- 4. ดูข้อมูลผู้ติดต่อหลักของแต่ละ vendor
SELECT 
    v.vendor_name,
    CONCAT(vc.title, ' ', vc.first_name, ' ', vc.last_name) as contact_name,
    vc.position,
    vc.phone,
    vc.mobile,
    vc.email
FROM vendors v
LEFT JOIN vendor_contacts vc ON v.id = vc.vendor_id AND vc.contact_type = 'primary'
WHERE v.status = 'active'
ORDER BY v.vendor_name;

-- 5. ดูรายงานการเปลี่ยนแปลงข้อมูล vendor
SELECT 
    v.vendor_name,
    val.action,
    val.table_name,
    val.changed_fields,
    val.reason,
    val.created_at
FROM vendor_audit_logs val
JOIN vendors v ON val.vendor_id = v.id
WHERE val.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY val.created_at DESC;
*/