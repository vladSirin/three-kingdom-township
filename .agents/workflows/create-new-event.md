---
description: How to design and implement new Event Cards for the Three Kingdoms Township game
---

# Agent Workflow: Event Creation Protocol

This guide outlines the strict protocol and data schema required for any AI Assistant or Agent to write new Event Cards for the `events.js` file in **Three Kingdoms Township**. The game engine uses a purely data-driven architecture. 

**DO NOT** modify the core logic in `game.js` to add new custom event checks unless explicitly asked by the user.

## 1. File Location
All events are pushed into the `EVENTS` array (or `DISASTER_EVENTS`) inside `events.js`.

## 2. Event Design Principles
- **Concise Narrative**: Descriptions and outcomes should use a storytelling tone fit for a historical/Three Kingdoms setting.
- **Consequences**: Every choice must have consequences (resource changes, alignment shifts, or state injections). Avoid choices that do absolutely nothing unless it explicitly serves a narrative point.
- **Dynamic Injections**: Always consider adding `condition` blocks so the event does not blindly flood the early game (e.g., requires level 1 farm, or requires population over 60%).

## 3. The Strict Schema

Your new event object must strictly adhere to the following schema. **Never invent new keys.**

```javascript
/**
 * @typedef {Object} EventCondition
 * @property {string} [building] - Required building ID (e.g., 'hospital', 'market')
 * @property {number} [minLevel] - Minimum level of the required building
 * @property {number} [maxLevel] - Maximum level of the required building
 * @property {string} [resource] - Specific resource to check (e.g., 'food', 'wealth')
 * @property {number} [minValue] - Minimum raw value of the resource
 * @property {number} [minPopRatio] - Min population capacity ratio (0.0 to X.X)
 * @property {number} [maxPopRatio] - Max population capacity ratio (0.0 to X.X)
 * @property {Object<string, number>} [minResourceRatio] - Minimum resource capacity ratio mapping (e.g. { wealth: 0.8 })
 * @property {Object<string, number>} [maxResourceRatio] - Maximum resource capacity ratio mapping
 * @property {string} [state] - Must have this active state ID (e.g., 'starving', 'shoddy_work')
 * @property {number} [minAlignment] - Minimum alignment spectrum value (-100 to 100). (E.g., 50 for Benevolent)
 * @property {number} [maxAlignment] - Maximum alignment spectrum value (-100 to 100). (E.g., -50 for Tyrant)
 * @property {boolean} [isConstructing] - True if town must be currently building something
 */

/**
 * @typedef {Object} ChoiceOutcome
 * @property {string} text - The button text (max 4-5 chars)
 * @property {string} preview - Short preview text describing the flavor of the choice
 * @property {Object<string, number>} [effects] - Resource or alignment modifications (e.g. { food: -10, alignment: 15 })
 * @property {string} outcome - Narrative text explicitly shown after this choice is resolved.
 * @property {Object} [startConstruction] - { building: 'farm', duration: 2 } Trigger a construction process.
 * @property {Object} [addState] - { id: 'fat_sheep', duration: 3 } Adds a global active state.
 * @property {string} [removeState] - Removes a global active state by ID.
 * @property {boolean} [skipAdvance] - If true, the turn does not advance after this event (instant UI resolution).
 * @property {string} [probHint] - Optional UI string to display probability hints (e.g., "高风险").
 * @property {Array} [outcomes] - Replaces `effects`/`outcome` for randomized resolution. Array of objects containing: {weight: number, modifierTag?: string, effects?: Object, outcome: string, addState?: Object, startConstruction?: Object}.
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} id - Unique identifier (e.g. 'tiger_hunt')
 * @property {string} title - Card header title (max 5 chars)
 * @property {string} character - The NPC/Role presenting the event (e.g. '猎户')
 * @property {string} description - The narrative description of the event on the card.
 * @property {EventCondition} [condition] - Criteria for this event to be injected into the valid pool.
 * @property {number} [weight] - Base draw probability (default is 10)
 * @property {string} [modifierTag] - Tag for dynamic probability modifiers from traits/states (e.g., 'event_prob_talent').
 * @property {ChoiceOutcome} [left] - Left choice configuration (A key)
 * @property {ChoiceOutcome} [neutral] - Optional Neutral choice configuration (W key)
 * @property {ChoiceOutcome} [right] - Right choice configuration (D key)
 * @property {boolean} [isNotification] - If true, this is a forced notification without time advance (only has `left` choice).
 */
```

## 4. Example Event Implementation
Here is a complete, well-formed example. Use this as a template.

```javascript
    {
        id: 'tiger_hunt',
        title: '猛虎下山',
        character: '猎户',
        description: '后山出现了一只吊睛白额大虫，已经伤了数名樵夫。猎户请求官府派兵剿灭。',
        condition: { minPopRatio: 0.5 }, // Only happens when town is half full
        weight: 15,
        left: {
            text: '严禁入山',
            preview: '封山避险',
            effects: { morale: -5, food: -5 },
            outcome: '你下令封锁后山。百姓免遭虎害，但也断了打猎砍柴的生路。'
        },
        right: {
            text: '派兵围剿',
            preview: '为民除害',
            probHint: '有士兵伤亡风险',
            outcomes: [
                {
                    weight: 6,
                    modifierTag: 'military_bonus',
                    effects: { military: -5, reputation: 10, morale: 15, alignment: 5 },
                    outcome: '士兵们奋勇射杀了猛虎！不仅除了一害，你还获得了一张极好的虎皮！'
                },
                {
                    weight: 4,
                    effects: { military: -15, morale: -5 },
                    outcome: '猛虎异常凶悍，咬死数名士兵后遁入深山，围剿失败...'
                }
            ]
        }
    }
```
## 5. Deployment Step
When you add the event to `events.js`, make sure you place it in the logically relevant category section based on the surrounding code comments (e.g., `// 军事事件`, `// 民生事件`, `// 内政事件`).
