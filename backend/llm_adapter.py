import json
import os
import re
from schemas import AgentPlan, PlannedAction
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

import google.generativeai as genai
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None


class DeterministicPlanner:
    """Smarter fallback: extracts structured facts from arbitrary text, not just keyword matching."""

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
        entities["has_crisis_mention"] = entities["signal_type"] == "crisis"
        entities["has_weather_mention"] = entities["signal_type"] == "weather_demand"
        entities["has_competitor_mention"] = entities["signal_type"] == "competitor"
        entities["has_event_mention"] = entities["signal_type"] == "event_demand"

        # Severity
        if entities["has_crisis_mention"]:
            entities["severity"] = "critical"
        elif entities["signal_type"] == "supply_disruption" and entities["has_food_mention"]:
            entities["severity"] = "high"
        elif entities["signal_type"] in ["weather_demand", "competitor", "event_demand"]:
            entities["severity"] = "medium"

        return entities

    def plan(self, raw_signal: str, before_state: dict) -> AgentPlan:
        entities = self._extract_entities(raw_signal)
        raw = raw_signal.lower()
        requires_approval = False
        primary_action = None
        secondary_actions = []
        extracted_facts = []
        confidence = 0.3 + entities["confidence_boost"]
        impact_score = 0
        reason = ""

        signal_type = entities["signal_type"]

        # Build extracted facts from entities
        extracted_facts.append(f"Signal type detected: {signal_type}")
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
            primary_action = PlannedAction(tool="create_approval", args={
                "action_type": "crisis_response",
                "payload": {"delay_mins": 40, "message": "Expect delays due to crisis"},
                "reason": "Blocked by ethical guardrail"
            })
            secondary_actions.append(PlannedAction(tool="send_staff_alert", args={
                "message": f"Crisis detected: {raw_signal[:100]}. No surge pricing. Expect delays.",
                "severity": "high"
            }))
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
                    primary_action = PlannedAction(tool="extend_prep_time", args={
                        "item_id": item_id, "minutes": 15,
                        "reason": f"Supply disruption for {entities['mentioned_foods'][0] if entities['mentioned_foods'] else 'item'}. Buffer stock exists ({stock} units). Extending prep time to conserve."
                    })
                    reason = f"Supply issue detected for {item_id}. Buffer stock ({stock}) sufficient — extending prep time instead of disabling."
                    confidence = 0.85
                    extracted_facts.append(f"Buffer stock ({stock} units) > threshold. Conserving by extending prep time.")
                else:
                    primary_action = PlannedAction(tool="update_menu_availability", args={
                        "item_id": item_id, "available": False,
                        "reason": f"Supply failure for {entities['mentioned_foods'][0] if entities['mentioned_foods'] else 'item'}. Stock depleted ({stock} units)."
                    })
                    # Find best alternative to promote
                    alternatives = {"chicken_wrap": "beef_wrap", "beef_wrap": "club_sandwich"}
                    alt = alternatives.get(item_id, "club_sandwich")
                    secondary_actions.append(PlannedAction(tool="set_item_promotion", args={
                        "item_id": alt, "promoted": True,
                        "reason": f"Promoting {alt} as alternative to unavailable {item_id}"
                    }))
                    secondary_actions.append(PlannedAction(tool="send_staff_alert", args={
                        "message": f"{item_id} is out of stock. Push {alt} as alternative.",
                        "severity": "medium"
                    }))
                    reason = f"Supply failure for {item_id}. Stock depleted ({stock}). Promoting {alt} as alternative."
                    confidence = 0.9
                    extracted_facts.append(f"Stock depleted ({stock} units). Item disabled, alternative promoted.")
            else:
                reason = "Supply disruption detected but no specific menu item identified. Alerting staff."
                confidence = 0.6
                secondary_actions.append(PlannedAction(tool="send_staff_alert", args={
                    "message": f"Supply disruption reported: {raw_signal[:100]}. Verify affected items.",
                    "severity": "medium"
                }))

        # --- Weather demand shift ---
        elif signal_type == "weather_demand":
            impact_score = 5
            confidence = 0.85
            is_hot = any(w in raw for w in ["heat", "garmi", "44", "40", "42", "hot", "temperature"])
            is_cold = any(w in raw for w in ["cold", "sardi", "winter", "freeze"])
            is_rain = any(w in raw for w in ["rain", "barish", "storm", "toofan"])

            if is_hot:
                primary_action = PlannedAction(tool="set_item_promotion", args={
                    "item_id": "iced_lemonade", "promoted": True,
                    "reason": "Heatwave detected. Promoting cold beverages to match demand shift."
                })
                secondary_actions.append(PlannedAction(tool="send_staff_alert", args={
                    "message": "Heatwave active. Prepare extra ice bins. Push cold drinks.",
                    "severity": "low"
                }))
                reason = "Hot weather detected. Promoting iced drinks, alerting kitchen to prep cold inventory."
                extracted_facts.append("Weather: hot → promoting cold beverages")
            elif is_rain:
                primary_action = PlannedAction(tool="set_item_promotion", args={
                    "item_id": "hot_coffee", "promoted": True,
                    "reason": "Rainy weather detected. Promoting hot beverages."
                })
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

            primary_action = PlannedAction(tool="set_item_promotion", args={
                "item_id": "club_sandwich", "promoted": True,
                "reason": f"Competitor price attack detected{' at ' + str(competitor_price) + ' PKR' if competitor_price else ''}. Promoting our high-margin combo as alternative."
            })
            secondary_actions.append(PlannedAction(tool="adjust_item_price", args={
                "item_id": "club_sandwich", "new_price": 510.0,
                "reason": "Discounted to compete without destroying margins on premium items."
            }))
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
                primary_action = PlannedAction(tool="set_item_promotion", args={
                    "item_id": "iced_lemonade", "promoted": True,
                    "reason": "Health-conscious event crowd detected. Promoting natural/healthy drink options."
                })
                secondary_actions.append(PlannedAction(tool="send_staff_alert", args={
                    "message": "Event nearby: health-conscious crowd expected. Prep extra natural drinks, reduce cold drink stock.",
                    "severity": "low"
                }))
                reason = "Event detected with health-conscious audience. Promoting natural beverages over processed drinks."
                extracted_facts.append("Event audience: health-conscious → natural drinks recommended")
            else:
                primary_action = PlannedAction(tool="send_staff_alert", args={
                    "message": f"High-demand event detected: {raw_signal[:80]}. Prepare for increased traffic.",
                    "severity": "medium"
                })
                reason = "Event-driven demand surge detected. Alerting staff to prepare for increased traffic."
                extracted_facts.append("Demand surge expected from nearby event")

        # --- No signal detected ---
        else:
            confidence = 0.2
            impact_score = 1
            reason = "Could not determine signal type from input. No autonomous action taken."
            extracted_facts.append("No recognized signal pattern found in input text")

        return AgentPlan(
            confidence=min(confidence, 1.0),
            impact_score=min(impact_score, 10),
            requires_approval=requires_approval,
            extracted_facts=extracted_facts,
            primary_action=primary_action,
            secondary_actions=secondary_actions,
            reason=reason
        )


class GeminiPlanner:
    """Real LLM-powered planner. Produces genuine reasoning from arbitrary text."""

    SYSTEM_PROMPT = """You are MenuMind, an autonomous cafe operations agent for a small Pakistani cafe.
Your job is to analyze unstructured business signals and produce a structured action plan.

You must REASON through the signal, not just summarize it. Think about:
- What is actually happening? (supply disruption? weather shift? competitor action? event demand? crisis?)
- What items on the menu are affected and why?
- What are the business implications? (revenue loss, customer satisfaction, operational impact)
- What is the best strategic response? (not always the obvious one)
- Are there any ethical concerns? (crisis exploitation, price gouging)

You MUST respond with ONLY valid JSON. No markdown, no explanation outside the JSON."""

    def _build_prompt(self, raw_signal: str, before_state: dict) -> str:
        menu_summary = ""
        for item_id, info in before_state.items():
            menu_summary += f"  - {item_id}: {info.get('name', item_id)} | Price: {info.get('price', 0)} PKR | Stock: {info.get('stock', 0)} | Available: {info.get('available', True)} | Prep: {info.get('prep_time', 0)} min\n"

        return f"""{self.SYSTEM_PROMPT}

CURRENT MENU STATE:
{menu_summary}

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
3. If supply is low but buffer stock exists (>10), extend prep time instead of disabling
4. Be strategic: don't just react — think about what helps the business most

SIGNAL TO ANALYZE:
"{raw_signal}"

Respond with this exact JSON structure:
{{
    "extracted_facts": [
        "What you detected from the signal (signal type, affected items, context)",
        "Key reasoning insight 1",
        "Key reasoning insight 2"
    ],
    "confidence": 0.0 to 1.0,
    "impact_score": 0 to 10,
    "requires_approval": true or false,
    "reason": "Your detailed reasoning: what you detected, why it matters, what strategy you chose and why",
    "primary_action": {{
        "tool": "tool_name",
        "args": {{"arg1": "value1", "arg2": "value2"}}
    }},
    "secondary_actions": [
        {{"tool": "tool_name", "args": {{"arg1": "value1"}}}}
    ]
}}"""

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def plan(self, raw_signal: str, before_state: dict) -> AgentPlan:
        if not model:
            raise Exception("Gemini API key not found")

        prompt = self._build_prompt(raw_signal, before_state)
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()

        data = json.loads(text)

        primary_action = None
        if data.get("primary_action"):
            primary_action = PlannedAction(**data["primary_action"])

        secondary_actions = []
        for sa in data.get("secondary_actions", []):
            secondary_actions.append(PlannedAction(**sa))

        return AgentPlan(
            confidence=float(data.get("confidence", 0.5)),
            impact_score=int(data.get("impact_score", 5)),
            requires_approval=bool(data.get("requires_approval", False)),
            extracted_facts=data.get("extracted_facts", []),
            primary_action=primary_action,
            secondary_actions=secondary_actions,
            reason=data.get("reason", "No reasoning provided")
        )


def get_planner():
    if GEMINI_API_KEY:
        return GeminiPlanner()
    return DeterministicPlanner()
