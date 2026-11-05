# Mooslicht Web – Prüfbericht

Stand: 05.11.2026. Tatsächlich auf dem Entwicklungsrechner ausgeführt:

| Prüfung | Ergebnis |
|---|---|
| Node.js-Domänenlogik, Zeitzone Europe/Berlin | 29 Tests bestanden, 0 Fehler |
| Chromium, 390×844 sowie 320 und 1440 Pixel Breite | 15 Browserabläufe bestanden, 0 Fehler |
| Playwright WebKit 26.5, gleiche Abläufe | 15 Browserabläufe bestanden, 0 Fehler |
| JavaScript-Syntax der App-Module und des Service Workers | Bestanden |
| Kleine Texte im Standardthema | Kontrast erhöht, gemessen >5:1 auf dem Standardhintergrund |
| Tatsächliche iPhone-Installation über Safari | Noch nicht auf dem physischen Nutzergerät ausgeführt |

Die unveränderten Protokolle befinden sich in diesem Ordner. Browser-Screenshots wurden in kleiner iPhone-Ansicht und auf dem Desktop visuell kontrolliert. Es sind Aufnahmen der tatsächlich laufenden Web-App mit Testdaten.

## Browserabläufe

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

## Grenzen der Abnahme

WebKit unter Linux ist eine Safari-verwandte Engine und kein physisches iPhone. „Zum Home-Bildschirm“, iOS-Speicherfreigabe, iOS-Dateidialoge und tatsächliche Kalenderübernahme sind nach der Veröffentlichung auf dem Nutzergerät zu prüfen. Große jahrelange Datenbestände sind noch nicht vermessen. Sicherungen sind für Geräte-/Browserwechsel erforderlich. Diese Version bietet Erinnerungen bei geöffneter App sowie Kalenderexport; Hintergrund-Push und automatische Synchronisierung sind nicht enthalten.

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
