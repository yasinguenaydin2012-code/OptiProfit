# OptiProfit AI (Light)

OptiProfit AI (Light) ist eine B2B-Mobile-App (Expo / React Native) fuer Kaufleute und Marktleiter in Getraenkemaerkten. Sie prueft Preise und Aktionen schnell, damit Marge/Deckungsbeitrag stimmen und Fehlentscheidungen vermieden werden. Fokus: maximaler ROI bei minimaler Komplexitaet.

## Kernversprechen
EK/VK (optional Aktion, WKZ, Menge) eingeben, sofort DB/Marge und die bessere Option sehen.

## MVP (Kurz)
- Textinput (Chat-Style), Parser extrahiert item, EK, VK, optional VK_normal, WKZ_total, Menge
- Deterministische Berechnung (ohne Pfand)
- Ergebnis-Karten + lokale Historie (AsyncStorage), offline-first

## KI/Backend (geplant)
- KI nur fuer Parsing + kurze Empfehlung, keine Zahlen erfinden
- Kein API-Key in der App; Backend-Proxy ruft OpenAI auf
- Prompts liegen in `prompts/`

## Ergebnisse (Auszug)
- DB pro Einheit, Marge %, Gewinn je 100 Einheiten
- Optional: WKZ pro Einheit + DB netto
- Optional: Normal vs Aktion inkl. DB_Diff und Break-even Menge

## Nicht im MVP
- Pfand
- Kassensystem-Integrationen
- Logins/Accounts

## Beispiele
- "Monster EK 0,89 VK 1,29"
- "Kasten Wasser EK 3,90 Aktion 4,49 statt 4,99"
- "Red Bull EK 0,72 VK 1,19 WKZ 200 Menge 1000"

## Repo Struktur
- `optiprofit-mobile/` Expo App
- `backend/` Node/Express Proxy fuer KI-Parsing
- `docs/` Source of Truth
- `prompts/` KI Prompts
- Root `App.tsx` dient als Expo Entry-Point (Workspaces).

## Lokales Setup (Kurz)
```bash
# Abhaengigkeiten (Workspaces)
npm install

# Mobile App (Expo laeuft vom Repo-Root)
npx expo start
```

```bash
# Backend (separates Terminal)
cd backend
npm install
OPENAI_API_KEY=... npm run dev
```

Optional in der App:
`EXPO_PUBLIC_AI_PARSE_URL=http://<mac-ip>:3001/parse`

## Android (lokal)
```bash
npx expo run:android
```
