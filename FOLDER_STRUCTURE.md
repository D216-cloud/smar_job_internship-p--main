# SmartHire - AI-Powered Job Platform
## Complete Folder Structure

```
SmartHire/
├── 📄 Configuration Files
│   ├── components.json              # shadcn/ui components configuration
│   ├── eslint.config.js            # ESLint configuration
│   ├── package.json                # Frontend dependencies and scripts
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.app.json           # App-specific TypeScript config
│   ├── tsconfig.node.json          # Node-specific TypeScript config
│   ├── vite.config.ts              # Vite build configuration
│   └── README.md                   # Project documentation
│
├── 🚀 Startup Scripts
│   ├── start-backend.js            # Backend startup script
│   ├── start.bat                   # Windows startup script
│   └── start.sh                    # Unix/Linux startup script
│
├── 🎨 Frontend (src/)
│   ├── App.tsx                     # Main application component
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global styles
│   ├── vite-env.d.ts              # Vite environment types
│   │
│   ├── 📡 API Layer (api/)
│   │   ├── aiMatching.ts           # AI matching API calls
│   │   ├── extractResumeText.ts    # Resume text extraction
│   │   └── applications/           # Application-related APIs
│   │
│   ├── 🧩 Components (components/)
│   │   ├── AIResumeMatching.tsx    # AI-powered resume analysis modal
│   │   ├── ChatApp.tsx             # AI chat assistant component
│   │   ├── Header.tsx              # Site header
│   │   ├── Footer.tsx              # Site footer
│   │   ├── JobRequirementsModal.tsx # Job requirements display
│   │   ├── ProtectedRoute.tsx      # Authentication route guard
│   │   ├── PublicRoute.tsx         # Public route component
│   │   ├── ResumeUpload.tsx        # Resume upload component
│   │   ├── SearchResults.tsx       # Search results display
│   │   ├── UserProfile.tsx         # User profile component
│   │   ├── WelcomeNotification.tsx # Welcome notifications
│   │   │
│   │   ├── 👑 Admin Components (admin/)
│   │   │   └── [Various admin-specific components]
│   │   │
│   │   ├── 🏢 Company Components (company/)
│   │   │   └── [Company dashboard components]
│   │   │
│   │   ├── 👤 User Components (user/)
│   │   │   └── [User-specific components]
│   │   │
│   │   ├── 🎨 UI Components (ui/)
│   │   │   └── [shadcn/ui components - buttons, cards, etc.]
│   │   │
│   │   └── 🔧 Common Components (common/)
│   │       ├── Sidebar.tsx         # Navigation sidebar
│   │       └── [Other shared components]
│   │
│   ├── 🔄 Context (context/)
│   │   └── AuthContext.tsx         # Authentication context
│   │
│   ├── 📊 Data (data/)
│   │   └── jobsData.ts             # Sample/fallback job data
│   │
│   ├── 🎣 Hooks (hooks/)
│   │   ├── use-media-query.ts      # Media query hook
│   │   ├── use-mobile.tsx          # Mobile detection hook
│   │   ├── use-toast.ts            # Toast notification hook
│   │   ├── useAuth.tsx             # Authentication hook
│   │   ├── useAvailableJobs.tsx    # Job fetching hook
│   │   ├── useCompanyProfile.tsx   # Company profile hook
│   │   ├── useSearch.tsx           # Search functionality hook
│   │   ├── useUserJobs.tsx         # User jobs hook
│   │   └── useUserProfile.tsx      # User profile hook
│   │
│   ├── 🖼️ Images (Images/)
│   │   ├── careersnap-logo.png     # Application logo
│   │   ├── logo.png                # Alternative logo
│   │   ├── Deepak Maheta.jpg       # Team member photo
│   │   ├── Jainam Patel.jpg        # Team member photo
│   │   ├── Sachin Chauhan.jpg      # Team member photo
│   │   └── desktop.ini             # Windows folder config
│   │
│   ├── 🛠️ Utilities (lib/)
│   │   └── utils.ts                # Utility functions
│   │
│   ├── 📄 Pages (pages/)
│   │   ├── About.tsx               # About page
│   │   ├── Chat.tsx                # Chat page
│   │   ├── Contact.tsx             # Contact page
│   │   ├── Home.tsx                # Homepage
│   │   ├── Index.tsx               # Index page
│   │   ├── Internships.tsx         # Internships listing
│   │   ├── JobApplication.tsx      # Job application page
│   │   ├── Jobs.tsx                # Jobs listing
│   │   ├── Login.tsx               # Login page
│   │   ├── NotFound.tsx            # 404 error page
│   │   ├── PostJob.tsx             # Job posting page
│   │   ├── RoleSelection.tsx       # Role selection page
│   │   │
│   │   ├── 👑 Admin Pages (admin/)
│   │   │   ├── AdminLayout.tsx     # Admin layout wrapper
│   │   │   ├── AdminDashboard.tsx  # Admin dashboard
│   │   │   └── user/               # User management pages
│   │   │       ├── UserLayout.tsx  # User layout wrapper
│   │   │       ├── UserHome.tsx    # User home page
│   │   │       ├── UserDashboard.tsx # User dashboard
│   │   │       ├── UserJobs.tsx    # User jobs page
│   │   │       ├── UserProfile.tsx # User profile page
│   │   │       ├── MyApplications.tsx # User applications
│   │   │       └── Settings.tsx    # User settings
│   │   │
│   │   ├── 🏢 Company Pages (company/)
│   │   │   ├── CompanyLayout.tsx   # Company layout wrapper
│   │   │   ├── CompanyHome.tsx     # Company homepage
│   │   │   ├── CompanyDashboard.tsx # Company dashboard
│   │   │   ├── CompanyProfile.tsx  # Company profile
│   │   │   ├── CompanyAnalytics.tsx # Company analytics
│   │   │   ├── Applications.tsx    # Company applications
│   │   │   ├── Candidates.tsx      # Candidate management
│   │   │   └── JobApplications.tsx # Job application management
│   │   │
│   │   └── 👤 User Pages (user/)
│   │       ├── Interviews.tsx      # Interview management
│   │       └── UserChat.tsx        # User chat interface
│   │
│   └── 🔧 Utils (utils/)
│       └── [Frontend utility functions]
│
├── 🖼️ Public Assets (public/)
│   ├── careersnap-favicon.png      # Site favicon
│   ├── favicon.jpg                 # Alternative favicon
│   ├── placeholder.svg             # Placeholder image
│   ├── robots.txt                  # SEO robots file
│   └── lovable-uploads/            # User uploaded files
│       └── b0f7359d-643f-4e68-8ca0-5da39750ee0c.png
│
└── 🖥️ Backend (backend/)
    ├── package.json                # Backend dependencies
    ├── server.js                   # Main server file
    ├── test-ai-recommendations.js  # AI testing script
    │
    ├── ⚙️ Configuration (config/)
    │   └── db.js                   # Database connection
    │
    ├── 🎮 Controllers (controllers/)
    │   └── [Business logic controllers]
    │
    ├── 🛡️ Middleware (middleware/)
    │   └── auth.js                 # Authentication middleware
    │
    ├── 📊 Models (models/)
    │   ├── application.js          # Application data model
    │   ├── company.js              # Company data model
    │   ├── companyProfile.js       # Company profile model
    │   ├── job.js                  # Job data model
    │   ├── user.js                 # User data model
    │   └── userProfile.js          # User profile model
    │
    ├── 🛣️ Routes (routes/)
    │   ├── aiChat.js               # AI chat endpoints
    │   ├── aiMatching.js           # AI matching endpoints
    │   ├── aiRecommendations.js    # AI recommendations
    │   ├── applications.js         # Application management
    │   ├── auth.js                 # Authentication routes
    │   ├── chat.js                 # Chat functionality
    │   ├── companyProfile.js       # Company profile routes
    │   ├── jobs.js                 # Job management routes
    │   ├── resumeAnalysis.js       # Resume analysis routes
    │   ├── resumeUpload.js         # Resume upload routes
    │   ├── simpleProfiles.js       # Simple profile routes
    │   ├── testAPI.js              # API testing routes
    │   └── userProfile.js          # User profile routes
    │
    ├── 📁 Uploads (uploads/)
    │   ├── 4ef556cf38e210bf43c54ecbbc9dd624  # Uploaded files
    │   ├── 621c5494d78e089ee62f58eeb58b410d
    │   ├── b92558f68c00c28440d693afef4c2766
    │   ├── cd66710f6373f151a93c8616a12ae824
    │   └── f9a31499a4f1574ab707d6be708a59e0
    │
    └── 🔧 Utilities (utils/)
        ├── cloudinary.js           # Cloudinary file upload
        ├── geminiClient.js         # Gemini AI client
        ├── llmClient.js            # Language model client
        ├── localScorer.js          # Local scoring algorithm
        ├── pdfExtractor.js         # PDF text extraction
        └── resumeResolver.js       # Resume processing
```

## 🎯 **Key Directory Explanations**

### **Frontend Structure (src/)**
- **components/**: Reusable UI components including AI-powered features
- **pages/**: Full page components with routing
- **hooks/**: Custom React hooks for state management
- **context/**: React context providers for global state
- **api/**: Frontend API calling functions
- **utils/**: Frontend utility functions

### **Backend Structure (backend/)**
- **models/**: MongoDB data schemas
- **routes/**: API endpoint definitions
- **utils/**: Backend utilities including AI clients
- **middleware/**: Express middleware functions
- **uploads/**: File storage directory

### **AI Integration Points**
- **AIResumeMatching.tsx**: Frontend AI analysis component
- **aiMatching.js**: Backend AI matching endpoint
- **ChatApp.tsx**: AI chat interface
- **DeepSeek Integration**: Throughout backend utils

### **Key Features by Directory**
- **Authentication**: `auth.js`, `AuthContext.tsx`, `ProtectedRoute.tsx`
- **Job Management**: `jobs.js`, `Jobs.tsx`, `JobApplication.tsx`
- **AI Features**: `aiMatching.js`, `AIResumeMatching.tsx`, `ChatApp.tsx`
- **File Handling**: `resumeUpload.js`, `cloudinary.js`, `pdfExtractor.js`
- **User Management**: `userProfile.js`, `UserProfile.tsx`, user pages

This structure supports a scalable, maintainable AI-powered job platform with clear separation of concerns and modular architecture.
