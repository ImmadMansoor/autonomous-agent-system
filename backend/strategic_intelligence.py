import re
from typing import Any


def clamp(value: float, low: float, high: float):
    return max(low, min(high, value))


def safe_number(value: Any, default: float = 0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def weather_heat_score(weather_context: dict | None):
    if not weather_context:
        return 0
    current = weather_context.get("current") or {}
    daily = weather_context.get("daily") or {}
    temp = safe_number(current.get("temperature_2m"), 0)
    max_temp = safe_number(daily.get("temperature_2m_max"), temp)
    effective = max(temp, max_temp)
    if effective >= 40:
        return 3
    if effective >= 34:
        return 2
    if effective >= 28:
        return 1
    return 0


def detect_context(raw_signal: str):
    raw = raw_signal.lower()
    return {
        "event": any(word in raw for word in ["marathon", "concert", "festival", "match", "exam", "event", "crowd", "rush"]),
        "fitness": any(word in raw for word in ["marathon", "runner", "fitness", "gym", "health", "sport"]),
        "family": any(word in raw for word in ["family", "families", "school", "kids", "children", "holiday"]),
        "student": any(word in raw for word in ["student", "exam", "university", "college", "school"]),
        "office": any(word in raw for word in ["office", "lunch", "corporate", "workers", "commute"]),
        "competitor": any(word in raw for word in ["competitor", "nearby cafe", "across the street", "price", "discount", "deal", "cheaper"]),
        "supplier": any(word in raw for word in ["supplier", "delivery", "stock", "unavailable", "short", "nahi", "khatam", "broken"]),
        "crisis": any(word in raw for word in ["flood", "strike", "hartal", "blocked", "emergency", "protest", "curfew", "riot"]),
        "rain": any(word in raw for word in ["rain", "barish", "storm"]),
        "heat": any(word in raw for word in ["heat", "heatwave", "garmi", "hot", "40c", "42c", "44c"]),
    }


def classify_audience(ctx: dict, heat_score: int):
    personas = []
    if ctx["fitness"]:
        personas.append({
            "persona": "fitness-focused runners and spectators",
            "probability": 0.78,
            "reason": "Sports/event language raises the likelihood of health-aware demand.",
        })
    if ctx["family"]:
        personas.append({
            "persona": "families",
            "probability": 0.62,
            "reason": "Family/school/holiday language suggests group buying and shareable snacks.",
        })
    if ctx["student"]:
        personas.append({
            "persona": "students",
            "probability": 0.66,
            "reason": "Education/exam language suggests budget-sensitive quick meals.",
        })
    if ctx["office"]:
        personas.append({
            "persona": "office workers",
            "probability": 0.68,
            "reason": "Office/lunch/commute language suggests fast service and bundles.",
        })
    if ctx["crisis"]:
        personas.append({
            "persona": "disrupted customers and delivery riders",
            "probability": 0.7,
            "reason": "Crisis language suggests customers value fairness, clarity, and delay notices.",
        })
    if ctx["event"] and not personas:
        personas.append({
            "persona": "event crowd",
            "probability": 0.64,
            "reason": "Nearby event/crowd language suggests elevated footfall.",
        })
    if heat_score and not any("fitness" in p["persona"] for p in personas):
        personas.append({
            "persona": "heat-exposed walk-in customers",
            "probability": 0.58 + heat_score * 0.07,
            "reason": "Hot weather increases hydration and short-prep demand.",
        })
    if not personas:
        personas.append({
            "persona": "general cafe customers",
            "probability": 0.5,
            "reason": "Signal lacks enough persona markers for a specialized segment.",
        })
    return personas[:4]


def menu_candidates(before_state: dict):
    items = []
    for item_id, item in before_state.items():
        price = safe_number(item.get("price"), 0)
        stock = safe_number(item.get("stock"), 0)
        prep = safe_number(item.get("prep_time"), 10)
        name = str(item.get("name", item_id)).lower()
        category_bonus = 0
        if any(word in name for word in ["lemonade", "juice", "smoothie", "mint", "iced"]):
            category_bonus += 3
        if any(word in name for word in ["wrap", "sandwich", "bowl"]):
            category_bonus += 1
        availability_bonus = 2 if item.get("available", True) else -5
        stock_bonus = clamp(stock / 25, 0, 4)
        prep_bonus = 2 if prep <= 6 else 1 if prep <= 12 else 0
        margin_proxy = clamp(price / 200, 0, 3)
        items.append({
            "item_id": item_id,
            "name": item.get("name", item_id),
            "score": category_bonus + availability_bonus + stock_bonus + prep_bonus + margin_proxy,
            "price": price,
            "stock": stock,
            "prep_time": prep,
        })
    return sorted(items, key=lambda item: item["score"], reverse=True)


def demand_forecast(ctx: dict, heat_score: int, candidates: list[dict]):
    base_lift = 0
    if ctx["event"]:
        base_lift += 18
    if ctx["fitness"]:
        base_lift += 12
    if ctx["heat"] or heat_score:
        base_lift += 10 + heat_score * 5
    if ctx["competitor"]:
        base_lift -= 4
    if ctx["crisis"]:
        base_lift -= 10
    base_lift = int(clamp(base_lift, -20, 60))
    top_items = [item["item_id"] for item in candidates[:3]]
    category_lifts = {
        "cold_beverages": max(base_lift + (15 if heat_score else 5), 0),
        "light_food": max(base_lift + (8 if ctx["fitness"] or ctx["event"] else 0), 0),
        "heavy_meals": -8 if ctx["fitness"] or heat_score else 0,
    }
    return {
        "overall_demand_lift_pct": base_lift,
        "category_lifts_pct": category_lifts,
        "priority_items": top_items,
        "confidence": 0.72 if ctx["event"] or ctx["heat"] or heat_score else 0.58,
        "reason": "Demand lift combines signal type, audience likelihood, weather, stock, prep time, and menu fit.",
    }


def staffing_plan(ctx: dict, forecast: dict):
    demand = forecast.get("overall_demand_lift_pct", 0)
    extra_counter = 1 if demand >= 20 else 0
    extra_prep = 1 if demand >= 35 else 0
    if ctx["crisis"]:
        return {
            "recommendation": "Keep staffing steady, assign one person to customer updates, and avoid over-promising delivery times.",
            "extra_counter_staff": 0,
            "extra_prep_staff": 0,
            "prep_start_minutes_early": 15,
        }
    return {
        "recommendation": "Prepare high-fit items early and use quick-service handling during the demand window.",
        "extra_counter_staff": extra_counter,
        "extra_prep_staff": extra_prep,
        "prep_start_minutes_early": 30 if demand >= 20 else 10,
    }


def competitor_strategy(ctx: dict, candidates: list[dict]):
    if not ctx["competitor"]:
        return {
            "active": False,
            "strategy": "No competitor-specific response required.",
        }
    best = candidates[0] if candidates else {"item_id": "menu_item", "name": "high-margin item"}
    return {
        "active": True,
        "strategy": "Avoid a full price war. Use a limited bundle or targeted promo on a high-fit/high-margin item.",
        "recommended_item_id": best["item_id"],
        "reason": "Margin-safe bundling protects profit better than matching a competitor's headline discount.",
    }


def bundle_recommendations(ctx: dict, candidates: list[dict]):
    if not candidates:
        return []
    primary = candidates[0]
    secondary = candidates[1] if len(candidates) > 1 else candidates[0]
    if ctx["fitness"] or ctx["heat"] or ctx["event"]:
        return [{
            "name": "Hydration Fast Pass",
            "items": [primary["item_id"], secondary["item_id"]],
            "positioning": "healthy hydration and quick recovery",
            "discount_pct": 8,
        }]
    if ctx["competitor"]:
        return [{
            "name": "Value Shield Combo",
            "items": [primary["item_id"], secondary["item_id"]],
            "positioning": "better value without a price war",
            "discount_pct": 6,
        }]
    return []


def campaign_plan(ctx: dict, personas: list[dict], bundles: list[dict], candidates: list[dict]):
    target = personas[0]["persona"] if personas else "local customers"
    item = candidates[0]["name"] if candidates else "featured item"
    if ctx["crisis"]:
        return {
            "channel": "customer_notice",
            "target": target,
            "message": "Service may be delayed today due to local disruption. We are keeping prices fair and prioritizing clear updates.",
            "offer": None,
        }
    if bundles:
        return {
            "channel": "local_campaign",
            "target": target,
            "message": f"Quick refresh near you: try our {bundles[0]['name']} built for {bundles[0]['positioning']}.",
            "offer": bundles[0]["name"],
        }
    return {
        "channel": "local_campaign",
        "target": target,
        "message": f"Today's smart pick: {item}, selected based on current demand and prep readiness.",
        "offer": item,
    }


def revenue_projection(ctx: dict, forecast: dict, candidates: list[dict]):
    demand_lift = safe_number(forecast.get("overall_demand_lift_pct"), 0)
    top_price = safe_number(candidates[0]["price"], 250) if candidates else 250
    estimated_extra_units = int(max(0, demand_lift / 5))
    margin_rate = 0.45
    if ctx["competitor"]:
        margin_rate = 0.38
    if ctx["crisis"]:
        margin_rate = 0.25
    estimated_profit = round(estimated_extra_units * top_price * margin_rate, 2)
    return {
        "estimated_extra_units": estimated_extra_units,
        "estimated_profit_pkr": estimated_profit,
        "confidence": forecast.get("confidence", 0.6),
        "assumptions": [
            "Projection is directional, not POS-grade forecasting.",
            "Uses menu price, likely demand lift, stock/prep readiness, and margin proxy.",
        ],
    }


def build_strategic_intelligence(raw_signal: str, before_state: dict, weather_context: dict | None = None):
    ctx = detect_context(raw_signal)
    heat_score = max(weather_heat_score(weather_context), 2 if ctx["heat"] else 0)
    candidates = menu_candidates(before_state)
    personas = classify_audience(ctx, heat_score)
    forecast = demand_forecast(ctx, heat_score, candidates)
    staffing = staffing_plan(ctx, forecast)
    competitor = competitor_strategy(ctx, candidates)
    bundles = bundle_recommendations(ctx, candidates)
    campaign = campaign_plan(ctx, personas, bundles, candidates)
    revenue = revenue_projection(ctx, forecast, candidates)
    return {
        "audience_personas": personas,
        "demand_forecast": forecast,
        "staffing_plan": staffing,
        "competitor_strategy": competitor,
        "revenue_projection": revenue,
        "campaign_plan": campaign,
        "bundle_recommendations": bundles,
    }


def enrich_plan(plan, intelligence: dict):
    for key, value in intelligence.items():
        current = getattr(plan, key, None)
        if current in (None, [], {}):
            setattr(plan, key, value)
    recommendations = list(plan.recommended_actions or [])
    forecast = plan.demand_forecast or {}
    staffing = plan.staffing_plan or {}
    campaign = plan.campaign_plan or {}
    bundles = plan.bundle_recommendations or []
    if forecast:
        recommendations.append(
            f"Forecast demand lift: {forecast.get('overall_demand_lift_pct', 0)}%; prioritize {', '.join(forecast.get('priority_items', [])[:3])}."
        )
    if staffing:
        recommendations.append(
            f"Staffing/prep: {staffing.get('recommendation')} Start prep {staffing.get('prep_start_minutes_early', 0)} minutes early."
        )
    if bundles:
        recommendations.append(f"Bundle: launch {bundles[0].get('name')} positioned for {bundles[0].get('positioning')}.")
    if campaign:
        recommendations.append(f"Campaign draft: {campaign.get('message')}")
    plan.recommended_actions = list(dict.fromkeys(filter(None, recommendations)))
    if not plan.strategic_advice and campaign:
        plan.strategic_advice = campaign.get("message")
    if isinstance(plan.simulated_execution, dict):
        plan.simulated_execution["demand_forecast"] = forecast
        plan.simulated_execution["campaign_plan"] = campaign
        plan.simulated_execution["revenue_projection"] = plan.revenue_projection
    return plan
