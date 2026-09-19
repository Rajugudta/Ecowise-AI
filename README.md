🌿 EcoWise AI – Smart Building Energy Copilot

«AI-powered energy optimization for smarter, greener, and more efficient buildings.»

"Status" (https://img.shields.io/badge/Status-In%20Development-brightgreen)
"Python" (https://img.shields.io/badge/Python-3.12-blue)
"FastAPI" (https://img.shields.io/badge/FastAPI-Backend-009688)
"React" (https://img.shields.io/badge/React-Frontend-61DAFB)
"License" (https://img.shields.io/badge/License-MIT-green)

---

📖 Overview

EcoWise AI is an intelligent energy management platform developed for the Schneider Electric Yuva Yodha Energy Tech Hackathon.

The platform helps facility managers monitor energy consumption, detect abnormal usage, reduce electricity costs, lower carbon emissions, and make data-driven sustainability decisions using Artificial Intelligence.

Instead of displaying raw energy data, EcoWise AI converts complex information into simple, actionable recommendations through Google Gemini AI.

---

🎯 Problem Statement

Commercial buildings consume significant amounts of electricity every day. Most existing monitoring systems provide only dashboards and graphs without helping users understand:

- Why energy usage increased
- Which equipment is wasting power
- How to reduce electricity costs
- How to lower carbon emissions

This makes energy optimization difficult for facility managers.

---

💡 Solution

EcoWise AI provides an AI-powered smart building assistant that:

- 📊 Monitors energy usage
- ⚡ Detects abnormal consumption
- 🤖 Generates AI-powered recommendations
- 🌱 Tracks carbon emissions
- 📈 Predicts future energy demand
- 📄 Generates intelligent reports

---

✨ Key Features

🔐 Authentication

- Google Sign-In
- Secure Supabase Authentication
- Session Management

📊 Dashboard

- Today's Energy Usage
- Monthly Energy Consumption
- Carbon Emissions
- Energy Score
- Estimated Cost Savings
- AI Summary

📈 Analytics

- Daily Charts
- Weekly Charts
- Monthly Trends
- Peak Usage Analysis
- Building Comparison

🤖 AI Energy Advisor

Users can ask:

- Why is energy usage high?
- How can I reduce electricity costs?
- Suggest sustainability improvements.
- Explain energy trends.

Powered by Google Gemini AI.

🚨 Smart Alerts

- High Energy Consumption
- Carbon Threshold Alerts
- Equipment Running Too Long
- AI-generated Recommendations

📄 Reports

- Weekly Reports
- Monthly Reports
- Energy Reports
- Carbon Reports
- PDF Export
- CSV Export

⚙️ Settings

- User Profile
- Notification Preferences
- Theme Settings
- Building Information

---

🛠 Technology Stack

Frontend

- React (Vite)
- Tailwind CSS
- Framer Motion
- React Router
- Recharts

Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

Database

- Supabase (PostgreSQL)

Authentication

- Supabase Auth
- Google OAuth

Artificial Intelligence

- Google Gemini API

Deployment

- Vercel
- Render
- Supabase

---

🏗 Architecture

React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
Supabase Database
        │
        ▼
Google Gemini AI
        │
        ▼
AI Recommendations & Reports

---

🚀 Installation

Clone the repository:

git clone https://github.com/yourusername/ecowise-ai.git

Install frontend dependencies:

cd frontend
npm install
npm run dev

Install backend dependencies:

cd backend
pip install -r requirements.txt
uvicorn main:app --reload

---

🔑 Environment Variables

Create a ".env" file.

VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

GEMINI_API_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_KEY=

Never commit secret keys to GitHub.

---

📱 User Flow

Login
   │
   ▼
Dashboard
   │
   ├── Analytics
   ├── AI Advisor
   ├── Smart Alerts
   ├── Reports
   └── Settings

---

🌍 Expected Impact

EcoWise AI aims to:

- Reduce electricity consumption
- Lower operational costs
- Improve energy efficiency
- Reduce carbon emissions
- Support sustainability initiatives
- Enable AI-assisted decision-making

---

🔮 Future Enhancements

- IoT Sensor Integration
- Real-Time Energy Monitoring
- Predictive Maintenance
- Mobile Application
- Multi-Building Management
- Voice AI Assistant
- AI Energy Forecasting

---

👨‍💻 Team

Project: EcoWise AI – Smart Building Energy Copilot

Developed for the Schneider Electric Yuva Yodha Energy Tech Hackathon.

---

📜 License

This project is released under the MIT License.

---

⭐ Acknowledgements

- Schneider Electric
- Yuva Yodha Energy Tech Hackathon
- Google Gemini AI
- Supabase
- FastAPI
- React
- Vercel
