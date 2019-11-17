var StageBase = require("StageBase");

cc.Class({
    extends: StageBase,

    properties: {
        //道具
        prop: {
            default: [],
            type: cc.Node
        },
        //角色
        role1: {
            default: [],
            type: cc.Node
        },
        xieFloat:{
            default: null,
            type: cc.Node
        },
        light:{
            default: null,
            type: cc.Node
        },
        role2:{
            default: [],
            type: cc.Node
        },
        //目标区域
        target: {
            default: [],
            type: cc.Node
        },
        BE1Img: {
            default: null,
            type: cc.SpriteFrame
        }
    },

    // onLoad () {
    //     this._super();

    // },

    start() {
        this.setFloating(this.xieFloat,"xie1","xie2");

        this.teacherIsCareful = true;

        this.addEventToGetProp(this.prop[0], this.target[0], this.continue1.bind(this));
        this.addEventToGetProp(this.prop[1], [this.target[0],this.target[1]], [this.badEnd2.bind(this),this.continue2.bind(this)]);
        this.addEventToGetProp(this.prop[2], this.target[0], this.continue3.bind(this));

        
    },

    //喝可乐分支
    continue1(){
        if(this.teacherIsCareful){
            this.badEnd3();  //拖走的结局
        }else{
            this.badEnd1();  //没拖走的结局
        }
    },

    continue2(){
        this.role2[0].active = false;
        this.role2[2].active = true;
        this.prop[3].active = false;
        this.teacherIsCareful = false;
    },

    continue3(){
        if(this.teacherIsCareful){
            this.badEnd4();  //拖走的结局
        }else{
            this.happyEnd();  //没拖走的结局
        }
    },

    //通用坏结局
    sameBadEnd() {
        let action2 = cc.sequence(
            cc.callFunc(() => {
                this.role1[4].active = true;    //显示desk
                this.role1[0].active = false;
                this.role1[1].active = false;
                this.role1[2].active = false;
                this.role1[3].active = false;
                this.light.active = false;
            }),
            cc.moveTo(1.5, cc.v2(-267, -22)),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.gameCtrl.toBadEnd(1,1);
            })
        )
        return {
            nodes: [this.role2[0], this.role2[1], this.role2[3]],
            actions: [null, 1, action2]
        }
    },

    //喝可乐坏结局
    badEnd1() {
        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.role1[0].active = false;
                this.xieFloat.active = false;
            }),
            cc.repeat(
                cc.sequence(
                    cc.spawn(
                        cc.rotateTo(0.1, 2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(6, 0)).easing(this.myEase()),
                    ),
                    cc.spawn(
                        cc.rotateTo(0.1, -2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(-6, 0)).easing(this.myEase()),
                    )
                ), 8
            ),
            cc.callFunc(()=>{
                this.gameCtrl.toBadEnd(0, this.BE1Img);
            })
        )

        let nodes = [this.role1[2]]
        let actions = [action1]
        this.runSeqAction(nodes, actions);
    },

    //吃薯片坏结局
    badEnd2(){
        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.role1[0].active = false;
                this.xieFloat.active = false;
            }),
            cc.repeat(
                (
                    cc.sequence(
                        cc.scaleTo(0.2, 1.1),
                        cc.scaleTo(0.2, 1)
                    )
                ), 4
            )
        )

        let nodes = [this.role1[1]];
        nodes = this.insert(nodes, this.sameBadEnd().nodes);
        let actions = [action1];
        actions = this.insert(actions, this.sameBadEnd().actions);
        this.runSeqAction(nodes, actions);
    },

    badEnd3() {
        let action1 = cc.sequence(
            cc.callFunc(() => {
                this.role1[0].active = false;
                this.xieFloat.active = false;
            }),
            cc.repeat(
                cc.sequence(
                    cc.spawn(
                        cc.rotateTo(0.1, 2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(6, 0)).easing(this.myEase()),
                    ),
                    cc.spawn(
                        cc.rotateTo(0.1, -2).easing(this.myEase()),
                        cc.moveBy(0.1, cc.v2(-6, 0)).easing(this.myEase()),
                    )
                ), 8
            )
        )

        let nodes = [this.role1[2]]
        let actions = [action1]
        nodes = this.insert(nodes, this.sameBadEnd().nodes);
        actions = this.insert(actions, this.sameBadEnd().actions);
        this.runSeqAction(nodes, actions);
    },

    badEnd4(){
        let action1 = cc.sequence(
            cc.callFunc(()=>{
                this.role1[3].active = true;    //变脸
                this.xieFloat.active = false;
            }),
            cc.repeat(
                cc.sequence(
                    cc.scaleTo(0.2,1.1),
                    cc.scaleTo(0.2,1)
                ), 4
            )
        )
        let nodes = [this.light];
        let actions = [action1];
        nodes = this.insert(nodes, this.sameBadEnd().nodes);
        actions = this.insert(actions, this.sameBadEnd().actions);

        this.runSeqAction(nodes, actions);
    },


    happyEnd() {
        let action1 = cc.sequence(
            cc.callFunc(()=>{
                this.role1[3].active = true;    //变脸
                this.xieFloat.active = false;
            }),
            cc.repeat(
                cc.sequence(
                    cc.scaleTo(0.2,1.1),
                    cc.scaleTo(0.2,1)
                ), 4
            ),
            cc.callFunc(() => {
                //结束弹窗
                this.gameCtrl.toHappyEnd(0);
            })
        )
        let nodes = [this.light];
        let actions = [action1]

        this.runSeqAction(nodes, actions);
    }
});
