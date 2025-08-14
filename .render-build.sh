#!/bin/bash
set -euo pipefail

# Создаем структуру, которую ожидает Render
mkdir -p src/main
mv server public package.json src/main/

# Устанавливаем зависимости
cd src/main && npm install