FROM ubuntu:22.04

# Устанавливаем переменные окружения
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"
ENV GOPATH="/root/go"

# Обновляем систему и устанавливаем минимальные базовые зависимости
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    wget \
    curl \
    unzip \
    tar \
    gzip \
    sudo \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Создаем рабочую директорию
WORKDIR /app

# Копируем полный скрипт установки и код приложения
COPY install_tools_full.sh /app/
COPY . /app/

# Делаем скрипты исполняемыми
RUN chmod +x /app/install_tools_full.sh /app/akuma_scanner.sh

# Запускаем установку всех инструментов
RUN bash /app/install_tools_full.sh

# Устанавливаем основные Python зависимости для FastAPI
RUN pip3 install --no-cache-dir \
    fastapi \
    uvicorn \
    requests \
    beautifulsoup4 \
    lxml \
    python-multipart \
    websockets \
    aiofiles \
    python-nmap \
    dnspython \
    paramiko \
    colorama \
    rich \
    tqdm

# Копируем requirements.txt если есть и устанавливаем дополнительные зависимости
RUN if [ -f requirements.txt ]; then pip3 install --no-cache-dir -r requirements.txt; fi

# Создаем директории для данных и результатов
RUN mkdir -p /app/data /app/results /root/web_scan

# Обновляем шаблоны nuclei если он установлен
RUN if [ -f /root/go/bin/nuclei ]; then /root/go/bin/nuclei -update-templates || echo "⚠ Не удалось обновить шаблоны nuclei"; fi

# Открываем порт
EXPOSE 8000

# Запускаем приложение
CMD ["python3", "app.py"]
