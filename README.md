# ⚡ HireFlow ATS | Intelligent Applicant Tracking

HireFlow is a premium, AI-powered Applicant Tracking System (ATS) designed for modern hiring teams. It streamlines the recruitment process from job creation to candidate hiring with a sleek, dark-themed interface and integrated Google Gemini AI for resume intelligence.

![HireFlow UI Preview](https://via.placeholder.com/1200x600/030712/purple?text=HireFlow+Premium+ATS+UI)

## ✨ Features

- **🎨 Obsidian Design System**: A high-end dark theme featuring glassmorphism, mesh gradients, and "Outfit" geometric typography.
- **🤖 AI Resume Summarization**: Automatically analyzes PDF resumes using Google Gemini AI to provide instant candidate insights.
- **📋 Kanban Pipeline**: Drag-and-drop candidate management through stages (Applied, Interviewing, Hired).
- **🔑 Secure Authentication**: Enterprise-grade auth powered by Clerk.
- **📄 Public Application Portal**: Branded application pages for candidates with secure PDF upload functionality.
- **⚡ Real-time Updates**: Instant UI feedback and streamlined API interactions.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS (Design System).
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **AI**: Google Generative AI (Gemini Flash 2.0).
- **Auth**: Clerk Authentication.
- **File Handling**: Multer (Secure local storage).

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Clerk Account (Publishable & Secret Keys)
- Google AI Studio API Key (Gemini)

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/HireFlow-ATS.git
cd HireFlow-ATS
```

### 3. Setup Environment Variables

**Backend (`/backend/.env`):**
```env
CLERK_SECRET_KEY=your_sk_key
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
```

**Frontend (`/frontend/.env`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_pk_key
VITE_API_URL=http://localhost:5000
```

### 4. Run the Application

**Start Backend:**
```bash
cd backend
npm install
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to start hiring!

## 🛡️ Security

- Environment variables are protected via `.gitignore`.
- Authentication is enforced on all sensitive HR routes.
- PDF uploads are validated for type and size.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built by MEET SHETH
