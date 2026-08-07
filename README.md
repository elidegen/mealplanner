# Mealplanner

**Team:** Batuhan Bayraktar (313356), Elijah Degen (313388)
**Repository:** https://github.com/elidegen/mealplanner
**Modul:** Web-Applikationen SS26 · Prof. Dr. Pascal Laube · HTWG Konstanz

---

## Projektidee

Unsere App hilft Nutzern, ihre Mahlzeiten besser zu planen. Man kann Mahlzeiten als
Vorlagen (Rezepte) anlegen, daraus Einkaufslisten erzeugen und umgekehrt. Geplant ist
zusätzlich ein Wochenplaner. Das React-Frontend spricht ein eigenes Node/Express-Backend
mit persistenter SQLite-Datenbank und JWT-Authentifizierung an.

---

## Schnellstart mit Docker (empfohlen)

Vorausgesetzt ist nur ein laufendes Docker mit Compose (z. B. Docker Desktop).
Es muss **nichts** vorbereitet, installiert oder konfiguriert werden:

```bash
git clone https://github.com/elidegen/mealplanner.git
cd mealplanner
docker compose up
```

Die App läuft danach auf **http://localhost:5173**.

### Testzugang

Beim ersten Start wird eine Demo-WG mit Beispieldaten angelegt:

| | E-Mail | Passwort | Rolle |
| --- | --- | --- | --- |
| Admin | `test@mealplanner.de` | `test1234` | `admin` |
| Zweites Mitglied | `mitglied@mealplanner.de` | `test1234` | `user` |

Einladungscode der Demo-WG: **`PLANER`** (unter *Einstellungen* sichtbar, wenn
man als Admin angemeldet ist).

Die Demo-Daten sind so gewählt, dass die Portionsberechnung sichtbar wird:

| Mahlzeit | Vorrat | Kochbar |
| --- | --- | --- |
| Spaghetti Bolognese (4 Portionen) | alle Zutaten doppelt vorhanden | 8 Portionen |
| Linsen-Curry (3 Portionen) | Kokosmilch nur zur Hälfte da | 1 Portion |
| Ofengemüse mit Feta (2 Portionen) | Feta fehlt, steht auf der Einkaufsliste | 0 Portionen |

Der erste Start dauert einige Minuten, weil die Images gebaut werden; danach
geht es in Sekunden. Migrationen und Demo-Daten werden beim Start automatisch
angewendet. Der Seed bricht ab, sobald die Datenbank bereits Nutzer enthält –
eigene Änderungen überleben also jeden Neustart. Erst `docker compose down -v`
setzt alles zurück.

| Befehl | Wirkung |
| --- | --- |
| `docker compose up` | Startet Frontend und Backend, Logs im Vordergrund |
| `docker compose up -d` | Startet im Hintergrund |
| `docker compose up --build` | Erzwingt einen Neubau der Images (nach Code-Änderungen) |
| `docker compose down` | Stoppt alles, **Daten bleiben erhalten** |
| `docker compose down -v` | Stoppt alles und **löscht die Datenbank** |
| `docker compose logs -f backend` | Backend-Logs verfolgen |

Aufbau: Der `frontend`-Container liefert den Produktions-Build über nginx aus und
leitet alle Anfragen unter `/api` an den `backend`-Container weiter. Dadurch
laufen App und API unter derselben Herkunft. Nach außen ist nur Port 5173 offen.
Die SQLite-Datei liegt in einem Docker-Volume und überlebt einen Neustart.

`JWT_SECRET` hat für die lokale Entwicklung einen Standardwert, damit der Start
ohne Vorbereitung funktioniert. Für ein echtes Deployment vor dem Start setzen:

```bash
JWT_SECRET="ein-eigener-schluessel-mit-mindestens-32-zeichen" docker compose up
```

---

## Setup ohne Docker

Für die Entwicklung mit Hot Reload. Benötigt Node.js 24 oder neuer.

### 1. Backend

```bash
cd backend
npm install

cp .env.example .env     # Vorlage kopieren, JWT_SECRET anpassen

npm run db:generate      # Prisma Client generieren
npm run db:migrate       # Schema in SQLite anlegen
npm run db:seed          # Demo-Daten und Testuser anlegen
npm run dev              # API auf http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # App auf http://localhost:5173
```


## Tests

```bash
cd backend && npm test      # Rechteprüfung, Zutaten-Merge, Portionen & Kochen
cd frontend && npm test     # Mengeneingabe und Zutatenliste im Formular
```

Getestet wird die Kernlogik als reine Funktionen, ohne laufende Datenbank:
`services/permissions.ts` (wer darf lesen und schreiben), `services/ingredients.ts`
(wann zwei Zutaten dieselbe sind), `services/portions.ts` (wie viele Portionen der
Vorrat hergibt und was das Kochen abzieht) sowie `helper/meal.helper.ts` im Frontend.

## Kriterien-Zuordnung M3

| Kriterium | Datei | Zeile / Hinweis |
| --- | --- | --- |
| **React Router** – mind. 2–3 Routen | `frontend/src/App.tsx` | Z. 21–33: `/login`, `/home`, `/`, `/add-meal`, `/lists`, `/calendar`, `/settings`, `/users`, `/meals` |
| **Navigation** über `useNavigate` (kein `window.location`) | `frontend/src/pages/login/Login.tsx` | Z. 2, 14, 21, 43: `useNavigate("/meals")` |
| **Datenfetching GET** | `frontend/src/pages/meals/Meals.tsx` | Z. 39–63: `apiFetch<IMeal[]>("/api/meals", GET)` im `useEffect` |
| **Schreibende Methode POST** | `frontend/src/pages/add-meal/AddMeal.tsx` | Z. 49–56: `apiFetch("/api/meals", POST)` |
| **Schreibende Methode DELETE** | `frontend/src/pages/meals/Meals.tsx` | Z. 65–89: `apiFetch("/api/meals/:id", DELETE)` |
| Fetch gegen **eigenes Backend** | `frontend/src/auth/api.ts` | Z. 3–24: zentraler `apiFetch`-Wrapper mit Bearer-Header |
| **Ladezustand** sichtbar | `frontend/src/pages/meals/Meals.tsx` | Z. 28, 42/59, 172: `LoadingSpinner`-Overlay während des Fetchens |
| **Fehlermeldung** bei 4xx/5xx/Netzwerk | `frontend/src/pages/meals/Meals.tsx` | Z. 48–58: `try/catch` → `Snackbar` (kein stilles Scheitern) |
| Fehlerbehandlung zentral | `frontend/src/auth/api.ts` | Z. 15–18: wirft Error mit Servermeldung bzw. `HTTP <status>` |
| Fehleranzeige im Login | `frontend/src/pages/login/Login.tsx` | Z. 11, 22–23, 73–74: `error`- und `loading`-State im UI |
| **Geteilter State** via React Context | `frontend/src/auth/AuthContext.tsx` | Z. 19–53: `AuthProvider` hält `token`/`user` app-weit; `useAuth()` Z. 55–59 |
| Context eingebunden | `frontend/src/main.tsx` | Z. 5, 9–11: `<AuthProvider>` umschließt die App |
| **Backend** Node.js-Server | `backend/src/server.ts` | Z. 10–17, 132: Express mit `helmet`, `cors`, `express.json` |
| Eigene API-Endpunkte | `backend/src/server.ts` | Z. 19 (health), 23/48 (auth), 91/99/122 (meals GET/POST/DELETE) |
| **Datenbank** persistent (SQLite) | `backend/prisma/schema.prisma` | Z. 5–8: SQLite-Datasource; Modelle Z. 10–85 (kein `data.json`) |
| ORM-Zugriff | `backend/src/server.ts` | Z. 8, 11: `PrismaClient`; z. B. `prisma.meal.findMany` Z. 92 |
| **Auth** – Registrierung | `backend/src/server.ts` | Z. 23–46: `/api/auth/register`, Passwort-Hash via `bcrypt` (Z. 39) |
| **Auth** – Login | `backend/src/server.ts` | Z. 48–68: `/api/auth/login`, `bcrypt.compare` + JWT-Ausstellung |
| **JWT** konsequent (nicht mit Session gemischt) | `backend/src/server.ts` | Z. 62: `jwt.sign`; Header-Weitergabe `frontend/src/auth/api.ts` Z. 12 |
| **Geschützter Endpunkt** (Middleware) | `backend/src/server.ts` | Z. 77–88: `requireAuth`; angewandt auf `/api/meals` (Z. 91, 99, 122) |
| **Geschützte Route** (Frontend) | `frontend/src/auth/ProtectedRoute.tsx` | Z. 4–7: Redirect zu `/login`, wenn nicht authentifiziert |
