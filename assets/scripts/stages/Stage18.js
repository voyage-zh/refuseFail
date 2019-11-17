var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        root: {
            default: null,
            type: cc.Node
        },
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        cabinetClose: {
            default: [],
            type: cc.Node
        },
        cabinetOpen: {
            default: [],
            type: cc.Node
        },
        gameBox: {
            default: [],
            type: cc.Node
        },
        bug: {
            default: [],
            type: cc.Node
        },
        //气泡
        float: {
            default: null,
            type: cc.Node
        },
        bubble: {
            default: null,
            type: cc.Node
        },
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        role2: {
            default: [],
            type: cc.Node
        },
        role3: {
            default: [],
            type: cc.Node
        },
        target: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.addSceneChange(this.root);

        this.setFloating(this.float, "bubble1", "bubble2");

        this.addCabinetEvent(this.cabinetClose[0], this.cabinetOpen[0], this.prop[2]);
        this.addCabinetEvent(this.cabinetClose[1], this.cabinetOpen[1], null);
        this.addCabinetEvent(this.cabinetClose[2], this.cabinetOpen[2], null);
        this.addCabinetEvent(this.cabinetClose[3], this.cabinetOpen[3], null);

        this.setBug();

        this.addEventToGetProp(this.prop[1], this.target[0], this.badEnd1.bind(this));   //拍子
        this.addEventToGetProp(this.prop[2], [this.role1[0], this.role2[0]], [this.badEnd2.bind(this), this.continue1.bind(this)]);   //薯片
        this.addEventToGetProp(this.prop[0], this.role1[0], this.continue2.bind(this));   //游戏机

    },

    //给鸡头薯片
    continue1() {
        this.role2[0].active = false;
        this.role2[1].active = true;
        this.role2[1].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.2, 1.1),
                    cc.scaleTo(0.2, 1)
                )
            ),
        )

        this.prop[0].active = true;
    },

    //开游戏机
    continue2() {
        this.isPlayAni = true;
        this.float.active = false;

        this.gameBox[0].active = true;
        this.gameBox[2].active = true;

        let select = this.gameBox[1];
        select.active = true;

        this.bug[1].setSiblingIndex(99);

        let isSelectA = true;
        let changeSelect = () => {
            if (isSelectA) {
                select.position = cc.v2(28.2, -48);
                isSelectA = false;
            } else {
                select.position = cc.v2(28.2, 12.3);
                isSelectA = true;
            }
        }

        this.target[1].on(cc.Node.EventType.TOUCH_END, () => {
            Manager.playBtnSound();
            changeSelect();
        })
        this.target[2].on(cc.Node.EventType.TOUCH_END, () => {
            Manager.playBtnSound();
            changeSelect();
        })
        this.target[3].on(cc.Node.EventType.TOUCH_END, () => {
            Manager.playBtnSound();
            if (isSelectA) {
                this.badEnd3();
            } else {
                this.happyEnd();
            }
        })
    },

    //蚊子
    setBug() {
        let line1 = this.bug[0].children[0];
        let line2 = this.bug[0].children[1];
        let bug1 = this.bug[1].children[0];
        let bug2 = this.bug[1].children[1];
        let bug3 = this.bug[1].children[2];
        let lineDelay = 0.5;
        this.bug[0].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.callFunc(() => {
                        line1.active = true;
                        line2.active = false;
                    }),
                    cc.delayTime(lineDelay),
                    cc.callFunc(() => {
                        line1.active = false;
                        line2.active = true;
                    }),
                    cc.delayTime(lineDelay)
                )

            )
        );

        bug1.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.8, cc.v2(-30, 0)),
                    cc.moveBy(0.8, cc.v2(30, 0))
                )
            )
        )
        bug2.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.5, cc.v2(30, 0)),
                    cc.moveBy(0.5, cc.v2(-30, 0))
                )
            )
        )
        bug3.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.6, cc.v2(-50, 0)),
                    cc.moveBy(0.6, cc.v2(50, 0))
                )
            )
        )
    },

    //蚊子加速
    setBug2() {
        let bug1 = this.bug[1].children[0];
        let bug2 = this.bug[1].children[1];
        let bug3 = this.bug[1].children[2];

        bug1.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.1, cc.v2(-60, 0)),
                    cc.moveBy(0.1, cc.v2(60, 0))
                )
            )
        )
        bug2.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.15, cc.v2(60, 0)),
                    cc.moveBy(0.15, cc.v2(-60, 0))
                )
            )
        )
        bug3.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.2, cc.v2(-60, 0)),
                    cc.moveBy(0.2, cc.v2(60, 0))
                )
            )
        )
    },

    //拖走坏结局
    badEnd1() {
        this.prop[1].position = cc.v2(-11.8, -80.3);
        this.prop[1].rotation = 24;
        this.float.active = false;

        let action0 = cc.sequence(
            cc.delayTime(0.5),
            cc.rotateTo(0.1, -20),
            cc.callFunc(() => {
                this.bubble.active = true;
                this.bubble.runAction(cc.scaleTo(0.5, 1.4));
            }),
            cc.delayTime(0.8),
            cc.rotateTo(0.5, 24),
            cc.rotateTo(0.1, -20),
            cc.callFunc(() => {
                this.bubble.scale = 1;
                this.bubble.active = true;
                this.bubble.runAction(cc.scaleTo(0.5, 1.4));
            }),
            cc.delayTime(1),
        )

        let action1 = cc.sequence(
            cc.moveTo(1, cc.v2(296, -108)),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.role3[0].active = false;
                this.bubble.active = false;
                this.role1[0].active = false;
                this.role1[3].active = true;
                this.bug[0].active = false;
                this.prop[0].active = false;
                this.prop[1].active = false;
            })
        )

        let action2 = cc.sequence(
            cc.moveTo(1.5, cc.v2(294, -142)),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0,1);
            })
        )

        let nodes = [this.prop[1], this.role3[0], this.role3[1]];
        let actions = [action0, action1, action2];
        this.runSeqAction(nodes, actions);
    },

    //吃薯片坏结局
    badEnd2() {
        this.float.active = false;
        this.role1[0].active = false;
        this.role1[2].active = true;

        this.bug[0].position = cc.v2(-172, -56);

        let action = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.scaleTo(0.2, -1.1, 1.1),
                    cc.scaleTo(0.2, -1, 1)
                ), 4
            ),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1);
            })
        )

        this.runSeqAction(this.role1[2], action);
    },

    //游戏机退出
    badEnd3() {
        this.gameBox[0].active = false;
        this.gameBox[1].active = false;
        this.gameBox[2].active = false;
        this.setBug2();
        let action0 = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(2);
            })
        )

        this.runSeqAction(this.node, action0);
    },

    happyEnd() {
        let action0 = cc.sequence(
            cc.fadeOut(1),
            cc.callFunc(() => {
                this.gameBox[0].active = false;
                this.gameBox[1].active = false;
                this.gameBox[2].active = false;
                this.bug[0].active = false;
            }),
        )

        let action1 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )
        let nodes = [this.bug[1], this.role1[1]];
        let actions = [action0, action1];
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
