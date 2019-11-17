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
        bag: {
            default: [],
            type: cc.Node
        },
        float: {
            default: null,
            type: cc.Node
        },
        effect: {
            default: [],
            type: cc.Node
        },
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        role2: {
            default: null,
            type: cc.Node
        },
        role3: {
            default: [],
            type: cc.Node
        },
        //结局图
        HEImg:{
            default: null,
            type: cc.SpriteFrame
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.addSceneChange(this.root);

        this.setFloating(this.float, "bubble1", "bubble2");

        this.setGirlSound();

        this.isOnMusic = false;

        this.prop[3].on(cc.Node.EventType.TOUCH_END, () => {    //奶茶
            if (this.isPlayAni) return;
            this.badEnd1();
        })

        this.addEventToGetProp(this.prop[0], this.role1[4], this.badEnd2.bind(this));   //手机


        this.role2.on(cc.Node.EventType.TOUCH_END, () => {    //cxk
            if (this.isPlayAni || !this.isOnMusic) return;
            this.happyEnd();
        })

        this.bag[0].on(cc.Node.EventType.TOUCH_END, () => {     //开包
            this.bag[0].active = false;
            this.bag[1].active = true;
            this.prop[1].active = true;
        });

        this.addEventToGetProp(this.prop[1], this.prop[2], this.continue.bind(this));   //磁带
    },

    //女孩哈哈哈
    setGirlSound() {
        let node1 = cc.find("Effect1_1", this.effect[0]);
        let node2 = cc.find("Effect1_2", this.effect[0]);

        node1.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.1, 1.3),
                    cc.scaleTo(0.1, 1)
                )
            )
        );
        node2.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.rotateTo(0.5, 12).easing(this.myEase()),
                    cc.rotateTo(0.5, 0).easing(this.myEase())
                )
            )
        );
    },

    //磁带进收音机
    continue(){
        this.isOnMusic = true;

        //收音机动画
        this.effect[1].active = true;
        this.effect[1].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.2,1.2),
                    cc.scaleTo(0.2,1.0),
                )
            )
        );
        this.prop[2].scale = 1.1;
        this.prop[2].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.2,1),
                    cc.scaleTo(0.2,1.1),
                )
            )
        )
    },


    //拿奶茶坏结局
    badEnd1() {
        this.float.active = false;

        //男主移动
        let action0 = cc.sequence(
            cc.spawn(
                cc.moveBy(2, cc.v2(-89, 0)),
                cc.callFunc(() => {
                    this.role1[1].runAction(cc.moveBy(2, cc.v2(-89, 0)));
                })
            ),
            cc.callFunc(() => {
                this.role1[0].opacity = 0;
                this.role1[1].active = false;
                this.role1[2].active = true;
                this.effect[0].active = false;
                this.role3[1].active = true;
                this.role3[0].scale = 1.4;
                this.role3[0].position = cc.v2(-184,47);
            }),
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )

        let nodes = [this.role1[0]];
        let actions = [action0];
        this.runSeqAction(nodes, actions);
    },

    //玩手机坏结局
    badEnd2() {
        this.role1[0].active = false;
        this.float.active = false;

        let action = cc.sequence(
            cc.spawn(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.2, cc.v2(-5, 0)).easing(this.myEase()),
                        cc.moveBy(0.2, cc.v2(5, 0)).easing(this.myEase())
                    ), 5
                ),
                cc.callFunc(() => {
                    this.role1[1].runAction(
                        cc.repeat(
                            cc.sequence(
                                cc.moveBy(0.2, cc.v2(-5, 0)).easing(this.myEase()),
                                cc.moveBy(0.2, cc.v2(5, 0)).easing(this.myEase())
                            ), 5
                        )
                    )
                })
            ),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1);
            })
        )

        this.runSeqAction(this.role1[3], action);
    },

    happyEnd() {
        this.role3[0].active = false;
        this.effect[0].active = false;
        this.float.active = false;

        this.effect[2].active = true;
        this.effect[2].runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.2,1),
                    cc.scaleTo(0.2,1.1),
                )
            )
        );

        let action0 = cc.moveTo(2,cc.v2(866,-200));

        let action1 = cc.sequence(
            cc.moveTo(0.5,cc.v2(475,-170)),
            cc.delayTime(1.5),
            cc.callFunc(()=>{
                this.changeScene(this.root,false,0.5);
                
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.role1[5].active = true;
            }),
            cc.delayTime(2),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0,this.HEImg);
            })
        )

        let nodes = [this.role2,this.role3[2]];
        let actions = [action0,action1];
        this.runSeqAction(nodes, actions);
    }


    // update (dt) {},
});
