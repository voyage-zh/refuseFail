var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        clock:{
            default: [],
            type: cc.Node
        },
        stopPic:{
            default:null,
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
        target:{
            default: null,
            type: cc.Node
        },
        //气泡
        bubble: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.addEventToGetProp(this.prop[1], this.target, this.continue3.bind(this));   //2b铅笔
        this.addEventToGetProp(this.prop[2], this.target, this.continue1.bind(this));   //圆珠笔

        this.prop[0].on(cc.Node.EventType.TOUCH_END, () => {  //笔盒
            if (this.isPlayAni) return;
            if(this.timeIsStop){
                this.prop[1].active = true;
                this.prop[2].active = true;
            }else{
                this.badEnd2();
            }
            this.prop[0].off(cc.Node.EventType.TOUCH_END);
        }, this)

        this.target.on(cc.Node.EventType.TOUCH_END, () => {  //人
            if (this.isPlayAni) return;
            this.isClickRole = true;
            this.continue1();

            this.target.off(cc.Node.EventType.TOUCH_END);
        }, this)

        this.clock[0].on(cc.Node.EventType.TOUCH_END,()=>{
            if(this.isPlayAni||this.timeIsStop) return;
            this.clock[0].active = false;
            this.clock[1].active = true;
            this.stopTimeEvent();
        });

        this.clock[1].on(cc.Node.EventType.TOUCH_END,()=>{
            if(this.isPlayAni || !this.timeIsStop) return;
            this.clock[1].active = false;
            this.clock[0].active = true;
            this.startTimeEvent();
            
        });

        this.isUse2b = false;
        this.isFinish = false;
        this.isClickRole = false;   //区别点人还是用圆珠笔

        //时间停止参数初始化
        this.initStopTime = 6;
        this.stopTime = this.initStopTime;  //倒计时
        this.timeIsStop = true;    //是否在暂停
        this.isPlayAni = true;

        this.node.on("start",()=>{
            this.timeIsStop = false;
            this.isPlayAni = false;
            this.mSetFloating();
        })

    },

    //气泡
    mSetFloating(){
        this.bubble[0].runAction(
            cc.sequence(
                cc.scaleTo(2,1.1).easing(cc.easeOut(10)),
                cc.callFunc(()=>{
                    this.bubble[0].active = false;
                    this.bubble[1].active = true;
                    this.bubble[1].opacity = 100;
                    this.bubble[1].runAction(
                        cc.spawn(
                            cc.fadeIn(0.1),
                            cc.callFunc(()=>{
                                this.bubble[1].runAction(
                                    cc.repeatForever(
                                        cc.sequence(
                                            cc.scaleTo(0.5,1.1),
                                            cc.scaleTo(0.5,1)
                                        )
                                    )
                                )
                            })
                        )
                    )
                }),
                cc.fadeOut(0.1),
            )
        )
    },

    //时间暂停
    stopTimeEvent(){
        this.isPlayAni = true;

        let role2Btn = this.role2[0].getComponent(cc.Button);
        role2Btn.interactable = false;

        this.timeIsStop = true;
        this.stopPic.active = true;
        let tmpSprite = this.stopPic.getComponent(cc.Sprite);
        let duration = 0.3;
        let sv = setInterval(()=>{
            tmpSprite.fillRange += 0.02/duration;
            if(tmpSprite.fillRange >= 1){   //回调
                clearInterval(sv);
                tmpSprite.fillRange = 1;
                this.isPlayAni = false;
            }
        },20);

        this.bubble[2].active = true;
    },
    //时间开始
    startTimeEvent(){
        this.isPlayAni = true;

        let role2Btn = this.role2[0].getComponent(cc.Button);
        role2Btn.interactable = true;

        let tmpSprite = this.stopPic.getComponent(cc.Sprite);
        let duration = 0.3;

        let sv = setInterval(()=>{
            tmpSprite.fillRange -= 0.02/duration;
            if(tmpSprite.fillRange <= 0){   //回调
                clearInterval(sv);
                tmpSprite.fillRange = 0;
                this.stopPic.active = false;
                this.bubble[2].active = false;
                this.isPlayAni = false;
                this.timeIsStop = false;
                if(this.isFinish){
                    this.continue2();
                }
            }
        },20);
    },

    //直接点人或用圆珠笔
    continue1(){
        this.bubble[0].active = false;
        this.bubble[1].active = false;
        this.target.active = false;
        this.isPlayAni = true;

        this.role1[0].active = false;
        this.role1[4].active = true;
        this.role1[4].runAction(
            cc.sequence(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.1,cc.v2(-10,0)),
                        cc.moveBy(0.1,cc.v2(10,0))
                    ),10
                ),
                cc.callFunc(()=>{
                    if(this.stopTime <=0) return   //时间到了
                    this.isPlayAni = false;
                    if(this.timeIsStop){
                        this.isFinish = true;
                    }else{
                        this.badEnd3();
                    }
                })
            )
        )
    },

    //回到时间开始判断逻辑
    continue2(){
        if(this.isUse2b){
            this.happyEnd();
        }else{
            this.badEnd3();
        }
    },

    //用2b
    continue3(){
        this.bubble[0].active = false;
        this.bubble[1].active = false;
        this.target.active = false;
        this.isPlayAni = true;

        this.role1[0].active = false;
        this.role1[4].active = true;
        this.role1[4].runAction(
            cc.sequence(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.1,cc.v2(-10,0)),
                        cc.moveBy(0.1,cc.v2(10,0))
                    ),10
                ),
                cc.callFunc(()=>{
                    if(this.stopTime <=0) return   //时间到了
                    this.isPlayAni = false;
                    if(this.timeIsStop){
                        this.isFinish = true;
                        this.isUse2b = true;
                    }else{
                        this.happyEnd();
                    }
                })
            )
        )
    },

    //时间到
    badEnd1(){
        this.bubble[1].active = false;

        this.role1[0].active = false;
        this.role1[4].active = false;
        this.role1[1].active = true;
        this.timeIsStop = true;

        let action = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(()=>{
                this.gameCtrl.toBadEnd(0);
            })
        )

        this.runSeqAction(this.node,action);
    },

    //点笔盒拖走
    badEnd2(){
        this.timeIsStop = true;
        this.bubble[0].active = false;
        this.bubble[1].active = false;
        this.role1[0].active = false;
        this.role1[4].active = false;
        this.role1[1].active = true;
        this.role2[1].position = this.role2[0].position;
        this.role2[1].active = true;
        this.role2[0].active = false;
        this.timeIsStop = true;

        let action = cc.sequence(
            cc.toggleVisibility(),
            cc.delayTime(1.5),
            cc.callFunc(()=>{
                this.role2[1].active = false;
                this.role1[3].active = true;
                this.role1[1].active = false;
            }),
            cc.toggleVisibility(),
            cc.moveTo(1,cc.v2(-308,56)),
            cc.fadeOut(0.3),
            cc.callFunc(()=>{
                this.gameCtrl.toBadEnd(1,1);
            })
        )

        this.runSeqAction(this.role2[2],action);
    },

    //用钢笔写
    badEnd3(){
        this.role1[0].active = false;
        this.role1[4].active = false;
        this.role1[1].active = true;
        this.timeIsStop = true;

        let action = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(()=>{
                if(this.isClickRole){
                    this.gameCtrl.toBadEnd(2);
                }else{
                    this.gameCtrl.toBadEnd(3);
                }
            })
        )

        this.runSeqAction(this.node,action);
    },

    happyEnd(){
        this.role1[4].active = false;
        this.role1[0].active = true;
        this.role1[2].active = true;
        this.timeIsStop = true;

        let action = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )

        this.runSeqAction(this.node,action);
    },

    update (dt) {
        if(!this.timeIsStop){
            this.stopTime -=dt;
            let x = -95+this.stopTime*(-293+95)/this.initStopTime;
            let y = -40+this.stopTime*(241+40)/this.initStopTime;
            this.role2[0].position = cc.v2(x,y);
            if(this.stopTime <= 0){
                this.isPlayAni = true;
                this.timeIsStop = true;
                this.badEnd1();
            }
        }
    },
});
