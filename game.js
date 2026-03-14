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

    // 主公倾向光谱 [-100, 100]
    alignment: 0,

    // 劫掠恶名层数 (血海深仇层数)
    infamy: 0,

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

// 游戏结束原因 (史诗感长叙事)
const GAME_OVER_REASONS = {
    morale_low: '【民心丧尽】怨声载道的百姓终于揭竿而起。熊熊烈火吞噬了你引以为傲的府衙，在无数双充满仇恨与绝望的眼眸注视下，乱民的锄头终结了你的统治。\n\n“苍天已死，是你亲手埋葬了它。”',
    morale_high: '【纵容生乱】在这个虎狼环伺的乱世，过度的安逸酿成了致命的毒药。城镇武备废弛，警惕全无。当流浪的贼寇兵临城下时，人们甚至以为那是远方商队的尘土。繁华如黄粱一梦，转瞬化为血泊废墟。',
    food_low: '【饿殍遍野】最后的一粒麦麸也被咽下。连树皮、草根和观音土都被啃食殆尽的一月后，街道上不再有哭喊，只剩下令人毛骨悚然的死寂。在这个漫长的严冬，连最忠诚的亲卫也弃你而去，而你只能在逐渐模糊的视线里，看着这座城沦为食尸鬼的乐园。',
    food_high: '【囤积招祸】积粟成山，在此乱局中无异于三岁微童持金过市。小镇囤积如山的粮食终究引来了恶狼——领兵途径此地的当地军阀以“借粮”为名破城而入。刀光闪烁间，丰收的粮仓成了你的葬身之地，也成了乱世霸主的垫脚石。',
    military_low: '【兵败身亡】没有城墙的庇护，也没有坚兵利甲，当敌军铁骑如黑色潮水般漫入镇庄时，一切抵抗都显得苍白可笑。你的旗号被折断踩进泥泞，鲜血染透了你的雄心。周遭的诸侯甚至连你的名字都没费心去记，只是冷漠地从你的尸体上跨了过去。',
    military_high: '【穷兵黩武】疯狂扩张的军备刺痛了整个州郡。为了平息你的野心带来的一系列连锁反应，四家诸侯联军将城镇围得水泄不通。经过数月的惨烈厮杀，耗尽最后一滴血的你终于倒下。你的霸主梦碎了，但史书也许会用只言片语记录下你的癫狂。',
    wealth_low: '【府库破产】金尽粮绝的不仅是府库，更是人心。发不出体面饷银的官署门可罗雀，大小吏员纷纷卷铺盖逃亡。你孤独地坐在空荡荡的公堂之上，听着远方讨伐和声讨逐渐逼近的喧门声。在这个时代，没有钱财支撑的权杖，比朽木还要脆弱。',
    wealth_high: '【贪得无厌】无尽的盘剥为你堆砌出金玉满堂，也为你构筑了必死的深渊。你的横征暴敛不仅让民怨沸腾，连经常往来的豪商巨贾也难以忍受。买通亲卫刺杀你？这对于他们而言，只是账本上一笔划算的支出。',
    reputation_low: '【众叛亲离】世人早已将你遗弃，天下名士对你嗤之以鼻。在极端的孤立中，连你原本身边的幕僚都在某个凄清的雨夜悄然散去。你成了一个光杆主公，在某日出行的巷陌，被一不知名的游侠为民请命，一剑封喉。',
    reputation_high: '【功高震主】天下谁人不识君？你的仁德与威望在这四海动荡之际如日中天，而这也为你敲响了丧钟。不仅是邺城的曹公，乃至荆州的刘表、江东的孙吴，无人不忌惮你羽翼丰满。一杯假借圣旨赐下的毒酒，让你高洁的英名成为了绝唱。'
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

// 主公倾向光谱定义
const ALIGNMENT_STAGES = [
    { id: 'tyrant', name: '暴虐', min: -100, max: -50, modifiers: { rebellion_threshold_flat: -20, event_prob_ambitious_hero: 50, event_prob_good_hero: -100 } },
    { id: 'harsh', name: '严酷', min: -49, max: -20, modifiers: { morale_change_flat: -2, military_bonus: 5 } },
    { id: 'neutral', name: '中庸', min: -19, max: 19, modifiers: {} },
    { id: 'lenient', name: '宽厚', min: 20, max: 49, modifiers: { morale_change_flat: 2 } },
    { id: 'benevolent', name: '仁义', min: 50, max: 100, modifiers: { reputation_change_flat: 2, wealth_production_mult: -0.1 } }
];

function getAlignmentStage() {
    return ALIGNMENT_STAGES.find(s => GameState.alignment >= s.min && GameState.alignment <= s.max) || ALIGNMENT_STAGES[2];
}

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

        // 1. 倾向 Buff
        const stage = getAlignmentStage();
        if (stage && stage.modifiers) this._apply(mods, stage.modifiers);

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
    if (!changes) return;
    for (const [k, v] of Object.entries(changes)) {
        if (v === 0) continue;

        if (k === 'alignment') {
            GameState.alignment = Math.max(-100, Math.min(100, GameState.alignment + v));
        } else if (k === 'infamy') {
            GameState.infamy = Math.max(0, GameState.infamy + v);
            if (window.showToast && v > 0) {
                window.showToast(`🔥 恶名昭彰！结下血海深仇 (层数: ${GameState.infamy})`, 'negative');
            }
        } else if (k === 'population') {
            // 人口允许突破上限 (Overflow)
            GameState.population = Math.max(0, GameState.population + v);
        } else if (GameState.resources[k] !== undefined) {
            modifyResource(k, v);
        }
    }
}

function checkGameOver(isEndOfSeason = false) {
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
            // 安全线以上，自动解除低位危机 (加入15%阻尼缓冲，最少需恢复10点)
            const safeThreshold = Math.max(10, Math.floor(cap * 0.15));
            if (value >= safeThreshold) {
                const stateIndex = GameState.activeStates.findIndex(s => s.id === lowCrisisId);
                if (stateIndex > -1) {
                    GameState.activeStates.splice(stateIndex, 1);
                    if (window.showToast) window.showToast(`✨ 危机解除：${RESOURCE_NAMES[resource]}恢复至安全线，脱离险境。`, 'positive');
                }
            }
        }

        // 2. 高位危机检测 ( >= cap )
        const highCrisisId = `crisis_${resource}_high`;
        // 不对所有资源生效高位危机，仅针对财、粮等
        if (resource === 'wealth' || resource === 'food') {
            if (value >= cap) {
                // 仅在换季结算时才施加真实的高位危机倒计时，给玩家回合内消费的缓冲时间
                if (isEndOfSeason && !GameState.activeStates.find(s => s.id === highCrisisId)) {
                    addActiveState(highCrisisId, 3);
                    if (window.showToast) window.showToast(`⚠️ 囤积警告：${RESOURCE_NAMES[resource]}严重溢出！若不散财销粮，必遭大祸！`, 'negative');
                }
            } else if (value <= cap * 0.85) {
                // 消耗至 85% 以下，解除高危状态
                const stateIndex = GameState.activeStates.findIndex(s => s.id === highCrisisId);
                if (stateIndex > -1) {
                    GameState.activeStates.splice(stateIndex, 1);
                    if (window.showToast) window.showToast(`✨ 危机解除：${RESOURCE_NAMES[resource]}随势散去，不再惹眼。`, 'positive');
                }
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

    let starvationDeaths = 0;
    // --- 【四季农耕】硬核断粮判定 ---
    // 因粮草主要只能在秋季获取，断粮后每回合都会饿死人
    if (GameState.resources.food < foodConsumption) {
        // 计算缺粮的人口数
        const starvingPop = (foodConsumption - GameState.resources.food) * 25;
        // 饿死率为 15%
        starvationDeaths = Math.ceil(starvingPop * 0.15);
        GameState.population = Math.max(0, GameState.population - starvationDeaths);

        // 尽力扣除剩余粮草至 0
        modifyResource('food', -GameState.resources.food);
    } else {
        modifyResource('food', -foodConsumption);
    }

    // --- 【四季农耕】背景自动化 (Hybrid Iteration) ---
    let autoSowLog = '';
    if (GameState.season === 0) { // 春季播种底层消耗
        let cost = Math.max(1, Math.floor(GameState.population / 20)); // 每20人需要1粮的种子储备
        if (GameState.resources.food >= cost) {
            modifyResource('food', -cost);
            // 只有当玩家没有通过极品事件预先获得播种BUFF时才挂基础BUFF
            if (!GameState.activeStates.find(s => s.id.startsWith('sown_'))) {
                GameState.activeStates.push({ id: 'sown_normal', duration: 4 });
                autoSowLog = '【春耕】官府拨粮发种，百姓按部就班开始了春耕。';
            }
        } else {
            if (!GameState.activeStates.find(s => s.id.startsWith('sown_'))) {
                GameState.activeStates.push({ id: 'sown_poor', duration: 4 });
                autoSowLog = '【春耕】府库空虚，无粮发种。即使熬到秋长也将面临歉收！';
            }
        }
    }

    // 环境隐性状态检测 — 在当季收入与消耗结算后再检测
    checkEnvironmentStates();

    // [v12.6] 季报日志
    if (window.renderChatLog) {
        const parts = [];
        if (income.food > 0) parts.push(`${income.foodSeasonLabel || '农田'} +${income.food}`);
        if (income.wealth > 0) parts.push(`市场收税 ${income.wealth}`);
        parts.push(`人丁消耗 ${foodConsumption}粮`);
        if (overflowPenalty) parts.push(`(人口拥挤导致消耗翻倍)`);
        if (starvationDeaths > 0) parts.push(`<span style="color:red">饥荒饿死 ${starvationDeaths}人</span>`);

        const reportText = `【季报】${parts.join('，')}。`;
        window.renderChatLog({ type: 'system', text: reportText });

        if (autoSowLog) {
            window.renderChatLog({ type: 'system', text: autoSowLog });
        }

        // 建筑被动恢复日志 (CL2)
        const recoveryParts = [];
        if (income.militaryRecovery) recoveryParts.push(`兵器坊持续熔铸，武备缓慢恢复(+${income.militaryRecovery})`);
        if (income.moraleRecovery) recoveryParts.push(`高大坚固的城坊让民心缓缓安定(+${income.moraleRecovery})`);
        if (income.reputationRecovery) recoveryParts.push(`庄严的官府让主公声威远播(+${income.reputationRecovery})`);

        if (recoveryParts.length > 0) {
            window.renderChatLog({ type: 'system', text: '【恢复】' + recoveryParts.join('。') });
        }
    }

    // 季末进行一次强制的高危死亡判定探测 (给玩家回合内消费的缓冲期已结束)
    checkGameOver(true);

    return completed;
}

function applyBuildingIncome() {
    const b = GameState.buildings;
    const pop = GameState.population;
    const mods = EffectSystem.calcModifiers();
    let income = { food: 0, wealth: 0 };

    // --- 【四季农耕】农田产粮 ---
    // 年总量系数 4.1 按四季分配：春0.41 / 夏0.82 / 秋2.87 / 冬0（合计=4.1）
    if (b.farm > 0) {
        const baseUnit = b.farm * (pop / 20);
        const foodMult = mods.food_production_mult;
        const isBountiful = GameState.activeStates.find(s => s.id === 'sown_bountiful');
        const isPoor      = GameState.activeStates.find(s => s.id === 'sown_poor');

        if (GameState.season === 0) {
            // 春：小量 (0.41×)，宿麦/菜蔬，不受本年播种修正
            const springIncome = Math.max(1, Math.floor(baseUnit * 0.41 * foodMult));
            modifyResource('food', springIncome); income.food = springIncome;
            income.foodSeasonLabel = '春耕小收';
        } else if (GameState.season === 1) {
            // 夏：中量 (0.82×)，庄稼拔节，轻度受播种修正
            let mult = isBountiful ? 1.2 : isPoor ? 0.8 : 1.0;
            const summerIncome = Math.max(1, Math.floor(baseUnit * 0.82 * foodMult * mult));
            modifyResource('food', summerIncome); income.food = summerIncome;
            income.foodSeasonLabel = '夏粮收割';
        } else if (GameState.season === 2) {
            // 秋：主收获 (2.87×)，全量播种修正
            let mult = isBountiful ? 1.5 : isPoor ? 0.5 : 1.0;
            const autumnIncome = Math.floor(baseUnit * 2.87 * foodMult * mult);
            if (autumnIncome > 0) { modifyResource('food', autumnIncome); income.food = autumnIncome; }
            income.foodSeasonLabel = '秋收获粮';
            // 秋收完后，清除所有的耕种 Flag
            GameState.activeStates = GameState.activeStates.filter(s => !s.id.startsWith('sown_'));
        }
        // 冬季 (season === 3): 无产出
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

    // --- 满级建筑被动底线恢复 (CL2) ---
    // 军械库 (Armory) >= Lv3
    if (b.armory >= 3) {
        let cap = GameState.resourceCaps.military || 100;
        if (GameState.resources.military <= cap * 0.6) {
            let recovery = b.armory >= 5 ? 2 : 1;
            modifyResource('military', recovery);
            income.militaryRecovery = recovery;
        }
    }

    // 民房 (Housing) >= Lv3
    if (b.housing >= 3) {
        let cap = GameState.resourceCaps.morale || 100;
        if (GameState.resources.morale <= cap * 0.6) {
            let recovery = b.housing >= 5 ? 2 : 1;
            modifyResource('morale', recovery);
            income.moraleRecovery = recovery;
        }
    }

    // 官署 (Office) >= Lv3
    if (b.office >= 3) {
        let cap = GameState.resourceCaps.reputation || 100;
        if (GameState.resources.reputation <= cap * 0.6) {
            let recovery = b.office >= 5 ? 2 : 1;
            modifyResource('reputation', recovery);
            income.reputationRecovery = recovery;
        }
    }

    // 人口被动增长 (如瘟疫或安居乐业)
    if (mods.pop_growth_flat !== 0) {
        GameState.population = Math.max(0, GameState.population + mods.pop_growth_flat);
    }

    return income;
}

// 隐性环境状态检测 (取代直接 GameOver，给予施展空间)
function checkEnvironmentStates() {
    const r = GameState.resources;

    // 检测饥荒（触发 <10，解除 >=15，迟滞防止震荡）
    if (r.food < 10 && GameState.population > 20) {
        addActiveState('starving', 2);
    } else if (r.food >= 15) {
        const idx = GameState.activeStates.findIndex(s => s.id === 'starving');
        if (idx > -1) {
            GameState.activeStates.splice(idx, 1);
            if (window.showToast) window.showToast('✨ 饥荒解除：粮仓逐渐充实，百姓得以果腹。', 'positive');
        }
    }

    // 检测待宰肥羊
    if (r.wealth > 60 && r.military < 30) {
        addActiveState('fat_sheep', 2);
    } else if (r.military >= 35 || r.wealth <= 50) {
        const idx = GameState.activeStates.findIndex(s => s.id === 'fat_sheep');
        if (idx > -1) GameState.activeStates.splice(idx, 1);
    }

    // 检测安居乐业
    if (r.morale > 80 && r.food > 50) {
        addActiveState('peaceful', 2);
    } else if (r.morale <= 70 || r.food <= 40) {
        const idx = GameState.activeStates.findIndex(s => s.id === 'peaceful');
        if (idx > -1) GameState.activeStates.splice(idx, 1);
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

    // 节气条件 (主要用于强制事件之外的补充判断，虽然目前强制触发了)
    if (c.season !== undefined && c.season !== GameState.season) return false;

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
    if (c.minInfamy !== undefined) {
        if (GameState.infamy < c.minInfamy) return false;
    }
    if (c.maxInfamy !== undefined) {
        if (GameState.infamy > c.maxInfamy) return false;
    }
    if (c.minAlignment !== undefined) {
        if (GameState.alignment < c.minAlignment) return false;
    }
    if (c.maxAlignment !== undefined) {
        if (GameState.alignment > c.maxAlignment) return false;
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

    // 开始建造
    if (choiceData.startConstruction) {
        const sc = choiceData.startConstruction;
        startConstruction(sc.building, sc.duration);
    }

    // 处理状态
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
        alignment: GameState.alignment,
        infamy: GameState.infamy,
        traits: GameState.traits, // 保留以防其他地方报错，但废弃
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
    getAlignmentStage,
    STATES_DICT,
    RESOURCE_NAMES,
    RESOURCE_ICONS,
    BUILDING_NAMES,
    BUILDING_ICONS
};

console.log('game.js v0.98 加载完成');
