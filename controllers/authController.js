const { response } = require('express');
require('dotenv').config();
//const archiver = require('archiver');
var express = require('express');
var app = express();

// exports.login = (req, res) => {
//   const { username, password } = req.body;

//   // ตัวอย่างตรวจสอบ username/password แบบง่าย (ควรใช้ฐานข้อมูลจริง)
//   if (username === 'admin' && password === 'password') {
//     // ตัวอย่าง response (ควรใช้ JWT หรือ session จริง)
//     return res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       user: { id: 1, username: 'admin' }
//     });
//   } else {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid username or password'
//     });
//   }
// };
// exports.register = (req, res) => {
//   const { username, password } = req.body;

//   // ตัวอย่างตรวจสอบข้อมูลเบื้องต้น
//   if (!username || !password) {
//     return res.status(400).json({
//       success: false,
//       message: 'Username and password are required'
//     });
//   }

//   // ตัวอย่าง: ตรวจสอบว่ามี user นี้อยู่แล้วหรือไม่ (ควรเช็คกับฐานข้อมูลจริง)
//   if (username === 'admin') {
//     return res.status(409).json({
//       success: false,
//       message: 'Username already exists'
//     });
//   }

//   // ตัวอย่าง: สร้าง user ใหม่ (ควรบันทึกลงฐานข้อมูลจริง)
//   // ในที่นี้สมมติว่าสำเร็จ
//   return res.status(201).json({
//     success: true,
//     message: 'User registered successfully',
//     user: { id: 2, username }
//   });
// };