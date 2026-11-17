# Прототип каталога лучших игр Кибера (/games/best/)

Не публичный сайт. Прототип для проверки интерфейса и SEO-логики перед передачей в разработку.

## Запуск
```
npm install
npm run dev            # http://localhost:5173/games/best/
npm test               # модульные тесты ядра
```
Сборка одним файлом (адреса через якорь, открывается двойным кликом): `VITE_ROUTER=hash npx vite build` -> `dist-artifact/index.html`.
Сборка для GitHub Pages (настоящие пути): `VITE_BASE=/<repo>/ npx vite build && cp dist/index.html dist/404.html`.

## Структура
- `src/core/` - логика без привязки к интерфейсу: маршруты (`route.ts`), фильтрация и пагинация (`catalog.ts`), SEO и JSON-LD (`seo.ts`), проверки инспектора (`validate.ts`), настройки (`config.ts`).
- `src/ui/` - интерфейс на React.
- `src/data/` - `games.json` (игры с источником каждого поля), `dictionaries.json` (таблица мета и списки фильтров), `news.json` (снимок блоков).
- `data-pipeline/` - скрипты сбора данных и диагностика исключенных тегов.
- `STATUS.md` - утвержденные решения и открытые вопросы.
