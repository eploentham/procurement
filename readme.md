# Procurement Management System

ระบบจัดซื้อจัดจ้างครบวงจร พัฒนาด้วย Node.js, Express และ MySQL

## Features

### Core Modules
- 🏢 **Vendor Management** - จัดการข้อมูลผู้ขาย
- 📦 **Product Catalog** - จัดการข้อมูลสินค้า/บริการ
- 📝 **Purchase Request** - การขอซื้อ/ขอจ้าง
- 💰 **Quotation Management** - จัดการใบเสนอราคา
- 📋 **Purchase Order** - ใบสั่งซื้อ/สั่งจ้าง
- 📄 **Contract Management** - จัดการสัญญา
- 📦 **Receiving** - การรับสินค้า/งาน
- 💸 **Payment Processing** - การชำระเงิน
- 📊 **Reports & Analytics** - รายงานและวิเคราะห์

### Key Features
- ✅ Multi-level Approval Workflow
- 🔄 Real-time Status Tracking
- 📧 Email Notifications
- 📱 Mobile Responsive
- 🔐 Role-based Access Control
- 📈 Dashboard & KPIs
- 🗂️ Document Management
- 🔍 Advanced Search & Filters
- 📊 Excel Import/Export
- 🏷️ Budget Management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer
- **Excel**: excel4node
- **PDF**: PDFKit
- **Validation**: Joi
- **Testing**: Jest

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd procurement-system
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup database
```bash
mysql -u root -p < database/schema.sql
npm run db:seed
```

5. Start the server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors/:id` - Get vendor by ID
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Purchase Requests
- `GET /api/purchase-requests` - Get all requests
- `POST /api/purchase-requests` - Create request
- `PUT /api/purchase-requests/:id` - Update request
- `POST /api/purchase-requests/:id/approve` - Approve request
- `POST /api/purchase-requests/:id/reject` - Reject request

### Purchase Orders
- `GET /api/purchase-orders` - Get all orders
- `POST /api/purchase-orders` - Create order
- `GET /api/purchase-orders/:id/pdf` - Generate PDF

## Project Structure

```
procurement-system/
├── config/              # Configuration files
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic services
├── utils/              # Utility functions
├── validators/         # Input validation
├── uploads/            # File uploads
├── tests/              # Test files
├── database/           # Database files
└── public/             # Static files
```

## Environment Variables

See `.env.example` for all required environment variables.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test
npm test -- auth.test.js
```

## License

MIT License