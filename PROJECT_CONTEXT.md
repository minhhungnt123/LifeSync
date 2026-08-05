
# PROJECT_CONTEXT.md

> Canonical context file for AI Agents.

## Project
- Name: LifeSync AI
- Type: Full-stack Web Application
- Status: Planning (MVP)
- Goal: Personal time management platform with AI assistant using user data.

## Vision
Build an AI-first personal productivity platform that manages schedules, meals, and provides personalized insights from user-owned data.

## Tech Stack
### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- FullCalendar
- Recharts

### Backend
- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Maven

### Database
- PostgreSQL

### AI
- OpenAI API (initial)
- RAG + LangChain4j (future)

## Architecture
React SPA
    |
REST API
    |
Spring Boot
    |
PostgreSQL
    |
AI Service
    |
LLM

## Core Modules
1. Authentication
2. Time Management
3. Meal Management
4. Dashboard & Analytics
5. AI Assistant

## AI Responsibilities
- Answer using user database.
- Summarize daily/weekly/monthly activity.
- Recommend schedule improvements.
- Analyze productivity.
- Analyze eating habits.
- Never invent user data.

## Functional Scope (MVP)
- User authentication
- CRUD schedules
- CRUD meals
- Calendar
- Dashboard
- AI chatbot

## Out of Scope
- Payments
- Social features
- Team collaboration
- Medical diagnosis
- Smartwatch sync
- Native mobile app

## Coding Standards
- Clean Architecture
- SOLID
- RESTful APIs
- DTO separation
- Repository-Service-Controller pattern
- Validation everywhere
- Global exception handler

## Folder Structure
frontend/
backend/
docs/

## Definition of Done
- Feature implemented
- Unit tested where applicable
- API documented
- No critical bugs
- Responsive UI

## Agent Instructions
When generating code:
1. Reuse existing architecture.
2. Avoid duplicated logic.
3. Prefer composition over inheritance.
4. Keep business logic in services.
5. Do not put business logic in controllers.
6. Keep components reusable.
7. Follow naming conventions.
8. Ask before changing architecture.

## Naming
Entity: PascalCase
DTO: XxxRequest/XxxResponse
Controller: XxxController
Service: XxxService
Repository: XxxRepository

## Future Features
- Habit tracker
- Pomodoro
- Mood tracking
- Notification engine
- PDF reports
- Voice assistant
- Wearable integration
