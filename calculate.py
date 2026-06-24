import csv
import json
import os
import sys
from datetime import datetime

def parse_score(score_str):
    if not score_str:
        return None
    score_str = str(score_str).strip()
    if '-' not in score_str:
        return None
    try:
        parts = score_str.split('-')
        return int(parts[0]), int(parts[1])
    except Exception:
        return None

def calculate_match_points(pred_str, act_str):
    pred = parse_score(pred_str)
    act = parse_score(act_str)
    
    if pred is None or act is None:
        return 0
        
    p_home, p_away = pred
    a_home, a_away = act
    
    # Rule 1: Exact correct prediction -> 45 points
    if p_home == a_home and p_away == a_away:
        return 45
        
    # Rule 2: Correct winner or draw (not exact) -> 30 points
    pred_winner = 1 if p_home > p_away else (-1 if p_home < p_away else 0)
    act_winner = 1 if a_home > a_away else (-1 if a_home < a_away else 0)
    
    if pred_winner == act_winner:
        return 30
        
    return 0

def clean_name(name):
    if not name:
        return ""
    name_str = str(name).strip()
    
    # Strip accents
    import unicodedata
    nfkd_form = unicodedata.normalize('NFKD', name_str)
    only_ascii = "".join([c for c in nfkd_form if not unicodedata.combining(c)])
    
    # Clean up residual replacement characters
    only_ascii = only_ascii.replace("\uFFFD", "")
    
    # Replace common garbled patterns from encoding errors
    only_ascii = only_ascii.replace("Dembl", "Dembele")
    only_ascii = only_ascii.replace("Deko", "Dzeko")
    only_ascii = only_ascii.replace("Daz", "Diaz")
    only_ascii = only_ascii.replace("Jimnez", "Jimenez")
    only_ascii = only_ascii.replace("lvarez", "Alvarez")
    only_ascii = only_ascii.replace("Paquet", "Paqueta")
    
    # Match normalized lowercase representation for standard names
    normalized = only_ascii.replace(" ", "").lower()
    
    if normalized == "cronaldo":
        return "C. Ronaldo"
    if "mbapp" in normalized:
        return "K. Mbappe"
    if "dembel" in normalized:
        return "O. Dembele"
    if "dzek" in normalized or "deko" in normalized:
        return "E. Dzeko"
    if "jimenez" in normalized:
        return "R. Jimenez"
    if "diaz" in normalized:
        return "B. Diaz"
    if "alvarez" in normalized:
        return "J. Alvarez"
    if "paquet" in normalized:
        return "L. Paqueta"
        
    return only_ascii

def get_groups(matches):
    adj = {}
    for match_id in matches:
        t1, t2 = match_id.split('-')
        adj.setdefault(t1, set()).add(t2)
        adj.setdefault(t2, set()).add(t1)
    visited = set()
    groups = []
    for team in sorted(adj.keys()):
        if team not in visited:
            comp = []
            queue = [team]
            visited.add(team)
            while queue:
                curr = queue.pop(0)
                comp.append(curr)
                for neighbor in adj[curr]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            groups.append(sorted(comp))
    return sorted(groups, key=lambda g: g[0])

def sort_group_teams(group, matches_scores):
    stats = {team: {'points': 0, 'gd': 0, 'gf': 0} for team in group}
    group_set = set(group)
    h2h_matches = []
    played_matches_count = 0
    
    for match_id, score in matches_scores.items():
        t1, t2 = match_id.split('-')
        if t1 in group_set and t2 in group_set:
            parsed = parse_score(score)
            if parsed is not None:
                played_matches_count += 1
                h, a = parsed
                stats[t1]['gf'] += h
                stats[t2]['gf'] += a
                stats[t1]['gd'] += (h - a)
                stats[t2]['gd'] += (a - h)
                if h > a:
                    stats[t1]['points'] += 3
                elif h < a:
                    stats[t2]['points'] += 3
                else:
                    stats[t1]['points'] += 1
                    stats[t2]['points'] += 1
                h2h_matches.append((t1, t2, h, a))

    def compare_teams(a, b):
        if stats[a]['points'] != stats[b]['points']:
            return stats[b]['points'] - stats[a]['points']
            
        h2h_points_a = 0
        h2h_points_b = 0
        h2h_gd_a = 0
        h2h_gd_b = 0
        h2h_gf_a = 0
        h2h_gf_b = 0
        
        for t1, t2, h, a_goals in h2h_matches:
            if {t1, t2} == {a, b}:
                if t1 == a:
                    h_score, a_score = h, a_goals
                else:
                    h_score, a_score = a_goals, h
                
                h2h_gf_a += h_score
                h2h_gf_b += a_score
                h2h_gd_a += (h_score - a_score)
                h2h_gd_b += (a_score - h_score)
                
                if h_score > a_score:
                    h2h_points_a += 3
                elif h_score < a_score:
                    h2h_points_b += 3
                else:
                    h2h_points_a += 1
                    h2h_points_b += 1
                    
        if h2h_points_a != h2h_points_b:
            return h2h_points_b - h2h_points_a
        if h2h_gd_a != h2h_gd_b:
            return h2h_gd_b - h2h_gd_a
        if h2h_gf_a != h2h_gf_b:
            return h2h_gf_b - h2h_gf_a
            
        if stats[a]['gd'] != stats[b]['gd']:
            return stats[b]['gd'] - stats[a]['gd']
        if stats[a]['gf'] != stats[b]['gf']:
            return stats[b]['gf'] - stats[a]['gf']
            
        if a < b:
            return -1
        elif a > b:
            return 1
        return 0

    from functools import cmp_to_key
    sorted_teams = sorted(group, key=cmp_to_key(compare_teams))
    return sorted_teams, played_matches_count

def main():
    # Use the directory containing the script to dynamically locate project files
    workspace = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(workspace, "voorspellingen.csv")
    results_path = os.path.join(workspace, "actual_results.json")
    leaderboard_path = os.path.join(workspace, "leaderboard.json")
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}", file=sys.stderr)
        sys.exit(1)
        
    # Load actual results
    actual_results = {"matches": {}, "topscorers": {}, "champion": ""}
    if os.path.exists(results_path):
        try:
            with open(results_path, "r", encoding="utf-8") as f:
                actual_results = json.load(f)
        except Exception as e:
            print(f"Warning: Could not parse actual_results.json: {e}. Using empty defaults.", file=sys.stderr)

    rows = []
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter=";")
            rows = [row for row in reader]
    except PermissionError:
        import subprocess
        temp_csv_path = csv_path + ".temp.csv"
        subprocess.run(["powershell", "-Command", f"Copy-Item '{csv_path}' '{temp_csv_path}'"], check=True)
        try:
            with open(temp_csv_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f, delimiter=";")
                rows = [row for row in reader]
        finally:
            try:
                os.remove(temp_csv_path)
            except Exception:
                pass
    except UnicodeDecodeError:
        # Fallback to cp1252/latin-1 if needed
        try:
            with open(csv_path, "r", encoding="latin-1") as f:
                reader = csv.reader(f, delimiter=";")
                rows = [row for row in reader]
        except PermissionError:
            import subprocess
            temp_csv_path = csv_path + ".temp.csv"
            subprocess.run(["powershell", "-Command", f"Copy-Item '{csv_path}' '{temp_csv_path}'"], check=True)
            try:
                with open(temp_csv_path, "r", encoding="latin-1") as f:
                    reader = csv.reader(f, delimiter=";")
                    rows = [row for row in reader]
            finally:
                try:
                    os.remove(temp_csv_path)
                except Exception:
                    pass

    # 1. Read participants (from row 1, col 2 onwards in Excel, index 0, col 1 onwards in CSV)
    participants = []
    if rows:
        header = rows[0]
        for col_idx in range(1, len(header)):
            name = header[col_idx]
            if name and name.strip():
                participants.append({
                    "name": name.strip(),
                    "col_idx": col_idx,
                    "matches": {},
                    "topscorers": [],
                    "champion": ""
                })
            
    print(f"Found participants: {[p['name'] for p in participants]}")
    
    # 2. Read Match Predictions (Rows 2 to 73 in Excel, indices 1 to 72 in CSV rows)
    matches_list = []
    for r in range(1, 73):
        if r >= len(rows):
            continue
        row = rows[r]
        if not row:
            continue
        match_id = row[0]
        if not match_id:
            continue
        match_id = match_id.strip()
        matches_list.append(match_id)
        
        # Get actual score
        act_score = actual_results.get("matches", {}).get(match_id, "")
        
        for p in participants:
            col_idx = p["col_idx"]
            pred_score = row[col_idx] if col_idx < len(row) else ""
            if pred_score is not None:
                pred_score = str(pred_score).strip()
            else:
                pred_score = ""
            pts = calculate_match_points(pred_score, act_score)
            p["matches"][match_id] = {
                "prediction": pred_score,
                "points": pts
            }

    # 3. Read Topscorer Predictions (Rows 74 to 79 in Excel, indices 73 to 78 in CSV rows)
    topscorer_keys = ["Topscorer1", "Topscorer2", "Topscorer3", "Topscorer4", "Topscorer5", "Topscorer6"]
    for idx, r in enumerate(range(73, 79)):
        if r >= len(rows):
            continue
        row = rows[r]
        if not row:
            continue
        key = row[0] or topscorer_keys[idx]
        for p in participants:
            col_idx = p["col_idx"]
            player_name = row[col_idx] if col_idx < len(row) else ""
            player_name = clean_name(player_name)
            p["topscorers"].append(player_name)

    # 4. Read Champion Prediction (Row 80 in Excel, index 79 in CSV rows)
    if len(rows) > 79:
        row = rows[79]
        for p in participants:
            col_idx = p["col_idx"]
            champ_val = row[col_idx] if col_idx < len(row) else ""
            p["champion"] = clean_name(champ_val)

    # Auto-register new topscorers from predictions to actual_results.json if not present
    actual_results_changed = False
    if "topscorers" not in actual_results:
        actual_results["topscorers"] = {}
    
    for p in participants:
        for ts_name in p["topscorers"]:
            if not ts_name:
                continue
            cleaned_pred_name = clean_name(ts_name)
            found = False
            for k in actual_results["topscorers"].keys():
                if clean_name(k).lower() == cleaned_pred_name.lower():
                    found = True
                    break
            if not found:
                actual_results["topscorers"][cleaned_pred_name] = {
                    "goals": 0,
                    "position": "attacker"
                }
                actual_results_changed = True
                print(f"Registered new predicted topscorer in actual_results: {cleaned_pred_name}")
                
    if actual_results_changed:
        try:
            with open(results_path, "w", encoding="utf-8") as f:
                json.dump(actual_results, f, indent=2, ensure_ascii=False)
            print(f"Updated actual_results.json with new topscorer(s) at: {results_path}")
        except Exception as e:
            print(f"Error saving actual_results.json: {e}", file=sys.stderr)

    # 5. Calculate Points
    # Topscorer points multiplier mapping
    multiplier_map = {
        "attacker": 8,
        "midfielder": 16,
        "defender": 32
    }
    
    # Actual topscorers goals and positions
    actual_topscorers = actual_results.get("topscorers", {})
    actual_champion = clean_name(actual_results.get("champion", ""))
    
    # Build list of unique topscorers for the summary
    unique_topscorers_summary = {}
    for name, data in actual_topscorers.items():
        cleaned_n = clean_name(name)
        pos = data.get("position", "attacker").lower()
        goals = int(data.get("goals", 0))
        mult = multiplier_map.get(pos, 8)
        unique_topscorers_summary[cleaned_n] = {
            "name": cleaned_n,
            "position": pos,
            "goals": goals,
            "pointsPerGoal": mult,
            "totalPoints": goals * mult
        }

    # Discover groups dynamically
    groups = get_groups(matches_list)
    
    # Precalculate actual standings for all groups
    actual_standings = {}
    active_groups = set()
    for group in groups:
        group_actual_scores = {}
        for match_id in matches_list:
            t1, t2 = match_id.split('-')
            if t1 in group and t2 in group:
                group_actual_scores[match_id] = actual_results.get("matches", {}).get(match_id, "")
        sorted_actual_teams, played_count = sort_group_teams(group, group_actual_scores)
        actual_ranks = {team: rank for rank, team in enumerate(sorted_actual_teams, 1)}
        actual_standings[tuple(group)] = (sorted_actual_teams, played_count, actual_ranks)
        if played_count == 6:
            active_groups.add(tuple(group))

    leaderboard_records = []
    
    for p in participants:
        # Sum match points
        match_pts = sum(m["points"] for m in p["matches"].values())
        
        # Calculate group position points and build group predictions details
        group_pts = 0
        groups_predictions = []
        
        # Find player's predicted positions first
        player_pred_pos = {}
        for group in groups:
            group_pred_scores = {}
            for match_id in matches_list:
                t1, t2 = match_id.split('-')
                if t1 in group and t2 in group:
                    group_pred_scores[match_id] = p["matches"][match_id]["prediction"]
            sorted_pred_teams, _ = sort_group_teams(group, group_pred_scores)
            for rank, team in enumerate(sorted_pred_teams, 1):
                player_pred_pos[team] = rank

        for idx, group in enumerate(groups, 1):
            group_name = f"Group {chr(64 + idx)}"
            
            sorted_actual_teams, played_count, actual_ranks = actual_standings[tuple(group)]
            
            # Sort the group's teams based on player's predictions for display order
            group_pred_scores = {}
            for match_id in matches_list:
                t1, t2 = match_id.split('-')
                if t1 in group and t2 in group:
                    group_pred_scores[match_id] = p["matches"][match_id]["prediction"]
            sorted_pred_teams, _ = sort_group_teams(group, group_pred_scores)
            
            group_teams_data = []
            for team in sorted_pred_teams:
                pred_rank = player_pred_pos[team]
                act_rank = actual_ranks[team]
                is_correct = (played_count == 6) and (pred_rank == act_rank)
                group_teams_data.append({
                    "team": team,
                    "predictedRank": pred_rank,
                    "actualRank": act_rank if played_count > 0 else "-",
                    "correct": is_correct,
                    "points": 25 if is_correct else 0
                })
                if is_correct:
                    group_pts += 25
            
            groups_predictions.append({
                "groupName": group_name,
                "teams": group_teams_data,
                "isCompleted": played_count == 6,
                "isActive": played_count > 0
            })
        
        # Calculate topscorer points
        ts_details = []
        ts_pts = 0
        total_picked_goals = 0
        for ts_name in p["topscorers"]:
            actual_data = None
            matched_key = ts_name
            for k in actual_topscorers.keys():
                if clean_name(k).lower() == ts_name.lower():
                    actual_data = actual_topscorers[k]
                    matched_key = clean_name(k)
                    break
            
            if actual_data:
                goals = int(actual_data.get("goals", 0))
                pos = actual_data.get("position", "attacker").lower()
                mult = multiplier_map.get(pos, 8)
                player_pts = goals * mult
                total_picked_goals += goals
            else:
                goals = 0
                pos = "attacker"
                mult = 8
                player_pts = 0
                
            ts_pts += player_pts
            ts_details.append({
                "name": matched_key,
                "position": pos,
                "goals": goals,
                "pointsPerGoal": mult,
                "points": player_pts
            })
            
        # Calculate champion points
        correct_champion = False
        champ_pts = 0
        if actual_champion and p["champion"].lower() == actual_champion.lower():
            correct_champion = True
            champ_pts = 250
            
        total_pts = match_pts + ts_pts + champ_pts + group_pts
        
        leaderboard_records.append({
            "name": p["name"],
            "matchPoints": match_pts,
            "topscorerPoints": ts_pts,
            "championPoints": champ_pts,
            "groupPoints": group_pts,
            "totalPoints": total_pts,
            "totalGoals": total_picked_goals,
            "predictions": {
                "matches": p["matches"],
                "topscorers": ts_details,
                "champion": {
                    "predicted": p["champion"],
                    "actual": actual_champion,
                    "points": champ_pts,
                    "correct": correct_champion
                },
                "groups": groups_predictions
            }
        })

    # Sort leaderboard records
    leaderboard_records.sort(key=lambda x: x["totalPoints"], reverse=True)
    # Add ranks
    for rank, record in enumerate(leaderboard_records, 1):
        record["rank"] = rank

    # Format full matches list
    matches_comparison = []
    for match_id in matches_list:
        act_score = actual_results.get("matches", {}).get(match_id, "")
        match_pred_details = {}
        for p in participants:
            match_pred_details[p["name"]] = {
                "prediction": p["matches"][match_id]["prediction"],
                "points": p["matches"][match_id]["points"]
            }
        matches_comparison.append({
            "id": match_id,
            "actual": act_score,
            "predictions": match_pred_details
        })

    # Compile the final leaderboard JSON
    output_data = {
        "lastUpdated": datetime.now().isoformat(),
        "leaderboard": [{
            "rank": r["rank"],
            "name": r["name"],
            "matchPoints": r["matchPoints"],
            "topscorerPoints": r["topscorerPoints"],
            "groupPoints": r["groupPoints"],
            "championPoints": r["championPoints"],
            "totalPoints": r["totalPoints"],
            "totalGoals": r["totalGoals"]
        } for r in leaderboard_records],
        "participantsDetails": leaderboard_records,
        "matches": matches_comparison,
        "topscorers": list(unique_topscorers_summary.values()),
        "champion": {
            "actual": actual_champion
        }
    }
    
    with open(leaderboard_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully calculated standings and wrote leaderboard.json at: {leaderboard_path}")

if __name__ == "__main__":
    main()
