# OptiProfit AI (Light) – Berechnungen

## Definitionen
- item: Produktname (Text)
- EK: Einkaufspreis pro Einheit (ohne Pfand)
- VK: Verkaufspreis pro Einheit (Aktionspreis, ohne Pfand)
- VK_normal (optional): Normalpreis pro Einheit
- WKZ_total (optional): Werbekostenzuschuss gesamt
- Menge (optional): Anzahl Einheiten (Default = 1)

## Basis (pro Einheit)
- DB = VK - EK
- Marge_% = (DB / VK) * 100 (nur wenn VK > 0)
- Gewinn_100 = DB * 100

## Optional: WKZ / Bonus
- WKZ_einheit = WKZ_total / Menge (nur wenn Menge > 0)
- DB_netto = DB + WKZ_einheit

## Optional: Normalpreis vs Aktion
- DB_norm = VK_normal - EK
- DB_akt = VK - EK
- DB_Diff = DB_norm - DB_akt (positiv = verschenkter DB)

## Optional: Break-even (bei WKZ_total)
- BreakEven_Menge = WKZ_total / DB_Diff (nur wenn DB_Diff > 0)
- Auf ganze Einheiten aufrunden

## Regeln
- Pfand wird niemals berücksichtigt.
- Alle Zahlen sind pro Einheit, Menge skaliert linear.
