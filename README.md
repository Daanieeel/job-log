# JobLog

JobLog ist eine persönliche iOS-App zum Protokollieren der eigenen Arbeit. Die Idee: Man trägt in dem Moment, in dem man etwas bei der Arbeit erledigt, kurz ein, was man gerade getan hat. Diese Einträge werden gespeichert und können später mit Hilfe von KI zu Zusammenfassungen (täglich, wöchentlich, monatlich, ...) verdichtet werden.

Die App ist für **einen einzelnen Nutzer** gedacht und läuft **komplett offline** – es gibt kein Backend und keinen Account.

## Grundprinzipien

Diese Punkte gelten für die ganze App und sollten bei jeder Entscheidung im Hinterkopf bleiben:

- **Minimalistisch & modern**: einfaches, aufgeräumtes Design mit unkomplizierter Bedienung
- **Offline-first**: keine Internetverbindung nötig, kein Backend, kein Account
- **Mehrsprachig**: UI auf Deutsch und Englisch verfügbar
- **On-device AI**: alle KI-Funktionen laufen lokal auf dem Gerät (keine Cloud-APIs, nutze die Apple On-Device Models)
- **iOS only**: Android muss nicht unterstützt werden, wir benutzen trotzdem React Native

## Screens

Die App besteht aus vier Haupt-Tabs. Jeder Screen ist unten mit seinen Anforderungen aufgelistet.

### 1. Home

Der Startbildschirm; hier verbringt man die meiste Zeit während der Arbeit.

- [ ] Bereits geloggte Aktivitäten anzeigen (und einfach bearbeiten können)
- [ ] Schnell erreichbarer Input, um zügig einen neuen Eintrag zu loggen
- [ ] Aktuelles Datum/Uhrzeit prominent sichtbar

### 2. Archiv

Übersicht über alle vergangenen Einträge, gruppiert nach Tagen.

- [ ] Zeigt alle Tage in der gewählten Zeitspanne
- [ ] Klick auf einen Tag → Detailseite mit allen rohen Einträgen dieses Tages
- [ ] Tage ohne Eintrag müssen sich optisch von Tagen mit Eintrag unterscheiden
- [ ] Jeder Tag zeigt (dezent) den Wochentag an
- [ ] Zeitspannen-Filter für die angezeigten Tage:
  - [ ] Presets: „Diese Woche", „Letzte Woche", „Dieser Monat", „Letzter Monat", „Dieses Jahr", „Letztes Jahr"
  - [ ] alternativ Freie Auswahl über einen Kalender
- [ ] Einträge hinzufügen/bearbeiten/löschen möglich

### 3. Zusammenfassungen

Hier erzeugt die on-device AI aus den rohen Einträgen lesbare Zusammenfassungen.

- [ ] Zeitspanne auswählbar (genau wie im Archiv)
- [ ] Zeigt einen Zusammenfassungstext für die gewählte Zeitspanne (darf bzw. soll auch Stichpunkte enthalten, sollte aber wie normaler Fließtext lesbar sein)
  - [ ] Falls noch nicht generiert: Loading-Zustand anzeigen
- [ ] Button zum Neugenerieren der Zusammenfassung
  - [ ] optionales Text-Feld für Feedback an die AI, was beim Neugenerieren beachtet werden soll
- [ ] Button zum Kopieren des Texts
- [ ] Einmal generierte Zusammenfassungen werden gespeichert, damit sie beim nächsten Öffnen sofort angezeigt werden (keine erneute Generierung nötig)

### 4. Einstellungen

- [ ] Color Theme: Dark / Light / System
- [ ] Sprachauswahl
- [ ] Info-Box, ob das on-device AI-Modell auf diesem Gerät verfügbar ist
- [ ] `Export all app data` → exportiert alle Daten aus der App
- [ ] `Import data` → importiert zuvor exportierte Daten (z. B. von einem anderen Gerät)
- [ ] `Clear all app data` → löscht alle Daten (mit zusätzlichem Bestätigungsdialog als Sicherheitsnetz)

## Möglicher Tech Stack

Kurze Einordnung, wofür jedes Paket gedacht ist:

| Package | Zweck |
|---|---|
| [Expo](https://expo.dev/) | Framework/Tooling rund um React Native (Build, Dev-Server, native Module) |
| [NativeWind](https://www.nativewind.dev/) | Tailwind-CSS-Syntax für React-Native-Styling |
| [react-native-reusables](https://reactnativereusables.com/) | anpassbare UI Components (React-Native Pendant zu shadcn/ui) |
| [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) <br /> → [Gutes Tutorial mit Drizzle](https://expo.dev/blog/modern-sqlite-for-react-native-apps) | Lokale Datenbank auf dem Gerät |
| [date-fns](https://date-fns.org/) | Hilfsfunktionen für Datums-/Zeitberechnungen |
| [`@eitjuh/expo-apple-intelligence`](https://github.com/eitjuh/expo-apple-intelligence) | Zugriff auf Apples on-device AI-Modell |
| [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | Haptisches Feedback (Vibration) |
| [expo-font](https://docs.expo.dev/versions/latest/sdk/font/) + [`@expo-google-fonts/<font-name>`](https://github.com/expo/google-fonts) | Einbindung von Google Fonts |
