FROM node:18-alpine

# Install Chrome dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dbus \
    xvfb

# Puppeteer configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
COPY . .

RUN npm install

# Add script to start Xvfb and run the application
RUN echo '#!/bin/sh' > /start.sh \
    && echo 'Xvfb :99 -ac & export DISPLAY=:99 && npm run start' >> /start.sh \
    && chmod +x /start.sh

EXPOSE 8000
CMD ["/start.sh"]