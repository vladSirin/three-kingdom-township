# 🗺️ Roadmap: Three Kingdoms Township (三国小镇)

> Tracking the development progress, major milestones, and strategic direction of the project.

## 📌 Phase 1: Core Mechanics & MVP (Completed)
- [x] Basic resource management (Morale, Food, Military, Wealth, Reputation).
- [x] Core building system (Upgrades and effects).
- [x] Basic turn-based event resolution via drawn cards.
- [x] Simple UI for stats visualization, building lists, and event interaction.

## 📌 Phase 2: Enhanced Systems & Paradox-Style Narrative (Current Focus)
- [x] **Disaster & Soft Game Over Mechanics:** Warning events triggered by bad resource bounding.
- [x] **State System (Active States):** Hidden state triggers (e.g. `starving`, `fat_sheep`) altering event probabilities.
- [x] **Trait System:** Permanent leader traits (`benevolent`, `tyrant`) unlocking / influencing options.
- [x] **Interconnected Events:** Events affecting subsequent card decks (e.g., poor construction causes dangerous buildings).
- [ ] **Expanded UI Feedback:** Highlight specific traits in player profile, add visual/haptic warnings for statuses.

## 📌 Phase 3: World Map & Factions (Upcoming)
- [ ] **Geographical Awareness:** A minimal representation of surrounding towns/factions.
- [ ] **Historical Integration:** Events that align loosely with Three Kingdoms history (Yellow Turban Rebellion, Coalition, etc.) based on game year.
- [ ] **Raiding and Diplomacy Map:** Expand the `outbound_raid` and tribute mechanics into physical map targets/alliances.

## 📌 Technical Debt & Polish
- [ ] Balance passes on resource growth, consumption, and probability weights.
- [ ] Consolidate asset styling.
- [ ] Ensure save/load functionality captures traits, states, and history correctly.

---
*Last Updated: 2026-03-06*
