#!/bin/bash
set -euo pipefail

# Автоматически создаём структуру, если её нет
mkdir -p src/main
[ -d server ] && mv server src/main/ || true
[ -d public ] && mv public src/main/ || true
[ -f package.json ] && mv package.json src/main/ || true

# Устанавливаем зависимости
cd src/main && npm install