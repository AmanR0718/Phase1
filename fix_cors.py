import re

# Read the file
with open('backend/app/main.py', 'r') as f:
    content = f.read()

# New CORS configuration
new_cors = '''app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.app.github.dev",
        "https://*.github.dev",
        "https://*.githubpreview.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)'''

# Find and replace the CORS middleware section
pattern = r'app\.add_middleware\s*\(\s*CORSMiddleware,.*?\)'
content = re.sub(pattern, new_cors, content, flags=re.DOTALL)

# Write back
with open('backend/app/main.py', 'w') as f:
    f.write(content)

print("✅ CORS configuration updated!")
