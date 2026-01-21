# OptiProfit AI (Light) – Projektkontext

## Kernversprechen
Gib EK/VK (optional Aktion, WKZ, Menge) ein, die App berechnet sofort DB/Marge und zeigt die bessere Option.

## Zielgruppe
- Kaufleute und Marktleiter in Getränkemärkten
- Verantwortliche für Preisgestaltung, Aktionen, Werbeware
- Schnelle Entscheidungen direkt im Markt

## Problem
Aktionen zerstören oft die Marge. WKZ/Bonis werden falsch eingeplant. Es fehlt eine schnelle, saubere Kalkulation.

## MVP (Expo Mobile)
- Textinput (Chat-Style) mit natürlicher Sprache
- Parser extrahiert: item, EK, VK, optional VK_normal, optional WKZ_total, optional Menge
- Deterministische Berechnung nach festen Formeln (ohne Pfand)
- Ergebnis-Karten + lokale Historie (AsyncStorage), offline-first
- Parser v0 offline (Regex), KI-Parser spaeter ueber Backend

## Ergebnisse / UI
- DB pro Einheit, Marge %, Gewinn je 100 Einheiten
- Optional: WKZ pro Einheit + DB netto
- Optional: Normal vs Aktion inkl. DB_Diff und Break-even Menge
- Kurze Empfehlung (regelbasiert)

## KI-Implementierung (geplant)
- KI darf keine Zahlen erfinden oder rechnen
- KI nur fuer Parsing + kurze Empfehlung
- App rechnet immer deterministisch in Code
- Kein API-Key in der App, nur Backend-Proxy

## Nicht im MVP (bewusster Scope)
- Pfand
- Kassensystem-Integrationen
- Accounts/Logins, Multi-User
- Komplexes Controlling
