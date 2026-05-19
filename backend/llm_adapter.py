import json
import os
import re
import urllib.error
import urllib.request
from schemas import AgentPlan, PlannedAction
from dotenv import load_dotenv

# Explicitly load the .env file from the backend directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_TIMEOUT_SECONDS = int(os.environ.get("GEMINI_TIMEOUT_SECONDS", "35"))
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

if GEMINI_API_KEY:
    print(f"[SUCCESS] GEMINI_API_KEY loaded successfully. Using real AI ({GEMINI_MODEL}).")
else:
    print("[WARNING] GEMINI_API_KEY NOT FOUND! Using safety fallback.")

def action(tool: str, **args) -> PlannedAction:
    return PlannedAction(tool=tool, args=args)

def action_label(planned_action):
    if not planned_action:
        return "No tool action selected"
    args = planned_action.args
    item = args.get("item_id") or args.get("action_type") or "operation"
    return f"{planned_action.tool} on {item}"

def as_list(value):
    return value if isinstance(value, list) else []

def extract_json_object(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return text
    return text[start:end + 1]

def to_float(value, default=0.5):
    try:
        number = float(value)
        if 1 < number <= 100:
            number = number / 100
        return number
    except (TypeError, ValueError):
        return default

def to_int(value, default=5):
    try:
        if isinstance(value, str):
            match = re.search(r"\d+", value)
            return int(match.group()) if match else default
        return int(value)
    except (TypeError, ValueError):
        return default

def call_gemini(prompt: str) -> str:
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }
    request = urllib.request.Request(
        GEMINI_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=GEMINI_TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini HTTP {exc.code}: {detail[:400]}") from exc

    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    text = "".join(part.get("text", "") for part in parts)
    if not text.strip():
        raise RuntimeError("Gemini returned no text content")
    return text

def build_plan(**data) -> AgentPlan:
    primary = data.get("primary_action")
    secondary = data.get("secondary_actions", [])
    reason = data.get("reason") or "No reasoning provided"
    facts = as_list(data.get("extracted_facts"))
    confidence = max(0.0, min(to_float(data.get("confidence"), 0.5), 1.0))
    impact_score = max(0, min(to_int(data.get("impact_score"), 5), 10))
    recommended = [action_label(primary), *[action_label(a) for a in secondary]] if primary or secondary else []
    recommendations = as_list(data.get("recommended_actions")) or recommended
    workplan = as_list(data.get("workplan")) or ["Parse signal", "Assess demand/impact/policy", "Select tools", "Execute or request approval"]
    simulated = data.get("simulated_execution") or {
        "primary_action": action_label(primary),
        "secondary_actions": [action_label(a) for a in secondary],
        "approval_required": bool(data.get("requires_approval", False)),
    }
    payload = dict(data)
    payload["reason"] = reason
    payload["confidence"] = confidence
    payload["impact_score"] = impact_score
    payload["signal_summary"] = data.get("signal_summary") or (facts[0] if facts else None)
    payload["insight"] = data.get("insight") or reason
    payload["impact_analysis"] = data.get("impact_analysis") or f"Impact score {impact_score}/10 with confidence {confidence}."
    payload["recommended_actions"] = recommendations
    payload["workplan"] = workplan
    payload["extracted_facts"] = facts
    payload["clarifying_questions"] = as_list(data.get("clarifying_questions"))
    payload["secondary_actions"] = as_list(data.get("secondary_actions"))
    payload["simulated_execution"] = simulated
    return AgentPlan(**payload)


class DeterministicPlanner:
    """Safety fallback for demos when Gemini is unavailable."""

    # Expanded signal categories with weighted keywords
    SIGNAL_PATTERNS = {
        "supply_disruption": {
            "keywords": ["short", "nahi", "khatam", "unavailable", "out of stock", "delivery nahi",
                        "axle", "toot", "kharab", "broken", "stuck", "mandi", "supplier", "stock nahi",
                        "finished", "end", "band", "cancel"],
            "food_items": ["chicken", "beef", "mutton", "fish", "paneer", "bread", "flour", "oil"],
            "impact_base": 7
        },
        "crisis": {
            "keywords": ["strike", "hartal", "flood", "sailaab", "disaster", "emergency", "rasta band",
                        "blocked", "protest", "riot", "curfew", "lockdown", "earthquake", "fire"],
            "impact_base": 9
        },
        "weather_demand": {
            "keywords": ["heat", "garmi", "temperature", "weather", "rain", "barish", "cold", "sardi",
                        "storm", "toofan", "heatwave", "advisory", "forecast", "humidity"],
            "impact_base": 5
        },
        "competitor": {
            "keywords": ["competitor", "across the street", "nearby", "cafe", "restaurant", "discount",
                        "dropped", "sale", "offer", "promotion", "cheaper", "price war", "flyer", "deal"],
            "impact_base": 5
        },
        "event_demand": {
            "keywords": ["marathon", "concert", "festival", "event", "exhibition", "match", "game",
                        "wedding", "party", "gathering", "crowd", "rush", "peak", "weekend", "holiday"],
            "impact_base": 6
        }
    }

    def _extract_entities(self, raw: str) -> dict:
        """Extract structured entities from arbitrary text."""
        raw_lower = raw.lower()
        entities = {
            "signal_type": "unknown",
            "affected_items": [],
            "severity": "low",
            "has_food_mention": False,
            "has_crisis_mention": False,
            "has_weather_mention": False,
            "has_competitor_mention": False,
            "has_event_mention": False,
            "mentioned_foods": [],
            "confidence_boost": 0
        }

        # Detect signal type by weighted keyword matching
        scores = {}
        for sig_type, pattern in self.SIGNAL_PATTERNS.items():
            score = sum(1 for kw in pattern["keywords"] if kw in raw_lower)
            if score > 0:
                scores[sig_type] = score

        if scores:
            entities["signal_type"] = max(scores, key=scores.get)
            if scores.get("event_demand") and scores.get("weather_demand"):
                entities["signal_type"] = "event_demand"
            entities["confidence_boost"] = min(scores[entities["signal_type"]] * 0.05, 0.3)

        # Extract mentioned food items
        all_foods = []
        for pattern in self.SIGNAL_PATTERNS.values():
            all_foods.extend(pattern.get("food_items", []))
        for food in set(all_foods):
            if food in raw_lower:
                entities["mentioned_foods"].append(food)
                entities["has_food_mention"] = True

        # Map food mentions to menu items
        food_to_menu = {
            "chicken": "chicken_wrap", "beef": "beef_wrap",
            "bread": "club_sandwich", "flour": "club_sandwich"
        }
        for food, menu_id in food_to_menu.items():
            if food in raw_lower:
                entities["affected_items"].append(menu_id)

        # Detect context flags
        entities["has_crisis_mention"] = bool(scores.get("crisis"))
        entities["has_weather_mention"] = bool(scores.get("weather_demand"))
        entities["has_competitor_mention"] = bool(scores.get("competitor"))
        entities["has_event_mention"] = bool(scores.get("event_demand"))

        # Severity
        if entities["has_crisis_mention"]:
            entities["severity"] = "critical"
        elif entities["signal_type"] == "supply_disruption" and entities["has_food_mention"]:
            entities["severity"] = "high"
        elif entities["signal_type"] in ["weather_demand", "competitor", "event_demand"]:
            entities["severity"] = "medium"

        return entities

    def plan(self, raw_signal: str, before_state: dict, weather_context: dict | None = None) -> AgentPlan:
        entities = self._extract_entities(raw_signal)
        raw = raw_signal.lower()
        requires_approval = False
        primary_action = None
        secondary_actions = []
        extracted_facts = []
        strategic_advice = None
        clarifying_questions = []
        confidence = 0.3 + entities["confidence_boost"]
        impact_score = 0
        reason = ""

        signal_type = entities["signal_type"]

        # Build extracted facts from entities
        extracted_facts.append(f"Signal type detected: {signal_type}")
        if weather_context and weather_context.get("available"):
            extracted_facts.append(f"Live weather context: {weather_context.get('summary')}")
            if weather_context.get("risks"):
                extracted_facts.append(f"Weather risks detected: {', '.join(weather_context['risks'])}")
                if signal_type == "unknown":
                    signal_type = "weather_demand"
                    entities["signal_type"] = "weather_demand"
                    entities["severity"] = "medium"
        if entities["mentioned_foods"]:
            extracted_facts.append(f"Food items mentioned: {', '.join(entities['mentioned_foods'])}")
        if entities["affected_items"]:
            extracted_facts.append(f"Menu items affected: {', '.join(entities['affected_items'])}")
        extracted_facts.append(f"Severity assessed: {entities['severity']}")

        # --- Crisis handling ---
        if signal_type == "crisis":
            requires_approval = True
            impact_score = 9
            confidence = 0.95
            reason = "Crisis detected. Surge pricing blocked by ethical guardrail. Requires human approval for any customer-facing changes."
            primary_action = action("create_approval", action_type="crisis_response", payload={"delay_mins": 40, "message": "Expect delays due to crisis"}, reason="Blocked by ethical guardrail")
            secondary_actions.append(action("send_staff_alert", message=f"Crisis detected: {raw_signal[:100]}. No surge pricing. Expect delays.", severity="high"))
            extracted_facts.append("Ethical guardrail triggered: surge pricing blocked")

        # --- Supply disruption ---
        elif signal_type == "supply_disruption":
            impact_score = 7
            affected = entities["affected_items"]
            if affected:
                item_id = affected[0]
                item = before_state.get(item_id, {})
                stock = item.get("stock", 0)
                if stock > 10:
                    primary_action = action("extend_prep_time", item_id=item_id, minutes=15, reason=f"Supply disruption for {entities['mentioned_foods'][0] if entities['mentioned_foods'] else 'item'}. Buffer stock exists ({stock} units). Extending prep time to conserve.")
                    reason = f"Supply issue detected for {item_id}. Buffer stock ({stock}) sufficient — extending prep time instead of disabling."
                    confidence = 0.85
                    extracted_facts.append(f"Buffer stock ({stock} units) > threshold. Conserving by extending prep time.")
                else:
                    primary_action = action("update_menu_availability", item_id=item_id, available=False, reason=f"Supply failure for {entities['mentioned_foods'][0] if entities['mentioned_foods'] else 'item'}. Stock depleted ({stock} units).")
                    # Find best alternative to promote
                    alternatives = {"chicken_wrap": "beef_wrap", "beef_wrap": "club_sandwich"}
                    alt = alternatives.get(item_id, "club_sandwich")
                    secondary_actions.append(action("set_item_promotion", item_id=alt, promoted=True, reason=f"Promoting {alt} as alternative to unavailable {item_id}"))
                    secondary_actions.append(action("send_staff_alert", message=f"{item_id} is out of stock. Push {alt} as alternative.", severity="medium"))
                    reason = f"Supply failure for {item_id}. Stock depleted ({stock}). Promoting {alt} as alternative."
                    confidence = 0.9
                    extracted_facts.append(f"Stock depleted ({stock} units). Item disabled, alternative promoted.")
            else:
                reason = "Supply disruption detected but no specific menu item identified. Alerting staff."
                confidence = 0.6
                secondary_actions.append(action("send_staff_alert", message=f"Supply disruption reported: {raw_signal[:100]}. Verify affected items.", severity="medium"))

        # --- Weather demand shift ---
        elif signal_type == "weather_demand":
            impact_score = 5
            confidence = 0.85
            is_hot = any(w in raw for w in ["heat", "garmi", "44", "40", "42", "hot", "temperature"])
            is_cold = any(w in raw for w in ["cold", "sardi", "winter", "freeze"])
            is_rain = any(w in raw for w in ["rain", "barish", "storm", "toofan"])

            if is_hot:
                primary_action = action("set_item_promotion", item_id="iced_lemonade", promoted=True, reason="Heatwave detected. Promoting cold beverages to match demand shift.")
                secondary_actions.append(action("send_staff_alert", message="Heatwave active. Prepare extra ice bins. Push cold drinks.", severity="low"))
                reason = "Hot weather detected. Promoting iced drinks, alerting kitchen to prep cold inventory."
                extracted_facts.append("Weather: hot → promoting cold beverages")
            elif is_rain:
                primary_action = action("set_item_promotion", item_id="hot_coffee", promoted=True, reason="Rainy weather detected. Promoting hot beverages.")
                reason = "Rain detected. Promoting hot beverages for comfort demand."
                extracted_facts.append("Weather: rain → promoting hot beverages")
            else:
                reason = "Weather signal detected. No specific temperature extreme identified."
                confidence = 0.5

        # --- Competitor pricing ---
        elif signal_type == "competitor":
            impact_score = 5
            confidence = 0.8
            # Try to extract price from text
            price_match = re.search(r'(\d{3,4})\s*(?:pkr|rs|rupees)?', raw)
            competitor_price = int(price_match.group(1)) if price_match else None

            primary_action = action("set_item_promotion", item_id="club_sandwich", promoted=True, reason=f"Competitor price attack detected{' at ' + str(competitor_price) + ' PKR' if competitor_price else ''}. Promoting our high-margin combo as alternative.")
            secondary_actions.append(action("adjust_item_price", item_id="club_sandwich", new_price=510.0, reason="Discounted to compete without destroying margins on premium items."))
            reason = f"Competitor pricing attack detected. Avoiding margin-destroying price war. Promoting high-margin combo instead."
            extracted_facts.append(f"Competitor detected{' with price: ' + str(competitor_price) + ' PKR' if competitor_price else ''}")
            extracted_facts.append("Strategy: promote alternative combo rather than match destructive pricing")

        # --- Event-driven demand ---
        elif signal_type == "event_demand":
            impact_score = 6
            confidence = 0.75
            is_health = any(w in raw for w in ["marathon", "fitness", "health", "gym", "sport", "running"])
            is_crowd = any(w in raw for w in ["crowd", "rush", "packed", "full", "busy", "peak"])

            if is_health:
                primary_action = action("set_item_promotion", item_id="iced_lemonade", promoted=True, reason="Health-conscious event crowd detected. Promoting natural/healthy drink options.")
                secondary_actions.append(action("send_staff_alert", message="Event nearby: health-conscious crowd expected. Prep extra natural drinks, reduce cold drink stock.", severity="low"))
                reason = "Event detected with health-conscious audience. Promoting natural beverages over processed drinks."
                extracted_facts.append("Event audience: health-conscious → natural drinks recommended")
                strategic_advice = "Consider setting up a quick-service stall outside with pre-poured iced lemonades to capture the marathon crowd immediately as they pass by."
            else:
                primary_action = action("send_staff_alert", message=f"High-demand event detected: {raw_signal[:80]}. Prepare for increased traffic.", severity="medium")
                reason = "Event-driven demand surge detected. Alerting staff to prepare for increased traffic."
                extracted_facts.append("Demand surge expected from nearby event")

        # --- No signal detected (or vague input) ---
        else:
            confidence = 0.2
            impact_score = 1
            reason = "Signal is too vague or lacks actionable business context."
            extracted_facts.append("No clear operational signal detected.")
            clarifying_questions.append("Could you provide more context? For example, is there a specific event, weather alert, or supplier issue happening right now?")

        signal_summary = f"{signal_type.replace('_', ' ').title()} signal assessed at {entities['severity']} severity."
        if signal_type == "unknown":
            signal_summary = "Signal lacks enough operational context for autonomous execution."

        recommended_actions = [action_label(primary_action), *[action_label(a) for a in secondary_actions]] if primary_action or secondary_actions else []
        if clarifying_questions:
            recommended_actions = ["Ask for more context before changing menu state."]

        workplan = [
            f"Observe: parsed signal type as {signal_type}.",
            f"Reason: assessed severity as {entities['severity']} using menu and risk context.",
            "Decide: selected a safe executable action, approval gate, or clarification path.",
            "Execute: simulate menu/alert/approval changes and log before/after state.",
        ]

        simulated_execution = {
            "before": "Current menu state was captured before planning.",
            "after": action_label(primary_action) if primary_action else "No menu change until clarification is provided.",
            "staff_or_customer_message": secondary_actions[0].args.get("message") if secondary_actions else None,
        }

        return build_plan(
            confidence=min(confidence, 1.0),
            impact_score=min(impact_score, 10),
            requires_approval=requires_approval,
            signal_summary=signal_summary,
            insight=reason,
            impact_analysis=f"Expected impact score {min(impact_score, 10)}/10 with confidence {min(confidence, 1.0)}. Severity: {entities['severity']}.",
            recommended_actions=recommended_actions,
            workplan=workplan,
            simulated_execution=simulated_execution,
            extracted_facts=extracted_facts,
            strategic_advice=strategic_advice,
            clarifying_questions=clarifying_questions,
            primary_action=primary_action,
            secondary_actions=secondary_actions,
            reason=reason
        )


class GeminiPlanner:
    """Real LLM-powered planner. Produces proactive, deep reasoning from arbitrary text."""

    SYSTEM_PROMPT = """You are MenuMind, a highly intelligent and proactive autonomous cafe operations agent for a small Pakistani cafe.
Your job is to analyze unstructured business signals, deduce deep business implications, and produce a proactive, structured action plan.

Think critically like a business strategist. 
- If a signal is vague or incomplete (e.g., "business is slow today" or "what should I do?"), you MUST output `clarifying_questions` to gather more context (e.g., "What time of day is it?", "Are there any local events or weather issues?").
- If the signal contains actionable events (e.g., a marathon, a heatwave, competitor pricing), deduce the hidden opportunities. For example, if there is a marathon, don't just alert staff—suggest setting up a temporary stall outside and promoting healthy, high-margin natural drinks (like lemonade) based strictly on your CURRENT MENU STATE.
- Provide `strategic_advice` detailing broader, proactive business moves beyond simple menu tweaks.

You MUST respond with ONLY valid JSON. No markdown, no explanation outside the JSON."""

    def _build_prompt(self, raw_signal: str, before_state: dict, weather_context: dict | None = None) -> str:
        menu_summary = ""
        for item_id, info in before_state.items():
            menu_summary += f"  - {item_id}: {info.get('name', item_id)} | Price: {info.get('price', 0)} PKR | Stock: {info.get('stock', 0)} | Available: {info.get('available', True)} | Prep: {info.get('prep_time', 0)} min\n"

        weather_summary = "Live weather unavailable."
        weather_risks = []
        if weather_context:
            weather_summary = weather_context.get("summary") or weather_summary
            weather_risks = weather_context.get("risks") or []

        return f"""{self.SYSTEM_PROMPT}

CURRENT MENU STATE:
{menu_summary}

LIVE WEATHER CONTEXT:
- {weather_summary}
- Detected weather risks: {", ".join(weather_risks) if weather_risks else "none"}

TOOLS YOU CAN USE:
- update_menu_availability(item_id: str, available: bool, reason: str) — hide/show a menu item
- adjust_item_price(item_id: str, new_price: float, reason: str) — change item price (max 15% increase without approval)
- set_item_promotion(item_id: str, promoted: bool, reason: str) — promote/unpromote an item
- extend_prep_time(item_id: str, minutes: int, reason: str) — add prep time (0-60 min)
- create_approval(action_type: str, payload: dict, reason: str) — request human approval for risky actions
- send_staff_alert(message: str, severity: str) — alert kitchen/staff (severity: low/medium/high)
- create_customer_notice(message: str, affected_items: list) — notify customers

RULES:
1. Crisis signals (flood, strike, disaster) → MUST set requires_approval=true. NEVER surge prices during crisis.
2. Price increase >15% → requires approval
3. If supply is low but buffer stock exists (>10), extend prep time instead of disabling.
4. Be strategic: don't just react — think about what helps the business most. If you see an opportunity (like a crowd), propose `strategic_advice`.
5. If the input is just a greeting or too vague, output a `clarifying_question`.
6. Use only menu item ids that exist in CURRENT MENU STATE. If no safe item match exists, alert staff or ask for clarification.
7. Do not choose actions from a fixed scenario list. Adapt the plan to the raw signal, location, audience, menu, stock, and risk.
8. Do not raise prices during heatwaves, marathons, public disruption, or other public-stress moments. Prefer promotion, prep, stock planning, staff alerts, or approval requests.
9. Use LIVE WEATHER CONTEXT as supporting evidence for demand, prep, staffing, hydration, rain, wind, and customer comfort decisions. If it conflicts with the user signal, mention the uncertainty and choose the safer action.

SIGNAL TO ANALYZE:
"{raw_signal}"

Respond with this exact JSON structure:
{{
    "signal_summary": "One sentence summary of the signal and why it matters.",
    "extracted_facts": [
        "Concrete fact detected from the signal",
        "Relevant menu/state fact from CURRENT MENU STATE",
        "Business context inferred from the signal"
    ],
    "insight": "The main business insight, including demand, customer behavior, competition, supply, ethics, or operational risk.",
    "impact_analysis": "Specific explanation of expected operational/revenue/customer impact.",
    "recommended_actions": [
        "Recommended action 1 with rationale",
        "Recommended action 2 with rationale"
    ],
    "workplan": [
        "Observe: what was parsed",
        "Reason: what implication was inferred",
        "Decide: why this action/approval/clarification was selected",
        "Execute: what tool action will be simulated"
    ],
    "simulated_execution": {{
        "before": "Important before-state summary",
        "after": "Expected after-state summary",
        "staff_or_customer_message": "Draft operational message if useful"
    }},
    "strategic_advice": "High-level proactive business advice. Use null if not applicable.",
    "clarifying_questions": [
        "Ask questions only if the signal is too vague or lacks business context."
    ],
    "confidence": 0.0,
    "impact_score": 0,
    "requires_approval": false,
    "reason": "Detailed reasoning: what you detected, why it matters, what strategy you chose, and why.",
    "primary_action": {{
        "tool": "tool_name",
        "args": {{"arg1": "value1", "arg2": "value2"}}
    }},
    "secondary_actions": [
        {{"tool": "tool_name", "args": {{"arg1": "value1"}}}}
    ]
}}

Use null for primary_action when the signal needs clarification and no safe action should execute."""

    def plan(self, raw_signal: str, before_state: dict, weather_context: dict | None = None) -> AgentPlan:
        if not GEMINI_API_KEY:
            raise Exception("Gemini API key not found")

        prompt = self._build_prompt(raw_signal, before_state, weather_context)
        try:
            text = call_gemini(prompt).strip()
        except Exception as exc:
            raise TimeoutError(f"Gemini planner request failed or timed out after {GEMINI_TIMEOUT_SECONDS} seconds") from exc

        # Strip markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()

        data = json.loads(extract_json_object(text))

        primary_action = None
        if isinstance(data.get("primary_action"), dict) and data["primary_action"].get("tool"):
            primary_action = PlannedAction(**data["primary_action"])

        secondary_actions = []
        for sa in as_list(data.get("secondary_actions")):
            if isinstance(sa, dict) and sa.get("tool"):
                secondary_actions.append(PlannedAction(**sa))

        return build_plan(
            confidence=to_float(data.get("confidence"), 0.5),
            impact_score=to_int(data.get("impact_score"), 5),
            requires_approval=bool(data.get("requires_approval", False)),
            signal_summary=data.get("signal_summary"),
            insight=data.get("insight"),
            impact_analysis=data.get("impact_analysis"),
            recommended_actions=as_list(data.get("recommended_actions")),
            workplan=as_list(data.get("workplan")),
            simulated_execution=data.get("simulated_execution"),
            extracted_facts=as_list(data.get("extracted_facts")),
            strategic_advice=data.get("strategic_advice"),
            clarifying_questions=as_list(data.get("clarifying_questions")),
            primary_action=primary_action,
            secondary_actions=secondary_actions,
            reason=data.get("reason", "No reasoning provided")
        )


def get_planner():
    if GEMINI_API_KEY:
        return GeminiPlanner()
    return DeterministicPlanner()
