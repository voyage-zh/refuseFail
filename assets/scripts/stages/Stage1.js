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
        HEImg: {
            default: null,
            type: cc.SpriteFrame
        },
        //引导
        guide: {
            default: null,
            type: cc.Node
        },
        line: {
            default: null,
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.roles[0], "xie1", "xie2");

        this.myAddEventToGetProp(this.prop[0], this.target[0], this.happyEnd.bind(this)); //可乐

        this.guide.active = false;
        this.node.on('guide', () => {
            this.showGuide1();
        })
    },

    //新手引导
    showGuide1() {
        this.guide.active = true;

        let content = cc.find("Content", this.guide);
        let target = cc.find("Target", this.guide);
        let circle = cc.find("Circle", this.guide);


        //定时器缩圈
        let circle2Size = cc.v2(272, 185);
        let time = 800;
        let singleTime = 20;
        let stepX = (circle.width - circle2Size.x) / (time / singleTime);
        let stepY = (circle.height - circle2Size.y) / (time / singleTime);
        this.sv = setInterval(() => {
            if (time === 0 || !circle) {
                clearInterval(this.sv);
            }
            circle.width -= stepX;
            circle.height -= stepY;
            time -= singleTime;
        }, singleTime)

        //上下浮动
        content.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.5, cc.v2(0, -15)).easing(cc.easeInOut(3)),
                    cc.moveBy(0.5, cc.v2(0, 15)).easing(cc.easeInOut(3))
                )
            )
        )

        let label = cc.find("Content/Label", this.guide).getComponent(cc.Label);
        let continueNode = cc.find("Content/Continue", this.guide);
        let finger = cc.find("Finger", this.guide);

        //文字打字
        this.typingAni(label, "仔细看气泡，\n他又不会做题啦！", () => {
            continueNode.active = true;
            finger.active = true;
            finger.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.scaleTo(0.2, 0.8),
                        cc.scaleTo(0.2, 1),
                        cc.delayTime(0.1)
                    )
                )
            )
        });

        //点击换字
        target.once(cc.Node.EventType.TOUCH_END, () => {
            finger.stopAllActions();
            continueNode.active = false;
            finger.active = false;
            this.typingAni(label, "他不会写\"谢\"字", () => {
                continueNode.active = true;
                finger.active = true;
                finger.runAction(
                    cc.repeatForever(
                        cc.sequence(
                            cc.scaleTo(0.2, 0.8),
                            cc.scaleTo(0.2, 1),
                            cc.delayTime(0.1)
                        )
                    )
                )
            });
            target.once(cc.Node.EventType.TOUCH_END, () => {
                circle.active = false;
                continueNode.active = false;
                finger.active = false;
                this.showGuide2();
            }, this)
        }, this)

    },

    showGuide2() {
        let light = cc.find("Light", this.guide);
        let content = cc.find("Content", this.guide);
        content.position = cc.v2(134, -15);
        let role = cc.find("Content/Role", this.guide);
        role.scale = 0.7;
        let frame = cc.find("Content/Frame", this.guide);
        frame.position = cc.v2(35, 15);
        frame.width = 357;
        frame.height = 136;
        let labelNode = cc.find("Content/Label", this.guide);
        let label = labelNode.getComponent(cc.Label);
        labelNode.position = cc.v2(55, 35);

        light.active = true;
        light.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.3, 1.1),
                    cc.scaleTo(0.3, 1)
                )
            )
        );

        let finger = cc.find("Finger", this.guide);
        this.typingAni(label, "这里有一瓶饮料！\n点它！");
        finger.active = true;
        finger.position = cc.v2(241,146);
        finger.scale = 0.6;
        finger.stopAllActions();
            finger.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.scaleTo(0.2, 0.4),
                        cc.scaleTo(0.2, 0.6),
                        cc.delayTime(0.1)
                    )
                )
            )

        this.prop[0].once(cc.Node.EventType.TOUCH_END, () => {
            finger.active = false;
            finger.stopAllActions();
            this.line.active = true;
            light.active = false;
            this.line.runAction(this.setLineOfSight(this.line, cc.v2(-241, -198), -52, 30, 6, 0.3, 100))
            content.position = cc.v2(-43, -388);
            content.stopAllActions();
            content.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.callFunc(() => {
                            content.opacity = 0;
                        }),
                        cc.fadeIn(0.2),
                        cc.moveTo(1, cc.v2(51, -249)),
                        cc.delayTime(0.3),
                        cc.moveTo(0, cc.v2(-43, -388)),
                    )
                )
            )
            role.scaleX = -0.7;
            this.typingAni(label, "把饮料按住拖给他");
        })
    },

    myAddEventToGetProp(propNode, targetNode, trueCallback) {
        propNode.once(cc.Node.EventType.TOUCH_END, () => {
            propNode.active = false;
            let propName = propNode.name;
            let prop = cc.find(propName, this.pocket);
            prop.active = true;
            this.pocketTag[0] = propName
            prop.position = this.propPosInPocket[0];
            prop.opacity = 150;
            prop.scale = 0.7;
            prop.runAction(
                cc.sequence(
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.scaleTo(0.5, 1)
                    ),
                    cc.callFunc(() => {
                        //动作结束回调注册拖拽事件
                        this.propDragEvent(prop, targetNode, trueCallback);
                    })
                )
            )
        }, this);
    },

    happyEnd() {
        this.guide.active = false;
        let action1 = cc.sequence(
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
            ),
            cc.callFunc(() => {
                //结束弹窗
                this.gameCtrl.toHappyEnd(0, this.HEImg);
            })
        )
        let nodes = [this.roles[0], this.roles[1]];
        let actions = [null, action1]

        this.runSeqAction(nodes, actions);
    },

    onDestroy() {
        clearInterval(this.sv);
    }
    // update (dt) {},
});
