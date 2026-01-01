# Community Help Portal - Frontend

## Setup Instructions

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Configure Backend API

Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### 3. Run the Application

Development mode:
```bash
npm start
```

Production build:
```bash
npm run build
```

Application runs on: `http://localhost:4200`

## Admin Login Credentials

```
Email: admin@portal.com
Password: Admin@123
```

**Admin Features:**
- User management (view, block/unblock users)
- Help request monitoring
- User reports management
- Analytics dashboard

## Test User Accounts

Create accounts through the registration page with these roles:

**Resident Account:**
- Can submit help requests
- Chat with helpers
- Report issues

**Helper Account:**
- View and accept help requests
- Manage tasks
- Chat with residents
