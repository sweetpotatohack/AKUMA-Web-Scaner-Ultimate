import re

# Читаем файл
with open('app.py', 'r') as f:
    content = f.read()

# Заменяем команды на использование переменных путей
replacements = [
    (r'f"httpx ', r'f"{HTTPX_PATH} '),
    (r'f"nuclei ', r'f"{NUCLEI_PATH} '),
    (r'f"dirsearch ', r'f"{DIRSEARCH_PATH} '),
    (r'f"whatweb ', r'f"{WHATWEB_PATH} '),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Записываем обратно
with open('app.py', 'w') as f:
    f.write(content)

print("Fixed tool paths in app.py")
