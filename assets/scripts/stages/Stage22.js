var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        drawerClose: {
            default: [],
            type: cc.Node
        },
        drawerOpen: {
            default: [],
            type: cc.Node
        },
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        effect: {
            default: null,
            type: cc.Node
        },
        water: {
            default: null,
            type: cc.Node
        },
        ZZZ: {
            default: null,
            type: cc.Node
        },
        float: {
            default: null,
            type: cc.Node
        },
        target:{
            default: null,
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.mSetFloating();
        this.setNoice();

        this.addEventToGetProp(this.prop[0], this.role1[0], this.badEnd1.bind(this)); //水
        this.addEventToGetProp(this.prop[1], this.role1[0], this.badEnd2.bind(this)); //锤子
        this.addEventToGetProp(this.prop[2], this.role1[0], this.badEnd3.bind(this)); //钟

        this.addDrawerEvent(this.drawerClose, this.drawerOpen, [null, this.prop[1], null]);

        this.isSetZCount = 0;
        this.addZZZEvent();

        this.target.on(cc.Node.EventType.TOUCH_END,()=>{
            if(this.isPlayAni) return
            this.role1[0].scaleX *= -1;
        })
    },

    //气泡放缩
    mSetFloating() {
        this.float.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.5, 1.1),
                    cc.scaleTo(0.5, 1)
                )
            )
        )

        this.prop[2].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.1, cc.v2(-5, 0)),
                    cc.moveBy(0.1, cc.v2(5, 0))
                )
            )
        )
    },

    //钟的声音
    setNoice() {
        this.effect.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.1, 1.3),
                    cc.scaleTo(0.1, 1),
                )
            )
        );

    },

    //添加ZZ事件
    addZZZEvent() {
        let dir = [8, -8, 8];

        for (let i = 0; i < 3; i++) {
            let zz = this.ZZZ.children[i];
            let action0 = cc.repeatForever(
                cc.sequence(
                    cc.moveBy(1, cc.v2(-dir[i], 0)).easing(this.myEase()),
                    cc.moveBy(1, cc.v2(dir[i], 0)).easing(this.myEase())
                )
            )
            zz.runAction(action0);

            zz.on(cc.Node.EventType.TOUCH_START, () => {
                if (this.isPlayAni || !(this.isSetZCount == i)) return;
                zz.stopAllActions();
                zz.runAction(cc.scaleTo(0.2, 1.1).easing(cc.easeOut(5)))
            });
            zz.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isPlayAni || !(this.isSetZCount == i)) return;
                zz.stopAllActions();
                this.isSetZCount++;
                zz.active = false;
                if (this.isSetZCount >= 3) {
                    this.happyEnd();
                }
            });
            zz.on(cc.Node.EventType.TOUCH_CANCEL, () => {
                if (this.isPlayAni || !(this.isSetZCount == i)) return;
                zz.stopAllActions();
                zz.runAction(
                    cc.sequence(
                        cc.scaleTo(0.1, 1),
                        cc.callFunc(() => {
                            zz.runAction(action0);
                        })
                    )
                )
            });
        }
    },

    //倒水
    badEnd1(index) {
        for (let i = 0; i < 3; i++) {
            this.ZZZ.children[i].stopAllActions();
        }
        this.role1[0].scaleX = 1;
        this.prop[0].active = true;
        this.prop[0].position = cc.v2(80, 273);

        let action0 = cc.sequence(
            cc.delayTime(0.8),
            cc.rotateTo(1, 72),
            cc.callFunc(() => {
                this.prop[0].children[0].active = false;
                this.water.active = true;
                this.water.children[0].active = true;
            }),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.water.children[1].active = true;
            }),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.water.children[2].active = true;
                this.role1[3].active = true;
            }),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.water.children[0].active = false;
                this.water.children[1].active = false;
            }),
            cc.delayTime(1.5),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )

        let nodes = [this.prop[0]];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    //锤子
    badEnd2() {
        for (let i = 0; i < 3; i++) {
            this.ZZZ.children[i].stopAllActions();
        }
        this.role1[0].scaleX = 1;
        this.prop[1].active = true;
        this.prop[1].position = cc.v2(140, 223);
        this.prop[1].rotation = -30;

        let action0 = cc.sequence(
            cc.rotateTo(1.5, 45).easing(cc.easeIn(10)),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.role1[3].active = true;
            })
        )

        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.role1[5].scale = 0.3;
            }),
            cc.scaleTo(2, 1.5),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1);
            })
        )

        let nodes = [this.prop[1], this.role1[5]];
        let actions = [action0, action1];
        this.runSeqAction(nodes, actions);
    },

    //闹钟
    badEnd3() {
        for (let i = 0; i < 3; i++) {
            this.ZZZ.children[i].stopAllActions();
        }
        this.role1[0].scaleX = 1;
        this.prop[2].active = true;
        this.prop[2].position = cc.v2(115, 7.5);

        let action0 = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role1[0].scale = 1.3;
            }),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.role1[2].active = true;
                this.role1[2].opacity = 0;
                this.role1[1].runAction(cc.fadeOut(1));
                this.role1[2].runAction(cc.fadeIn(1));
            }),
            cc.delayTime(1.2),
            cc.callFunc(() => {
                this.prop[2].stopAllActions();
                this.effect.stopAllActions();
                this.effect.active = false;
            }),
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(2);
            })
        )

        let nodes = [this.node];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        this.prop[2].stopAllActions();
        this.effect.stopAllActions();
        this.effect.active = false;
        this.float.active = false;

        let action0 = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role1[0].scale = 1.3;
                this.role1[4].active = true;
            }),
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let nodes = [this.node];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});