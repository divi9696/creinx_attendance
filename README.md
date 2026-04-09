# Creinx Attendance Management System

A comprehensive attendance management solution that combines geolocation tracking and IP validation to ensure accurate employee attendance records.

## Project Overview

This system consists of two main components:

- **Backend**: Node.js/Express API with MySQL database
- **Frontend**: React-based user interface

## Features

### Core Features
- Employee authentication and role-based access control
- Real-time attendance marking with GPS geolocation
- IP address validation and tracking
- Attendance history and reporting
- Admin dashboard for monitoring

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- IP whitelisting
- Geofencing validation
- CORS protection

## Project Structure

See the directory structure at the root of this project.

## Installation

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Database Setup
```bash
# Import schema
mysql -u root -p < database/schema.sql

# Seed initial data
mysql -u root -p < database/seed.sql
```

### Environment Configuration
Create a `.env` file in the root directory:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=attendance
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Running the Application

### Development Mode

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### Production Mode

Backend:
```bash
npm start
```

Frontend:
```bash
cd frontend
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Employee Routes
- `POST /api/employee/attendance` - Mark attendance
- `GET /api/employee/history/:employeeId` - Get attendance history
- `GET /api/employee/profile/:employeeId` - Get employee profile

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/report` - Get attendance report

## Technologies Used

### Backend
- Node.js
- Express.js
- MySQL
- JWT
- bcrypt
- geoip-lite

### Frontend
- React 18
- React Router
- CSS3
- Axios

## Default Credentials

```
Email: admin@company.com
Password: hashed_password (from database)
```

## Future Enhancements

- Mobile app support
- SMS notifications
- Calendar view for attendance
- Leave management
- Performance analytics
- Biometric integration

## License

MIT

## Support

For issues and questions, please refer to the documentation or contact the development team.
