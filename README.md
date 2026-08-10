# Friesland Skipper Cockpit V0.18.1

## Nachtplätze mit Fotos und praktischen Informationen

1. **Ausführliche Nachtplatzansicht**
   - Für alle sieben Fahrtage gibt es eine eigene Nachtplatzkarte mit Charakter, Liegeart, Versorgung, Anlegetaktik und Reserveplan.
   - Workum, Marchjepolle, Giethoorn und Sloten werden mit echten Ortsfotos gezeigt; die Naturplätze erhalten ein gekennzeichnetes Friesland-Stimmungsfoto.
   - Direkte Karten- und Quellenlinks erleichtern die Kontrolle am Fahrtag.

2. **Aktueller Informationsstand**
   - Workum enthält die kommunalen Gebühren und Sanitärzeiten mit Stand 10.08.2026.
   - Giethoorn enthält die veröffentlichte Saison und die Passantentarife 2026.
   - SN38A Longschar enthält Liegekantenlänge, Aufenthaltsdauer und die vorhandene beziehungsweise fehlende Infrastruktur.
   - Naturplätze bleiben ausdrücklich Zielgebiete: Belegung, Beschilderung, Wassertiefe, Windlage und Eignung für Artemis werden vor Ort geprüft.

3. **Dauerhaft und offline**
   - Texte liegen fest in `assets/night-info-data.js`.
   - Alle fünf Bilddateien liegen lokal unter `assets/nightplaces/` und benötigen nach der Installation keine Internetverbindung.
   - Bilder stammen aus Wikimedia Commons und enthalten sichtbare Urheber- und Lizenzhinweise; Details stehen zusätzlich in `IMAGE-LICENSES.md`.

## Bestandsschutz

V0.18.1 ergänzt ausschließlich den Reiter Nachtplätze. Alle Funktionen und Daten der V0.18.0 – einschließlich Tagesplan, Landgang, Wetter, Nautik, Karte, GPX, Waterkaarten-Alternativen, Schiffsprofil, GPS und iPhone-Querformat – bleiben erhalten.

---

## Bisheriger Stand V0.18.0

## Tagesplan und Landgang ausführlich dargestellt

1. **Reiter Tagesplan**
   - Der ausgewählte Fahrtag wird als vollständiger Ablauf dargestellt: Tagesziel, Schwerpunkte, Gewässerfolge, wichtige Passagen, Landgänge, Nachtziel und Reservetaktik.
   - Alle sieben Tage sind direkt im Reiter auswählbar.
   - Die Anzeige verwendet die jeweils aktive Route und berücksichtigt damit auch eine ausgewählte Waterkaarten-Alternative mit importierten Routeninfos.

2. **Reiter Landgang**
   - Die bereits vorhandenen ausführlichen Landganginformationen werden als einzelne, gut lesbare Karten angezeigt.
   - Die Karten werden in Stopp & Landgang, Erleben, Essen & Trinken, Versorgung und Reserve gegliedert.
   - Nachtziel und Reservetaktik des gewählten Fahrtags bleiben direkt sichtbar.

3. **Dauerhafte Speicherung**
   - Die Informationen der sieben Standardrouten bleiben Bestandteil von `assets/tour-info-data.js` und werden nicht nur im Browserspeicher abgelegt.
   - Sie sind nach einer Installation oder GitHub-Bereitstellung auf iPad, iPhone und MacBook vorhanden und funktionieren ohne Internet.
   - Lokale Tour-Updates oder Alternativrouten können weiterhin darüberliegen. Nach dem Entfernen eines lokalen Updates erscheint wieder die dauerhaft integrierte Fassung.

## Bestandsschutz

V0.18.0 erweitert ausschließlich die Darstellung der vorhandenen Informationen. Alle Funktionen und Daten der freigegebenen MASTER V0.17.3 – einschließlich Wetter, Nautik, Karte, GPX, Waterkaarten-Alternativen, Schiffsprofil, GPS und iPhone-Querformat – bleiben erhalten.

---

## Bisheriger Stand V0.17.3

## Fehlerkorrekturen gegenüber der getesteten V0.17.2

1. **Skipper-Hinweise wieder vollständig lesbar**
   - Die Anzeige verarbeitet sowohl das ältere dreiteilige Listenformat als auch das neue Objektformat der dauerhaft integrierten Tourinfos.
   - `undefined` wird nicht mehr anstelle von Status, Überschrift oder Hinweistext ausgegeben.

2. **Kompakte iPhone-Navigation im Querformat**
   - Die linke Kategorienleiste wird auf Smartphones im Querformat als schmale Symbolleiste oberhalb des Inhalts dargestellt.
   - Alle acht Kategorien bleiben direkt erreichbar, ohne die Inhaltsfläche seitlich zu verdrängen.
   - iPad- und Desktop-Darstellung bleiben unverändert.

## Bestandsschutz

Die Korrektur ist additiv. Alle sieben Standard-GPX, `assets/routes-data.js`, die dauerhaft integrierten Tourinfos, Waterkaarten-Alternativen, Wetter-, Karten-, GPS- und Nautikfunktionen bleiben erhalten.

---

## Bisheriger Stand V0.17.2

## Additive Erweiterung gegenüber der getesteten V0.17.1

1. **Tour-Routeninfos dauerhaft integriert**
   - Das geprüfte Informationspaket für alle sieben Standardrouten ist jetzt Bestandteil der App.
   - Landgang, Gewässer, Passagen, Nautik und Skipperbriefing erscheinen auf iPad und MacBook ohne vorherigen Import.
   - Die integrierten Informationen benötigen weder Supabase noch eine andere Cloudverbindung.

2. **Dreistufige, rückbaubare Datenebene**
   - Ein später importiertes Tour-Paket hat als lokale Aktualisierung Vorrang.
   - Wird diese Aktualisierung entfernt, erscheinen wieder die dauerhaft integrierten Tourinfos.
   - Werden auch die integrierten Infos ausgeblendet, erscheinen die unveränderten Originalinformationen aus `assets/routes-data.js`.
   - „Tour-Infos wiederherstellen“ aktiviert die integrierte Ebene erneut.

3. **Geräte- und Bestandsschutz**
   - Die integrierten Informationen liegen in `assets/tour-info-data.js` und reisen mit jeder ZIP bzw. GitHub-Bereitstellung mit.
   - Das Löschen lokaler Browserdaten entfernt höchstens lokale Updates und Ausblendungen; die integrierte Informationsebene erscheint danach automatisch wieder.
   - Die sieben Original-GPX und `assets/routes-data.js` bleiben unverändert.

## Bestandsschutz

Alle Funktionen der getesteten V0.17.1 einschließlich Waterkaarten-Alternativen, Einzelanalyse, Tour-Analyse, JSON-Import, Wetter, Karten, GPS, Nautik und GPX-Download bleiben erhalten.

---

## Bisheriger Stand V0.17.1

## Additive Erweiterung gegenüber der getesteten V0.17.0

1. **Ein Analysepaket für alle sieben Standardrouten**
   - „Tour-Analysepaket“ exportiert die sieben eingebauten Originalrouten gemeinsam als JSON.
   - Enthalten sind ausschließlich Routengeometrie, Fahrtage, Planwerte und Schiffsprofil; die aktuelle GPS-Position wird nicht exportiert.
   - Der Rechercheauftrag legt besonderen Wert auf konkrete Landgangtipps, Versorgung, Gastronomie, Sehenswürdigkeiten und Aktivitäten nahe sinnvoller Anlegeplätze.

2. **Ein Tour-Routeninfopaket importieren**
   - Ein gemeinsames `fsc-tour-info-v1`-Paket ergänzt alle sieben Standardrouten in einem Schritt.
   - Alle sieben Fahrtage und GPX-Fingerabdrücke werden vollständig geprüft, bevor etwas gespeichert wird. Bei nur einem Fehler wird das gesamte Paket abgewiesen.
   - Angereicherte Standardrouten verhalten sich in Karte, Wetter, GPS, Nautik, Tagesdetails und GPX-Download weiterhin wie normale Originalrouten.

3. **Getrennte, lokale und rückbaubare Zusatzebene**
   - Die importierten Texte liegen separat im lokalen Browserspeicher; `assets/routes-data.js` und alle Original-GPX bleiben unverändert.
   - Informationen können je Fahrtag oder gemeinsam entfernt werden. Danach erscheinen sofort wieder die exakt eingebauten Originalinformationen.
   - Der bestehende Einzelworkflow für Waterkaarten-Alternativrouten bleibt erhalten.

## Bestandsschutz

Alle Funktionen, Inhalte, Wetter-, Karten-, GPS-, Nautik-, GPX- und Alternativroutenfunktionen der getesteten V0.17.0 bleiben erhalten. Die Erweiterung betrifft ausschließlich eine zusätzliche lokale Informationsebene für Standardrouten.

---

## Bisheriger Stand V0.17.0

## Additive Erweiterung gegenüber der getesteten V0.16.0

1. **Analysepaket für ChatGPT**
   - Die aktive Waterkaarten-Alternative kann als kompaktes JSON-Analysepaket gesichert werden.
   - Enthalten sind Fahrtag, Datum, Route, Stichproben der GPX-Geometrie, automatische Basisdaten und das Schiffsprofil.
   - Die aktuelle GPS-Position des Benutzers wird nicht exportiert.

2. **Routeninformationspaket importieren**
   - Von ChatGPT erstellte Informationen können als JSON wieder in die passende Alternativroute importiert werden.
   - Übernommen werden Routentitel, Beschreibung, Ziel-/Nachtplatzhinweis, Gewässer, Passagen, Landgang, Nautik und Skipperbriefing.
   - Fahrtag und ein Fingerabdruck der GPX müssen exakt passen; falsche Pakete werden abgewiesen.

3. **Rückbaubar und lokal**
   - Importierte Informationen werden ausschließlich lokal mit der Alternativroute gespeichert.
   - Sie können separat entfernt werden, ohne GPX, automatische Basisdaten oder Originalroute zu verändern.
   - Ein erneuter Import ersetzt bestehende Informationen nur nach Bestätigung.

## Bestandsschutz

Die GPX-Import-, Auswahl-, Wetter-, Karten-, GPS- und Nautikfunktionen der
getesteten V0.16.0 bleiben erhalten. Alle sieben Original-GPX und
`assets/routes-data.js` bleiben unverändert.

---

## Bisheriger Stand V0.16.0

## Additive Erweiterung gegenüber der freigegebenen MASTER V0.15.2

1. **Automatische Basisinformationen für importierte Alternativrouten**
   - Start und Ziel werden aus den GPX-Koordinaten bestimmt.
   - Ortsnamen werden einmalig über OpenStreetMap/Nominatim ermittelt und lokal mit der Alternative gespeichert.
   - Distanz und Punktzahl stammen direkt aus der importierten GPX.
   - Die Plan-Fahrzeit wird transparent mit 8 km/h und auf fünf Minuten gerundet berechnet.

2. **Wetter entlang der Alternativroute**
   - Wetter wird getrennt für Start, Routenmitte und Ziel geladen.
   - Innerhalb des Prognosefensters wird der tatsächliche Fahrtag verwendet.
   - Außerhalb des Prognosefensters werden eindeutig gekennzeichnete aktuelle Live-Werte angezeigt.
   - Wind, Böen, Regen und eine Ampel-Risikoeinschätzung werden dargestellt.

3. **Offline- und Bestandsschutz**
   - Bei fehlendem Internet bleiben importierte GPX, gespeicherte Ortsdaten und Routenauswahl nutzbar; neue Karten-, Orts- und Wetterdaten benötigen Internet.
   - Fehler externer Dienste werden sichtbar angezeigt und erzeugen keine erfundenen Werte.
   - Die sieben Originalrouten und sämtliche Original-GPX bleiben unverändert.

### Bestandsschutz V0.16.0

Alle Funktionen, Inhalte, Karten, GPS, Nautik, Schiffsprofil, Skipperbriefing,
Landgänge, Nachtplätze und das Layout der freigegebenen MASTER V0.15.2 bleiben
erhalten. Die V0.16.0 erweitert ausschließlich importierte GPX-Alternativrouten.

---

## Bisheriger Stand V0.15.2

## Additive Erweiterung gegenüber der freigegebenen MASTER V0.14.1

1. **Eine Waterkaarten-GPX-Alternative pro Fahrtag**
   - GPX-Datei über die lokale Dateiauswahl auf iPad/Mac importieren.
   - Alternative wird ausschließlich lokal im Browser dem aktuellen Fahrtag zugeordnet.
   - Originalroute und alle sieben Original-GPX-Dateien bleiben unverändert.

2. **Freie Routenauswahl**
   - Jeder Fahrtag kann zwischen Originalroute und gespeicherter Alternative wechseln.
   - Die aktive Route wird auf Karte, bei Distanz, GPX-Download, Wetterpunkt, GPS-Abstand und Nautikscan verwendet.
   - Die Alternative kann gelöscht werden; anschließend ist automatisch wieder die Originalroute aktiv.

3. **Sichere erste Ausbaustufe**
   - GPX-Name, Streckenverlauf, Punktzahl und Distanz werden beim Import übernommen bzw. berechnet.
   - Weitere automatisch erzeugte Basisinformationen folgen bewusst in einem getrennten zweiten Schritt.

### Bestandsschutz V0.15.2

Alle Funktionen, Inhalte, sieben Original-GPX, Karten, GPS, Nautik, Schiffsprofil,
Skipperbriefing, Landgänge, Nachtplätze und das bestehende Layout aus V0.14.1
bleiben erhalten. Die neue Funktion ist additiv und lokal rückbaubar.

---

## Bisheriger Stand V0.14.1

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
