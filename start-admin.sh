#!/usr/bin/env bash

set -e

PROJECT_DIR="/Users/a1/develop/vibecoding/sjg"
FRONTEND_PORT=5173

echo "=== 启动 SJG 项目（前端部分） ==="

cd "${PROJECT_DIR}/admin-frontend"
npm run dev &
FRONTEND_PID=$!

sleep 6

echo "前端已启动: http://localhost:${FRONTEND_PORT}"
echo "前端 PID: ${FRONTEND_PID}"
echo ""
echo "后端暂未启动，因为 backend 有编译错误，需要先修复。"
