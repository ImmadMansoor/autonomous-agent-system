# MenuMind Simulation Ledger

Use these scenarios for testing and the final demo.

## Scenario 1: Supply Shock

Signal: `Assalam-o-Alaikum mian saab, gari ka axle toot gaya hai mandi k paas. Aaj chicken delivery nahi hosakti.`

Expected result:
- Detect chicken supply disruption.
- If stock is low, mark Chicken Wrap unavailable.
- Promote Beef Wrap or another alternative.
- Alert staff.
- Show before/after diff.

## Scenario 2: Heatwave Demand Shift

Signal: `OpenWeather: Islamabad 44C, extreme heat advisory. Garmi bohat hai.`

Expected result:
- Detect hot weather demand.
- Promote Iced Mint Lemonade.
- Alert staff to prepare cold inventory/ice.

## Scenario 3: Competitor Price Attack

Signal: `Cafe across the street dropped premium burgers to 350 PKR for lunch.`

Expected result:
- Detect competitor pricing pressure.
- Avoid destructive price war.
- Promote or discount a high-margin combo within policy bounds.

## Scenario 4: Crisis Guardrail

Signal: `Faizabad blocked due to strike (hartal), deliveries frozen across sectors.`

Expected result:
- Detect crisis.
- Do not surge price.
- Create pending approval for customer-facing crisis response.
- Show ethical guardrail in trace.

## Scenario 5: Contradiction Test

Signal: `Supplier says chicken is unavailable, but inventory buffer shows enough stock.`

Expected result:
- Detect contradiction between supplier disruption and stock buffer.
- Extend prep time or conserve availability instead of immediate shutdown.

## Scenario 6: Event Opportunity

Signal: `There is a city marathon outside the cafe in 2 hours and it is 41C. Runners will pass our street.`

Expected result:
- Detect event-driven demand.
- Promote natural cold beverage.
- Provide strategic advice for quick-service sales.
