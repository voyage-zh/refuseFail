var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        role2: {
            default: [],
            type: cc.Node
        },
        answer: {
            default: [],
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.answerCount = 0;
        this.answerProgress = 0;

        //写答案事件
        for (let i = 0, len = this.answer.length; i < len; i++) {
            let posX = this.answer[i].x;
            this.answer[i].on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isPlayAni) return
                this.writeAnswer(posX, this.answer[i].children[0]);
                this.answerCount++;
                if (i == 0 || i == 2 || i == 3) this.answerProgress++;
                this.answer[i].off(cc.Node.EventType.TOUCH_END);
            })
        }
    },

    //写答案
    writeAnswer(posX, node) {
        this.isPlayAni = true;
        this.role1[0].x = posX;
        this.role1[0].opacity =0;
        this.role1[0].active = true;
        this.role1[0].runAction(
            cc.sequence(
                cc.fadeIn(0.2),
                cc.callFunc(() => { this.spriteToShow(node, 0.3, "fillRange", 0, 1) }),
                cc.repeat(
                    cc.sequence(
                        cc.moveBy(0.1, cc.v2(0, 20)),
                        cc.moveBy(0.1, cc.v2(0, -20)),
                        cc.moveBy(0.1, cc.v2(0, 20)),
                        cc.moveBy(0.1, cc.v2(0, -20)),
                        cc.delayTime(0.2)
                    ), 2
                ),
                cc.fadeOut(0.2),
                cc.callFunc(() => {
                    this.isPlayAni = false;
                    this.role1[0].active = false;
                    if (this.answerCount >= 3) {   //判断答案
                        if (this.answerProgress >= 3) {
                            this.happyEnd();
                        } else {
                            this.badEnd();
                        }
                    }
                })
            )
        )
    },

    badEnd() {
        this.role2[0].active = false;
        this.role2[1].active = true;
        this.role1[2].active = true;

        let action0 = cc.sequence(
            cc.toggleVisibility(),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.role2[1].active = false;
                this.role1[2].active = false;
            }),
            cc.toggleVisibility(),
            cc.moveTo(1.5,cc.v2(-296,73)),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(0,1);
            })
        )
        this.runSeqAction(this.role2[2], action0);
    },

    happyEnd() {
        this.role1[1].active = true;

        let action0 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )
        this.runSeqAction(this.role1[1], action0);
    }


    // update (dt) {},
});