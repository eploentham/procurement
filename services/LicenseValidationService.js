// ตรวจสอบรูปแบบเลขทะเบียนยา
function isValidLicenseFormat(licenseNumber) {
  // ตัวอย่าง: ต้องขึ้นต้นด้วย 'TH' และตามด้วยตัวเลข 6 หลัก
  const regex = /^TH\d{6}$/;
  return regex.test(licenseNumber);
}

// ตรวจสอบเลขทะเบียนซ้ำในระบบ (สมมติรับ array ของทะเบียนที่มีอยู่)
function isDuplicateLicense(licenseNumber, existingLicenses) {
  return existingLicenses.includes(licenseNumber);
}

// ตรวจสอบเลขทะเบียนทั้งหมด (format + duplicate)
function validateLicense(licenseNumber, existingLicenses) {
  if (!isValidLicenseFormat(licenseNumber)) {
    return { valid: false, message: 'Invalid license format' };
  }
  if (isDuplicateLicense(licenseNumber, existingLicenses)) {
    return { valid: false, message: 'Duplicate license number' };
  }
  return { valid: true, message: 'License is valid' };
}
function start() {
  console.log('LicenseValidationService started');
  // ใส่ logic สำหรับเริ่มต้น service หรือ schedule งานที่ต้องการ
}
function stop() {
  console.log('ExpiryAlertService stopped');
  // ใส่ logic สำหรับหยุด service (เช่น clearInterval)
}
module.exports = {
  isValidLicenseFormat,
  isDuplicateLicense,
  validateLicense,
  start // export method start ด้วย
  ,stop // export method stop ด้วย
};