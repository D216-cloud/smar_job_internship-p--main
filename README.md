# SmartHire - AI-Powered Job Platform

A modern job platform with AI-powered matching for job seekers and companies.

## 🚀 Quick Start

### Option 1: Using the provided scripts (Recommended)

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

### Option 2: Manual setup

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Seed the database with sample data:**
   ```bash
   cd backend && npm run seed && cd ..
   ```

3. **Start the application:**
   ```bash
   npm run dev:full
   ```

## 🌟 New Features

### Updated User Flow
- **Role Selection** → **Direct Access** (No login required for demo)
- Choose your role (Student/Company) and go directly to your dashboard
- Browse jobs and internships immediately

### Sample Data
The application now includes:
- **3 Sample Jobs**: Senior Frontend Developer, Product Manager, UX Designer
- **3 Sample Internships**: Software Engineering (Google), Marketing (Facebook), Data Science (Netflix)

### Fallback System
- If backend is not available, the app uses local sample data
- Jobs and internships are always visible
- No more empty pages!

## 📱 User Experience

### For Students:
1. Select "I'm a Job Seeker" on the landing page
2. Go directly to Student Dashboard
3. Browse available jobs and internships
4. View job details and apply

### For Companies:
1. Select "I'm a Company" on the landing page
2. Go directly to Company Dashboard
3. Post new jobs and internships
4. View applications and manage listings

## 🛠️ Technical Details

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- Local data fallback when backend is unavailable

### Backend
- Node.js + Express
- MongoDB for data storage
- RESTful API endpoints
- Sample data seeding

### Database Schema
Jobs and Internships are stored with:
- Title, company, location, salary
- Requirements, benefits, skills
- Application deadlines and instructions
- View and application tracking

## 🔧 Development

### Available Scripts
- `npm run dev` - Start frontend only
- `npm run backend` - Start backend only
- `npm run dev:full` - Start both frontend and backend
- `cd backend && npm run seed` - Seed database with sample data

### API Endpoints
- `GET /api/jobs` - Get all jobs
- `GET /api/internships` - Get all internships
- `POST /api/jobs` - Create new job
- `POST /api/internships` - Create new internship

## 🎯 Demo Features

### Job Listings
- Real-time search and filtering
- Salary range filtering
- Location-based filtering
- Experience level filtering

### Internship Listings
- Term-based filtering (Summer, Fall, etc.)
- Stipend range filtering
- Company type filtering
- Application deadline tracking

### Company Features
- Post new jobs and internships
- View application statistics
- Manage company profile
- Track posting performance

## 📊 Sample Data Included

### Jobs
1. **Senior Frontend Developer** - TechCorp Inc. - $120k-$160k
2. **Product Manager** - StartupXYZ - $100k-$140k
3. **UX Designer** - Design Studio - $80k-$110k

### Internships
1. **Software Engineering Intern** - Google - $8k/month
2. **Marketing Intern** - Facebook - $6.5k/month
3. **Data Science Intern** - Netflix - $7.5k/month

## 🚀 Getting Started

1. Run the start script for your platform
2. Wait for dependencies to install and database to seed
3. Open http://localhost:5173 in your browser
4. Choose your role and start exploring!

The application will automatically load with sample jobs and internships, so you can immediately see the platform in action.