# OptiProfit AI (Light) – Berechnungen

## Definitionen
- item: Produktname (Text)
- EK: Einkaufspreis pro Einheit (ohne Pfand)
- VK: Verkaufspreis pro Einheit (Aktionspreis, ohne Pfand)
- VK_normal (optional): Normalpreis pro Einheit
- WKZ_total (optional): Werbekostenzuschuss gesamt für die Position
- Menge (optional): Anzahl Einheiten (Default = 1)

## Formeln
- Umsatz = VK * Menge
- Einkauf = EK * Menge
- WKZ_gesamt = WKZ_total (falls leer: 0)
- Gewinn = Umsatz - Einkauf + WKZ_gesamt
- Marge_% = (Gewinn / Umsatz) * 100 (nur wenn Umsatz > 0)
- ROI_% = (Gewinn / Einkauf) * 100 (nur wenn Einkauf > 0)

## Optional: Vergleich zu Normalpreis
- Normalumsatz = VK_normal * Menge
- Rabatt_% = ((VK_normal - VK) / VK_normal) * 100 (nur wenn VK_normal > 0)

## Regeln
- Pfand wird niemals berücksichtigt.
- Alle Zahlen sind pro Einheit, Menge skaliert linear.
