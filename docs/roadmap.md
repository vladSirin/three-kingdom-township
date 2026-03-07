# 🗺️ Roadmap: Three Kingdoms Township (三国小镇)

> Tracking the development progress, major milestones, and strategic direction of the project.

## 📌 Phase 1: Core Mechanics & MVP (Completed)
- [x] Basic resource management (Morale, Food, Military, Wealth, Reputation).
- [x] Core building system (Upgrades and effects).
- [x] Basic turn-based event resolution via drawn cards.
- [x] Simple UI for stats visualization, building lists, and event interaction.

## 📌 Phase 2: Enhanced Systems & Paradox-Style Narrative (Completed)
- [x] **Disaster & Soft Game Over Mechanics:** Warning events triggered by bad resource bounding.
- [x] **State System (Active States):** Hidden state triggers (e.g. `starving`, `fat_sheep`) altering event probabilities.
- [x] **Alignment Spectrum:** Dynamic leader alignment (-100 to 100) unlocking exclusive events.
- [x] **Interconnected Events:** Events affecting subsequent card decks (e.g., poor construction causes dangerous buildings).
- [x] **Expanded UI Feedback:** Highlight specific traits in player profile, add visual/haptic warnings for statuses.

## 📌 Phase 3: World Map, Factions & Family (Current Focus)
- [ ] **Family & Heirs System:** Implement the data structure for spouses and heirs, tying them into the UI and event pool (e.g., marriage alliances, heir education).
- [ ] **Geographical Awareness:** A minimal representation of surrounding towns/factions (e.g., Yellow Turbans, Dong Zhuo, Cao Cao).
- [ ] **Diplomacy & Trade Map:** Create a World Map UI view that players can toggle to, expanding the `outbound_raid` and tribute mechanics into physical map targets/alliances.
- [ ] **Historical Integration:** Events that align loosely with Three Kingdoms history based on the game year.

## 📌 Technical Debt & Polish
- [ ] Balance passes on resource growth, consumption, and probability weights.
- [ ] Consolidate asset styling.
- [ ] Ensure save/load functionality captures alignment, states, and history correctly.

---
*Last Updated: 2026-03-07*
