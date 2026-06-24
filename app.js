// State variables
const isAdmin = window.IS_ADMIN || false;
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
        
        const championInput = document.getElementById("actual-champion-input");
        if (championInput) {
          championInput.value = actualResults.champion || "";
        }
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
    const championInput = document.getElementById("actual-champion-input");
    if (championInput) {
      championInput.value = actualResults.champion || "";
      if (!isAdmin) {
        championInput.readOnly = true;
        championInput.placeholder = "Not decided yet";
        championInput.classList.add("readonly-input");
      }
    }

    // Hide pool actions if not admin
    const poolActions = document.querySelector(".pool-actions");
    if (poolActions && !isAdmin) {
      poolActions.style.display = "none";
    }
    
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

// Dynamic group discovery
function getGroups(matchIds) {
  const adj = {};
  matchIds.forEach(id => {
    const [t1, t2] = id.split('-');
    if (!adj[t1]) adj[t1] = [];
    if (!adj[t2]) adj[t2] = [];
    adj[t1].push(t2);
    adj[t2].push(t1);
  });
  
  const visited = new Set();
  const groups = [];
  const teams = Object.keys(adj).sort();
  teams.forEach(team => {
    if (!visited.has(team)) {
      const comp = [];
      const queue = [team];
      visited.add(team);
      while (queue.length > 0) {
        const curr = queue.shift();
        comp.push(curr);
        adj[curr].forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
      groups.push(comp.sort());
    }
  });
  return groups.sort((a, b) => a[0].localeCompare(b[0]));
}

// Calculate group standings with FIFA tie-breakers
function calculateGroupStandings(group, matchesScores) {
  const stats = {};
  group.forEach(team => {
    stats[team] = { points: 0, gd: 0, gf: 0 };
  });
  
  const groupSet = new Set(group);
  const h2hMatches = [];
  let playedMatchesCount = 0;
  
  Object.keys(matchesScores).forEach(matchId => {
    const [t1, t2] = matchId.split('-');
    if (groupSet.has(t1) && groupSet.has(t2)) {
      const score = matchesScores[matchId];
      const parsed = parseScore(score);
      if (parsed !== null) {
        playedMatchesCount++;
        const [h, a] = parsed;
        stats[t1].gf += h;
        stats[t2].gf += a;
        stats[t1].gd += (h - a);
        stats[t2].gd += (a - h);
        if (h > a) {
          stats[t1].points += 3;
        } else if (h < a) {
          stats[t2].points += 3;
        } else {
          stats[t1].points += 1;
          stats[t2].points += 1;
        }
        h2hMatches.push({ t1, t2, h, a });
      }
    }
  });

  const sortedTeams = [...group].sort((a, b) => {
    if (stats[a].points !== stats[b].points) {
      return stats[b].points - stats[a].points;
    }
    
    // Head-to-Head
    let h2hPointsA = 0;
    let h2hPointsB = 0;
    let h2hGdA = 0;
    let h2hGdB = 0;
    let h2hGfA = 0;
    let h2hGfB = 0;
    
    h2hMatches.forEach(m => {
      if ((m.t1 === a && m.t2 === b) || (m.t1 === b && m.t2 === a)) {
        let hScore, aScore;
        if (m.t1 === a) {
          hScore = m.h;
          aScore = m.a;
        } else {
          hScore = m.a;
          aScore = m.h;
        }
        
        h2hGfA += hScore;
        h2hGfB += aScore;
        h2hGdA += (hScore - aScore);
        h2hGdB += (aScore - hScore);
        
        if (hScore > aScore) {
          h2hPointsA += 3;
        } else if (hScore < aScore) {
          h2hPointsB += 3;
        } else {
          h2hPointsA += 1;
          h2hPointsB += 1;
        }
      }
    });
    
    if (h2hPointsA !== h2hPointsB) return h2hPointsB - h2hPointsA;
    if (h2hGdA !== h2hGdB) return h2hGdB - h2hGdA;
    if (h2hGfA !== h2hGfB) return h2hGfB - h2hGfA;
    
    if (stats[a].gd !== stats[b].gd) return stats[b].gd - stats[a].gd;
    if (stats[a].gf !== stats[b].gf) return stats[b].gf - stats[a].gf;
    
    return a.localeCompare(b);
  });
  
  const positions = {};
  sortedTeams.forEach((team, index) => {
    positions[team] = index + 1;
  });
  
  return { sortedTeams, playedMatchesCount, stats, positions };
}

// Core calculation logic (mirrors python calculate.py but runs in real-time)
function recalculate() {
  const actualChamp = cleanName(actualResults.champion);
  
  const matchIds = Object.keys(matchSchedule);
  const groups = getGroups(matchIds);
  
  // Precalculate actual standings for all groups
  const actualStandings = {};
  groups.forEach(group => {
    actualStandings[group.join(',')] = calculateGroupStandings(group, actualResults.matches);
  });
  
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
    
    // Group standings calculations
    let groupPoints = 0;
    const groupsPredictions = [];
    
    const playerPredMatches = {};
    for (const matchId in p.predictions.matches) {
      playerPredMatches[matchId] = p.predictions.matches[matchId].prediction;
    }
    
    const playerPredPos = {};
    groups.forEach(group => {
      const { sortedTeams } = calculateGroupStandings(group, playerPredMatches);
      sortedTeams.forEach((team, idx) => {
        playerPredPos[team] = idx + 1;
      });
    });

    groups.forEach((group, idx) => {
      const groupName = `Group ${String.fromCharCode(65 + idx)}`;
      const { sortedTeams: sortedActualTeams, playedMatchesCount, positions: actualRanks } = actualStandings[group.join(',')];
      
      const { sortedTeams: sortedPredTeams } = calculateGroupStandings(group, playerPredMatches);
      
      const groupTeamsData = [];
      sortedPredTeams.forEach(team => {
        const predRank = playerPredPos[team];
        const actRank = actualRanks[team];
        const isCorrect = (playedMatchesCount === 6) && (predRank === actRank);
        groupTeamsData.push({
          team: team,
          predictedRank: predRank,
          actualRank: playedMatchesCount > 0 ? actRank : "-",
          correct: isCorrect,
          points: isCorrect ? 25 : 0
        });
        if (isCorrect) {
          groupPoints += 25;
        }
      });
      
      groupsPredictions.push({
        groupName,
        teams: groupTeamsData,
        isCompleted: playedMatchesCount === 6,
        isActive: playedMatchesCount > 0
      });
    });
    
    p.groupPoints = groupPoints;
    p.predictions.groups = groupsPredictions;
    
    // Total
    p.totalPoints = p.matchPoints + p.topscorerPoints + p.championPoints + p.groupPoints;
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
  if (!isAdmin) return;
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
      openPredictionsPopup(p.name);
    };
    
    tr.innerHTML = `
      <td class="col-rank"><span class="rank-badge">${p.rank}</span></td>
      <td class="col-name">${p.name}</td>
      <td class="col-pts text-center">${p.matchPoints}</td>
      <td class="col-pts text-center">${p.topscorerPoints} <span style="font-size:0.75rem; opacity:0.6;">(${p.totalGoals} goals)</span></td>
      <td class="col-pts text-center">${p.groupPoints || 0}</td>
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

// Helper to resolve player country names
function getPlayerCountryName(playerName) {
  const code = playerCountries[playerName] || "un";
  if (code === "un") return "Unknown";
  
  const teamCode = Object.keys(teamFlags).find(key => teamFlags[key] === code);
  if (teamCode && teamNames[teamCode]) {
    return teamNames[teamCode];
  }
  
  if (code === "gb-eng") return "England";
  if (code === "gb-sct") return "Scotland";
  
  return code.toUpperCase();
}

// Render Topscorers Editor List
function renderTopscorersTab() {
  const container = document.getElementById("topscorers-list-container");
  container.innerHTML = "";
  
  // Get and sort players
  let sortedPlayers = Object.entries(actualResults.topscorers)
    .map(([name, data]) => ({ name, ...data }));
    
  if (isAdmin) {
    // Sort by country alphabetically, then by player name alphabetically
    sortedPlayers.sort((a, b) => {
      const countryA = getPlayerCountryName(a.name);
      const countryB = getPlayerCountryName(b.name);
      const countryComp = countryA.localeCompare(countryB);
      if (countryComp !== 0) {
        return countryComp;
      }
      return a.name.localeCompare(b.name);
    });
  } else {
    // Sort by goals (descending), then alphabetically by player name
    sortedPlayers.sort((a, b) => {
      const goalsA = parseInt(a.goals) || 0;
      const goalsB = parseInt(b.goals) || 0;
      if (goalsB !== goalsA) {
        return goalsB - goalsA;
      }
      return a.name.localeCompare(b.name);
    });
  }
    
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
    
    let controlsHTML = "";
    if (isAdmin) {
      controlsHTML = `
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
      `;
    } else {
      controlsHTML = `
        <span class="goals-display-badge"><i class="fa-solid fa-soccer-ball"></i> ${goals} ${goals === 1 ? 'goal' : 'goals'}</span>
      `;
    }
    
    div.innerHTML = `
      <div class="player-info-meta">
        <span class="player-name">${name}</span>
        <span class="player-position-pill pos-${pos}">${pos}</span>
      </div>
      <div class="player-controls">
        ${controlsHTML}
        <span class="goals-points-badge">${points} pts</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// Adjust goals via +/- buttons
window.adjustGoals = function(name, amount) {
  if (!isAdmin) return;
  const currentGoals = parseInt(actualResults.topscorers[name].goals) || 0;
  const newGoals = Math.max(0, currentGoals + amount);
  actualResults.topscorers[name].goals = newGoals;
  recalculate();
  saveActualResults();
};

// Goals input changed
window.onPlayerGoalsChange = function(name, value) {
  if (!isAdmin) return;
  let val = parseInt(value);
  if (isNaN(val) || val < 0) val = 0;
  actualResults.topscorers[name].goals = val;
  recalculate();
  saveActualResults();
};

// Position dropdown changed
window.onPlayerPositionChange = function(name, value) {
  if (!isAdmin) return;
  actualResults.topscorers[name].position = value;
  recalculate();
  saveActualResults();
};

// Champion input changed
window.onChampionChange = function(value) {
  if (!isAdmin) return;
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
            ${isAdmin ? 
              `<input type="text" class="actual-score-input" value="${actScore}" placeholder="-- - --" onchange="onMatchScoreChange('${matchId}', this.value)">` : 
              `<span class="actual-score-display">${actScore || "-- - --"}</span>`
            }
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
  if (!isAdmin) return;
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
  if (!isAdmin) return;
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
  if (!isAdmin) return;
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
  const champInput = document.getElementById("actual-champion-input");
  if (champInput) {
    champInput.value = randChamp;
  }
  
  recalculate();
  saveActualResults();
};

// Predictions Modal functions
window.openPredictionsPopup = function(playerName) {
  const p = participants.find(part => part.name === playerName);
  if (!p) return;
  
  document.getElementById("pred-modal-player-name").textContent = playerName;
  window.CURRENT_PRED_PLAYER = p;
  switchPredTab('pred-summary');
  document.getElementById("predictions-modal").classList.add("active");
};

window.closePredictionsPopup = function() {
  document.getElementById("predictions-modal").classList.remove("active");
};

window.switchPredTab = function(tabId) {
  // Toggle tab buttons
  document.querySelectorAll("#predictions-modal .tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  const clickedBtn = document.getElementById(`btn-${tabId}`);
  if (clickedBtn) clickedBtn.classList.add("active");
  
  // Toggle tab contents
  document.querySelectorAll("#predictions-modal .pred-tab-content").forEach(content => {
    content.style.display = "none";
    content.classList.remove("active");
  });
  
  const targetContent = document.getElementById(tabId);
  if (targetContent) {
    targetContent.style.display = "block";
    targetContent.classList.add("active");
  }
  
  const p = window.CURRENT_PRED_PLAYER;
  if (!p) return;
  
  if (tabId === 'pred-summary') {
    renderPredSummary(p);
  } else if (tabId === 'pred-groups') {
    renderPredGroups(p);
  } else if (tabId === 'pred-matches') {
    renderPredMatches(p);
  }
};

function renderPredSummary(p) {
  const container = document.getElementById("pred-summary");
  
  let tsHTML = "";
  p.predictions.topscorers.forEach(ts => {
    tsHTML += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); padding:0.75rem 1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
        <div>
          <span style="font-weight:700; font-size:0.95rem;">${ts.name}</span>
          <span class="player-position-pill pos-${ts.position}" style="font-size:0.65rem; margin-left:0.5rem; text-transform:uppercase;">${ts.position}</span>
        </div>
        <div style="text-align:right;">
          <span style="font-weight:600; font-size:0.9rem; color:var(--text-main);">${ts.goals} goals</span>
          <span style="font-size:0.75rem; color:var(--text-muted); display:block;">(${ts.pointsPerGoal}x mult = ${ts.points} pts)</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
      <div style="background:rgba(99,102,241,0.05); border:1px solid rgba(99,102,241,0.1); border-radius:12px; padding:1.25rem;">
        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700; letter-spacing:0.05em;">Predicted Champion</span>
        <div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.5rem;">
          <i class="fa-solid fa-crown text-gold" style="font-size:1.5rem;"></i>
          <span style="font-family:var(--font-display); font-weight:800; font-size:1.5rem; color:var(--text-main);">${p.predictions.champion.predicted || "--"}</span>
        </div>
        <div style="margin-top:0.75rem; font-size:0.85rem; color:${p.predictions.champion.correct ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
          ${p.predictions.champion.correct ? '<i class="fa-solid fa-circle-check"></i> Correct prediction! (+250 pts)' : `Actual: ${p.predictions.champion.actual || "Not decided"} (0 pts)`}
        </div>
      </div>
      
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.75rem;">
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:0.75rem 1rem; text-align:center;">
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Match Points</span>
          <span style="font-family:var(--font-display); font-weight:800; font-size:1.5rem; color:var(--accent-cyan); display:block; margin-top:0.25rem;">${p.matchPoints}</span>
        </div>
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:0.75rem 1rem; text-align:center;">
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Topscorer Points</span>
          <span style="font-family:var(--font-display); font-weight:800; font-size:1.5rem; color:var(--accent-yellow); display:block; margin-top:0.25rem;">${p.topscorerPoints}</span>
        </div>
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:0.75rem 1rem; text-align:center;">
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Group Points</span>
          <span style="font-family:var(--font-display); font-weight:800; font-size:1.5rem; color:var(--accent-primary); display:block; margin-top:0.25rem;">${p.groupPoints || 0}</span>
        </div>
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; padding:0.75rem 1rem; text-align:center; border-color:rgba(99,102,241,0.25);">
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Total Points</span>
          <span style="font-family:var(--font-display); font-weight:800; font-size:1.5rem; color:var(--text-main); display:block; margin-top:0.25rem;">${p.totalPoints}</span>
        </div>
      </div>
    </div>
    
    <div>
      <h4 style="font-family:var(--font-display); margin-bottom:0.75rem; font-size:1.1rem;"><i class="fa-solid fa-soccer-ball text-gold"></i> Predicted Topscorers</h4>
      <div style="display:flex; flex-direction:column; gap:0.6rem;">
        ${tsHTML}
      </div>
    </div>
  `;
}

function renderPredGroups(p) {
  const container = document.getElementById("pred-groups");
  
  let groupsHTML = "";
  p.predictions.groups.forEach(g => {
    let teamRowsHTML = "";
    g.teams.forEach(t => {
      const flagCode = teamFlags[t.team] || t.team.toLowerCase();
      const flagUrl = `https://flagcdn.com/w80/${flagCode}.png`;
      
      teamRowsHTML += `
        <tr class="${t.correct ? 'pred-row-correct' : ''}">
          <td style="padding:0.4rem 0.75rem; text-align:center; font-weight:700;">${t.predictedRank}</td>
          <td style="padding:0.4rem 0.75rem; display:flex; align-items:center; gap:0.5rem; font-weight:600;">
            <img src="${flagUrl}" style="width:20px; border-radius:2px; height:auto; border:1px solid rgba(255,255,255,0.05);" alt="${t.team}">
            <span title="${teamNames[t.team] || t.team}">${t.team}</span>
          </td>
          <td style="padding:0.4rem 0.75rem; text-align:center; color:var(--text-muted);">${t.actualRank}</td>
          <td style="padding:0.4rem 0.75rem; text-align:center; font-family:var(--font-display); font-weight:700; color:${t.correct ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
            ${t.correct ? '+25' : '0'}
          </td>
        </tr>
      `;
    });
    
    groupsHTML += `
      <div style="background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.04); border-radius:10px; padding:0.75rem; display:flex; flex-direction:column; gap:0.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:0.4rem; margin-bottom:0.25rem;">
          <h4 style="font-family:var(--font-display); font-weight:700; font-size:0.95rem; color:var(--text-main);">${g.groupName}</h4>
          ${g.isCompleted ? 
            '<span class="badge" style="font-size:0.65rem; background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.25); color:var(--accent-emerald);">Completed</span>' : 
            (g.isActive ? 
              '<span class="badge" style="font-size:0.65rem; background:rgba(6,182,212,0.1); border-color:rgba(6,182,212,0.25); color:var(--accent-cyan);">In Progress</span>' : 
              '<span class="badge" style="font-size:0.65rem; background:rgba(255,255,255,0.03); border-color:rgba(255,255,255,0.05); color:var(--text-muted);">Unplayed</span>'
            )
          }
        </div>
        <table style="width:100%; font-size:0.8rem; border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
              <th style="padding:0.25rem 0.5rem; font-size:0.65rem; text-transform:uppercase; text-align:center; color:var(--text-muted);">Pred</th>
              <th style="padding:0.25rem 0.5rem; font-size:0.65rem; text-transform:uppercase; text-align:left; color:var(--text-muted);">Team</th>
              <th style="padding:0.25rem 0.5rem; font-size:0.65rem; text-transform:uppercase; text-align:center; color:var(--text-muted);">Act</th>
              <th style="padding:0.25rem 0.5rem; font-size:0.65rem; text-transform:uppercase; text-align:center; color:var(--text-muted);">Pts</th>
            </tr>
          </thead>
          <tbody>
            ${teamRowsHTML}
          </tbody>
        </table>
      </div>
    `;
  });
  
  container.innerHTML = `
    <p class="section-desc" style="margin-bottom:1rem;"><i class="fa-solid fa-circle-info text-cyan"></i> Awarded 25 points for each correct team position guess. Standings resolve live using World Cup rules (Points, GD, GF, H2H).</p>
    <div class="predictions-groups-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:1rem; max-height:550px; overflow-y:auto; padding-right:0.5rem;">
      ${groupsHTML}
    </div>
  `;
}

function renderPredMatches(p) {
  const container = document.getElementById("pred-matches");
  
  const rounds = {};
  for (const matchId in p.predictions.matches) {
    const info = matchSchedule[matchId];
    if (info) {
      if (!rounds[info.round]) rounds[info.round] = [];
      rounds[info.round].push({
        id: matchId,
        pred: p.predictions.matches[matchId].prediction,
        pts: p.predictions.matches[matchId].points,
        date: info.date,
        time: info.time,
        order: info.order
      });
    }
  }
  
  let roundsHTML = "";
  Object.keys(rounds).sort().forEach(roundName => {
    let matchesHTML = "";
    rounds[roundName].sort((a, b) => a.order - b.order).forEach(m => {
      const [t1, t2] = m.id.split('-');
      const flag1 = teamFlags[t1] || t1.toLowerCase();
      const flag2 = teamFlags[t2] || t2.toLowerCase();
      const actScore = actualResults.matches[m.id] || "--";
      
      matchesHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.03); padding:0.5rem 0.75rem; border-radius:8px;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="display:flex; flex-direction:column; min-width:120px;">
              <div style="display:flex; align-items:center; gap:0.35rem; font-weight:600; font-size:0.85rem; color:var(--text-main);">
                <img src="https://flagcdn.com/w40/${flag1}.png" style="width:14px; border-radius:1px;" alt="">
                <span>${t1}</span>
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">vs</span>
                <img src="https://flagcdn.com/w40/${flag2}.png" style="width:14px; border-radius:1px;" alt="">
                <span>${t2}</span>
              </div>
              <span style="font-size:0.65rem; color:var(--text-muted);"><i class="fa-regular fa-clock"></i> ${m.date} ${m.time}</span>
            </div>
            <div style="font-size:0.75rem;">
              <span style="color:var(--text-muted);">Pred:</span> <span style="font-weight:700; color:var(--text-main); font-family:var(--font-display);">${m.pred || "--"}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:1rem;">
            <div style="font-size:0.75rem; text-align:right;">
              <span style="color:var(--text-muted);">Act:</span> <span style="font-weight:700; color:var(--accent-cyan); font-family:var(--font-display);">${actScore}</span>
            </div>
            <span class="point-badge pts-${m.pts}">${m.pts > 0 ? `+${m.pts}` : '0'}</span>
          </div>
        </div>
      `;
    });
    
    roundsHTML += `
      <div style="margin-bottom:1.25rem;">
        <h4 style="font-family:var(--font-display); border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:0.3rem; margin-bottom:0.6rem; font-size:1rem; color:var(--accent-cyan);">${roundName}</h4>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${matchesHTML}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = `
    <div style="max-height:550px; overflow-y:auto; padding-right:0.5rem;">
      ${roundsHTML}
    </div>
  `;
}
