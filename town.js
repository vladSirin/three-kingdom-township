/**
 * 三国小镇 - 城镇系统 & 日志管理器 (v12.7 Restored)
 * 负责：
 * 1. 建筑详细信息定义
 * 2. 城镇日志生成 (系统消息/闲聊/事件)
 * 3. 聊天系统逻辑
 */

// 建筑详细配置
const BUILDING_INFO = {
    office: {
        name: '官署',
        icon: '🏛️',
        desc: '行政中心',
        effect: (lv) => `财富上限 +${lv * 20}`,
        flavor: '主要处理政务和税收。'
    },
    granary: {
        name: '粮仓',
        icon: '🌮', // 或 🌾
        desc: '储备粮草',
        effect: (lv) => `粮草上限 +${lv * 20}`,
        flavor: '民以食为天。'
    },
    farm: {
        name: '农田',
        icon: '🌾',
        desc: '规模化耕种',
        effect: (lv) => `产粮 = 等级 × (人口/20)`,
        flavor: '沃野千里，人勤地不懒。'
    },
    market: {
        name: '市场',
        icon: '🏪',
        desc: '商业与税收',
        effect: (lv) => `财富 = 等级 × (人口/40)`,
        flavor: '商贾云集，人口即是流通。'
    },
    hospital: {
        name: '医馆',
        icon: '🏥',
        desc: '救死扶伤',
        effect: (lv) => `瘟疫抵抗 +${lv * 10}%`,
        flavor: '悬壶济世，妙手回春。'
    },
    armory: {
        name: '军械库',
        icon: '⚔️',
        desc: '储备兵器',
        effect: (lv) => `武力上限 +${lv * 20}`,
        flavor: '干戈在手，保家卫国。'
    },
    wall: {
        name: '城墙',
        icon: '🏯',
        desc: '防御工事',
        effect: (lv) => `防御等级 ${lv}`,
        flavor: '固若金汤，坚不可摧。'
    },
    housing: {
        name: '民房',
        icon: '🏠',
        desc: '安康住所',
        effect: (lv) => `容量 +${lv * 40} (基础 20)`,
        flavor: '广厦千万间，方能聚万民。'
    }
};

// 闲聊语录库
const AMBIENT_CHATER = {
    // 默认
    normal: [
        { name: '王大娘', avatar: '👵', text: '今天天气真不错啊。' },
        { name: '跑堂小二', avatar: '🍶', text: '客官，要来点什么？' },
        { name: '更夫', avatar: '🌙', text: '天干物燥，小心火烛。' },
        { name: '孩童', avatar: '🧒', text: '我要当大将军！' }
    ],
    // 低民心
    low_morale: [
        { name: '愤怒的村民', avatar: '😠', text: '这日子没法过了！' },
        { name: '流浪汉', avatar: '🏚️', text: '官府根本不管我们死活...' },
        { name: '书生', avatar: '📚', text: '苛政猛于虎也。' }
    ],
    // 低粮草
    famine: [
        { name: '饥民', avatar: '🥣', text: '行行好，给口吃的吧...' },
        { name: '老农', avatar: '🌾', text: '今年收成不好，又要饿肚子了。' }
    ],
    // 战争 (如果有状态)
    war: [
        { name: '逃兵', avatar: '🏳️', text: '外面都在打仗，太可怕了。' }
    ],
    // 拥挤
    overcrowded: [
        { name: '流民', avatar: '🏚️', text: '城里连睡觉的地方都没有了...' },
        { name: '更夫', avatar: '🌙', text: '人太多了，得提防半夜发生火灾或瘟疫。' },
        { name: '差役', avatar: '👮', text: '全是人，官府都快管不过来了。' }
    ]
};

const Town = {
    // 聊天记录
    logs: [],

    // 定时器
    interval: null,

    init() {
        console.log('Town Hub 初始化...');
        // 初始欢迎语
        this.addLog('system', null, '欢迎来到三国小镇！点击下方按钮开始决策。');

        // 启动闲聊循环 (目前屏蔽，方便迭代核心流程)
        // this.startAmbientChat();
    },

    /**
     * 添加日志
     * type: 'system' | 'event' | 'ambient'
     * sender: { name, avatar } (仅 ambient/event 需要)
     * text: 消息内容
     */
    addLog(type, sender, text) {
        const log = { type, sender, text, time: Date.now() };
        this.logs.push(log);

        // 限制长度
        if (this.logs.length > 50) this.logs.shift();

        // 更新 UI
        if (window.renderChatLog) {
            window.renderChatLog(log);
        }
    },

    startAmbientChat() {
        if (this.interval) clearInterval(this.interval);

        // 每 8-15 秒随机一条闲聊
        this.interval = setInterval(() => {
            if (Math.random() < 0.3) {
                this.generateAmbientChat();
            }
        }, 5000);
    },

    generateAmbientChat() {
        if (!Game || !Game.getState) return; // 安全检查

        const state = Game.getState();
        let pool = [...AMBIENT_CHATER.normal];

        if (state.resources.morale < 30) {
            pool = pool.concat(AMBIENT_CHATER.low_morale);
            // 增加权重
            pool = pool.concat(AMBIENT_CHATER.low_morale);
        }
        if (state.resources.food < 10) {
            pool = pool.concat(AMBIENT_CHATER.famine);
        }
        if (state.population > Game.getPopulationCap()) {
            pool = pool.concat(AMBIENT_CHATER.overcrowded);
            pool = pool.concat(AMBIENT_CHATER.overcrowded); // 增加权重
        }

        const choice = pool[Math.floor(Math.random() * pool.length)];
        this.addLog('ambient', { name: choice.name, avatar: choice.avatar }, choice.text);
    },

    // 停止（游戏结束时）
    stop() {
        clearInterval(this.interval);
    }
};

// 导出
window.Town = Town;
window.BUILDING_INFO = BUILDING_INFO;
