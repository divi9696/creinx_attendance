require('dotenv').config();
const app = require('./app');
const setupDatabase = require('./db-setup');

// Initialize database
setupDatabase();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🚀 Creinx Attendance System`);
  console.log(`📍 Backend running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend running on http://localhost:3000`);
  console.log(`\n✨ Server ready for requests!\n`);
});

