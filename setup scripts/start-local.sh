#!/usr/bin/env bash

# ========================================================
# SIMS - School Information Management System Launcher
# Target: Wycherley International School, Gampaha
# ========================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================================"
echo "  Starting SIMS Local Development Environment"
echo "========================================================"
echo ""

# 1. Check Java
if ! command -v java &> /dev/null; then
    if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
        export PATH="$JAVA_HOME/bin:$PATH"
    else
        echo "[ERROR] Java is not found in PATH or JAVA_HOME."
        exit 1
    fi
fi

# 2. Check Node / npm
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not found in PATH."
    exit 1
fi

echo "[1/2] Launching Spring Boot Backend (:8080)..."
cd "$PROJECT_ROOT/server"
chmod +x mvnw 2>/dev/null || true
./mvnw spring-boot:run &
BACKEND_PID=$!

echo "[2/2] Launching React Vite Frontend (:5173)..."
cd "$PROJECT_ROOT/client"
npm run dev &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both background processes gracefully
cleanup() {
    echo ""
    echo "Shutting down SIMS local servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    echo "All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo ""
echo "========================================================"
echo "  SIMS is Running!"
echo "========================================================"
echo "  - Backend  : http://localhost:8080/api/v1 (PID: $BACKEND_PID)"
echo "  - Frontend : http://localhost:5173        (PID: $FRONTEND_PID)"
echo ""
echo "  Credentials:"
echo "  - Admin    : admin / admin123"
echo "  - Academic : head_academic / academic123"
echo "  - Teacher  : teacher1 / teacher123"
echo "  - Student  : student1 / student123"
echo "  - Parent   : parent1 / parent123"
echo "========================================================"
echo "Press Ctrl+C to stop all services."
echo ""

# Wait for both processes
wait
