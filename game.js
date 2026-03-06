/**
 * 三国小镇 - 游戏核心逻辑
 * MVP v0.8 - 高级事件系统 & 时间控制
 */

// ============================================
// 游戏状态
// ============================================

const GameState = {
    // 资源 (上限由建筑决定)
    resources: {
        morale: 50,      // 民心 (固定0-100)
        food: 30,        // 粮草
        military: 30,    // 武力
        wealth: 30,      // 财富
        reputation: 50   // 声望 (固定0-100)
    },

    // 资源上限
    resourceCaps: {
        morale: 100,
        food: 50,
        military: 50,
        wealth: 50,
        reputation: 100
    },

    // 建筑系统
    buildings: {
        wall: 1,      // 城墙
        farm: 1,      // 农田
        market: 0,    // 市场 (需建造)
        hospital: 0,  // 医馆 (需建造)
        housing: 1,   // 民房
        office: 1,    // 官署 → 财富上限
        armory: 0,    // 军械库 → 武力上限 (需建造)
        granary: 1    // 粮仓 → 粮草上限
    },

    // 人口
    population: 50,

    // 建造中项目
    constructions: [],  // [{building: 'market', remaining: 2, quality: 1}]

    // 游戏状态
    isGameOver: false,
    gameOverReason: '',
    turn: 1,

    // 三国纪年
    year: 184,
    season: 0,

    // 事件队列
    eventQueue: [],
    currentEvent: null,

    // 临时与环境状态
    activeStates: [],  // [{id: 'plague', duration: 4}]

    // 主公特质 (永久标签)
    traits: [], // ['benevolent', 'tyrant']

    // 概率修正器 (用于影响随机结果)
    modifiers: {
        success_rate: 0,      // 通用成功率修正
        military_bonus: 0,    // 军事行动额外权重
        diplomatic_bonus: 0   // 外交/民生额外权重
    }
};

// 建筑名称对照
const BUILDING_NAMES = {
    wall: ['木栅', '土墙', '砖墙', '石墙', '城楼'],
    farm: ['荒地', '开垦', '水田', '精耕', '沃野'],
    market: ['无', '集市', '商铺', '商会', '通商', '繁华'],
    hospital: ['无', '医馆', '药房', '太医院'],
    housing: ['茅屋', '瓦房', '宅院', '坊市', '街区'],
    office: ['草庐', '官署', '府衙', '郡府', '州牧府'],
    armory: ['无', '兵器坊', '军械库', '武库', '大武库'],
    granary: ['竹筐', '粮仓', '大仓', '常平仓', '太仓']
};

// 建筑图标
const BUILDING_ICONS = {
    wall: '🏯',
    farm: '🌾',
    market: '🏪',
    hospital: '🏥',
    housing: '🏠',
    office: '🏛️',
    armory: '⚔️',
    granary: '🌾'
};

// 资源中文名称对照
const RESOURCE_NAMES = {
    morale: '民心',
    food: '粮草',
    military: '武力',
    wealth: '财富',
    reputation: '声望'
};

// 资源图标
const RESOURCE_ICONS = {
    morale: '👥',
    food: '🌾',
    military: '⚔️',
    wealth: '💰',
    reputation: '📜',
    population: '👥'
};

// 游戏结束原因
const GAME_OVER_REASONS = {
    morale_low: '【民心丧尽】百姓揭竿而起，乱民冲入府衙。你在愤怒的火海中，最后一次听到了那句“苍天已死”。',
    morale_high: '【纵容生乱】城镇由于过度安逸而武备废弛，流浪的贼寇如入无人之境，繁华转瞬化为废墟。',
    food_low: '【饿殍遍野】粮仓已尽，连树皮草根都被啃食干净。你无力地看着亲卫们也纷纷弃你而去，倒在饥荒的严冬。',
    food_high: '【囤积招祸】小镇堆积如山的粮食成了乱世中的肥肉。邻近军阀以“借粮”为名实施屠城，粮仓成了你的葬身地。',
    military_low: '【兵败身亡】城郭被铁骑踏平，你的旗号被折断在泥泞中。邻近诸侯的利刃终结了你在这乱世的最后一梦。',
    military_high: '【穷兵黩武】疯狂扩张的军备刺痛了天下诸侯。他们联合围攻，让你在不可一世的幻梦中被彻底粉碎。',
    wealth_low: '【府库破产】金尽粮绝，官员逃散。你孤独地坐在空荡荡的公堂之上，听着远方讨债者越来越近的喧门声。',
    wealth_high: '【贪得无厌】由于财富外露且横征暴敛，不仅部众离心，连路过的商会都受命刺杀了你这个贪婪的统治者。',
    reputation_low: '【众叛亲离】世人早已将你遗忘，连最忠诚的亲信也在无声无息中离去。你沦为弃子，孤独地消失在历史尘埃中。',
    reputation_high: '【功高震主】你的美名甚至让邺城的曹操感到不安。一杯毒酒，断送了你的英名，也断送了小镇的未来。'
};

// ============================================
// 全局修饰器与特质系统 (Effect System)
// ============================================

// 状态字典定义
const STATES_DICT = {
    'starving': {
        name: '饥荒',
        modifiers: { pop_growth_flat: -2, morale_change_flat: -5, event_prob_starving: 200 }
    },
    'fat_sheep': {
        name: '待宰肥羊',
        modifiers: { event_prob_robbery: 300 }
    },
    'peaceful': {
        name: '安居乐业',
        modifiers: { pop_growth_flat: 2, event_prob_talent: 50 }
    },
    'shoddy_work': {
        name: '建筑隐患',
        modifiers: { morale_change_flat: -2, event_prob_hazard: 100 }
    },
    // ---- 倒计时危机状态 ----
    'crisis_food_low': { name: '断粮崩溃', modifiers: { morale_change_flat: -10, pop_growth_flat: -5 } },
    'crisis_morale_low': { name: '民怨沸腾', modifiers: { pop_growth_flat: -5 } },
    'crisis_military_low': { name: '武备废弛', modifiers: { reputation_change_flat: -5 } },
    'crisis_wealth_low': { name: '府库枯竭', modifiers: { morale_change_flat: -5 } },
    'crisis_reputation_low': { name: '信誉扫地', modifiers: { pop_growth_flat: -5 } },
    'crisis_wealth_high': { name: '树大招风', modifiers: {} },
    'crisis_food_high': { name: '囤积招患', modifiers: {} }
};

// 特质字典定义
const TRAITS_DICT = {
    'benevolent': {
        name: '仁义',
        modifiers: { reputation_change_flat: 2, wealth_production_mult: -0.1 }
    },
    'tyrant': {
        name: '暴虐',
        modifiers: { rebellion_threshold_flat: -20, event_prob_ambitious_hero: 50, event_prob_good_hero: -100 }
    }
};

const EffectSystem = {
    getBaseModifiers() {
        return {
            food_production_mult: 1.0,
            food_consumption_mult: 1.0,
            wealth_production_mult: 1.0,
            military_power_mult: 1.0,
            pop_growth_flat: 0,
            morale_change_flat: 0,
            reputation_change_flat: 0,
            event_probs: {} // 动态事件权重调整
        };
    },

    calcModifiers() {
        const mods = this.getBaseModifiers();

        // 1. 特质 Buff
        GameState.traits.forEach(traitId => {
            const def = TRAITS_DICT[traitId];
            if (def && def.modifiers) this._apply(mods, def.modifiers);
        });

        // 2. 状态 Buff
        GameState.activeStates.forEach(state => {
            const def = STATES_DICT[state.id];
            if (def && def.modifiers) this._apply(mods, def.modifiers);
            // 也支持 state 直接带 effects (兼容旧逻辑)
            if (state.effects) this._apply(mods, state.effects);
        });

        return mods;
    },

    _apply(target, source) {
        for (const [k, v] of Object.entries(source)) {
            if (typeof target[k] === 'number') {
                target[k] += v;
            } else if (typeof target[k] === 'object') {
                for (const [subK, subV] of Object.entries(v)) {
                    target[k][subK] = (target[k][subK] || 0) + subV;
                }
            } else {
                target[k] = v;
            }
        }
    }
};

// ============================================
// 辅助函数
// ============================================

function updateResourceCaps() {
    const b = GameState.buildings;
    GameState.resourceCaps = {
        morale: 100,
        food: 40 + b.granary * 20,
        military: 40 + b.armory * 20,
        wealth: 40 + b.office * 20,
        reputation: 100
    };
}

function getPopulationCap() {
    // 基础 20，每级民房 +40 (Lv1=60, Lv2=100...)
    return 20 + (GameState.buildings.housing || 0) * 40;
}

function modifyResource(resource, delta) {
    if (GameState.isGameOver) return false;
    const oldValue = GameState.resources[resource];
    let newValue = oldValue + delta;
    const cap = GameState.resourceCaps[resource];
    newValue = Math.max(0, Math.min(cap, newValue));
    GameState.resources[resource] = newValue;
    checkGameOver();
    return !GameState.isGameOver;
}

function modifyResources(changes) {
    for (const [resource, delta] of Object.entries(changes)) {
        if (delta === 0) continue;

        if (resource === 'population') {
            // 人口允许突破上限 (Overflow)
            GameState.population = Math.max(0, GameState.population + delta);
        } else if (GameState.resources[resource] !== undefined) {
            modifyResource(resource, delta);
        }
    }
}

function checkGameOver() {
    for (const [resource, value] of Object.entries(GameState.resources)) {
        const cap = GameState.resourceCaps[resource] || 100;

        // 1. 低位危机检测 (<= 0)
        const lowCrisisId = `crisis_${resource}_low`;
        if (value <= 0) {
            if (!GameState.activeStates.find(s => s.id === lowCrisisId)) {
                addActiveState(lowCrisisId, 3); // 3季倒计时
                if (window.showToast) window.showToast(`🚨 极危警告：${RESOURCE_NAMES[resource]}已尽，小镇即将在 3 季内面临崩溃！`, 'negative');
            }
        } else {
            // 安全线以上，自动解除低位危机
            if (value >= 1) { // 如果是财富或武力等，恢复到1点即可解除 (也可设置更高安全线)
                const stateIndex = GameState.activeStates.findIndex(s => s.id === lowCrisisId);
                if (stateIndex > -1) {
                    GameState.activeStates.splice(stateIndex, 1);
                    if (window.showToast) window.showToast(`✨ 危机解除：${RESOURCE_NAMES[resource]}恢复，危机脱险。`, 'positive');
                }
            }
        }

        // 2. 高位危机检测 ( >= cap * 0.9)
        const highCrisisId = `crisis_${resource}_high`;
        // 不对所有资源生效高位危机，仅针对财、粮等
        if ((resource === 'wealth' || resource === 'food') && value >= cap * 0.9) {
            if (!GameState.activeStates.find(s => s.id === highCrisisId)) {
                addActiveState(highCrisisId, 3);
                if (window.showToast) window.showToast(`⚠️ 警告：${RESOURCE_NAMES[resource]}囤积过多，恐遭人觊觎！`, 'negative');
            }
        } else {
            const stateIndex = GameState.activeStates.findIndex(s => s.id === highCrisisId);
            if (stateIndex > -1) {
                GameState.activeStates.splice(stateIndex, 1);
                if (window.showToast) window.showToast(`✨ 危机解除：${RESOURCE_NAMES[resource]}消耗，不再惹眼。`, 'positive');
            }
        }
    }
}

// ============================================
// 建筑系统
// ============================================

function upgradeBuilding(building) {
    if (GameState.buildings[building] < 5) {
        GameState.buildings[building]++;
        updateResourceCaps();
    }
}

function startConstruction(building, duration) {
    GameState.constructions.push({
        building: building,
        remaining: duration,
        quality: 1
    });
}

function processConstructions() {
    const completed = [];
    GameState.constructions = GameState.constructions.filter(c => {
        c.remaining--;
        if (c.remaining <= 0) {
            completed.push(c);
            return false;
        }
        return true;
    });
    for (const c of completed) {
        upgradeBuilding(c.building);
    }
    return completed;
}

// ============================================
// 每季结算
// ============================================

function endOfSeason() {
    let crisisTerminalReason = null;

    // 状态持续时间减少
    GameState.activeStates = GameState.activeStates.filter(s => {
        s.duration--;
        if (s.duration === 0) {
            if (s.id.startsWith('crisis_')) {
                crisisTerminalReason = s.id;
            } else if (window.showToast && STATES_DICT && STATES_DICT[s.id]) {
                window.showToast(`【状态解除】${STATES_DICT[s.id].name} 已消散。`, 'neutral');
            }
        }
        return s.duration > 0;
    });

    if (crisisTerminalReason) {
        GameState.isGameOver = true;
        const reasonKey = crisisTerminalReason.replace('crisis_', ''); // e.g. 'food_low'
        GameState.gameOverReason = GAME_OVER_REASONS[reasonKey] || '【崩溃】小镇在危局中彻底覆灭。';
        return [];
    }

    // 环境隐性状态检测 (Environment-triggered States)
    checkEnvironmentStates();

    const completed = processConstructions();
    const income = applyBuildingIncome();

    // 人口消耗：每 25 人消耗 1 粮草
    let foodConsumption = Math.floor(GameState.population / 25);

    // 溢出惩罚：人口超过上限时，粮草消耗翻倍 (模拟卫生恶化与资源挤兑)
    const cap = getPopulationCap();
    let overflowPenalty = 0;
    if (GameState.population > cap) {
        foodConsumption *= 2;
        overflowPenalty = 1; // 标记存在溢出惩罚
    }

    modifyResource('food', -foodConsumption);

    // [v12.6] 季报日志
    if (window.renderChatLog) {
        const parts = [];
        if (income.food > 0) parts.push(`农田获粮 ${income.food}`);
        if (income.wealth > 0) parts.push(`市场收税 ${income.wealth}`);
        parts.push(`人丁消耗 ${foodConsumption}粮`);
        if (overflowPenalty) parts.push(`(人口拥挤导致消耗翻倍)`);

        const reportText = `【季报】${parts.join('，')}。`;
        window.renderChatLog({ type: 'system', text: reportText });
    }

    return completed;
}

function applyBuildingIncome() {
    const b = GameState.buildings;
    const pop = GameState.population;
    const mods = EffectSystem.calcModifiers();
    let income = { food: 0, wealth: 0 };

    // 农田产粮 (受人口规模正向影响)
    if (b.farm > 0) {
        let farmIncome = b.farm * (pop / 20);
        farmIncome *= mods.food_production_mult;
        farmIncome = Math.floor(farmIncome);
        modifyResource('food', farmIncome);
        income.food = farmIncome;
    }

    // 市场生财 (人口基数影响税收活跃度)
    if (b.market > 0) {
        let marketIncome = b.market * (pop / 40);
        marketIncome *= mods.wealth_production_mult;
        marketIncome = Math.floor(marketIncome);
        modifyResource('wealth', marketIncome);
        income.wealth = marketIncome;
    }

    // 应用其他被动改变 (如声望、民心的自然增减)
    if (mods.morale_change_flat !== 0) modifyResource('morale', mods.morale_change_flat);
    if (mods.reputation_change_flat !== 0) modifyResource('reputation', mods.reputation_change_flat);

    // 人口被动增长 (如瘟疫或安居乐业)
    if (mods.pop_growth_flat !== 0) {
        GameState.population = Math.max(0, GameState.population + mods.pop_growth_flat);
    }

    return income;
}

// 隐性环境状态检测 (取代直接 GameOver，给予施展空间)
function checkEnvironmentStates() {
    const r = GameState.resources;

    // 检测饥荒
    if (r.food < 10 && GameState.population > 20) {
        addActiveState('starving', 2);
    }

    // 检测待宰肥羊
    if (r.wealth > 60 && r.military < 30) {
        addActiveState('fat_sheep', 2);
    }

    // 检测安居乐业
    if (r.morale > 80 && r.food > 50) {
        addActiveState('peaceful', 2);
    }
}

function addActiveState(id, duration) {
    const existing = GameState.activeStates.find(s => s.id === id);
    if (existing) {
        existing.duration = Math.max(existing.duration, duration); // 刷新持续时间
    } else {
        GameState.activeStates.push({ id, duration });
        if (window.showToast && STATES_DICT && STATES_DICT[id]) {
            window.showToast(`⚠️ 触发状态：【${STATES_DICT[id].name}】持续 ${duration} 季`, 'negative');
        }
    }
}

// ============================================
// 事件系统
// ============================================

function initEventQueue() {
    GameState.eventQueue = [...EVENTS].sort(() => Math.random() - 0.5);
}

function drawNextEvent() {
    // 1. 强制灾难卡拦截
    const crisisState = GameState.activeStates.find(s => s.id.startsWith('crisis_'));
    if (crisisState && window.DISASTER_EVENTS) {
        const disasterEvent = window.DISASTER_EVENTS.find(e => e.triggerCrisis === crisisState.id);
        if (disasterEvent && (!GameState.currentEvent || GameState.currentEvent.id !== disasterEvent.id)) {
            GameState.currentEvent = disasterEvent;
            return disasterEvent;
        }
    }

    // 2. 常规事件池
    if (GameState.eventQueue.length === 0) initEventQueue();
    let event = null;
    while (GameState.eventQueue.length > 0) {
        const candidate = GameState.eventQueue.pop();
        if (checkEventCondition(candidate)) {
            event = candidate;
            break;
        }
    }
    if (!event && GameState.eventQueue.length === 0) {
        initEventQueue();
        event = GameState.eventQueue.pop();
    }
    GameState.currentEvent = event;
    return event;
}

function checkEventCondition(event) {
    if (!event.condition) return true;
    const c = event.condition;
    if (c.building && c.maxLevel !== undefined) {
        if (GameState.buildings[c.building] > c.maxLevel) return false;
    }
    if (c.building && c.minLevel !== undefined) {
        if (GameState.buildings[c.building] < c.minLevel) return false;
    }
    if (c.resource && c.minValue !== undefined) {
        if (GameState.resources[c.resource] < c.minValue) return false;
    }

    // 人口比例条件
    if (c.minPopRatio !== undefined) {
        const ratio = GameState.population / getPopulationCap();
        if (ratio < c.minPopRatio) return false;
    }
    if (c.maxPopRatio !== undefined) {
        const ratio = GameState.population / getPopulationCap();
        if (ratio > c.maxPopRatio) return false;
    }

    // 资源比例条件 (Systematic Expansion v2.2)
    if (c.minResourceRatio) {
        for (const [res, minRatio] of Object.entries(c.minResourceRatio)) {
            const current = GameState.resources[res];
            const cap = GameState.resourceCaps[res] || 100;
            if (current / cap < minRatio) return false;
        }
    }
    if (c.maxResourceRatio) {
        for (const [res, maxRatio] of Object.entries(c.maxResourceRatio)) {
            const current = GameState.resources[res];
            const cap = GameState.resourceCaps[res] || 100;
            if (current / cap > maxRatio) return false;
        }
    }

    if (c.state !== undefined) {
        if (!GameState.activeStates.some(s => s.id === c.state)) return false;
    }
    if (c.trait !== undefined) {
        if (!GameState.traits.includes(c.trait)) return false;
    }

    if (c.isConstructing !== undefined) {
        const isBuilding = GameState.constructions.length > 0;
        if (c.isConstructing !== isBuilding) return false;
    }
    return true;
}

function handleChoice(choice, autoAdvance = true) {
    if (!GameState.currentEvent || GameState.isGameOver) return;

    const event = GameState.currentEvent;
    let originalChoiceData;

    switch (choice) {
        case 'left': originalChoiceData = event.left; break;
        case 'neutral': originalChoiceData = event.neutral; break;
        case 'right': originalChoiceData = event.right; break;
    }

    if (!originalChoiceData) return;

    // 1. 随机化解析最终结果
    const choiceData = resolveOutcome(originalChoiceData);

    // 2. 应用效果
    if (choiceData.effects) {
        modifyResources(choiceData.effects);
    }

    // 3. 开始建造
    if (choiceData.startConstruction) {
        const sc = choiceData.startConstruction;
        startConstruction(sc.building, sc.duration);
    }

    // 处理特质与状态
    if (choiceData.addTrait) {
        if (!GameState.traits.includes(choiceData.addTrait)) {
            GameState.traits.push(choiceData.addTrait);
        }
    }
    if (choiceData.addState) {
        addActiveState(choiceData.addState.id, choiceData.addState.duration);
    }
    if (choiceData.removeState) {
        GameState.activeStates = GameState.activeStates.filter(s => s.id !== choiceData.removeState);
        if (window.showToast) window.showToast('【状态解除】隐患已被排除。', 'positive');
    }

    // 4. 直接升级建筑
    if (choiceData.buildingChange) {
        for (const [building, delta] of Object.entries(choiceData.buildingChange)) {
            GameState.buildings[building] += delta;
        }
        updateResourceCaps();
    }

    // 5. 判断是否推进回合 (时间流逝)
    if (choiceData.skipAdvance || originalChoiceData.skipAdvance) {
        if (autoAdvance) drawNextEvent();
        return choiceData;
    }

    if (autoAdvance) {
        advanceTurn();
    }

    return choiceData;
}

function advanceTurn() {
    // 正常回合结算
    GameState.turn++;
    GameState.season = (GameState.season + 1) % 4;
    if (GameState.season === 0) GameState.year++;

    const completedConstructions = endOfSeason();
    if (GameState.isGameOver) return;

    if (completedConstructions && completedConstructions.length > 0) {
        for (const c of completedConstructions) {
            GameState.eventQueue.push(createConstructionCompleteEvent(c));
        }
    }

    drawNextEvent();
}

function createConstructionCompleteEvent(construction) {
    const buildingKey = construction.building;
    const level = GameState.buildings[buildingKey];
    const info = window.BUILDING_INFO ? window.BUILDING_INFO[buildingKey] : null;
    const baseName = info ? info.name : buildingKey;
    const levelNameList = BUILDING_NAMES[buildingKey] || [];
    const actualNames = levelNameList.filter(n => n !== '无');
    const title = actualNames[Math.min(level - 1, actualNames.length - 1)] || '';
    const fullName = title ? `${baseName}·${title}` : baseName;
    const flavor = info ? info.flavor : '由衷的喜悦在百姓中蔓延。';
    const effectDesc = info ? info.effect(level) : '城镇实力得到了提升。';

    // 随机巡视奖励生成 (Randomized Inspection v2.1)
    const generateInspectionReward = (bKey) => {
        const rewards = [];
        const roll = Math.random();
        const isCrit = roll > 0.85; // 15% 大成功概率

        // 基础消耗
        const cost = { time: '耗时一季' };

        // 建筑特定奖励池
        switch (bKey) {
            case 'farm':
                if (isCrit) {
                    rewards.push({ type: 'food', val: 15, text: '发现高产良种' });
                    rewards.push({ type: 'morale', val: 5, text: '老农感激涕零' });
                } else {
                    rewards.push({ type: 'food', val: 8, text: '额外征收粮草' });
                }
                break;
            case 'market':
                if (isCrit) {
                    rewards.push({ type: 'wealth', val: 15, text: '西域商队献礼' });
                    rewards.push({ type: 'reputation', val: 5, text: '商路以此为荣' });
                } else {
                    rewards.push({ type: 'wealth', val: 8, text: '征收交易税' });
                }
                break;
            case 'wall':
            case 'armory':
                if (isCrit) {
                    rewards.push({ type: 'military', val: 10, text: '发现前朝武库' });
                    rewards.push({ type: 'morale', val: 5, text: '军心大振' });
                } else {
                    rewards.push({ type: 'military', val: 5, text: '整顿军备' });
                    rewards.push({ type: 'reputation', val: 2, text: '展示军威' });
                }
                break;
            case 'housing':
                if (isCrit) {
                    rewards.push({ type: 'population', val: 10, text: '流名闻风来投' });
                    rewards.push({ type: 'morale', val: 8, text: '万家生佛' });
                } else {
                    rewards.push({ type: 'morale', val: 5, text: '抚慰邻里' });
                }
                break;
            default:
                rewards.push({ type: 'reputation', val: 5, text: '巡视全境' });
        }

        // 构建 effects 对象
        const effects = {};
        let rewardText = isCrit ? '【大成功】' : '';
        rewards.forEach(r => {
            effects[r.type] = (effects[r.type] || 0) + r.val;
            rewardText += `${r.text} (+${r.val}${RESOURCE_ICONS[r.type] || ''}) `;
        });

        return { effects, outcome: `你亲自巡视了${fullName}。${rewardText}` };
    };

    const inspection = generateInspectionReward(buildingKey);

    return {
        id: `complete_${buildingKey}_${GameState.turn}`,
        title: '工程完工',
        character: '工匠',
        description: `经过数月劳作，${fullName} 终于建造完成！\n\n「${flavor}」\n■ 设施效用：${effectDesc}`,
        left: {
            text: '很好',
            preview: '确认',
            effects: { reputation: 1 },
            skipAdvance: true,
            outcome: '你点头表示许可。由于你未亲自巡视，时间并未因此流逝。'
        },
        neutral: null,
        right: {
            text: '巡视',
            preview: '耗时得奖', // 动态预览需在 UI 层完善，这里简化
            effects: inspection.effects,
            outcome: inspection.outcome
        },
        isNotification: true
    };
}

/**
 * 解析结果（处理随机性与修正）
 */
function resolveOutcome(choiceData) {
    if (!choiceData.outcomes) return choiceData;
    let totalWeight = 0;
    const items = choiceData.outcomes.map(out => {
        let weight = out.weight || 10;
        if (out.modifierTag && GameState.modifiers[out.modifierTag]) {
            weight += GameState.modifiers[out.modifierTag];
        }
        totalWeight += weight;
        return { ...out, finalWeight: weight };
    });
    let rand = Math.random() * totalWeight;
    for (const item of items) {
        rand -= item.finalWeight;
        if (rand <= 0) return item;
    }
    return items[0];
}

function startNewGame() {
    console.log('开始新游戏 v1.1');

    // 重置建筑
    GameState.buildings = {
        wall: 1, farm: 1, market: 0, hospital: 0,
        housing: 1, office: 1, armory: 0, granary: 1
    };

    // 重置状态
    GameState.isGameOver = false;
    GameState.turn = 1;
    GameState.year = 184;
    GameState.season = 0;
    GameState.constructions = [];
    GameState.activeStatuses = [];
    GameState.modifiers = {
        success_rate: 0,
        military_bonus: 0,
        diplomatic_bonus: 0
    };

    // 计算并设置初始资源（设为上限的一半）
    updateResourceCaps();
    GameState.resources = {
        morale: Math.floor(GameState.resourceCaps.morale / 2),
        food: Math.floor(GameState.resourceCaps.food / 2),
        military: Math.floor(GameState.resourceCaps.military / 2),
        wealth: Math.floor(GameState.resourceCaps.wealth / 2),
        reputation: Math.floor(GameState.resourceCaps.reputation / 2)
    };

    // 重置人口（设为当前容量的一半）
    GameState.population = Math.floor(getPopulationCap() / 2);

    // 初始化事件队列
    initEventQueue();

    // 抽第一张卡
    drawNextEvent();
}

// ============================================
// UI Helper
// ============================================

function getGameStateForUI() {
    return {
        resources: GameState.resources,
        resourceCaps: GameState.resourceCaps,
        buildings: GameState.buildings,
        population: GameState.population,
        populationCap: getPopulationCap(),
        constructions: GameState.constructions,
        activeStates: GameState.activeStates,
        traits: GameState.traits,
        year: GameState.year,
        season: GameState.season,
        turn: GameState.turn,
        isGameOver: GameState.isGameOver,
        gameOverReason: GameState.gameOverReason,
        currentEvent: GameState.currentEvent
    };
}

function toChineseYear(num) {
    if (num === 1) return '元';
    const digit = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    if (num <= 9) return digit[num];
    if (num <= 99) {
        const d1 = Math.floor(num / 10);
        const d2 = num % 10;
        let str = '';
        if (d1 > 1) str += digit[d1];
        str += '十';
        if (d2 > 0) str += digit[d2];
        return str;
    }
    return num.toString();
}

function getYearName() {
    const diff = GameState.year - 184;
    if (diff < 6) return `中平${toChineseYear(diff + 1)}年`;
    if (diff < 10) return `初平${toChineseYear(diff - 6 + 1)}年`;
    if (diff < 12) return `兴平${toChineseYear(diff - 10 + 1)}年`;
    if (diff < 37) return `建安${toChineseYear(diff - 12 + 1)}年`;

    // 如果超过公元220年 (建安二十五年之后)
    const beyondYear = GameState.year - 219;
    return `黄初${toChineseYear(beyondYear)}年`;
}

function getSeasonName() {
    const idx = (GameState.turn - 1) % 4;
    return ['春', '夏', '秋', '冬'][idx];
}

window.Game = {
    start: startNewGame,
    choose: handleChoice,
    advanceTurn,
    resolveOutcome,
    getState: getGameStateForUI,
    getYearName,
    getSeasonName,
    getPopulationCap,
    addActiveState,
    addTrait: (id) => { if (!GameState.traits.includes(id)) GameState.traits.push(id); },
    hasTrait: (id) => GameState.traits.includes(id),
    STATES_DICT,
    TRAITS_DICT,
    RESOURCE_NAMES,
    RESOURCE_ICONS,
    BUILDING_NAMES,
    BUILDING_ICONS
};

console.log('game.js v0.98 加载完成');
