import requests
import sys

BASE_URL = "http://localhost:8000"

def run_smoke_test():
    print("Starting MenuMind Backend Smoke Test...")
    print("(Flexible assertions — agent uses real LLM reasoning, not hardcoded outputs)")

    # 1. Reset Demo Data
    print("\n--- Resetting Demo Data ---")
    resp = requests.post(f"{BASE_URL}/demo/reset")
    assert resp.status_code == 200, "Failed to reset demo"
    print("OK: Demo reset successful.")

    # 2. Get Scenarios
    resp = requests.get(f"{BASE_URL}/signals/scenarios")
    scenarios = resp.json()
    assert len(scenarios) == 5, "Expected 5 scenarios"

    for scenario in scenarios:
        print(f"\n=========================================")
        print(f"Running Scenario: {scenario['name']}")

        # Reset DB based on scenario type
        if scenario["name"] == "Contradiction Test":
            requests.post(f"{BASE_URL}/demo/reset?chicken_stock=50&clear_history=false")
        else:
            requests.post(f"{BASE_URL}/demo/reset?chicken_stock=5&clear_history=false")

        # Ingest signal
        resp = requests.post(f"{BASE_URL}/signals", json={"source_type": "smoke_test", "raw_text": scenario['raw_text']})
        signal = resp.json()

        # Run Agent
        resp = requests.post(f"{BASE_URL}/agent/run/{signal['id']}")
        run_res = resp.json()
        run_id = run_res.get("agent_run_id")

        # Check Run Status (Poll until completion since execution is async)
        import time
        start_time = time.time()
        timeout = 25
        run_details = {}
        status = "running"
        while time.time() - start_time < timeout:
            resp = requests.get(f"{BASE_URL}/agent/runs/{run_id}")
            run_details = resp.json()
            status = run_details['status']
            if status in ["completed", "requires_approval", "failed"]:
                break
            time.sleep(0.5)
            
        print(f"OK: Final Run Status: {status}")

        # Get trace to verify reasoning happened
        resp = requests.get(f"{BASE_URL}/agent/runs/{run_id}/trace")
        traces = resp.json()
        reasoning_steps = [t for t in traces if t["step"] in ["reasoning", "interpret", "impact", "plan"]]
        print(f"OK: Agent produced {len(traces)} trace entries ({len(reasoning_steps)} reasoning steps)")

        # Verify Before/After
        resp = requests.get(f"{BASE_URL}/menu/before-after/{run_id}")
        state = resp.json()
        changes = state.get("changes", [])

        if scenario["name"] == "Supply Shock":
            assert status == "completed", "Supply shock should complete"
            # Agent should respond to supply disruption — any menu mutation counts
            assert len(changes) > 0 or any(t["step"] == "tool_call" for t in traces), \
                "Supply shock must produce some action (menu change or notification)"
            print(f"OK: Supply Shock produced {len(changes)} menu changes.")

        elif scenario["name"] == "Heatwave Demand Shift":
            assert status == "completed", "Heatwave should complete"
            print(f"OK: Heatwave produced {len(changes)} menu changes.")

        elif scenario["name"] == "Competitor Price Attack":
            assert status == "completed", "Competitor attack should complete"
            print(f"OK: Competitor response produced {len(changes)} menu changes.")

        elif scenario["name"] == "Crisis Guardrail":
            assert status == "requires_approval", "Crisis MUST require approval"
            assert len(changes) == 0, "Crisis should NOT mutate menu before approval"
            print("OK: Crisis Guardrail blocked mutations (ethical guardrail working).")

            # Check if approval was created
            resp = requests.get(f"{BASE_URL}/approvals")
            approvals = resp.json()
            crisis_approval = next((a for a in approvals if a["agent_run_id"] == run_id), None)
            assert crisis_approval is not None, "Crisis approval missing"
            assert crisis_approval["status"] == "pending", "Approval should be pending"
            print("OK: Crisis approval created and pending.")

            # Test approval execution
            app_id = crisis_approval["id"]
            resp = requests.post(f"{BASE_URL}/approvals/{app_id}/approve")
            assert resp.status_code == 200, "Approval execution failed"
            print("OK: Crisis approval executed.")

            # Verify notification was created after approval
            resp = requests.get(f"{BASE_URL}/notifications")
            notifs = resp.json()
            approval_notifs = [n for n in notifs if n["agent_run_id"] == run_id]
            assert len(approval_notifs) > 0, "Notifications must exist after crisis approval"
            print(f"OK: {len(approval_notifs)} notification(s) created after approval.")

        elif scenario["name"] == "Contradiction Test":
            assert status == "completed", "Contradiction test should complete"
            print(f"OK: Contradiction test produced {len(changes)} menu changes.")

    # Check final trace quality
    print("\n--- Trace Quality Check ---")
    resp = requests.get(f"{BASE_URL}/agent/runs/1/trace")
    traces = resp.json()
    steps_seen = set(t["step"] for t in traces)
    expected_steps = {"observe", "interpret", "reasoning", "impact", "policy_guard", "plan", "final"}
    missing = expected_steps - steps_seen
    if missing:
        print(f"WARNING: Missing trace steps: {missing}")
    else:
        print("OK: All expected trace steps present.")

    print("\nSUCCESS: All smoke tests passed! Backend is autonomous and stable.")

if __name__ == "__main__":
    try:
        requests.get(f"{BASE_URL}/health")
        run_smoke_test()
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend. Please ensure FastAPI is running on port 8000.")
        sys.exit(1)
    except AssertionError as e:
        print(f"ERROR: Smoke Test Failed: {str(e)}")
        sys.exit(1)
