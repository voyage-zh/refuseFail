var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        card: {
            default: null,
            type: cc.Node
        },
        //角色
        role1: {
            default: null,
            type: cc.Node
        },
        role1: {
            default: [],
            type: cc.Node
        },
        role2: {
            default: [],
            type: cc.Node
        },
        wind: {
            default: [],
            type: cc.Node
        },
        window: {
            default: [],
            type: cc.Node
        },
        select: {
            default: [],
            type: cc.Node
        },
        answer: {
            default: [],
            type: cc.Node
        },
        answerPos: {
            default: [],
            type: cc.Vec2
        },
        Float: {
            default: null,
            type: cc.Node
        },
        bag: {
            default: [],
            type: cc.Node
        },
        //目标区域
        target: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.Float, "bubble1", "bubble2");

        this.answerPos = [cc.v2(52, 316), cc.v2(176, 316), cc.v2(310, 316)]

        this.isLookCard = false;
        this.isLookHair = false;

        for (let i = 0; i < 3; i++) {
            this.select[i].on(cc.Node.EventType.TOUCH_START, () => {
                if (this.isPlayAni) return;
                this.select[i].runAction(cc.scaleTo(0.1, 1.3));
            });
            this.select[i].on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isPlayAni) return;
                this.select[i].runAction(cc.scaleTo(0.5, 1));
                this.continue1(i);
            }, this);
            this.select[i].on(cc.Node.EventType.TOUCH_CANCEL, () => {
                if (this.isPlayAni) return;
                this.select[i].runAction(cc.scaleTo(0.5, 1));
            }, this);
        }

        let bagTag = 0; //两次取物品
        this.bag[0].on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return
            this.bag[0].active = false;
            this.bag[1].active = true;
            if (bagTag === 0) {
                this.prop[0].active = true;
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

        this.target[1].on(cc.Node.EventType.TOUCH_END, () => { //窗
            if (this.isPlayAni) return
            this.continue4();

        });

        this.addEventToGetProp(this.prop[0], this.target[0], this.continue2.bind(this)); //望远镜
        this.addEventToGetProp(this.prop[1], [this.target[2], this.target[0]], [this.continue3.bind(this), this.badEnd2.bind(this)]); //红薯
    },

    //选择答案分支
    continue1(index) {
        if (this.isLookHair && index == 0) {
            this.happyEnd();
        } else {
            this.badEnd1(index);
        }
    },

    //对错通用动画
    commonAction() {
        let action = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.fadeIn(0.2).easing(cc.easeOut(3)),
                    cc.fadeOut(0.2).easing(cc.easeIn(3)),
                ), 2),
            cc.fadeIn(0.2).easing(cc.easeOut(3)),
            cc.delayTime(0.5)
        )
        return action
    },

    //显示工作牌
    continue2() {
        this.card.scale = 0.5;
        this.card.opacity = 100;
        this.card.active = true;
        this.card.runAction(
            cc.sequence(
                cc.spawn(
                    cc.fadeIn(0.3),
                    cc.scaleTo(0.3, 1)
                ),
                cc.callFunc(() => {
                    this.isLookCard = true;
                })
            )
        )
    },

    //放屁
    continue3() {
        let action0 = cc.sequence(    //吃红薯
            cc.repeat(
                (
                    cc.sequence(
                        cc.scaleTo(0.2, 1.1),
                        cc.scaleTo(0.2, 1)
                    )
                ), 4
            ),
            cc.callFunc(() => {
                this.role1[2].active = true;
            })
        )

        let action1 = cc.spawn(        //放屁
            cc.moveTo(1.5, cc.v2(157.9, 6)),
            cc.fadeOut(1.5).easing(cc.easeIn(5)),
            cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.role1[1].active = true;
                    this.role1[1].opacity = 0;
                    this.role1[1].runAction(cc.fadeIn(1));
                }),
                cc.delayTime(1.5)
            )
        )

        let action2 = cc.sequence(        //主任开窗
            cc.callFunc(() => {
                this.card.active = false;
                this.role2[1].parent = this.role2[0];
                this.role2[1].position = cc.v2(-13, 164);
            }),
            cc.moveTo(0.5, cc.v2(-194, 208)),
            cc.callFunc(() => {
                this.window[0].active = false;
                this.window[1].active = true;
            })
        )

        let action3 = cc.sequence(    //刮风掉头发
            cc.callFunc(() => {
                let windSprite = this.wind[0].getComponent(cc.Sprite);
                this.wind[0].active = true;
                setTimeout(() => {
                    windSprite.fillStart = 0.83;
                    setTimeout(() => {
                        windSprite.fillStart = 0.37;
                        setTimeout(() => {
                            windSprite.fillStart = 0;
                        }, 500)
                    }, 500)
                }, 500)
                this.wind[1].active = true; //树叶
                this.wind[1].runAction(
                    cc.spawn(
                        cc.sequence(
                            cc.rotateTo(0.7, 180),
                            cc.rotateTo(0.7, 360)
                        ),
                        cc.bezierTo(1.5, [cc.v2(-92, 388), cc.v2(-152, 204), cc.v2(-341, 39)])
                    )
                )
            }),
            cc.delayTime(1.5),
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
                ), 5
            ),
            cc.spawn(
                cc.jumpBy(1, cc.v2(-100, -400), 120, 1),
                cc.rotateTo(1, -180)
            ),
            cc.callFunc(() => {
                this.wind[0].active = false;
                this.isLookHair = true;
            })
        )

        let nodes = [this.role1[0], this.role1[2], this.role2[0], this.role2[1]];
        let actions = [action0, action1, action2, action3];
        this.runSeqAction(nodes, actions);
    },

    //点窗
    continue4() {
        this.isPlayAni = true;
        this.window[0].runAction(
            cc.sequence(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.1, cc.v2(-5, 0)),
                        cc.moveBy(0.1, cc.v2(5, 0))
                    ), 5
                ),
                cc.callFunc(() => {
                    this.badEnd2(true);
                })
            )
        )
    },

    //选错坏结局
    badEnd1(index) {
        let pos = this.answerPos[index];
        this.answer[1].position = pos;
        this.answer[1].active = true;
        this.answer[1].opacity = 0;
        let action1 = cc.sequence(
            this.commonAction(),
            cc.callFunc(() => {
                if (this.isLookHair) {
                    this.gameCtrl.toBadEnd(2);
                } else if (this.isLookCard) {
                    this.gameCtrl.toBadEnd(1);
                } else {
                    this.gameCtrl.toBadEnd(0);
                }
            })
        )

        this.answer[1].runAction(action1);
    },

    //给老师红薯或窗
    badEnd2(bool) {
        this.card.active = false;

        this.role2[0].active = false;
        this.role2[2].active = true;

        let action = cc.sequence(
            cc.toggleVisibility(),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role2[2].active = false;
                this.role1[0].active = false;
                this.role1[4].active = true;
            }),
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.role2[1].parent = this.role2[3];
                this.role2[1].position = cc.v2(-119, 191);
            }),
            cc.moveTo(1.5, cc.v2(-322, 44)),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                if (bool) { //点窗
                    this.gameCtrl.toBadEnd(4, 1);
                } else { //红薯
                    this.gameCtrl.toBadEnd(3, 1);
                }
            })
        )

        this.runSeqAction(this.role2[3], action);

    },

    happyEnd() {
        this.role1[1].active = false;
        this.role1[3].active = true;
        this.answer[0].active = true;
        this.answer[0].opacity = 0;
        let action1 = cc.sequence(
            this.commonAction(),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        this.answer[0].runAction(action1);
    }


    // update (dt) {},
});