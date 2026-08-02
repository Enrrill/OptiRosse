# OptiRosse

Django 6 + React 19 + Vite 8 + Tailwind v4. Monorepo at project root.

## Django (backend/)

- Settings: `backend/config/settings.py` — `DJANGO_SETTINGS_MODULE=backend.config.settings`
- Requires `.env` at project root (loads via `load_dotenv` with absolute path)
- **Apps** live under `backend/apps/`, registered as `'backend.apps.<name>'` with `label='<name>'`
- Custom User Model: `core.Usuario` — `AbstractBaseUser`, `USERNAME_FIELD='nombre_usuario'`, `REQUIRED_FIELDS=['correo']`
- Shared abstract models in `core/base_models.py`: `TimeStampedModel` (creado_en, actualizado_en), `ActivoMixin`
- All `TextChoices` in `core/choices.py` — import as `from backend.apps.core.choices import ...`
- Cross-app model imports use full dotted path: `from backend.apps.clients.models import ClienteOptica`
- `db_table` explicit on every model. `verbose_name` / `verbose_name_plural` in Spanish
- API under `/api/v1/`: per-app `urls.py` included in `backend/config/urls.py`; responses use the envelope `{success, data, errors, message, meta}` (`backend/common/api/response.py`)
- Business logic in `services.py` (thin views), read-only aggregates also as services (e.g. `DashboardService` in `finance`)
- Always activate venv: `source venv/bin/activate && python manage.py <cmd>`

## Frontend (frontend/)

- Package manager: `pnpm` (`pnpm-lock.yaml`)
- Tailwind v4 via `@tailwindcss/vite` plugin — **no** `tailwind.config.js` or `postcss.config.js`
- CSS entry: `@import "tailwindcss"` (not legacy `@tailwind` directives)
- JSX: use `className`, never `class`
- Scripts: `pnpm dev`, `pnpm build`, `pnpm lint` (ESLint flat config)
- **`apiClient` (axios) unwraps the envelope**: the interceptor converts `{success, data, errors, message, meta}` into `ApiResponse<T>` (`{data, meta, message}`); read the payload as `res.data.data`, NOT `res.data`. `useApiQuery`/`useApiMutation` in `hooks/useApi.ts` already handle this
- **Auth store** (`store/useAuth.ts`, zustand + persist, key `optirosse-auth`): `logout()` broadcasts via `BroadcastChannel` (`lib/api/authSync.ts`) to sync tabs; the cross-tab handler must use `_clearAuth()` (no broadcast) to avoid a logout loop
- **`ProtectedRoute`** (`components/layout/guards.tsx`) validates the token with `GET /auth/me/` on mount (shows `FullPageLoader`) before rendering — do not trust the persisted `isAuthenticated` flag
- **Query defaults** (`lib/constants/query.ts`): no retry on 401 errors; `refetchOnWindowFocus: false`
- ESLint flat config includes `react-hooks/set-state-in-effect` — do **not** call `setState` synchronously inside a `useEffect` (lint error)

## Commands

```sh
# Backend
source venv/bin/activate && python manage.py runserver
source venv/bin/activate && python manage.py makemigrations
source venv/bin/activate && python manage.py migrate
source venv/bin/activate && python manage.py check

# Frontend
cd frontend && pnpm dev
cd frontend && pnpm build
cd frontend && pnpm lint
```

## DB

- PostgreSQL, credentials in `.env` (`DB_NAME=OptiRosse`, user `enrrill`)
- Connect: `PGPASSWORD=1234 psql -U enrrill -h localhost -d OptiRosse`

## Project quirks

- `backend/config/settings/` directory was removed — only `settings.py` (file) is used; do not recreate the package
- JWT: `ROTATE_REFRESH_TOKENS=True` + `BLACKLIST_AFTER_ROTATION=True` — the refresh endpoint returns a **new** refresh token that must be persisted (`data.refresh ?? refresh` in `client.ts`); after invalidating tokens, re-login once
- No test framework configured yet; no CI; no pre-commit hooks
- No migrations were squashed; initial migrations exist for all apps
- All model content in Spanish (field names, verbose, choices labels)
