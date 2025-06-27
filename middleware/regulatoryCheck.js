const regulatoryCheck = (req, res, next) => {
  const { licenseNumber, expiryDate } = req.body;

  // ตรวจสอบว่ามีเลขทะเบียนหรือไม่
  if (!licenseNumber) {
    return res.status(400).json({
      success: false,
      message: 'Missing license number'
    });
  }

  // ตรวจสอบวันหมดอายุ
  if (expiryDate && new Date(expiryDate) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Drug is expired'
    });
  }

  // ผ่านการตรวจสอบ
  next();
};

module.exports = regulatoryCheck;