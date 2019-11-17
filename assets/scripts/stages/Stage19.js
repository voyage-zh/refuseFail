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
        hole: {
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
        bubble1: {
            default: [],
            type: cc.Node
        },
        bubble2: {
            default: [],
            type: cc.Node
        },
        bubble3: {
            default: null,
            type: cc.Node
        },
        //目标
        target: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.float, "Bubble1", "Bubble2");

        this.addSceneChange(this.root);

        this.isSetCoal = false;

        this.target[0].on(cc.Node.EventType.TOUCH_END, () => { //卖土豆
            if (this.isPlayAni) return
            if (!this.isSetCoal) {
                this.badEnd1();
            } else {
                this.happyEnd();
            }
        })

        this.addEventToGetProp(this.prop[2], this.target[1], this.badEnd2.bind(this)) //斧头

        this.addEventToGetProp(this.prop[1], this.target[2], this.continue1.bind(this)) //铲子
    },

    //挖煤
    continue1() {
        this.float.active = false;
        this.role1[0].position = cc.v2(726.5, -213.6);
        this.role1[0].scaleX = 1;
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.role1[0].opacity = 0;
        this.role1[1].opacity = 0;

        let action0 = cc.sequence(
            cc.fadeIn(0.5),
            cc.delayTime(0.2),
            cc.repeat(
                cc.sequence(
                    cc.moveBy(0.1, cc.v2(0, 10)),
                    cc.moveBy(0.1, cc.v2(0, -10))
                ), 4
            ),
            cc.callFunc(() => {
                this.hole[0].active = false;
                this.hole[1].active = true;
            }),
            cc.delayTime(0.5),
            cc.spawn(
                cc.moveBy(0.3, cc.v2(0, -10)),
                cc.fadeOut(0.3)
            ),
            cc.delayTime(0.2)
        )

        let action1 = cc.repeat(
            cc.sequence(
                cc.moveBy(0.1, cc.v2(-5, 0)),
                cc.moveBy(0.1, cc.v2(5, 0))
            ), 5
        )

        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.prop[0].opacity = 0;
                this.prop[0].active = true;
                this.prop[0].runAction(cc.fadeIn(0.5));
            }),
            cc.fadeIn(0.5),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.pocketPush(this.prop[0], this.target[0], this.continue2.bind(this));   //煤炭入栏
            })
        )

        let nodes = [this.role1[1], this.hole[1], this.role1[0]];
        let actions = [action0, action1, action2];
        this.runSeqAction(nodes, actions);
    },

    //给煤烧地瓜
    continue2() {
        this.isPlayAni = true;
        this.prop[4].active = true;
        this.prop[4].opacity = 0;
        this.prop[4].runAction(
            cc.sequence(
                cc.fadeIn(1),
                cc.callFunc(() => {
                    this.prop[3].active = false;
                    this.prop[5].active = true;
                    this.prop[5].runAction(
                        cc.spawn(
                            cc.fadeOut(1).easing(cc.easeIn(3)),
                            cc.moveBy(1, cc.v2(0, 20))
                        )
                    )
                }),
                cc.delayTime(1.2),
                cc.callFunc(()=>{
                    this.isSetCoal = true;
                    this.isPlayAni = false;
                })
            )
        )
    },

    //直接点人
    badEnd1() {
        this.float.active = false;
        let action0 = cc.moveTo(0.5, cc.v2(-94, -126));

        let action1 = cc.delayTime(1);

        let action2 = cc.sequence(
            cc.delayTime(1.5),
            cc.callFunc(() => {
                this.bubble1[0].active = false;
            })
        )

        this.bubble2[0].opacity = 100;
        this.bubble2[1].opacity = 100;
        this.bubble2[2].opacity = 100;
        this.bubble2[3].opacity = 100;
        this.bubble2[0].scale = 0.7;
        this.bubble2[1].scale = 0.7;
        this.bubble2[2].scale = 0.7;
        this.bubble2[3].scale = 0.7;

        let action3 = cc.sequence(
            cc.callFunc(() => {
                this.bubble2[0].active = true;
                this.bubble2[0].runAction(cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.5, 1.2),
                        cc.fadeIn(0.5).easing(cc.easeOut(3))
                    ),
                    cc.scaleTo(0.1, 1),
                ));
            }),
            cc.delayTime(0.3),
            cc.callFunc(() => {
                this.bubble2[1].active = true;
                this.bubble2[1].runAction(cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.5, 1.2),
                        cc.fadeIn(0.5).easing(cc.easeOut(3))
                    ),
                    cc.scaleTo(0.1, 1),
                ));
            }),
            cc.delayTime(0.3),
            cc.callFunc(() => {
                this.bubble2[2].active = true;
                this.bubble2[2].runAction(cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.5, 1.2),
                        cc.fadeIn(0.5).easing(cc.easeOut(3))
                    ),
                    cc.scaleTo(0.1, 1),
                ));
            }),
            cc.delayTime(0.3),
            cc.callFunc(() => {
                this.bubble2[3].active = true;
                this.bubble2[3].runAction(cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.5, 1.2),
                        cc.fadeIn(0.5).easing(cc.easeOut(3))
                    ),
                    cc.scaleTo(0.1, 1),
                ));
            }),
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )

        let nodes = [this.role1[0], this.bubble1[0], this.bubble1[1], this.node];
        let actions = [action0, action1, action2, action3];
        this.runSeqAction(nodes, actions);
    },

    //砍树
    badEnd2() {
        this.float.active = false;

        this.role1[0].active = false;

        this.role1[2].active = true;
        this.role1[2].opacity = 0;

        let action0 = cc.fadeIn(0.5)

        let action1 = cc.sequence(
            cc.moveTo(1, cc.v2(425, -166)),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role2[0].active = false;
            })
        )

        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.role1[2].active = false;
            }),
            cc.moveTo(1, cc.v2(406, -179)),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1,1);
            })
        )

        let nodes = [this.role1[2], this.role2[0], this.role2[1]];
        let actions = [action0, action1, action2];
        this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        this.role1[0].position = cc.v2(-94, -126);
        this.role1[0].opacity = 0;
        this.role1[0].scaleX = -1;

        let action0 = cc.fadeIn(0.5);

        let action1 = cc.delayTime(1);

        let action2 = cc.sequence(
            cc.delayTime(1.5),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let nodes = [this.role1[0], this.bubble1[0], this.bubble1[2]];
        let actions = [action0, action1, action2];
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});