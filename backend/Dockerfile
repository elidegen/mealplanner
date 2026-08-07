# Debian-basiertes Image (nicht alpine): bcrypt und Prisma finden hier
# fertige Binaries und muessen nicht kompiliert werden.
FROM node:24-slim

# Prisma braucht openssl fuer seine Query Engine - in den slim-Images
# ist es nicht vorinstalliert.
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Erst nur die Manifeste: dieser Layer wird gecacht, solange sich die
# Dependencies nicht aendern. Code-Aenderungen loesen dann kein npm ci aus.
COPY package.json package-lock.json ./
RUN npm ci

# Prisma Client IM Container generieren - die Query Engine ist
# plattformspezifisch und darf nicht vom Host kommen.
COPY prisma ./prisma
RUN npx prisma generate

# Erst jetzt der restliche Quellcode
COPY . .

# Ablageort der SQLite-Datei, getrennt vom Code.
# Zur Laufzeit wird hier das Volume eingehaengt.
RUN mkdir -p /app/data

EXPOSE 3000

# migrate deploy laeuft beim START, nicht beim Build: beim Build gibt es
# das Volume noch nicht. "deploy" statt "dev", weil es keine Rueckfragen stellt.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
