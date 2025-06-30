# 🚀 AKUMA Web Scanner - Deployment Guide

## Production Deployment Options

### 1. Docker Compose (Recommended for small-medium deployments)

#### Single Server Deployment
```bash
# Clone repository
git clone https://github.com/your-username/AKUMA_Web_Scanner.git
cd AKUMA_Web_Scanner

# Run installation script
chmod +x scripts/install.sh
./scripts/install.sh

# Services will be available at:
# Frontend: http://your-server:3001
# API: http://your-server:8001
```

#### Production Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  backend:
    build: ./backend
    expose:
      - "8000"
    volumes:
      - ./reports:/app/reports
      - ./logs:/app/logs
    environment:
      - DEBUG=false
      - LOG_LEVEL=WARNING
    restart: unless-stopped

  frontend:
    build: ./frontend
    expose:
      - "80"
    restart: unless-stopped

  redis:
    image: redis:alpine
    restart: unless-stopped
```

### 2. Kubernetes Deployment

#### Namespace and ConfigMap
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: akuma-scanner

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: akuma-config
  namespace: akuma-scanner
data:
  DEBUG: "false"
  LOG_LEVEL: "INFO"
  MAX_CONCURRENT_SCANS: "10"
```

#### Backend Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: akuma-backend
  namespace: akuma-scanner
spec:
  replicas: 3
  selector:
    matchLabels:
      app: akuma-backend
  template:
    metadata:
      labels:
        app: akuma-backend
    spec:
      containers:
      - name: backend
        image: akuma-scanner/backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: akuma-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: akuma-backend-service
  namespace: akuma-scanner
spec:
  selector:
    app: akuma-backend
  ports:
  - port: 8000
    targetPort: 8000
```

#### Frontend Deployment
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: akuma-frontend
  namespace: akuma-scanner
spec:
  replicas: 2
  selector:
    matchLabels:
      app: akuma-frontend
  template:
    metadata:
      labels:
        app: akuma-frontend
    spec:
      containers:
      - name: frontend
        image: akuma-scanner/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: akuma-frontend-service
  namespace: akuma-scanner
spec:
  selector:
    app: akuma-frontend
  ports:
  - port: 80
    targetPort: 80
```

#### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: akuma-ingress
  namespace: akuma-scanner
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - scanner.yourdomain.com
    secretName: akuma-tls
  rules:
  - host: scanner.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: akuma-backend-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: akuma-frontend-service
            port:
              number: 80
```

### 3. Cloud Deployment

#### AWS ECS with Fargate
```json
{
  "family": "akuma-scanner",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "akuma-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/akuma-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "DEBUG", "value": "false"},
        {"name": "LOG_LEVEL", "value": "INFO"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/akuma-scanner",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Google Cloud Run
```yaml
# gcloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: akuma-scanner
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 10
      containers:
      - image: gcr.io/your-project/akuma-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DEBUG
          value: "false"
        resources:
          limits:
            cpu: 2
            memory: 4Gi
```

### 4. Security Configuration

#### SSL/TLS Setup with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d scanner.yourdomain.com

# Auto-renewal cron job
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Security Configuration
```nginx
# nginx/security.conf
server {
    listen 443 ssl http2;
    server_name scanner.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/scanner.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scanner.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://frontend:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name scanner.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Monitoring and Logging

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'akuma-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: /metrics
    scrape_interval: 30s
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "AKUMA Scanner Metrics",
    "panels": [
      {
        "title": "Active Scans",
        "type": "stat",
        "targets": [
          {
            "expr": "akuma_active_scans_total"
          }
        ]
      },
      {
        "title": "Scan Completion Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(akuma_scans_completed_total[5m])"
          }
        ]
      }
    ]
  }
}
```

#### Log Aggregation with ELK Stack
```yaml
# monitoring/docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
```

### 6. High Availability Setup

#### Load Balancer Configuration
```nginx
# nginx/load-balancer.conf
upstream akuma_backend {
    least_conn;
    server backend1:8000 max_fails=3 fail_timeout=30s;
    server backend2:8000 max_fails=3 fail_timeout=30s;
    server backend3:8000 max_fails=3 fail_timeout=30s;
}

upstream akuma_frontend {
    server frontend1:80;
    server frontend2:80;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://akuma_backend/api/;
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://akuma_frontend/;
        proxy_set_header Host $host;
    }
}
```

#### Database High Availability
```yaml
# ha/docker-compose.ha.yml
version: '3.8'

services:
  postgres-master:
    image: postgres:13
    environment:
      POSTGRES_DB: akuma_scanner
      POSTGRES_USER: akuma
      POSTGRES_PASSWORD: secure_password
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: repl_password
    volumes:
      - postgres_master_data:/var/lib/postgresql/data
    command: |
      postgres
      -c wal_level=replica
      -c max_wal_senders=3
      -c max_replication_slots=3

  postgres-slave:
    image: postgres:13
    environment:
      PGUSER: postgres
      POSTGRES_PASSWORD: secure_password
      POSTGRES_MASTER_SERVICE: postgres-master
    depends_on:
      - postgres-master
    volumes:
      - postgres_slave_data:/var/lib/postgresql/data

volumes:
  postgres_master_data:
  postgres_slave_data:
```

### 7. Performance Optimization

#### Backend Optimization
```python
# backend/config/production.py
import multiprocessing

# Gunicorn configuration
bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
keepalive = 2
timeout = 30
```

#### Frontend Optimization
```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Enable gzip compression
RUN echo 'gzip on; gzip_vary on; gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' > /etc/nginx/conf.d/gzip.conf
```

### 8. Backup and Disaster Recovery

#### Automated Backup Script
```bash
#!/bin/bash
# scripts/production-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/akuma_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf "$BACKUP_DIR/app_backup.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    .

# Backup database
docker exec postgres-master pg_dump -U akuma akuma_scanner > "$BACKUP_DIR/database_backup.sql"

# Backup reports
if [ -d "reports" ]; then
    tar -czf "$BACKUP_DIR/reports_backup.tar.gz" reports/
fi

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
    aws s3 sync $BACKUP_DIR s3://your-backup-bucket/akuma-scanner/$DATE/
fi

# Keep only last 7 days of backups
find /backups -name "akuma_*" -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR"
```

### 9. Environment-Specific Configurations

#### Development
```bash
export ENVIRONMENT=development
export DEBUG=true
export LOG_LEVEL=DEBUG
docker-compose -f docker-compose.yml up
```

#### Staging
```bash
export ENVIRONMENT=staging
export DEBUG=false
export LOG_LEVEL=INFO
docker-compose -f docker-compose.staging.yml up
```

#### Production
```bash
export ENVIRONMENT=production
export DEBUG=false
export LOG_LEVEL=WARNING
docker-compose -f docker-compose.prod.yml up -d
```

---

*Deployment Guide v1.0 - Updated: 2024-06-26*
