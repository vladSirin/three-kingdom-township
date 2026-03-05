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
        id: 'cao_cao_tribute',
        title: '曹军索贡',
        character: '使者',
        description: '曹操麾下使者带来命令：交纳粮草，否则后果自负。',
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
                    outcome: '曹军大怒！数日后边境遭到掠夺，抢走大量财物并掳走人口，损失惨重。'
                }
            ]
        },
        neutral: {
            text: '讨价还价',
            preview: '妥协但有损',
            effects: { food: -8, reputation: -3, morale: -5 },
            outcome: '使者勉强同意减半征收。虽然保住了一些粮食，但属下认为你毫无傲骨。'
        },
        right: {
            text: '如数上交',
            preview: '弃财保平安',
            effects: { food: -18, reputation: -12, wealth: 5 },
            outcome: '由于你表现十分“顺从”，曹军打赏了你一些金银，但你在天下的声望落至冰点。'
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
            preview: '得利损名',
            effects: { wealth: 8, reputation: -15, military: -5 },
            outcome: '你收受了监工的回扣。虽然府库小赚，但由于材料劣质，城防隐患重重。'
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
    }
];

console.log('events.js v0.7 加载完成，共', EVENTS.length, '个事件');
