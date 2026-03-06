/**
 * 三国小镇 - 事件卡数据
 * MVP v0.7 - 城镇建设事件
 */

const EVENTS = [
    // ============================================
    // 民生事件
    // ============================================
    {
        id: 'wandering_swordsman',
        title: '流浪剑客',
        character: '剑客',
        description: '一名身披破旧斗篷的剑客来到镇上，请求借宿一晚。他看起来武艺不凡，但眼神中透着疲惫。',
        left: {
            text: '婉拒',
            preview: '安全但失礼',
            effects: { reputation: -5, morale: 2 },
            outcome: '剑客沉默片刻，转身离去。里正夸你处事稳重，但江湖传闻你此地不甚好客。'
        },
        neutral: {
            text: '只给一晚',
            preview: '中庸之策',
            effects: { food: -3, reputation: 2, wealth: -2 },
            outcome: '剑客拱手道谢，在客栈住了一晚便离去。虽然打发了此人，却也耗费了一些银钱。'
        },
        right: {
            text: '热情款待',
            preview: '招募',
            probHint: '机遇与风险',
            outcomes: [
                {
                    weight: 7,
                    modifierTag: 'diplomatic_bonus',
                    effects: { food: -5, military: 12, reputation: 5 },
                    outcome: '剑客深受感动，发誓效忠于你，镇上的防卫力量大增！'
                },
                {
                    weight: 3,
                    effects: { food: -10, wealth: -5, morale: -2 },
                    outcome: '此人竟是假冒的流民大盗！趁夜色席卷财物逃之夭夭...'
                }
            ]
        }
    },
    {
        id: 'traveling_doctor',
        title: '游方医者',
        character: '医者',
        description: '一位自称精通医术的老者希望在镇上开设医馆，但需要官府资助。',
        condition: { building: 'hospital', maxLevel: 0 },
        left: {
            text: '拒绝资助',
            preview: '省钱但失民心',
            effects: { wealth: 5, morale: -8, reputation: -3 },
            outcome: '老者叹息离去。你省下了几两碎银，但百姓私下议论官府守财，枉顾生死。'
        },
        right: {
            text: '资助建造',
            preview: '去财得民心',
            effects: { wealth: -12, morale: 8, reputation: 5 },
            startConstruction: { building: 'hospital', duration: 2 },
            outcome: '老者大喜！即刻着手筹备医馆。虽然府库一空，但镇民皆感念你的恩德。'
        }
    },
    {
        id: 'harvest_report',
        title: '收成报告',
        character: '农官',
        description: '农官来报：今年风调雨顺，庄稼长势喜人。',
        left: {
            text: '正常储存',
            preview: '保守经营',
            effects: { food: 12, reputation: -3, wealth: -3 },
            outcome: '秋收顺利完成，粮仓充实。但商贾抱怨你限制了粮食入市的财路。'
        },
        right: {
            text: '扩建农田',
            preview: '开疆但耗财',
            effects: { wealth: -15, food: -5, reputation: 8 },
            startConstruction: { building: 'farm', duration: 2 },
            outcome: '你下令开垦荒地。虽当前劳民伤财，但你的声报在各郡县愈加响亮。'
        }
    },

    // ============================================
    // 军事事件
    // ============================================
    {
        id: 'warlord_tribute',
        title: '诸侯索贡',
        character: '使者',
        description: '周边强势诸侯的使者带甲而来：交纳粮草，否则后果自负。',
        left: {
            text: '断然拒绝',
            preview: '开战风险',
            probHint: '大吝',
            outcomes: [
                {
                    weight: 4,
                    modifierTag: 'military_bonus',
                    effects: { reputation: 15, morale: 5 },
                    outcome: '使者由于畏惧你的威严，竟灰溜溜地走了，城镇士气大振！'
                },
                {
                    weight: 6,
                    effects: { military: -12, reputation: 5, morale: -5, population: -8 },
                    outcome: '诸侯大怒！数日后边境遭到掠夺，抢走大量财物并掳走人口，损失惨重。'
                }
            ]
        },
        neutral: {
            text: '讨价还价',
            preview: '妥协但有损',
            probHint: '偏吉',
            outcomes: [
                {
                    weight: 5,
                    modifierTag: 'diplomatic_bonus',
                    effects: { food: -5, reputation: 2 },
                    outcome: '因你外交得当，使者同意大幅减免，甚至对你的手腕表示赞赏。'
                },
                {
                    weight: 5,
                    effects: { food: -10, reputation: -3, morale: -5 },
                    outcome: '使者勉强同意减免部分。虽然保住了一些粮食，但属下认为你毫无傲骨。'
                }
            ]
        },
        right: {
            text: '如数上交',
            preview: '弃财保平安',
            effects: { food: -20, reputation: -15, wealth: 5 },
            outcome: '由于你表现十分“顺从”，使者打赏了你一些金银，但你在天下的声望落至冰点。'
        }
    },
    {
        id: 'bandit_sighting',
        title: '山贼出没',
        character: '斥候',
        description: '斥候来报：附近山中发现山贼踪迹，恐来袭扰。',
        left: {
            text: '加强城防',
            preview: '防守耗材',
            effects: { military: 5, wealth: -8, food: -5 },
            outcome: '城墙加固，士兵全力防守。虽未受损失，但也无所斩获。'
        },
        neutral: {
            text: '派人谈判',
            preview: '破财消灾',
            effects: { wealth: -12, reputation: -5, morale: -5 },
            outcome: '你送去了金银。山贼虽然撤军，但你的威严重受打击。'
        },
        right: {
            text: '主动出击',
            preview: '损兵缴获',
            effects: { military: -8, food: -10, wealth: 15, reputation: 10 },
            outcome: '那是必须的牺牲！夜袭大获全胜，虽然折损了兵马粮草，但缴获了大量贼赃。'
        }
    },
    {
        id: 'recruit_soldiers',
        title: '征兵令',
        character: '队长',
        description: '守城队长建议扩充兵力，但需从田间抽调壮丁。',
        left: {
            text: '暂不征兵',
            preview: '务农养民',
            effects: { food: 10, morale: 5 },
            outcome: '田间劳力充足，百姓欢欣鼓舞。但守备力量并未增长。'
        },
        right: {
            text: '适度征兵',
            preview: '强武损农',
            effects: { military: 15, food: -15, morale: -8, population: -5 },
            outcome: '新兵入伍训练。军容日盛，但沉重的军徭役让民间怨声四起。'
        }
    },
    {
        id: 'outbound_raid',
        title: '整军出击',
        character: '将领',
        description: '镇中兵强马壮，将领请战外出“借粮”（即劫掠），以充实府库。',
        condition: { minResourceRatio: { military: 0.8 } },
        weight: 10,
        left: {
            text: '安抚斥退',
            preview: '求稳保民',
            effects: { reputation: -2, morale: 5 },
            outcome: '你安抚了躁动的军队，百姓称赞你的克制。'
        },
        neutral: {
            text: '劫掠商队',
            preview: '得财险名',
            effects: { wealth: 15, food: 10, reputation: -15 },
            outcome: '商队被洗劫一空，你获得了补给，但被州郡列为“强盗”，并且被受害商会盯上。',
            addState: { id: 'fat_sheep', duration: 3 }
        },
        right: {
            text: '攻打邻县',
            preview: '穷武豪夺',
            effects: { military: -20, wealth: 30, food: 25, population: -10, morale: -5, alignment: -30 },
            outcome: '你率军屠掠了邻近的村县！满载而归的背后是累累白骨，天下人视你如豺狼。（倾向大跌）'
        }
    },

    // ============================================
    // 内政事件
    // ============================================
    {
        id: 'refugee_wave',
        title: '难民涌入',
        character: '难民',
        description: '因战乱，难民聚集在城门外，哀求收留。',
        left: {
            text: '紧闭城门',
            preview: '保财但失德',
            effects: { morale: -15, reputation: -15, wealth: 5 },
            outcome: '城门紧扣，虽省下了粮饷，但哭喊渐弱后是死一般的寂静，百姓心寒。'
        },
        neutral: {
            text: '收留部分',
            preview: '有限救助',
            effects: { food: -8, morale: 5, reputation: 5, population: 25 },
            outcome: '你挑选青壮收容。虽增加劳动力，但难民中被拆散的家庭怨恨不已。'
        },
        right: {
            text: '全部接纳',
            preview: '圣母但危粮',
            effects: { food: -20, morale: 15, reputation: 20, population: 60, military: -5 },
            outcome: '仁名大显！但人口激增导致治安压力山大，防卫力量被严重摊薄。'
        }
    },
    {
        id: 'merchant_caravan',
        title: '商队过境',
        character: '商人',
        description: '一支富有的商队希望借道通过，愿意支付过路费。',
        left: {
            text: '收取重税',
            preview: '得财但失名',
            effects: { wealth: 20, reputation: -15, morale: -5 },
            outcome: '商队付了重金灰溜溜走了。你被商圈打上了「贪婪」的标签。'
        },
        neutral: {
            text: '正常通行',
            preview: '平庸之利',
            effects: { wealth: 8, reputation: 5, food: -3 },
            outcome: '商队购入了一些本地粮食后离开。你获得微利但未引起波动。'
        },
        right: {
            text: '热情招待',
            preview: '得名但失财',
            effects: { wealth: -12, reputation: 18, food: -5 },
            outcome: '你不仅不收过路费还管饭，商贾大受感动，承诺为你四处宣扬。'
        }
    },
    {
        id: 'tax_collection',
        title: '税收时节',
        character: '税吏',
        description: '又到了收税的季节，税吏请示征收标准。',
        left: {
            text: '减免税收',
            preview: '失财但得爱',
            effects: { wealth: -15, morale: 20, reputation: 10 },
            outcome: '百姓欢声雷动。你虽然窮得只能喝粥，但在民众心中你是活菩萨。'
        },
        neutral: {
            text: '维持原额',
            preview: '稳固即利',
            effects: { wealth: 10, morale: -5, reputation: -3 },
            outcome: '征收如常。在乱世中，墨守成规也是一种对威信的透支。'
        },
        right: {
            text: '加征税款',
            preview: '得财但众怒',
            effects: { wealth: 25, morale: -20, reputation: -15 },
            outcome: '金银入库的声音掩盖了民间的哭喊。你必须面对日后的隐患。'
        }
    },
    {
        id: 'corruption_report',
        title: '贪腐举报',
        character: '举报者',
        description: '有人密报：镇上一名官吏中饱私囊。',
        left: {
            text: '包庇纵容',
            preview: '得财失名',
            effects: { wealth: 10, morale: -15, reputation: -20 },
            outcome: '虽然保住了官场平衡并收纳了一些“孝敬”，但民间已将你视为昏庸之辈。'
        },
        neutral: {
            text: '私下警告',
            preview: '中庸之策',
            effects: { reputation: -5, morale: -5 },
            outcome: '贪官收敛了些，但由于未得惩处，衙役们办事愈发懈怠。'
        },
        right: {
            text: '严惩不贷',
            preview: '得民心损财',
            effects: { morale: 15, reputation: 12, wealth: -10 },
            outcome: '贪官被抄家问斩！虽因处理账目产生巨额开支，但小镇风气为之一振。'
        }
    },

    // ============================================
    // 建造事件
    // ============================================
    // ============================================
    // 建造事件 (Systematic Expansion v2.3 - Dual Logic)
    // ============================================

    // --- 市场 (Market) ---
    // [Urgent] 财满溢出 或 声望极高
    {
        id: 'build_market_urgent',
        title: '商贾请愿',
        character: '商人',
        description: '城中财富充盈，行商坐贾云集，现有的街市已拥堵不堪。',
        condition: { building: 'market', maxLevel: 0, minResourceRatio: { wealth: 0.7 } },
        weight: 50,
        left: {
            text: '驳回',
            preview: '求稳损名',
            effects: { reputation: -8, morale: -3, wealth: 5 },
            outcome: '商人们失望离去。虽省下了治安费，但你的城镇被视为“从商禁区”。'
        },
        right: {
            text: '批准建造',
            preview: '弃财得名',
            effects: { wealth: -20, reputation: 12, morale: 5 },
            startConstruction: { building: 'market', duration: 2 },
            outcome: '新市场开工！商人们许诺建成后必有厚报，但这笔开支确实不菲。'
        }
    },
    // [Prep] 声望高但财富一般
    {
        id: 'build_market_prep',
        title: '开市建议',
        character: '谋士',
        description: '谋士进言：主公声名在外，若能建立市场互通有无，必能富甲一方。',
        condition: { building: 'market', maxLevel: 0, minResourceRatio: { reputation: 0.6 } },
        weight: 5,
        left: { text: '暂缓', preview: '维持现状', effects: {}, outcome: '你认为时机未到，谋士退下了。' },
        right: {
            text: '采纳建议',
            preview: '投资未来',
            effects: { wealth: -15, reputation: 5 },
            startConstruction: { building: 'market', duration: 3 },
            outcome: '你批准了市场规划。这是一笔面向未来的投资。'
        }
    },

    // --- 兵器坊 (Armory) ---
    // [Urgent] 武力溢出
    {
        id: 'build_armory_urgent',
        title: '铁匠陈情',
        character: '铁匠',
        description: '军中兵员充足，但甲胄兵器多有破损，急需专门的工坊修缮。',
        condition: { building: 'armory', maxLevel: 0, minResourceRatio: { military: 0.8 } },
        weight: 50,
        left: {
            text: '暂缓',
            preview: '战力受损',
            effects: { military: -10, morale: -3 },
            outcome: '没有专门的工坊，士兵们只能拿着卷刃的兵器操练。'
        },
        right: {
            text: '批准修建',
            preview: '弃财武兴',
            effects: { wealth: -20, military: 15, reputation: 5 },
            startConstruction: { building: 'armory', duration: 3 },
            outcome: '兵器坊动工。这笔庞大的军备开支让账房先生心疼了许久。'
        }
    },
    // [Prep] 资源充足提前布局
    {
        id: 'build_armory_prep',
        title: '整军经武',
        character: '队长',
        description: '队长进言：如今天下未定，应早修武库，以备不时之需。',
        condition: { building: 'armory', maxLevel: 0, minResourceRatio: { wealth: 0.6 } },
        weight: 5,
        left: { text: '暂缓', preview: '休养生息', effects: { morale: 2 }, outcome: '你决定暂不穷兵黩武，百姓松了口气。' },
        right: {
            text: '批准修建',
            preview: '未雨绸缪',
            effects: { wealth: -15, military: 5 },
            startConstruction: { building: 'armory', duration: 3 },
            outcome: '新的武库开始动工，为未来的战事做准备。'
        }
    },

    // --- 民房 (Housing) ---
    // [Urgent] 人口 > 90%
    {
        id: 'expand_housing_urgent',
        title: '人满为患',
        character: '里正',
        description: '里正惊慌来报：镇上早已人满为患，流民露宿街头，怨气冲天！',
        condition: { minPopRatio: 0.9 },
        weight: 60,
        left: {
            text: '暂不扩建',
            preview: '强行驱逐',
            effects: { morale: -20, population: -15, reputation: -10 },
            outcome: '你下令驱逐部分流民。哭喊声震天，你的仁名扫地。'
        },
        right: {
            text: '紧急扩建',
            preview: '纳人损粮',
            effects: { wealth: -15, food: -10, morale: 15 },
            startConstruction: { building: 'housing', duration: 2 },
            outcome: '新的坊市紧急开工。虽然耗资巨大，但总算平息了民怨。'
        }
    },
    // [Prep] 人口 > 60%
    {
        id: 'expand_housing_prep',
        title: '宜居规划',
        character: '里正',
        description: '里正建议：镇上人口日渐兴旺，这几处空地何不规划为新坊？',
        condition: { minPopRatio: 0.6, maxPopRatio: 0.85 },
        weight: 10,
        left: { text: '暂不扩建', preview: '维持现状', effects: {}, outcome: '你认为现在的住房尚有富余。' },
        right: {
            text: '批准规划',
            preview: '提升上限',
            effects: { wealth: -10, food: -5 },
            startConstruction: { building: 'housing', duration: 3 },
            outcome: '新的住宅区开始规划建设，吸引了周边乡民的目光。'
        }
    },

    // --- 粮仓 (Granary) ---
    // [Urgent] 粮草 > 80%
    {
        id: 'upgrade_granary_urgent',
        title: '爆仓危机',
        character: '仓官',
        description: '仓官急报：粮仓爆满，新粮露天堆放，若不扩建恐将霉变！',
        condition: { minResourceRatio: { food: 0.8 } },
        weight: 60,
        left: {
            text: '卖掉余粮',
            preview: '得财贬值',
            effects: { food: -25, wealth: 15, reputation: -5 },
            outcome: '你被迫低价抛售余粮。虽然换了钱，但若是荒年恐将后悔。'
        },
        right: {
            text: '紧急扩建',
            preview: '保粮损财',
            effects: { wealth: -20, food: -5, morale: 5 },
            startConstruction: { building: 'granary', duration: 2 },
            outcome: '工匠们连夜施工扩建粮仓，总算保住了这批珍贵的粮食。'
        }
    },
    // [Prep] 粮草 < 50%
    {
        id: 'upgrade_granary_prep',
        title: '储粮大计',
        character: '仓官',
        description: '仓官进言：今岁粮价平稳，主公何不趁机扩修粮仓，以备来年？',
        condition: { maxResourceRatio: { food: 0.5 } },
        weight: 10,
        left: { text: '暂不扩建', preview: '节省开支', effects: {}, outcome: '你觉得现在的粮仓足够用了。' },
        right: {
            text: '采纳建议',
            preview: '提升上限',
            effects: { wealth: -12 },
            startConstruction: { building: 'granary', duration: 3 },
            outcome: '新仓动工。广积粮，缓称王。'
        }
    },

    // --- 官署 (Office) ---
    // [Urgent] 声望 > 75
    {
        id: 'upgrade_office_urgent',
        title: '府衙拥挤',
        character: '账房',
        description: '主公威名日盛，来访使节络绎不绝，这间小小的草庐已有损威仪！',
        condition: { minResourceRatio: { reputation: 0.75 } },
        weight: 50,
        left: {
            text: '将就着用',
            preview: '俭省折面',
            effects: { reputation: -10, morale: 5 },
            outcome: '使节们私下嘲笑你的府邸寒酸，但百姓称赞你的简朴。'
        },
        right: {
            text: '扩建官署',
            preview: '正名损财',
            effects: { wealth: -25, reputation: 15, military: 5 },
            startConstruction: { building: 'office', duration: 3 },
            outcome: '宏伟的新官署拔地而起，四方宾客无不肃然起敬。'
        }
    },
    // [Prep] 声望 < 40
    {
        id: 'upgrade_office_prep',
        title: '重修官署',
        character: '幕僚',
        description: '幕僚建议：官署破败，不利于发布政令。修缮一番或可提振民心。',
        condition: { maxResourceRatio: { reputation: 0.4 } },
        weight: 5,
        left: { text: '不必多事', preview: '省钱', effects: {}, outcome: '你不在意这些排场。' },
        right: {
            text: '拨款修缮',
            preview: '提振威望',
            effects: { wealth: -15, reputation: 5 },
            startConstruction: { building: 'office', duration: 3 },
            outcome: '官署修缮一新，办事效率似乎也提高了不少。'
        }
    },

    // --- 城墙 (Wall) ---
    // [Urgent] 基础条件
    {
        id: 'reinforce_wall_urgent',
        title: '城墙隐患',
        character: '工匠',
        description: '工匠急报：近日雨水冲刷，城墙惊现数道裂痕，非大修不可！',
        condition: { minResourceRatio: { morale: 0.6 } }, // 民心较高时才会报告，否则隐瞒
        weight: 40,
        left: {
            text: '简单修补',
            preview: '平庸险防',
            effects: { wealth: -8, military: 2 },
            outcome: '裂痕被泥土糊上了。希望能撑过这个冬天。'
        },
        right: {
            text: '全面加固',
            preview: '固防损财',
            effects: { wealth: -25, military: 15, food: -5 },
            startConstruction: { building: 'wall', duration: 3 },
            outcome: '城墙焕然一新！虽耗尽钱粮，但看着高耸的雉堞，全城皆安。'
        }
    },

    // ============================================
    // 建造中问题事件
    // ============================================
    {
        id: 'construction_wage_dispute',
        title: '工匠讨薪',
        character: '工匠',
        description: '负责工程的工匠聚集在官署门前，称已两月未发工钱。',
        condition: { isConstructing: true },
        left: {
            text: '强行驱散',
            preview: '镇压',
            effects: { morale: -8 },
            outcome: '工匠被驱散，但怨气更重，工程进度也受影响。'
        },
        neutral: {
            text: '分期支付',
            preview: '拖延',
            effects: { wealth: -5 },
            outcome: '工匠勉强接受，但仍有怨言。'
        },
        right: {
            text: '立即补发',
            preview: '安抚',
            effects: { wealth: -10, morale: 5 },
            outcome: '工匠们拿到工钱，干劲十足，工程顺利推进。'
        }
    },
    {
        id: 'construction_corruption',
        title: '偷工减料',
        character: '举报者',
        description: '有人密报：监工私吞建材，以次充好。',
        condition: { isConstructing: true },
        left: {
            text: '睁一只眼',
            preview: '隐患重重',
            effects: { wealth: 8, reputation: -15, military: -5 },
            outcome: '你收受了监工的回扣。不久后，修葺的建筑里传出嘎吱作响的声音。（已添加危险建筑隐患）',
            addState: { id: 'shoddy_work', duration: 99 } // 持续性隐患
        },
        right: {
            text: '严查严办',
            preview: '弃财兴威',
            effects: { wealth: -8, reputation: 10, morale: 5 },
            outcome: '公开处分腐败者极大振奋了人心，为了重购建材你不得不增拨资金。'
        }
    },

    // ============================================
    // 人口溢出事件 (Overcrowding Disasters)
    // ============================================
    {
        id: 'overcrowded_plague',
        title: '疫病滋生',
        character: '医者',
        description: '由于城中人口过度拥挤，卫生条件急剧恶化，一场瘟疫正在悄然蔓延！',
        condition: { minPopRatio: 1.1 }, // 人口超过 110% 触发
        left: {
            text: '封锁隔离',
            preview: '止损',
            effects: { population: -40, morale: -10 },
            outcome: '你下令封锁了受灾街区。哀鸿遍野中，疫病虽得以控制，但代价惨重。'
        },
        right: {
            text: '开仓放药',
            preview: '救火',
            effects: { wealth: -15, food: -10, population: -15, morale: 5 },
            outcome: '虽然耗费了巨额公帑与粮草，但多数百姓得以保全，民心依然稳固。'
        }
    },
    {
        id: 'housing_riot',
        title: '流民骚乱',
        character: '监工',
        description: '城内人满为患，许多人露宿街头。积怨已久的流民与官差爆发了激烈冲突！',
        condition: { minPopRatio: 1.4 }, // 人口超过 140% 触发
        left: {
            text: '武力镇压',
            preview: '维持秩序',
            effects: { population: -20, morale: -15, military: -5 },
            outcome: '士兵刀甲齐出，骚乱虽熄，但城中萧条，百姓眼中满是畏惧。'
        },
        right: {
            text: '紧急疏散',
            preview: '妥协',
            effects: { wealth: -10, morale: -5, population: -60 },
            outcome: '你被迫发放路费让流民前往邻近城镇，虽然损失了金钱与人口，但社会动荡暂时平息。'
        }
    },

    // ============================================
    // 特质触发事件
    // ============================================
    {
        id: 'refugee_crisis',
        title: '凛冬灾民',
        character: '流民',
        description: '大雪封山，邻郡爆发严重灾荒，无数衣不蔽体的灾民涌入城中，官员请示如何处置。',
        weight: 15,
        left: {
            text: '视而不见',
            preview: '省财失心',
            effects: { reputation: -10, morale: -10, wealth: 5 },
            outcome: '你下令闭门不出，城外冻死饿死者不计其数。虽然省下了开支，但你的冷血让全城胆寒。'
        },
        neutral: {
            text: '设立粥棚',
            preview: '平庸救济',
            effects: { food: -10, morale: 5, reputation: 5 },
            outcome: '几处粥棚勉强维持了最基础的生机，百姓对你的善举表示感谢。'
        },
        right: {
            text: '开仓散财',
            preview: '大仁大义',
            effects: { food: -25, wealth: -20, reputation: 25, morale: 20, alignment: 50 },
            outcome: '你为了拯救生民倾尽府库！百姓在雪地中向你叩首，称呼你为“活菩萨”。此后，你的仁惠之名传遍天下！\n\n【倾向升至：仁义】'
        }
    },
    {
        id: 'tax_riot',
        title: '抗税暴乱',
        character: '税吏',
        description: '城外某村因连年苛捐杂税，聚集抗议，甚至暴力驱逐了收税的官吏。',
        weight: 15,
        left: {
            text: '妥协免税',
            preview: '失财得心',
            effects: { wealth: -10, morale: 8, reputation: -5 },
            outcome: '你选择退让并下达了免税令。虽然府库受损，管治威信下降，但暴乱和平解散。'
        },
        neutral: {
            text: '逮捕首恶',
            preview: '雷霆手段',
            effects: { morale: -5, military: -5, wealth: 5 },
            outcome: '军队出动抓捕了带头抗议的几人，风波暂时平息。'
        },
        right: {
            text: '血腥屠村',
            preview: '残暴镇压',
            effects: { population: -20, military: -5, wealth: 15, morale: -25, reputation: -20, alignment: -50 },
            outcome: '你下达了“杀一儆百”的冷血指令。村庄化为焦土，全镇噤若寒蝉，背后皆称你为暴君。\n\n【倾向跌至：暴虐】'
        }
    },

    // ============================================
    // 状态与异常联动专属事件
    // ============================================
    {
        id: 'starving_mutiny',
        title: '饿殍之怒',
        character: '暴民',
        description: '【饥荒爆发】由于长时间饥荒，城中已出现易子而食的惨状，数千饥民失去理智，手持农具冲击府衙库房！',
        condition: { state: 'starving' },
        weight: 50,
        modifierTag: 'event_prob_starving',
        left: {
            text: '无粮可救',
            preview: '等待死亡',
            effects: { population: -30, morale: -15, reputation: -10 },
            outcome: '你只能闭门不出，饥民在绝望中互相践踏，甚至抢掠同胞，城中犹如人间地狱。'
        },
        right: {
            text: '武力镇压',
            preview: '血色同室',
            effects: { population: -20, military: -10, morale: -20 },
            outcome: '你下令军队对平民挥起屠刀。暴动被血腥镇压，但你的统治根基已被彻底动摇。'
        }
    },
    {
        id: 'wolves_at_door',
        title: '群狼环伺',
        character: '探子',
        description: '【肥羊受劫】你富甲一方却武备空虚的消息早已传开，周边数股流贼联合向小镇发起凶猛的夹击！',
        condition: { state: 'fat_sheep' },
        weight: 50,
        modifierTag: 'event_prob_robbery',
        left: {
            text: '缴纳岁贡',
            preview: '屈辱求和',
            effects: { wealth: -40, reputation: -20, morale: -10 },
            outcome: '贼首在府衙大堂肆意劫掠调戏，带着满载的马车大笑着离去。你的威严扫地。'
        },
        right: {
            text: '死守城池',
            preview: '玉石俱焚',
            effects: { military: -15, wealth: -20, population: -10, morale: 5 },
            outcome: '军民付出惨烈代价才勉强击退敌人。虽然保住了部分家产，但城镇元气大伤。'
        }
    },
    {
        id: 'talent_visit',
        title: '大才登门',
        character: '名士',
        description: '【安居触发】听闻主公治下安居乐业，夜不闭户，一位身着鹤氅的名士主动登门拜访，愿效犬马之劳！',
        condition: { state: 'peaceful' },
        weight: 15,
        modifierTag: 'event_prob_talent',
        left: {
            text: '虚心受教',
            preview: '得大贤',
            effects: { reputation: 15, morale: 10, wealth: 10, food: 10 },
            outcome: '大贤倾囊相授。不仅改良了农商之法，还为你赢得了极高的天下清名。'
        },
        right: {
            text: '封为客卿',
            preview: '重用',
            effects: { wealth: -20, reputation: 25, military: 15 },
            outcome: '你以重金厚禄聘其为军师。在他的谋划下，城镇防务和声望都得到了飞跃。'
        }
    },

    // ============================================
    // 倾向光谱专属卡组 (Alignment Exclusive)
    // ============================================
    {
        id: 'hero_arrives',
        title: '英雄来投',
        character: '豪杰',
        description: '听闻主公宽仁厚德，一位手持丈八蛇矛、威风凛凛的豪杰特来投效，愿为主公前驱！',
        condition: { minAlignment: 50 },
        weight: 25,
        left: {
            text: '委以重任',
            preview: '得遇明主',
            effects: { military: 30, morale: 15, food: -5 },
            outcome: '好汉感动涕零：“遇明主，敢不效死力！”全军士气大震，武库充实。'
        },
        right: {
            text: '结拜兄弟',
            preview: '生死之交',
            effects: { reputation: 20, morale: 20, military: 20, wealth: -10 },
            outcome: '你与他在桃园结为异姓兄弟！感人肺腑的情谊传为佳话。'
        }
    },
    {
        id: 'benevolent_charity',
        title: '乐善好施',
        character: '老丈',
        description: '远方受灾的百姓慕名而来，匍匐在府衙门前，祈求得到你这位“活菩萨”的施舍。',
        condition: { minAlignment: 50 },
        weight: 15,
        left: {
            text: '闭门谢客',
            preview: '声名略损',
            effects: { reputation: -5, alignment: -5 },
            outcome: '虽然你也有难处，但门外的叹息声还是让你的仁厚之名打了些折扣。'
        },
        right: {
            text: '有求必应',
            preview: '损财济民',
            effects: { food: -15, wealth: -5, reputation: 10, alignment: 5 },
            outcome: '你慷慨解囊，灾民们千恩万谢地离去，你的声名更加稳固。'
        }
    },
    {
        id: 'assassination_attempt',
        title: '夜半惊醒',
        character: '死士',
        description: '你平日的暴虐终于惹来杀机！夜半时分，几名蒙面死士潜入你的卧房，寒光闪烁直逼咽喉！',
        condition: { maxAlignment: -50 },
        weight: 30,
        left: {
            text: '惊险呼救',
            preview: '重伤求存',
            effects: { military: -15, morale: -15, reputation: -10 },
            outcome: '亲卫拼死护卫才将刺客斩杀，但你亦受重创，整个府衙风声鹤唳。'
        },
        right: {
            text: '斩尽杀绝',
            preview: '血色清洗',
            effects: { military: -5, wealth: 15, population: -10, alignment: -10 },
            outcome: '你早有防备，设下埋伏！不仅把刺客诛杀，还连夜抄了幕后主使的家，小镇沉浸在血雨腥风中。'
        }
    },
    {
        id: 'forced_conscription',
        title: '强拉壮丁',
        character: '军官',
        description: '兵役繁重，但在你的严酷统治下，军官建议今夜入村突击，将所有青壮男子强行抓入军营。',
        condition: { maxAlignment: -50 },
        weight: 20,
        left: {
            text: '不理会',
            preview: '难得宽许',
            effects: { morale: 5, alignment: 5 },
            outcome: '你破天荒地驳回了建议。百姓对你少了一分憎恶。'
        },
        right: {
            text: '鸡犬不宁',
            preview: '强军损民',
            effects: { military: 25, population: -15, morale: -20, alignment: -10 },
            outcome: '半夜的村庄哭号震天，士兵暴力踹门拉人。你的军队因此壮大，但愤怒已埋下火种。'
        }
    },
    {
        id: 'seasonal_plague',
        title: '换季时疫',
        character: '医者',
        description: '季度交替，寒暑不均。城中突发时疫，咳嗽发热者甚众。',
        weight: 15,
        left: {
            text: '听天由命',
            preview: '省钱死人',
            effects: { population: -15, morale: -5 },
            outcome: '官府未加干涉。时疫带走了一批体弱的老幼，城中多了无数白幡。'
        },
        neutral: {
            text: '封锁隔离',
            preview: '强制维稳',
            effects: { population: -5, morale: -10, wealth: -5 },
            outcome: '患病者被强行锁在家中。虽然传播途径被切断，但这种无情的做法引发了强烈的民怨。'
        },
        right: {
            text: '延医送药',
            preview: '庇护(需医馆)',
            probHint: '必定成功',
            condition: { building: 'hospital', minLevel: 1 },
            effects: { wealth: -10, morale: 10, reputation: 5 },
            outcome: '多亏了医馆里的大夫们倾力相救！官府报销了部分药费，染病者几乎全部痊愈。'
        }
    },
    {
        id: 'dangerous_building',
        title: '隐患告急',
        character: '工匠',
        description: '【危险建筑】此前由于材料使用低劣，城中一座重要设施突发险情！如果不加抢修恐怕会引发连锁坍塌。',
        condition: { state: 'shoddy_work' },
        weight: 60,
        left: {
            text: '听之任之',
            preview: '听凭天命',
            effects: { morale: -10, reputation: -5 },
            outcome: '轰隆一声巨响，建筑轰然坍塌。虽然早作防备，但百姓对你的信任再次大打折扣。（隐患已了）',
            removeState: 'shoddy_work'
        },
        right: {
            text: '紧急抢修',
            preview: '耗财补漏',
            effects: { wealth: -15, food: -5, morale: 5 },
            outcome: '工匠们日夜赶工，用真材实料重新加固了隐患处。这块心病总算除去了。（隐患已排除）',
            removeState: 'shoddy_work'
        }
    }
];

// ============================================
// 灾难与软着陆事件 (Soft Game Over Interceptors)
// ============================================
const DISASTER_EVENTS = [
    {
        id: 'disaster_food_low',
        triggerCrisis: 'crisis_food_low',
        title: '【危机】饥民暴动',
        character: '里正',
        description: '粮草断绝，全城爆发了严重的饥荒，走投无路的灾民正在冲击府衙！若不迅速处理，小镇即将彻底崩溃！',
        left: {
            text: '武力弹压',
            preview: '镇压损威',
            effects: { military: -10, reputation: -15, morale: -15, population: -20 },
            outcome: '你下令士兵强行驱散饥民，鲜血染红了街道。暴动暂歇，但饥荒的阴云依然笼罩（危机倒计时继续）。'
        },
        right: {
            text: '高价募粮',
            preview: '散财救命',
            effects: { wealth: -25, food: 15 },
            outcome: '你散尽府库家财，从黑市商贾手中买来一批高价粮。虽然倾家荡产，但至少解了燃眉之急！'
        }
    },
    {
        id: 'disaster_morale_low',
        triggerCrisis: 'crisis_morale_low',
        title: '【危机】揭竿而起',
        character: '队长',
        description: '民怨沸腾到了极点，城中百姓竟然自发武装起来，打着“黄天当立”的旗号包围了官署！',
        left: {
            text: '血腥镇压',
            preview: '大伤元气',
            effects: { military: -15, population: -30, wealth: -5 },
            outcome: '正规军艰难地绞杀了起义的百姓。城郭半毁，人口锐减。'
        },
        right: {
            text: '下罪己诏',
            preview: '损名安抚',
            effects: { reputation: -25, food: -15, morale: 20 },
            outcome: '你当众脱去锦袍，下跪向百姓谢罪，并开仓放粮。颜面扫地，但总算平息了民愤。'
        }
    },
    {
        id: 'disaster_military_low',
        triggerCrisis: 'crisis_military_low',
        title: '【危机】贼寇压境',
        character: '斥候',
        description: '城防空虚的消息走漏，附近流寇大军压境。探子飞报：不日便将破城！',
        left: {
            text: '割地赔款',
            preview: '破财消灾',
            effects: { wealth: -20, food: -20, reputation: -10 },
            outcome: '你送出了几乎所有的积蓄和存粮供给贼军。他们大笑离去，嘲笑你的软弱。'
        },
        right: {
            text: '破釜沉舟',
            preview: '背水一战',
            effects: { morale: -20, population: -20, military: 15 },
            outcome: '你强征壮丁，毁锅砸碗逼迫全城死战。惨烈的守城赢了，但家家缟素。'
        }
    },
    {
        id: 'disaster_wealth_low',
        triggerCrisis: 'crisis_wealth_low',
        title: '【危机】吏卒哗变',
        character: '账房',
        description: '府库彻底破产，连月发不出军饷，吏卒们拔出刀剑聚众讨要说法！',
        left: {
            text: '纵兵抢掠',
            preview: '纵容作恶',
            effects: { morale: -30, reputation: -20, wealth: 15 },
            outcome: '为了平息兵变，你默认了士兵在城中劫掠三日。人间炼狱，名声尽毁。'
        },
        right: {
            text: '变卖军需',
            preview: '削足适履',
            effects: { food: -15, military: -15, wealth: 15 },
            outcome: '你不得不将粮草和军械低价折现发饷。哗变平息，但城镇武备荡然无存。'
        }
    },
    {
        id: 'disaster_reputation_low',
        triggerCrisis: 'crisis_reputation_low',
        title: '【危机】众叛亲离',
        character: '谋士',
        description: '由于你名声恶劣，原本的幕僚和武将纷纷开始收拾行囊准备弃你而去！',
        left: {
            text: '重金挽留',
            preview: '收买人心',
            effects: { wealth: -25, food: -10, reputation: 15 },
            outcome: '你只得用巨大的物质利益重新绑定了这群唯利是图的部下。'
        },
        right: {
            text: '听之任之',
            preview: '树倒猢狲散',
            effects: { population: -40, military: -15, morale: -10 },
            outcome: '大批人才与心腹连夜出走，带走了大量人口与亲兵，小镇元气大伤。'
        }
    },
    // ---- 高风险博弈 (High Value Crises) ----
    {
        id: 'disaster_wealth_high',
        triggerCrisis: 'crisis_wealth_high',
        title: '【高危】树大招风',
        character: '使者',
        description: '小镇横财外露，富甲一方。此举招致了董卓军的垂涎，其先锋部队已至城下勒索钱财！',
        left: {
            text: '强硬拒之',
            preview: '玉石俱焚',
            effects: { military: -20, population: -15 },
            outcome: '你拒绝交钱，双方爆发血战。虽然依靠城防勉强击退敌人，但也损失惨重。'
        },
        right: {
            text: '破财免灾',
            preview: '交出六成',
            effects: { wealth: -30, reputation: -10 },
            outcome: '你被迫交出了大批金铢。虽然肉痛，但这保全了镇子的安宁。'
        }
    },
    {
        id: 'disaster_food_high',
        triggerCrisis: 'crisis_food_high',
        title: '【高危】诸侯强借',
        character: '使者',
        description: '城中粮如山积，四方皆知。袁绍使者傲慢入城：“盟军讨贼，借尔等半年粮草一用。”',
        left: {
            text: '抗命不遵',
            preview: '触怒盟主',
            effects: { reputation: 10, military: -15, morale: -5 },
            outcome: '你大义凛然拒绝。随后遭到了袁军的报复性袭击，防线损失不小。'
        },
        right: {
            text: '开仓放粮',
            preview: '耗粮',
            effects: { food: -40, reputation: 5 },
            outcome: '大批粮车被拉走，几近掏空了太仓。不过袁大将军倒是夸了你一句识时务。'
        }
    }
];

window.DISASTER_EVENTS = DISASTER_EVENTS;

console.log('events.js v0.8 加载完成，共', EVENTS.length, '个事件，及', DISASTER_EVENTS.length, '个灾难卡');
