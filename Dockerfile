# Dockerfile
FROM node:22.13.1-alpine3.19

# Instala as dependências necessárias
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    tzdata \
    bash

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala as dependências do Node.js
RUN npm install

# Copia o código do bot
COPY . .

# Define as variáveis de ambiente para o Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Cria diretórios necessários com permissões adequadas
RUN mkdir -p /usr/src/app/.wwebjs_auth /usr/src/app/.wwebjs_cache \
    && chmod -R 777 /usr/src/app

# Comando para iniciar o bot com saída não bufferizada
CMD ["node", "--trace-deprecation", "--no-deprecation", "bot.js"]