# AI Parser – Text zu JSON

## Ziel
Aus einem kurzen Text die Felder extrahieren und **nur** ein JSON-Objekt ausgeben.

## JSON-Schema (immer alle Keys)
```json
{
  "item": "string|null",
  "ek": 0,
  "vk": 0,
  "vk_normal": 0,
  "wkz_total": 0,
  "menge": 0
}
```

## Regeln
- Ausgabe ist **nur** JSON, keine Erklärungen.
- `item`, `ek`, `vk` sind Pflichtfelder; wenn nicht erkennbar -> `null`.
- Optionalfelder ohne Info -> `null`.
- Zahlen aus Text extrahieren; akzeptiere `,` oder `.` als Dezimaltrennzeichen.
- `menge` default `1`, wenn nicht genannt.
- Pfand ignorieren (niemals einrechnen).
- Nur **ein** Produkt extrahieren (erste plausible Nennung).
- Keine zusätzlichen Keys.
- Bei "Aktion X statt Y": `vk` = X, `vk_normal` = Y.

## Beispiele
Input: "Beck's 0,5l EK 0,65 VK 0,99 WKZ 10€ Menge 24"
Output:
{"item":"Beck's 0,5l","ek":0.65,"vk":0.99,"vk_normal":null,"wkz_total":10,"menge":24}

Input: "Coca-Cola 1,5l VK 1.29 EK 0.72"
Output:
{"item":"Coca-Cola 1,5l","ek":0.72,"vk":1.29,"vk_normal":null,"wkz_total":null,"menge":1}

Input: "Kasten Wasser EK 3,90 Aktion 4,49 statt 4,99"
Output:
{"item":"Kasten Wasser","ek":3.90,"vk":4.49,"vk_normal":4.99,"wkz_total":null,"menge":1}
