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
        line:{
            default: null,
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
        //拖走动画,要设置初始位置
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

        this.addDrawerEvent(this.drawerClose, this.drawerOpen, [this.prop[1], null, this.prop[2]])

        this.addEventToGetProp(this.prop[0], this.door[0], this.continue.bind(this));   //牌子
        this.addEventToGetProp(this.prop[1], this.role2[0], this.badEnd1.bind(this));   //钱
        this.addEventToGetProp(this.prop[2], [this.role1[0], this.role2[0]], [this.badEnd2.bind(this), this.badEnd3.bind(this)]);   //游戏机

        this.isSetWarn = false;
        this.door[0].on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return;
            if (this.isSetWarn) {
                this.happyEnd();
            } else {
                this.badEnd4();
            }
        })
    },

    //给门上牌子
    continue(){
        this.isSetWarn = true;
        this.prop[0].active = true;
        this.prop[0].position = cc.v2(28,13);
    },

    //通用动画
    ani() {
        //鸡头感叹号0
        let action0 = cc.sequence(
            cc.callFunc(() => {
                this.role2[3].opacity = 0;
            }),
            cc.fadeIn(1).easing(cc.easeOut(3)),
            cc.fadeOut(0)
        )

        //鸡头移动1
        let action1 = cc.sequence(
            cc.spawn(
                cc.moveTo(2, cc.v2(-178, -26)),
                cc.callFunc(() => {
                    this.changeScene(this.root,false,0.5);
                })
            ),
            cc.callFunc(() => {
                this.role2[0].opacity = 0;
                this.role2[1].active = true;
            }),
            cc.delayTime(1)
        )

        //鸡头拖走男主2
        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.BEAni[0].active = true;
                this.BEAni[1].opacity = 0;
                this.BEAni[0].position = this.role1[0].position;
                this.role1[0].active = false;
                this.role2[1].active = false;
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.BEAni[0].active = false;
                this.BEAni[1].opacity = 255;
                this.BEAni[1].position = this.role1[0].position;
            }),
            cc.moveBy(1, cc.v2(400, 0)),
            cc.fadeOut(1),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )

        //鸡头丢游戏机3
        let action3 = cc.sequence(
            cc.callFunc(() => {
                this.role2[0].active = false;
            }),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role2[0].active = true;
                this.role2[2].active = false;
            })
        )

        //男主开门4
        let action4 = cc.sequence(
            cc.moveTo(1.5, cc.v2(138, 37)),
            cc.callFunc(() => {
                this.role1[0].setSiblingIndex(this.door[0].getSiblingIndex());
            }),
            cc.delayTime(0.5),
            cc.moveTo(0.5, cc.v2(33, 94)),
            cc.callFunc(() => {
                this.door[0].active = false;
                this.door[1].active = true;
            })
        )

        return {
            nodes: [this.role2[3], this.role2[0], this.BEAni[1], this.role2[2], this.role1[0]],
            actions: [action0, action1, action2, action3, action4]
        }
    },

    //给钱拖走坏结局
    badEnd1() {
        let mAni = this.ani();
        let nodes = [mAni.nodes[0], mAni.nodes[1], mAni.nodes[2]];
        let actions = [mAni.actions[0], mAni.actions[1], mAni.actions[2]]
        this.runSeqAction(nodes, actions);
    },

    //玩游戏机坏结局
    badEnd2() {
        if (this.isPlayAni) return;
        let action = cc.sequence(
            cc.callFunc(() => {
                this.role1[0].active = 0;
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
                this.gameCtrl.toBadEnd(1);
            })
        )

        this.runSeqAction(this.role1[1], action);
    },

    //丢游戏机坏结局
    badEnd3() {
        let mAni = this.ani();
        let nodes = [mAni.nodes[0], mAni.nodes[3], mAni.nodes[1], mAni.nodes[2]];
        let actions = [mAni.actions[0], mAni.actions[3], mAni.actions[1], mAni.actions[2]]
        this.runSeqAction(nodes, actions);
    },

    //开门被拖走坏结局
    badEnd4() {
        //鸡头移动
        let action = cc.sequence(
            cc.moveTo(2,cc.v2(-178, -26)),
            cc.callFunc(()=>{
                this.role2[0].opacity = 0;
                this.role2[1].active = true;
            }),
            this.setLineOfSight(this.line, cc.v2(-100, 9.2), 4, 30, 4, 0.2, 1.5),
            cc.callFunc(()=>{
                this.door[0].active = true;
                this.door[1].active = false;
                this.role1[0].position = cc.v2(24,-17); 
                this.role1[0].active = false;
            })
        )

        let mAni = this.ani();
        let nodes = [mAni.nodes[4],this.role2[0],mAni.nodes[2]];
        let actions = [mAni.actions[4],action,mAni.actions[2]]
        this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        let action = cc.sequence(
            cc.moveTo(2,cc.v2(-374,0)),
            cc.fadeOut(1),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0,this.HEImg);
            })
        )
        
        let mAni = this.ani();
        let nodes = [mAni.nodes[4],this.role2[0]];
        let actions = [mAni.actions[4],action]
        this.runSeqAction(nodes, actions);
    },
});
