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
            default: null,
            type: cc.Node
        },
        curtain: {
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
        float: {
            default: null,
            type: cc.Node
        },
        flower: {
            default: [],
            type: cc.Node
        },
        target: {
            default: [],
            type: cc.Node
        },
        other: {
            default: [],
            type: cc.Node
        },
        //密码锁
        lock: {
            default: null,
            type: cc.Node
        },
        lockNum: {
            default: null,
            type: cc.RichText
        },
        lockBtn: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.float, "Bubble1", "Bubble2");

        this.addSceneChange(this.root);

        this.other[0].on(cc.Node.EventType.TOUCH_END, () => {   //摇树
            if (this.isPlayAni) return
            this.continue1();
            this.other[0].off(cc.Node.EventType.TOUCH_END);
        })

        this.isSetCheep = false;
        this.curtain[0].on(cc.Node.EventType.TOUCH_END, () => {        //窗帘
            if (this.isPlayAni) return
            this.curtain[0].active = false;
            this.curtain[1].active = true;
            if (this.isSetCheep) {
                this.role3[1].active = true;
                this.other[1].active = true;
            } else {
                this.role3[0].active = true;
            }
        })
        this.curtain[1].on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return
            this.curtain[1].active = false;
            this.curtain[0].active = true;
            this.role3[0].active = false;
            this.role3[1].active = false;
            this.other[1].active = false;
        })

        for (let i = 1; i < 4; i++) {       //点花
            this.target[i].on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isPlayAni) return
                this.badEnd2(i - 1);

            })
        }

        this.setLockEvent();

        this.addEventToGetProp(this.prop, this.role3[0], this.continue2.bind(this))    //薯片

    },

    //点花事件
    clickFlower() {

    },

    //密码锁事件
    setLockEvent() {
        let lockNode = this.lock;
        let mask = cc.find("Mask", lockNode);

        this.target[0].on(cc.Node.EventType.TOUCH_END, () => { //开界面
            if (this.isPlayAni) return
            this.isPlayAni = true;
            lockNode.active = true;
            lockNode.scale = 0;
            lockNode.opacity = 100;
            lockNode.runAction(
                cc.sequence(
                    cc.spawn(
                        cc.fadeIn(0.2),
                        cc.scaleTo(0.2, 1)
                    ),
                    cc.callFunc(() => {
                        this.isPlayAni = false;
                    })
                )
            )
        })

        mask.on(cc.Node.EventType.TOUCH_END, () => {   //关界面
            if (this.isPlayAni) return
            lockNode.active = false;
        })

        //密码锁逻辑
        this.lockLogic("3257", this.lockBtn, this.lockNum, mask, this.badEnd1.bind(this), this.happyEnd.bind(this))
    },

    //密码锁逻辑
    lockLogic(answer, btnArr, richTxt, cancel, falseCb, trueCb) {
        // let del = btnArr[10];
        // let ok = btnArr[11];
        let numStr = "";

        let changeLabel = () => {
            richTxt.string = "<b>" + numStr + "</b>";
        }

        let btnTag = -1; //是否按下按钮
        for (let i = 0; i < 12; i++) {
            //绑动画
            btnArr[i].on(cc.Node.EventType.TOUCH_START, () => {
                if (this.isPlayAni) return;
                btnArr[i].runAction(cc.scaleTo(0.1, 1.1));
                btnTag = i;
            });
            btnArr[i].on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isPlayAni) return;
                btnArr[i].runAction(cc.scaleTo(0.1, 1));
                if (btnTag != i) return
                if (numStr.length < 4 && i < 10) {    //输入逻辑
                    numStr += i.toString();
                    changeLabel();
                } else if (i == 10) {  //删除
                    numStr = numStr.substr(0, numStr.length - 1);
                    changeLabel();
                } else if (i == 11) {    //ok逻辑
                    if (numStr == answer) {
                        trueCb();
                    } else {
                        falseCb();
                    }
                }
            }, this);
            btnArr[i].on(cc.Node.EventType.TOUCH_CANCEL, () => {
                if (this.isPlayAni) return;
                btnArr[i].runAction(cc.scaleTo(0.1, 1));
            }, this);
        }

        cancel.on(cc.Node.EventType.TOUCH_END, () => {
            numStr = "";
            changeLabel()
        })
    },

    //摇树
    continue1() {
        this.isPlayAni = true;
        this.other[0].runAction(
            cc.sequence(
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.1, cc.v2(-5, 0)),
                        cc.moveBy(0.1, cc.v2(5, 0))
                    ), 5
                ),
                cc.callFunc(() => {
                    this.prop.active = true;
                    this.prop.opacity = 0;
                    this.prop.runAction(
                        cc.spawn(
                            cc.moveBy(0.5, cc.v2(0, -40)).easing(cc.easeIn(3)),
                            cc.fadeIn(0.5).easing(cc.easeOut(8))
                        )
                    )
                }),
                cc.delayTime(0.5),
                cc.callFunc(() => {
                    this.isPlayAni = false;
                })
            )
        )
    },

    //鸡头放话
    continue2() {
        this.role3[0].active = false;
        this.role3[1].active = true;
        this.isSetCheep = true;
        this.other[1].active = true;
    },

    //密码错误
    badEnd1() {
        this.float.active = false;
        this.role1[0].active = false;
        this.role1[1].active = true;
        this.lock.active = false;

        let action1 = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0);
            })
        )
        this.runSeqAction(this.node, action1);
    },

    //点花
    badEnd2(index) {
        this.float.active = false;

        this.role1[0].opacity = 0;
        this.role1[0].position = cc.v2(649, -55);

        this.role2[0].active = true;

        let action0 = cc.fadeIn(0.5);

        let action1 = cc.repeat(
            cc.sequence(
                cc.moveBy(0.1, cc.v2(-5, 0)),
                cc.moveBy(0.1, cc.v2(5, 0))
            ), 5
        )

        let action2 = cc.moveBy(1, cc.v2(-150, 0));

        let action3 = cc.sequence(
            cc.toggleVisibility(),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                this.role1[0].active = false;
                this.role2[0].active = false;
            }),
            cc.toggleVisibility(),
            cc.moveTo(1.5, cc.v2(1070, -6)),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1, 1);
            })
        )

        let nodes = [this.role1[0], this.flower[index], this.role2[0], this.role2[1]];
        let actions = [action0, action1, action2, action3];
        this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        this.float.active = false;

        this.lock.active = false;
        
        this.other[3].active = true;

        let action0 = cc.sequence(
            cc.delayTime(1),
            cc.moveTo(0.5, cc.v2(-227, 156)),
            cc.fadeOut(0.6),
            cc.delayTime(0.5),
            cc.callFunc(()=>{
                this.other[3].active = false;
            }),
            cc.delayTime(0.3),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        this.runSeqAction(this.role1[0], action0);
    }
});
