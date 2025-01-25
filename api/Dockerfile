FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dbus \
    xvfb \
    mesa-gl

# Puppeteer configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV DISPLAY=:99

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install

# Startup script
RUN echo '#!/bin/sh' > /start.sh \
    && echo 'Xvfb :99 -ac & export DISPLAY=:99 && npm run start' >> /start.sh \
    && chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]