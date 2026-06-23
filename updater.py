import urllib.request
import urllib.parse
import json
import os
import sys
import ssl
import threading
import time
import calculate

TEAM_MAPPING = {
    # Names (lowercase) to App Code
    "mexico": "MEX", "south africa": "ZAF", "korea republic": "ZKO", "south korea": "ZKO",
    "czech republic": "CZE", "czechia": "CZE", "canada": "CAN", "bosnia": "BOS",
    "bosnia and herzegovina": "BOS", "bosnia & herzegovina": "BOS", "qatar": "QAT",
    "switzerland": "SUI", "brazil": "BRA", "morocco": "MAR", "haiti": "HAI",
    "scotland": "SCO", "usa": "USA", "united states": "USA", "paraguay": "PAR",
    "australia": "AUS", "turkey": "TUR", "turkiye": "TUR", "germany": "GER",
    "curacao": "CUW", "curaçao": "CUW", "ivory coast": "IVO", "cote d'ivoire": "IVO",
    "ecuador": "ECU", "netherlands": "NED", "japan": "JAP", "sweden": "SWE",
    "tunisia": "TUN", "spain": "ESP", "cape verde": "CPV", "cabo verde": "CPV",
    "saudi arabia": "SAR", "uruguay": "URU", "belgium": "BEL", "egypt": "EGY",
    "iran": "IRN", "ir iran": "IRN", "new zealand": "NZL", "france": "FRA",
    "senegal": "SEN", "iraq": "IRK", "norway": "NOO", "argentina": "ARG",
    "algeria": "ALG", "austria": "AUT", "jordan": "JOR", "portugal": "POR",
    "dr congo": "COD", "congo dr": "COD", "uzbekistan": "OEZ", "colombia": "COL",
    "england": "ENG", "croatia": "CRO", "ghana": "GHA", "panama": "PAN",
    
    # API-Football Codes to App Code
    "KOR": "ZKO", "BIH": "BOS", "JPN": "JAP", "CPV": "CPV", "KSA": "SAR",
    "IRQ": "IRK", "NOR": "NOO", "COD": "COD", "UZB": "OEZ"
}

def get_app_code(team_name, team_code):
    if team_code and team_code.upper() in TEAM_MAPPING:
        return TEAM_MAPPING[team_code.upper()]
    name_clean = team_name.lower().strip() if team_name else ""
    if name_clean in TEAM_MAPPING:
        return TEAM_MAPPING[name_clean]
    if team_code and len(team_code) == 3:
        return team_code.upper()
    return None

def match_player(api_player_name, local_topscorers):
    api_clean = calculate.clean_name(api_player_name).lower()
    
    # Try exact clean match
    for local_name in local_topscorers:
        local_clean = calculate.clean_name(local_name).lower()
        if api_clean == local_clean:
            return local_name
            
    # Try part match (e.g. "Messi" in "Lionel Messi")
    for local_name in local_topscorers:
        local_clean = calculate.clean_name(local_name).lower()
        local_parts = [p for p in local_clean.replace(".", " ").split() if len(p) > 1]
        for part in local_parts:
            if part in api_clean:
                return local_name
                
    return None

def fetch_api_football(api_key, endpoint, params):
    query = urllib.parse.urlencode(params)
    url = f"https://v3.football.api-sports.io/{endpoint}?{query}"
    
    req = urllib.request.Request(url)
    req.add_header("x-apisports-key", api_key)
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            errors = res_data.get("errors")
            if errors:
                print(f"API Error in {endpoint}: {errors}", file=sys.stderr)
                return None
            return res_data.get("response", [])
    except Exception as e:
        print(f"HTTP Error in {endpoint}: {e}", file=sys.stderr)
        return None

def run_api_update():
    workspace = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(workspace, "config.json")
    results_path = os.path.join(workspace, "actual_results.json")
    
    if not os.path.exists(config_path):
        print("API update skipped: config.json not found.", file=sys.stderr)
        return
        
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except Exception as e:
        print(f"API update skipped: Failed to parse config.json: {e}", file=sys.stderr)
        return
        
    api_key = config.get("api_key")
    if not api_key:
        print("API update skipped: api_key not found in config.json.", file=sys.stderr)
        return
        
    # Load actual results
    if os.path.exists(results_path):
        try:
            with open(results_path, "r", encoding="utf-8") as f:
                actual_results = json.load(f)
        except Exception as e:
            print(f"API update: actual_results.json unreadable, resetting: {e}", file=sys.stderr)
            actual_results = {"matches": {}, "topscorers": {}, "champion": ""}
    else:
        actual_results = {"matches": {}, "topscorers": {}, "champion": ""}
        
    print("API: Starting update from API-Football...")
    
    # Fetch fixtures & topscorers
    fixtures = fetch_api_football(api_key, "fixtures", {"league": "1", "season": "2026"})
    topscorers = fetch_api_football(api_key, "players/topscorers", {"league": "1", "season": "2026"})
    
    updated = False
    
    # 1. Update fixtures
    if fixtures:
        for f in fixtures:
            fixture_info = f.get("fixture", {})
            status = fixture_info.get("status", {}).get("short")
            
            # Only sync finished matches
            if status in ["FT", "AET", "PEN"]:
                teams = f.get("teams", {})
                goals = f.get("goals", {})
                
                home = teams.get("home", {})
                away = teams.get("away", {})
                
                home_code = get_app_code(home.get("name"), home.get("code"))
                away_code = get_app_code(away.get("name"), away.get("code"))
                
                if home_code and away_code:
                    match_id = f"{home_code}-{away_code}"
                    score_val = f"{goals.get('home')}-{goals.get('away')}"
                    
                    if actual_results.get("matches", {}).get(match_id) != score_val:
                        if "matches" not in actual_results:
                            actual_results["matches"] = {}
                        actual_results["matches"][match_id] = score_val
                        updated = True
                        print(f"API: Updated match score for {match_id}: {score_val}")
                        
    # 2. Update topscorers
    if topscorers:
        local_topscorer_names = list(actual_results.get("topscorers", {}).keys())
        for p in topscorers:
            player_info = p.get("player", {})
            goals_info = p.get("statistics", [{}])[0].get("goals", {})
            goals_count = goals_info.get("total", 0)
            
            matched_name = match_player(player_info.get("name"), local_topscorer_names)
            if matched_name and goals_count is not None:
                goals_count = int(goals_count)
                current_goals = int(actual_results["topscorers"][matched_name].get("goals", 0))
                if current_goals != goals_count:
                    actual_results["topscorers"][matched_name]["goals"] = goals_count
                    updated = True
                    print(f"API: Updated topscorer {matched_name}: {goals_count} goals")
                    
    if updated:
        try:
            with open(results_path, "w", encoding="utf-8") as f:
                json.dump(actual_results, f, indent=2, ensure_ascii=False)
            print("API: Saved updated actual_results.json")
            
            # Recalculate standings
            calculate.main()
            print("API: Recalculated standing standings.")
        except Exception as e:
            print(f"API: Failed to save updated actual_results.json or calculate leaderboard: {e}", file=sys.stderr)
    else:
        print("API: No updates found.")

def api_update_loop():
    print("Background API-Football update thread starting...")
    # Sleep briefly to let the main server startup complete
    time.sleep(5)
    while True:
        try:
            run_api_update()
        except Exception as e:
            print(f"Error in background API standing update loop: {e}", file=sys.stderr)
        # Sleep for 1 hour
        time.sleep(3600)

def start_api_updater():
    t = threading.Thread(target=api_update_loop, daemon=True)
    t.start()

# For manual testing
if __name__ == "__main__":
    run_api_update()
