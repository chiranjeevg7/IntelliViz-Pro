# 🚀 IntelliViz Pro – AI-Powered Data Analytics Platform

> Transform raw datasets into meaningful insights with an intelligent, full-stack analytics platform featuring interactive visualizations, automated data cleaning, secure authentication, and modern dashboards.

![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-API-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Plotly](https://img.shields.io/badge/Plotly-Interactive%20Charts-3F4F75?logo=plotly)
![Chart.js](https://img.shields.io/badge/Chart.js-Visualizations-FF6384?logo=chartdotjs)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📖 Overview

**IntelliViz Pro** is a modern **full-stack AI-powered data analytics platform** designed to simplify data exploration, visualization, and reporting. Built with **React**, **Node.js**, **Express.js**, and **MongoDB**, it provides a secure, responsive, and scalable environment where users can upload datasets, clean data, generate interactive charts, and obtain analytical insights through an intuitive dashboard.

Unlike the original **IntelliViz v1**, which was developed using Streamlit, IntelliViz Pro adopts a production-style SaaS architecture with separate frontend and backend applications, user authentication, persistent storage, and a significantly enhanced user experience.

---

# 🌐 Live Demo

**Application**

https://intelliviz-pro.vercel.app/

---

# 💻 GitHub Repository

https://github.com/chiranjeevg7/IntelliViz-Pro

---

# 📸 Screenshots

```md
![Dashboard](screenshots/dashboard.png)

![Visualization](screenshots/visualization.png)
```

---

# ✨ Features

## 🔐 Secure Authentication

* User Registration
* Secure Login
* JWT Authentication
* Protected Routes
* Session Management

---

## 📊 Interactive Dashboard

A modern dashboard providing quick access to:

* Uploaded datasets
* Recent analyses
* Saved reports
* User profile
* Analytics overview

---

## 📂 Dataset Management

Upload and analyze datasets in multiple formats.

Supported formats:

* CSV (.csv)
* Microsoft Excel (.xlsx)

Features include:

* Dataset Preview
* Row & Column Count
* Data Types
* Missing Value Detection
* Duplicate Detection
* Statistical Summary

---

## 🧹 Data Cleaning

Prepare datasets before analysis with built-in preprocessing tools.

Includes:

* Missing Value Handling
* Duplicate Removal
* Data Validation
* Data Cleaning Summary
* Clean Dataset Preview

---

## 📈 Interactive Visualizations

Generate rich, interactive charts.

Supported charts include:

* Line Chart
* Bar Chart
* Pie Chart
* Scatter Plot
* Histogram
* Heatmap

Features:

* Dynamic axis selection
* Interactive tooltips
* Zoom & Pan
* Responsive charts
* Multiple visualization options

---

## 🧠 Intelligent Analytics

Automatically generate insights from uploaded datasets.

Highlights include:

* Dataset overview
* Numerical analysis
* Categorical analysis
* Correlation insights
* Data quality summary
* Rule-based recommendations

---

## 📄 Report Generation

Generate professional analytical reports.

Export options may include:

* PDF
* CSV
* JSON

Reports summarize:

* Dataset information
* Visualizations
* Statistics
* Analytical insights

---

## 👤 User Profile

Each user can manage:

* Personal account
* Uploaded datasets
* Saved reports
* Account settings

---

# 🛠 Technology Stack

| Category       | Technologies                              |
| -------------- | ----------------------------------------- |
| Frontend       | React, HTML5, CSS3, JavaScript            |
| Backend        | Node.js, Express.js                       |
| Database       | MongoDB                                   |
| Authentication | JWT                                       |
| Charts         | Plotly.js, Chart.js                       |
| Deployment     | Vercel                                    |

---

# 📁 Project Structure

```text
IntelliViz-Pro/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/chiranjeevg7/IntelliViz-Pro.git
```

Move into the project directory.

```bash
cd IntelliViz-Pro
```

---

## Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Start the backend.

```bash
npm start
```

or

```bash
npm run dev
```

---

## Frontend Setup

Open a new terminal.

```bash
cd frontend

npm install

npm start
```

The application will be available at:

```text
http://localhost:3000
```

---

# 🚀 Deployment

Frontend:

* Vercel

Backend:

* Render

Database:

* MongoDB Atlas

---

# 📌 IntelliViz Evolution

| IntelliViz v1         | IntelliViz Pro            |
| --------------------- | ------------------------- |
| Streamlit Application | Full-Stack SaaS Platform  |
| Python Only           | React + Node.js + MongoDB |
| Local Execution       | Web-Based Deployment      |
| No Authentication     | JWT Authentication        |
| Temporary Sessions    | Persistent User Accounts  |
| Single Dashboard      | Multi-Page Application    |
| Limited UI            | Modern Responsive UI      |
| In-Memory Processing  | Database Integration      |

---

# 🎯 Project Highlights

* Full-stack architecture
* Responsive interface
* Secure authentication
* Interactive dashboards
* Dataset management
* Data preprocessing
* Interactive visualizations
* Intelligent analytics
* REST API architecture
* Production-style project structure

---

# 🚧 Future Roadmap

Planned enhancements include:

* 🤖 AI Chat with Data
* 📈 Predictive Analytics
* 🧠 Machine Learning Models
* 📊 Advanced Dashboard Widgets
* ☁ Cloud File Storage
* 📧 Email Reports
* 👥 Team Collaboration
* 🔐 Role-Based Access Control
* 📱 Progressive Web App (PWA)
* 🌍 Multi-language Support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

# 👨‍💻 Developer

**Chiranjeev Radheshyam Gupta**

B.Sc. Information Technology

Mumbai University

GitHub:
https://github.com/chiranjeevg7

---

# 📜 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

Your support helps improve the project and encourages future development.
