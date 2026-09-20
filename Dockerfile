FROM python:3.10-slim

# Install system dependencies for OpenCV and PaddleOCR
RUN apt-get update && apt-get install -y \
    curl \
    git \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python PaddleOCR 3.0 dependencies
COPY backend/python_ocr/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy full codebase
COPY . .

# Build NestJS backend and React frontend
RUN cd backend && npm run build
RUN cd frontend && npm run build

ENV PORT=8000
EXPOSE 8000

CMD ["python", "backend/python_ocr/main.py"]
