/**
 * 三国小镇 UI 管理器 (v0.95 - 1920x1080 适配)
 * 负责：
 * 1. 游戏界面渲染 (资源、时间、事件卡片)
 * 2. 交互事件处理
 * 3. 动画与反馈
 * 4. 建筑列表与聊天日志渲染
 */

// 简易 Web Audio API 音效系统
const SoundSys = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playTone(freq, type, duration, vol = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    click() { this.playTone(600, 'sine', 0.1, 0.1); },
    slide() { this.playTone(400, 'sine', 0.1, 0.1); },
    good() {
        this.playTone(523.25, 'sine', 0.1, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100);
    },
    bad() {
        this.playTone(300, 'triangle', 0.2, 0.15);
        setTimeout(() => this.playTone(250, 'triangle', 0.3, 0.15), 150);
    }
};

// UI 全局对象，管理 DOM 元素缓存
const DOM = {
    // 容器
    introScreen: document.getElementById('intro-screen'),
    gameScreen: document.getElementById('game-screen'),
    gameOverScreen: document.getElementById('game-over'),

    // 信息面板
    eraYear: document.getElementById('era-year'),
    eraSeason: document.getElementById('era-season'),
    resources: {
        morale: document.querySelector('.resource-pill[data-resource="morale"]'),
        food: document.querySelector('.resource-pill[data-resource="food"]'),
        military: document.querySelector('.resource-pill[data-resource="military"]'),
        wealth: document.querySelector('.resource-pill[data-resource="wealth"]'),
        reputation: document.querySelector('.resource-pill[data-resource="reputation"]')
    },
    townSummary: {
        population: document.getElementById('population-display'),
        construction: null // 已经在 hub 区域显示
    },
    buildingList: document.getElementById('building-list'),

    // 个人与家族特性
    profileBtn: document.getElementById('profile-btn'),
    profileModal: document.getElementById('profile-modal'),
    closeProfileBtn: document.getElementById('close-profile-btn'),
    traitsList: document.getElementById('traits-list'),
    toastContainer: document.getElementById('toast-container'),

    // 中控台 (Hub) -> 改为弹幕层
    danmakuContainer: document.getElementById('danmaku-container'),
    constructionStatus: document.getElementById('construction-status'),

    // 事件区域
    cardTitle: document.querySelector('.card-title'),
    cardDesc: document.querySelector('.card-description'),
    cardCharacter: document.querySelector('.card-character'),
    card: document.getElementById('event-card'),

    // 按钮
    buttons: {
        left: document.getElementById('choice-left'),
        neutral: document.getElementById('choice-neutral'),
        right: document.getElementById('choice-right')
    },

    // 反馈
    feedbackOverlay: document.getElementById('feedback-overlay'),
    feedbackText: document.getElementById('feedback-text'),
    feedbackChanges: document.getElementById('feedback-changes'),

    // 游戏结束
    gameOverReason: document.getElementById('game-over-reason'),
    gameOverTurns: document.getElementById('game-over-turns'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),

    // Tooltip 弹出层
    tooltipOverlay: document.getElementById('tooltip-overlay'),
    tooltipTitle: document.getElementById('tooltip-title'),
    tooltipDesc: document.getElementById('tooltip-desc'),
};

// 资源提示文本
const RESOURCE_TOOLTIPS = {
    morale: { title: '👥 民心', desc: '城镇居民对你的拥戴程度。<br><br><b>影响：</b><br>民心过低会导致流民叛乱，甚至游戏结束。<br>保持高民心能吸引更多流民加入。' },
    food: { title: '🌾 粮草', desc: '城镇生存的基础物资。<br><br><b>影响：</b><br>每年秋季会根据农田数量产出。<br>粮草耗尽会导致严重饥荒和民心暴跌。' },
    military: { title: '⚔️ 武力', desc: '城镇的自保能力。<br><br><b>影响：</b><br>武力值越高，抵抗黄巾军等盗匪袭击的成功率越高，且损失越小。' },
    wealth: { title: '💰 财富', desc: '城镇的经济基础。<br><br><b>影响：</b><br>可通过市场产出或事件获取。<br>主要用于建造和升级建筑，处理贪官污吏等事件。' },
    reputation: { title: '📜 声望', desc: '你在乱世中的名声。<br><br><b>影响：</b><br>高声望能吸引名将和人才来投。<br>参与天下大事（如讨伐董卓）会大幅改变声望。' }
};

const BUILDING_DESCRIPTIONS = {
    wall: ['残破木栅', '勉强抵挡', '城防初具', '坚固可靠', '巍峨城楼', '固若金汤'],
    farm: ['荒芜薄田', '初见绿意', '稻浪翻涌', '沃土千亩', '五谷丰登', '天府之国'],
    market: ['无', '零星小贩', '集市初成', '商贾云集', '百业兴旺', '万商之都'],
    hospital: ['无', '粗通医术', '妙手回春', '华佗再世'],
    armory: ['无', '简陋兵器', '甲胄齐备', '兵甲齐全', '军威赫赫', '武库充盈'],
    granary: ['竹筐度日', '几筐余粮', '略有储备', '仓廪充实', '积谷防荒', '太仓满溢'],
    office: ['草庐议事', '案牍初立', '官衙有序', '政令通达', '治理有方', '治世能臣'],
    housing: ['茅屋数间', '瓦房错落', '坊市初成', '街巷繁荣', '屋舍连绵', '万家灯火']
};

// 建筑状态跟踪（用于检测升级变化）
let _prevBuildings = null;
let _upgradedKeys = new Set(); // 本轮刚升级的建筑 key

window._userInteracted = false;
document.addEventListener('touchstart', () => { window._userInteracted = true; SoundSys.init(); }, { once: true });
document.addEventListener('click', () => { window._userInteracted = true; SoundSys.init(); }, { once: true });

// 安全调用 vibrate
function safeVibrate(ms) {
    if (!window._userInteracted) return;
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { }
}

// Debug Mode
let debugMode = false;
let debugClickCount = 0;
let debugClickTimer = null;

// 全局暴露渲染函数给 Town.js 调用
// 全局暴露渲染函数给 Town.js 调用
// 将原有的聊天气泡渲染改为：弹幕系统 (Danmaku)
window.renderChatLog = function (log) {
    if (!DOM.danmakuContainer) return;

    const el = document.createElement('div');

    // 是否为系统/NPC提示
    const isSystem = log.type === 'system' || log.type === 'action';
    el.className = `danmaku-item ${isSystem ? 'system' : ''}`;

    let textContent = log.text;
    if (!isSystem && log.sender && log.sender.name !== '你') {
        textContent = `${log.sender.name}: ${textContent}`;
    }

    el.innerText = textContent;

    // 随机初始位置和轨迹
    // 限制在屏幕顶部 5% - 25% 的区域，避免遮挡中部的卡片描述文本和底部的选项按钮
    const topPercent = 5 + Math.random() * 20;
    el.style.top = `${topPercent}%`;

    // 随机持续时间 —— 文字越长速度越慢
    const baseSpeed = 5; // 基础秒数
    const extraPerChar = 0.15; // 每多一个字加 0.15秒
    const duration = baseSpeed + Math.max(0, textContent.length - 10) * extraPerChar;
    el.style.animation = `danmakuScroll ${duration}s linear forwards`;

    DOM.danmakuContainer.appendChild(el);

    // 动画结束后移除 DOM
    setTimeout(() => {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }, duration * 1000);
};

// UI 浮窗 (Toast) - 用于状态变化
window.showToast = function (message, type = '') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    // 播放提示音 & 屏幕震动逻辑
    if (type === 'positive') SoundSys.good();
    else if (type === 'neutral') SoundSys.slide();
    else {
        SoundSys.bad();
        if (type === 'negative') {
            document.body.classList.add('screen-shake');
            setTimeout(() => document.body.classList.remove('screen-shake'), 500);
        }
    }

    DOM.toastContainer.appendChild(toast);

    // 3秒后移除
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300); // 移除动画时长
    }, 3000);
};

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    DOM.startBtn.addEventListener('click', startGame);
    DOM.restartBtn.addEventListener('click', () => location.reload()); // 简单重载

    // 键盘支持
    document.addEventListener('keydown', handleKeyPress);

    // 移动端菜单与弹窗交互
    const buildBtn = document.getElementById('mobile-build-btn');
    const closeBtn = document.getElementById('close-build-btn');
    const sidebar = document.getElementById('right-sidebar');

    if (buildBtn && sidebar) {
        buildBtn.addEventListener('click', () => {
            sidebar.classList.add('mobile-visible');
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('mobile-visible');
        });
    }

    // 个人面板交互
    if (DOM.profileBtn && DOM.profileModal) {
        DOM.profileBtn.addEventListener('click', () => {
            DOM.profileModal.classList.remove('hidden');
            SoundSys.slide();
        });
    }
    if (DOM.closeProfileBtn && DOM.profileModal) {
        DOM.closeProfileBtn.addEventListener('click', () => {
            DOM.profileModal.classList.add('hidden');
            SoundSys.slide();
        });
    }

    // 绑定 Debug 调试开关 (连点年份 3 次)
    const eraYearEl = document.getElementById('era-year');
    if (eraYearEl) {
        eraYearEl.addEventListener('click', () => {
            debugClickCount++;
            if (debugClickTimer) clearTimeout(debugClickTimer);
            debugClickTimer = setTimeout(() => { debugClickCount = 0; }, 600);

            if (debugClickCount >= 3) {
                debugMode = !debugMode;
                debugClickCount = 0;
                Town.addLog('system', null, debugMode ? '⚙️ Debug 模式已开启' : '⚙️ Debug 模式已关闭');
                try { updateUI(); } catch (e) { }
            }
        });
    }

    // 为所有可点击按钮添加触屏原生反馈 (解决 iOS :active 延迟或不触发的问题)
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('touchstart', () => {
            btn.classList.add('pressed');
            safeVibrate(15);
        }, { passive: true });

        btn.addEventListener('touchend', () => btn.classList.remove('pressed'), { passive: true });
        btn.addEventListener('touchcancel', () => btn.classList.remove('pressed'), { passive: true });
    });

    // Tooltip 交互
    if (DOM.tooltipOverlay) {
        DOM.tooltipOverlay.addEventListener('click', () => {
            DOM.tooltipOverlay.classList.remove('show');
        });

        Object.entries(DOM.resources).forEach(([key, el]) => {
            if (el) {
                el.addEventListener('click', () => {
                    const info = RESOURCE_TOOLTIPS[key];
                    if (info && DOM.tooltipOverlay) {
                        DOM.tooltipTitle.innerHTML = info.title;
                        DOM.tooltipDesc.innerHTML = info.desc;
                        DOM.tooltipOverlay.classList.add('show');
                        safeVibrate(10);
                    }
                });
            }
        });
    }

    console.log('UI 初始化完成 (Portrait Mobile v4.4)');
});

function startGame() {
    DOM.introScreen.classList.add('hidden');
    DOM.gameScreen.classList.remove('hidden');

    // 重置状态
    DOM.feedbackOverlay.classList.add('hidden');
    DOM.card.className = 'card';
    setButtonsEnabled(true);

    Game.start();

    // 初始化 Town Hub
    if (window.Town) Town.init();

    updateUI();
}

// ============================================
// 核心更新逻辑
// ============================================

function updateUI() {
    const state = Game.getState();

    // 6. 事件卡片 (优先渲染，防止后续报错导致无卡片)
    if (state.currentEvent) {
        renderEventCard(state.currentEvent);
    }

    // 1. 三国纪年
    DOM.eraYear.textContent = Game.getYearName();
    DOM.eraSeason.textContent = Game.getSeasonName();

    // 更新特质列表 (Profile View)
    if (DOM.traitsList) {
        DOM.traitsList.innerHTML = '';
        if (!state.traits || state.traits.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-list-hint';
            li.innerText = '暂无明显特质';
            DOM.traitsList.appendChild(li);
        } else {
            state.traits.forEach(traitId => {
                const traitDef = Game.TRAITS_DICT ? Game.TRAITS_DICT[traitId] : null;
                if (traitDef) {
                    const li = document.createElement('li');
                    li.className = `trait-tag ${traitId}`;
                    li.innerText = traitDef.name; // 仅渲染名字标签
                    DOM.traitsList.appendChild(li);
                }
            });
        }
    }

    // 2. 资源更新
    updateResources(state);

    // 3. 城镇状态
    if (DOM.townSummary.population) {
        DOM.townSummary.population.textContent = `${state.population}/${Game.getPopulationCap()}`;
    }

    // 4. 建筑列表 (加入安全检查)
    try {
        renderBuildingList(state);
    } catch (e) {
        console.error("Building List Render Error:", e);
    }

    // 5. 建造状态 (顶部动态)
    renderConstructionStatus(state);

    // 7. 游戏结束检查
    if (state.isGameOver) {
        showGameOver(state);
    }

    // 8. 建筑升级检测 (对比前一轮状态)
    checkBuildingUpgrades(state);

    // 9. 更新 Debug 界面
    updateDebugOverlay(state);
}

function updateDebugOverlay(state) {
    const el = document.getElementById('debug-overlay');
    if (!el) return;
    if (!debugMode) {
        el.style.display = 'none';
        return;
    }
    el.style.display = 'block';

    let text = `[DEBUG MODE]\nTurn: ${state.turn}\nYear: ${state.year} Season: ${state.season}\n\n`;
    text += `[RESOURCES]\n`;
    text += `Morale: ${state.resources.morale}/${state.resourceCaps.morale}\n`;
    text += `Food: ${state.resources.food}/${state.resourceCaps.food}\n`;
    text += `Military: ${state.resources.military}/${state.resourceCaps.military}\n`;
    text += `Wealth: ${state.resources.wealth}/${state.resourceCaps.wealth}\n`;
    text += `Rep: ${state.resources.reputation}/${state.resourceCaps.reputation}\n`;
    text += `Pop: ${state.population} / Cap: ${Game !== undefined ? Game.getPopulationCap() : '?'}\n\n`;

    text += `[BUILDINGS]\n`;
    for (let b in state.buildings) {
        text += `${b}: Lv${state.buildings[b]}\n`;
    }

    text += `\n[MODIFIERS]\n`;
    text += JSON.stringify(state.modifiers, null, 2);

    el.innerText = text;
}

function updateResources(state) {
    const caps = state.resourceCaps;
    for (const [key, element] of Object.entries(DOM.resources)) {
        if (!element) continue;

        const value = state.resources[key];
        const cap = caps[key];
        const percentage = Math.max(0, Math.min(100, (value / cap) * 100));

        // 进度条控制
        const fillEl = element.querySelector('.res-bar-fill');
        if (fillEl) {
            fillEl.style.width = `${percentage}%`;

            // 颜色分级 (根据 design doc)
            let color = 'var(--accent-gold)'; // 默认平稳/兴旺 41-80%
            if (percentage <= 10) color = '#ec4899'; // 崩溃深红(粉更显眼)
            else if (percentage <= 25) color = 'var(--accent-red)'; // 危急
            else if (percentage <= 40) color = '#f97316'; // 低迷橙
            else if (percentage <= 60) color = '#fbbf24'; // 平稳金
            else if (percentage <= 80) color = '#34d399'; // 兴旺绿
            else if (percentage <= 90) color = '#60a5fa'; // 鼎盛蓝
            else color = '#c084fc'; // 过盛紫

            fillEl.style.backgroundColor = color;

            if (percentage >= 91 || percentage <= 10) {
                fillEl.style.animation = 'resWarningPulse 1s infinite alternate';
            } else {
                fillEl.style.animation = 'none';
            }
        }

        // 致命危机特效检测 (软Game Over警告闪烁)
        const hasCrisis = state.activeStates.some(s => s.id === `crisis_${key}_low` || s.id === `crisis_${key}_high`);
        if (hasCrisis) {
            element.classList.add('crisis-warning');
        } else {
            element.classList.remove('crisis-warning');
        }
    }
}

// ============================================
// 建筑列表渲染
// ============================================

function renderBuildingList(state) {
    const list = DOM.buildingList;
    if (!list) return;

    // 安全检查：防止 BUILDING_INFO 未加载
    const infoMap = window.BUILDING_INFO || {};

    list.innerHTML = '';

    for (const [key, lv] of Object.entries(state.buildings)) {
        const info = infoMap[key];
        if (!info) {
            console.warn(`Missing info for building: ${key}`);
            continue;
        }

        // 只有等级>0 或 正在建造中 才显示？
        // 或者一直显示？
        // 显示所有
        const isConstructing = state.constructions.some(c => c.building === key);

        const div = document.createElement('div');
        let classes = 'building-item';
        if (lv <= 0) classes += ' locked';
        if (isConstructing) classes += ' upgrading';
        if (_upgradedKeys.has(key)) classes += ' just-upgraded';
        div.className = classes;

        let statusText = '';
        if (isConstructing) statusText = '<span class="b-status">🚧 建造中...</span>';
        else if (lv === 0) statusText = '<span class="b-status" style="opacity:0.5">未建造</span>';
        else if (_upgradedKeys.has(key)) statusText = '<span class="b-status" style="color: var(--accent-gold)">⬆️ 已升级!</span>';

        // 效果文本 (替换为模糊描述)
        let effectText = '';
        if (BUILDING_DESCRIPTIONS[key]) {
            effectText = BUILDING_DESCRIPTIONS[key][lv] || '未知境界';
        } else {
            effectText = info.effect(lv); // fallback
        }
        if (lv === 0) effectText = info.desc; // 未建造显示基础描述

        div.innerHTML = `
            <div class="b-icon">${info.icon}</div>
            <div class="b-info">
                <div class="b-name">
                    ${info.name}
                    ${statusText}
                </div>
                <div class="b-effect">${effectText}</div>
            </div>
        `;

        list.appendChild(div);
    }
}

// 建筑升级检测
function checkBuildingUpgrades(state) {
    const buildBtn = document.getElementById('mobile-build-btn');
    if (!_prevBuildings) {
        // 第一次记录，不触发通知
        _prevBuildings = { ...state.buildings };
        return;
    }

    const newUpgrades = [];
    for (const [key, lv] of Object.entries(state.buildings)) {
        if (_prevBuildings[key] !== undefined && lv > _prevBuildings[key]) {
            newUpgrades.push(key);
            _upgradedKeys.add(key);
        }
    }

    if (newUpgrades.length > 0 && buildBtn) {
        // 触发图标通知脉冲
        buildBtn.classList.add('notify');
        safeVibrate(50);

        // 点击图标后清除通知
        buildBtn.addEventListener('click', function clearNotify() {
            buildBtn.classList.remove('notify');
            // 5秒后清除升级高亮
            setTimeout(() => { _upgradedKeys.clear(); }, 5000);
            buildBtn.removeEventListener('click', clearNotify);
        });
    }

    _prevBuildings = { ...state.buildings };
}

function renderConstructionStatus(state) {
    const container = DOM.constructionStatus;
    if (!container) return;

    container.innerHTML = '';

    if (state.constructions.length === 0) {
        // container.textContent = '暂无工程';
        return;
    }

    state.constructions.forEach(c => {
        const info = BUILDING_INFO[c.building];
        const span = document.createElement('div');
        span.className = 'construction-tag';
        span.innerHTML = `🚧 ${info.name}: 剩余 ${c.remaining} 季`;
        container.appendChild(span);
    });
}


// ============================================
// 事件处理
// ============================================

function renderEventCard(event) {
    DOM.cardTitle.textContent = event.title;
    DOM.cardDesc.textContent = event.description;
    DOM.cardCharacter.textContent = getCharacterIcon(event.character);

    // 渲染按钮
    setupButton('left', event.left);
    setupButton('neutral', event.neutral);
    setupButton('right', event.right);
}

function getCharacterIcon(charName) {
    const map = {
        '系统': '⚙️', '工匠': '🔨', '谋士': '📜', '武将': '⚔️',
        '商贾': '💰', '农夫': '🌾', '流民': '🏚️', '斥候': '🐎'
    };
    return map[charName] || '👤';
}

function getEffectIcons(option) {
    const icons = {
        morale: '👥',
        food: '🌾',
        military: '⚔️',
        wealth: '💰',
        reputation: '📜'
    };
    const affected = new Set();

    if (option.effects) Object.keys(option.effects).forEach(k => affected.add(k));
    if (option.outcomes) {
        option.outcomes.forEach(out => {
            if (out.effects) Object.keys(out.effects).forEach(k => affected.add(k));
        });
    }

    let res = Array.from(affected).map(k => icons[k]).join('');
    return res ? `影响: ${res}` : '影响: 无';
}

function setupButton(side, option) {
    const btn = DOM.buttons[side];
    if (!option) {
        btn.style.opacity = '0.3';
        btn.disabled = true;
        btn.querySelector('.choice-text').textContent = '-';
        btn.querySelector('.choice-preview').textContent = '';
        return;
    }

    btn.style.opacity = '1';
    btn.disabled = false;
    btn.querySelector('.choice-text').textContent = option.text;

    // 仅提示会影响的属性，不提供具体数值和增减
    let preview = getEffectIcons(option);
    if (option.probHint) {
        preview = `${option.probHint} | ${preview}`;
    }
    btn.querySelector('.choice-preview').textContent = preview;

    // 清除旧事件
    btn.onclick = () => handleInput(side);
}

// 按钮锁定
let isProcessing = false;
let feedbackTimer = null;

const npcAvatarMap = {
    '剑客': '⚔️', '医者': '🏥', '农官': '🌾', '使者': '✉️', '斥候': '🏹',
    '队长': '🛡️', '难民': '🥯', '商人': '💰', '税吏': '📜', '举报者': '👁️',
    '里正': '🏡', '仓官': '🏗️', '账房': '📒', '工匠': '⚒️', '监工': '👮'
};

function handleInput(choice) {
    if (isProcessing) return;
    if (DOM.buttons[choice].disabled) return;

    const event = Game.getState().currentEvent;
    if (!event) return;

    isProcessing = true;
    setButtonsEnabled(false);

    // UI Sound
    SoundSys.slide();

    // 播放动画
    DOM.card.classList.add(`swipe-${choice === 'left' ? 'left' : choice === 'right' ? 'right' : 'up'}`);

    const opt = event[choice];

    // 通用完成逻辑
    // finalize 函数不再需要，逻辑已内联到 timeout 中
    /* const finalize = () => { ... } */

    // NPC 反馈弹幕 (不显示玩家自己的选择回显)
    const character = event.character || '旁白';
    const avatar = npcAvatarMap[character] || '👤';

    // [v12.7 Checkpoint] 立即执行逻辑以获取真实的随机结果 (不推进回合)
    const result = Game.choose(choice, false);

    // 更新 UI 状态 (资源条变化立即反馈)
    updateUI();

    // 资源变化通过图标闪烁反馈 (代替弹幕)
    let isPositive = false;
    let isNegative = false;

    if (result.effects) {
        for (const [k, v] of Object.entries(result.effects)) {
            if (v !== 0) {
                flashResource(k, v);
                if (v > 0) isPositive = true;
                if (v < 0) isNegative = true;
            }
        }
    }

    // 根据结果播放简单的正向或负向音效
    if (isNegative && !isPositive) SoundSys.bad();
    else if (isPositive) SoundSys.good();
    else SoundSys.click();

    // 延迟 500ms 显示 NPC 反馈 (使用真实结果)
    setTimeout(() => {
        const resultText = result.outcome || '事情就这样过去了。';
        Town.addLog('event', { name: character, avatar: avatar }, resultText);

        // 4. 1.5秒后自动进入下一个事件
        setTimeout(() => {
            try {
                Game.advanceTurn();
                updateUI();
            } catch (e) {
                console.error("Game Logic Error:", e);
            } finally {
                resetCardAnimation();
                setButtonsEnabled(true);
                isProcessing = false;
            }
        }, 1500);
    }, 500);
}

// 废弃旧的弹窗函数
function showFeedbackOverlay() { }
function hideFeedbackOverlay() { }

function getResourceIcon(key) {
    const icons = { morale: '👥', food: '🌾', military: '⚔️', wealth: '💰', reputation: '📜' };
    return icons[key] || '';
}

// 资源图标闪烁反馈
function flashResource(key, delta) {
    const el = DOM.resources[key];
    if (!el) return;

    // 移除旧动画 (重置)
    el.classList.remove('flash-up', 'flash-down');
    void el.offsetWidth; // force reflow

    // 添加新动画
    el.classList.add(delta > 0 ? 'flash-up' : 'flash-down');

    // 动画结束后清除 (CSS 动画是 1.5s)
    setTimeout(() => {
        el.classList.remove('flash-up', 'flash-down');
    }, 1600);
}

function hideFeedbackOverlay() {
    DOM.feedbackOverlay.classList.add('hidden');
    DOM.feedbackOverlay.style.pointerEvents = 'none'; // 恢复穿透
    DOM.feedbackOverlay.onclick = null; // 清理事件
}

function resetCardAnimation() {
    DOM.card.className = 'card card-enter';
}

function setButtonsEnabled(enabled) {
    Object.values(DOM.buttons).forEach(btn => btn.disabled = !enabled);
}

// 键盘控制
function handleKeyPress(e) {
    if (isProcessing) return;
    const key = e.key.toLowerCase();
    if (key === 'a') handleInput('left');
    if (key === 'w') handleInput('neutral');
    if (key === 'd') handleInput('right');
}


// 游戏结束
function showGameOver(state) {
    DOM.gameScreen.classList.add('hidden');
    DOM.gameOverScreen.classList.remove('hidden');

    // 设置结局立绘
    const portrait = document.getElementById('ending-portrait');
    if (portrait) {
        // 使用相对路径，确保在 HTTP 服务器环境下可以加载
        portrait.src = './game_over_failure.png';
    }

    DOM.gameOverTurns.textContent = `在位时间：${state.year - 184}年 ${state.turn} 回合`;
    DOM.gameOverReason.textContent = ''; // 初始化置空

    if (window.Town) Town.stop();

    // 史诗感打字机特效输出
    const fullText = state.gameOverReason;
    let index = 0;
    DOM.gameOverReason.classList.add('typewriter-cursor');

    function typeChar() {
        if (index < fullText.length) {
            DOM.gameOverReason.textContent += fullText.charAt(index);
            index++;
            // 可以稍微加一点随机的停顿感
            const delay = fullText.charAt(index) === '。' || fullText.charAt(index) === '\n' ? 300 : 40 + Math.random() * 20;
            setTimeout(typeChar, delay);
        } else {
            DOM.gameOverReason.classList.remove('typewriter-cursor');
        }
    }

    // 延迟 500ms 后开始打字效果，渲染情绪氛围
    setTimeout(typeChar, 500);
}
