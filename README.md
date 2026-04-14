# MindSpace - Student Mental Wellness Platform

A full-stack mental wellness platform for students featuring mood tracking, AI-powered journaling, peer support forums, and a wellness library.

## Tech Stack

- **Backend**: Spring Boot 4.x with Java 21
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: OpenRouter API (google/gemma-3n-e2b-it:free)
- **Frontend**: Vanilla JavaScript SPA

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
| `/api/mood/{id}` | PUT | Update mood entry |
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

- Java 21+
- Maven 3.8+
- MySQL 8.0+

### Database Setup

```bash
# Create schema and tables
mysql -u root -p < database/schema.sql

# Seed library resources (real articles, guides, audio)
mysql -u root -p < database/seed_resources.sql

# PowerShell equivalent
Get-Content database/schema.sql | mysql -u root -p
Get-Content database/seed_resources.sql | mysql -u root -p
```

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.application.name=mindspace

# ── Database ──────────────────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/mindspace?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.open-in-view=false

# ── JWT ───────────────────────────────────────────────────────────────────────
# Generate a secure base64 key: openssl rand -base64 64
app.jwt.secret=your-base64-encoded-secret-key
app.jwt.expiration-ms=86400000

# ── AI (OpenRouter) ───────────────────────────────────────────────────────────
app.openrouter.api-key=your-openrouter-api-key
app.openrouter.models=google/gemma-3n-e2b-it:free,minimax/minimax-m2.5:free,meta-llama/llama-4-scout:free,microsoft/mai-ds-r1:free,deepseek/deepseek-r1-0528:free
```

> Get a free OpenRouter API key at https://openrouter.ai
>
> The `models` property is a comma-separated fallback chain — if the first model is rate limited, the service automatically tries the next one. All listed models are free tier. You can add or reorder them as needed.

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
