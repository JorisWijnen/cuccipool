// State variables
let leaderboardData = null;
let actualResults = {
  matches: {},
  topscorers: {},
  champion: ""
};
let participants = []; // Recalculated state for all participants
let activeGroup = "Group A";
let playerA = "";
let playerB = "";
let topscorerFilter = "";

// Player flags mapping to their country flag emojis
const playerFlags = {
  "C. Gakpo": "🇳🇱",
  "M. Depay": "🇳🇱",
  "D. Dumfries": "🇳🇱",
  "D. Malen": "🇳🇱",
  "E. Haaland": "🇳🇴",
  "F. Wirtz": "🇩🇪",
  "J. Musiala": "🇩🇪",
  "K. Havertz": "🇩🇪",
  "D. Undav": "🇩🇪",
  "H. Kane": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "J. Bellingham": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "K. Mbappe": "🇫🇷",
  "O. Dembele": "🇫🇷",
  "M. Olise": "🇫🇷",
  "L. Messi": "🇦🇷",
  "L. Martinez": "🇦🇷",
  "J. Alvarez": "🇦🇷",
  "L. Yamal": "🇪🇸",
  "M. Oyarzabal": "🇪🇸",
  "F. Torres": "🇪🇸",
  "Vinicius Jr.": "🇧🇷",
  "Neymar": "🇧🇷",
  "M. Cunha": "🇧🇷",
  "Raphinha": "🇧🇷",
  "L. Paqueta": "🇧🇷",
  "C. Ronaldo": "🇵🇹",
  "C.Ronaldo": "🇵🇹",
  "G. Ramos": "🇵🇹",
  "B. Fernandes": "🇵🇹",
  "M. Salah": "🇪🇬",
  "R. Lukaku": "🇧🇪",
  "E. Dzeko": "🇧🇦",
  "R. Jimenez": "🇲🇽",
  "B. Diaz": "🇲🇦"
};

// Match to Group Mapping
const matchToGroup = {
  // Group A
  "MEX-ZAF": "Group A", "ZKO-CZE": "Group A", "CZE-ZAF": "Group A", "MEX-ZKO": "Group A", "ZAF-ZKO": "Group A", "CZE-MEX": "Group A",
  // Group B
  "CAN-BOS": "Group B", "QAT-SUI": "Group B", "CAN-QAT": "Group B", "SUI-BOS": "Group B", "SUI-CAN": "Group B", "BOS-QAT": "Group B",
  // Group C
  "BRA-MAR": "Group C", "HAI-SCO": "Group C", "SCO-MAR": "Group C", "BRA-HAI": "Group C", "MAR-HAI": "Group C", "SCO-BRA": "Group C",
  // Group D
  "USA-PAR": "Group D", "AUS-TUR": "Group D", "TUR-PAR": "Group D", "USA-AUS": "Group D", "PAR-AUS": "Group D", "TUR-USA": "Group D",
  // Group E
  "GER-CUW": "Group E", "IVO-ECU": "Group E", "GER-IVO": "Group E", "ECU-CUW": "Group E", "CUW-IVO": "Group E", "ECU-GER": "Group E",
  // Group F
  "NED-JAP": "Group F", "SWE-TUN": "Group F", "TUN-JAP": "Group F", "NED-SWE": "Group F", "TUN-NED": "Group F", "JAP-SWE": "Group F",
  // Group G
  "ESP-CPV": "Group G", "SAR-URU": "Group G", "ESP-SAR": "Group G", "URU-CPV": "Group G", "URU-ESP": "Group G", "CPV-SAR": "Group G",
  // Group H
  "BEL-EGY": "Group H", "IRN-NZL": "Group H", "BEL-IRN": "Group H", "NZL-EGY": "Group H", "EGY-IRN": "Group H", "NZL-BEL": "Group H",
  // Group I
  "FRA-SEN": "Group I", "IRK-NOO": "Group I", "FRA-IRK": "Group I", "NOO-SEN": "Group I", "NOO-FRA": "Group I", "SEN-IRK": "Group I",
  // Group J
  "ARG-ALG": "Group J", "AUT-JOR": "Group J", "ARG-AUT": "Group J", "JOR-ALG": "Group J", "JOR-ARG": "Group J", "ALG-AUT": "Group J",
  // Group K
  "POR-COD": "Group K", "OEZ-COL": "Group K", "POR-OEZ": "Group K", "COL-COD": "Group K", "COD-OEZ": "Group K", "COL-POR": "Group K",
  // Group L
  "ENG-CRO": "Group L", "GHA-PAN": "Group L", "ENG-GHA": "Group L", "PAN-CRO": "Group L", "CRO-GHA": "Group L", "PAN-ENG": "Group L"
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
    
    // Set up dropdown selectors
    const participantNames = participants.map(p => p.name);
    playerA = participantNames[0] || "";
    playerB = participantNames[1] || playerA;

    populateDropdowns(participantNames);
    buildGroupNavigation();
    
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

// Populate players selectors dropdown
function populateDropdowns(names) {
  const selectA = document.getElementById("player-a-select");
  const selectB = document.getElementById("player-b-select");
  
  selectA.innerHTML = "";
  selectB.innerHTML = "";
  
  names.forEach(name => {
    const optA = document.createElement("option");
    optA.value = name;
    optA.textContent = name;
    optA.selected = (name === playerA);
    selectA.appendChild(optA);
    
    const optB = document.createElement("option");
    optB.value = name;
    optB.textContent = name;
    optB.selected = (name === playerB);
    selectB.appendChild(optB);
  });
}

// Group Navigation Menu (A - L)
function buildGroupNavigation() {
  const nav = document.getElementById("groups-navigation");
  nav.innerHTML = "";
  
  const groups = ["Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H", "Group I", "Group J", "Group K", "Group L"];
  
  groups.forEach(group => {
    const btn = document.createElement("button");
    btn.className = `group-nav-link ${group === activeGroup ? "active" : ""}`;
    btn.innerHTML = `
      <span>${group}</span>
      <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; opacity: 0.5;"></i>
    `;
    btn.onclick = () => {
      document.querySelectorAll(".group-nav-link").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeGroup = group;
      renderActiveGroupMatches();
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
    const isCorrectChamp = actualChamp && (cleanName(p.predictions.champion.predicted).toLowerCase() === actualChamp.lower());
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
  renderActiveGroupMatches();
  
  // Set last updated time
  document.getElementById("last-updated-time").textContent = new Date().toLocaleTimeString();
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
  playerA = name;
  document.getElementById("player-a-select").value = name;
  onPlayerSelectChange();
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
    const flag = playerFlags[name] || "🏳️";
    
    const div = document.createElement("div");
    div.className = "topscorer-item";
    div.innerHTML = `
      <div class="player-info-meta">
        <span class="player-name">${flag} ${name}</span>
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
};

// Goals input changed
window.onPlayerGoalsChange = function(name, value) {
  let val = parseInt(value);
  if (isNaN(val) || val < 0) val = 0;
  actualResults.topscorers[name].goals = val;
  recalculate();
};

// Position dropdown changed
window.onPlayerPositionChange = function(name, value) {
  actualResults.topscorers[name].position = value;
  recalculate();
};

// Champion input changed
window.onChampionChange = function(value) {
  actualResults.champion = value;
  recalculate();
};

// Search filter input change handler
window.onTopscorerSearchChange = function(value) {
  topscorerFilter = value.trim().toLowerCase();
  renderTopscorersTab();
};

// Render Matches list in active group with comparison
function renderActiveGroupMatches() {
  document.getElementById("active-group-title").textContent = activeGroup;
  
  const container = document.getElementById("matches-grid-container");
  container.innerHTML = "";
  
  // Find predictions of playerA and playerB
  const pA = participants.find(p => p.name === playerA);
  const pB = participants.find(p => p.name === playerB);
  
  if (!pA || !pB) return;

  // Filter matches that are in this group
  const matchesInGroup = Object.keys(matchToGroup).filter(id => matchToGroup[id] === activeGroup);
  
  matchesInGroup.forEach(matchId => {
    const actScore = actualResults.matches[matchId] || "";
    
    // Get prediction and points for player A and B
    const predA = pA.predictions.matches[matchId] || { prediction: "", points: 0 };
    const predB = pB.predictions.matches[matchId] || { prediction: "", points: 0 };
    
    const card = document.createElement("div");
    card.className = "match-card";
    
    // Render flags if possible, otherwise simple text. Standard emojis are cross platform.
    const [t1, t2] = matchId.split("-");
    
    card.innerHTML = `
      <div class="match-meta">
        <span class="match-id">${matchId}</span>
        <span class="match-teams">${t1} vs ${t2}</span>
      </div>
      <div class="match-row-data">
        <span class="score-label">Actual Score</span>
        <div class="score-display-row">
          <input type="text" class="actual-score-input" value="${actScore}" placeholder="-- - --" onchange="onMatchScoreChange('${matchId}', this.value)">
        </div>
      </div>
      <div class="predictions-area">
        <div class="prediction-item">
          <span class="pred-player-name">${playerA}</span>
          <div class="pred-content-row">
            <span class="pred-val">${predA.prediction || "--"}</span>
            <span class="point-badge pts-${predA.points}">${predA.points > 0 ? `+${predA.points}` : '0'}</span>
          </div>
        </div>
        <div class="prediction-item" style="border-top: 1px solid rgba(255,255,255,0.03); padding-top:0.4rem; margin-top:0.4rem;">
          <span class="pred-player-name">${playerB}</span>
          <div class="pred-content-row">
            <span class="pred-val">${predB.prediction || "--"}</span>
            <span class="point-badge pts-${predB.points}">${predB.points > 0 ? `+${predB.points}` : '0'}</span>
          </div>
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
      renderActiveGroupMatches();
      return;
    }
    // Re-format clean
    val = `${score[0]}-${score[1]}`;
  }
  
  actualResults.matches[matchId] = val;
  recalculate();
};

// Player selector changed
window.onPlayerSelectChange = function() {
  playerA = document.getElementById("player-a-select").value;
  playerB = document.getElementById("player-b-select").value;
  renderActiveGroupMatches();
};

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
};
