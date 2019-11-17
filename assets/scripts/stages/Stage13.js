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
        role1: {
            default: [],
            type: cc.Node
        },
        role2: {
            default: [],
            type: cc.Node
        },
        float: {
            default: null,
            type: cc.Node
        },
        bag: {
            default: [],
            type: cc.Node
        },
        effect: {
            default: null,
            type: cc.Node
        },
        bear: {
            default: [],
            type: cc.Node
        },
        bubble: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.float, "Bubble1", "Bubble2");

        //有5个物品
        //this.propPosInPocket = [cc.v2(-312.5, 0), cc.v2(-187.5, 0), cc.v2(-62.5, 0), cc.v2(62.5, 0), cc.v2(187.5, 0), cc.v2(312.5, 0)];
        this.propPosInPocket = [cc.v2(-300, 0), cc.v2(-150, 0), cc.v2(0, 0), cc.v2(150, 0), cc.v2(300, 0)];
        this.pocketTag = [0, 0, 0, 0, 0];

        let bagTag = 0;
        this.bag[0].on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return
            this.bag[0].active = false;
            this.bag[1].active = true;
            if (bagTag === 0) {
                this.prop[3].active = true;
                bagTag++;
            } else if (bagTag === 1) {
                this.prop[1].active = true;
                bagTag++;
            }
        })
        this.bag[1].on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return
            this.bag[1].active = false;
            this.bag[0].active = true;
        })

        this.prop[3].once(cc.Node.EventType.TOUCH_END, () => {      //手机
            this.bag[1].active = false;
            this.bag[0].active = true;
            this.pocketPush(this.prop[3], [this.role1[0], this.role2[0]], [this.badEnd2.bind(this), this.badEnd3.bind(this)]);
        }, this);

        this.addEventToGetProp(this.prop[4], this.bear[0], this.continue.bind(this))    //蜂蜜

        this.bear[0].on(cc.Node.EventType.TOUCH_END, this.badEnd4.bind(this), this);

        this.prop[8].on(cc.Node.EventType.TOUCH_END, () => {      //竹子
            if (this.isPlayAni) return
            let action2 = cc.callFunc(() => {
                this.pocketPush(this.prop[6], this.bear[0], this.badEnd5.bind(this));
            })
            this.bambooAni(action2);
            this.prop[8].off(cc.Node.EventType.TOUCH_END);
        }, this);


        this.addEventToGetProp(this.prop[0], this.role1[0], this.badEnd1.bind(this), 1);   //53
        this.addEventToGetProp(this.prop[1], this.role1[0], this.badEnd1.bind(this), 1);   //黄冈
        this.addEventToGetProp(this.prop[2], this.role1[0], this.badEnd1.bind(this), 1);   //熊


        this.InitComposeEvent(
            1,this.prop[7], 3, cc.v2(-186, 252), 
            [this.role2[0], this.role1[0]], 
            [this.happyEnd.bind(this), this.badEnd1.bind(this)],
            ()=>{
                setTimeout(()=>{
                    Manager.Alert.showFloatingTxt('恭喜获得《学霸秘籍》');
                },1000)
            }
        );

    },

    //晕眩动画
    setEffectAni(pos) {
        this.effect.active = true;
        this.effect.position = pos;
        this.effect.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.rotateTo(0.2, 180),
                    cc.rotateTo(0.2, 360),
                    cc.rotateTo(0, 0)
                )
            )
        );
    },

    //竹子动画
    bambooAni(action2) {
        this.isPlayAni = true;

        let action0 = cc.sequence(
            cc.rotateTo(0.05, 5),
            cc.repeat(
                cc.sequence(
                    cc.rotateTo(0.1, -5),
                    cc.rotateTo(0.1, 5),
                ), 5
            ),
            cc.rotateTo(0.05, 0)
        )

        let action1 = cc.fadeOut(0.2);

        let nodes = [this.prop[5], this.prop[6], this.node]
        let actions = [action0, action1, action2]
        this.runSeqAction(nodes, actions);
    },

    //熊变书
    continue() {
        this.isPlayAni = true;
        this.bear[0].runAction(
            cc.spawn(
                cc.fadeOut(0.1),
                cc.callFunc(() => {
                    this.prop[2].opacity = 100;
                    this.prop[2].scale = 0.8;
                    this.prop[2].active = true;
                    this.prop[2].runAction(
                        cc.sequence(
                            cc.spawn(
                                cc.fadeIn(0.2),
                                cc.scaleTo(0.3, 1)
                            ),
                            cc.callFunc(() => {
                                Manager.Alert.showFloatingTxt('天选少年，《王厚熊》归你了');
                                this.bear[0].active = false;
                                this.isPlayAni = false;
                            })
                        )
                    );
                })
            ),
        );
    },

    //看书？？
    badEnd1() {
        this.float.active = false;
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.setEffectAni(cc.v2(236, 242))
        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )
        this.runSeqAction(this.role1[1], action0);
    },

    //主角玩手机
    badEnd2() {
        this.float.active = false;

        let arr = [this.role1[3], this.role1[0], this.role1[4]]
        for (let i = 0; i < 3; i++) {
            arr[i].active = true;
            arr[i].runAction(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.2, cc.v2(-5, 0)).easing(this.myEase()),
                        cc.moveBy(0.2, cc.v2(5, 0)).easing(this.myEase())
                    ), 5
                )
            )
        }

        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1);
            })
        )
        this.runSeqAction(this.node, action0);
    },

    //kk玩手机
    badEnd3() {
        this.float.active = false;
        this.bubble[0].active = false;
        this.setEffectAni(cc.v2(64, 329));
        this.role2[0].active = false;
        this.role2[1].active = true;

        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(2);
            })
        )
        this.runSeqAction(this.node, action0);
    },

    //点击熊发怒
    badEnd4() {
        this.float.active = false;
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.bear[1].active = true;

        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(3);
            })
        )

        this.runSeqAction(this.node, action0);
    },
    //竹子熊发怒
    badEnd5() {
        this.float.active = false;
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.bear[1].active = true;

        let action0 = cc.sequence(
            cc.toggleVisibility(),
            cc.delayTime(0.2),
            cc.toggleVisibility(),
            cc.scaleTo(1, 1.3),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(4);
            })
        )

        this.runSeqAction(this.bubble[1], action0);
    },


    happyEnd() {
        this.float.active = false;
        this.bubble[0].active = false;
        this.role1[2].active = true;
        this.role1[5].active = true;
        this.role2[0].active = false;
        this.role2[4].active = true;

        let action0 = cc.sequence(
            cc.delayTime(0.3),
            cc.moveTo(1, cc.v2(64, 166)),
            cc.callFunc(() => {
                this.bubble[2].active = true;
                this.role2[2].active = false;
            })
        )


        let action1 = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.callFunc(() => {
                        this.role2[2].active = false;
                        this.role2[3].opacity = 255;
                    }),
                    cc.delayTime(0.5),
                    cc.callFunc(() => {
                        this.role2[2].active = true;
                        this.role2[3].opacity = 0;
                    }),
                    cc.delayTime(0.5),
                ), 3
            ),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let nodes = [this.role2[2], this.role2[3]];
        let actions = [action0, action1]

        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
