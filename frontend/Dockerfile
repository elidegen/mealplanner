# --- Stage 1: bauen ---------------------------------------------------
FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: ausliefern ----------------------------------------------
# Nur das Build-Ergebnis wandert ins finale Image. Kein Node, keine
# node_modules - das Ergebnis sind wenige MB statt mehrerer hundert.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
