# ASDIG - Digital Attendance System

A modern, web-based attendance management system built with Next.js, designed for educational institutions to efficiently track and manage student attendance.

## 🚀 Features

### Core Functionality
- **Digital Attendance Tracking** - Real-time attendance recording with multiple status options
- **Student Management** - Complete student profile management with enrollment tracking
- **Class Management** - Organize students by classes with teacher assignments
- **User Management** - Role-based access control for administrators and teachers
- **Attendance Reports** - Comprehensive reporting and analytics
- **Print Functionality** - Generate printable attendance reports

### User Roles
- **Administrator** - Full system access, user management, system configuration
- **Teacher** - Class-specific attendance management, student records access

### Attendance Status Options
- **Present** (Hadir) - Student attended class
- **Absent** (Tidak Hadir) - Student was absent
- **Late** (Terlambat) - Student arrived late
- **Sick** (Sakit) - Student absent due to illness
- **Permission** (Izin) - Student absent with permission

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.4.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit and query builder
- **PostgreSQL** - Primary database (Supabase)
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing

### Infrastructure
- **Vercel** - Deployment and hosting platform
- **Supabase** - PostgreSQL database hosting
- **Vercel Analytics** - Application analytics

## 🏗️ Database Schema

### Core Models
- **Users** - System users (administrators and teachers)
- **Classes** - Class definitions with teacher assignments
- **Students** - Student profiles with enrollment status
- **AttendanceRecords** - Daily attendance tracking

### Key Relationships
- Users ↔ Classes (Teacher assignments)
- Students ↔ Classes (Class enrollment)
- Students ↔ AttendanceRecords (Attendance history)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# Application
NODE_ENV="development"
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/bayutb123/asdig.git
cd asdig
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npm run setup-supabase
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 📱 Application Structure

### Pages
- **Dashboard** (`/dashboard`) - Overview and quick actions
- **Manual Attendance** (`/absen-manual`) - Record attendance manually
- **Class Management** (`/kelola-kelas`) - Manage classes and teachers
- **Student Management** (`/kelola-siswa`) - Manage student records
- **Attendance Reports** (`/laporan-absen`) - View and analyze attendance data
- **Print Reports** (`/cetak-absen`) - Generate printable reports

### API Endpoints
- **Authentication** - `/api/auth/*` - Login/logout functionality
- **Users** - `/api/users` - User management
- **Classes** - `/api/classes` - Class operations
- **Students** - `/api/students` - Student management
- **Attendance** - `/api/attendance` - Attendance recording and retrieval

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:studio       # Open Prisma Studio

# Deployment
npm run build:local     # Build without Prisma generation
npm run setup-supabase  # Set up Supabase database
```

### Code Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── providers/          # Context providers
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🚀 Deployment

### Vercel Deployment
1. **Connect to Vercel**
   - Import your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables**
   ```env
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   ```

3. **Deploy**
   - Push to your main branch
   - Vercel will automatically build and deploy

### Database Setup
1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get your connection string

2. **Initialize Database**
   ```bash
   npm run setup-supabase
   ```

## 📊 Features in Detail

### Attendance Management
- Real-time attendance recording
- Multiple attendance status options
- Bulk attendance operations
- Historical attendance tracking
- Attendance analytics and insights

### Student Management
- Complete student profiles
- Enrollment status tracking
- Class assignment management
- Student search and filtering
- Bulk student operations

### Reporting System
- Daily attendance reports
- Class-wise attendance summaries
- Student attendance history
- Printable report generation
- Export functionality

### User Management
- Role-based access control
- Teacher-class assignments
- User profile management
- Secure authentication
- Session management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core attendance functionality
- User and student management
- Basic reporting system
- Vercel deployment ready

---

**Built with ❤️ for educational institutions**
