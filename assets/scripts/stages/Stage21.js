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
        door: {
            default: null,
            type: cc.Node
        },
        ice: {
            default: [],
            type: cc.Node
        },
        egg: {
            default: [],
            type: cc.Node
        },
        //角色
        role1: {
            default: null,
            type: cc.Node
        },
        chicken: {
            default: null,
            type: cc.Node
        },
        bubble: {
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

        this.mSetFloating();

        //有5个物品
        this.propPosInPocket = [cc.v2(-300, 0), cc.v2(-150, 0), cc.v2(0, 0), cc.v2(150, 0), cc.v2(300, 0)];
        this.pocketTag = [0, 0, 0, 0, 0];

        this.addCabinetEvent(this.cabinet[0], this.cabinet[1], this.prop[1]); //柜子
        this.addCabinetEvent(this.ice[1], this.ice[0], this.prop[2]); //冰箱上
        this.addCabinetEvent(this.ice[3], this.ice[2], null); //冰箱下

        this.isSetOne = false;
        this.eggCount = 0;

        this.target[1].on(cc.Node.EventType.TOUCH_END, () => { //盘子
            if (this.isPlayAni || (!this.isSetOne && !this.isSetZero)) return;
            this.continue5();
        });

        this.target[0].on(cc.Node.EventType.TOUCH_END, () => { //门
            if (this.isPlayAni) return;
            this.continue3();
            this.target[0].off(cc.Node.EventType.TOUCH_END);
        });
        
        this.addEventToGetProp(this.prop[1], this.target[1], this.continue1.bind(this)); //红薯
        this.addEventToGetProp(this.prop[2], [this.target[2],this.role1], [this.continue2.bind(this),this.badEnd2.bind(this)]); //鸡蛋1
        this.addEventToGetProp(this.prop[3], [this.target[2],this.role1], [this.continue2.bind(this),this.badEnd2.bind(this)]); //鸡蛋2
        this.addEventToGetProp(this.prop[4], this.role1, this.badEnd1.bind(this)); //红薯
        this.addEventToGetProp(this.prop[5], this.chicken, this.continue4.bind(this)); //米
    },

    //气泡
    mSetFloating() {
        this.bubble[2].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.2, cc.v2(-5, 0)).easing(this.myEase()),
                    cc.moveBy(0.2, cc.v2(5, 0)).easing(this.myEase())
                )
            )
        )
    },

    //放火腿
    continue1() {
        this.isSetOne = true;
        this.prop[0].active = true;
    },

    //放鸡蛋
    continue2() {
        this.isPlayAni = true;
        this.prop[7].active = true;
        this.prop[7].runAction(
            cc.sequence(
                cc.callFunc(() => {
                    this.egg[2].active = true;
                    this.prop[6].runAction(
                        cc.repeat(
                            cc.sequence(
                                cc.moveBy(0.1, cc.v2(-5, 0)).easing(this.myEase()),
                                cc.moveBy(0.1, cc.v2(5, 0)).easing(this.myEase())
                            ), 10
                        )
                    );
                }),
                cc.repeat(
                    cc.sequence(
                        cc.rotateTo(0.2, 16),
                        cc.rotateTo(0.2, -32)
                    ), 5
                ),
                cc.callFunc(() => {
                    this.isPlayAni = false;
                    this.egg[2].active = false;
                    if (this.eggCount <= 1) {
                        this.egg[this.eggCount].active = true;
                        this.egg[this.eggCount].opacity = 0;
                        this.egg[this.eggCount].runAction(cc.fadeIn(0.5));
                    }
                    this.prop[7].active = false;
                    if (this.eggCount == 2) {
                        return
                    }
                    this.eggCount++;
                })
            )

        )
    },

    //开门
    continue3() {
        this.isPlayAni = true;
        this.bubble[2].active = false;
        this.door.active = true;
        this.chicken.active = true;
        this.chicken.opacity = 0;
        this.chicken.runAction(
            cc.sequence(
                cc.fadeIn(1),
                cc.callFunc(() => {
                    this.bubble[0].active = true;
                }),
                cc.delayTime(1.5),
                cc.callFunc(() => {
                    this.bubble[0].active = false;
                    this.bubble[1].active = true;
                    this.isPlayAni = false;
                })
            )
        )
    },

    //生蛋
    continue4() {
        let action0 = cc.sequence(
            cc.scaleTo(0.5, 1.1),
            cc.scaleTo(0.1, 1),
        )
        this.prop[3].opacity = 0;
        let action1 = cc.spawn(
            cc.fadeIn(1).easing(cc.easeOut(10)),
            cc.moveBy(1, cc.v2(0, -50))
        )

        let nodes = [this.chicken,this.prop[3]];
        let actions = [action0,action1];
        this.runSeqAction(nodes, actions);
    },

    //点盘子
    continue5() {
        let action0 = cc.sequence(
            cc.moveTo(0.5, cc.v2(90, -80)),
            cc.callFunc(() => {
                this.egg[0].runAction(cc.fadeOut(2));
                this.egg[1].runAction(cc.fadeOut(2));
                this.prop[0].runAction(cc.fadeOut(2));
            }),
            cc.repeat(
                (
                    cc.sequence(
                        cc.scaleTo(0.2, 1.1),
                        cc.scaleTo(0.2, 1)
                    )
                ), 4
            ),
            cc.callFunc(() => {
                if (this.isSetOne && this.eggCount == 2) { //好结局
                    this.gameCtrl.toHappyEnd(0, 1);
                } else if (this.isSetOne && this.eggCount == 1) { //10
                    this.gameCtrl.toBadEnd(1);
                } else if (this.isSetOne && this.eggCount == 0) { //1
                    this.gameCtrl.toBadEnd(2);
                } else { //00
                    this.gameCtrl.toBadEnd(3);
                }
            })
        )

        let nodes = [this.role1];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    //吃红薯
    badEnd1() {
        this.bubble[2].active = false;

        let action0 = cc.sequence(
            cc.repeat(
                (
                    cc.sequence(
                        cc.scaleTo(0.2, 1.1),
                        cc.scaleTo(0.2, 1)
                    )
                ), 4
            ),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )

        let nodes = [this.role1];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    //吃鸡蛋
    badEnd2() {
        let action0 = cc.sequence(
            cc.repeat(
                (
                    cc.sequence(
                        cc.scaleTo(0.2, 1.1),
                        cc.scaleTo(0.2, 1)
                    )
                ), 4
            ),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(4);
            })
        )

        let nodes = [this.role1];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    // update (dt) {},
});