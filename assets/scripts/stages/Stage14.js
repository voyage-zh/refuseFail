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
        cabinet: {
            default: [],
            type: cc.Node
        },
        curtain: {
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
        other: {
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

        this.setFloating(this.float, "bubble1", "bubble2");

        //有5个物品
        this.propPosInPocket = [cc.v2(-300, 0), cc.v2(-150, 0), cc.v2(0, 0), cc.v2(150, 0), cc.v2(300, 0)];
        this.pocketTag = [0, 0, 0, 0, 0];

        this.addCabinetEvent(this.cabinet[0], this.cabinet[1], this.prop[7]);
        this.addCabinetEvent(this.curtain[0], this.curtain[1], null);

        this.grilIsExit = false;
        this.isBeQuiet = false;

        this.role2[0].on(cc.Node.EventType.TOUCH_END, () => {    //女生
            if (this.isPlayAni) return;
            this.grilIsExit ? null : this.badEnd1();
        });

        this.other[2].on(cc.Node.EventType.TOUCH_END, () => {    //饮水机
            if (this.isPlayAni) return;
            this.grilIsExit ? this.badEnd2() : this.badEnd1();
        });

        this.addEventToGetProp(this.prop[1], null, null, 1);   //粉笔
        this.addEventToGetProp(this.prop[2], null, null, 1);   //喇叭
        this.addEventToGetProp(this.prop[3], null, null, 1);   //钟
        this.InitComposeEvent(1, this.prop[4], 3, cc.v2(-164, 271), this.role2[0], this.continue1.bind(this));   //合成的禁言

        this.addEventToGetProp(this.prop[5], null, null, 2);   //画
        this.addEventToGetProp(this.prop[6], null, null, 2);   //梯子
        this.InitComposeEvent(2, this.prop[0], 2, cc.v2(-164, 271), this.target[1], this.continue4.bind(this));   //合成的井盖

        this.addEventToGetProp(this.prop[7], [this.target[0], this.other[2]], [this.continue2.bind(this), this.continue3.bind(this)]);   //空水杯
        this.addEventToGetProp(this.prop[8], this.role1[0], this.badEnd2.bind(this));   //有水杯
    },

    //禁言女生
    continue1() {
        this.other[4].active = true;
        this.other[4].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.5, 1),
                    cc.scaleTo(0.5, 0.8)
                )
            )
        )
        let mColor = new cc.Color(162, 162, 162, 255);
        this.role2[0].color = mColor;
        this.role2[2].color = mColor;
        this.role2[2].active = true;
        this.isBeQuiet = true;
    },

    //水龙头倒水
    continue2() {
        if (this.cabinet[1].active) {
            this.cabinet[1].emit(cc.Node.EventType.TOUCH_END);
        }

        this.prop[7].position = cc.v2(-82.3, 301.5);
        this.prop[7].scale = 0.5;
        this.prop[7].active = true;

        let action0 = cc.sequence(
            cc.spawn(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.1, cc.v2(-2, 0)),
                        cc.moveBy(0.1, cc.v2(2, 0)),
                    ), 5
                ),
                cc.callFunc(() => {
                    this.other[0].active = true;    //水流下
                    this.other[0].runAction(cc.moveBy(1, cc.v2(0, -7)));
                })
            ),
            cc.callFunc(() => {
                this.other[0].active = false;
                this.prop[7].active = false;
                this.prop[8].active = true;
            }),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.pocketPush(this.prop[8], this.role1[0], this.badEnd2.bind(this));
            })
        )
        let nodes = [this.cabinet[0]];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    //空水杯拖到饮水机逻辑
    continue3() {
        if (this.grilIsExit) {
            this.happyEnd();
        } else {
            this.badEnd1();
        }
    },

    //吓走女生
    continue4() {
        this.changeScene(this.root, false);

        if (this.isBeQuiet) {
            this.other[4].active = false;
        } else {
            this.role2[2].active = true;
        }
        this.float.active = false;
        let bug1 = this.other[1].children[0];
        let bug2 = this.other[1].children[1];
        this.other[3].opacity = 0;
        this.other[1].opacity = 0;

        let action0 = cc.fadeIn(1);
        let action1 = cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(0.5)
        )
        let action2 = cc.moveBy(0.2, cc.v2(-11.6, 74.6));
        let action3 = cc.moveBy(0.2, cc.v2(-47.1, 70));
        let action4 = cc.sequence(
            cc.callFunc(()=>{
                this.role2[0].active = false;
                this.bubble.active = true;
                this.bubble.runAction(cc.scaleTo(1,1));
            }),
            cc.spawn(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.05, cc.v2(-2, 0)),
                        cc.moveBy(0.05, cc.v2(2, 0)),
                    ), 10
                ),
                cc.moveBy(1,cc.v2(-10,50)),
                cc.scaleTo(1,1.1)
            ),
            cc.callFunc(()=>{
                this.other[1].runAction(cc.fadeOut(0.3));
                this.bubble.runAction(cc.fadeOut(0.3));
                this.role2[3].runAction(cc.fadeOut(0.3));
                this.role2[4].runAction(cc.fadeOut(0.3));
            }),
            cc.fadeOut(0.3),
            cc.callFunc(()=>{
                this.other[1].active = false;
                this.bubble.active = false;
                this.role2[3].active = false;
                this.role2[4].active = false;
                this.role1[2].active = true;
                this.grilIsExit = true;
            }),
        )

        let nodes = [this.other[3], this.other[1], bug1, bug2,this.role2[3]];
        let actions = [action0, action1, action2, action3,action4];
        this.runSeqAction(nodes, actions);
    },

    //直接点女生或饮水机
    badEnd1() {
        this.float.active = false;

        this.role2[0].active = false;
        this.role2[1].active = true;

        this.role1[0].active = false;
        this.role1[1].active = false;
        this.role1[2].active = false;

        this.other[4].active = false;

        if (!this.grilIsExit) this.role1[3].active = true;

        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                if (this.grilIsExit) {
                    this.gameCtrl.toBadEnd(1);  //女生离开后点饮水机，但没水杯的结局
                } else {
                    if (this.isBeQuiet) {
                        this.gameCtrl.toBadEnd(2);  //女生安静的结局
                    }else{
                        this.gameCtrl.toBadEnd(0);  //直接点
                    }
                }
            })
        )

        let nodes = [this.node];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    //喝水龙头水
    badEnd2() {
        this.role1[0].active = false;
        this.float.active = false;

        let action = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.scaleTo(0.2, 1.1),
                    cc.scaleTo(0.2, 1)
                ), 4
            ),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(3);
            })
        )

        this.runSeqAction(this.role1[1], action);
    },

    happyEnd() {
        this.prop[7].position = cc.v2(301.5,-14.5);
        this.prop[7].scale = 0.5;
        this.prop[7].active = true;
        this.prop[8].position = cc.v2(301.5,-14.5);
        this.other[0].position = cc.v2(279.4,7.5);
        this.other[0].active = true;

        let action1 = cc.sequence(
            cc.callFunc(()=>{
                this.other[0].runAction(cc.moveBy(1,cc.v2(0,-10)));
            }),
            cc.repeat(
                cc.sequence(
                    cc.moveBy(0.1, cc.v2(-2, 0)),
                    cc.moveBy(0.1, cc.v2(2, 0))
                ), 5
            ),
            cc.callFunc(()=>{
                this.other[0].active = false;
                this.prop[7].active = false;
                this.prop[8].active = true;
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let nodes = [this.other[2]];
        let actions = [action1];
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
