
// var Api = require('QQApi');
var Api = require("OppoApi");
// var Api = require('WxApi');
// var Sdk = require('AlySdk');
var Sdk = require('OppoSdk');
// var Api = require('QQApi');

window.adMode = null;
window.Manager = null;
var Home = require('Home');
var Menu = require('Menu');
var Game = require('Game');
var Alert = require('Alert');

cc.Class({
    extends: cc.Component,

    properties: {
        audioClips: {
            default: [],
            type: cc.AudioClip
        },
        Home: Home,
        Menu: Menu,
        Game: Game,
        Alert: Alert,

        //管理用户信息
        userData: {
            type: Object,
            default: {}
        },
        userInfo: {
            type: Object,
            default: {}
        }
    },

    onLoad() {
        Manager = this;
        this.InitApi();
        this.Api = Api;

        this.bgmIsPlay = false;

        //引入sdk
        this.Sdk = this.node.addComponent(Sdk);
        

        //加载子包
        let self = this;
        if (CC_WECHATGAME || window.qg) {
            console.log("开始加载子包")
            cc.loader.downloader.loadSubpackage('stages', function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log('load subpackage successfully.');

                self.Game.loadPrefabs();
            });
        } else {
            self.Game.loadPrefabs();
        }
        
    },

    start() {
        
    },

    //初始化用户数据，，
    //返回false为无本地数据，需要在服务器找数据
    //返回true为有本地数据，需要上传服务器
    initUserData() {
        // cc.sys.localStorage.removeItem("userData");    //测试！！！清本地数据
        let uJson = cc.sys.localStorage.getItem("userData");
        if (uJson == null || uJson == "") {
            console.log("本地数据为空");
            this.userData = {
                openid: "",
                //Bgm : false,   //是否播放音乐
                currentStage: 1,    //当前已开启关卡号
                stageState: [1],    //关卡状态，0或空未开启，1为已开启，2为已通关
                stageTips: [],     //关卡Tips激活状态，0或空为未开启提示，1为开启1条，2为开启2条
                stageTime: [],    //各个关卡通过时间,ms
                propState:[],     //道具提示状态
                aldTag:{},         //阿拉丁记录1,6,11
                totalTime: 0,     //通关总时间
                lastLoginDate: 0
            }
            // this.userData.stageState= [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1];    //关卡状态，0或空未开启，1为已开启，2为已通关
            // this.userData.currentStage= 31;    //关卡状态，0或空未开启，1为已开启，2为已通关
            // return true;       //测试！！！上传数据
            return false
        } else {
            console.log("本地数据存在:" + uJson);
            this.userData = JSON.parse(cc.sys.localStorage.getItem("userData"));
            this.verifyAddData();
            return true
        }
        
        // cc.sys.localStorage.setItem("userData", JSON.stringify(this.userData));因为异步执行，需要在Api内调用
    },

    verifyAddData(){
        if(!this.userData.propState) this.userData.propState = [];
        if(!this.userData.aldTag) this.userData.aldTag = {};
    },

    //bgm
    playBgm() {
        this.bgmIsPlay = true;
        cc.audioEngine.playMusic(this.audioClips[0], false);
        this.bmgSv = setInterval(()=>{
            cc.audioEngine.stopMusic();
            setTimeout(()=>{
                cc.audioEngine.playMusic(this.audioClips[0], false);
            },50)
        },16050)
        
        cc.log("playBgm");
    },
    stopBgm() {
        this.bgmIsPlay = false;
        cc.audioEngine.stopMusic();
        clearInterval(this.bmgSv);
        cc.log("stopBgm");
    },
    playBtnSound() {
        //cc.audioEngine.setVolume()
        cc.audioEngine.playEffect(this.audioClips[1], false);
    },


    //初始化api
    InitApi() {
        let tag = this.initUserData();  //构建数据

        Api.InitShare();    //分享
        Api.InitRank(this.Alert.rankSprite);    //排行榜
        Api.InitAd()        //广告
        Api.login(tag);     //登录
    },

    //更新用户信息
    upateUserData() {
        cc.sys.localStorage.setItem("userData", JSON.stringify(this.userData));    //改本地内存

        
        //TODO:改服务器信息
        Api.uploadData(this.userData);
        cc.log(cc.sys.localStorage.getItem("userData"));
    },

    //改排行榜信息
    rankUploadGameData(){
        Api.rankUploadGameData({    
            "stage": "" + (this.userData.currentStage - 1),
            "time": "" + this.userData.totalTime
        })
    },

    //生成授权按钮
    createUserInfoButton(btnNode){
        Api.createUserInfoButton(btnNode);
    },

    //#region 广告与分享
    showBannerAd(key){
        Api.showBannerAd(key)
    },
    showVeideoAd(key){
        Api.showVeideoAd(key);
    },

    //注册（监听）分享回调
    registerShare(key, successCallBack, failCallBack) {
        Api.registerShare(key, successCallBack, failCallBack);
    },

    /**
     * 主动拉起分享
     * @param {*} key onshow函数键值
     * @param {*} typeBool true为好结局，false为坏结局
     */
    showShare(key,typeBool) {
        Api.showShare(key,typeBool);
    },

    //更新排行榜画布
    rankUpdateRankData() {
        Api.rankUpdateRankData();
    },

    //排行榜滚动事件
    rankTouchMove(detlaY) {
        Api.rankTouchMove(detlaY);
    },

    closeVolume(){
        this.bgmVolume = cc.audioEngine.getMusicVolume();
        cc.audioEngine.setEffectsVolume(0);
        cc.audioEngine.setMusicVolume(0);
    },

    openVolume(){
        if(this.bgmVolume) this.bgmVolume = 0.5;
        cc.audioEngine.setMusicVolume(this.bgmVolume);
        cc.audioEngine.setEffectsVolume(1);
    },

    //#endregion

    update() {
        if (Api.rankIsDirty) {
            Api.renderRank();
            Api.rankIsDirty = false;
        }

    }
});
