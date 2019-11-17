cc.Class({
    extends: cc.Component,

    properties: {
        maskNode: {
            default: null,
            type: cc.Node
        },
        gameMenuNode: {
            default: null,
            type: cc.Node
        },
        gameTipsNode: {
            default: null,
            type: cc.Node
        },
        gameBENode: {
            default: null,
            type: cc.Node
        },
        gameHENode: {
            default: null,
            type: cc.Node
        },
        rankNode: {
            default: null,
            type: cc.Node
        },
        BESpriteFrame: {
            default: [],
            type: cc.SpriteFrame
        },
        HESpriteFrame: {
            default: [],
            type: cc.SpriteFrame
        },
        rankSprite: {
            default: null,
            type: cc.Sprite
        },
        floatingTxtNode: {
            default: null,
            type: cc.Node
        }
    },

    start() {
        this.bgmIsPlay = false;

        //跳转到视频或分享回来后，根据当前关卡参数更新
        this.stageNum = 0;
        this.stageInfo = null;

        this.isEnd = false; //tips界面在坏结局打开时为true;

        //注册分享回调事件
        Manager.registerShare("tips", this.tipsSuccessCallBack.bind(this), this.tipsFailCallBack.bind(this));

        //game里菜单声音按钮
        let btnSound = cc.find("Btn_sound", this.gameMenuNode);
        let btnSoundClose = cc.find("Close", btnSound);
        let btnSoundOpen = cc.find("Open", btnSound);
        if (Manager.bgmIsPlay) {
            btnSoundClose.active = true;
            btnSoundOpen.active = false;
        } else {
            btnSoundClose.active = false;
            btnSoundOpen.active = true;
        }
        btnSoundClose.on(cc.Node.EventType.TOUCH_END, () => {
            Manager.stopBgm();
            btnSoundClose.active = false;
            btnSoundOpen.active = true;
        }, this);
        btnSoundOpen.on(cc.Node.EventType.TOUCH_END, () => {
            Manager.playBgm();
            btnSoundClose.active = true;
            btnSoundOpen.active = false;
        }, this);

        //game里菜单的返回目录按钮
        let btnGameBack = cc.find("Btn_back", this.gameMenuNode);
        btnGameBack.on(cc.Node.EventType.TOUCH_END, () => {
            this.hide();
            Manager.Game.hide();
            Manager.Menu.show();
        }, this)

        //game里菜单的重玩本关按钮
        let btnReplay = cc.find("Btn_replay", this.gameMenuNode);
        btnReplay.on(cc.Node.EventType.TOUCH_END, () => {
            this.hide();
            Manager.Game.replay();
        }, this);

        //game里菜单和提示的关闭按钮
        let closeGameMenu = cc.find("Btn_close", this.gameMenuNode);
        let closeGameTips = cc.find("Btn_close", this.gameTipsNode);
        closeGameMenu.on(cc.Node.EventType.TOUCH_END, () => {
            this.hide();
            Manager.showBannerAd("game");
        }, this);
        closeGameTips.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isEnd) { //如果通过坏结局的视频打开
                this.gameBENode.active = true;
                this.gameTipsNode.active = false;
            } else {
                this.hide();
            }
            Manager.showBannerAd("game");
        }, this);

        //game里BE的分享事件
        let BEShare = cc.find("Btn/Btn_shareTips", this.gameBENode);
        BEShare.on(cc.Node.EventType.TOUCH_END, () => {
            this.shareForTips();
        }, this);

        //game里BE的看视频事件
        let BEVideo = cc.find("Btn/Btn_videoTips", this.gameBENode);
        BEVideo.on(cc.Node.EventType.TOUCH_END, () => {
            this.lookAdForTipsInBE();
        }, this);

        //game里BE的重玩本关按钮
        let BEReplay = cc.find("Btn/Btn_replay", this.gameBENode);
        BEReplay.on(cc.Node.EventType.TOUCH_END, () => {
            this.hide();
            Manager.Game.replay();
        }, this);

        //game里HE的炫耀一下按钮
        let HEShare = cc.find("Btn/Btn_share", this.gameHENode);
        HEShare.on(cc.Node.EventType.TOUCH_END, this.shareForNull, this);

        //game里HE的下一关（返回目录）按钮
        let HEBack = cc.find("Btn/Btn_back", this.gameHENode);
        HEBack.on(cc.Node.EventType.TOUCH_END, () => {
            this.hide();
            Manager.Game.hide();
            Manager.Menu.show();
        }, this);

        //rank里关闭按钮
        let rankMask = cc.find("Btn_close", this.rankNode);
        rankMask.on(cc.Node.EventType.TOUCH_END, this.hideRank, this);

        //rank里滚动事件
        let rankSpriteNode = this.rankSprite.node
        rankSpriteNode.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            let delta = event.getDelta();
            Manager.rankTouchMove(delta.y);
        })

        /** 道具弹窗写在game */
    },

    showGameMenu() {
        Manager.showBannerAd("alert");
        this.maskNode.active = true;
        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_ALERT', true));
        this.winFadeIn(this.gameMenuNode);
    },

    showGameTips(stageNum, stageInfo) {
        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_ALERT', true));
        this.stageNum = stageNum;
        this.stageInfo = stageInfo;
        let stageTips = stageInfo.tips;
        let tipsLen = stageTips.length; //需要显示的提示数量
        let tipsState = Manager.userData.stageTips[stageNum - 1];
        if (tipsState === undefined) tipsState = 0;

        let tipsBg = cc.find("alert_bg", this.gameTipsNode); //自适应背景高度
        tipsBg.height = 286 + (tipsLen - 1) * 176;

        let tipsNode = cc.find("Tips", this.gameTipsNode);

        //先删除第一个tips以外的tips节点
        let index = tipsNode.getSiblingIndex();
        let childLen = this.gameTipsNode.children.length;
        for (let i = childLen - 1; i > index; i--) {
            this.gameTipsNode.children[i].destroy();
        }

        for (let i = 0; i < tipsLen; i++) {
            let tmpNode = null;
            //克隆tips栏
            if (i != 0) {
                tmpNode = cc.instantiate(tipsNode);
                tmpNode.parent = this.gameTipsNode;
                tmpNode.setPosition(0, 209 - 176 * i);
            } else {
                tmpNode = tipsNode;
            }

            let tipsTxt = cc.find("TipsTxt", tmpNode).getComponent(cc.Label); //写文案
            let tipsMask = cc.find("TipsMask", tmpNode); //写蒙层

            let tipsMaskTxt = cc.find("TipsMask/Label", tmpNode).getComponent(cc.Label);
            let tipsShareIcon = cc.find("TipsMask/ShareIcon", tmpNode);
            let tipsVideoIcon = cc.find("TipsMask/VideoIcon", tmpNode);
            let setShare = () => { //加分享
                tipsShareIcon.active = true;
                tipsVideoIcon.active = false;
                tipsMaskTxt.string = "分享好友得提示";
                tipsMask.on(cc.Node.EventType.TOUCH_END, this.shareForTips, this); //加分享事件
            }

            let setVideo = () => { //加视频
                tipsVideoIcon.active = true;
                tipsShareIcon.active = false;
                tipsMaskTxt.string = "看视频获得提示";
                tipsMask.on(cc.Node.EventType.TOUCH_END, this.lookAdForTips, this); //加广告事件
            }

            //是否能加广告
            if (window.adMode == "none") {
                setVideo = setShare;
            }

            if (stageNum == 3) {
                if (tipsState > 0 || i == 0) {
                    tipsTxt.string = stageTips[i];
                    tipsMask.active = false;
                } else {
                    tipsMask.active = true;
                    tipsTxt.string = "";
                    tipsMask.off(cc.Node.EventType.TOUCH_END);
                    setVideo();
                }
            } else if (tipsState > 0 || stageNum <= 2) {
                tipsTxt.string = stageTips[i];
                tipsState--;
                tipsMask.active = false;
            } else {
                tipsMask.active = true;
                tipsTxt.string = "";
                tipsMask.off(cc.Node.EventType.TOUCH_END);
                setVideo();
            }
        }

        Manager.showBannerAd("alert");
        this.maskNode.active = true;
        this.winFadeIn(this.gameTipsNode);
    },

    showGameBE(stageNum, stageInfo, index, img) {
        this.node.children.forEach(item => { //防止进结局的时候，菜单或提示打开
            item.active = false;
        });

        cc.audioEngine.playEffect(Manager.audioClips[3], false);

        this.stageNum = stageNum;
        this.stageInfo = stageInfo;
        this.isEnd = true;
        let BEMsg = stageInfo.BEMsg;
        let BETitle = stageInfo.BETitle;

        let btnVideo = cc.find("Btn/Btn_videoTips", this.gameBENode);
        let btnShare = cc.find("Btn/Btn_shareTips", this.gameBENode);

        let btnJump = btnVideo; //有动效的按钮

        //是否能加广告
        if (window.adMode == "none") {
            btnVideo.active = false;
            btnJump = btnShare;
            btnShare.position = cc.v2(0, -217);
            if (stageNum <= 4) {
                btnShare.active = false;
            } else {
                btnShare.active = true;
            }
        } else {
            if (stageNum <= 4) {
                btnShare.active = false;
                btnVideo.position = cc.v2(0, -217);
            } else {
                btnShare.active = true;
                btnVideo.position = cc.v2(166, -217);
            }

        }
        btnJump.stopAllActions();
        btnJump.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.1, 1.1),
                    cc.scaleTo(0.1, 1),
                    cc.scaleTo(0.1, 1.1),
                    cc.scaleTo(0.1, 1),
                    cc.delayTime(0.3)
                )
            )
        )

        //改文案
        cc.find("Content/TxtBg/Txt", this.gameBENode).getComponent(cc.Label).string = BEMsg[index];
        cc.find("Content/TitleBg/Title", this.gameBENode).getComponent(cc.Label).string = BETitle[index];

        let BEImg = cc.find("Content/Img", this.gameBENode);
        let BEImgSprite = BEImg.getComponent(cc.Sprite);
        if (!img) { //img为空，用通用结局图
            BEImgSprite.spriteFrame = this.BESpriteFrame[0];
        } else if (typeof(img) == "number" && this.BESpriteFrame[img]) {
            BEImgSprite.spriteFrame = this.BESpriteFrame[img];
        } else {
            BEImgSprite.spriteFrame = img;
        }
        BEImg.active = true;

        Manager.showBannerAd("alert");
        this.maskNode.active = true;
        this.endFadeIn(this.gameBENode);
    },

    showGameHE(stageNum, stageInfo, index, img) {
        this.node.children.forEach(item => {
            item.active = false;
        });

        cc.audioEngine.playEffect(Manager.audioClips[2], false);

        this.stageNum = stageNum;
        this.stageInfo = stageInfo;
        let HEMsg = stageInfo.HEMsg;
        let HETitle = stageInfo.HETitle;

        cc.find("Content/TxtBg/Txt", this.gameHENode).getComponent(cc.Label).string = HEMsg[index];
        cc.find("Content/TitleBg/Title", this.gameHENode).getComponent(cc.Label).string = HETitle[index];

        let HEImg = cc.find("Content/Img", this.gameHENode);
        let HEImgSprite = HEImg.getComponent(cc.Sprite);
        if (!img) { //img为空，用通用结局图
            HEImgSprite.spriteFrame = this.HESpriteFrame[0];
        } else if (typeof(img) == "number" && this.HESpriteFrame[img]) {
            HEImgSprite.spriteFrame = this.HESpriteFrame[img];
        } else {
            HEImgSprite.spriteFrame = img;
        }
        HEImg.active = true;

        Manager.showBannerAd("alert");
        this.maskNode.active = true;
        this.endFadeIn(this.gameHENode);
    },

    showRank() {
        cc.log("显示排行榜");

        this.maskNode.active = true;
        this.winFadeIn(this.rankNode);
    },

    hideRank() {
        this.hide();
    },

    //参数为弹窗节点
    endFadeIn(node) {
        node.active = true;
        let contentNode = cc.find('Content', node);
        let btnUINode = cc.find('Btn', node);
        contentNode.opacity = 150;
        contentNode.scale = 0.7;
        btnUINode.opacity = 0;
        contentNode.runAction(
            cc.sequence(
                cc.spawn(
                    cc.fadeIn(0.2),
                    cc.scaleTo(0.2, 1.0)
                ),
                cc.callFunc(() => {
                    btnUINode.runAction(cc.fadeIn(0.2))
                })
            )
        )
        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_ALERT', true));
        setTimeout(()=>{
            if(Manager.userData.currentStage > 4){
                this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_HOMEICON', true));
            }
        },1000);
    },

    winFadeIn(node) {
        node.active = true;
        node.opacity = 150;
        node.scale = 0.7;
        node.runAction(
            cc.spawn(
                cc.fadeIn(0.2),
                cc.scaleTo(0.2, 1.0)
            )
        )
    },

    hide() {
        Manager.playBtnSound();
        this.node.children.forEach(item => {
            item.active = false;
        });

        this.isEnd = false;

        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_HIDE_ALERT', true));
    },


    //分享或视频成功回调
    tipsSuccessCallBack() {
        cc.log("tips请求成功回调");
        if (Manager.userData.stageTips[this.stageNum - 1] === undefined) {
            Manager.userData.stageTips[this.stageNum - 1] = 0;
        }
        Manager.userData.stageTips[this.stageNum - 1] += 1;
        Manager.upateUserData();
        this.gameBENode.active = false;
        this.showGameTips(this.stageNum, this.stageInfo);
    },

    //分享失败回调
    tipsFailCallBack() {
        cc.log("tips请求失败回调");
        this.showFloatingTxt("分享给不同好友，才可获得提示");
    },

    lookAdForTips() {
        Manager.showVeideoAd("tips");
    },

    lookAdForTipsInBE() {
        Manager.showVeideoAd("badEnd");
    },

    shareForTips() {
        Manager.showShare("tips", false);
    },

    shareForNull() {
        Manager.showShare(null, true);
    },

    //显示飘字
    showFloatingTxt(string) {
        let tmpAni = this.floatingTxtNode.getComponent(cc.Animation);
        let tmpTxt = cc.find("Label", this.floatingTxtNode).getComponent(cc.Label);
        tmpTxt.string = string;

        this.floatingTxtNode.active = true;
        tmpAni.off('finished');
        tmpAni.play();
        tmpAni.once('finished', () => {
            this.floatingTxtNode.active = false;
        })
    }

    // update (dt) {},
});