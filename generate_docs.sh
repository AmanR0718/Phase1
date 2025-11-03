#!/bin/bash
set -e

echo "📁 Generating documentation files..."

# 1️⃣ Project structure (excluding node_modules, venv, pycache)
echo "📂 Generating project_structure.txt..."
tree -I 'node_modules|__pycache__|venv|.git|.devcontainer' -L 7 > project_structure.txt

# 2️⃣ Python requirements
echo "🐍 Copying backend/requirements.txt..."
cp backend/requirements.txt ./requirements.txt

# 3️⃣ Frontend dependencies (from web-dashboard)
echo "🧩 Extracting dependencies.txt from web-dashboard..."
jq '.dependencies' web-dashboard/package.json > dependencies.txt 2>/dev/null || echo "⚠️ package.json not found"

# 4️⃣ Backend route file listing
echo "🔍 Listing backend routes..."
find backend/app/routes -type f -name "*.py" > backend_routes.txt

# 5️⃣ FastAPI endpoints (using your working Docker command)
echo "⚙️ Extracting FastAPI endpoints..."
docker exec farmer-backend sh -c "python - <<'PY'
from app.main import app
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f\"{route.path} -> {', '.join(route.methods)}\")
PY
" > fastapi_endpoints.txt

# 6️⃣ Frontend API calls (from .ts or .js files)
echo "🌐 Extracting frontend API calls..."
grep -r --include=\*.{js,ts,tsx} -E "fetch\(|axios\.|api/" web-dashboard/src 2>/dev/null > frontend_api_calls.txt || echo "⚠️ No API calls found"

echo ""
echo "✅ All documentation files generated successfully:"
echo "   - project_structure.txt"
echo "   - requirements.txt"
echo "   - dependencies.txt"
echo "   - backend_routes.txt"
echo "   - fastapi_endpoints.txt"
echo "   - frontend_api_calls.txt"
