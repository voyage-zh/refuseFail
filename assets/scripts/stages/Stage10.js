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
        door: {
            default: [],
            type: cc.Node
        },
        cabinetClose: {
            default: [],
            type: cc.Node
        },
        cabinetOpen: {
            default: [],
            type: cc.Node
        },
        //气泡
        float: {
            default: null,
            type: cc.Node
        },
        bubble: {
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
        target: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.addSceneChange(this.root);

        this.setSound();

        this.door[0].on(cc.Node.EventType.TOUCH_END, () => {    //门
            if (this.isPlayAni) return;
            this.continue0();
        })

        this.addEventToGetProp(this.prop[1], [this.target[0], this.target[1]],      //扫把
            [
                () => { this.continue1(cc.v2(-214, -222),true) },     //扫头发
                () => { this.continue1(cc.v2(536, -222),false) }      //扫游戏机
            ]
        );   

        this.addCabinetEvent(this.cabinetClose[0],this.cabinetOpen[0],null);
        this.addCabinetEvent(this.cabinetClose[1],this.cabinetOpen[1],null);
        this.addCabinetEvent(this.cabinetClose[2],this.cabinetOpen[2],null);
        this.addCabinetEvent(this.cabinetClose[3],this.cabinetOpen[3],this.prop[3]);

        this.isOnSkirt = false;
        this.isOnHair = false;

        this.addEventToGetProp(this.prop[0], this.target[2], this.badEnd2.bind(this));   //游戏机
        this.addEventToGetProp(this.prop[2], this.target[2], this.continue2.bind(this));   //头发
        this.addEventToGetProp(this.prop[3], this.target[2], this.continue3.bind(this));   //裙子

        // this.role2.on(cc.Node.EventType.TOUCH_END, () => {    //cxk
        //     if (this.isPlayAni || !this.isOnMusic) return;
        //     this.happyEnd();
        // })

        // this.bag[0].once(cc.Node.EventType.TOUCH_END, () => {     //开包
        //     this.bag[0].active = false;
        //     this.bag[1].active = true;
        //     this.prop[1].active = true;
        // });

    },

    //开门判断逻辑
    continue0(){
        if(this.isOnSkirt && this.isOnHair){
            this.happyEnd();
        }else{
            this.badEnd1();
        }
    },

    //扫把动画
    continue1(pos,tag) {
        this.isPlayAni = true;
        this.prop[1].position = pos;
        this.prop[1].rotation = 164;
        this.prop[1].scale = 0.8;
        this.prop[1].active = true;
        this.prop[1].runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.moveBy(1, cc.v2(-22, 76)),
                cc.repeat(
                    cc.sequence(
                        cc.rotateTo(0.5, 219),
                        cc.delayTime(0.1),
                        cc.rotateTo(0, 164).easing(this.myEase())
                    ), 2
                ),
                cc.callFunc(() => {
                    this.prop[1].active = false;
                    this.isPlayAni = false;
                    if(tag){
                        this.prop[2].active = true; //头发
                    }else{
                        this.prop[0].active = true; //游戏机
                    }
                    
                })
            )
        )
    },

    //穿头发
    continue2(){
        this.isOnHair = true;
        if(this.role1[1].active){
            this.role1[1].active = false;
            this.role1[2].active = true;
        }
        this.role1[3].active = true;
    },

    //穿裙子
    continue3(){
        this.isOnSkirt = true;
        if(this.role1[1].active){
            this.role1[1].active = false;
            this.role1[2].active = true;
        }
        this.role1[4].active = true;
    },

    //敲门
    setSound() {
        let sound1 = cc.find("Sound1", this.float);
        let sound2 = cc.find("Sound2", this.float);
        let sound3 = cc.find("Sound3", this.float);
        let bubble1 = cc.find("Bubble1", this.float);
        bubble1.runAction(
            cc.repeatForever(
                cc.spawn(
                    cc.sequence(
                        cc.scaleTo(0.3, 1.3),
                        cc.scaleTo(0.2, 1)
                    ),
                    cc.sequence(
                        cc.callFunc(() => {
                            sound1.active = true;
                        }),
                        cc.delayTime(0.1),
                        cc.callFunc(() => {
                            sound2.active = true;
                        }),
                        cc.delayTime(0.1),
                        cc.callFunc(() => {
                            sound3.active = true;
                        }),
                        cc.delayTime(0.1),
                        cc.callFunc(() => {
                            sound1.active = false;
                            sound2.active = false;
                            sound3.active = false;
                        }),
                        cc.delayTime(0.2)
                    )
                )
            )
        )
    },

    //通用坏结局动画
    ani() {
        //鸡头跑到男主前0
        let action0 = cc.sequence(
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.door[0].active = false;
                this.door[1].active = true;
            }),
            cc.delayTime(0.5),
            cc.spawn(
                cc.moveTo(1, cc.v2(156, -122)),
                cc.sequence(
                    cc.delayTime(0.3),
                    cc.callFunc(() => {
                        this.changeScene(this.root, false, 0.5)
                    })
                )
            ),
            cc.callFunc(() => {
                this.role2[1].opacity = 0;
                this.role2[2].active = true;
            }),
            cc.delayTime(1)
        )

        //鸡头拖走男主1
        let action1 = cc.sequence(
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.role1[1].active = false;
                this.role1[2].active = false;
                this.role2[2].active = false;
                this.role2[3].active = true
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role2[3].active = false;
            }),
            cc.toggleVisibility(),
            cc.moveTo(1, cc.v2(389, -134)),
            cc.fadeOut(0.3)
        )

        return {
            nodes: [this.role2[1], this.role2[4]],
            actions: [action0, action1]
        }
    },


    //拖走坏结局
    badEnd1() {
        let action = cc.callFunc(() => {
            if(this.isOnSkirt || this.isOnHair){
                this.gameCtrl.toBadEnd(1);
            }else{
                this.gameCtrl.toBadEnd(0);
            }
        })

        let mAni = this.ani();
        let nodes = [mAni.nodes[0], mAni.nodes[1], this.node];
        let actions = [mAni.actions[0], mAni.actions[1], action];
        this.runSeqAction(nodes, actions);
    },

    //玩手机坏结局
    badEnd2() {
        this.role1[1].active = false;
        this.role1[2].active = false;

        let action = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.moveBy(0.2, cc.v2(-5, 0)).easing(this.myEase()),
                    cc.moveBy(0.2, cc.v2(5, 0)).easing(this.myEase())
                ), 5
            ),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(2);
            })
        )

        this.runSeqAction(this.role1[0], action);
    },

    happyEnd() {
        let action = cc.sequence(
            cc.toggleVisibility(),
            cc.callFunc(()=>{
                this.bubble[0].active = true;
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.bubble[1].active = true;
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.role2[2].active = false;
                this.bubble[0].active = false;
                this.bubble[1].active = false;
            }),
            cc.toggleVisibility(),
            cc.moveTo(1,cc.v2(365,-158)),
            cc.fadeOut(0.2),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let mAni = this.ani();
        let nodes = [mAni.nodes[0], this.role2[5]];
        let actions = [mAni.actions[0], action];
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
