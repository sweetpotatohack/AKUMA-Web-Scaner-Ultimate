<<<<<<< HEAD
FROM python:3.9-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    nmap \
    dnsutils \
    iputils-ping \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Go для инструментов
RUN wget https://go.dev/dl/go1.23.4.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz && \
    rm go1.23.4.linux-amd64.tar.gz

ENV PATH="/usr/local/go/bin:${PATH}"
ENV GOPATH="/go"
ENV PATH="${GOPATH}/bin:${PATH}"

# Устанавливаем Ruby для wpscan
RUN apt-get update && apt-get install -y ruby ruby-dev && rm -rf /var/lib/apt/lists/*

# Устанавливаем Go инструменты
RUN go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest && \
    go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest && \
    go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest && \
    go install -v github.com/ffuf/ffuf@latest

# Устанавливаем wpscan и dirsearch
RUN gem install wpscan

# Устанавливаем whatweb
RUN git clone https://github.com/urbanadventurer/WhatWeb.git /opt/WhatWeb && \
    ln -s /opt/WhatWeb/whatweb /usr/local/bin/whatweb

# Создаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt и устанавливаем Python зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем дополнительные Python пакеты
RUN pip install dirsearch tqdm requests

# Копируем код приложения
COPY . .

# Обновляем nuclei templates
RUN nuclei -update-templates

# Открываем порт
EXPOSE 8000

# Запускаем приложение
CMD ["python", "app.py"]
=======
FROM python:3.11-slim

WORKDIR /app

RUN pip install fastapi uvicorn python-multipart

COPY app.py .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
