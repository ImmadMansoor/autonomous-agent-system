import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_pipeline():
    print("1. Resetting DB and seeding menu items...")
    res = requests.post(f"{BASE_URL}/demo/reset")
    print(res.json())

    print("\n2. Getting initial menu state...")
    res = requests.get(f"{BASE_URL}/menu")
    menu = res.json()
    print(f"Found {len(menu)} items.")

    print("\n3. Sending a signal (Supply Shock)...")
    payload = {
        "source_type": "WhatsApp",
        "raw_text": "Assalam-o-Alaikum mian saab, gari ka axle toot gaya hai mandi k paas. Aaj chicken delivery nahi hosakti."
    }
    res = requests.post(f"{BASE_URL}/signals", json=payload)
    signal = res.json()
    print(f"Signal ID: {signal['id']}")

    print("\n4. Running Agent Pipeline...")
    res = requests.post(f"{BASE_URL}/agent/run/{signal['id']}")
    run_info = res.json()
    run_id = run_info.get("agent_run_id")
    print(f"Run ID: {run_id}")

    print("\n5. Fetching Agent Trace (waiting for completion)...")
    status = "running"
    while status == "running":
        res = requests.get(f"{BASE_URL}/agent/runs/{run_id}")
        status = res.json().get("status")
        time.sleep(0.5)

    res = requests.get(f"{BASE_URL}/agent/runs/{run_id}/trace")
    traces = res.json()
    for t in traces:
        print(f"[{t['step'].upper()}] {t['message']}")

    print("\n6. Fetching Before/After State...")
    res = requests.get(f"{BASE_URL}/menu/before-after/{run_id}")
    states = res.json()
    import json
    before = json.loads(states['before'])
    after = json.loads(states['after'])
    
    print(f"Chicken Wrap Availability Before: {before.get('chicken_wrap', {}).get('available')}")
    print(f"Chicken Wrap Availability After:  {after.get('chicken_wrap', {}).get('available')}")

if __name__ == "__main__":
    test_pipeline()
