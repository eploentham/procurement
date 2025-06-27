// ตรวจสอบเลขทะเบียนยา
function validateLicenseNumber(licenseNumber) {
  // ตัวอย่าง: เลขทะเบียนต้องขึ้นต้นด้วย 'TH' และตามด้วยตัวเลข 6 หลัก
  const regex = /^TH\d{6}$/;
  return regex.test(licenseNumber);
}

// ตรวจสอบวันหมดอายุ
function isExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

// ตรวจสอบข้อมูลยาเบื้องต้น
function checkDrugCompliance(drug) {
  if (!drug.licenseNumber || !validateLicenseNumber(drug.licenseNumber)) {
    return { valid: false, message: 'Invalid or missing license number' };
  }
  if (isExpired(drug.expiryDate)) {
    return { valid: false, message: 'Drug is expired' };
  }
  // เพิ่มเงื่อนไขอื่น ๆ ได้ตามต้องการ
  return { valid: true, message: 'Compliant' };
}
function startComplianceMonitoring() {
  console.log('RegulatoryService compliance monitoring started');
  // ตัวอย่าง: ตั้ง schedule ตรวจสอบข้อมูลทุกวัน
  // สามารถใช้ node-cron หรือ setInterval ได้
  // ตัวอย่างง่าย ๆ:
  setInterval(() => {
    console.log('Running compliance check...');
    // ใส่ logic ตรวจสอบ compliance ที่ต้องการ
  }, 24 * 60 * 60 * 1000); // ทุก 24 ชั่วโมง
}
function stopComplianceMonitoring() {
  console.log('RegulatoryService compliance monitoring stopped');
  // ตัวอย่าง: ตั้ง schedule ตรวจสอบข้อมูลทุกวัน
  // สามารถใช้ node-cron หรือ setInterval ได้
  // ตัวอย่างง่าย ๆ:
  setInterval(() => {
    console.log('Running compliance check...');
    // ใส่ logic ตรวจสอบ compliance ที่ต้องการ
  }, 24 * 60 * 60 * 1000); // ทุก 24 ชั่วโมง
}
module.exports = {
  validateLicenseNumber,
  isExpired,
  checkDrugCompliance,
  startComplianceMonitoring // export method นี้ด้วย
  ,stopComplianceMonitoring // export method นี้ด้วย
};