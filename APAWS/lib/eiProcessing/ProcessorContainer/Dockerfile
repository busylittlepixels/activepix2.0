# Use Ubuntu as the base image
FROM ubuntu:22.04

# Install Node.js 20 and npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# Install Python 3, pip, and necessary build dependencies
RUN apt-get install -y python3 python3-venv python3-pip \
    build-essential \
    cmake \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libffi-dev \
    libjpeg-turbo8-dev \
    libpng-dev \
    && apt-get clean

# Create and activate a virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip, setuptools, and wheel
RUN pip install --upgrade pip setuptools wheel

# Install OpenCV for Python
RUN pip install opencv-python-headless

# Install tsx globally using npm
RUN npm install -g tsx

# Set the working directory to the root of the project
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies (if any)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables (you may adjust these as needed)
ENV MEDIA_BUCKET=""
ENV PROCESSED_BUCKET=""
ENV METADATA_TABLE=""
ENV PARTICIPANT_TABLE=""
ENV SQS_QUEUE_URL=""

# Command to run the main.ts file using tsx
# CMD ["tsx", "main.ts"]
CMD ["node", "main.js"]