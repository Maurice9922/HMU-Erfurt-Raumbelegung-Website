// ===============================
// JS Script
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".room-card");
  const roomList = document.getElementById("room-list");
  const roomDetail = document.getElementById("room-detail");
  const backButton = document.getElementById("back-button");
  const filter = document.getElementById("room-filter");
  const body = document.body;
  const levels = document.querySelectorAll(".level-container");
  let currentLevelFilter = null;
  let lastFilterState = null; // Neue Variable: Speichert den letzten Filterzustand

// ===============================
// BROWSER BACK BUTTON: 1:1 KOPPLUNG
// ===============================

  window.addEventListener("popstate", () => {
    
    if (lastFilterState) {
      currentLevelFilter = lastFilterState;
    } else {
      currentLevelFilter = null;
    }
    
    backButton.click();
  });

// ===============================
// Konfiguration
// ===============================

  const MAX_BOOKINGS_DETAIL = 7;
  const MIN_DISPLAY = 2;

// ===============================
// HELPER: EBENEN MIT FADE
// ===============================

  function fadeSwitchLevels(callback) {
    roomList.classList.add("fade-out");

    setTimeout(() => {
      callback();

      roomList.classList.remove("fade-out");
      roomList.classList.add("fade-in");
      setTimeout(() => roomList.classList.remove("fade-in"), 300);
    }, 300);
  }

  function showAllLevels() {
    levels.forEach(l => l.classList.remove("hidden"));
  }

  function showOnlyLevel(level) {
    levels.forEach(l => {
      l.dataset.level === level
        ? l.classList.remove("hidden")
        : l.classList.add("hidden");
    });
  }

// ===============================
// ZURÜCK ZUM GRID
// ===============================

  function backToGrid() {
    roomDetail.classList.add("fade-out");

    setTimeout(() => {
      roomDetail.classList.add("hidden");
      roomDetail.classList.remove("fade-out");

      roomList.classList.remove("hidden");

      if (currentLevelFilter) {
        showOnlyLevel(currentLevelFilter);
      } else {
        showAllLevels();
      }

      roomList.classList.add("fade-in");

      setTimeout(() => {
        roomList.classList.remove("fade-in");
      }, 300);
    }, 300);
  }

// ===============================
// DETAIL CARD ERZEUGEN 
// ===============================

  function createDetailCard(card) {
    const clone = card.cloneNode(true);
    clone.classList.remove("cursor-pointer");
    clone.classList.add("w-full", "max-w-sm", "mx-auto");
    const glow = clone.querySelector("div.absolute");
    if (glow) {
      glow.classList.remove("opacity-0", "group-hover:opacity-100");
      glow.classList.add("opacity-80");
      glow.classList.remove("-inset-0.5");
      glow.classList.add("-inset-1");
    }
    const content = clone.querySelector("div.relative.bg-\\[oklch\\(25\\%_0\\.041_260\\.031\\)\\]");
    if (content) {
      content.classList.remove("p-6");
      content.classList.add("p-6");
    }
    return clone;
  }

// ===============================
// EINZELANSICHT 
// ===============================

  function showCard(card, delay = 300) {
    history.pushState(null, "", "#" + card.id);
    const switchingOnly = roomList.classList.contains("hidden") && roomDetail.children.length > 0;

    if (switchingOnly) {
      roomDetail.classList.add("fade-out");
      setTimeout(() => {
        roomDetail.classList.remove("fade-out");
        roomDetail.innerHTML = "";
        const roomId = card.id;
        const roomData = roomDataGlobal.find(r => r.id === roomId);
        if (roomData) {
          const detailCard = createDetailCard(card);
          roomDetail.appendChild(detailCard);
          renderRoom(roomData, "detail");
        }
        roomDetail.classList.add("fade-in");
        setTimeout(() => roomDetail.classList.remove("fade-in"), 300);
      }, 300);
      return;
    }

    roomList.classList.add("fade-out");
    setTimeout(() => {
      roomList.classList.add("hidden");
      roomList.classList.remove("fade-out");
      roomDetail.innerHTML = "";
      const detailCard = createDetailCard(card);
      roomDetail.appendChild(detailCard);
      const roomId = card.id;
      const roomData = roomDataGlobal.find(r => r.id === roomId);
      if (roomData) {
        renderRoom(roomData, "detail");
      }
      roomDetail.classList.remove("hidden");
      roomDetail.classList.add("fade-in");
      setTimeout(() => roomDetail.classList.remove("fade-in"), 300);
    }, delay);
  }

// ===============================
// CARD CLICK 
// ===============================

  cards.forEach(card => {
    card.addEventListener("click", () => {
      showCard(card);
      filter.value = card.id;
    });
  });

// ===============================
// FILTER 
// ===============================

  filter.addEventListener("change", () => {
    const value = filter.value;

    if (value.startsWith("LEVEL_")) {
      const level = value.replace("LEVEL_", "");
      currentLevelFilter = level;
      lastFilterState = level; // WICHTIG: Speichern wir den Zustand!
      history.pushState({ type: "level", level: level }, "", "#LEVEL_" + level);
    }

    if (value === "") {
      currentLevelFilter = null;
      lastFilterState = null; // WICHTIG: Resetzen wir den Zustand!
      if (!roomDetail.classList.contains("hidden")) backToGrid();
      fadeSwitchLevels(() => showAllLevels());
      return;
    }

    // Ebene-Filter (1-5)
    const levelMap = {
      "LEVEL_1": "1", "LEVEL_2": "2", "LEVEL_3": "3", "LEVEL_4": "4", "LEVEL_5": "5"
    };
    if (levelMap[value]) {
      const level = levelMap[value];
      currentLevelFilter = level;
      lastFilterState = level; // WICHTIG: Speichern!
      if (!roomDetail.classList.contains("hidden")) backToGrid();
      fadeSwitchLevels(() => showOnlyLevel(level));
      return;
    }

    // Einzelraum
    const card = document.getElementById(value);
    if (card) {
      const levelContainer = card.closest(".level-container");
      if (levelContainer) {
        fadeSwitchLevels(() => showOnlyLevel(levelContainer.dataset.level));
      }
      showCard(card);
      lastFilterState = null; // Raum = kein Ebenen-Filter
    }
  });

// ===============================
// ZURÜCK BUTTON 
// ===============================

backButton.addEventListener("click", e => {
  e.preventDefault();

  // 1. Detailansicht offen -> Zurück zum Grid
  if (!roomDetail.classList.contains("hidden")) {
    backToGrid();
   if (currentLevelFilter) {
    history.replaceState(
        { page: "level" },
        "",
        "#LEVEL_" + currentLevelFilter
    );
    } else {
        history.replaceState(
            { page: "location" },
            "",
            window.location.pathname + window.location.search
        );
    }
        return;
      }

  // 2. Grid offen, aber gefiltert (Ebene) -> Zurück zur Gesamtansicht
  // Hier prüfen wir jetzt lastFilterState, nicht nur currentLevelFilter
  if (lastFilterState) {
    const visibleLevels = Array.from(levels).filter(l => !l.classList.contains("hidden"));
    visibleLevels.forEach(l => l.classList.add("fade-out"));

    setTimeout(() => {
      showAllLevels();
      visibleLevels.forEach(l => l.classList.remove("fade-out"));
      levels.forEach(l => l.classList.add("fade-in"));
      setTimeout(() => levels.forEach(l => l.classList.remove("fade-in")), 300);
      currentLevelFilter = null;
      lastFilterState = null; // Resetzen!
      filter.value = "";
    }, 300);
    return;
  }

  // 3. Grid offen, kein Filter -> Startseite verlassen
  body.classList.add("fadeOutPage");
  setTimeout(() => window.location.href = backButton.href, 300);
});

// =====================================
// HASH / SEARCHBAR (INITIALISIERUNG) 
// =====================================

  const hash = window.location.hash.replace("#", "");
  if (hash) {
    const card = document.getElementById(hash);
    if (card) {
      const levelContainer = card.closest(".level-container");
      if (levelContainer) {
        showOnlyLevel(levelContainer.dataset.level);
      }
      roomList.classList.add("hidden");
      body.classList.remove("preload");
      body.style.opacity = 1;
      showCard(card, 50);
      filter.value = hash;
      currentLevelFilter = null;
      lastFilterState = null; // Raum = kein Ebenen-Filter
    } 
    else if (hash.startsWith("LEVEL_")) {

      const level = hash.replace("LEVEL_", "");

      currentLevelFilter = level;
      lastFilterState = level;

      filter.value = hash;

      showOnlyLevel(level);

      body.classList.remove("preload");
      body.classList.add("fade-in");
  }
  } else {
    currentLevelFilter = null;
    lastFilterState = null;
    filter.value = "";
    showAllLevels();
    setTimeout(() => {
      body.classList.remove("preload");
      body.classList.add("fade-in");
    }, 50);
  }
});


// ===============================
// Daten import
// ===============================

const DATA_URL = "https://raw.githubusercontent.com/Maurice9922/HMU-Erfurt-Raumbelegung-Website/refs/heads/main/rooms.json";
const MAX_CHARS = 30;
// Konstanten
const MAX_BOOKINGS_DETAIL = 7; // Maximal in Detailansicht
const MIN_DISPLAY = 2;         // Mindestens 2 Einträge (auch Platzhalter) in Grid UND Detail

// ===============================
// HELPER
// ===============================

function padText(text, length = MAX_CHARS) {
  if (!text) return "\u00A0".repeat(length);
  if (text.length > length) return text.substring(0, length);
  return text.padEnd(length, "\u00A0");
}

function formatGermanDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2,"0");
  const month = String(d.getMonth()+1).padStart(2,"0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

function formatDay(bDate) {
  if (!bDate) return "-";
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const bStr = new Date(bDate).toISOString().split("T")[0];

  if (todayStr === bStr) return "HEUTE";

  const dayNames = ["SO","MO","DI","MI","DO","FR","SA"];
  return dayNames[new Date(bDate).getDay()];
}

// ===============================
// STATUS BERECHNUNG
// ===============================

function getStatus(bookings) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMin = now.getHours()*60 + now.getMinutes();

  for (let b of bookings) {
    if (!b || b.date !== todayStr) continue;
    if (!b.start || !b.end) continue;

    const [sh, sm] = b.start.split(":").map(Number);
    const [eh, em] = b.end.split(":").map(Number);

    const startMin = sh*60 + sm;
    const endMin = eh*60 + em;

    if (currentMin >= startMin && currentMin <= endMin) {
      return "belegt";
    }
  }
  return "frei";
}

// ===============================
// RENDER
// ===============================

function wrapPersonText(text, maxLength = 30) {

  if (!text) return [""];

  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach(word => {

    if ((currentLine + " " + word).trim().length <= maxLength) {

      currentLine = (currentLine + " " + word).trim();

    } else {

      lines.push(currentLine);
      currentLine = word;

    }

  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function renderRoom(room, mode = "location") {
  const card = document.getElementById(room.id);
  if (!card) return;

  const bookingContainer = card.querySelector(".booking-container");
  const statusEl = card.querySelector(".room-status");
  const hoverGlow = card.querySelector("div.absolute");

  bookingContainer.innerHTML = "";

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMinutes = now.getHours()*60 + now.getMinutes();

  // ===============================
  // FILTER + SORT
  // ===============================

  let relevantBookings = (room.bookings || [])
    .filter(b => {
      if (!b || !b.date) return false;

      // Zukunft
      if (b.date > todayStr) return true;

      // Heute → nur wenn noch nicht beendet
      if (b.date === todayStr && b.end) {
        const [h, m] = b.end.split(":").map(Number);
        const endMinutes = h*60 + m;
        return endMinutes >= currentMinutes;
      }

      return false;
    })
    .sort((a, b) => {

      function isRunning(x) {
        if (x.date !== todayStr) return false;
        if (!x.start || !x.end) return false;

        const [sh, sm] = x.start.split(":").map(Number);
        const [eh, em] = x.end.split(":").map(Number);
        const startMin = sh*60 + sm;
        const endMin = eh*60 + em;

        return currentMinutes >= startMin && currentMinutes <= endMin;
      }

      // Laufende Buchung nach oben
      if (isRunning(a) && !isRunning(b)) return -1;
      if (!isRunning(a) && isRunning(b)) return 1;

      // Sonst normal nach Datum + Uhrzeit
      const dateA = new Date(`${a.date}T${a.start || "00:00"}`);
      const dateB = new Date(`${b.date}T${b.start || "00:00"}`);
      return dateA - dateB;
    })

  // ===============================
  // LIMITIERUNG & AUFFÜLLEN
  // ===============================

  // Grid-Modus: Maximal 2 Einträge (dann auffüllen)
  if (mode === "grid") {
    relevantBookings = relevantBookings.slice(0, MIN_DISPLAY);
  } 
  // Detail-Modus: Maximal 7 Einträge (dann auffüllen, falls < 2)
  else {
    relevantBookings = relevantBookings.slice(0, MAX_BOOKINGS_DETAIL);
  }

  // Immer auffüllen auf MIN_DISPLAY (2), egal ob Grid oder Detail
  while (relevantBookings.length < MIN_DISPLAY) {
    relevantBookings.push(null);
  }
  
  // ===============================
  // STATUS + HOVER
  // ===============================

  const status = getStatus(relevantBookings);
  statusEl.textContent = status;

  statusEl.classList.remove("text-red-500", "text-emerald-400");
  statusEl.classList.add(status === "belegt" ? "text-red-500" : "text-emerald-400");

  if (hoverGlow) {
    hoverGlow.classList.remove("bg-green-400/50", "bg-red-400/50");
    hoverGlow.classList.add(status === "belegt" ? "bg-red-400/50" : "bg-green-400/50");
  }

  // ===============================
  // BOOKINGS RENDER
  // ===============================

  relevantBookings.forEach((b, idx) => {
    const isLast = idx === relevantBookings.length - 1;

    // ---- ZEILE 1 ----
    const line1 = document.createElement("p");
    line1.className = "text-zinc-400 text-sm leading-5 whitespace-pre";
    
    if (b) {
      const dayText = formatDay(b.date);
      const dateText = formatGermanDate(b.date);
      const timeText = (b.start && b.end) ? `-> ${b.start} - ${b.end} Uhr` : "";
    
      const visibleText = `- ${dayText}: ${dateText} ${timeText}`;
      const fillLength = Math.max(0, MAX_CHARS - visibleText.length); 
    
      line1.innerHTML = `${visibleText}<span class="invisible">${"#".repeat(fillLength)}</span>`;
    
    } else {
      const visibleText = "- Keine Belegung -";
      const FILL_NO_BOOKING = 33; 
      const fillLength = Math.max(0, FILL_NO_BOOKING - visibleText.length);
    
      line1.innerHTML = `${visibleText}<span class="invisible">${"#".repeat(fillLength)}</span>`;
    }
    
    bookingContainer.appendChild(line1);

    // ---- ZEILE 2 ----
      const line2 = document.createElement("p");
      line2.className =
        "text-zinc-400 text-sm leading-5 pl-2.5 whitespace-normal break-words overflow-hidden" +
        (!isLast ? " mb-4" : "");

      if (b && b.person) {
        line2.textContent = b.person;
      } else {
        line2.innerHTML = `<span class="invisible">#</span>`;
      }

          bookingContainer.appendChild(line2);
        });
      }

// ===============================
// LOAD DATA
// ===============================

let roomDataGlobal = []; // Globale Variable für die Daten

async function loadRoomData() {
  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    roomDataGlobal = data.rooms; // Hier speichern
    
    data.rooms.forEach(room => renderRoom(room, "grid"));
  } catch(err) {
    console.error("Fehler beim Laden der Daten:", err);
    dataLoadingError = true;
    
    const cards = document.querySelectorAll(".room-card");
    cards.forEach(card => {
      const bookingContainer = card.querySelector(".booking-container");
      const statusEl = card.querySelector(".room-status");
      const hoverGlow = card.querySelector("div.absolute");

      if (bookingContainer) {
        bookingContainer.innerHTML = "";
        
        const MAX_CHARS = 30; 

        // ---- ZEILE 1 (Fehlermeldung) ----
        const line1 = document.createElement("p");
        // `whitespace-pre-wrap` erlaubt Umbruch bei 30 Zeichen, aber respektiert Leerzeichen davor
        line1.className = "text-red-500 text-sm leading-5 whitespace-pre-wrap max-w-[30ch] mb-6";
        
        const errorMsg = "❌ Daten konnten nicht geladen werden. Bitte die Seite neu laden oder später erneut versuchen.";
        const visibleText = `${errorMsg}`;
        
        // Wir füllen auf 30 Zeichen auf, damit die Breite immer gleich ist
        const fillLength = Math.max(0, MAX_CHARS - visibleText.length);
        
        line1.innerHTML = `${visibleText}<span class="invisible">${"#".repeat(fillLength)}</span>`;
        bookingContainer.appendChild(line1);
      }

      if (statusEl) {
        statusEl.textContent = "fehler";
        statusEl.classList.remove("text-emerald-400");
        statusEl.classList.add("text-red-500");
      }
      
      if (hoverGlow) {
        hoverGlow.classList.remove("bg-green-400/50");
        hoverGlow.classList.add("bg-red-400/50");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", loadRoomData);

// =================================
// AUTO-REFRESHER (ALLE 60 SEKUNDEN)
// =================================
  
  // Konfigurierbare Intervall-Zeit in Millisekunden (60000 = 1 Minute)
  const REFRESH_INTERVAL = 60000;

  // Funktion zum Laden der Daten ohne Neuladen der gesamten Seite
  async function refreshRoomData() {
    try {
      const res = await fetch(DATA_URL);
      
      if (!res.ok) {
        console.warn("Auto-Refresh fehlgeschlagen: HTTP-Status nicht ok");
        return;
      }

      const data = await res.json();
      
      // Prüfen, ob rooms existiert und ein Array ist
      if (!Array.isArray(data.rooms)) {
        console.warn("Auto-Refresh fehlgeschlagen: Ungültiges Datenformat");
        return;
      }

      let hasChanges = false;

      // Wir iterieren durch alle Räume und prüfen, ob sich die Buchungen geändert haben
      // Wir vergleichen die IDs und die Anzahl der Buchungen (einfacher Check)
      // Für eine tiefergehende Prüfung müssten wir die Buchungs-Objekte im Detail vergleichen.
      
      data.rooms.forEach(newRoom => {
        const existingCard = document.getElementById(newRoom.id);
        if (existingCard) {
          // Wir prüfen, ob sich die Buchungen geändert haben könnten
          // Ein einfacher Check: Hat sich die Anzahl der Buchungen geändert?
          const existingRoom = roomDataGlobal.find(r => r.id === newRoom.id);
          
          if (!existingRoom) {
            // Neuer Raum hinzugekommen (sollte in dieser App nicht passieren, aber sicherheitshalber)
            hasChanges = true;
          } else if (JSON.stringify(existingRoom.bookings) !== JSON.stringify(newRoom.bookings)) {
            // Buchungen haben sich geändert
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        console.log("Aktuelle Daten gefunden. Karten werden aktualisiert...");
        
        // Wir rufen renderRoom für ALLE Karten auf, um sie mit den neuen Daten zu aktualisieren.
        // Das ist effizient und sicher, da renderRoom das DOM nur aktualisiert, wenn sich etwas ändert.
        data.rooms.forEach(room => {
          // Wir verwenden "grid" als Modus, da wir im Grid bleiben wollen.
          // Wenn der Nutzer gerade in der Detailansicht ist, wird die Detailkarte trotzdem aktualisiert,
          // aber die Detailansicht selbst bleibt offen (da wir sie nicht schließen).
          // renderRoom findet die Karte im DOM und aktualisiert nur den Booking-Container.
          renderRoom(room, "grid");
        });

        // Optional: Ein kleines visuelles Feedback (z.B. ein kleiner Blink-Effekt auf einem Indikator),
        // damit der Nutzer merkt, dass sich etwas aktualisiert hat.
        // Hier einfach eine Konsole-Nachricht, um nicht aufdringlich zu sein.
      } else {
        // console.log("Keine Änderungen an den Buchungen festgestellt.");
      }

      // Aktualisieren wir auch die globale Variable
      roomDataGlobal = data.rooms;

    } catch (err) {
      console.error("Fehler beim Auto-Refresh:", err);
    }
  }

  // Startet den Timer
  // 60000 ms = 1 Minute
  setInterval(refreshRoomData, REFRESH_INTERVAL);

  
