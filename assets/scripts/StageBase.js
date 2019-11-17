cc.Class({
    extends: cc.Component,

    properties: {
        pocket: {
            default: null,
            type: cc.Node,
            visible: false
        },
        propPosInPocket: {
            default: [],
            type: cc.Vec2,
            visible: false
        },
        change: {
            default: [],
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.gameCtrl = this.node.parent.parent.getComponent("Game");
        this.pocket = cc.find("Pocket", this.node);
        this.propPosInPocket = [cc.v2(-281.5, 0), cc.v2(-93.75, 0), cc.v2(93.75, 0), cc.v2(281.5, 0)];
        this.pocketTag = [0, 0, 0, 0];

        this.isPlayAni = false;
    },

    start() {

    },

    /**
     * 给道具添加点击事件,场景道具名与背包道具名要一致,失败为回到原点
     * @param {number} composeId 合成事件id
     */
    addEventToGetProp(propNode, targetNode, trueCallback, composeId) {
        propNode.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return;
            this.pocketPush(propNode, targetNode, trueCallback, composeId);
            propNode.off(cc.Node.EventType.TOUCH_END);
        }, this);
    },

    /**
     * 给道具添加点击事件,若满给提示
     * @param {number} composeId 合成事件id
     */
    addEventToGetPropCheck(propNode, targetNode, trueCallback, composeId) {
        propNode.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return;
            for (var i = this.pocketTag.length - 1; i >= 0; i--) {
                if (this.pocketTag[i] == 0) {
                    this.pocketPush(propNode, targetNode, trueCallback, composeId);
                    propNode.off(cc.Node.EventType.TOUCH_END);
                    return;
                }
            }
            Manager.Alert.showFloatingTxt("道具栏已满!");
        }, this);
    },

    /**
     * 初始化合成事件
     * @param {number} id 合成事件id
     * @param {*} composePropNode 合成物品节点，在pocket里
     * @param {*} count 需要的物品数量
     * @param {*} pos 合成位置，相对于道具栏
     * @param {*} targetNode 合成物品触发目标
     * @param {*} trueCallback 合成物品触发事件
     * @param {*} countinueCallBack 触发合成事件回调
     */
    InitComposeEvent(id, composePropNode, total, pos, targetNode, trueCallback, countinueCallBack) {
        if (!this.composeEvent) this.composeEvent = {};
        let mId = id;
        if (typeof(mId) != "number") mId = 1;
        this.composeEvent[mId] = {};
        this.composeEvent[mId].propNode = [];
        this.composeEvent[mId].count = 0;
        this.composeEvent[mId].total = total;
        let composeObj = this.composeEvent[mId];
        let self = this;
        //合成动画
        this.composeEvent[mId].cb = function() {
            composePropNode.position = pos;
            for (let i = 0; i < composeObj.count; i++) { //被合成物品动画
                composeObj.propNode[i].runAction(
                    cc.sequence(
                        cc.moveTo(0.5, pos), //移动时间
                        cc.fadeOut(0.1), //淡出时间
                        cc.callFunc(() => {
                            self.pocketPop(composeObj.propNode[i]);
                        })
                    )
                )
            }

            self.scheduleOnce(() => { //合成出来物品的动画
                composePropNode.opacity = 100;
                composePropNode.active = true;
                composePropNode.runAction(
                    cc.sequence(
                        cc.spawn(
                            cc.fadeIn(0.2),
                            cc.scaleTo(0.3, 1.2).easing(cc.easeOut(3))
                        ),
                        cc.scaleTo(0.2, 1),
                        cc.delayTime(0.1),
                        cc.callFunc(() => {
                            self.isPlayAni = false;
                            //动作结束回调注册拖拽事件
                            self.pocketPush(composePropNode, targetNode, trueCallback);
                        })
                    )
                )
            }, 0.6)

            //强行添加事件回调,需控制延迟时间
            if (countinueCallBack) {
                countinueCallBack();
            }
        };


        this.composeEvent[mId].mPush = function(node) {
            let propName = node.name;
            let prop = cc.find(propName, self.pocket);
            composeObj.propNode.push(prop);
            composeObj.count++;
            if (composeObj.count == composeObj.total) {
                self.isPlayAni = true;
                setTimeout(() => composeObj.cb(), 100);
            } else {
                self.isPlayAni = false;
            }
        };
    },

    /**
     * 往背包里添加道具，返回背包的道具节点
     * @param {number} composeId 合成事件id
     */
    pocketPush(propNode, targetNode, trueCallback, composeId) {
        propNode.active = false;
        let propName = propNode.name;
        let prop = cc.find(propName, this.pocket);
        this.isPlayAni = true;

        function cb() {
            for (let i = 0, len = this.pocketTag.length; i < len; i++) {
                if (this.pocketTag[i] === 0) {
                    this.pocketTag[i] = propName;
                    prop.position = cc.v2(0, 434);
                    prop.active = true;
                    prop.runAction(
                        cc.sequence(
                            cc.moveTo(0.2, this.propPosInPocket[i]),
                            cc.callFunc(() => {
                                //动作结束回调注册拖拽事件
                                this.propDragEvent(prop, targetNode, trueCallback);

                                //当物品为可合成物品
                                if (composeId && this.composeEvent && this.composeEvent[composeId]) {
                                    this.composeEvent[composeId].mPush(propNode);
                                } else {
                                    this.isPlayAni = false;
                                }
                            })
                        ),
                    )
                    break;
                }
            }
        }

        this.gameCtrl.openPropAlert(prop, cb.bind(this));
        //cc.log(this.pocketTag);
        return prop;
    },

    /**
     * 隐藏背包道具
     */
    pocketPop(propNode) {
        propNode.active = false;
        let propName = propNode.name;
        for (let i = 0; i < this.pocketTag.length; i++) {
            if (this.pocketTag[i] === propName) {
                this.pocketTag[i] = 0;
                propNode.position = this.propPosInPocket[i];
                break;
            }
        }
    },

    /**
     * 道具拖拽逻辑,需要多个事件时，targetNode与trueCallback为数组
     * @param {cc.Node,Array} propNode 
     * @param {cc.Node,Array} targetNode 
     * @param {Function} trueCallback 
     */
    propDragEvent(propNode, targetNode, trueCallback) {
        //判断参数是否为数组
        if (Object.prototype.toString.call(targetNode) != "[object Array]") {
            var targetNodes = [targetNode];
            var trueCallbacks = [trueCallback];
        } else {
            var targetNodes = targetNode;
            var trueCallbacks = trueCallback;
        }

        let isTouch = false;
        //记录移动前位置
        let tempPos = propNode.position;

        //按下修改标志
        propNode.on(cc.Node.EventType.TOUCH_START, (event) => {
            if (this.isPlayAni) return;
            isTouch = true;
        });

        //移动逻辑
        propNode.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            if (!isTouch) return; //只有当用户按下才能拖拽
            //获取距离上一次点的信息
            let delta = event.getDelta();
            //移动节点
            propNode.x = propNode.x + delta.x;
            propNode.y = propNode.y + delta.y;
        });

        let self = this;

        function touchEnd() {
            isTouch = false;
            if (targetNode == null) { //没有目标直接判断为失败
                propNode.position = tempPos;
                return;
            }

            let isTrigger = false;
            for (let i = 0; i < targetNodes.length; i++) {
                let worldPos1 = propNode.convertToWorldSpaceAR(cc.v2(0, 0)); //对比两个节点的距离需要转成世界坐标
                let worldPos2 = targetNodes[i].convertToWorldSpaceAR(cc.v2(0, 0));
                let disX = Math.abs(worldPos1.x - worldPos2.x);
                let disY = Math.abs(worldPos1.y - worldPos2.y);
                //判断是否成功触发
                if (disX < (propNode.width + targetNodes[i].width) / 2 && disY < (propNode.height + targetNodes[i].height) / 2 && targetNodes[i].active) {
                    if (trueCallbacks[i]) { //回调为null必失败
                        self.pocketPop(propNode); //隐藏背包节点
                        trueCallbacks[i].call();
                        isTrigger = true;
                        break;
                    }
                }
            }
            if (!isTrigger) {
                propNode.position = tempPos;
            }
        };
        //当抬起的时候结束逻辑
        propNode.on(cc.Node.EventType.TOUCH_END, (event) => {
            touchEnd();
        });
        //移出屏幕添加结束逻辑
        propNode.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
            touchEnd();
        });
    },

    /**
     * 设置永久跳动的气泡(包括2帧反复的动画)
     */
    setFloating(parentNode, txt1Str, txt2Str, time) {
        if (time == undefined) {
            time = 0.2;
        }
        let txt1Node = cc.find(txt1Str, parentNode);
        let txt2Node = cc.find(txt2Str, parentNode);
        parentNode.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.delayTime(time),
                    cc.callFunc(() => {
                        txt1Node.active = true;
                        txt2Node.active = false;
                    }),
                    cc.delayTime(time),
                    cc.callFunc(() => {
                        txt1Node.active = false;
                        txt2Node.active = true;
                    })
                )
            )
        )
    },

    /**
     * 顺序播放不同节点动作
     * @param {Array,cc.Node} nodes 节点数组对应actions中的动作
     * @param {Array,number} actions 动作数组,若为number则为显示该节点number秒
     */
    runSeqAction(nodes, actions) {
        //判断参数是否为数组
        if (Object.prototype.toString.call(nodes) != "[object Array]") {
            var nodeArr = [nodes];
            var actionArr = [actions];
        } else {
            if (nodes.length != actions.length) {
                cc.error("节点与动作数量不符");
                return
            } else {
                var nodeArr = nodes;
                var actionArr = actions;
            }
        }

        let promiseArray = [];

        for (let i = 0; i < nodeArr.length; i++) {
            if (actionArr[i] === null) {
                actionArr[i] = cc.callFunc(() => {
                    nodeArr[i].active = false
                })
            }

            if (typeof(actionArr[i]) === "number") {
                let delayTime = actionArr[i];
                actionArr[i] = cc.sequence(
                    cc.delayTime(delayTime),
                    cc.callFunc(() => {
                        nodeArr[i].active = false
                    })
                )
            }
            // 封装Promise
            let tempPromise = () => {
                return new Promise((resolve, reject) => {
                    nodeArr[i].active = true; //统一先显示节点
                    this.isPlayAni = true; //正在播放动画
                    nodeArr[i].runAction(cc.sequence(
                        actionArr[i],
                        cc.callFunc(() => {
                            this.isPlayAni = false;
                            resolve();
                        }),
                    ))
                })
            }
            promiseArray.push(tempPromise);
        }

        //顺序执行
        let p = Promise.resolve();
        for (let promise of promiseArray) {
            p = p.then(promise)
        }
        return p
    },

    /**
     * 注册场景切换事件,背景需命名为Bg(为了拖拉事件)
     * @param {cc.Node} root 
     * @param {cc.Node} toLeft 向右节点
     * @param {cc.Node} toRight 向左节点
     * @param {number} time 切换时间，默认0.2s
     */
    addSceneChange(root, time) {
        let toLeft = this.change[0];
        let toRight = this.change[1];
        toLeft.active = true;
        toRight.active = false;
        this.isChange = false;
        if (time === undefined) {
            time = 0.2;
        }

        let toLeftFunc = () => {
            if (this.isChange || this.isPlayAni) return;
            this.isChange = true;
            toLeft.active = false;
            root.runAction(
                cc.sequence(
                    cc.moveTo(time, cc.v2(-750, 156)),
                    cc.callFunc(() => {
                        this.isChange = false;
                        toRight.active = true;
                    })
                )
            );
        }

        let toRightFunc = () => {
            if (this.isChange || this.isPlayAni) return;
            this.isChange = true;
            toRight.active = false;
            root.runAction(
                cc.sequence(
                    cc.moveTo(time, cc.v2(0, 156)),
                    cc.callFunc(() => {
                        this.isChange = false
                        toLeft.active = true;
                    })
                )
            );
        }

        //按钮切换场景
        toLeft.on(cc.Node.EventType.TOUCH_END, () => {
            toLeftFunc();
        });
        toRight.on(cc.Node.EventType.TOUCH_END, () => {
            toRightFunc();
        });

        //滑动切换
        let bg = cc.find("Bg", root);
        if (!bg) return
        let movePx = 80;
        let touchTag = false;
        bg.on(cc.Node.EventType.TOUCH_START, () => {
            touchTag = true;
        })
        let moveDisX = 0;
        bg.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            if (!touchTag) return;
            let delta = event.getDelta();

            //移动节点
            moveDisX += delta.x;
        })
        bg.on(cc.Node.EventType.TOUCH_END, () => {
            if (!touchTag) return;
            touchTag = false;
            if (moveDisX <= -movePx) {
                toLeftFunc();
            } else if (moveDisX >= movePx) {
                toRightFunc();
            }
            moveDisX = 0;
        })
        bg.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            if (!touchTag) return;
            touchTag = false;
            moveDisX = 0;
        })
    },

    /**
     * 主动切场景,重新激活按钮要手动修改isChange
     * @param {*} root 
     * @param {*} bool bool为true向右，bool为false向左
     * @param {*} time 默认0.2秒
     */
    changeScene(root, bool, time) {
        let toLeft = this.change[0];
        let toRight = this.change[1];
        if (time === undefined) {
            time = 0.2;
        }

        if (bool) {
            this.isChange = true;
            toLeft.active = false;
            root.runAction(
                cc.sequence(
                    cc.moveTo(time, cc.v2(-750, 156)),
                    cc.callFunc(() => {
                        toRight.active = true;
                    })
                )
            );
        } else {
            this.isChange = true;
            toRight.active = false;
            root.runAction(
                cc.sequence(
                    cc.moveTo(time, cc.v2(0, 156)),
                    cc.callFunc(() => {
                        toLeft.active = true;
                    })
                )
            );
        }
    },

    /**
     * 视线方向虚线,singleTime为每段持续时间,totalTime为总时间/秒
     */
    setLineOfSight(node, pos, rot, step, count, singleTime, totalTime) {
        let fWidth = step * count; //最终长度
        let mtotalTime = totalTime;
        let mtime1 = singleTime * 1000;
        let mtime2 = totalTime * 1000 - mtime1 * count;
        if (mtime2 <= 0) {
            mtime2 = 0;
            mtotalTime = mtime1 * count;
        }

        let action = cc.sequence(
            cc.callFunc(() => {
                node.position = pos;
                node.rotation = rot;
                node.width = 0;
                node.active = true;
                let sv1 = setInterval(() => {
                    if(!node){
                        clearInterval(sv1);
                        return
                    }
                    node.width += step;
                    if (node.width >= fWidth) {
                        clearInterval(sv1);
                        setTimeout(() => {
                            node.active = false;
                        }, mtime2);
                    }
                }, mtime1);
            }),
            cc.delayTime(mtotalTime)
        );
        return action;
    },

    /**
     * 添加抽屉事件
     */
    addDrawerEvent(closeNodes, openNodes, propNodes) {
        let len = closeNodes.length;
        let isOpenDrawer = false;
        let drawerPropTag = new Array(len);
        for (let i = 0; i < len; i++) {
            let mClose = closeNodes[i];
            let mOpen = openNodes[i];
            let mProp = propNodes[i];
            mClose.on(cc.Node.EventType.TOUCH_END, () => {
                if (isOpenDrawer || this.isPlayAni) return;
                mClose.active = false;
                mOpen.active = true;
                if (mProp && drawerPropTag[i] != true) {
                    mProp.active = true;
                    drawerPropTag[i] = true;
                }
                isOpenDrawer = true;
            }, this);
            mOpen.on(cc.Node.EventType.TOUCH_END, () => {
                if (mProp == null || mProp.active == false) {
                    isOpenDrawer = false;
                    mClose.active = true;
                    mOpen.active = false;
                }
            }, this)
        }

    },

    //
    /**
     * 添加柜子事件
     */
    addCabinetEvent(closeNode, openNode, prop) {
        let tag = true;
        closeNode.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return;
            closeNode.active = false;
            openNode.active = true;
            if (tag && prop) prop.active = true;

        }, this);
        openNode.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isPlayAni) return;
            openNode.active = false;
            closeNode.active = true;
            if (!prop) return
            if (!prop.active) {
                tag = false;
            }
            prop.active = false;
        }, this);

    },

    /**
     * 平滑修改sprite的filled
     * @param {*} node 节点
     * @param {*} duration 持续时间
     * @param {String} typeStr 种类，fillStart或fillRange
     * @param {*} start 
     * @param {*} end 
     */
    spriteToShow(node,duration,typeStr,start,end){
        let sprite = node.getComponent(cc.Sprite);
        let type = typeStr;
        if(type != "fillStart" && type!="fillRange"){
            cc.warn("spriteToShow的typeStr应为fillStart或fillRange");
            return
        }
        let dir = end - start;
        let step = 0.02 * dir/duration;
        let sv1 = setInterval(() => {
            sprite[type] += step;
            if(dir > 0){
                if (sprite.fillStart >= end)  clearInterval(sv1);
            }else if(dir <= 0){
                if (sprite.fillStart <= end)  clearInterval(sv1);
            }else{
                clearInterval(sv1);
            }
        }, 20);
    },

    /**
     * 文字打字机效果
     * @param {*} label 文字节点
     * @param {*} text 显示文字
     * @param {*} cb 打字机结束回调
     * @param {*} node 点击触发回调
     */
    typingAni(label, text, cb) {
        let self = this;
        self.unschedule(self.typing, self);
        let html = '';
        let arr = text.split('');
        let len = arr.length;
        let step = 0;
        label.string = "";
        self.typing = function() {
            if (arr[step] === "\\") {
                html += arr[step];
                step++;
            }
            html += arr[step];
            label.string = html;
            if (++step >= len) {
                self.unschedule(self.typing, self);
                cb && cb();
            }
        }
        self.schedule(self.typing, 0.05, cc.macro.REPEAT_FOREVER, 0)
    },

    /**
     * 文字打字机效果
     * @param {*} label 文字节点
     * @param {*} text 显示文字
     * @param {*} cb 打字机结束回调
     * @param {*} node 点击触发回调
     */
    typingRichAni(labelNode, text, cb) {
        let label = labelNode.getComponent(cc.RichText);
        let self = this;
        self.unschedule(self.typing, self);
        let html = '';
        let arr = text.split('');
        let len = arr.length;
        let step = 0;
        label.string = "";
        self.typing = function() {
            if (arr[step] === "<") {
                while (arr[step] != ">") {
                    html += arr[step];
                    step++;
                }
            }
            html += arr[step];
            label.string = html;
            if (++step >= len) {
                self.unschedule(self.typing, self);
                cb && cb();
            }
        }
        self.schedule(self.typing, 0.05, cc.macro.REPEAT_FOREVER, 0)
    },

    /**
     * 抛物线创建
     */
    createBezier(time, startPoint, endPoint, height, angle) {
        // 把角度转换为弧度
        let radian = angle * 3.14159 / 180;
        // 第一个控制点为抛物线左半弧的中点
        let q1x = startPoint.x + (endPoint.x - startPoint.x) / 4;
        let q1 = cc.v2(q1x, height + startPoint.y + Math.cos(radian) * q1x);
        // 第二个控制点为整个抛物线的中点
        let q2x = startPoint.x + (endPoint.x - startPoint.x) / 2;
        let q2 = cc.v2(q2x, height + startPoint.y + Math.cos(radian) * q2x);
        // 曲线配置
        return cc.bezierTo(time, [q1, q2, endPoint]);
    },

    /**
     * 自定义缓动动作
     */
    myEase() {
        return {
            //_rate: rate,
            easing: function(dt) {
                return Math.floor(dt);
            },
            reverse: function() {
                return Math.ceil(dt);
            }
        };
    },

    /**
     * //将数组arrlast插入数组arrfirst中，index是想要插入的位置
     * @param {*} arrfirst 
     * @param {*} arrlast 
     * @param {*} index 
     */
    insert(arrfirst, arrlast, index) {
        if (!index) {
            return arrfirst.concat(arrlast);
        } else if (index < 0) {
            index = 0;
        } else if (index > arrfirst.length) {
            index = arrfirst.length;
        }
        for (let i = arrlast.length - 1; i >= 0; i--) {
            arrfirst.splice(index, 0, arrlast[i]); //是在index位置用arrlast[i]替换掉arrfirst数组中的0个元素
        }
        return arrfirst;
    }

});