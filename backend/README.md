# GetNutrition Backend

Boilerplate backend service for the GetNutrition app, built using Express, TypeScript, Mongoose (MongoDB), and Zod.

## Project Structure

```
backend/
├── src/
│   ├── app.ts                  # Express application setup
│   ├── server.ts               # HTTP Server entry point
│   ├── config/
│   │   ├── env.ts              # Zod schema for validated environment variables
│   │   └── database.ts         # Mongoose connection utility
│   ├── modules/
│   │   ├── auth/               # User Authentication (JWT, bcryptjs)
│   │   ├── users/              # User profiles & management
│   │   ├── nutrition/          # TDEE & macro configuration calculation engine
│   │   ├── foods/              # Foods database
│   │   ├── pantry/             # User pantry stock
│   │   ├── recipes/            # Recipe database
│   │   ├── meal-plans/         # Generated/Saved meal plans
│   │   ├── meal-logs/          # User daily food logs
│   │   ├── progress/           # Weight and macro progress tracking
│   │   └── recommendations/    # Recommender engines (Constraint, Scoring, Optimizer, etc.)
│   ├── database/
│   │   ├── models/             # Mongoose schemas/models
│   │   └── seed/               # Initial database seed scripts
│   ├── middleware/             # Shared middleware (auth, error-handling, logger)
│   ├── utils/                  # Helper utilities
│   └── tests/                  # Integration and unit tests
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (a template is provided).

### Running the App
- **Development mode** (with auto-reload):
  ```bash
  npm run dev
  ```
- **Production build**:
  ```bash
  npm run build
  npm start
  ```

### Running Tests
```bash
npm test
```
