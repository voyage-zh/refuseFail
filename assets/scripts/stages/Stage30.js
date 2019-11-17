var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        role2: {
            default: null,
            type: cc.Node
        },
        prop:{
            default: [],
            type: cc.Node
        },
        box:{
            default: [],
            type: cc.Node
        },
        bubble:{
            default: [],
            type: cc.Node
        },
        answer: {
            default: [],
            type: cc.Node
        },
        target:{
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.boxEvent();

        this.target[0].on(cc.Node.EventType.TOUCH_END,()=>{     //炸弹
            if(this.isPlayAni) return
            this.badEnd2();
            this.target[0].off(cc.Node.EventType.TOUCH_END)
        })

        this.target[1].on(cc.Node.EventType.TOUCH_END,()=>{     //气球
            if(this.isPlayAni) return
            this.continue1();
            this.target[1].off(cc.Node.EventType.TOUCH_END)     
        })

        this.target[2].on(cc.Node.EventType.TOUCH_END,()=>{     //点气球
            if(this.isPlayAni) return
            this.prop[2].active = false;
            this.prop[2].stopAllActions();
            this.prop[3].position = this.prop[2].position;
            this.isPlayAni = true;
            this.prop[3].active = true;
            this.prop[3].runAction(
                cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(()=>{
                        this.isPlayAni = false;
                        this.pocketPush(this.prop[1],this.box[0],this.continue2.bind(this));
                        this.prop[3].active = false;
                    })
                )
            )
            this.target[1].off(cc.Node.EventType.TOUCH_END)     
        })

        this.isSetBox = false;

        this.prop[0].on(cc.Node.EventType.TOUCH_END,()=>{       //笔
            if(this.isPlayAni) return
            if(!this.isSetBox){
                this.badEnd3();
            }else{
                this.happyEnd();
            }
        })
    },

    //宝箱事件
    boxEvent(){
        this.box[0].runAction(      //宝箱晃动
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.1,cc.v2(2,0)).easing(this.myEase()),
                    cc.moveBy(0.1,cc.v2(-4,0)).easing(this.myEase()),
                    cc.moveBy(0.1,cc.v2(2,0)).easing(this.myEase()),
                    cc.delayTime(0.3)
                )
            )
        )

        this.box[0].on(cc.Node.EventType.TOUCH_END,()=>{
            if(this.isPlayAni) return
            this.box[0].stopAllActions();
            this.bubble[0].active = false;
            this.box[0].active = false;
            this.box[1].active = true;
            this.role2.active = true;
            this.prop[0].active =false;
            this.target[0].active = false;
            this.target[1].active = false;
            this.box[0].off(cc.Node.EventType.TOUCH_END);
            //答案事件
            this.bubble[1].active = true;
            this.answer[0].on(cc.Node.EventType.TOUCH_END,()=>{
                if(this.isPlayAni) return
                this.badEnd1(0);
            })
            this.answer[1].on(cc.Node.EventType.TOUCH_END,()=>{
                if(this.isPlayAni) return
                this.badEnd1(1);
            })
        })
    },

    //气球飞中间
    continue1(){
        this.isPlayAni = true;
        let pos = this.prop[3].position;
        this.prop[2].runAction(
            cc.sequence(
                cc.moveTo(3,pos),
                cc.delayTime(0.2),
                cc.callFunc(()=>{
                    this.target[2].active = true;
                    this.isPlayAni = false;
                    this.prop[2].runAction(
                        cc.repeatForever(
                            cc.sequence(
                                cc.moveBy(1,cc.v2(0,50)).easing(cc.easeInOut(3)),
                                cc.moveBy(1,cc.v2(0,-50)).easing(cc.easeInOut(3))
                            )
                        )
                    )
                })
            )
        )
    },

    //锁上宝箱
    continue2(){
        this.box[2].active = true;
        this.box[0].off(cc.Node.EventType.TOUCH_END);
        this.addEventToGetProp(this.box[0], this.target[3], this.continue3.bind(this));
    },

    //放宝箱
    continue3(){
        this.box[0].stopAllActions();
        this.box[0].position = cc.v2(140,-123);
        this.box[0].active = true;
        this.isSetBox = true;
    },

    //选送命题
    badEnd1(index) {
        let select = this.answer[2];
        let selectPosX = [140.8,297];
        select.x = selectPosX[index];

        let action0 = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.fadeIn(0.2).easing(cc.easeOut(3)),
                    cc.fadeOut(0.2).easing(cc.easeIn(3)),
                )
            ,2),
            cc.fadeIn(0.2).easing(cc.easeOut(3)),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.gameCtrl.toBadEnd(0)
            })
        )
        this.runSeqAction(select, action0);
    },

    //触发炸弹
    badEnd2(){
        let pos = this.prop[3].position;
        this.prop[5].scale = 0.8
        let action0 = cc.sequence(
            cc.moveTo(3,pos),
            cc.delayTime(0.5)
        )
        let action1 = cc.sequence(
            cc.callFunc(()=>{
                this.role1[0].active = false;
                this.role1[1].active = true;
            }),
            cc.scaleTo(0.5,1.2).easing(cc.easeOut(8)),
            cc.delayTime(0.3),
            cc.callFunc(()=>{
                this.gameCtrl.toBadEnd(1,2);
            })
        )

        let nodes = [this.prop[4],this.prop[5]];
        let actions = [action0,action1]
        this.runSeqAction(nodes,actions)
    },

    //没箱子点笔
    badEnd3(){
        this.bubble[0].active = false;
        this.role1[0].active = false;
        this.role1[2].active = true;

        let action0 = cc.sequence(
            cc.delayTime(0.2),
            cc.repeat(
                cc.sequence(
                    cc.moveBy(0.1,cc.v2(0,20)),
                    cc.moveBy(0.1,cc.v2(0,-20)),
                    cc.moveBy(0.1,cc.v2(0,20)),
                    cc.moveBy(0.1,cc.v2(0,-20)),
                    cc.delayTime(0.2)
                ), 3
            ),
            cc.delayTime(0.2),
            cc.callFunc(()=>{
                this.gameCtrl.toBadEnd(2);
            })
        )

        this.runSeqAction(this.role1[2],action0);
    },

    happyEnd() {
        this.bubble[0].active = false;
        this.role1[0].active = false;
        this.role1[2].active = true;
        this.role1[2].position = cc.v2(166,81);

        let action0 = cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(()=>{
                this.prop[0].runAction(cc.fadeOut(1.5));
            }),
            cc.repeat(
                cc.sequence(
                    cc.moveBy(0.1,cc.v2(0,20)),
                    cc.moveBy(0.1,cc.v2(0,-20)),
                    cc.moveBy(0.1,cc.v2(0,20)),
                    cc.moveBy(0.1,cc.v2(0,-20)),
                    cc.delayTime(0.2)
                ), 3
            ),
            cc.callFunc(()=>{
                this.role1[2].active =false;
                this.role1[3].active =true;
            }),
        )

        let action1 = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        ) 

        let nodes = [this.role1[2],this.node]
        let actions = [action0,action1]
        this.runSeqAction(nodes,actions);
    }


    // update (dt) {},
});