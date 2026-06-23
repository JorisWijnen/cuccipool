// State variables
let leaderboardData = null;
let actualResults = {
  matches: {},
  topscorers: {},
  champion: ""
};
let participants = []; // Recalculated state for all participants
let activeRound = "Round 1";
let selectedPlayers = [];
let topscorerFilter = "";
let compareSearchQuery = "";

// Player-to-country flag ISO codes mapping (lowercase for flagcdn.com)
const playerCountries = {
  "C. Gakpo": "nl",
  "M. Depay": "nl",
  "D. Dumfries": "nl",
  "D. Malen": "nl",
  "E. Haaland": "no",
  "F. Wirtz": "de",
  "J. Musiala": "de",
  "K. Havertz": "de",
  "D. Undav": "de",
  "H. Kane": "gb-eng",
  "J. Bellingham": "gb-eng",
  "K. Mbappe": "fr",
  "O. Dembele": "fr",
  "M. Olise": "fr",
  "L. Messi": "ar",
  "L. Martinez": "ar",
  "J. Alvarez": "ar",
  "L. Yamal": "es",
  "M. Oyarzabal": "es",
  "F. Torres": "es",
  "Vinicius Jr.": "br",
  "Neymar": "br",
  "M. Cunha": "br",
  "Raphinha": "br",
  "L. Paqueta": "br",
  "C. Ronaldo": "pt",
  "C.Ronaldo": "pt",
  "G. Ramos": "pt",
  "B. Fernandes": "pt",
  "M. Salah": "eg",
  "R. Lukaku": "be",
  "E. Dzeko": "ba",
  "R. Jimenez": "mx",
  "B. Diaz": "ma"
};

// Team code to ISO flag mappings (lowercase for flagcdn.com)
const teamFlags = {
  "MEX": "mx", "ZAF": "za", "ZKO": "kr", "CZE": "cz", "CAN": "ca",
  "BOS": "ba", "QAT": "qa", "SUI": "ch", "BRA": "br", "MAR": "ma",
  "HAI": "ht", "SCO": "gb-sct", "USA": "us", "PAR": "py", "AUS": "au",
  "TUR": "tr", "GER": "de", "CUW": "cw", "IVO": "ci", "ECU": "ec",
  "NED": "nl", "JAP": "jp", "SWE": "se", "TUN": "tn", "ESP": "es",
  "CPV": "cv", "SAR": "sa", "URU": "uy", "BEL": "be", "EGY": "eg",
  "IRN": "ir", "NZL": "nz", "FRA": "fr", "SEN": "sn", "IRK": "iq",
  "NOO": "no", "ARG": "ar", "ALG": "dz", "AUT": "at", "JOR": "jo",
  "POR": "pt", "COD": "cd", "OEZ": "uz", "COL": "co", "ENG": "gb-eng",
  "CRO": "hr", "GHA": "gh", "PAN": "pa"
};

// Team code to full country names mapping
const teamNames = {
  "MEX": "Mexico",
  "ZAF": "South Africa",
  "ZKO": "South Korea",
  "CZE": "Czech Republic",
  "CAN": "Canada",
  "BOS": "Bosnia & Herzegovina",
  "QAT": "Qatar",
  "SUI": "Switzerland",
  "BRA": "Brazil",
  "MAR": "Morocco",
  "HAI": "Haiti",
  "SCO": "Scotland",
  "USA": "United States",
  "PAR": "Paraguay",
  "AUS": "Australia",
  "TUR": "Turkey",
  "GER": "Germany",
  "CUW": "Curaçao",
  "IVO": "Ivory Coast",
  "ECU": "Ecuador",
  "NED": "Netherlands",
  "JAP": "Japan",
  "SWE": "Sweden",
  "TUN": "Tunisia",
  "ESP": "Spain",
  "CPV": "Cape Verde",
  "SAR": "Saudi Arabia",
  "URU": "Uruguay",
  "BEL": "Belgium",
  "EGY": "Egypt",
  "IRN": "Iran",
  "NZL": "New Zealand",
  "FRA": "France",
  "SEN": "Senegal",
  "IRK": "Iraq",
  "NOO": "Norway",
  "ARG": "Argentina",
  "ALG": "Algeria",
  "AUT": "Austria",
  "JOR": "Jordan",
  "POR": "Portugal",
  "COD": "DR Congo",
  "OEZ": "Uzbekistan",
  "COL": "Colombia",
  "ENG": "England",
  "CRO": "Croatia",
  "GHA": "Ghana",
  "PAN": "Panama"
};

// Match Schedule Mapping (Rounds, dates, times, and order)
const matchSchedule = {
  // Round 1
  "MEX-ZAF": { round: "Round 1", date: "June 11, 2026", time: "21:00", order: 1 },
  "ZKO-CZE": { round: "Round 1", date: "June 12, 2026", time: "04:00", order: 2 },
  "CAN-BOS": { round: "Round 1", date: "June 12, 2026", time: "21:00", order: 3 },
  "QAT-SUI": { round: "Round 1", date: "June 13, 2026", time: "00:00", order: 4 },
  "USA-PAR": { round: "Round 1", date: "June 13, 2026", time: "03:00", order: 5 },
  "BRA-MAR": { round: "Round 1", date: "June 13, 2026", time: "21:00", order: 6 },
  "HAI-SCO": { round: "Round 1", date: "June 14, 2026", time: "00:00", order: 7 },
  "AUS-TUR": { round: "Round 1", date: "June 14, 2026", time: "03:00", order: 8 },
  "GER-CUW": { round: "Round 1", date: "June 14, 2026", time: "19:00", order: 9 },
  "NED-JAP": { round: "Round 1", date: "June 14, 2026", time: "22:00", order: 10 },
  "IVO-ECU": { round: "Round 1", date: "June 15, 2026", time: "01:00", order: 11 },
  "SWE-TUN": { round: "Round 1", date: "June 15, 2026", time: "04:00", order: 12 },
  "ESP-CPV": { round: "Round 1", date: "June 15, 2026", time: "19:00", order: 13 },
  "BEL-EGY": { round: "Round 1", date: "June 15, 2026", time: "22:00", order: 14 },
  "SAR-URU": { round: "Round 1", date: "June 16, 2026", time: "01:00", order: 15 },
  "IRN-NZL": { round: "Round 1", date: "June 16, 2026", time: "04:00", order: 16 },
  "FRA-SEN": { round: "Round 1", date: "June 16, 2026", time: "19:00", order: 17 },
  "IRK-NOO": { round: "Round 1", date: "June 16, 2026", time: "22:00", order: 18 },
  "ARG-ALG": { round: "Round 1", date: "June 17, 2026", time: "01:00", order: 19 },
  "AUT-JOR": { round: "Round 1", date: "June 17, 2026", time: "04:00", order: 20 },
  "POR-COD": { round: "Round 1", date: "June 17, 2026", time: "19:00", order: 21 },
  "ENG-CRO": { round: "Round 1", date: "June 17, 2026", time: "22:00", order: 22 },
  "GHA-PAN": { round: "Round 1", date: "June 18, 2026", time: "01:00", order: 23 },
  "OEZ-COL": { round: "Round 1", date: "June 18, 2026", time: "04:00", order: 24 },

  // Round 2
  "CZE-ZAF": { round: "Round 2", date: "June 18, 2026", time: "19:00", order: 25 },
  "SUI-BOS": { round: "Round 2", date: "June 18, 2026", time: "22:00", order: 26 },
  "CAN-QAT": { round: "Round 2", date: "June 19, 2026", time: "01:00", order: 27 },
  "MEX-ZKO": { round: "Round 2", date: "June 19, 2026", time: "04:00", order: 28 },
  "USA-AUS": { round: "Round 2", date: "June 19, 2026", time: "19:00", order: 29 },
  "SCO-MAR": { round: "Round 2", date: "June 19, 2026", time: "22:00", order: 30 },
  "BRA-HAI": { round: "Round 2", date: "June 20, 2026", time: "01:00", order: 31 },
  "TUR-PAR": { round: "Round 2", date: "June 20, 2026", time: "04:00", order: 32 },
  "NED-SWE": { round: "Round 2", date: "June 20, 2026", time: "19:00", order: 33 },
  "GER-IVO": { round: "Round 2", date: "June 20, 2026", time: "22:00", order: 34 },
  "ECU-CUW": { round: "Round 2", date: "June 21, 2026", time: "01:00", order: 35 },
  "TUN-JAP": { round: "Round 2", date: "June 21, 2026", time: "04:00", order: 36 },
  "ESP-SAR": { round: "Round 2", date: "June 21, 2026", time: "19:00", order: 37 },
  "BEL-IRN": { round: "Round 2", date: "June 21, 2026", time: "22:00", order: 38 },
  "URU-CPV": { round: "Round 2", date: "June 22, 2026", time: "01:00", order: 39 },
  "NZL-EGY": { round: "Round 2", date: "June 22, 2026", time: "04:00", order: 40 },
  "ARG-AUT": { round: "Round 2", date: "June 22, 2026", time: "19:00", order: 41 },
  "FRA-IRK": { round: "Round 2", date: "June 22, 2026", time: "22:00", order: 42 },
  "NOO-SEN": { round: "Round 2", date: "June 23, 2026", time: "01:00", order: 43 },
  "JOR-ALG": { round: "Round 2", date: "June 23, 2026", time: "04:00", order: 44 },
  "POR-OEZ": { round: "Round 2", date: "June 23, 2026", time: "19:00", order: 45 },
  "ENG-GHA": { round: "Round 2", date: "June 23, 2026", time: "22:00", order: 46 },
  "PAN-CRO": { round: "Round 2", date: "June 24, 2026", time: "01:00", order: 47 },
  "COL-COD": { round: "Round 2", date: "June 24, 2026", time: "04:00", order: 48 },

  // Round 3
  "SUI-CAN": { round: "Round 3", date: "June 24, 2026", time: "22:00", order: 49 },
  "BOS-QAT": { round: "Round 3", date: "June 24, 2026", time: "22:00", order: 50 },
  "MAR-HAI": { round: "Round 3", date: "June 25, 2026", time: "01:00", order: 51 },
  "SCO-BRA": { round: "Round 3", date: "June 25, 2026", time: "01:00", order: 52 },
  "ZAF-ZKO": { round: "Round 3", date: "June 25, 2026", time: "04:00", order: 53 },
  "CZE-MEX": { round: "Round 3", date: "June 25, 2026", time: "04:00", order: 54 },
  "CUW-IVO": { round: "Round 3", date: "June 25, 2026", time: "22:00", order: 55 },
  "ECU-GER": { round: "Round 3", date: "June 25, 2026", time: "22:00", order: 56 },
  "TUN-NED": { round: "Round 3", date: "June 26, 2026", time: "01:00", order: 57 },
  "JAP-SWE": { round: "Round 3", date: "June 26, 2026", time: "01:00", order: 58 },
  "PAR-AUS": { round: "Round 3", date: "June 26, 2026", time: "04:00", order: 59 },
  "TUR-USA": { round: "Round 3", date: "June 26, 2026", time: "04:00", order: 60 },
  "NOO-FRA": { round: "Round 3", date: "June 26, 2026", time: "22:00", order: 61 },
  "SEN-IRK": { round: "Round 3", date: "June 26, 2026", time: "22:00", order: 62 },
  "URU-ESP": { round: "Round 3", date: "June 27, 2026", time: "01:00", order: 63 },
  "CPV-SAR": { round: "Round 3", date: "June 27, 2026", time: "01:00", order: 64 },
  "EGY-IRN": { round: "Round 3", date: "June 27, 2026", time: "04:00", order: 65 },
  "NZL-BEL": { round: "Round 3", date: "June 27, 2026", time: "04:00", order: 66 },
  "CRO-GHA": { round: "Round 3", date: "June 27, 2026", time: "22:00", order: 67 },
  "PAN-ENG": { round: "Round 3", date: "June 27, 2026", time: "22:00", order: 68 },
  "COD-OEZ": { round: "Round 3", date: "June 28, 2026", time: "01:00", order: 69 },
  "COL-POR": { round: "Round 3", date: "June 28, 2026", time: "01:00", order: 70 },
  "JOR-ARG": { round: "Round 3", date: "June 28, 2026", time: "04:00", order: 71 },
  "ALG-AUT": { round: "Round 3", date: "June 28, 2026", time: "04:00", order: 72 }
};

// Points multiplier
const multiplierMap = {
  attacker: 8,
  midfielder: 16,
  defender: 32
};

// Start execution when DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  
  // Poll for updates from server every 10 seconds to keep clients in sync
  setInterval(async () => {
    try {
      const actualRes = await fetch("actual_results.json?t=" + new Date().getTime()).then(res => res.json());
      
      // Only reload if changes are detected to avoid disrupting user input focus
      if (JSON.stringify(actualResults) !== JSON.stringify(actualRes)) {
        // Safety: check if user is currently typing in an input to avoid resetting their UI
        const isEditingMatches = document.activeElement && document.activeElement.classList.contains("actual-score-input");
        const isEditingGoals = document.activeElement && document.activeElement.closest(".goals-input-wrapper");
        const isEditingChamp = document.activeElement && document.activeElement.id === "actual-champion-input";
        
        if (isEditingMatches || isEditingGoals || isEditingChamp) {
          // Defer update to avoid disrupting user input
          return;
        }
        
        const leaderboardRes = await fetch("leaderboard.json?t=" + new Date().getTime()).then(res => res.json());
        leaderboardData = leaderboardRes;
        actualResults = actualRes;
        participants = JSON.parse(JSON.stringify(leaderboardData.participantsDetails));
        
        document.getElementById("actual-champion-input").value = actualResults.champion || "";
        recalculate();
      }
    } catch (error) {
      console.warn("Real-time synchronization polling failed:", error);
    }
  }, 10000);
});

// Load JSON data from server
async function loadData() {
  try {
    const [leaderboardRes, actualRes] = await Promise.all([
      fetch("leaderboard.json").then(res => res.json()),
      fetch("actual_results.json").then(res => res.json())
    ]);

    leaderboardData = leaderboardRes;
    actualResults = actualRes;

    // Initialize participants detailed state
    participants = JSON.parse(JSON.stringify(leaderboardData.participantsDetails));
    
    // Set up comparison list and default selection (first 2 players)
    const participantNames = participants.map(p => p.name);
    selectedPlayers = [participantNames[0], participantNames[1]].filter(Boolean);
    const compareCountEl = document.getElementById("compare-count");
    if (compareCountEl) {
      compareCountEl.textContent = selectedPlayers.length;
    }

    buildRoundNavigation();
    
    // Fill the actual champion in the input field
    document.getElementById("actual-champion-input").value = actualResults.champion || "";
    
    // Perform initial recalculation
    recalculate();
    
  } catch (error) {
    console.error("Error loading pool data:", error);
    showErrorMessage();
  }
}

function showErrorMessage() {
  const container = document.querySelector(".app-container");
  container.innerHTML = `
    <div style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2); padding: 2rem; border-radius: 12px; text-align: center; margin: 4rem auto; max-width: 600px;">
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--accent-rose); margin-bottom: 1rem;"></i>
      <h2 style="font-family: var(--font-display); margin-bottom: 0.5rem;">Could not load data</h2>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Please make sure you have run the calculation script to generate the JSON files, and are serving the folder from a local web server.</p>
      <div style="background: #000; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem; text-align: left; margin-bottom: 1.5rem; color: #a7f3d0;">
        # Run in your command prompt:<br>
        python calculate.py<br>
        python -m http.server
      </div>
      <button class="btn btn-primary" onclick="window.location.reload()" style="max-width: 200px; margin: 0 auto;">Retry Load</button>
    </div>
  `;
}

// Open and close Compare Players Modal
window.openComparePopup = function() {
  compareSearchQuery = "";
  const searchInput = document.getElementById("compare-search-input");
  if (searchInput) searchInput.value = "";
  renderComparePlayersList();
  document.getElementById("compare-modal").classList.add("active");
};

window.closeComparePopup = function() {
  document.getElementById("compare-modal").classList.remove("active");
};

// Bulk select comparison players (all or none)
window.selectBulkCompare = function(type) {
  const container = document.getElementById("compare-players-list-container");
  if (!container) return;
  const checkboxes = container.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(cb => {
    cb.checked = (type === 'all');
    const label = cb.closest(".compare-player-checkbox-item");
    if (label) {
      if (type === 'all') {
        label.classList.add("checked");
      } else {
        label.classList.remove("checked");
      }
    }
  });
};

// Toggle class on checkbox state change
window.toggleCompareCheckboxClass = function(cb) {
  const item = cb.closest(".compare-player-checkbox-item");
  if (item) {
    if (cb.checked) {
      item.classList.add("checked");
    } else {
      item.classList.remove("checked");
    }
  }
};

// Filter compare players checklist by search input
window.filterComparePlayers = function(query) {
  compareSearchQuery = query.trim().toLowerCase();
  renderComparePlayersList();
};

function renderComparePlayersList() {
  const container = document.getElementById("compare-players-list-container");
  if (!container) return;
  container.innerHTML = "";
  
  // Sort participants by name for easy searching
  const sortedParticipants = [...participants].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedParticipants.forEach(p => {
    if (compareSearchQuery && !p.name.toLowerCase().includes(compareSearchQuery)) {
      return;
    }
    const isSelected = selectedPlayers.includes(p.name);
    const item = document.createElement("label");
    item.className = `compare-player-checkbox-item ${isSelected ? "checked" : ""}`;
    item.innerHTML = `
      <input type="checkbox" value="${p.name}" ${isSelected ? "checked" : ""} onchange="toggleCompareCheckboxClass(this)">
      <span title="${p.name}">${p.name}</span>
    `;
    container.appendChild(item);
  });
}

window.applyCompareSelection = function() {
  const container = document.getElementById("compare-players-list-container");
  if (!container) return;
  
  const selected = [];
  container.querySelectorAll("input[type='checkbox']:checked").forEach(cb => {
    selected.push(cb.value);
  });
  
  if (selected.length === 0) {
    alert("Please select at least one player to compare.");
    return;
  }
  
  selectedPlayers = selected;
  const compareCountEl = document.getElementById("compare-count");
  if (compareCountEl) {
    compareCountEl.textContent = selectedPlayers.length;
  }
  closeComparePopup();
  renderActiveRoundMatches();
};

// Round Navigation Menu (Round 1 - 3)
function buildRoundNavigation() {
  const nav = document.getElementById("rounds-navigation");
  if (!nav) return;
  nav.innerHTML = "";
  
  const rounds = ["Round 1", "Round 2", "Round 3"];
  
  rounds.forEach(round => {
    const btn = document.createElement("button");
    btn.className = `round-nav-link ${round === activeRound ? "active" : ""}`;
    btn.innerHTML = `
      <span>${round}</span>
      <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; opacity: 0.5;"></i>
    `;
    btn.onclick = () => {
      document.querySelectorAll(".round-nav-link").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeRound = round;
      renderActiveRoundMatches();
    };
    nav.appendChild(btn);
  });
}

// Tab Switching (Topscorers / settings)
window.switchTab = function(tabId) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.remove("active");
  });
  
  const activeBtn = Array.from(document.querySelectorAll(".tab-btn")).find(btn => btn.getAttribute("onclick").includes(tabId));
  if (activeBtn) activeBtn.classList.add("active");
  
  document.getElementById(tabId).classList.add("active");
};

// Parse score string to integer goals
function parseScore(scoreStr) {
  if (!scoreStr) return null;
  const parts = scoreStr.trim().split('-');
  if (parts.length !== 2) return null;
  const home = parseInt(parts[0]);
  const away = parseInt(parts[1]);
  if (isNaN(home) || isNaN(away)) return null;
  return [home, away];
}

// Calculate points based on prediction and actual
function calculateMatchPoints(predStr, actStr) {
  const pred = parseScore(predStr);
  const act = parseScore(actStr);
  
  if (pred === null || act === null) return 0;
  
  const [pHome, pAway] = pred;
  const [aHome, aAway] = act;
  
  // Exact score correct = 45 points
  if (pHome === aHome && pAway === aAway) return 45;
  
  // Outcome correct = 30 points
  const pWinner = pHome > pAway ? 1 : (pHome < pAway ? -1 : 0);
  const aWinner = aHome > aAway ? 1 : (aHome < aAway ? -1 : 0);
  if (pWinner === aWinner) return 30;
  
  return 0;
}

// Clean and normalize names
function cleanName(name) {
  if (!name) return "";
  let s = name.trim();
  
  // Strip accents using unicode NFD decomposition
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Clean up residual replacement characters
  s = s.replace(/\uFFFD/g, "");
  
  // Replace common garbled patterns from encoding errors
  s = s.replace(/Dembl/g, "Dembele");
  s = s.replace(/Deko/g, "Dzeko");
  s = s.replace(/Daz/g, "Diaz");
  s = s.replace(/Jimnez/g, "Jimenez");
  s = s.replace(/lvarez/g, "Alvarez");
  s = s.replace(/Paquet/g, "Paqueta");
  
  // Match normalized lowercase representation for standard names
  const normalized = s.replace(/\s+/g, "").toLowerCase();
  
  if (normalized === "cronaldo") {
    return "C. Ronaldo";
  }
  if (normalized.includes("mbapp")) {
    return "K. Mbappe";
  }
  if (normalized.includes("dembel")) {
    return "O. Dembele";
  }
  if (normalized.includes("dzek") || normalized.includes("deko")) {
    return "E. Dzeko";
  }
  if (normalized.includes("jimenez")) {
    return "R. Jimenez";
  }
  if (normalized.includes("diaz")) {
    return "B. Diaz";
  }
  if (normalized.includes("alvarez")) {
    return "J. Alvarez";
  }
  if (normalized.includes("paquet")) {
    return "L. Paqueta";
  }
  
  return s;
}

// Core calculation logic (mirrors python calculate.py but runs in real-time)
function recalculate() {
  const actualChamp = cleanName(actualResults.champion);
  
  // 1. Calculate points for all participants
  participants.forEach(p => {
    let matchPoints = 0;
    
    // Match predictions recalculation
    for (const matchId in p.predictions.matches) {
      const predScore = p.predictions.matches[matchId].prediction;
      const actScore = actualResults.matches[matchId] || "";
      const pts = calculateMatchPoints(predScore, actScore);
      p.predictions.matches[matchId].points = pts;
      matchPoints += pts;
    }
    
    p.matchPoints = matchPoints;
    
    // Topscorer recalculation
    let topscorerPoints = 0;
    let totalGoals = 0;
    
    p.predictions.topscorers.forEach(ts => {
      const name = ts.name;
      // Get position and goals from actualResults
      let actualData = null;
      for (const k in actualResults.topscorers) {
        if (cleanName(k).toLowerCase() === name.toLowerCase()) {
          actualData = actualResults.topscorers[k];
          break;
        }
      }
      
      const goals = actualData ? parseInt(actualData.goals) || 0 : 0;
      const pos = actualData ? actualData.position.toLowerCase() : "attacker";
      const mult = multiplierMap[pos] || 8;
      const pts = goals * mult;
      
      ts.goals = goals;
      ts.position = pos;
      ts.pointsPerGoal = mult;
      ts.points = pts;
      
      topscorerPoints += pts;
      totalGoals += goals;
    });
    
    p.topscorerPoints = topscorerPoints;
    p.totalGoals = totalGoals;
    
    // Champion points calculation
    const isCorrectChamp = actualChamp && (cleanName(p.predictions.champion.predicted).toLowerCase() === actualChamp.toLowerCase());
    p.championPoints = isCorrectChamp ? 250 : 0;
    p.predictions.champion.points = p.championPoints;
    p.predictions.champion.correct = isCorrectChamp;
    
    // Total
    p.totalPoints = p.matchPoints + p.topscorerPoints + p.championPoints;
  });
  
  // Sort participants by total points
  participants.sort((a, b) => b.totalPoints - a.totalPoints);
  
  // Assign Ranks
  participants.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  // 2. Render UI Components
  renderLeaderboard();
  renderTopscorersTab();
  renderActiveRoundMatches();
  
  // Set last updated time
  document.getElementById("last-updated-time").textContent = new Date().toLocaleTimeString();
}

// Save actual results to server and trigger calculation sync
async function saveActualResults() {
  try {
    const response = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(actualResults)
    });
    if (!response.ok) {
      throw new Error("Failed to save actual results to server");
    }
    console.log("Successfully saved actual results to server.");
    
    // Fetch updated leaderboard from server (regenerated by server.py calling calculate.py)
    const leaderboardRes = await fetch("leaderboard.json?t=" + new Date().getTime()).then(res => res.json());
    leaderboardData = leaderboardRes;
    participants = JSON.parse(JSON.stringify(leaderboardData.participantsDetails));
    
    // Re-render leaderboard standings
    renderLeaderboard();
  } catch (error) {
    console.error("Error saving actual results:", error);
  }
}

// Render Standings Leaderboard Table
function renderLeaderboard() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";
  
  document.getElementById("participant-count").textContent = `${participants.length} Players`;
  
  participants.forEach(p => {
    const tr = document.createElement("tr");
    tr.className = `leaderboard-row rank-${p.rank <= 3 ? p.rank : "other"}`;
    // Clicking on a row selects that player for Comparison Player 1
    tr.style.cursor = "pointer";
    tr.title = `Click to inspect ${p.name}`;
    tr.onclick = (e) => {
      // Don't trigger if clicked on an input/button
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "BUTTON") return;
      selectPlayerForCompare(p.name);
    };
    
    tr.innerHTML = `
      <td class="col-rank"><span class="rank-badge">${p.rank}</span></td>
      <td class="col-name">${p.name}</td>
      <td class="col-pts text-center">${p.matchPoints}</td>
      <td class="col-pts text-center">${p.topscorerPoints} <span style="font-size:0.75rem; opacity:0.6;">(${p.totalGoals} goals)</span></td>
      <td class="col-pts text-center">${p.championPoints}</td>
      <td class="col-total text-center">${p.totalPoints}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Select a player in comparison panel
function selectPlayerForCompare(name) {
  selectedPlayers = [name];
  const compareCountEl = document.getElementById("compare-count");
  if (compareCountEl) {
    compareCountEl.textContent = selectedPlayers.length;
  }
  renderActiveRoundMatches();
}

// Render Topscorers Editor List
function renderTopscorersTab() {
  const container = document.getElementById("topscorers-list-container");
  container.innerHTML = "";
  
  // Get and sort players by goals (descending), then alphabetically
  const sortedPlayers = Object.entries(actualResults.topscorers)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      const goalsA = parseInt(a.goals) || 0;
      const goalsB = parseInt(b.goals) || 0;
      if (goalsB !== goalsA) {
        return goalsB - goalsA;
      }
      return a.name.localeCompare(b.name);
    });
    
  // Filter players by query
  const filteredPlayers = sortedPlayers.filter(p => {
    return p.name.toLowerCase().includes(topscorerFilter);
  });
  
  if (filteredPlayers.length === 0) {
    container.innerHTML = `<div class="placeholder-text"><i class="fa-solid fa-circle-info"></i> No matching players found</div>`;
    return;
  }
  
  filteredPlayers.forEach(player => {
    const name = player.name;
    const goals = player.goals;
    const pos = player.position;
    const mult = multiplierMap[pos] || 8;
    const points = goals * mult;
    
    const div = document.createElement("div");
    div.className = "topscorer-item";
    
    // Set flag background styling
    const playerCountry = playerCountries[name] || "un";
    if (playerCountry !== "un") {
      div.style.backgroundImage = `
        linear-gradient(to right, rgba(12, 18, 36, 0.93) 30%, rgba(12, 18, 36, 0.6) 100%),
        url(https://flagcdn.com/w160/${playerCountry}.png)
      `;
      div.style.backgroundPosition = "right center";
      div.style.backgroundSize = "auto 100%";
      div.style.backgroundRepeat = "no-repeat";
    }
    
    div.innerHTML = `
      <div class="player-info-meta">
        <span class="player-name">${name}</span>
        <span class="player-position-pill pos-${pos}">${pos}</span>
      </div>
      <div class="player-controls">
        <select class="select-pos-dropdown" onchange="onPlayerPositionChange('${name}', this.value)">
          <option value="attacker" ${pos === "attacker" ? "selected" : ""}>Attacker (8x)</option>
          <option value="midfielder" ${pos === "midfielder" ? "selected" : ""}>Midfielder (16x)</option>
          <option value="defender" ${pos === "defender" ? "selected" : ""}>Defender (32x)</option>
        </select>
        
        <div class="goals-input-wrapper">
          <button type="button" onclick="adjustGoals('${name}', -1)"><i class="fa-solid fa-minus"></i></button>
          <input type="number" value="${goals}" min="0" max="99" onchange="onPlayerGoalsChange('${name}', this.value)">
          <button type="button" onclick="adjustGoals('${name}', 1)"><i class="fa-solid fa-plus"></i></button>
        </div>
        
        <span class="goals-points-badge">${points} pts</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// Adjust goals via +/- buttons
window.adjustGoals = function(name, amount) {
  const currentGoals = parseInt(actualResults.topscorers[name].goals) || 0;
  const newGoals = Math.max(0, currentGoals + amount);
  actualResults.topscorers[name].goals = newGoals;
  recalculate();
  saveActualResults();
};

// Goals input changed
window.onPlayerGoalsChange = function(name, value) {
  let val = parseInt(value);
  if (isNaN(val) || val < 0) val = 0;
  actualResults.topscorers[name].goals = val;
  recalculate();
  saveActualResults();
};

// Position dropdown changed
window.onPlayerPositionChange = function(name, value) {
  actualResults.topscorers[name].position = value;
  recalculate();
  saveActualResults();
};

// Champion input changed
window.onChampionChange = function(value) {
  actualResults.champion = value;
  recalculate();
  saveActualResults();
};

// Search filter input change handler
window.onTopscorerSearchChange = function(value) {
  topscorerFilter = value.trim().toLowerCase();
  renderTopscorersTab();
};

// Render Matches list in active round with comparison
function renderActiveRoundMatches() {
  const activeRoundTitleEl = document.getElementById("active-round-title");
  if (activeRoundTitleEl) {
    activeRoundTitleEl.textContent = activeRound;
  }
  
  const container = document.getElementById("matches-grid-container");
  if (!container) return;
  container.innerHTML = "";
  
  if (selectedPlayers.length === 0) {
    container.innerHTML = `<div class="placeholder-text"><i class="fa-solid fa-circle-info"></i> Please select players to compare in the header above</div>`;
    return;
  }

  // Filter matches that are in this round, sorted chronologically by their order
  const matchesInRound = Object.entries(matchSchedule)
    .filter(([matchId, info]) => info.round === activeRound)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([matchId, info]) => matchId);
  
  matchesInRound.forEach(matchId => {
    const info = matchSchedule[matchId];
    const actScore = actualResults.matches[matchId] || "";
    
    const card = document.createElement("div");
    card.className = "match-card";
    
    const [t1, t2] = matchId.split("-");
    const flag1 = teamFlags[t1] || t1.toLowerCase();
    const flag2 = teamFlags[t2] || t2.toLowerCase();
    
    // Generate prediction items for all selected players
    let predictionsHTML = "";
    selectedPlayers.forEach((playerName, idx) => {
      const p = participants.find(part => part.name === playerName);
      if (!p) return;
      const pred = p.predictions.matches[matchId] || { prediction: "", points: 0 };
      const borderStyle = idx > 0 ? 'style="border-top: 1px solid rgba(255,255,255,0.03); padding-top:0.4rem; margin-top:0.4rem;"' : '';
      
      predictionsHTML += `
        <div class="prediction-item" ${borderStyle}>
          <span class="pred-player-name" title="${playerName}">${playerName}</span>
          <div class="pred-content-row">
            <span class="pred-val">${pred.prediction || "--"}</span>
            <span class="point-badge pts-${pred.points}">${pred.points > 0 ? `+${pred.points}` : '0'}</span>
          </div>
        </div>
      `;
    });
    
    card.innerHTML = `
      <div class="match-card-bg">
        <div class="flag-left" style="background-image: url(https://flagcdn.com/w320/${flag1}.png)"></div>
        <div class="flag-right" style="background-image: url(https://flagcdn.com/w320/${flag2}.png)"></div>
        <div class="bg-overlay"></div>
      </div>
      <div class="match-card-content">
        <div class="match-meta">
          <div class="match-meta-top">
            <span class="match-id">${matchId}</span>
            <span class="match-schedule-info"><i class="fa-regular fa-calendar"></i> ${info.date} &nbsp; <i class="fa-regular fa-clock"></i> ${info.time} CEST</span>
          </div>
          <span class="match-teams">${teamNames[t1] || t1} vs ${teamNames[t2] || t2}</span>
        </div>
        <div class="match-row-data">
          <span class="score-label">Actual Score</span>
          <div class="score-display-row">
            <input type="text" class="actual-score-input" value="${actScore}" placeholder="-- - --" onchange="onMatchScoreChange('${matchId}', this.value)">
          </div>
        </div>
        <div class="predictions-area">
          ${predictionsHTML}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Score input changed
window.onMatchScoreChange = function(matchId, value) {
  // Validate format (e.g. 1-0 or empty)
  let val = value.trim();
  if (val !== "") {
    const score = parseScore(val);
    if (score === null) {
      alert("Invalid score format. Please use 'Home-Away' format, e.g. '2-1' or '0-0'. Clear the input to mark as unplayed.");
      // Reset input
      renderActiveRoundMatches();
      return;
    }
    // Re-format clean
    val = `${score[0]}-${score[1]}`;
  }
  
  actualResults.matches[matchId] = val;
  recalculate();
  saveActualResults();
};

// (onPlayerSelectChange is handled in applyCompareSelection)

// Reset to initial files values
window.resetToDefaults = function() {
  if (confirm("Are you sure you want to discard your unsaved in-browser changes and reload original results?")) {
    loadData();
  }
};

// Download actual_results.json file
window.exportResults = function() {
  // Structure exactly matches the file actual_results.json
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(actualResults, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "actual_results.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Simulate random scores for testing the leaderboard animations and stats
window.simulateRandomResults = function() {
  if (!confirm("This will randomly populate scores for all group stage matches, topscorer goals, and a champion to test the leaderboard. Continue?")) {
    return;
  }
  
  // 1. Simulate matches
  // Realistic score outcomes: 1-0 (20%), 2-1 (15%), 1-1 (15%), 2-0 (10%), 0-0 (10%), 0-1 (10%), etc.
  const scores = ["1-0", "2-1", "1-1", "2-0", "0-0", "0-1", "0-2", "1-2", "2-2", "3-0", "3-1", "0-3"];
  for (const matchId in actualResults.matches) {
    // Pick random score
    const randScore = scores[Math.floor(Math.random() * scores.length)];
    actualResults.matches[matchId] = randScore;
  }
  
  // 2. Simulate topscorers goals
  for (const player in actualResults.topscorers) {
    const goals = Math.floor(Math.random() * 6); // 0 to 5 goals
    actualResults.topscorers[player].goals = goals;
  }
  
  // 3. Simulate Champion
  const champions = ["Spanje", "Frankrijk", "Duitsland", "Engeland", "Argentinië", "Brazilië"];
  const randChamp = champions[Math.floor(Math.random() * champions.length)];
  actualResults.champion = randChamp;
  document.getElementById("actual-champion-input").value = randChamp;
  
  recalculate();
  saveActualResults();
};
