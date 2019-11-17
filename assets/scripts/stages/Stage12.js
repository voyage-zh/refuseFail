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
        drawerClose: {
            default: [],
            type: cc.Node
        },
        drawerOpen: {
            default: [],
            type: cc.Node
        },
        door: {
            default: [],
            type: cc.Node
        },
        logo: {
            default: null,
            type: cc.Node
        },
        target: {
            default: null,
            type: cc.Node
        },
        line: {
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
        role3: {
            default: null,
            type: cc.Node
        },
        BEAni: {
            default: [],
            type: cc.Node
        },
        HEImg: {
            default: null,
            type: cc.SpriteFrame
        },
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.addSceneChange(this.root);

        this.addDrawerEvent(this.drawerClose, this.drawerOpen, [null, this.prop[1], this.prop[0]])

        this.addEventToGetProp(this.prop[0], this.role1[0], this.continue1.bind(this));   //鞋
        this.addEventToGetProp(this.prop[1], this.target, this.continue2.bind(this));   //马克笔

        this.isWearShoes = false;
        this.isSetLogo = false;

        this.prop[2].on(cc.Node.EventType.TOUCH_END, () => {    //包
            if (this.isPlayAni) return;
            this.badEnd3();
        })

        this.door[0].on(cc.Node.EventType.TOUCH_END, () => {    //门
            if (this.isPlayAni) return;
            this.continue3();
        })

    },

    //穿高跟鞋
    continue1() {
        this.isWearShoes = true;
        this.role1[1].active = true;
    },

    //画上女厕
    continue2() {
        this.isSetLogo = true;
        this.logo.active = true;
    },

    //男主进厕所
    continue3() {

        let action = cc.sequence(
            cc.moveTo(1.5, cc.v2(138, 37)),
            cc.callFunc(() => {
                this.role1[0].setSiblingIndex(this.door[0].getSiblingIndex());
            }),
            cc.delayTime(0.5),
            cc.moveTo(0.5, cc.v2(33, 94)),
            cc.callFunc(() => {
                this.door[0].active = false;
                this.door[1].active = true;
                this.continue4();
            })
        )

        this.runSeqAction(this.role1[0], action);
    },

    //判断男主进厕所后...
    continue4() {
        if (this.isWearShoes) {
            if (this.isSetLogo) {
                this.happyEnd();
            } else {
                this.badEnd2();
            }
        } else {
            this.badEnd1();
        }
    },

    //通用动画
    ani() {
        //鸡头移动,并望向脚0
        let action0 = cc.sequence(
            cc.moveTo(2, cc.v2(-178, -26)),
            cc.callFunc(() => {
                this.role2[0].opacity = 0;
                this.role2[1].active = true;
            }),
            this.setLineOfSight(this.line, cc.v2(-100, 9.2), 4, 30, 4, 0.2, 1.5),
            cc.callFunc(() => {
                this.role2[1].active = false;
                this.role2[0].active = false;
            })
        )

        //鸡头望向厕所标志
        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.role2[2].active = true;
            }),
            this.setLineOfSight(this.line, cc.v2(-228, 49), 250, 30, 4, 0.2, 1.5),
        )

        //鸡头拖走男主
        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.BEAni[0].active = true;
                this.BEAni[1].opacity = 0;
                this.BEAni[0].position = cc.v2(38, -73);
                this.role1[0].active = false;
                this.role2[1].active = false;
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.BEAni[0].active = false;
                this.BEAni[1].opacity = 255;
                this.BEAni[1].position = cc.v2(38, -73);
            }),
            cc.moveBy(1, cc.v2(372, -32)),
            cc.fadeOut(1)
        )

        return {
            nodes: [this.role2[0], this.role2[2], this.BEAni[1]],
            actions: [action0, action1, action2]
        }
    },

    //直接进门或没穿鞋，直接拖走坏结局
    badEnd1() {
        let action = cc.callFunc(() => {
            if(this.isSetLogo){
                this.gameCtrl.toBadEnd(2);
            }else{
                this.gameCtrl.toBadEnd(0);
            }
        })

        let mAni = this.ani();
        let nodes = [mAni.nodes[0], mAni.nodes[2], this.root];
        let actions = [mAni.actions[0], mAni.actions[2], action];
        this.runSeqAction(nodes, actions);
    },

    //没画厕所标志坏结局
    badEnd2() {
        let action2 = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                this.bubble[1].active = false;
                this.role2[2].active = false;
            }),
        )
        let action4 = cc.callFunc(() => {
            this.gameCtrl.toBadEnd(1);
        })

        let mAni = this.ani();
        let nodes = [mAni.nodes[0], mAni.nodes[1], this.bubble[1], mAni.nodes[2], this.root];
        let actions = [mAni.actions[0], mAni.actions[1], action2, mAni.actions[2], action4];
        this.runSeqAction(nodes, actions);
    },

    //被老师拖走坏结局
    badEnd3() {
        let action0 = cc.spawn(
            cc.moveTo(1,cc.v2(-125,108)),
            cc.delayTime(0.5)
        )

        let action1 = cc.sequence(
            cc.moveTo(0.5, cc.v2(-312, -106)),
            cc.callFunc(() => {
                this.bubble[0].active = true;
            }),
            cc.delayTime(2),
        )

        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.role1[0].active = false;
                this.role3.active = false;
                this.bubble[0].active = false;
            }),
            cc.moveTo(1, cc.v2(-353, 94)),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(3);
            })
        )

        let nodes = [this.role1[0], this.role3, this.BEAni[2]];
        let actions = [action0, action1, action2]
        this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.role2[4].opacity = 0;
                this.bubble[2].active = true;
            }),
            cc.fadeIn(2).easing(cc.easeOut(3)),
            cc.fadeOut(0),
            cc.callFunc(() => {
                this.bubble[2].active = false;
                this.role2[2].active = false;
            })
        )

        let action3 = cc.sequence(
            cc.moveTo(1, cc.v2(372, -32)),
            cc.fadeOut(0.5),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0, this.HEImg);
            })
        )

        let mAni = this.ani();
        let nodes = [mAni.nodes[0], mAni.nodes[1], this.role2[4], this.role2[3]];
        let actions = [mAni.actions[0], mAni.actions[1], action2, action3]
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
