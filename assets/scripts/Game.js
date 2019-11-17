cc.Class({
    extends: cc.Component,

    properties: {

        root: {
            default: null,
            type: cc.Node
        },
        stagePrefabs: {
            default: [],
            type: cc.Prefab
        },
        currentStageNode: {
            default: null,
            type: cc.Node
        },
        //报幕节点,标题,文字
        startTitleNode: {
            default: null,
            type: cc.Node
        },
        startTitleNum: {
            default: null,
            type: cc.Label
        },
        startTitleTxt: {
            default: null,
            type: cc.Label
        },
        //道具弹窗
        propAlert: {
            default: null,
            type: cc.Node
        },
        //左上角提示图片
        tipsBtnSpriteFrame:{
            default: null,
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.currentStageNum = 1; //当前关卡序号
        this.gameData = null; //游戏文本
        this.timer = 0; //游戏时间计时器
        this.timeTag = false; //游戏时间标识

        //读游戏文本
        cc.loader.loadRes('game', (err, res) => {
            if (err) {
                cc.log(err);
                return;
            }
            this.gameData = res.json;
        })

        //左上提示图片变分享
        if(window.adMode == "none"){
            let BtnTopTips = cc.find("Btn_topTips",this.root);
            BtnTopTips.getComponent(cc.Sprite).spriteFrame = this.tipsBtnSpriteFrame;
        }
    },

    start() {
        //注册道具弹窗分享回调
        Manager.registerShare("propTips", this.propTipsSuccessCb.bind(this), Manager.Alert.tipsFailCallBack.bind(Manager.Alert));
    },

    //在加载子包回调中运行
    loadPrefabs() {
        //读关卡
        cc.loader.loadResDir('prefabs', (count, total) => {
            let num = Math.floor((count / total) * 100);
            Manager.Home.progressForGame = num;
        }, (err, res) => {
            if (err) {
                cc.log(err);
                return;
            }

            //按序号放入this.stagePrefabs
            for (let i = 0, resLen = res.length; i < resLen; i++) {
                let index = parseInt(res[i]._name.split('Stage')[1]) - 1;
                this.stagePrefabs[index] = res[i];
            }

            console.log("关卡预制体加载完成.");
        })
    },
    show(stageNum) {
        this.currentStageNum = stageNum;

        this.guideTag = true; //新手引导标志，只进行一次

        //开始计算游戏时间
        this.timeTag = true;
        this.timer = 0;

        this.gameStart(stageNum);
        this.root.active = true;

        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_GAME', true));
        Manager.showBannerAd("game");

        //阿拉丁打点
        if (CC_WECHATGAME) {
            if (!wx.aldSendEvent) return;
            switch (this.currentStageNum) {
                case 1:
                    if(!Manager.userData.aldTag[0]){
                        Manager.userData.aldTag[0] = 1;
                        wx.aldSendEvent("进入第1关");
                    }
                    break;
                case 6:
                    if(!Manager.userData.aldTag[1]){
                        Manager.userData.aldTag[1] = 1;
                        wx.aldSendEvent("进入第6关");
                    }
                    break;
                case 11:
                    if(!Manager.userData.aldTag[2]){
                        Manager.userData.aldTag[2] = 1;
                        wx.aldSendEvent("进入第11关");
                    }
                    break;
            }
        }
    },

    hide() {
        this.currentStageNode.destroy();
        this.timeTag = false;

        this.root.active = false;

        Manager.showBannerAd("home");
    },

    replay() {
        this.currentStageNode.destroy();
        this.gameStart(this.currentStageNum);

    },

    gameStart(stageNum) {
        let index = stageNum - 1;
        //实例化关卡
        this.currentStageNode = cc.instantiate(this.stagePrefabs[index]);
        this.currentStageNode.parent = this.root;
        this.currentStageNode.setSiblingIndex(99); //设置到最高层级
        //修改标题
        let titleNum = cc.find("TopTitle/StageNum", this.root).getComponent(cc.Label);
        let titleTxt = cc.find("TopTitle/StageTxt", this.root).getComponent(cc.Label);
        titleNum.string = "第" + stageNum + "关";
        titleTxt.string = this.gameData[stageNum].title;

        //显示报幕
        this.startTitleNode.setSiblingIndex(99);
        this.startTitleNum.string = titleNum.string;
        this.startTitleTxt.string = titleTxt.string;
        let tmpAni = this.startTitleNode.getComponent(cc.Animation);
        let mask = cc.find('Mask', this.startTitleNode);
        let func = () => {
            this.startTitleNode.active = false;
            if (this.guideTag) {
                this.currentStageNode.emit('guide'); //触发新手引导
                this.guideTag = false;
            }
            this.currentStageNode.emit('start');
        }
        this.scheduleOnce(() => {
            mask.once(cc.Node.EventType.TOUCH_START, () => { //添加点报幕直接关闭报幕,同时取消动画
                func();
                tmpAni.stop();
                tmpAni.off('stop');
            }, this);
        }, 0.1);
        this.startTitleNode.active = true;
        tmpAni.play(); //播放报幕动画
        tmpAni.once('stop', () => { //动画结束回调，同时取消mask的点击关闭报幕事件
            func();
            mask.off(cc.Node.EventType.TOUCH_START);
        }, this);
    },

    //index为不同结局(从0开始),img为特殊结果图
    toBadEnd(index, img) {
        Manager.Alert.showGameBE(this.currentStageNum, this.gameData[this.currentStageNum], index, img);

        //this.timeTag = false;
    },

    toHappyEnd(index, img) {
        let userDataIsDirty = false;
        
        //若当前关状态为已开启未通关（已通关不修改用户数据）
        if (Manager.userData.stageState[this.currentStageNum - 1] == 1) {
            Manager.userData.stageState[this.currentStageNum - 1] = 2; //当前关通关
            Manager.userData.stageState[this.currentStageNum] = 1; //下一关已开启
            Manager.userData.currentStage = this.currentStageNum + 1; //当前已开启关卡号为下一关
            userDataIsDirty = true;

        }

        //记录游戏时间
        this.timeTag = false;
        let endTime = (Math.ceil(this.timer * 1000));
        this.timer = 0;
        let times = Manager.userData.stageTime;
        let oldTime = times[this.currentStageNum - 1];
        if (oldTime == undefined || oldTime > endTime) { //若记录的时间为空或比这次的时间大，重新记录
            times[this.currentStageNum - 1] = endTime;
            let totalTime = 0;
            for (let i of times) {
                if (i == null) i = 0;
                totalTime += i;
            }
            Manager.userData.totalTime = totalTime;
            userDataIsDirty = true;
        }

        if (userDataIsDirty) {
            Manager.upateUserData();
            Manager.rankUploadGameData();
        }

        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_GAME_INSERT', true));

        Manager.Alert.showGameHE(this.currentStageNum, this.gameData[this.currentStageNum], index, img);
    },

    //提示引导
    tipsGuide(func) {
        let tipsBtn = cc.find("Btn_topTips", this.root);
        tipsBtn.once(cc.Node.EventType.TOUCH_END, func);
    },

    //#region 道具弹窗
    openPropAlert(propNode, cb) {
        let btnClose = cc.find("Btn_close", this.propAlert);
        let propAlert1 = cc.find("PropAlert_1", this.propAlert);
        let propAlert2 = cc.find("PropAlert_2", this.propAlert);
        propAlert1.active = false;
        propAlert2.active = false;

        //实例化道具
        if (this.alertProp) this.alertProp.destroy();
        this.alertProp = cc.instantiate(propNode);
        this.propNum = parseInt(this.alertProp.name.split("Prop")[1]);

        //根据json判断显示那种弹窗
        let str = this.gameData[this.currentStageNum].propTips[this.propNum - 1];
        if (!str || str.search("null") != -1 || str == "") {
            propAlert2.active = true;
            this.alertProp.parent = propAlert2;
            this.alertProp.position = cc.v2(0, -25);
            this.alertProp.active = true;

            btnClose.position = cc.v2(4, -100);
        } else {
            let txt = cc.find("TxtFrame/Txt", propAlert1).getComponent(cc.Label);
            let mask = cc.find("TxtFrame/TxtMask", propAlert1);
            let maskTxt = cc.find("TxtFrame/TxtMask/Txt", propAlert1).getComponent(cc.Label);
            let light = cc.find("Light", propAlert1);

            propAlert1.active = true;

            this.alertProp.parent = propAlert1;
            this.alertProp.position = cc.v2(0, 34.9);
            this.alertProp.active = true;

            btnClose.position = cc.v2(4, -276);


            //根据数据判断是否显示提示
            let propState = Manager.userData.propState[this.currentStageNum - 1];
            txt.string = "";
            mask.off(cc.Node.EventType.TOUCH_END);
            if (propState && propState[this.propNum - 1]) {
                mask.active = false;
                txt.string = str;
            } else {
                //是否能加广告
                if (window.adMode == "none") {
                    maskTxt.string = "点击查看提示";
                    mask.on(cc.Node.EventType.TOUCH_END, () => {
                        this.propTipsSuccessCb();
                    })
                } else {
                    maskTxt.string = "看视频查看提示"
                    mask.on(cc.Node.EventType.TOUCH_END, () => {
                        Manager.showVeideoAd("propTips");
                    })
                }
                mask.active = true;

                //发光动画
                light.runAction(
                    cc.repeatForever(
                        cc.sequence(
                            cc.callFunc(() => light.rotation = 15),
                            cc.delayTime(0.2),
                            cc.callFunc(() => light.rotation = 0),
                            cc.delayTime(0.2),
                        )
                    )
                )
            }

        }

        //关闭按钮
        btnClose.off(cc.Node.EventType.TOUCH_END);
        btnClose.on(cc.Node.EventType.TOUCH_END, () => {
            Manager.showBannerAd("game");
            this.propAlert.active = false;
            propAlert1.active = false;
            propAlert2.active = false;
            Manager.playBtnSound();
            cb();
            this.alertProp.destroy();
            this.alertProp = null;
        }, this);

        Manager.showBannerAd("alert");
        this.propAlert.setSiblingIndex(99);
        this.propAlert.active = true;
    },

    //道具弹窗提示分享或视频成功回调
    propTipsSuccessCb() {
        if (typeof (this.propNum) == "number") {
            let propState = Manager.userData.propState;
            if (!propState[this.currentStageNum - 1]) propState[this.currentStageNum - 1] = [];
            propState[this.currentStageNum - 1][this.propNum] = true;
            Manager.upateUserData();
        }
        let txt = cc.find("PropAlert_1/TxtFrame/Txt", this.propAlert).getComponent(cc.Label);
        let txtMask = cc.find("PropAlert_1/TxtFrame/TxtMask", this.propAlert);
        txtMask.active = false;
        txt.string = this.gameData[this.currentStageNum].propTips[this.propNum - 1];
    },

    //#endregion

    //#region 按钮事件
    btnMenuTouch() {
        Manager.playBtnSound();
        Manager.Alert.showGameMenu();
    },
    btnTipsTouch() {
        Manager.playBtnSound();
        Manager.Alert.showGameTips(this.currentStageNum, this.gameData[this.currentStageNum]);
    },
    btnBack() {
        Manager.playBtnSound();
        this.hide();
        Manager.Menu.show(this.currentStageNum);
    },
    //#endregion
    update(dt) {
        if (this.timeTag) {
            this.timer += dt;
        }
    },
});