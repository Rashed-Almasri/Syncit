# Syncit

Syncit is a full-stack collaborative coding platform featuring a Spring Boot backend and a React frontend. It enables real-time code editing, user authentication, and project management.

## Features

- **User Authentication:** Secure login and registration with JWT-based sessions.
- **Real-Time Collaboration:** Multiple users can edit code simultaneously.
- **Project Management:** Create, edit, and manage coding projects and files.
- **Multi-language Support:** Syntax highlighting for various programming languages.
- **Responsive UI:** Modern, mobile-friendly interface built with Tailwind CSS.

---

## Project Structure

```
syncit/
├── syncit-backend/      # Spring Boot backend (Java)
│   ├── src/
│   ├── pom.xml
│   └── ...
└── syncit-frontend/     # React frontend (JavaScript)
    ├── src/
    ├── package.json
    └── ...
```

---

## Getting Started

### Prerequisites

- **Java 17+**
- **Node.js 18+ & npm**
- **MySQL or PostgreSQL database**

---

### Backend Setup

1. **Configure Environment Variables**

   Create a `.env` file or set the following variables in your environment:

   ```
   SPRING_APPLICATION_NAME=Syncit
   DB_URL=jdbc:mysql://localhost:3306/syncit
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_DRIVER=com.mysql.cj.jdbc.Driver
   SERVER_ADDRESS=localhost
   SERVER_PORT=8080
   JWT_SECRET_KEY=your_jwt
   JPA_DDL=update
   JPA_SHOW_SQL=true
   JPA_DIALECT=org.hibernate.dialect.MySQL8Dialect
   ```

2. **Install Dependencies & Build**

   ```sh
   cd syncit-backend
   ./mvnw clean install
   ```

3. **Run the Backend**

   ```sh
   ./mvnw spring-boot:run
   ```

   The backend will start on `http://localhost:8080` by default.

---

### Frontend Setup

1. **Configure Environment Variables**

   Create a `.env` file in `syncit-frontend/`:

   ```
   REACT_APP_BACKEND_URL=http://localhost:8080
   ```

2. **Install Dependencies**

   ```sh
   cd syncit-frontend
   npm install
   ```

3. **Run the Frontend**

   ```sh
   npm start
   ```

   The frontend will start on `http://localhost:3000`.

---

## Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Register a new account or log in.
3. Create or join a project to start collaborating in real time.

---

## Technologies Used

- **Backend:** Spring Boot, Spring Security, JPA, MySQL/PostgreSQL
- **Frontend:** React, Tailwind CSS, Monaco Editor, WebSockets
- **Other:** JWT for authentication

---

## Development

- **Backend:** `syncit-backend/`
- **Frontend:** `syncit-frontend/`

---

## License

This project is licensed under the MIT License.
