# Friesland Skipper Cockpit V0.14.1

Fehlerkorrektur auf Basis V0.14, weiterhin additiv zum Master V0.13.2.

## Korrigiert
1. **Tagesauswahl auf GitHub Pages/iPad**
   - eigene CSS/JS-Dateien werden jetzt mit Versionsparameter geladen (`?v=0.14.1`), damit Safari/GitHub keine ältere V0.13/V0.12-Datei aus dem Cache verwendet.
   - alte Tagesleiste und Sidebar-Tageswahl werden zusätzlich über eine kleine kritische Inline-Regel ausgeblendet.
   - Kopfzeilen-Tageswahl nutzt explizite DOM-Zugriffe für Safari.

2. **Open-Meteo Wetter**
   - ein JavaScript-Namenskonflikt zwischen der Funktion `weatherRisk()` und dem DOM-Element `id="weatherRisk"` wurde behoben.
   - dieser Fehler trat erst NACH erfolgreicher Wetterabfrage auf und wurde fälschlich als „Online-Wetter nicht erreichbar“ angezeigt.
   - Wetter-Buttons sind jetzt explizit an ihre DOM-Elemente gebunden.
   - Fehlermeldungen zeigen künftig den tatsächlichen Fehlertext an.

3. **IJsselmeer-Seewetter**
   - wird wieder ausgeführt, sobald der normale Wetterblock erfolgreich verarbeitet wurde.

## Unverändert
Alle Funktionen, Inhalte, sieben Original-GPX, Karten, GPS, Nautik, Schiffsprofil,
Skipperbrief, Landgang, Nachtplätze und das Layout des Masters V0.13.2 bleiben erhalten.
