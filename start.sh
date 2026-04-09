#!/bin/bash

echo "🚀 Starting Creinx Attendance System..."
echo ""

# Function to run in background
run_service() {
  local name=$1
  local dir=$2
  local cmd=$3

  echo "Starting $name..."
  cd "$dir"
  eval "$cmd" &
  LOCAL_PID=$!
  echo "✅ $name started (PID: $LOCAL_PID)"
}

# Kill services on exit
cleanup() {
  echo ""
  echo "Stopping services..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  echo "Done!"
}

trap cleanup EXIT

# Start Backend
run_service "Backend" "/c/Users/Guru/Desktop/Creinx_Attendance" "npm run dev"
BACKEND_PID=$LOCAL_PID
sleep 2

# Start Frontend
run_service "Frontend" "/c/Users/Guru/Desktop/Creinx_Attendance/frontend" "npm start"
FRONTEND_PID=$LOCAL_PID

echo ""
echo "════════════════════════════════════════════════"
echo "✨ Creinx Attendance System is Running!"
echo "════════════════════════════════════════════════"
echo ""
echo "📋 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:5001/api"
echo ""
echo "🔐 Test Credentials:"
echo "   Admin: admin@company.com / admin123"
echo "   Employee: john@company.com / emp123"
echo ""
echo "Press Ctrl+C to stop services"
echo "════════════════════════════════════════════════"
echo ""

# Keep script running
wait $BACKEND_PID
wait $FRONTEND_PID
