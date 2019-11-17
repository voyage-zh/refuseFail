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

        this.target[0].on(cc.Node.EventType.TOUCH_END, () => {  //门
            if (this.isPlayAni) return
            this.badEnd1();
        })

        this.target[1].on(cc.Node.EventType.TOUCH_END, () => {  //树
            if (this.isPlayAni) return
            this.badEnd2();
        })

        this.addEventToGetProp(this.prop[0], this.target[3], this.continue.bind(this))    //梯子

        this.isOpenGuide = false;
        //提示引导
        this.node.on('guide', () => {
            this.tipsGuide1();
            this.isOpenGuide = true;
        })

    },

    //提示引导1,向右
    tipsGuide1(){
        let content = cc.find("Content1",this.node);
        this.guideContent = content;
        let labelNode = cc.find("Label",content);
        content.active = true;
        content.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.5,cc.v2(0,-15)).easing(cc.easeInOut(3)),
                    cc.moveBy(0.5,cc.v2(0,15)).easing(cc.easeInOut(3))
                )
            )
        )
        this.typingRichAni(labelNode,"<color= red>点击</color>或<color= red>滑动</color>切换场景");
    },
    

    //提示引导2,看提示
    tipsGuide2(){
        let content = cc.find("Content2",this.node);
        let label = cc.find("Label",content).getComponent(cc.Label);
        content.active = true;
        content.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.5,cc.v2(0,-15)).easing(cc.easeInOut(3)),
                    cc.moveBy(0.5,cc.v2(0,15)).easing(cc.easeInOut(3))
                )
            )
        )
        this.typingAni(label,"不会玩？看提示！");
        this.gameCtrl.tipsGuide(()=>{content.active = false});
        content.once(cc.Node.EventType.TOUCH_END,()=>{content.active = false});
    },

    //放梯子
    continue() {
        this.prop[0].position = cc.v2(974, -35);
        this.prop[0].scale = 1.3;
        this.prop[0].rotation = 0;
        this.prop[0].active = true;
        this.prop[0].on(cc.Node.EventType.TOUCH_END, ()=>{
            if(this.isPlayAni) return
            this.happyEnd();
            this.prop[0].off(cc.Node.EventType.TOUCH_END);
        });
    },

    //直接点门
    badEnd1() {
        this.float.active = false;
        let action0 = cc.moveTo(0.5, cc.v2(120, -189));

        let action1 = cc.sequence(
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.role2[1].active = true;
                this.role2[1].scale = 1.3;
            }),
            cc.delayTime(1),
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.role1[0].active = false;
                this.role2[1].active = false;
            }),
            cc.moveTo(1, cc.v2(-63, -72)),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0,1);
            })
        )

        let nodes = [this.role1[0], this.role2[2]];
        let actions = [action0, action1];
        this.runSeqAction(nodes, actions);
    },

    //摇树
    badEnd2() {
        this.float.active = false;

        this.role1[0].active = false;

        this.role1[1].position = cc.v2(536, -185);
        this.role1[1].opacity = 0;

        let action0 = cc.sequence(
            cc.fadeIn(0.5),
            cc.moveBy(0.1, cc.v2(0, 20)),
            cc.moveBy(0.1, cc.v2(0, -20)),
            cc.moveBy(0.1, cc.v2(0, 20)),
            cc.moveBy(0.1, cc.v2(0, -20)),
            cc.delayTime(0.2)
        )

        let action1 = cc.sequence(
            cc.scaleTo(0.1, 1.2),
            cc.rotateTo(0.05, 20),
            cc.repeat(
                cc.sequence(
                    cc.rotateTo(0.1, -20),
                    cc.rotateTo(0.1, 20),
                ), 5
            ),
            cc.rotateTo(0.05, 0),
        )

        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.prop[1].opacity = 0;
            }),
            cc.fadeIn(0.3),
            cc.callFunc(() => {
                this.role1[1].active = false;
                this.role1[2].active = true;
                this.prop[1].children[0].runAction(
                    cc.repeatForever(
                        cc.sequence(
                            cc.moveBy(0.5, cc.v2(-20, 0)),
                            cc.moveBy(0.5, cc.v2(20, 0))
                        )
                    )
                );
                this.prop[1].children[1].runAction(
                    cc.repeatForever(
                        cc.sequence(
                            cc.moveBy(0.5, cc.v2(20, 0)),
                            cc.moveBy(0.5, cc.v2(-20, 0))
                        )
                    )
                );
            }),
            cc.moveTo(2, cc.v2(1004, -58)),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1);
            })
        )

        let nodes = [this.role1[1], this.prop[2], this.prop[1]];
        let actions = [action0, action1, action2];
        this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        this.float.active = false;

        let action0 = cc.sequence(
            cc.callFunc(() => {
                this.role1[1].opacity = 0;
            }),
            cc.fadeIn(0.3),
            cc.spawn(
                cc.repeat(
                    cc.sequence(
                        cc.scaleTo(0.4, -1,1).easing(this.myEase()),
                        cc.scaleTo(0.4, 1,1).easing(this.myEase())
                    ), 3
                ),
                cc.moveBy(2.4, cc.v2(0, 80))
            ),
            cc.delayTime(0.5),
            cc.fadeOut(0.3),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let nodes = [this.role1[1]];
        let actions = [action0]

        this.runSeqAction(nodes, actions);
    },

    update (dt) {
        if(this.isOpenGuide && this.isChange){
            this.guideContent.active = false;
            this.tipsGuide2();
            this.isOpenGuide =false;
        }
    },
});
