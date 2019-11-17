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
        other: {
            default: [],
            type: cc.Node
        },
        select: {
            default: null,
            type: cc.Node
        },
        answer: {
            default: [],
            type: cc.Node
        },
        bubble: {
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
        this.setFloating(this.float, "bubble1", "bubble2");
        this.float.active = false;

        this.addSceneChange(this.root);

        this.other[2].on(cc.Node.EventType.TOUCH_END, () => {  //水池
            if (this.isPlayAni) return
            this.badEnd1();
        })

        this.addEventToGetProp(this.prop[0], this.other[2], this.continue1.bind(this))    //鱼竿

        this.addEventToGetProp(this.prop[1], this.role2[0], this.badEnd2.bind(this))    //石头

        this.setAnswerEvent();      //选项框及答案事件

        this.node.on("start", () => {
            this.startAni();
        })
    },

    //开场动画
    startAni() {
        this.isPlayAni = true;
        this.other[0].runAction(
            cc.sequence(
                cc.callFunc(() => {
                    let windSprite = this.other[1].getComponent(cc.Sprite);  //风
                    this.other[1].active = true;
                    setTimeout(() => {
                        windSprite.fillStart = 0.83;
                        setTimeout(() => {
                            windSprite.fillStart = 0.37;
                            setTimeout(() => {
                                windSprite.fillStart = 0;
                            }, 500)
                        }, 500)
                    }, 300)
                }),
                cc.delayTime(1.3),
                cc.spawn(
                    cc.moveBy(1.5, cc.v2(600, -50)),
                    cc.rotateTo(1.5, 100)
                ),
                cc.callFunc(() => {
                    this.other[1].active = false;
                    this.isPlayAni = false;
                    this.other[0].active = false;
                    this.float.active = true;
                })
            )
        )
    },

    //选项框及答案事件
    setAnswerEvent() {
        let dragX = 0;  //拖动选项则取消answer end事件
        for (let i = 0; i < 3; i++) {     //选项
            this.answer[i].on(cc.Node.EventType.TOUCH_START, () => {
                if (this.isPlayAni) return;
                this.answer[i].runAction(cc.scaleTo(0.1, 1.1));
            });
            this.answer[i].on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isPlayAni ) return;
                this.answer[i].runAction(cc.scaleTo(0.5, 1));
                if(dragX>80) return
                this.continue2(i);
                this.isPlayAni = true;
            }, this);
            this.answer[i].on(cc.Node.EventType.TOUCH_CANCEL, () => {
                if (this.isPlayAni) return;
                this.answer[i].runAction(cc.scaleTo(0.5, 1));
            }, this);
        }

        //拖动选项框
        let isTouch = false;
        this.select.on(cc.Node.EventType.TOUCH_START, (event) => {  //按下修改标志
            if (this.isPlayAni) return;
            dragX = 0;
            isTouch = true;
        });
        this.select.on(cc.Node.EventType.TOUCH_MOVE, (event) => {   //移动逻辑
            if (!isTouch) return; //只有当用户按下才能拖拽
            //获取距离上一次点的信息
            let delta = event.getDelta();
            dragX+= Math.abs(delta.x);
            //移动节点
            if ((this.select.width <= 491 && delta.x > 0) || (this.select.width >= 682 && delta.x < 0)) {
                return
            }
            let mWidth = this.select.width - delta.x;
            if (mWidth <= 491) {
                this.select.width = 491;
                this.other[4].width = 486;
                this.other[4].x = -491;
            } else if (mWidth >= 682) {
                this.select.width = 682;
                this.other[4].width = 677;
                this.other[4].x = -682;
            } else {
                this.select.width -= delta.x*0.8;
                this.other[4].width -= delta.x*0.8;
                this.other[4].x += delta.x*0.8;
            }
        });
        function touchEnd() {
            isTouch = false;
            dragX = 0;
        };
        this.select.on(cc.Node.EventType.TOUCH_END, (event) => {    //当抬起的时候结束逻辑
            touchEnd();
        });
        this.select.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {//移出屏幕添加结束逻辑
            touchEnd();
        });
    },

    //钓鱼
    continue1() {
        this.prop[0].position = cc.v2(655, -116);
        this.prop[0].scale = 2;
        this.prop[0].rotation = 0;
        this.prop[0].opacity = 0;
        this.prop[0].setSiblingIndex(this.other[1].getSiblingIndex());
        this.role2[0].opacity = 0;
        let action0 = cc.sequence(
            cc.fadeIn(1).easing(cc.easeOut(12)),
            cc.callFunc(() => {
                this.spriteToShow(this.other[3], 1, "fillStart", 1, 0);
            }),
            cc.delayTime(1),
        )
        let actioin1 = cc.sequence(
            cc.fadeIn(0.3),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.prop[0].runAction(cc.fadeOut(0.2));
                this.other[3].runAction(cc.fadeOut(0.2));
                this.bubble.active = true;
                this.select.active = true;
                this.float.active = false;
            })
        )

        let nodes = [this.prop[0], this.role2[0]];
        let actions = [action0, actioin1];
        this.runSeqAction(nodes, actions)
    },

    //选择答案分支
    continue2(index) {
        if (index == 2) {
            this.happyEnd();
        } else {
            this.badEnd3(index);
        }
    },

    //跳池
    badEnd1() {
        this.role1[0].position = cc.v2(591, -187);
        this.role1[0].opacity = 0;

        let action0 = cc.sequence(
            cc.fadeIn(0.5),
            cc.delayTime(0.2),
            cc.jumpBy(1, cc.v2(130), 50, 1),
            cc.spawn(
                cc.moveBy(0.5, cc.v2(0, -20)),
                cc.fadeOut(0.5).easing(cc.easeIn(5))
            ),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0, 2);
            })
        )

        this.runSeqAction(this.role1[0], action0)
    },

    //砸鱼
    badEnd2() {
        this.float.active = false;
        this.bubble.active = false;

        this.prop[1].setSiblingIndex(this.bubble.getSiblingIndex());
        this.prop[1].position = cc.v2(597, -212);
        this.prop[1].active = true;

        let action0 = cc.sequence(
            cc.delayTime(0.2),
            cc.bezierTo(1, [cc.v2(597, -212), cc.v2(722, -119), cc.v2(819, -203)]),
            cc.spawn(
                cc.moveBy(0.5, cc.v2(0, -20)),
                cc.fadeOut(0.5).easing(cc.easeIn(5))
            ),
            cc.delayTime(0.1),
        )
        let action1 = cc.sequence(
            cc.callFunc(() => { this.role2[0].runAction(cc.fadeOut(1)) }),
            cc.spawn(
                cc.moveBy(2, cc.v2(0, 50)),
                cc.fadeOut(2).easing(cc.easeIn(12))
            ),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1);
            })
        )

        let nodes = [this.prop[1], this.role2[1]];
        let actions = [action0, action1];
        this.runSeqAction(nodes, actions)
    },

    //结局通用动画
    commonAction() {
        let action = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.fadeIn(0.2).easing(cc.easeOut(3)),
                    cc.fadeOut(0.2).easing(cc.easeIn(3)),
                )
                , 2),
            cc.fadeIn(0.2).easing(cc.easeOut(3)),
            cc.delayTime(0.5)
        )
        return action
    },

    //选错答案
    badEnd3(index) {
        this.float.active = false;
        let pos = [cc.v2(140.6, 0), cc.v2(359.8, 0)];
        this.answer[4].position = pos[index];
        this.answer[4].active = true;
        this.answer[4].opacity = 0;
        let action1 = cc.sequence(
            this.commonAction(),
            cc.callFunc(() => {
                if (index) {
                    this.gameCtrl.toBadEnd(3);
                } else {
                    this.gameCtrl.toBadEnd(2);
                }
            })
        )

        this.runSeqAction(this.answer[4], action1);
    },

    happyEnd() {
        this.float.active = false;
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.answer[3].active = true;
        this.answer[3].opacity = 0;
        let action1 = cc.sequence(
            this.commonAction(),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        this.runSeqAction(this.answer[3], action1);
    }


    // update (dt) {},
});
