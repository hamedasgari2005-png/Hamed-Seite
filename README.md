# Mooslicht Web

Installierbare, kostenlose Selbstfürsorge-Web-App mit eigenständig gestaltetem Haustier, rosa Startumgebung und weiteren Farbwelten. Die Oberfläche und die Datenverarbeitung laufen vollständig auf dem Gerät. Kein Konto, keine Werbung, keine Echtgeldkäufe, keine externen Schriftarten und kein App-Server.

## Öffnen und installieren

**Online öffnen: https://hamedasgari2005-png.github.io/Hamed-Seite/**

GitHub Pages ist aktiviert. Die öffentliche HTTPS-Adresse wurde am 05.11.2026 zusätzlich im Browser geprüft: Aufgaben und Gestaltung bleiben nach Neuladen erhalten; alle fünf Bereiche sind erreichbar; der Service Worker kontrolliert den richtigen Unterpfad; Offline-Neustart und offline gespeicherte Aufgaben funktionieren. Keine JavaScript-Laufzeitfehler in diesen Abläufen.

Auf dem iPhone in Safari öffnen → Teilen → Zum Home-Bildschirm → Hinzufügen. Beim ersten Online-Besuch lädt der Service Worker alle erforderlichen App-Dateien. Danach ist die Kernfunktion auch offline verfügbar. Die App funktioniert ebenfalls auf Android und Windows; dort steht gegebenenfalls „App installieren“ im Browsermenü zur Verfügung.

Der Browser entscheidet über die Speicherdauer. Vor dem Löschen von Browserdaten, vor einem Gerätewechsel und regelmäßig zwischendurch unter Einstellungen eine Sicherung herunterladen. Safari und eine separat installierte Web-App können unterschiedliche Speicherbereiche verwenden: den Spielstand bei Bedarf über die Sicherungsdatei übertragen. Es gibt keine automatische Geräte- oder Personensynchronisierung. Jeder Nutzer erhält seinen eigenen lokalen Spielstand.

## Funktionsumfang

Version 1.1.1 ergänzt Touch-Tests, entfernt die Trefferfläche von Erfolgsmeldungen über Buttons und unterbindet auf Nutzerwunsch Seitenzoom. Eingabefelder verwenden mindestens 16 Pixel Schrift. Normales Wischen und Texteingabe bleiben möglich. Reisebuttons erklären fehlende Energie oder benötigte Level. Auf dem Home-Bildschirm installiert startet die App im eigenständigen Fenster; Browser- und Betriebssystemfunktionen außerhalb der App werden dadurch nicht verändert.

Version 1.1 verbessert die Darstellung auf iPhone- und Samsung-Displaygrößen, Querformat und bei großer Schrift. Aufgaben folgen auf Handys direkt auf das Haustier. Neu sind Kategorie-Symbole und die Schnellauswahl im Atelier. Browser-Zurück/Vorwärts, Schutz vor doppeltem Absenden und die Anzeige bereits wartender Updates sind korrigiert.

Samsung Internet: Menü (≡) → „Seite hinzufügen zu“ → „Startbildschirm“, je nach Version „App installieren“. Chrome auf Android: Menü (⋮) → „Zum Startbildschirm hinzufügen“ → „Installieren“. Bestehende Installation für Updates online öffnen und im Hinweis „Jetzt laden“ wählen. Ein Löschen oder Neuinstallieren ist dafür nicht erforderlich.

- Bär, Fuchs, Hase und Waldgeist; sechs Fellfarben, drei Muster, vier Farbwelten; Hell/Dunkel/System; animiertes Streicheln, Laufen, Spielen, Essen und Schlafen.
- Aufgaben erstellen, bearbeiten, pausieren und archivieren; einmalig/täglich/wöchentlich/an gewählten Wochentagen; Kategorie, Priorität, Uhrzeit; Tagesliste und offene einmalige Aufgaben; acht anpassbare Vorlagen.
- XP, Level, Energie und Münzen; Belohnungen pro Fälligkeit nur einmal, auch nach Rückgängig; nachvollziehbares Buchungsjournal; keine Strafe für Pausen.
- Drei Reisegebiete, 24 eigene Geschichten mit Entscheidungen, gespeicherte Reiseendzeit, Entdeckungsalbum und Freischaltungen.
- 36 Gegenstände, sechs kostenlose rosa Startmöbel; Shop mit Vorschau, Inventar, Kleidung und sechs Raumslots.
- Tagesstimmung und Emotionen, Tagebuch/Dankbarkeit/Reflexion mit Bearbeiten/Löschen/Suche, 30 Impulse, Atemübung, Fokus-Timer und drei angeleitete Entspannungen.
- Persönliche Wochenziele, Kalender mit Tagesdetails, Wochen-/Monatsübersicht, Stimmungsverlauf und Meilensteine.
- Vollständiger Datenexport/-import mit Validierung, bewusster Reset und sichere Fehleranzeige bei nicht lesbaren Daten. Kein automatisches Zurücksetzen.
- Hinweise zu Aufgaben bei geöffneter App und echte `.ics`-Kalenderdateien für Termine bei geschlossener App. Ohne Push-Server versendet diese Version keine Hintergrund-Push-Mitteilungen. In den Kalender exportierte Termine müssen dort separat bearbeitet/entfernt werden.

## Technik

Buildlose ES-Module, HTML, CSS und eigene SVG-Illustrationen. IndexedDB speichert sämtliche Werte in einer gemeinsamen Lese-/Schreibtransaktion. Erst nach erfolgreichem Schreiben zeigt die UI den neuen Stand. Datenbanktransaktionen schützen auch vor gleichzeitig geöffneten Fenstern; BroadcastChannel aktualisiert deren Ansichten. Innerhalb eines Fensters werden Aktionen in Reihenfolge verarbeitet. Wiederkehrende Fälligkeiten verwenden lokale Kalendertage statt fester 24-Stunden-Abstände.

Der Service Worker speichert ausschließlich den App-Code und Grafiken, keine Tagebuchtexte. Aktualisierungen werden beim nächsten Online-Besuch angeboten und erst nach bewusster Auswahl aktiviert. Bei Codeänderungen nach einer Veröffentlichung die Cache-Version in `sw.js` erhöhen. Alle Ressourcen sind relativ verlinkt, sodass GitHub-Pages-Unterpfade funktionieren.

Ein Nutzerimport wird vor dem Schreiben vollständig validiert. Fehler, falsche Schema-Versionen, ungültige Beziehungen und manipulierte IDs bleiben ohne Änderung des bisherigen Spielstands. Nutzertexte werden bei der Anzeige escaped. Große langfristige Datenbestände und physische Geräteperformance sind separat zu prüfen.

## Entwicklung und Prüfungen

```sh
npm ci --ignore-scripts
npm test
python3 -m http.server 8080
# In einem zweiten Terminal, bei laufendem Server:
npx playwright install chromium
npm run test:browser
npm run test:mobile
npm run test:touch
```

Die Laufzeit benötigt keine npm-Pakete. Playwright ist ausschließlich eine Entwicklungsabhängigkeit. `MOOSLICHT_URL` wählt eine andere Testadresse; `MOOSLICHT_BROWSER=webkit` wählt die Safari-verwandte Engine, sofern lokal verfügbar. Screenshots liegen in `test-results/`. Browser-Fixtures enthalten nur Testdaten und verändern keine echten Nutzerkonten.

Die native Swift-Version liegt separat im privaten Repository Mooslicht. Der Web-Stand ist eine eigene Umsetzung der gleichen Spielregeln; native SwiftData-Dateien sind keine Web-Sicherungen und werden nicht automatisch importiert. UI-Texte sind deutsch, Spiellogik, Inhalte, Darstellung und Speicherung sind in getrennten Modulen angelegt.

Für spätere Erweiterungen geeignet: weitere Tierarten/Gegenstände/Geschichten als neue Katalogeinträge, übersetzte Inhalte und zusätzliche Übungen. Freundesfunktionen und automatische Synchronisierung würden ein gesondertes Server-/Kontokonzept erfordern und sind hier nicht als funktionslose Bedienelemente enthalten.

Eigene Formen und Geschichten; keine Finch-Assets. GitHub Pages verwendet die vorhandene kostenfreie `github.io`-Adresse, keine eigene kostenpflichtige Domain.
