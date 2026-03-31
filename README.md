# MindSpace - Student Mental Wellness Platform

A full-stack mental wellness platform for students featuring mood tracking, AI-powered journaling, peer support forums, and a wellness library.

## Tech Stack

- **Backend**: Spring Boot 3.x with Java 17
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Google Gemini API for journal reflections
- **Frontend**: Vanilla JavaScript SPA (separate repo)

## Features

- **Authentication**: Register, login, logout with JWT tokens
- **Mood Tracking**: Log mood (1-5 scale) with factors (Stress, Sleep, Exams, etc.)
- **AI Journal**: Private journal entries with AI-powered reflections (summarize, reframe, suggest)
- **Peer Forum**: Anonymous posts with tags, replies, and support reactions
- **Wellness Library**: Browse categorized wellness resources (articles, videos, guides, audio)

## Project Structure

```
mwms/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── config/         # CORS configuration
│   │   ├── controller/    # REST controllers (Auth, Mood, Journal, Forum, Library)
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── exception/     # Custom exceptions and global handler
│   │   ├── model/         # JPA entities
│   │   ├── repository/    # Spring Data JPA repositories
│   │   ├── security/      # JWT, SecurityConfig, UserDetails
│   │   └── service/       # Business logic services
│   └── src/main/resources/
│       ├── application.properties
│       └── application-local.properties
├── database/
│   └── schema.sql          # MySQL schema with seed data
└── frontend/
    ├── index.html         # Login page
    ├── register.html     # Registration page
    ├── dashboard.html    # Main dashboard
    ├── mood.html         # Mood tracker
    ├── journal.html      # AI journal
    ├── forum.html        # Peer forum
    ├── library.html      # Wellness library
    ├── css/app.css       # Styles
    └── js/               # Frontend JavaScript modules
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout (revoke token) |
| `/api/mood` | GET | Get user's mood entries |
| `/api/mood` | POST | Create mood entry |
| `/api/journal` | GET | Get user's journal entries |
| `/api/journal/{id}` | GET | Get single journal entry |
| `/api/journal` | POST | Create journal entry |
| `/api/journal/{id}` | PUT | Update journal entry |
| `/api/journal/{id}` | DELETE | Delete journal entry |
| `/api/journal/ai` | POST | AI reflection (summarize/reframe/suggest) |
| `/api/forum/posts` | GET | Get forum posts |
| `/api/forum/posts` | POST | Create forum post |
| `/api/forum/posts/{id}/support` | POST | Toggle support on post |
| `/api/forum/posts/{id}/replies` | GET | Get replies for post |
| `/api/forum/posts/{id}/replies` | POST | Create reply |
| `/api/library/resources` | GET | Get wellness resources |
| `/api/library/categories` | GET | Get resource categories |

## Setup

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8.0+

### Database Setup

```bash
mysql -u root -p < database/schema.sql

# power shell
Get-Content database/schema.sql | mysql -u root -p

# OR Manually import/run the sql script in you sql client or workbenck
```

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mindspace
spring.datasource.username=your_username
spring.datasource.password=your_password

app.jwt.secret=your-jwt-secret-key
app.jwt.expiration-ms=86400000
app.gemini.api-key=your-gemini-api-key
```

### Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API runs at `http://localhost:8080/api`

### Frontend

Serve the frontend files with any static server:

```bash
# Using Python
cd frontend
python -m http.server 5500

# Or using Node.js
npx serve .

# OR (simplest) using live server extension
```

Access at `http://127.0.0.1:5500`

## Security

- JWT Bearer token authentication
- Passwords hashed with BCrypt
- Token revocation on logout
- CORS enabled for `localhost:3000` and `127.0.0.1:5500`
