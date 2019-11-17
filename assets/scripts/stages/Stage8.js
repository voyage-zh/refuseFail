var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        water: {
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
        role2: {
            default: [],
            type: cc.Node
        },
        role3: {
            default: [],
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
        this.setFloating(this.bubble[0], "bubble1_1", "bubble1_2");
        this.setFloating(this.role2[0], "Role2_1", "Role2_2", 0.8);

        this.addEventToGetProp(this.prop[1], [this.role3[0], this.role2[0]], [this.badEnd1.bind(this), this.badEnd3.bind(this)]);   //纸团

        this.addEventToGetProp(this.prop[3], this.role2[0], this.badEnd2.bind(this));   //水杯

        this.addEventToGetProp(this.prop[2], this.role2[0], this.badEnd4.bind(this));   //火腿

        this.addEventToGetProp(this.prop[0], this.role2[0], this.happyEnd.bind(this));   //口香糖

        this.bag[0].on(cc.Node.EventType.TOUCH_END, () => {  //包
            if (this.isPlayAni) return;
            this.bag[0].active = false;
            this.bag[1].active = true;
            this.prop[2].active = true;
        }, this)

        this.prop[4].on(cc.Node.EventType.TOUCH_END, () => {  //垃圾桶
            if (this.isPlayAni || this.prop[4].rotation == 90) return;
            this.prop[0].active = true; 
            this.prop[4].rotation = 90;
            this.prop[4].position = cc.v2(199, 267);
        }, this)
    },

    //吃薯片分支
    continue2() {
        //老师状态变化
        this.roles[3].active = false;
        this.roles[5].active = true;
        this.prop[3].active = false;
        this.teacherIsCareful = false;
    },

    //通用坏结局
    ani(arg1, arg2) {
        //主任生气,拖走0
        let action0 = cc.sequence(
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.role3[0].active = false;
                this.role3[3].active = true;
                this.role3[4].active = true;
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role3[3].active = false;
                if (arg1) {
                    this.role2[1].active = false;
                    this.role2[2].active = true;
                }
                if (!arg2) {
                    this.role1[0].active = false;
                    this.role1[2].active = true;
                }
            }),
            cc.toggleVisibility(),
            cc.moveTo(1.5, cc.v2(-316, -48)),
            cc.fadeOut(0.2)
        )
        return action0

    },

    //砸主任坏结局
    badEnd1() {
        let action0 = cc.sequence(
            cc.callFunc(() => {
                this.bubble[0].active = false;
                this.prop[1].position = cc.v2(187, 171);
                this.role1[0].runAction(cc.scaleTo(0.1, 1.1));
                this.scheduleOnce(() => {
                    this.role1[0].runAction(cc.scaleTo(0.1, 1))
                }, 0.1)
            }),
            cc.delayTime(0.1),
            this.createBezier(1, cc.v2(187, 171), cc.v2(-211, 303), 200, 45),
            cc.callFunc(() => {
                this.role3[0].runAction(
                    cc.repeat(
                        cc.sequence(
                            cc.moveBy(0.1, cc.v2(-10, 0)),
                            cc.moveBy(0.1, cc.v2(10, 0))
                        ), 5
                    )
                )
            }),
            cc.fadeOut(0.2),
            cc.delayTime(1)
        )

        let action2 = cc.callFunc(() => {
            this.gameCtrl.toBadEnd(0,1);
        })

        let mAni = this.ani(false);
        let nodes = [this.prop[1], this.role3[2], this.node];
        let actions = [action0, mAni, action2];
        this.runSeqAction(nodes, actions);
    },

    //倒水坏结局
    badEnd2() {
        this.bubble[0].active = false;
        let action0 = cc.sequence(
            cc.moveTo(0, cc.v2(113, 252)),
            cc.delayTime(1),
            cc.rotateTo(0, -90),
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.role2[1].active = true;
                this.water[1].active = true;
                this.water[0].active = false;
            }),
            cc.delayTime(0.2),
            cc.callFunc(() => {
                this.water[2].active = true;
            }),
            cc.delayTime(0.2),
            cc.callFunc(() => {
                this.water[3].active = true;
            }),
            cc.delayTime(1),
        )

        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.role2[3].active = true;
                this.prop[3].active = false;
                this.water[1].active = false;
                this.water[2].active = false;
            }),
            cc.delayTime(1)
        )

        let action2 = cc.callFunc(() => {
            this.gameCtrl.toBadEnd(1);
        })

        let mAni = this.ani(true);
        let nodes = [this.prop[3], this.role2[1], this.role3[1], this.node]
        let actions = [action0, action1, mAni, action2]
        this.runSeqAction(nodes, actions);
    },

    //砸泡面坏结局
    badEnd3() {
        this.bubble[0].active = false;
        this.role2[0].stopAllActions();
        this.role2[0].children[0].active = false;
        this.role2[0].children[1].active = true;
        this.prop[1].position = cc.v2(187, 171);
        this.role1[0].runAction(cc.scaleTo(0.1, 1.1));
        this.scheduleOnce(() => {
            this.role1[0].runAction(cc.scaleTo(0.1, 1))
        }, 0.1)
        let action0 = cc.sequence(
            cc.delayTime(0.1),
            this.createBezier(1, cc.v2(187, 171), cc.v2(7.3, 150), 20, 45),
            cc.delayTime(0.2),
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.role2[1].active = true;
            }),
            cc.delayTime(1)
        )

        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.role2[3].active = true;
                this.prop[3].active = false;
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.prop[1].active = false;
            })
        );

        let action2 = cc.callFunc(() => {
            this.gameCtrl.toBadEnd(1);
        })

        let mAni = this.ani(true);
        let nodes = [this.prop[1], this.role2[1], this.role3[1], this.node]
        let actions = [action0, action1, mAni, action2]
        this.runSeqAction(nodes, actions);
    },

    //给火腿坏结局
    badEnd4() {
        this.bubble[0].active = false;
        this.role2[0].stopAllActions();
        let role2_1 = this.role2[0].children[0];
        let role2_2 = this.role2[0].children[1];
        role2_1.active = false;
        role2_2.active = true;
        let action = cc.sequence(
            cc.repeat(
                (
                    cc.sequence(
                        cc.scaleTo(0.2, 1.1),
                        cc.scaleTo(0.2, 1)
                    )
                ), 4
            ),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(2);
            })
        )

        let nodes = [role2_2]
        let actions = [action]
        this.runSeqAction(nodes, actions);
    },

    //好结局
    happyEnd() {
        this.bubble[0].active = false;
        this.prop[0].position = cc.v2(-36,204);
        this.prop[0].active = true;
        let action0 = cc.sequence(
            cc.toggleVisibility(),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.prop[0].active = false;
                this.prop[5].active = true;
            }),
            cc.delayTime(0.2),
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.bubble[1].active = true;
            }),
            cc.scaleTo(0.3,1.3).easing(cc.easeOut(3)),
            cc.scaleTo(0.7,1),
            cc.callFunc(()=>{
                this.prop[5].active = false;
                this.bubble[1].active = false;
            })
        )

        let action2 = cc.sequence(
            cc.callFunc(()=>{
                this.role1[1].active = true;
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )
        let mAni = this.ani(true,true);
        let nodes = [this.role2[1],this.role3[5],this.node]
        let actions = [action0,mAni,action2]
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
