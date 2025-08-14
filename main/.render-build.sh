#!/bin/bash
set -euo pipefail

# Создаём структуру, которую ожидает Render
mkdir -p src/main
mv server public package.json src/main/