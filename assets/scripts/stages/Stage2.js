var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        //角色
        roles: {
            default: [],
            type: cc.Node
        },
        //目标区域
        target: {
            default: [],
            type: cc.Node
        },
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.roles[0], "xie1", "xie2");

        this.teacherIsCareful = true;

        this.addEventToGetProp(this.prop[0], this.target[0], this.continue1.bind(this));
        this.addEventToGetProp(
            this.prop[1],
            [this.target[0], this.target[1]],
            [this.badEnd2.bind(this), this.continue2.bind(this)],
        );

        //提示引导
        this.timerStartTag = false;
        this.timerEndTag = false;
        this.timer = 0;
        this.node.on('guide', () => {
            this.timerStartTag = true;
        })
    },

    //提示引导
    tipsGuide() {
        let content = cc.find("Content", this.node);
        let label = cc.find("Label", content).getComponent(cc.Label);
        content.active = true;
        content.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.5, cc.v2(0, -15)).easing(cc.easeInOut(3)),
                    cc.moveBy(0.5, cc.v2(0, 15)).easing(cc.easeInOut(3))
                )
            )
        )
        this.typingAni(label, "不会玩？看提示！");
        this.gameCtrl.tipsGuide(() => { content.active = false });
        content.once(cc.Node.EventType.TOUCH_END, () => { content.active = false });
    },

    //喝可乐分支
    continue1() {
        if (this.teacherIsCareful) {
            this.badEnd1();
        } else {
            this.happyEnd();
        }
    },

    //吃薯片分支
    continue2() {
        //老师状态变化
        this.roles[3].active = false;
        this.roles[5].active = true;
        this.prop[3].active = false;
        this.teacherIsCareful = false;
    },

    //通用坏结局
    sameBadEnd() {
        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.prop[2].active = true;
                this.roles[1].active = false;
                this.roles[2].active = false;
            }),
            cc.moveTo(1.5, cc.v2(-267, -22)),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0,1);
            })
        )
        return {
            nodes: [this.roles[3], this.roles[4], this.roles[6]],
            actions: [null, 1, action2]
        }
    },

    //喝可乐坏结局
    badEnd1() {
        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.roles[0].active = false;
            }),
            cc.repeat(
                cc.sequence(
                    cc.spawn(
                        cc.rotateTo(0.1, 2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(6, 0)).easing(this.myEase()),
                    ),
                    cc.spawn(
                        cc.rotateTo(0.1, -2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(-6, 0)).easing(this.myEase()),
                    )
                ), 8
            )
        )

        let nodes = [this.roles[2]]
        nodes = this.insert(nodes, this.sameBadEnd().nodes);
        let actions = [action1]
        actions = this.insert(actions, this.sameBadEnd().actions);
        this.runSeqAction(nodes, actions);
    },

    //吃薯片坏结局
    badEnd2() {
        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.roles[0].active = false;
            }),
            cc.repeat(
                (
                    cc.sequence(
                        cc.scaleTo(0.2, 1.1),
                        cc.scaleTo(0.2, 1)
                    )
                ), 4
            )
        )
        let nodes = [this.roles[1]]
        nodes = this.insert(nodes, this.sameBadEnd().nodes);
        let actions = [action1]
        actions = this.insert(actions, this.sameBadEnd().actions);
        this.runSeqAction(nodes, actions);
    },

    //好结局
    happyEnd() {
        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.roles[0].active = false;
            }),
            cc.repeat(
                cc.sequence(
                    cc.spawn(
                        cc.rotateTo(0.1, 2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(6, 0)).easing(this.myEase()),
                    ),
                    cc.spawn(
                        cc.rotateTo(0.1, -2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(-6, 0)).easing(this.myEase()),
                    )
                )
                , 8),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )
        this.runSeqAction(this.roles[2], action1);
    },

    update(dt) {
        if (this.timerStartTag) {
            this.timer += dt;
            if (this.timer >= 5 && !this.timerEndTag) {
                this.timerEndTag = true;
                this.tipsGuide();
            }
        }
    },
});
