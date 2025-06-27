// ฟังก์ชันตรวจสอบรายการยาที่ใกล้หมดอายุภายใน X วัน
function getExpiringDrugs(drugList, days = 30) {
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return drugList.filter(drug => {
    if (!drug.expiryDate) return false;
    const expiry = new Date(drug.expiryDate);
    return expiry > now && expiry <= threshold;
  });
}

// ฟังก์ชันแจ้งเตือน (ตัวอย่าง: log หรือส่งอีเมล)
function alertExpiringDrugs(drugs) {
  drugs.forEach(drug => {
    console.log(`Alert: Drug ${drug.name} (Batch: ${drug.batch}) is expiring on ${drug.expiryDate}`);
    // สามารถเพิ่มการส่งอีเมลหรือแจ้งเตือนอื่น ๆ ได้ที่นี่
  });
}
function stop() {
  console.log('ExpiryAlertService stopped');
  // ใส่ logic สำหรับหยุด service (เช่น clearInterval)
}
module.exports = {
  getExpiringDrugs,
  alertExpiringDrugs,
  stop
};