# ✅ Pre-Flight Checklist

Before running the application, verify:

## Prerequisites
- [ ] Node.js installed (`node --version` should show v14+)
- [ ] npm installed (`npm --version` should show v6+)
- [ ] MySQL installed and running
- [ ] Port 3000 is available (frontend)
- [ ] Port 5000 is available (backend)

## Configuration
- [ ] `.env` file exists in project root
- [ ] `DB_PASSWORD` in `.env` is set to your MySQL root password
- [ ] `JWT_SECRET` in `.env` is set
- [ ] `DB_HOST=localhost` (or your MySQL server address)
- [ ] `DB_USER=root` (or your MySQL username)

## File Structure
- [ ] `backend/` folder exists with server files
- [ ] `frontend/` folder exists with React app
- [ ] `database/` folder exists with SQL files
- [ ] `.env` file is in the root

## Startup Scripts
- [ ] `run-all.bat` exists (one-click setup)
- [ ] `start-backend.bat` exists
- [ ] `start-frontend.bat` exists
- [ ] `setup-db.bat` exists

## Dependencies
- [ ] Backend dependencies installed (`node backend/server.js` should not show "Module not found")
- [ ] Frontend dependencies installed (`npm -g list` shows packages)

---

## 🚀 Ready to Start?

Choose one:

### Quick Start (Recommended)
```
Double-click: run-all.bat
```

### Manual Setup
1. Double-click: `setup-db.bat` (setup database)
2. Double-click: `start-backend.bat` (terminal 1)
3. Double-click: `start-frontend.bat` (terminal 2)
4. Open: http://localhost:3000

---

## 📝 Notes

- Backend runs on **http://localhost:5000**
- Frontend runs on **http://localhost:3000**
- You can close the terminal windows to stop the servers
- Refresh browser if frontend doesn't load
- Check MySQL is running if database setup fails

---

## 🔐 Default Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Employee | john@company.com | emp123 |
| Employee | jane@company.com | emp123 |

---

**All systems go? Click `run-all.bat` and start testing!** ✨
