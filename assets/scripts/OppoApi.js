module.exports = {
    BaseUrl: "https://smil888.com:8080/refuseFail",

    //--------------------------------------------------------------------------------------------
    //----------------------------------------登录-------------------------------------------------
    //--------------------------------------------------------------------------------------------
    login: function (tag) { //tag为false表示登录后上传数据，true为下载数据
        //初始化用户数据
        if (!window.qg) return
        var self = this;

        Manager.Home.btn[2].active = false;  //关闭排行榜按钮显示
        let HENode = Manager.Alert.gameHENode;
        cc.find("Btn/Btn_share", HENode).active = false;
        cc.find("Btn/Btn_back", HENode).x = 0;;
        // var xhr = new XMLHttpRequest();
        // xhr.onreadystatechange = function () {
        //     if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
        //         var response = xhr.responseText;
        //         console.log(response);
        //     }
        // };
        // xhr.open("POST", url, true);
        // xhr.send();

        // wx.onHide(function () {
        //     if (window.Manager.userData.openid) {
        //         self.uploadData(window.Manager.userData);
        //     }
        // });
    },

    uploadData() {
        return
    },

    //生成授权按钮
    createUserInfoButton(btnNode) {
        return
    },

    //--------------------------------------------------------------------------------------------
    //----------------------------------------广告---------------------------------------------
    //--------------------------------------------------------------------------------------------
    sysInfo: null,
    currentBannerAd: "",
    currentVideoAd: "",
    ad_mediaId: 30219655,
    bannerAd: null,
    bannerAdId: 138841,
    videoAd: null,
    videoAdId: 138843,
    videoAdSuccessCb: function (name) {
        if (name == "propTips") {
            window.Manager.Game.propTipsSuccessCb();
        } else if (name == "tips") {
            window.Manager.Alert.tipsSuccessCallBack();
        } else if (name == "badEnd") {
            window.Manager.Alert.tipsSuccessCallBack();
        }
    },
    //初始化广告
    InitAd: function () {
        console.log("########## 广告开始初始化 ##########");
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            return;
        }
        var self = this;
        qg.initAdService({
            appId: self.ad_mediaId,
            isDebug: false,
            success: function (res) {
                console.log("########## 广告初始化成功 ##########");
                self.hasGetSDK = true;
                self.InitBannerAd();
                self.InitInsertAd();
                self.InitVideoAd();
            },
            fail: function (res) {
                console.log("########## 广告初始化失败 ##########", JSON.stringify(res));
            },
            complete: function (res) {
                console.log("########## 广告初始化完成 ##########", JSON.stringify(res));
            }
        })
    },
    InitBannerAd: function (name) {
        var self = this;
        console.log("########## 初始化Banner ##########");
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            console.log("InitBannerAd err")
            return;
        }
        this.bannerAd = qg.createBannerAd({
            posId: self.bannerAdId
        })
        console.log("this.bannerAd");
        this.bannerAd.onShow(function () {
            console.log("banner 广告显示");
        })
        this.bannerAd.onHide(function () {
            console.log("banner 广告隐藏");
        })
        this.bannerAd.onError(function (err) {
            if (err) {
                console.log("banner 广告错误：", JSON.stringify(err));
            } else {
                console.log("err 为空");
            }
        })
    },
    showBannerAd: function (name) {
        if (!this.hasGetSDK) return;
        console.log("########## 展示Banner ##########");
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            return;
        }
        if (this.bannerAd) {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            this.bannerAd.show();
        } else {
            console.log("banner 广告为空");
            this.InitBannerAd();
        }
    },
    hideBannerAd: function (name) {
        if (!this.hasGetSDK) return;
        console.log("########## 关闭Banner ##########");
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            return;
        }
        if (this.bannerAd) {
            this.bannerAd.hide();
        } else {
            console.log("banner 广告为空");
            this.InitBannerAd();
        }
    },

    InitInsertAd: function () {
        console.log("########## 初始化插屏 ##########");
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            return;
        }
        this.insertAd = qg.createInsertAd({
            posId: 138840
        })
        setTimeout(() => {
            this.insertAd.load();
        }, 500);

        var self = this;
        this.insertAd.onLoad(function () {
            console.log('插屏⼴告加载成功')
            self.isInsertLoaded = true;
        })
        this.insertAd.onShow(function () {
            console.log("插屏广告展示");
            self.isInsertLoaded = false;
            self.insertAd.load();
        })

        this.insertAd.onError(function (err) {
            if (err) {
                console.log("插屏 广告错误：", JSON.stringify(err));
            } else {
                //console.log("err 为空");
            }
        })
    },

    canShowInsert: function () {
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            console.log("插屏是否可用:" + true);
            return true;
        }
        console.log("插屏是否可用:" + this.isInsertLoaded);
        if (!this.isInsertLoaded && this.insertAd) {
            this.insertAd.load();
        }
        return this.isInsertLoaded;
    },

    showInsertAd() {
        if (!this.hasGetSDK) return;
        console.log("########## 展示插屏 ##########");

        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            return;
        }

        if (this.insertAd) {
            if (this.canShowInsert()) {
                this.insertAd.show();
            }
        } else {
            this.initInsert();
        }
    },

    InitVideoAd: function () {
        console.log("########## 初始化视频 ##########");
        var self = this;
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            return;
        }

        this.videoAd = qg.createRewardedVideoAd({
            posId: self.videoAdId
        })

        setTimeout(() => {
            this.videoAd.load();
        }, 500);

        this.videoAd.onLoad(function () {
            console.log('激励视频⼴告加载成功')
            self.isVideoLoaded = true;
        })

        this.videoAd.onVideoStart(function () {
            console.log("激励视频 开始播放");
        })

        this.videoAd.onRewarded(function () {
            console.log("Rewarded激励视频广告完成，发放奖励");
            self.isVideoLoaded = false;
            self.videoAd.load();
            if (self.currentVideoAd) {
                window.Manager.Alert.showFloatingTxt("看完视频，获得提示");
                self.videoAdSuccessCb(self.currentVideoAd);
            }
        })

        //支持最低平台版本号'1040' (minPlatformVersion>='1040')
        this.videoAd.onClose((res) => {
            window.Manager.openVolume(); //开声音
            self.isVideoLoaded = false;
            self.videoAd.load();
            if (self.videoAdSuccessCb) {
                if (res.isEnded) {
                    if (self.currentVideoAd) {
                        window.Manager.Alert.showFloatingTxt("看完视频，获得提示");
                        self.videoAdSuccessCb(self.currentVideoAd);
                    }
                } else {
                    window.Manager.Alert.showFloatingTxt("没看完视频，无法得提示");
                }
            }
            if (res.isEnded) {
                console.log('激励视频广告完成，发放奖励')
            } else {
                console.log('激励视频广告取消关闭，不发放奖励')
            }
        })

        this.videoAd.onError(function (err) {
            if (err) {
                console.log("激励视频 广告错误：", JSON.stringify(err));
            } else {
                window.Manager.Alert.showFloatingTxt("暂时没有视频可以观看");
            }
        })
    },
    
    canShowVideo: function () {
        if (cc.sys.platform != cc.sys.OPPO_GAME) {
            console.log("视频是否可用:" + true);
            return true;
        }
        console.log("视频是否可用:" + this.isVideoLoaded);
        if (!this.isVideoLoaded && this.videoAd) {
            this.videoAd.load();
        }
        return this.isVideoLoaded;
    },

    showVeideoAd: function (name) {
        if (!this.hasGetSDK) return;
        console.log("########## 展示视频 ##########");
        if (cc.sys.platform != cc.sys.OPPO_GAME) return;
        self.currentVideoAd = name;
        if (this.videoAd) {
            if (this.canShowVideo()) {
                this.videoAd.show();
                window.Manager.closeVolume(); //关声音
            } else {
                window.Manager.Alert.showFloatingTxt("暂时没有视频可以观看");
            }
        } else {
            this.initVideo();
            window.Manager.Alert.showFloatingTxt("请重试！");
        }
    },


    //--------------------------------------------------------------------------------------------
    //----------------------------------------分享---------------------------------------------
    //--------------------------------------------------------------------------------------------
    //右上角分享
    InitShare: function () {
        return
    },
    //注册主动拉起分享的回调
    registerShare: function (key, successCallBack, failCallBack) {
        return
    },
    //主动拉起分享（oppo改为开视频）
    showShare: function (key, typeBool) { //参数：onshow中回调键；分享种类，true为好结局，false为坏结局
        if (cc.sys.platform === cc.sys.OPPO_GAME) {
            this.showVeideoAd("tips");
        }
    },

    //--------------------------------------------------------------------------------------------
    //----------------------------------------排行榜---------------------------------------------
    //--------------------------------------------------------------------------------------------
    //初始化排行榜
    InitRank: function (rankSprite) {
        return


    },
    //上传排行榜信息
    rankUploadGameData: function (data) {
        return

    },
    //更新排行榜信息
    rankUpdateRankData: function () {
        return

    }
}

