# 🚗 University Car Request System (UCRS)

## 📌 Project Overview

The **University Car Request System (UCRS)** is a full-stack web-based transportation management platform designed to streamline vehicle reservation, approval, and fleet management within a university environment.

The system allows staff to request vehicles, transport officers to approve and assign vehicles and drivers, and drivers to manage assigned trips. Administrators can manage user accounts, view analytics, and oversee the entire system.

This project is developed as a **graduation project at Wallaga University**.

---

# 🎯 Objectives

The main objective of the system is to **digitize and automate transportation request management** inside universities.

Specific objectives include:

- Automate vehicle request submission
- Manage fleet and drivers
- Implement role-based access control
- Prevent vehicle double booking
- Track trip status and maintenance
- Provide analytics and reporting

---

# 👥 User Roles

The system supports four main roles:

### 1️⃣ Admin
- Create and manage user accounts
- View all system data
- Manage vehicles
- Monitor dashboard analytics

### 2️⃣ Staff
- Submit transportation requests
- View request status
- View request history

### 3️⃣ Transport Officer
- View pending requests
- Approve or reject requests
- Assign vehicles
- Assign drivers
- Monitor fleet status

### 4️⃣ Driver
- View assigned trips
- Update trip status
- Report vehicle maintenance issues

---

# 🏗 System Architecture

The system follows a **three-tier architecture**:

1️⃣ **Frontend Layer**
- Next.js
- Tailwind CSS

2️⃣ **Backend Layer**
- Node.js
- Express.js
- REST API

3️⃣ **Database Layer**
- MongoDB Atlas

---

# 🛠 Technology Stack

## Frontend
- Next.js
- Tailwind CSS
- React

## Backend
- Node.js
- Express.js
- JWT Authentication

## Database
- MongoDB Atlas

## Deployment
- Vercel (Frontend)
- Render / Railway (Backend)

---

# 🔐 Key Features

- Role-Based Access Control (RBAC)
- Secure Authentication (JWT)
- Vehicle Request Management
- Driver Assignment System
- Fleet Management
- Maintenance Reporting
- Dashboard Analytics
- Activity Logs

---

# 📊 System Modules

- Authentication & Role Management
- Staff Request System
- Transport Approval System
- Driver Dashboard
- Fleet Management
- Reports & Analytics
- Admin Management

---

# 📁 Project Structure

```
UCRS-project
│
├── frontend (Next.js)
│   ├── pages
│   ├── components
│   ├── styles
│
├── backend (Node.js + Express)
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│
└── database
    └── MongoDB Atlas
```

---

# ⚙️ Installation

Clone the repository:

```
git clone https://github.com/yourusername/UCRS-project.git
```

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

---

# 📚 Academic Information

University: **Wallaga University**  
Department: **Electrical and Computer Engineering**  
Project Title: **University Car Request System (UCRS)**  
Student: **Yohanis Dunfa**

---

# 🚀 Future Improvements

- GPS vehicle tracking
- Mobile application
- SMS notifications
- AI-based vehicle scheduling
- Maintenance prediction system

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Yohanis Dunfa**

Graduation Project – Wallaga University  
Department of Electrical and Computer Engineering
