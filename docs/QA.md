# Mooslicht Web – Prüfbericht

Stand: 05.11.2026. Tatsächlich auf dem Entwicklungsrechner ausgeführt:

## Spielwelten 1.2

Neu: vier auswählbare Umgebungen, automatische oder feste Tageszeit, automatische oder feste Atmosphäre und eigene Reiseillustrationen. Neue Profilfelder sind optional, damit ältere Sicherungen unverändert lesbar bleiben. Neue Werte werden bei Aktionen und Import validiert. Die Vorschau ändert den gespeicherten Stand erst beim Speichern; Abbrechen stellt die gespeicherte Umgebung wieder dar.

31 Logiktests bestanden, darunter Altstand-Kompatibilität, Speicherung aller Welten, Zurückweisen ungültiger Weltoptionen und Tageszeitgrenzen. Je 24 Browserabläufe in Chromium und WebKit bestanden; neue Prüfungen decken Vorschau aller vier Orte, Speicherung von Nacht/Schnee, Neustart, Abbrechen ohne Fortschrittsverlust sowie Animationen und reduzierte Bewegung ab. Der 24. Ablauf prüft den automatischen Lichtwechsel in einer offen bleibenden App beim Überschreiten von 17 Uhr. Vier tatsächliche Szenen-Screenshots wurden visuell kontrolliert. Die SVG-Hintergründe passen ihre Breite der Szene an, während Haustiere mit ihrem ursprünglichen Seitenverhältnis separat gezeichnet werden.

Zusätzlich prüfen die Geräteprofile nun den Welt-Dialog und bei 360/390 Pixeln alle vier Welten mit Nacht/Schnee: je 11 Profile in Chromium und WebKit bestanden. Die Touch-Suite enthält den Weltwechsel per Fingertipp und den gespeicherten Ort nach Neustart: je 7 Abläufe bestanden. Wetter bleibt in der Kuschelstube auf den Fensterbereich begrenzt; dekorative Partikel und Belohnungssterne nehmen keine Berührungen entgegen. Physische iPhones und Samsung-Geräte stehen hier weiterhin nicht zur Verfügung.

Version 1.2.1 ergänzt einen 25. Browserablauf in beiden Engines: Wandartikel werden auch dann in einer Stube vorgeführt, wenn als Umgebung der Garten gewählt ist. Ein Hinweis erklärt dies. Die Vorschau verändert den gespeicherten Aufenthaltsort nicht. Gekaufte Wände wirken auf die Wandgestaltung der Kuschelstube; der gewählte Teppich wirkt dort auf den großen Teppich und draußen auf die Picknickfläche.

## Touch-Korrektur 1.1.1

Der gemeldete Gerätefehler ist ohne Angabe des konkreten Buttons/Geräts nicht eindeutig reproduzierbar. Bei der Prüfung wurde jedoch ein unabhängiges Problem gefunden: Der Toast hatte eine aktive Trefferfläche vor darunterliegenden Buttons. `pointer-events: none` entfernt diese Blockade. Dekorative Button-SVGs nehmen keine eigenen Treffer mehr entgegen; reine Hover-Bewegungen entfallen auf Touch-Geräten.

Auf ausdrücklichen Nutzerwunsch begrenzen Viewport und `touch-action` den Seitenzoom; Safari-Gesten und Mehrfinger-Touch-Gesten werden abgefangen. Ein-Finger-Scrollen sowie Texteingabe bleiben erhalten. Eingabefelder haben mindestens 16 CSS-Pixel Schriftgröße gegen iOS-Fokuszoom. Betriebssystemweite Bedienungshilfen liegen außerhalb der Web-App.

`npm run test:touch`: **6 von 6 Abläufen in Chromium und 6 von 6 in WebKit bestanden**. Die Tests verwenden Playwrights Touchscreen und `tap()` für Navigation, alle fünf Tierinteraktionen, Gestaltung, Aufgaben anlegen/bearbeiten/abhaken, Kauf/Ausrüstung, Reisestart, Stimmung, Tagebuch und Fokus-/Atemübungen. Datenbankwerte und tatsächliche UI-Zustände werden geprüft. Ein Hit-Test kontrolliert, dass Meldungen keine Buttons blockieren.

Die Zoomprüfung kontrolliert den Viewportmaßstab nach Doppeltipp, Fokus und Gesten. In Chromium werden zusätzlich echte Browser-Touch-Ereignisse mit zwei auseinanderbewegten Punkten eingespeist und deren Empfang/Abfangen geprüft; ein separater Ein-Finger-Wisch muss den Scrollstand verändern. Die höherstufige CDP-Funktion `synthesizeScrollGesture` lieferte in diesem Headless-Runner Erfolg ohne Scrollbewegung, weshalb der Test ausdrücklich einzelne `dispatchTouchEvent`-Punkte verwendet. WebKit prüft Fingertipps, Maßstab und die abbrechbaren Gestenereignisse; es wird kein nativer iPhone-Pinch-Test behauptet.

Protokolle: `touch-chromium-1.1.1.txt`, `touch-webkit-1.1.1.txt`. Für diese Version erneut bestanden: 29 Logiktests sowie je 20 Browserabläufe und 11 Geräte-/Schriftprofile in Chromium und WebKit. Das Offline-Paket enthält jetzt auch `interaction.js` (14 Ressourcen). Reisebuttons zeigen ihre Sperrbedingung unmittelbar an. Eine neue Version ersetzt weder Spielstand noch Sicherungen.

| Prüfung | Ergebnis |
|---|---|
| Node.js-Domänenlogik, Zeitzone Europe/Berlin | 29 Tests bestanden, 0 Fehler |
| Chromium, 390×844 sowie 320 und 1440 Pixel Breite | 20 Browserabläufe bestanden, 0 Fehler |
| Playwright WebKit 26.5, gleiche Abläufe | 20 Browserabläufe bestanden, 0 Fehler |
| Geräte-/Schriftprofile in Chromium und WebKit | Je 11 Profile bestanden, 0 Fehler |
| JavaScript-Syntax der App-Module und des Service Workers | Bestanden |
| Kleine Texte im Standardthema | Kontrast erhöht, gemessen >5:1 auf dem Standardhintergrund |
| Tatsächliche iPhone-Installation über Safari | Noch nicht auf dem physischen Nutzergerät ausgeführt |

Die unveränderten Protokolle befinden sich in diesem Ordner. Browser-Screenshots wurden in kleiner iPhone-Ansicht und auf dem Desktop visuell kontrolliert. Es sind Aufnahmen der tatsächlich laufenden Web-App mit Testdaten.

## Browserabläufe

Version 1.1 ergänzt Prüfungen für Browser-Zurück/Vorwärts, doppelt abgesendete Tagebuchformulare, abgebrochene Gestaltung und leeres Inventar sowie einen echten Service-Worker-Versionswechsel. Beim Update bleiben ein ungespeicherter Profilentwurf bis zur bewussten Aktivierung und der gespeicherte Spielstand nach dem Versionswechsel erhalten. Auch ein schon vor einem Neustart wartendes Update wird angeboten. Protokolle: `browser-chromium-1.1.txt` und `browser-webkit-1.1.txt`.

Die zusätzlichen Layouttests (`npm run test:mobile`) prüfen 320×568, 375×667, 390×844, 430×932, 360×780, 412×915, 844×390, 768×1024 und 1440×1000 sowie 150 und 200 Prozent Schriftgröße. Sie kontrollieren alle sechs Bereiche und mehrere Dialoge auf seitliches Überlaufen, abgeschnittene Beschriftungen, überlappende Bedienelemente und Dialoggrenzen. Lange Nutzer-, Tier- und Aufgabennamen sind Teil der Testdaten. Die bewusst horizontal scrollbar gestaltete Shop-Kategorienleiste wird durch Auswahl der letzten Kategorie geprüft. Bei 390 und 360 Pixeln werden zusätzlich alle vier Themen jeweils hell und dunkel sowie ein auf 340 Pixel Höhe verkleinerter Eingabebereich mit erreichbarem Speichern-Button geprüft. Das simuliert begrenzten Platz; es ersetzt keinen Test einer echten Systemtastatur.

Behoben: abgeschnittene Tierauswahl bei schmalem Display/großer Schrift, zu enger Reise-Button, starre Formularspalten, zu kleine Schrift in Eingabefeldern, fehlende sichere Seiten-/Bodenabstände und sehr kleine alleinstehende Pfeil-Symbole. Mobile Navigation und Karten passen sich an; lange Bezeichnungen können umbrechen.

1. Onboarding, Startaufgaben, Abschluss/Rückgängig/erneuter Abschluss und echter Seitenneustart.
2. Tierart, Fellfarbe und Farbwelt ändern; Fortschritt nach Neustart erhalten.
3. Aufgabe anlegen, Wiederholung einstellen, bearbeiten, pausieren und löschen.
4. Shopvorschau, Kauf, Ausrüsten und Inventarpersistenz.
5. Reise starten, Zeit voranschreiten lassen, gespeicherte Geschichte beantworten, einmalige Belohnung.
6. Stimmung und Journal speichern, bearbeiten und löschen; HTML in Nutzereingaben wird nicht ausgeführt.
7. Fokus starten, pausieren, Zeit voranschreiten lassen, fortsetzen und einmalig abschließen.
8. Aufgabenidee übernehmen, Kalenderdatei erzeugen und persönliches Wochenziel speichern.
9. Journalsuche nach eigenem Text und eine vollständige Entspannungsübung.
10. Sicherung exportieren, Spielstand zurücksetzen, echte Sicherung importieren und beschädigten Import zurückweisen.
11. Offline-Neustart, offline erledigte Aufgabe und weiterhin nutzbare lokale Speicherung.
12. Gleichzeitige Transaktionen aus zwei Fenstern ohne doppelte Belohnung.
13. Erzwungener Schreibfehler: sichtbarer Zustand und Datenbank bleiben unverändert.
14. Beschädigte Datenbank: Fehlerseite und erhaltene Originaldaten statt automatischem Reset.
15. Alle Hauptbereiche bei 320/390/1440 Pixeln: kein horizontales Überlaufen.

## Offline-Testmethode für WebKit

Die Netzwerksimulation `setOffline(true)` löste einen internen WebKit-Fehler aus, obwohl alle 13 Ressourcen im Cache lagen. Das ist ein dokumentierter Fehler des Testwerkzeugs: [Playwright #42775](https://github.com/microsoft/playwright/issues/42775).

Deshalb startet der WebKit-Test einen eigenen echten lokalen HTTP-Server, lädt die App vollständig und beendet den Server anschließend. Ein Kontrollabruf aus dem Testprozess muss danach fehlschlagen. Erst dann lädt der Browser die App erneut und erledigt eine Aufgabe vollständig aus Cache und IndexedDB. Dieser Ablauf ist bestanden; es wird kein Offline-Test übersprungen. Chromium verwendet zusätzlich die eingebaute Offline-Simulation.

## Gefundene und behobene Probleme

- Schnelle aufeinanderfolgende Aktionen konnten während eines Speichervorgangs verworfen werden. Sie laufen jetzt in einer Warteschlange; die Datenbank sorgt zusätzlich für die Reihenfolge zwischen Fenstern.
- Wiederhergestellte IDs werden streng validiert, bevor sie in die Darstellung gelangen. Persönliche Texte werden escaped. Ungültige Sicherungen verändern den lokalen Stand nicht.
- Die Update-Aktivierung des Service Workers lädt die neue Version erst nach bewusster Auswahl. Eine abgebrochene Atemübung erhält keine Hintergrundbelohnung.
- Der ursprüngliche Textkontrast kleiner Hinweise wurde erhöht.
- Browserprüfungen warten vor einem künstlichen Zeitsprung oder Neustart auf das tatsächliche Speichern, statt einen noch laufenden Vorgang abzubrechen.

Zusätzlich ist geprüft, dass die Haustier-Vorschaubilder im Shop innerhalb der Bildfläche bleiben. Der Tastatursprung zum Hauptinhalt erhält den gewählten Bereich. Nach dem Onboarding beginnt der Startbildschirm oben.

## Grenzen der Abnahme

WebKit unter Linux ist eine Safari-verwandte Engine und kein physisches iPhone. Chromium-Profile sind kein physisches Samsung-Gerät und keine echte Samsung-Internet-Installation. „Zum Home-Bildschirm“, Systemtastatur, Speicherfreigabe, Dateidialoge und tatsächliche Kalenderübernahme bleiben auf echten Geräten zu prüfen. Große jahrelange Datenbestände sind noch nicht vermessen. Sicherungen sind für Geräte-/Browserwechsel erforderlich. Diese Version bietet Erinnerungen bei geöffneter App sowie Kalenderexport; Hintergrund-Push und automatische Synchronisierung sind nicht enthalten.

Es werden keine dauerhafte Browser-Speichergarantie und keine Garantie völliger Fehlerfreiheit behauptet. Die genannten Abläufe sind konkret geprüft und erfolgreich.

## GitHub-Prüfung und Veröffentlichung

Die Prüfung im öffentlichen Repository ist ebenfalls erfolgreich: https://github.com/hamedasgari2005-png/Hamed-Seite/actions/runs/41986593630 (29 Logiktests und 15 Chromium-Browserabläufe).

Die erstmalige Aktivierung von GitHub Pages wurde durch den Nutzer im öffentlichen Repository Hamed-Seite vorgenommen. Deployment erfolgreich: https://github.com/hamedasgari2005-png/Hamed-Seite/actions/runs/41991465191

Die produktive Adresse **https://hamedasgari2005-png.github.io/Hamed-Seite/** wurde am 05.11.2026 zusätzlich mit Chromium in 390×844 Pixeln geprüft:

- HTTP 200 und tatsächlich gerenderte Anwendung.
- Aufgabe abschließen und nach vollständigem Neuladen weiterhin korrekter Spielstand.
- Wechsel auf Hase/Lavendel, weiterhin erhaltene XP und Speicherung.
- Alle fünf Bereiche erreichbar, kein seitliches Überlaufen.
- Service Worker am Scope `/Hamed-Seite/` registriert.
- Browser offline schalten, Produktionsadresse neu laden und eine weitere Aufgabe erfolgreich offline speichern.
- Keine JavaScript-Laufzeitfehler in diesen Abläufen.

Dies sind Browserprüfungen mit isolierten Testdaten, keine Behauptung einer bereits erfolgten Installation auf dem persönlichen iPhone. Physische Safari-Installation und System-Kalenderübernahme bleiben auf dem Nutzergerät zu prüfen.
