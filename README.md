# Chronos Productivity Suite

A complete productivity application with an interactive calendar, smart reminders, event scheduling, quick breaks (Pomodoro, 20-20-20 eye strain reset, desk stretches, box breathing), and daily productivity quotes.

This repository includes both:
1. **Interactive Web App** (React 19 + TypeScript + Vite) running directly in the AI Studio environment on port 3000.
2. **Angular Architecture** (Angular 19 Standalone Components + Signals) located in `/angular-app/`.
3. **Java Spring Boot + MySQL Backend** located in `/backend-java/`.

---

## 1. Running the Angular Application (`/angular-app/`)

### Prerequisites
- Node.js 18+ installed
- Angular CLI installed globally:
  ```bash
  npm install -g @angular/cli
  ```

### Steps to Run Angular Frontend
```bash
cd angular-app
npm install
ng serve --port 4200
```
Then open your browser to **http://localhost:4200**.

### Angular Architecture Overview
- **`src/app/models/productivity.models.ts`**: TypeScript types for `CalendarEvent`, `Reminder`, `Quote`, and `DailyStats`.
- **`src/app/services/productivity.service.ts`**: Angular 19 Signals-based reactive state with `signal()`, `computed()`, and LocalStorage persistence.
- **`src/app/services/audio.service.ts`**: Web Audio API synthesizer for meditation singing bowls and completion chimes, plus Web Speech API for quote reading.
- **`src/app/components/`**: Standalone components:
  - `navigation.component.ts`: Header bar following the 3-zone contract.
  - `dashboard.component.ts`: 4-metric strip, daily agenda, quote spotlight, and quick actions.
  - `calendar.component.ts`: Month grid, day navigation, and event overlay.
  - `reminders.component.ts`: Filterable task list with 1-click completion and snooze.
  - `quick-breaks.component.ts`: Focus timer & 20-20-20 eye strain break.
  - `quotes.component.ts`: Curated quote board with text-to-speech audio reader.
  - `quick-add-modal.component.ts`: Unified modal to schedule events or add reminders.

---

## 2. Running the Java Spring Boot + MySQL Backend (`/backend-java/`)

### Prerequisites
- **JDK 17** or higher
- **Maven 3.8+**
- **MySQL 8.0+** running on `localhost:3306`

### Database Setup
Execute the SQL script in MySQL Workbench or terminal:
```bash
mysql -u root -p < backend-java/src/main/resources/schema.sql
```

### Configure Credentials
Update `backend-java/src/main/resources/application.properties` with your MySQL password:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### Start the Spring Boot Backend
```bash
cd backend-java
mvn clean spring-boot:run
```
The REST API will start at **http://localhost:8080/api** with full CORS enabled for Angular (`http://localhost:4200`).

---

## 3. Running the Root React Application

```bash
npm install
npm run dev
```
Open **http://localhost:3000**.
