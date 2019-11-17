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
        window:{
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
        role3: {
            default: [],
            type: cc.Node
        },
        role4: {
            default: [],
            type: cc.Node
        },
        float: {
            default: [],
            type: cc.Node
        },
        other: {
            default: [],
            type: cc.Node
        },
        bubble: {
            default: [],
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
        this.setFloating(this.float[0], "bubble1", "bubble2");
        this.setFloating(this.float[1], "bubble1", "bubble2");

        this.addSceneChange(this.root);

        this.role3[0].on(cc.Node.EventType.TOUCH_END, () => {  //女生
            if (this.isPlayAni) return
            this.badEnd1();
        })

        this.other[2].on(cc.Node.EventType.TOUCH_END, () => {  //球
            if (this.isPlayAni) return
            this.happyEnd();
        })

        this.target[0].on(cc.Node.EventType.TOUCH_END, () => {  //盆栽
            if (this.isPlayAni) return
            this.continue3();
        })

        this.addEventToGetProp(this.prop[1], [this.other[1], this.target[0],this.window[1]], [this.continue1.bind(this), this.continue2.bind(this),this.badEnd3.bind(this)])    //石头

        this.addEventToGetProp(this.prop[0], this.other[0], this.badEnd2.bind(this))    //钥匙

        this.isThrowStone = false;
        this.isPlayAni = true;

        this.node.on("start", () => {
            this.float[1].active = true;
            this.setFloating(this.float[1], "bubble1", "bubble2");
            setTimeout(() => {
                this.bubble[0].active = true;
                this.isPlayAni = false;
            }, 300)
        })
    },

    //砸墙
    continue1() {
        this.prop[1].active = true;
        this.prop[1].position = cc.v2(634, 8);
        let action0 = cc.sequence(
            cc.delayTime(0.2),
            cc.bezierTo(1, [cc.v2(634, 8), cc.v2(588, 54), cc.v2(455, 71)]).easing(cc.easeOut(2)),
            cc.callFunc(() => {
                this.other[1].active = false;
                this.other[2].active = true;    //球
                this.other[3].active = true;
            }),
            cc.spawn(
                cc.moveBy(0.5, cc.v2(0, -20)),
                cc.fadeOut(0.5).easing(cc.easeIn(5))
            )
        )

        let action1 = cc.sequence(
            cc.delayTime(0.2),
            cc.moveBy(1, cc.v2(0, -300)).easing(cc.easeIn(3)),
            cc.moveBy(0.3, cc.v2(0, 50)).easing(cc.easeOut(3)),
            cc.moveBy(0.3, cc.v2(0, -50)).easing(cc.easeIn(3)),
            cc.moveBy(0.1, cc.v2(0, 10)).easing(cc.easeOut(3)),
            cc.moveBy(0.1, cc.v2(0, -10)).easing(cc.easeIn(3)),
        )

        let nodes = [this.prop[1], this.other[2]];
        let actions = [action0, action1];
        this.runSeqAction(nodes, actions);
    },

    //砸盆栽
    continue2() {
        this.isThrowStone = true;
        this.target[0].active = false;
        this.prop[1].active = true;
        this.prop[1].position = cc.v2(573, -314);
        let action0 = cc.sequence(
            cc.delayTime(0.2),
            cc.bezierTo(1, [cc.v2(573, -314), cc.v2(606, -249), cc.v2(654, -203)]),
            cc.spawn(
                cc.moveBy(0.5, cc.v2(0, -20)),
                cc.fadeOut(0.5).easing(cc.easeIn(5))
            )
        )

        let action1 = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.moveBy(0.1, cc.v2(10, 0)).easing(this.myEase()),
                    cc.moveBy(0.1, cc.v2(-10, 0)).easing(this.myEase()),
                ), 4
            ),
            cc.rotateTo(1, -76).easing(cc.easeIn(3)),
            cc.callFunc(() => {
                this.prop[0].active = true;
            })
        )
        let nodes = [this.prop[1], this.other[4]];
        let actions = [action0, action1];
        this.runSeqAction(nodes, actions);
    },

    //点盆栽
    continue3() {
        this.target[0].active = false;
        this.prop[0].position = cc.v2(746, -182);
        this.isPlayAni = true;
        this.other[4].runAction(
            cc.sequence(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.1, cc.v2(-5, 0)),
                        cc.moveBy(0.1, cc.v2(5, 0))
                    ), 5
                ),
                cc.callFunc(() => {
                    this.prop[0].active = true;
                    this.prop[0].opacity = 0;
                    this.prop[0].runAction(
                        cc.spawn(
                            cc.moveBy(0.5, cc.v2(0, -40)).easing(cc.easeIn(3)),
                            cc.fadeIn(0.5).easing(cc.easeOut(8))
                        )
                    )
                }),
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.isPlayAni = false;
                })
            )
        )
    },

    //直接点女生
    badEnd1() {
        this.float[0].active = false;
        this.float[1].active = false;
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.bubble[0].active = false;
        this.bubble[1].active = true;
        this.bubble[1].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.1, 1.3),
                    cc.scaleTo(0.1, 1)
                )
            )
        )

        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                this.bubble[1].stopAllActions();
                this.gameCtrl.toBadEnd(0);
            })
        )

        this.runSeqAction(this.node, action0)
    },

    //开门
    badEnd2() {
        this.bubble[0].active = false;
        this.role1[0].position = cc.v2(777, -174);
        this.role1[0].opacity = 0;

        let action0 = cc.fadeIn(0.5);

        let action1 = cc.sequence(
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.other[0].active = false;
                this.role2[0].active = true;
            }),
            cc.delayTime(1.5),
            cc.callFunc(() => {
                this.role1[0].active = false;
                this.role2[0].active = false;
            }),
            cc.toggleVisibility(),
            cc.moveTo(1.5, cc.v2(1071, -174)),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                if (this.isThrowStone) {
                    this.gameCtrl.toBadEnd(1, 1);
                } else {
                    this.gameCtrl.toBadEnd(2, 1);
                }
            })
        );

        let nodes = [this.role1[0], this.role2[1]];
        let actions = [action0, action1];
        this.runSeqAction(nodes, actions)
    },

    //砸左窗
	badEnd3() {
        let prop = this.prop[1];
		this.float[0].active = false;
		this.float[1].active = false;
		this.bubble[0].active = false;
		prop.active = true;
		prop.position = cc.v2(49, -34);

		let action0 = cc.sequence(
			cc.bezierTo(0.5, [cc.v2(49, -34), cc.v2(99, 68), cc.v2(210, 81)]),
			cc.callFunc(() => {
				this.bubble[4].position = cc.v2(270, 165);
				this.bubble[4].active = true;
				this.bubble[4].runAction(cc.scaleTo(0.5, 1.1));
                this.window[0].position = cc.v2(210, 81);
                this.window[0].active = true;
			}),
			cc.spawn(
				cc.moveBy(0.5, cc.v2(0, -40)).easing(cc.easeIn(3)),
				cc.fadeOut(0.5).easing(cc.easeIn(10))
			),
			cc.callFunc(() => {
				this.bubble[4].active = false;
				prop.active = false;
			})
		)

		let action1 = cc.sequence(
			cc.callFunc(() => {
				this.role2[0].position = cc.v2(444, -142);
				this.role2[1].position = cc.v2(104, -246);
			}),
			cc.moveTo(0.5, cc.v2(308, -142)),
			cc.delayTime(1)
		)

		let action2 = cc.sequence(
			cc.callFunc(() => {
				this.role1[0].active = false;
                this.role2[0].active = false;
                this.role3[0].position = cc.v2(-100,-221);
                this.role3[1].active = true;
			}),
			cc.moveTo(1.5, cc.v2(276, -167)),
			cc.fadeOut(0.3),
			cc.callFunc(() => {
                this.gameCtrl.toBadEnd(3, 1);
			})
		)

		let nodes = [prop, this.role2[0], this.role2[1]];
		let actions = [action0, action1, action2];
		this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        let ballPos = [cc.v2(492, -84), cc.v2(641.9, -207.7)];
        let ball = this.other[2];
        this.role4[0].opacity = 0;

        let action0 = cc.fadeOut(0.5);

        let action1 = cc.sequence(
            cc.callFunc(() => {
                ball.position = ballPos[0],
                    ball.runAction(cc.fadeIn(0.5));
            }),
            cc.fadeIn(0.5),
        )

        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.bubble[2].active = true;
                this.root.runAction(
                    cc.repeatForever(
                        cc.sequence(
                            cc.callFunc(() => {
                                ball.position = ballPos[1];
                                this.role4[0].active = false;
                                this.role4[1].active = true;
                            }),
                            cc.delayTime(0.5),
                            cc.callFunc(() => {
                                ball.position = ballPos[0];
                                this.role4[0].active = true;
                                this.role4[1].active = false;
                            }),
                            cc.delayTime(0.5),
                        )
                    )
                )
            }),
            cc.delayTime(2),
            cc.callFunc(() => {
                this.bubble[2].active = false;
                this.bubble[3].active = true;
            }),
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )


        let nodes = [ball, this.role4[0], this.node];
        let actions = [action0, action1, action2];
        this.runSeqAction(nodes, actions)
    }


    // update (dt) {},
});
