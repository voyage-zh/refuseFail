cc.Class({
    extends: cc.Component,

    properties: {
        root: {
            default: null,
            type: cc.Node
        },
        btn: {
            default: [],
            type: cc.Node
        },
        logo: {
            default: null,
            type: cc.Node
        },
        loadingNode: {
            default: null,
            type: cc.Node
        },
        loadingTxt: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        cc.audioEngine.setMusicVolume(0.5);
        Manager.bgmVolume = 0.5;
        this.scheduleOnce(() => {
            Manager.playBgm();
        }, 1)


        //this.time = 0;
        this.progress = 0;
        this.progressForMenu = 0;   //菜单的加载进度
        this.progressForGame = 0;   //关卡的加载进度
        this.progressForAuth = false;
        this.progressForSdk = false;
        this.progressTime = 0;

        this.isLoading = true;
        this.btn[0].active = false; //按钮初始隐藏
        this.loadingTxt.string = "0%";

        //开始游戏按钮事件
        // this.btn[1].on(cc.Node.EventType.TOUCH_END, ()=>{
        //     this.hide();
        //     Manager.Menu.show();
        // }, this)
        if (!CC_WECHATGAME) this.addEnterGameEvent();

        //排行榜
        this.btn[2].on(cc.Node.EventType.TOUCH_END, () => {
            Manager.playBtnSound();
            Manager.Alert.showRank();
        }, this);

        //this.show();
    },

    start() {
        Manager.showBannerAd("home");
    },

    enterGame() {
        this.hide();
        Manager.Menu.show();
        setTimeout(() => {
            this.addEnterGameEvent();
        }, 1000)
    },

    //为了响应授权事件
    addEnterGameEvent() {
        //开始游戏按钮事件
        cc.log("添加进入游戏按钮事件");
        this.btn[1].on(cc.Node.EventType.TOUCH_END, () => {
            this.hide();
            Manager.Menu.show();
            Manager.playBtnSound();
        }, this)
    },

    show() {
        this.root.active = true;
        Manager.playBgm();

        this.node.dispatchEvent(new cc.Event.EventCustom('SDK_SHOW_HOME', true));
    },

    hide() {
        this.root.active = false;
        Manager.stopBgm();
    },

    update(dt) {
        //this.time +=dt;

        //updata只做进度条刷新
        if (!this.isLoading) {
            return
        }
        this.progressTime += dt;
        if (this.progressTime <= 3.5) {
            this.loadingTxt.string = Math.floor(100 * this.progressTime / 3.5) + "%";
        }

        this.progress = Math.floor(this.progressForMenu * 0.5 + this.progressForGame * 0.5);
        if (this.progress === 100) {
            if (!this.progressForAuth && CC_WECHATGAME) return
            if (Manager.Sdk && !this.progressForSdk) return
            Manager.createUserInfoButton(this.btn[1]);  //判断授权
            this.isLoading = false;
            this.loadingNode.active = false;
            this.btn[0].active = true; //显示两个按钮
            this.btn[0].opacity = 100;
            this.btn[0].runAction(cc.fadeIn(0.5));
            this.btn[1].runAction(    //给开始按钮加弹一弹动作
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
        }

    },
});
