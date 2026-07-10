# Båtväder

Båtväder är den enda app du behöver för att kolla om vädret är OK när du ska ut på sjön. Applikationen är anpassad för marina miljöer med högkontrast-design för att vara tydligt läsbar i starkt solljus.

## Teknikstack

- **Frontend**: React (Vite) med en ren, anpassad högkontrast-design (Vanilla CSS).
- **Backend**: Python (FastAPI) med SQLite-databas.
- **Infrastruktur**: Docker och Docker Compose. CI/CD via GitHub Actions för automatisk avbildningsbyggnation till GitHub Container Registry.

## Funktioner

- **Bakgrundshämtning**: Backend hämtar väderdata automatiskt varje hel timme från SMHI:s API för sparade positioner.
- **Platstjänster**: Frontend frågar efter användarens position och ber backend om väder för den specifika platsen. Om ingen plats kan bestämmas används Trosa som standard.
- **Offlinesparande**: Databasen sparas utanför containern så att historik bevaras över omstarter.
- **Responsivt**: Appen känner av om den körs på en mobil (stående, navigering i botten) eller surfplatta (liggande, navigering till vänster).

## Starta Lokalt

Om du har Docker installerat, kör:
```bash
docker-compose up --build
```
Därefter når du appen på `http://localhost:3000`.

## Bygga för Produktion
Varje ändring som pushas till `main`-grenen bygger automatiskt nya Docker-avbildningar via GitHub Actions. Dessa publiceras i repots paketregister (ghcr.io) och kan laddas ner och köras på en separat host.

*(Denna README kommer att uppdateras löpande under utvecklingens gång.)*
