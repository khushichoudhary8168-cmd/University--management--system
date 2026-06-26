#  University Management System (UMS)

A full-stack **University Management System** built using modern web technologies to streamline academic and administrative workflows. The system supports multiple user roles including Admin, Faculty, Students, and Admission Officers with secure authentication and role-based access.

## Features

###  Authentication & Authorization

* JWT-based secure login system
* Role-based access control (RBAC)
* Protected APIs using Spring Security

###  Admin Module

* Manage departments and courses
* Add and manage faculty
* Approve or reject student registrations
* View dashboards and reports

###  Student Module

* Self-registration with admin approval
* Enroll in courses
* View attendance and marks
* Download marksheets
* Apply for leave

### Faculty Module

* View assigned courses and students
* Mark attendance
* Upload student marks
* Review and approve leave requests

---

##  Tech Stack

### Backend

* Java 17
* Spring Boot 3.2
* Spring Security
* Spring Data JPA
* JWT (JSON Web Token)
* MySQL

### Frontend

* React 18
* Vite
* Axios
* React Router DOM
* HTML, CSS

---

##  Project Structure

```
university-management-system/
│
├── backend/                # Spring Boot backend
│   └── src/main/java/com/university/ums
│
├── frontend/              # React frontend
│   └── ums-frontend/
│
├── README.md
└── .gitignore
```

---

##  Database Design

The system uses a relational database with the following entities:

* User
* Student
* Faculty
* Department
* Course
* Enrollment
* Attendance
* Mark
* LeaveApplication

These entities are mapped using Spring Data JPA.

---

##  Workflow

1. User registers or logs in
2. JWT token is generated and stored
3. Token is sent with each API request
4. Backend validates token and authorizes access
5. User performs role-specific actions

---

##  Getting Started

### Prerequisites

* Java 17+
* Node.js & npm
* MySQL

---

###  Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

---

###  Frontend Setup

```bash
cd frontend/ums-frontend
npm install
npm run dev
```

---

###  Access Application

Open in browser:

```
http://localhost:3000
```

---

##  Screenshots (Optional)


---

##  Resume Description

> Developed a full-stack University Management System using Spring Boot, JWT authentication, MySQL, and React. Implemented role-based access for admin, faculty, and students, including features like student registration approval, course enrollment, attendance tracking, and grade management.

---

## 🔮 Future Enhancements

* Email notifications for approvals and updates
* Advanced analytics dashboard
* Pagination and search filters
* Docker-based deployment
* Microservices architecture

---

## Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

##  License

This project is for educational purposes.

---

##  Author

**Khushi Choudhary**

* Email: khushichoudhary8168@gmail.com
---
