var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        window: {
            default: [],
            type: cc.Node
        },
        bag: {
            default: [],
            type: cc.Node
        },
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        answer: {
            default: [],
            type: cc.Node
        },
        float: {
            default: null,
            type: cc.Node
        },
        bubble: {
            default: null,
            type: cc.Node
        },
        target: {
            default: null,
            type: cc.Node
        },
        HEImg:{
            default: null,
            type: cc.SpriteFrame
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.float, "bubble1", "bubble2");

        //有7个物品,6个格子
        this.propPosInPocket = [cc.v2(-312.5, 0), cc.v2(-187.5, 0), cc.v2(-62.5, 0), cc.v2(62.5, 0), cc.v2(187.5, 0), cc.v2(312.5, 0)];
        this.pocketTag = [0, 0, 0, 0, 0, 0];

        this.answerPos = [cc.v2(159, 336), cc.v2(304, 336)];
        this.answerCount = 0;
        this.answerProgress = [];

        this.bag[0].on(cc.Node.EventType.TOUCH_END, () => {                                 //包
            if (this.isPlayAni) return;
            this.bag[0].active = false;
            this.bag[1].active = true;
            this.prop[0].active = true;
        }, this);

        this.addCabinetEvent(this.window[0], this.window[1], this.prop[3]);                 //窗

        this.prop[7].on(cc.Node.EventType.TOUCH_END, () => {                                 //竹子
            if (this.isPlayAni) return
            for (var i = this.pocketTag.length - 1; i >= 0; i--) {
                if (this.pocketTag[i] == 0) {
                    let action2 = cc.callFunc(() => {
                        this.pocketPush(this.prop[4], [this.role1[0], this.target], [() => {
                            this.setAnswer(5)
                        }, this.badEnd1.bind(this)]);
                    })
                    this.bambooAni(action2);
                    this.prop[7].off(cc.Node.EventType.TOUCH_END);
                    return;
                }
            }
            Manager.Alert.showFloatingTxt("道具栏已满!");
        }, this);

        this.addEventToGetPropCheck(this.prop[0], this.role1[0], () => {            //红薯
            this.setAnswer(1)
        }) 
        this.addEventToGetPropCheck(this.prop[1], this.role1[0], () => {            //熊
            this.target.active = false;
            this.setAnswer(2)
        }) 
        this.addEventToGetPropCheck(this.prop[2], this.role1[0], () => {            //鸡
            this.setAnswer(3)
        }) 
        this.addEventToGetPropCheck(this.prop[3], this.role1[0], () => {            //树
            this.setAnswer(4)
        }) 
        this.addEventToGetPropCheck(this.prop[5], this.role1[0], () => {            //草
            this.setAnswer(6)
        }) 
        this.addEventToGetPropCheck(this.prop[6], this.role1[0], () => {            //马
            this.setAnswer(7)
        }) 

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

        let nodes = [this.prop[7], this.prop[4], this.node]
        let actions = [action0, action1, action2]
        this.runSeqAction(nodes, actions);
    },

    setAnswer(num) {
        if(num == 5){
            this.prop[4].parent = this.node;
            this.prop[4].setSiblingIndex(this.prop[1].getSiblingIndex());
        }
        let prop = cc.find("Prop" + num, this.node);
        prop.position = this.answerPos[this.answerCount];

        this.answerProgress[this.answerCount] = num;    //记录答案

        this.answerCount++;
        
        prop.scale = 0.1;
        prop.opacity = 100;
        let tmpScale = 1;
        switch (num) {
            case 1:
                tmpScale = 1.2;
                break;
            case 2:
                tmpScale = 0.5;
                break;
            case 3:
                tmpScale = 1;
                break;
            case 4:
                tmpScale = 0.7;
                break;
            case 5:
                tmpScale = 0.9;
                break;
            case 6:
                tmpScale = 0.55;
                break;
            case 7:
                tmpScale = 0.45;
                break;
        }
        this.isPlayAni = true;
        prop.active = true;
        prop.runAction(
            cc.sequence(
                cc.spawn(
                    cc.fadeIn(0.2),
                    cc.scaleTo(0.2, tmpScale)
                ),
                cc.callFunc(() => {
                    this.isPlayAni = false;
                    if (this.answerCount >= 2) {
                        this.continue();
                    }
                })
            )
        )
    },

    //判断答案
    continue () {
        if (this.answerProgress[0] == 4 && this.answerProgress[1] == 7) {
            this.happyEnd();
        } else if(this.answerProgress[0] == 7 && this.answerProgress[1] == 4) {
            this.badEnd2(true);
        }else{
            this.badEnd2(false);
        }
    },

    //结局通用动画,对或错
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

    //竹子给熊
    badEnd1() {
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.prop[1].children[0].active = true;

        let action0 = cc.sequence(
            cc.toggleVisibility(),
            cc.delayTime(0.2),
            cc.toggleVisibility(),
            cc.scaleTo(1, 1.3),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )

        this.runSeqAction(this.bubble, action0);
    },

    //打错答案,bool为true为 很接近答案
    badEnd2(bool) {
        this.answer[0].opacity = 0;
        this.role1[0].active = false;
        this.role1[1].active = true;

        let action0 = cc.sequence(
            this.commonAction(),
            cc.callFunc(() => {
                if(bool){
                    this.gameCtrl.toBadEnd(1);
                }else{
                    this.gameCtrl.toBadEnd(2);
                }
                
            })
        )

        this.runSeqAction(this.answer[0], action0);
    },

    happyEnd() {
        this.answer[1].opacity = 0;
        this.role1[2].active = true;

        let action0 = cc.sequence(
            this.commonAction(),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0,this.HEImg);
            })
        )

        this.runSeqAction(this.answer[1], action0);
    }


    // update (dt) {},
});