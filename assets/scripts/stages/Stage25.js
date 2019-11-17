var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        root:{
            default: null,
            type: cc.Node
        },
        prop: {
            default: [],
            type: cc.Node
        },
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        float: {
            default: null,
            type: cc.Node
        },
        box: {
            default: [],
            type: cc.Node
        },
        borad: {
            default: [],
            type: cc.Node
        },
        target: {
            default: null,
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.float, "bubble1", "bubble2");

        this.addSceneChange(this.root);

        let boradCount = 0;
        this.target.on(cc.Node.EventType.TOUCH_END, () => {     //黑板
            if (this.isPlayAni || boradCount == 2) return
            switch (boradCount) {
                case 0:
                    this.borad[0].active = false;
                    this.borad[1].active = true;
                    break;
                case 1:
                    this.borad[1].active = false;
                    this.borad[2].active = true;
                    this.prop[0].active = true;
                    this.target.active = false;
                    break;
            }
            boradCount++;
        })

        this.addEventToGetProp(this.prop[0],this.box[0],this.continue1.bind(this));//钥匙

        this.addEventToGetProp(this.prop[1],this.box[0],this.badEnd1.bind(this));//石头

        this.setBoxEvent();

        this.boxCount = 0;

    },

    //拖动宝箱
    setBoxEvent(){
        let box = this.box[0];
        let isTouch = false;
        //按下修改标志
        box.on(cc.Node.EventType.TOUCH_START, (event) => {
            if (this.isPlayAni) return;
            box.stopAllActions();
            box.runAction(cc.scaleTo(0.5,1.03).easing(cc.easeOut(8)));
            isTouch = true;
        });

        //移动逻辑
        box.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            if (!isTouch) return; //只有当用户按下才能拖拽
            //获取距离上一次点的信息
            let delta = event.getDelta();
            //移动节点
            if((box.x<=827 && delta.x<0) || (box.x>=971 && delta.x>0)){
                return
            }
            box.x += delta.x*0.5;
        });

        let self = this;

        function touchEnd() {
            isTouch = false;
            box.stopAllActions();
            box.runAction(cc.scaleTo(0.2,1));
            if(box.x>=960 && !self.isPlayAni){
                self.happyEnd();
                self.isPlayAni = true;
            }
        };
        //当抬起的时候结束逻辑
        box.on(cc.Node.EventType.TOUCH_END, (event) => {
            touchEnd();
        });
        //移除屏幕也要添加结束逻辑
        box.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
            touchEnd();
        });
    },

    //重新入栏，不显示弹窗
    mPocketPush(propNode, targetNode, trueCallback){
        propNode.active = false;
        let propName = propNode.name;
        let prop = cc.find(propName, this.pocket);
        prop.off(cc.Node.EventType.TOUCH_START);
        prop.off(cc.Node.EventType.TOUCH_MOVE);
        prop.off(cc.Node.EventType.TOUCH_END);
        prop.off(cc.Node.EventType.TOUCH_CANCEL);
        for (let i = 0, len = this.pocketTag.length; i < len; i++) {
            if (this.pocketTag[i] === 0) {
                this.pocketTag[i] = propName;
                prop.active = true;
                prop.opacity = 100;
                prop.runAction(cc.fadeIn(0.2));
                this.propDragEvent(prop, targetNode, trueCallback);
                break;
            }
        }
    },

    //开宝箱逻辑
    continue1(){
        switch (this.boxCount) {
            case 0:
                this.box[1].active = false;
                this.box[2].active = true;
                this.box[3].active = true;
                this.mPocketPush(this.prop[0],this.box[0],this.continue1.bind(this));
                break;
            case 1:
                this.box[3].active = false;
                this.box[4].active = true;
                this.box[5].active = true;
                this.mPocketPush(this.prop[0],this.box[0],this.continue1.bind(this));
                break;
            case 2:
                this.box[5].active = false;
                this.box[6].active = true;
                this.badEnd2();
                break;
        }
        this.boxCount++;
    },

    //被石头砸
    badEnd1() {
        this.float.active = false;
        this.role1[0].opacity = 0;
        this.role1[0].position = cc.v2(492,-171);
        this.prop[1].position = cc.v2(557,-184);
        this.prop[1].scale = 0.6;
        let hurt = this.role1[2].children[0];
        let action0 = cc.fadeIn(0.2);

        let action1 = cc.sequence(
            cc.bezierTo(0.5,[cc.v2(557,-184),cc.v2(659,-102),cc.v2(774,-153)]),
            cc.bezierTo(0.5,[cc.v2(774,-153),cc.v2(659,2),cc.v2(489,-31)]),
            cc.callFunc(()=>{
                this.role1[0].active = false;
                this.role1[2].active = true;
            })
        )

        let action2 = cc.sequence(
            cc.callFunc(()=>{
                this.prop[1].runAction(
                    cc.spawn(
                        cc.moveBy(0.3,cc.v2(-10,0)),
                        cc.fadeOut(0.3)
                    )
                )
            }),
            cc.scaleTo(1.5,1.1),
            cc.delayTime(0.5),
            cc.callFunc(()=>{
                this.gameCtrl.toBadEnd(0);
            })
        )

        let nodes = [this.role1[0],this.prop[1],hurt]
        let actions = [action0,action1,action2]
        this.runSeqAction(nodes, actions);
    },

    //开完箱子
    badEnd2() {
        this.float.active = false;

        this.prop[3].opacity = 0;
        this.prop[3].active = true;

        let action0 = cc.sequence(
            cc.spawn(
                cc.fadeIn(2).easing(cc.easeOut(10)),
                cc.moveBy(2,cc.v2(0,30)).easing(cc.easeOut(3)),
            ),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1);
            })
        )
        this.runSeqAction(this.prop[3], action0);
    },

    happyEnd() {
        this.float.active = false;
        this.role1[0].active =false;
        this.role1[1].active =true;

        let action0 = cc.sequence(
            cc.spawn(
                cc.scaleTo(1.5,1),
                cc.moveTo(1.5,cc.v2(645,130))
            ),
            cc.delayTime(1),
            cc.callFunc(() => {
                this.gameCtrl.toHappyEnd(0);
            })
        )

        this.runSeqAction(this.prop[2], action0);
    }


    // update (dt) {},
});
