#!/bin/bash

# 地图打卡系统 HTTPS 服务器启动脚本

echo "🚀 启动地图打卡系统 HTTPS 服务器..."

# 检查是否安装了 Python
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python3 启动服务器"
    python3 -m http.server 8000 --bind 127.0.0.1
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 启动服务器"
    python -m http.server 8000 --bind 127.0.0.1
else
    echo "❌ 未找到 Python，请安装 Python 或使用其他方法"
    exit 1
fi

echo "📍 服务器地址: http://localhost:8000"
echo "⚠️  注意：HTTP 环境可能无法使用地理位置功能"
echo "🛑 按 Ctrl+C 停止服务器"

