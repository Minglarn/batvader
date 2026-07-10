# Båtväder

> [!WARNING]
> **Pre-release:** Detta är en tidig version av applikationen. Den är under aktiv utveckling och kommer med all sannolikhet att innehålla buggar och ofullständiga funktioner.

Båtväder är den enda app du behöver för att kolla om vädret är OK när du ska ut på sjön. Applikationen är anpassad för marina miljöer med högkontrast-design för att vara tydligt läsbar i starkt solljus.

## Teknikstack

- **Frontend**: React (Vite) med en ren, anpassad högkontrast-design (Vanilla CSS).
- **Backend**: Python (FastAPI) med SQLite-databas.
- **Infrastruktur**: Docker och Docker Compose. CI/CD via GitHub Actions för automatisk avbildningsbyggnation till GitHub Container Registry.

## Funktioner

- **Realtidsväder ("NU"-vy)**: Visar detaljerad väder- och havsinformation (SMHI + MET Norway) för din exakta position.
- **Prognos**: Timme-för-timme väderprognos (10 timmar per vy) med smidig navigering framåt och bakåt.
- **Detaljvy**: Klickbar prognos som öppnar en interaktiv modal med all väderdata för den valda timmen.
- **Dynamiska väderikoner**: Ikonerna visar sol eller måne baserat på en matematisk beräkning (`suncalc`) av soluppgång och solnedgång utifrån dina GPS-koordinater.
- **AI-Analys (Kommande)**: Appen är förberedd med en dedikerad vy för framtida smarta AI-sammanfattningar av väderomslag.
- **Bakgrundshämtning**: Backend hämtar väderdata automatiskt varje hel timme från SMHI:s API för sparade positioner.
- **Platstjänster**: Frontend frågar efter användarens position. Om ingen plats kan bestämmas används Trosa som standard.
- **Responsivt och Snyggt**: Fullt responsiv UI designad för marina miljöer (hög kontrast, mörkt/oled-tema, glassmorphism) som känner av om den körs på mobil eller surfplatta.

## Starta med Docker

Eftersom applikationen byggs automatiskt via GitHub Actions, kan du enkelt starta upp Båtväder på valfri server med hjälp av följande `docker-compose.yml`:

```yaml
version: '3.8'
services:
  frontend:
    image: ghcr.io/minglarn/batvader-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    image: ghcr.io/minglarn/batvader-backend:latest
    ports:
      - "8090:8000"
    volumes:
      - sqlite_data:/app/data

volumes:
  sqlite_data:
```

Spara ovanstående konfiguration i en fil som heter `docker-compose.yml` på din server och kör sedan:

```bash
docker-compose pull
docker-compose up -d
```

Därefter når du appen på `http://din-server-ip:3000`.

*(Denna README kommer att uppdateras löpande under utvecklingens gång.)*
