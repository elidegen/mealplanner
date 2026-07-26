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

## Setup

### 1. Backend

```bash
cd backend
npm install

# .env anlegen (Beispiel):
#   DATABASE_URL="file:./dev.db"
#   JWT_SECRET="ein-geheimer-schluessel-mindestens-32-zeichen"
#   PORT=3000

npm run db:generate      # Prisma Client generieren
npm run db:push          # Schema in SQLite anlegen
npm run dev              # API auf http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # App auf http://localhost:5173
```


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
