cc.Class({
    extends: cc.Component,

    properties: {
        gameList: [],
        prefabs: {
            default: {},
            type: cc.Prefab
        },
        items: {
            default: {},
            type: cc.Node
        },
        scrollIconWidth: 120,    //宽加间隙
        scrollSpeed: 10,    //滚动速度
        homeSpeed:1.5
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.gameList = [
            { name: "梦幻消星星", pkgName: "com.tomato.joy.fkxxx.kyx.nearme.gamecenter", path: ""},
            { name: "僵尸必须死", pkgName: "com.tomato.joy.wqzl.kyx.nearme.gamecenter", path: "" },
            { name: "黑洞也疯狂", pkgName: "com.tomato.joy.hdyfk.kyx.nearme.gamecenter", path: "" },
            { name: "僵尸来了", pkgName: "com.tomato.joy.qszr.kyx.nearme.gamecenter", path: "" },
            { name: "天天开铺子", pkgName: "com.tomato.joy.ttkpz.kyx.nearme.gamecenter", path: "" }
        ]

        //变动场景位置
        Manager.Home.loadingNode.y = -217;
        Manager.Home.btn[1].y = -210;
        Manager.Home.btn[2].y = -223;
        Manager.Home.btn[1].width = 340;
        Manager.Home.btn[1].height = 112;
        Manager.Home.logo.y = 45;
        Manager.Home.logo.scale = 0.85;

        //初始化变量
        this.navTag = false;

        //加载资源,包括icon和prefab
        this.iconCount = 0;
        this.iconTotal = this.gameList.length;
        this.gameList.forEach(element => {
            cc.loader.loadResDir('sdk/game/' + element.name, cc.SpriteFrame, (err, res) => {
                if (err) {
                    cc.log(err);
                    return
                }
                if(!res[1]) res[1]= res[0];
                if(!res[2]) res[2]= res[0];
                element.icon = res;
                this.iconCount++;
            })
        });

        //注册事件
        this.node.on("SDK_SHOW_HOME", this.showHome, this);
        this.node.on("SDK_SHOW_MENU", this.showMenu, this);
        this.node.on("SDK_SHOW_GAME", this.showGame, this);
        this.node.on("SDK_SHOW_ALERT", this.showAlert, this);
        this.node.on("SDK_HIDE_ALERT", this.hideAlert, this);
        this.node.on("SDK_SHOW_GAME_INSERT", this.showGameInsert, this);
    },

    //upDate中调用
    loadPrefabs() {
        cc.loader.loadResDir('sdk/prefabs/', cc.Prefab, (err, res) => {
            if (err) {
                cc.log(err);
                return
            }
            res.forEach(element => {
                this.prefabs[element._name] = element;
            });

            //初始化icon事件
            let itemPrefab = this.prefabs.Item;
            this.gameList.forEach(element => {
                let tmpNode = cc.instantiate(itemPrefab);
                this.items[element.name] = tmpNode;
            });
            this.Init();
            console.log(Object.keys(this.items));
        })
    },

    Init() {
        this.InitScrollIcon();
        this.InitSideIcon();
        
        if (Manager.Home.progressForSdk == false) {
            Manager.Home.progressForSdk = true;
            console.log("SDK加载完成");
            return
        }
        let sdkSv = setInterval(() => {
            if (Manager.Home.progressForSdk == false) {
                Manager.Home.progressForSdk = true;
                console.log("SDK加载完成");
                clearInterval(sdkSv)
            }
        }, 500)

    },

    InitScrollIcon() {
        let scrollParent = [Manager.Home.root, Manager.Alert.node];
        let scrollPos = [cc.v2(0, -350), cc.v2(0, 542)];
        let scrollSize = [100, 115];
        let scrollNavPos = ["主界面", "结算页"]
        this.scrollNode = [];
        this.scrollContent = [];
        for (let i = 0; i < scrollParent.length; i++) {
            this.scrollNode[i] = cc.instantiate(this.prefabs.SdkScroll);
            this.scrollContent[i] = cc.find("ScrollView/view/content", this.scrollNode[i]);

            this.gameList.forEach(element => {
                let tmpItem = cc.instantiate(this.items[element.name]);
                tmpItem.width = scrollSize[i];
                tmpItem.height = scrollSize[i];
                if (element.flash) {
                    let flashNode = cc.instantiate(this.prefabs.Flash);
                    flashNode.width = scrollSize[i];
                    flashNode.height = scrollSize[i];
                    flashNode.parent = tmpItem;
                }
                tmpItem.getComponent(cc.Sprite).spriteFrame = element.icon[1];
                tmpItem.on(cc.Node.EventType.TOUCH_END, () => {
                    this.addNavigateEvent(element.name, scrollNavPos[0]);
                })
                tmpItem.parent = this.scrollContent[i];
            });

            this.scrollNode[i].parent = scrollParent[i];
            this.scrollNode[i].position = scrollPos[i];
            if (i == 1) {
                this.scrollNode[i].scale = 1.18;
                let layout = this.scrollContent[i].getComponent(cc.Layout);
                let view = cc.find("ScrollView/view", this.scrollNode[i]);
                view.height = 124;
                view.width = 600;
                view.x -= 10;
                layout.spacingX = 6.25;
                this.scrollNode[i].active = false;
            }
        }
    },

    InitSideIcon() {
        this.sideNode = cc.instantiate(this.prefabs.SdkSide);

        let sideContent = cc.find("Bg/ScrollView/view/content", this.sideNode);
        let sideWin = cc.find("Bg", this.sideNode);
        let mask = cc.find("Mask", this.sideNode);
        this.sideBtn = cc.find("Btn_side", this.sideNode);
        sideWin.active = false;
        mask.active = false;
        let btnTag = 1;
        let st2 = null
        let sideFunc = () => {
            clearTimeout(st2);
            if (btnTag == 1) {
                btnTag = 0;
                setTimeout(() => {btnTag = 2;}, 200)
                mask.active = true;
                mask.runAction(cc.fadeIn(0.2));
                this.sideBtn.scaleX = 1;
                this.sideBtn.runAction(cc.moveBy(0.2, cc.v2(600, 0)));
                sideWin.active = true;
                sideWin.runAction(cc.moveBy(0.2, cc.v2(600, 0)));
            } else if (btnTag == 2) {
                btnTag = 0;
                setTimeout(() => {
                    btnTag = 1;
                    mask.active = false;
                    sideWin.active = false;
                }, 200);
                mask.runAction(cc.fadeOut(0.2));
                this.sideBtn.scaleX = -1;
                this.sideBtn.runAction(cc.moveBy(0.2, cc.v2(-600, 0)));
                sideWin.active = true;
                sideWin.runAction(cc.moveBy(0.2, cc.v2(-600, 0)));
            }
        }
        this.sideBtn.on(cc.Node.EventType.TOUCH_END, sideFunc, this);
        mask.on(cc.Node.EventType.TOUCH_END, sideFunc, this);

        //加icon
        this.gameList.forEach(element => {
            let tmpItem = cc.instantiate(this.items[element.name]);
            tmpItem.width = 160;
            tmpItem.height = 160;
            if (element.flash) {
                let flashNode = cc.instantiate(this.prefabs.Flash);
                flashNode.width = tmpItem.width;
                flashNode.height = tmpItem.height;
                flashNode.parent = tmpItem;
            }
            tmpItem.getComponent(cc.Sprite).spriteFrame = element.icon[0];
            tmpItem.on(cc.Node.EventType.TOUCH_END, () => {
                this.addNavigateEvent(element.name, "侧拉页");
            })
            tmpItem.parent = sideContent;
        });

        this.sideBtn.active = false;
        this.node.addChild(this.sideNode);
    },

    //#region 冒泡事件
    showHome() {
        this.sideBtn.active = false;
    },

    showMenu() {
        this.sideBtn.active = true;
    },

    showGame() {
        this.sideBtn.active = false;
    },

    showAlert() {
        this.scrollNode[1].active = true;
        this.sideBtn.active = true;
    },

    hideAlert() {
        this.scrollNode[1].active = false;
        this.sideBtn.active = false;
    },

    showGameInsert(){
        if(Manager.userData.currentStage >=5){
            Manager.Api.showInsertAd();
        }
    },

    //#endregion

    //跳转事件
    addNavigateEvent(name, pos) {
        if (this.navTag) return

        let game = {};
        this.gameList.forEach(element => {
            if (element.name == name) game = element;
        });

        wx.navigateToMiniProgram({
            pkgName: game.pkgName,
            path: game.path,
            success(res) {
                cc.log("跳转 " + name + " 成功");
            },
            fail(res) {
                cc.log("跳转 " + name + " 失败");
            }
        })

        console.log("跳转："+ name+"  "+pos);
        
        this.navTag = true;
        setTimeout(() => {
            this.navTag = false;
        }, 800)
    },


    update(dt) {
        if (this.iconCount >= this.iconTotal) {
            this.loadPrefabs();
            this.iconCount = 0;
        }
    },
});
