cc.Class({
    extends: cc.Component,

    properties: {
        root: {
            default: null,
            type: cc.Node
        },
        menuImg: {
            default: [],
            type: cc.SpriteFrame
        },
        //预设的节点位置
        itemNodes: {
            default: [],
            type: cc.Node
        },
        pageNumLabel: {
            default: null,
            type: cc.Label
        },
        //敬请期待图
        toBeContinueImg: {
            default: null,
            type: cc.SpriteFrame
        }
    },

    onLoad() {
        this.stageNum = 1;  //关卡总数
        this.totalPage = 1; //总页数
        this.currentPage = 1;   //当前页
        this.enterForFirst = true;  //是否首次进入游戏

        cc.loader.loadResDir('menu', cc.SpriteFrame, (count, total) => {
            let num = Math.floor((count / total) * 100);
            Manager.Home.progressForMenu = num;
        }, (err, res) => {
            if (err) {
                cc.log(err);
                return;
            }
            //按序号放入
            for (let i = 0, resLen = res.length; i < resLen; i++) {
                let index = parseInt(res[i]._name) - 1;
                this.menuImg[index] = res[i];
            }
            if (this.toBeContinueImg) this.menuImg.push(this.toBeContinueImg);

            console.log("目录图加载完成.");
            this.InitMenu();
        })

        //this.hide();
    },

    start() {

    },

    //初始化菜单
    InitMenu() {
        this.stageTotal = this.menuImg.length;
        this.totalPage = Math.ceil(this.stageTotal / 6);
        // this.currentPage = Math.ceil(Manager.userData.currentStage / 6);  //根据最新关卡确定当前页
        // this.updateMenu(this.currentPage);
    },

    //更新菜单
    updateMenu(page) {
        this.pageNumLabel.string = page + "/" + this.totalPage;
        let stageState = Manager.userData.stageState;  //读取关卡状态
        let gameData = Manager.Game.gameData;
        for (let i = 0; i < 6; i++) {
            let index = (page - 1) * 6 + i;     //依次选中显示的序号
            let mNode = this.itemNodes[i];
            if (this.stageTotal >= index + 1) { //若最后一页不足6个，则隐藏节点
                mNode.active = true;
                //依次修改各个元素
                let mNode2 = mNode.getChildByName('Img');   //mNode节点添加动画组件后，on事件失效，因此将事件on在Img节点
                let mNodeImg = mNode2.getComponent(cc.Sprite);
                mNodeImg.spriteFrame = this.menuImg[index];

                let mNodeNum = mNode.getChildByName('StageNum').getComponent(cc.Label);
                mNodeNum.string = index + 1;

                let mNodeTitle = mNode.getChildByName('StageTitle').getComponent(cc.Label);
                if (gameData[index + 1]) mNodeTitle.string = gameData[index + 1].title;

                let mNodeMask = mNode.getChildByName('Mask');
                mNodeMask.active = false;

                let mNodeFinish = mNode.getChildByName('Finish');
                mNodeFinish.active = false;

                let mNodeAni = mNode.getComponent(cc.Animation);
                mNode.scaleX = 1;
                mNode.scaleY = 1;
                mNodeAni.stop();

                let mNodeTxtFrame = mNode.getChildByName('Frame2')
                mNodeTxtFrame.active = true;
                //根据用户信息修改关卡状态
                mNode2.off(cc.Node.EventType.TOUCH_END);
                if (index === this.stageTotal - 1) {
                    mNodeTxtFrame.active = false;
                    mNodeNum.string = "";
                    mNodeTitle.string = "";
                } else if (stageState[index] == undefined || stageState[index] == 0) {
                    //未激活状态
                    mNodeMask.active = true;
                    mNode2.on(cc.Node.EventType.TOUCH_END, (e) => {  //点击未通关，弹一弹，飘字
                        mNode.runAction(
                            cc.sequence(
                                cc.scaleTo(0.2, 1.1).easing(cc.easeIn(3)),
                                cc.scaleTo(0.2, 1).easing(cc.easeOut(3))
                            )
                        );
                        Manager.Alert.showFloatingTxt("完成上一关才开启哦");
                    }, this);
                } else if (stageState[index] == 1 || stageState[index] == 2) {
                    //当前关与已通关
                    if (stageState[index] == 1) {
                        this.scheduleOnce(() => { mNodeAni.play() }, 0.5); //延迟0.5s，播放弹一弹动画
                    } else if (stageState[index] == 2) {
                        mNodeFinish.active = true;
                    }
                    //添加跳转事件
                    mNode2.on(cc.Node.EventType.TOUCH_END, (e) => {
                        Manager.playBtnSound();
                        //开始游戏
                        let stageNum = index + 1;
                        this.tryGameStart(stageNum);
                    }, this);
                }
            } else {
                mNode.active = false;
            }
        }
        let finger = cc.find("Finger", this.root);
        if (Manager.userData.currentStage == 2) {
            if (page == 1) {
                finger.active = true;
                finger.runAction(
                    cc.repeatForever(
                        cc.sequence(
                            cc.scaleTo(0.2, 0.8),
                            cc.scaleTo(0.2, 1),
                            cc.delayTime(0.1)
                        )
                    )
                )
            }else{
                finger.stopAllActions();
                finger.active = false;
            }
        }else{
            finger.active = false;
        }
    },

    //尝试开始游戏
    tryGameStart(stageNum) {
        Manager.Game.show(stageNum);
        this.hide();
    },

    show(stageNum) {
        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_MENU', true));
        this.root.active = true;

        if (stageNum) {
            this.currentPage = Math.ceil(stageNum / 6);
        } else {
            this.currentPage = Math.ceil(Manager.userData.currentStage / 6);  //根据最新关卡确定当前页
        }

        if (Manager.userData.currentStage == 1 && this.enterForFirst) {
            this.tryGameStart(1);
            this.enterForFirst = false;
        }

        this.updateMenu(this.currentPage);

        Manager.rankUpdateRankData();   //此处更新排行榜信息
    },

    hide() {
        this.root.active = false;
    },

    //在首页和末尾页点击上下页时，飘字提示“不能翻页啦”
    startFloating() {
        Manager.Alert.showFloatingTxt('不能翻页啦');
    },
    // update (dt) {},

    //#region 按钮事件
    btnPre(e) {
        Manager.playBtnSound();
        if (this.currentPage > 1) {
            this.currentPage -= 1;
            this.updateMenu(this.currentPage);
        } else {
            this.startFloating();
        }
    },

    btnNext(e) {
        Manager.playBtnSound();
        if (this.currentPage < this.totalPage) {
            this.currentPage += 1;
            this.updateMenu(this.currentPage);
        } else {
            this.startFloating();
        }
    },

    btnBack(e) {
        Manager.playBtnSound();
        Manager.Home.show();
        this.hide();
    },
    //#endregion
});
