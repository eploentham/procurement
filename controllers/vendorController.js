const db = require('../config/database');
const { validationResult } = require('express-validator');

class VendorController {
    // ดึงข้อมูลผู้ขายทั้งหมด
    async getAllVendors(req, res) {
        console.error('getAllVendors called with query:', req.query);
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                status = 'all',
                vendor_type = 'all',
                sort_by = 'vendor_name',
                sort_order = 'ASC'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = 'WHERE 1=1';
            let params = [];

            // ค้นหา
            if (search) {
                whereClause += ` AND (vendor_name LIKE ? OR vendor_code LIKE ? OR contact_person LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            // กรองตามสถานะ
            if (status !== 'all') {
                whereClause += ` AND status = ?`;
                params.push(status);
            }

            // กรองตามประเภท
            if (vendor_type !== 'all') {
                whereClause += ` AND vendor_type = ?`;
                params.push(vendor_type);
            }

            // นับจำนวนทั้งหมด
            const countQuery = `SELECT COUNT(*) as total FROM vendors ${whereClause}`;
            const [countResult] = await db.execute(countQuery, params);
            const total = countResult[0].total;

            // ดึงข้อมูล
            const query = `
                SELECT 
                    vendor_id, vendor_code, vendor_name, business_type, 
                    contact_person, phone, email, status, 
                    credit_limit, payment_terms, quality_rating,
                    created_at, updated_at
                FROM vendors 
                ${whereClause}
                ORDER BY ${sort_by} ${sort_order}
                LIMIT ${limit} OFFSET ${offset}
            `;
            params.push(parseInt(limit), parseInt(offset));
            console.error('getAllVendors params', params);
            console.error('getAllVendors query', query);
            const [vendors] = await db.execute(query, params);

            res.json({
                success: true,
                data: vendors,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Error fetching vendors:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ขาย'
            });
        }
    }

    // ดึงข้อมูลผู้ขายตาม ID
    async getVendorById(req, res) {
        console.error('getVendorById called with query:');
        console.log('getVendorById req.params:', req.params);
        try {
            const { id } = req.params;
            console.log('getVendorById called with id:', id);
            const query = `
                SELECT v.*, 
                       u1.username as created_by_name,
                       u2.username as updated_by_name
                FROM vendors v
                LEFT JOIN users u1 ON v.created_by = u1.user_id
                LEFT JOIN users u2 ON v.updated_by = u2.user_id
                WHERE v.vendor_id = ${id}
            `;
            console.error('getVendorById query vendors', query);
            const [vendors] = await db.execute(query, [id]);

            if (vendors.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลผู้ขาย'
                });
            }

            // ดึงข้อมูลผู้ติดต่อ
            const contactQuery = `
                SELECT * FROM vendor_contacts 
                WHERE vendor_id = ? AND is_active = true
                ORDER BY is_primary DESC, contact_name
            `;
            const [contacts] = await db.execute(contactQuery, [id]);
            console.error('getVendorById query contacts', contacts.length);
            // ดึงข้อมูลหมวดหมู่
            const categoryQuery = `
                SELECT * FROM vendor_categories 
                WHERE vendor_id = ?
                ORDER BY category_name
            `;
            const [categories] = await db.execute(categoryQuery, [id]);

            const vendor = {
                ...vendors[0],
                contacts: contacts,
                categories: categories
            };

            res.json({
                success: true,
                data: vendor
            });

        } catch (error) {
            console.error('Error fetching vendor:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ขาย'
            });
        }
    }

    // สร้างผู้ขายใหม่
    async createVendor(req, res) {
        try {
            // ตรวจสอบ validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'ข้อมูลไม่ถูกต้อง',
                    errors: errors.array()
                });
            }

            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                const {
                    vendor_code, vendor_name, vendor_name_en, vendor_type,
                    tax_number, contact_person, phone, mobile, fax, email, website,
                    address, province, district, subdistrict, postal_code,
                    bank_name, bank_branch, account_number, account_name,
                    payment_term, credit_limit, discount_percent,
                    drug_license, license_expire_date, gmp_certificate, gmp_expire_date,
                    vendor_group, priority_level, remarks,
                    contacts = [], categories = []
                } = req.body;

                const user_id = req.user.user_id;

                // ตรวจสอบรหัสผู้ขายซ้ำ
                const [existingVendor] = await connection.execute(
                    'SELECT vendor_id FROM vendors WHERE vendor_code = ?',
                    [vendor_code]
                );

                if (existingVendor.length > 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'รหัสผู้ขายนี้มีอยู่ในระบบแล้ว'
                    });
                }

                // Insert ข้อมูลผู้ขาย
                const insertQuery = `
                    INSERT INTO vendors (
                        vendor_code, vendor_name, vendor_name_en, vendor_type,
                        tax_number, contact_person, phone, mobile, fax, email, website,
                        address, province, district, subdistrict, postal_code,
                        bank_name, bank_branch, account_number, account_name,
                        payment_term, credit_limit, discount_percent,
                        drug_license, license_expire_date, gmp_certificate, gmp_expire_date,
                        vendor_group, priority_level, remarks, created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const [result] = await connection.execute(insertQuery, [
                    vendor_code, vendor_name, vendor_name_en, vendor_type,
                    tax_number, contact_person, phone, mobile, fax, email, website,
                    address, province, district, subdistrict, postal_code,
                    bank_name, bank_branch, account_number, account_name,
                    payment_term || 30, credit_limit || 0, discount_percent || 0,
                    drug_license, license_expire_date, gmp_certificate, gmp_expire_date,
                    vendor_group, priority_level || 'medium', remarks, user_id
                ]);

                const vendor_id = result.insertId;

                // Insert ข้อมูลผู้ติดต่อ
                if (contacts && contacts.length > 0) {
                    const contactQuery = `
                        INSERT INTO vendor_contacts (
                            vendor_id, contact_name, position, department, 
                            phone, mobile, email, is_primary
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) `;

                    for (const contact of contacts) {
                        await connection.execute(contactQuery, [
                            vendor_id, contact.contact_name, contact.position,
                            contact.department, contact.phone, contact.mobile,
                            contact.email, contact.is_primary || false
                        ]);
                    }
                }

                // Insert ข้อมูลหมวดหมู่
                if (categories && categories.length > 0) {
                    const categoryQuery = `
                        INSERT INTO vendor_categories (vendor_id, category_name, category_type)
                        VALUES (?, ?, ?)`;

                    for (const category of categories) {
                        await connection.execute(categoryQuery, [
                            vendor_id, category.category_name, category.category_type
                        ]);
                    }
                }

                await connection.commit();

                res.status(201).json({
                    success: true,
                    message: 'สร้างข้อมูลผู้ขายสำเร็จ',
                    data: { vendor_id: vendor_id }
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('Error creating vendor:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการสร้างข้อมูลผู้ขาย'
            });
        }
    }

    // อัพเดทข้อมูลผู้ขาย
    async updateVendor(req, res) {
        console.error('updateVendor');
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'ข้อมูลไม่ถูกต้อง',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // ตรวจสอบว่าผู้ขายมีอยู่
                const [existingVendor] = await connection.execute(
                    'SELECT vendor_id FROM vendors WHERE vendor_id = ?',
                    [id]
                );

                if (existingVendor.length === 0) {
                    await connection.rollback();
                    return res.status(404).json({
                        success: false,
                        message: 'ไม่พบข้อมูลผู้ขาย'
                    });
                }

                let {
                    vendor_name, vendor_name_en, vendor_type,
                    tax_id, contact_person, phone, mobile, fax, email, website,
                    address, province, district, subdistrict, postal_code,
                    bank_name, bank_branch, account_number, account_name,
                    payment_terms, credit_limit, discount_percent,
                    drug_license, license_expire_date, gmp_certificate, gmp_expire_date,
                    status, vendor_group, priority_level, remarks,
                    contacts = [], categories = [], userid,vendor_code
                } = req.body;
                console.error('updateVendor req.body:', req.body);
                console.error('updateVendor vendor_code:',vendor_code);
                const user_id = req.body.user_id;
                
                //vendor_type = vendor_type || 'general'; // กำหนดค่าเริ่มต้นเป็น 'general' หากไม่ระบุ
                //ENUM('individual', 'partnership', 'limited', 'public_limited', 'government', 'other')
                
                vendor_type = vendor_type==='company' ? 'limited' : vendor_type; // แปลง 'company' เป็น 'limited'
                //vendor_type = vendor_type==='government' ? 'limited' : vendor_type; // แปลง 'company' เป็น 'limited'
                //const user_id = userid;
                // Update ข้อมูลผู้ขาย
                // const updateQuery = `
                //     UPDATE vendors SET
                //         vendor_name = ?, vendor_name_en = ?, business_type = ?,
                //         tax_id = ?, contact_person = ?, phone = ?, mobile = ?, 
                //         fax = ?, email = ?, website = ?,
                //         address = ?, province = ?, postal_code = ?,
                //         bank_name = ?, bank_branch = ?, account_number = ?, account_name = ?,
                //         payment_term = ?, credit_limit = ?, discount_percent = ?,
                //         drug_license = ?, license_expire_date = ?, gmp_certificate = ?, gmp_expire_date = ?,
                //         status = ?, vendor_group = ?, priority_level = ?, remarks = ?,
                //         updated_by = ?,vendor_code = ?
                //     WHERE vendor_id = ?
                // `;
                const updateQuery = `
                    UPDATE vendors SET
                        vendor_name = ?, vendor_name_en = ?, business_type = ?,
                        tax_id = ?, contact_person = ?, phone = ?, mobile = ?, 
                        email = ?, website = ?,
                        address = ?, province = ?, 
                        payment_terms = ?, credit_limit = ?, discount_percent = ?,
                        drug_license = ?, license_expire_date = ?, gmp_certificate = ?, gmp_expire_date = ?,
                        vendor_code = ?, status = ?, remarks = ?
                    WHERE vendor_id = ?
                `;
                // await connection.execute(updateQuery, [
                //     vendor_name, vendor_name_en, vendor_type,
                //     tax_number, contact_person, phone, mobile, fax, email, website,
                //     address, province, postal_code,
                //     bank_name, bank_branch, account_number, account_name,
                //     payment_term, credit_limit, discount_percent,
                //     drug_license, license_expire_date, gmp_certificate, gmp_expire_date,
                //     status, vendor_group, priority_level, remarks,
                //     user_id, vendor_code, id
                // ]);
                await connection.execute(updateQuery, [
                    vendor_name, vendor_name_en, vendor_type,
                    tax_id, contact_person, phone, mobile, email, website,
                    address, province, 
                    payment_terms, credit_limit, discount_percent,
                    drug_license, license_expire_date, gmp_certificate, gmp_expire_date,
                    vendor_code, status, remarks, id
                ]);
                // ลบข้อมูลผู้ติดต่อเดิม
                await connection.execute(
                    'DELETE FROM vendor_contacts WHERE vendor_id = ?',
                    [id]
                );

                // Insert ข้อมูลผู้ติดต่อใหม่
                if (contacts && contacts.length > 0) {
                    const contactQuery = `
                        INSERT INTO vendor_contacts (
                            vendor_id, contact_name, position,  
                            mobile, email, is_primary
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    for (const contact of contacts) {
                        await connection.execute(contactQuery, [
                            id, contact.contact_name, contact.position,
                            contact.mobile, contact.email, contact.is_primary || false
                        ]);
                    }
                }

                // ลบข้อมูลหมวดหมู่เดิม
                await connection.execute(
                    'DELETE FROM vendor_categories WHERE vendor_id = ?',
                    [id]
                );

                // Insert ข้อมูลหมวดหมู่ใหม่
                if (categories && categories.length > 0) {
                    const categoryQuery = `
                        INSERT INTO vendor_categories (vendor_id, category_name, category_type)
                        VALUES (?, ?, ?)
                    `;

                    for (const category of categories) {
                        await connection.execute(categoryQuery, [
                            id, category.category_name, category.category_type
                        ]);
                    }
                }

                await connection.commit();

                res.json({
                    success: true,
                    message: 'อัพเดทข้อมูลผู้ขายสำเร็จ'
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('Error updating vendor:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ขาย'
            });
        }
    }

    // ลบผู้ขาย (Soft delete)
    async deleteVendor(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.user_id;

            // ตรวจสอบว่าผู้ขายมีอยู่
            const [vendor] = await db.execute(
                'SELECT vendor_id FROM vendors WHERE vendor_id = ?',
                [id]
            );

            if (vendor.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลผู้ขาย'
                });
            }

            // Soft delete - เปลี่ยนสถานะเป็น inactive
            await db.execute(
                'UPDATE vendors SET status = ?, updated_by = ? WHERE vendor_id = ?',
                ['inactive', user_id, id]
            );

            res.json({
                success: true,
                message: 'ลบข้อมูลผู้ขายสำเร็จ'
            });

        } catch (error) {
            console.error('Error deleting vendor:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้ขาย'
            });
        }
    }

    // อัพเดทคะแนนผู้ขาย
    async updateVendorRating(req, res) {
        try {
            const { id } = req.params;
            const { quality_rating, delivery_rating, service_rating } = req.body;
            const user_id = req.user.user_id;

            await db.execute(`
                UPDATE vendors SET 
                    quality_rating = ?, 
                    delivery_rating = ?, 
                    service_rating = ?,
                    updated_by = ?
                WHERE vendor_id = ?
            `, [quality_rating, delivery_rating, service_rating, user_id, id]);

            res.json({
                success: true,
                message: 'อัพเดทคะแนนผู้ขายสำเร็จ'
            });

        } catch (error) {
            console.error('Error updating vendor rating:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการอัพเดทคะแนนผู้ขาย'
            });
        }
    }

    // ดึงรายการผู้ขายแบบ dropdown
    async getVendorsDropdown(req, res) {
        try {
            const { search = '', status = 'active' } = req.query;
            
            let query = `
                SELECT vendor_id, vendor_code, vendor_name 
                FROM vendors 
                WHERE status = ?
            `;
            let params = [status];

            if (search) {
                query += ` AND (vendor_name LIKE ? OR vendor_code LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            query += ` ORDER BY vendor_name LIMIT 50`;

            const [vendors] = await db.execute(query, params);

            res.json({
                success: true,
                data: vendors
            });

        } catch (error) {
            console.error('Error fetching vendors dropdown:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ขาย'
            });
        }
    }

    // ดึงสถิติผู้ขาย
    async getVendorStats(req, res) {
        try {
            const [stats] = await db.execute(`
                SELECT 
                    COUNT(*) as total_vendors,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_vendors,
                    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_vendors,
                    SUM(CASE WHEN status = 'blacklist' THEN 1 ELSE 0 END) as blacklist_vendors,
                    AVG(quality_rating) as avg_quality_rating,
                    AVG(delivery_rating) as avg_delivery_rating,
                    AVG(service_rating) as avg_service_rating
                FROM vendors
            `);

            res.json({
                success: true,
                data: stats[0]
            });

        } catch (error) {
            console.error('Error fetching vendor stats:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการดึงสถิติผู้ขาย'
            });
        }
    }
}

module.exports = new VendorController();