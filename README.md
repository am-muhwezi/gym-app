<div align="center">

<img src="https://img.shields.io/badge/TrainrUp-10B981?style=for-the-badge&logo=dumbbell&logoColor=white" alt="TrainrUp" />

# 💪 TrainrUp

### *Empowering Personal Trainers, One Client at a Time*

<p>
  <img src="https://img.shields.io/badge/Made_with-❤️-10B981?style=flat-square" alt="Made with Love" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Django-REST-092E20?style=flat-square&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
</p>


<p>
  <a href="https://trainrup.fit/">
    <img src="https://img.shields.io/badge/Live_Site-https://trainrup.fit-10B981?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Site" />
  </a>
  <a href="https://youtube.com/@TrainrUp">
    <img src="https://img.shields.io/badge/YouTube-@TrainrUp-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube Channel" />
  </a>
</p>

**Built by Trainers, For Trainers** 🎯

</div>

---

---

## 👋 Welcome to TrainrUp!

> **TrainrUp** is your all-in-one platform designed to help personal trainers manage their business effortlessly. Whether you're tracking client progress, scheduling sessions, managing payments, or analyzing your business growth — TrainrUp has you covered.

<table>
<tr>
<td width="50%">

### ✨ Core Features

- 👥 **Client Management**  
  Keep all your client information organized
  
- 📅 **Smart Scheduling**  
  Book and manage sessions effortlessly
  
- 💳 **Payment Tracking**  
  Integrated M-Pesa support

</td>
<td width="50%">

### 🚀 Power Tools

- 📊 **Business Analytics**  
  Understand your growth with insights
  
- 🎯 **Goal Setting**  
  Track client progress and achievements
  
- 📱 **Mobile Ready**  
  Access anywhere, anytime

</td>
</tr>
</table>

---

<div align="center">

## 🎥 Learn More on YouTube

[![YouTube](https://img.shields.io/badge/Watch_Tutorials-@TrainrUp-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@TrainrUp)

*Subscribe for tutorials, tips, and updates!*

</div>

---

## 🚀 For Non-Technical Users

<table>
<tr>
<td width="33%" align="center">
<img src="https://img.shields.io/badge/🧠_The_Brain-server-10B981?style=for-the-badge" />

**Backend**  
Where all the data and logic lives

</td>
<td width="33%" align="center">
<img src="https://img.shields.io/badge/🎨_The_Face-frontend-059669?style=for-the-badge" />

**Frontend**  
The beautiful interface you interact with

</td>
<td width="33%" align="center">
<img src="https://img.shields.io/badge/📚_The_Docs-guides-10B981?style=for-the-badge" />

**Documentation**  
Helpful guides and resources

</td>
</tr>
</table>


### 💡 Want to Use TrainrUp?

> You don't need to run this code! Simply visit the live site: <a href="https://trainrup.fit/">https://trainrup.fit/</a> and sign up for an account. This repository is mainly for developers who want to contribute or run their own version.

---

## 👨‍💻 For Developers

<div align="center">

### 🛠️ Tech Stack

<p>
  <img src="https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-Django_+_DRF-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

</div>

### 📋 What You'll Need

| Tool | Version | Purpose |
|------|---------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white) | **18+** | Frontend development |
| ![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white) | **3.10+** | Backend development |
| ![Coffee](https://img.shields.io/badge/Coffee-☕-6F4E37?style=flat-square) | **∞** | Developer fuel |

### 🚀 Quick Start Guide

<details open>
<summary><b>📦 Step 1: Get the Backend Running</b></summary>
<br>

```bash
# Navigate to the project root
cd trainrup

# Create a Python virtual environment
python -m venv .venv

# Activate it (on Mac/Linux)
source .venv/bin/activate

# Install all the backend dependencies
pip install -r server/requirements.txt

# Set up the database
python server/manage.py migrate

# Create your admin account
python server/manage.py createsuperuser

# Start the backend server
python server/manage.py runserver
```

✅ Your backend is now running at **http://127.0.0.1:8000/**

<div align="center">
<img src="https://img.shields.io/badge/Backend-Running-10B981?style=for-the-badge&logo=checkmarx&logoColor=white" />
</div>

</details>

<details open>
<summary><b>🎨 Step 2: Get the Frontend Running</b></summary>
<br>

```bash
# Open a new terminal and navigate to the frontend folder
cd frontend

# Install all the frontend dependencies
npm install

# Start the development server
npm run dev
```

✅ Your frontend is now running at **http://localhost:5173/**

<div align="center">
<img src="https://img.shields.io/badge/Frontend-Running-10B981?style=for-the-badge&logo=checkmarx&logoColor=white" />
</div>

**🎉 Visit it in your browser and you're ready to go!**

</details>

---

## 📁 Project Structure

```
trainrup/
├── 🧠 server/          # Backend (Django + Python)
│   ├── authentication/ # User login & security
│   ├── clients/        # Client management
│   ├── bookings/       # Session scheduling
│   ├── payments/       # Payment processing
│   └── analytics/      # Business insights
│
├── 🎨 frontend/        # Frontend (React + TypeScript)
│   ├── pages/          # All the screens you see
│   ├── components/     # Reusable UI pieces
│   └── services/       # API communication
│
└── 📚 docs/            # Documentation & guides
```

---

## 🔧 Configuration & Setup

### Environment Variables

Create a `.env` file in the `server/` directory with your settings:

```bash
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
```

For the frontend, create a `.env.local` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
GEMINI_API_KEY=your-gemini-api-key
```

📝 **Tip:** Check `server/.env.example` for all available options!

---

## 🧪 Testing

<table>
<tr>
<td width="50%">

### 🔧 Backend Tests

```bash
python server/manage.py test
```

<img src="https://img.shields.io/badge/Django-Tests-092E20?style=flat-square&logo=django&logoColor=white" />

</td>
<td width="50%">

### 🎨 Frontend Tests

```bash
cd frontend
npm test
```

<img src="https://img.shields.io/badge/React-Tests-61DAFB?style=flat-square&logo=react&logoColor=black" />

</td>
</tr>
</table>

---

## 🚀 Deployment

Ready to take TrainrUp live? Check out our detailed deployment guide in `docs/DEPLOYMENT.md`.

Quick tips:
- Set `DJANGO_DEBUG=False` in production
- Use a proper database (PostgreSQL recommended)
- Serve frontend files through a CDN
- Set up proper environment variables

---

## 🤝 Contributing

<div align="center">

<img src="https://img.shields.io/badge/Contributions-Welcome-10B981?style=for-the-badge&logo=github&logoColor=white" />

</div>

We love contributions! Here's how you can help:

<table>
<tr>
<td>

**1️⃣ Fork**  
Fork this repository

</td>
<td>

**2️⃣ Branch**  
`git checkout -b feature/amazing`

</td>
<td>

**3️⃣ Code**  
Make your changes

</td>
</tr>
<tr>
<td>

**4️⃣ Test**  
Ensure everything works

</td>
<td>

**5️⃣ Commit**  
`git commit -m 'Add feature'`

</td>
<td>

**6️⃣ Push**  
`git push origin feature/amazing`

</td>
</tr>
</table>

<div align="center">

**7️⃣ Open a Pull Request and we'll review it! 🚀**

</div>

---

## 📚 Additional Resources

<div align="center">

<table>
<tr>
<td align="center">
<a href="docs/API_DOCUMENTATION.md">
<img src="https://img.shields.io/badge/📖_API-Documentation-10B981?style=for-the-badge" />
</a>
</td>
<td align="center">
<a href="docs/ARCHITECTURE.md">
<img src="https://img.shields.io/badge/🏗️_Architecture-Guide-059669?style=for-the-badge" />
</a>
</td>
</tr>
<tr>
<td align="center">
<a href="docs/FEATURE_GUIDE.md">
<img src="https://img.shields.io/badge/🎯_Feature-Guide-10B981?style=for-the-badge" />
</a>
</td>
<td align="center">
<a href="docs/DEPLOYMENT.md">
<img src="https://img.shields.io/badge/🚀_Deployment-Guide-059669?style=for-the-badge" />
</a>
</td>
</tr>
</table>

</div>

---

## 💬 Need Help?

<div align="center">

<table>
<tr>
<td align="center" width="33%">

### 🐛 Bug Reports
[Open an Issue](../../issues)  
Found something broken?

</td>
<td align="center" width="33%">

### 💡 Feature Ideas
[Start a Discussion](../../discussions)  
Have a suggestion?

</td>
<td align="center" width="33%">

### 🎥 YouTube
[@TrainrUp](https://youtube.com/@TrainrUp)  
Watch tutorials & updates

</td>
</tr>
</table>

<img src="https://img.shields.io/badge/Email-trainer@trainrup.fit-10B981?style=for-the-badge&logo=gmail&logoColor=white" />

</div>

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.

---

<div align="center">

<img src="https://img.shields.io/badge/Built_with-❤️-FF0000?style=for-the-badge" />
<img src="https://img.shields.io/badge/by-TrainrUp_Team-10B981?style=for-the-badge" />

### Helping trainers focus on what they do best — training! 💪

<p>
  <a href="https://youtube.com/@TrainrUp">
    <img src="https://img.shields.io/badge/Subscribe-YouTube-FF0000?style=social&logo=youtube" />
  </a>
  <img src="https://img.shields.io/github/stars/am-muhwezi/gym-app?style=social" />
  <img src="https://img.shields.io/github/forks/am-muhwezi/gym-app?style=social" />
</p>

<br>

**If you find TrainrUp helpful, give us a ⭐ star!**

<br>

<img src="https://img.shields.io/badge/Made_in-2025-10B981?style=flat-square" />
<img src="https://img.shields.io/badge/License-MIT-059669?style=flat-square" />
<img src="https://img.shields.io/badge/Status-Active-10B981?style=flat-square" />

---

*Empowering Personal Trainers Worldwide* 🌍

</div>
