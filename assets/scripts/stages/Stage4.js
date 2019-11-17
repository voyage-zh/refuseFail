var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: null,
            type: cc.Node
        },
        //角色
        role1: {
            default: null,
            type: cc.Node
        },
        card:{
            default: null,
            type: cc.Node
        },
        select:{
            default: [],
            type: cc.Node
        },
        answer:{
            default: [],
            type: cc.Node
        },
        answerPos:{
            default: [],
            type: cc.Vec2
        },
        Float:{
            default: null,
            type: cc.Node
        },
        bag:{
            default: [],
            type: cc.Node
        },
        //目标区域
        target: {
            default: null,
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.Float,"bubble1","bubble2");

        this.answerPos = [cc.v2(52,316),cc.v2(176,316),cc.v2(310,316)]

        this.isLookCard = false;

        for (let i = 0; i< 3; i++){
            this.select[i].on(cc.Node.EventType.TOUCH_START,()=>{
                if(this.isPlayAni) return;
                this.select[i].runAction(cc.scaleTo(0.1,1.3));
            });
            this.select[i].on(cc.Node.EventType.TOUCH_END,()=>{
                if(this.isPlayAni) return;
                this.select[i].runAction(cc.scaleTo(0.5,1));
                this.continue1(i);
            },this);
            this.select[i].on(cc.Node.EventType.TOUCH_CANCEL,()=>{
                if(this.isPlayAni) return;
                this.select[i].runAction(cc.scaleTo(0.5,1));
            },this);
        }
        this.bag[0].on(cc.Node.EventType.TOUCH_END,()=>{
            if(this.isPlayAni) return;
            this.bag[0].active = false;
            this.bag[1].active = true;
            this.prop.active = true;
            this.addEventToGetProp(this.prop, this.target, this.continue2.bind(this));
        },this)
    },

    //选择答案分支
    continue1(index){
        if(this.isLookCard && index==2){
            this.happyEnd();
        }else{
            this.badEnd(index);
        }
    },

    //结局通用动画
    commonAction(){
        let action = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.fadeIn(0.2).easing(cc.easeOut(3)),
                    cc.fadeOut(0.2).easing(cc.easeIn(3)),
                )
            ,2),
            cc.fadeIn(0.2).easing(cc.easeOut(3)),
            cc.delayTime(0.5)
        )
        return action
    },

    //显示工作牌和笑脸
    continue2(){
        this.card.scale = 0.5;
        this.card.opacity = 100;
        this.card.active = true;
        this.card.runAction(
            cc.sequence(
                cc.spawn(
                    cc.fadeIn(0.3),
                    cc.scaleTo(0.3,1)
                ),
                cc.callFunc(()=>{
                    this.isLookCard = true;
                    this.role1.active = true;
                })
            )
        )
    },

    //选错坏结局
    badEnd(index) {
        let pos = this.answerPos[index];
        this.answer[1].position =pos;
        this.answer[1].active = true;
        this.answer[1].opacity = 0;
        let action1 = cc.sequence(
            this.commonAction(),
            cc.callFunc(()=>{
                if(!this.isLookCard){
                    this.gameCtrl.toBadEnd(0);
                }else{
                    this.gameCtrl.toBadEnd(1);
                }
            })
        )

        this.answer[1].runAction(action1);
    },

    happyEnd() {
        this.answer[0].active = true;
        this.answer[0].opacity = 0;
        let action1 = cc.sequence(
            this.commonAction(),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )

        this.answer[0].runAction(action1);
    }


    // update (dt) {},
});
