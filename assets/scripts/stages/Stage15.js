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
        cabinet:{
            default: [],
            type: cc.Node
        },
        curtain:{
            default: [],
            type: cc.Node
        },
        //角色
        role1: {
            default: null,
            type: cc.Node
        },
        role2: {
            default: [],
            type: cc.Node
        },
        float: {
            default: null,
            type: cc.Node
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.float, "Bubble1", "Bubble2");

        this.addSceneChange(this.root);

        this.teacherIsCareful = true;

        this.prop[4].on(cc.Node.EventType.TOUCH_END, () => {  //门
            if (this.isPlayAni) return
            if(this.teacherIsCareful){
                this.badEnd1();
            }else{
                this.happyEnd();
            }
        })

        this.prop[3].on(cc.Node.EventType.TOUCH_END, () => {  //桌子
            if (this.isPlayAni || !this.teacherIsCareful) return
            this.badEnd2();
        })

        this.isSetHair = false;
        this.isSetMirror = false;

        this.addEventToGetProp(this.prop[1], [this.prop[3],this.role2[0]], [this.continue1.bind(this),this.badEnd3.bind(this)])    //头发
        this.addEventToGetProp(this.prop[2], this.prop[3], this.continue2.bind(this))    //镜子

        this.addCabinetEvent(this.cabinet[0], this.cabinet[1], this.prop[1]);   //柜子
        this.addCabinetEvent(this.curtain[0], this.curtain[1], null);
    },

    //放头发
    continue1() {
        this.prop[1].position = cc.v2(106,123);
        this.prop[1].active = true;
        this.isSetHair = true;
    },

    //放镜子
    continue2() {
        this.prop[2].position = cc.v2(200,240.6);
        this.prop[2].active = true;
        this.isSetMirror = true;
    },

    //update触发主任照镜子
    continue3(){
        this.float.active = false;
        this.role1.active = false;
        this.prop[1].active = false
        this.role2[0].active = false;
        this.role2[2].active = true;
        this.role2[3].active = true;
        this.teacherIsCareful = false;
    },

    //通用动画
    ani() {
        //主任生气拖走
        let action0 = cc.sequence(
            cc.toggleVisibility(),
            cc.callFunc(() => {
                this.role2[0].active = false;
                this.role2[1].active = true;
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.role1.active = false;
                this.role2[1].active = false;
            }),
            cc.toggleVisibility(),
            cc.moveTo(1.5,cc.v2(-368,76)),
            cc.fadeOut(0.3)
        )

        return {
            nodes: [this.role2[4]],
            actions: [action0]
        }
    },

    //直接点门
    badEnd1() {
        this.float.active = false;
        let action0 = cc.moveTo(0.5, cc.v2(-25, -108));

        let action1 = cc.callFunc(()=>{
            this.gameCtrl.toBadEnd(0,1);
        })
        

        let mAni = this.ani();
        let nodes = [this.role1, mAni.nodes[0],this.node];
        let actions = [action0, mAni.actions[0],action1];
        this.runSeqAction(nodes, actions);
    },

    //直接点桌子
    badEnd2() {
        this.float.active = false;
        let action0 = cc.moveTo(0.5, cc.v2(180, -47));

        let action1 = cc.callFunc(()=>{
            this.gameCtrl.toBadEnd(0,1);
        })

        let mAni = this.ani();
        let nodes = [this.role1, mAni.nodes[0],this.node];
        let actions = [action0, mAni.actions[0],action1];
        this.runSeqAction(nodes, actions);
    },

    //头发给主任
    badEnd3(){
        this.float.active = false;

        this.prop[1].position = cc.v2(-265.6, 174.1);
        this.prop[1].children[0].scale = cc.v2(-0.85,0.85);
        this.prop[1].active = true;

        let action0 = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.prop[1].active = false;
            })
        )

        let action1 = cc.callFunc(()=>{
            this.gameCtrl.toBadEnd(1,1);
        })

        let mAni = this.ani();
        let nodes = [this.role1, mAni.nodes[0],this.node];
        let actions = [action0, mAni.actions[0],action1];
        this.runSeqAction(nodes, actions);
    },

    happyEnd() {
        this.role1.position = cc.v2(-307,154);
        this.role1.scaleX = -1;
        this.role1.opacity = 0;
        
        let action0 = cc.sequence(
            cc.fadeIn(1),
            cc.moveTo(0.2,cc.v2(-283.5,154)),
            cc.callFunc(()=>{
                this.prop[0].active = true;
            }),
            cc.delayTime(0.1),
            cc.fadeOut(0.6),
            cc.callFunc(()=>{
                this.prop[0].active = false;
            }),
            cc.delayTime(1),
            cc.callFunc(()=>{
                this.gameCtrl.toHappyEnd(0);
            })
        )

        let nodes = [this.role1];
        let actions = [action0];

        this.runSeqAction(nodes, actions);
    },


    update (dt) {
        if(this.isSetHair&&this.isSetMirror){
            if(this.root.position.x == -750){
                this.continue3();
                this.isSetHair = false;
                this.isSetMirror = false;
            }
        }
    },
});
