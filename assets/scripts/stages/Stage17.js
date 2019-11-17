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
        bag: {
            default: [],
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

        //有6个物品
        this.propPosInPocket = [cc.v2(-312.5, 0), cc.v2(-187.5, 0), cc.v2(-62.5, 0), cc.v2(62.5, 0), cc.v2(187.5, 0), cc.v2(312.5, 0)];
        this.pocketTag = [0, 0, 0, 0, 0, 0];

        this.addCabinetEvent(this.cabinet[0], this.cabinet[1], this.prop[7]);   //柜子

        this.isSetGlass = false;

        this.isBeQuiet = false;

        this.role2[0].on(cc.Node.EventType.TOUCH_END, () => {    //女生
            if (this.isPlayAni) return;
            this.badEnd1();
        });

        this.other[4].on(cc.Node.EventType.TOUCH_END, () => {    //饮水机
            if (this.isPlayAni) return;
            this.badEnd1();
        });

        this.bag[0].on(cc.Node.EventType.TOUCH_END, () => {  //包
            if (this.isPlayAni) return;
            this.bag[0].active = false;
            this.bag[1].active = true;
            this.prop[6].active = true;
        }, this)

        this.curtain[0].on(cc.Node.EventType.TOUCH_END, () => {  //开窗帘
            if (this.isPlayAni) return;
            this.curtain[0].active = false;
            this.curtain[1].active = true;
            this.other[1].active = true;
            if (this.isSetGlass) this.target[1].active = true;
        }, this)
        this.curtain[1].on(cc.Node.EventType.TOUCH_END, () => {  //关窗帘
            if (this.isPlayAni) return;
            this.curtain[1].active = false;
            this.curtain[0].active = true;
            this.other[1].active = false;
            if (this.isSetGlass) this.target[1].active = false;
        }, this)


        this.addEventToGetProp(this.prop[1], null, null, 1);   //粉笔
        this.addEventToGetProp(this.prop[2], null, null, 1);   //喇叭
        this.addEventToGetProp(this.prop[3], null, null, 1);   //钟
        this.InitComposeEvent(1, this.prop[4], 3, cc.v2(-164, 271), this.role2[0], this.continue1.bind(this));   //合成的禁言

        this.addEventToGetProp(this.prop[5], null, null);   //画
        this.addEventToGetProp(this.prop[6], this.curtain[1], this.continue3.bind(this));   //放大镜

        this.addEventToGetProp(this.prop[7], [this.target[0], this.other[4]], [this.continue2.bind(this), this.badEnd1.bind(this)]);   //空水杯
    },

    //禁言女生
    continue1() {
        this.other[5].active = true;
        this.other[5].runAction(
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
                this.prop[0].active = true;
            }),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.pocketPush(this.prop[0], [this.role1[0], this.target[1]], [this.badEnd2.bind(this), this.happyEnd.bind(this)]);  //有水水杯入栏事件
            })
        )
        let nodes = [this.cabinet[0]];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    //放置放大镜
    continue3() {
        this.prop[6].position = cc.v2(-253, 219);
        this.prop[6].active = true;
        this.target[1].active = true;   //窗边放大镜的区域显示
        this.isSetGlass = true;
    },

    //直接点女生或饮水机
    badEnd1() {
        this.float.active = false;

        this.role2[0].active = false;
        this.role2[1].active = true;

        this.role1[0].active = false;
        this.role1[1].active = false;
        this.role1[2].active = false;

        this.other[5].active = false;

        if (!this.grilIsExit) this.role1[3].active = true;

        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                if (this.isBeQuiet) {
                    this.gameCtrl.toBadEnd(1);  //女生安静的结局
                } else {
                    this.gameCtrl.toBadEnd(0);  //直接点
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
                this.gameCtrl.toBadEnd(2);
            })
        )

        this.runSeqAction(this.role1[1], action);
    },

    happyEnd() {
        if (this.cabinet[1].active) {
            this.cabinet[1].emit(cc.Node.EventType.TOUCH_END);
        }
        this.float.active = false;

        this.prop[0].position = cc.v2(-209, 130.8);
        this.prop[0].scale = 0.8;
        this.prop[0].active = true;

        this.other[2].active = true;
        let lightSprite = this.other[2].getComponent(cc.Sprite);
        let smokeSprite = this.other[3].getComponent(cc.Sprite);

        let action1 = cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(() => {
                let duration = 1;     //放大镜的光
                let sv1 = setInterval(() => {
                    lightSprite.fillStart -= 0.02 / duration;
                    if (lightSprite.fillStart <= 0) {
                        clearInterval(sv1);
                    }
                }, 20);
            }),
            cc.delayTime(2.5),
            cc.callFunc(() => {
                this.other[2].active = false;
                this.other[3].active = true;
                let duration = 0.5;     //冒烟，0.5+0.2+0.5=1.5
                let sv2 = setInterval(() => {
                    smokeSprite.fillRange += 0.02 / duration;
                    if (smokeSprite.fillRange >= 1) {
                        clearInterval(sv2);
                        setTimeout(() => {  //等待0.5秒，2次冒烟
                            smokeSprite.fillRange = 0;
                            let duration = 0.5;     
                            let sv3 = setInterval(() => {
                                smokeSprite.fillRange += 0.02 / duration;
                                if (smokeSprite.fillRange >= 1) {
                                    clearInterval(sv3);
                                }
                            }, 20);
                        },200)
                    }
                }, 20);
            }),
            cc.delayTime(2.5),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let nodes = [this.role1[2]];
        let actions = [action1];
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
