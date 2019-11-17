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
		wawa: {
			default: [],
			type: cc.Node
		},
		window: {
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
		weather: {
			default: [],
			type: cc.Node
		},
		float: {
			default: null,
			type: cc.Node
		},
		bubble: {
			default: null,
			type: cc.Node
		},
		other: {
			default: [],
			type: cc.Node
		},
		target: {
			default: [],
			type: cc.Node
		}
	},

	// onLoad () {
	//     this._super();

	// },

	start() {
		this.addSceneChange(this.root);

		this.setFloating(this.float, "bubble1", "bubble2");

		this.other[0].on(cc.Node.EventType.TOUCH_END, () => { //树
			if (this.isPlayAni) return;
			this.continue3();
			this.other[0].off(cc.Node.EventType.TOUCH_END);
		});

		this.setWawaEvent();

		this.addEventToGetProp(this.prop[1], [this.window[1], this.window[2], this.role2[0]], [() => { //石头
			this.badEnd2(1)
		}, () => {
			this.continue1(1)
		}, () => {
			this.continue2(1)
		}]);
		this.addEventToGetProp(this.prop[2], [this.window[1], this.window[2], this.role2[0], this.role1], [() => { //纸团
			this.badEnd2(2)
		}, () => {
			this.continue1(2)
		}, () => {
			this.continue2(2)
		}, this.continue4.bind(this)]);
	},

	setWawaEvent() {
		this.WeaCount = 0;
		this.wawa[0].on(cc.Node.EventType.TOUCH_END, () => { //左娃娃
			if (this.isPlayAni) return;
			this.wawa[0].active = false;
			this.wawa[1].active = true;
			this.ctrlWeather(true);
		});

		this.prop[0].on(cc.Node.EventType.TOUCH_END, () => { //右娃娃
			if (this.isPlayAni) return;
			this.prop[0].active = false;
			this.wawa[2].active = true;
			this.ctrlWeather(true);
		});

		this.wawa[1].on(cc.Node.EventType.TOUCH_END, () => { //左娃娃 倒
			if (this.isPlayAni) return;
			this.wawa[0].active = true;
			this.wawa[1].active = false;
			this.ctrlWeather(false);
		});

		this.wawa[2].on(cc.Node.EventType.TOUCH_END, () => { //右娃娃 倒
			if (this.isPlayAni) return;
			this.prop[0].active = true;
			this.wawa[2].active = false;
			this.ctrlWeather(false);
		});
	},

	ctrlWeather(bool) { //bool为true为变坏，false为变好
		if (bool && this.WeaCount < 2) {
			this.WeaCount++;
		} else if (!bool && this.WeaCount > 0) {
			this.WeaCount--;
		}

		for (let i in this.weather) {
			this.weather[i].active = false;
		}
		this.weather[this.WeaCount].active = true;

		if (this.WeaCount == 2) {
			this.other[1].active = true;
			this.other[2].active = true;
		} else if (this.WeaCount == 1) {
			this.other[1].active = true;
			this.other[2].active = false;
		} else {
			this.other[1].active = false;
			this.other[2].active = false;
		}

		if (this.WeaCount >= 2) {
			this.isRain = true;
		} else {
			this.isRain = false;
		}
	},

	//砸右窗
	continue1(index) { //index为1为石头，2为纸团
		let prop = null;
		if (index == 1) {
			prop = this.prop[1];
		} else {
			prop = this.prop[2];
		}
		prop.active = true;
		prop.position = cc.v2(459, -57)

		let action0 = cc.sequence(
			cc.bezierTo(0.5, [cc.v2(459, -57), cc.v2(502, 54), cc.v2(620, 74)]),
			cc.callFunc(() => {
				this.bubble.position = cc.v2(659, 175); //280 175
				this.bubble.active = true;
				this.bubble.runAction(cc.scaleTo(0.5, 1.1));
				if (index == 1) { //如果是石头
					this.window[0].position = cc.v2(620, 74);
					this.window[0].active = true;
				}
			}),
			cc.spawn(
				cc.moveBy(0.5, cc.v2(0, -40)).easing(cc.easeIn(3)),
				cc.fadeOut(0.5).easing(cc.easeIn(10))
			),
			cc.callFunc(() => {
				this.bubble.active = false;
				prop.active = false;
				this.badEnd1(false, index);
			})
		)

		this.runSeqAction(prop, action0);
	},

	//砸老师
	continue2(index) {
		let prop = null;
		if (index == 1) {
			prop = this.prop[1];
		} else {
			prop = this.prop[2];
		}
		prop.active = true;
		prop.position = cc.v2(715, -40)

		let action0 = cc.sequence(
			cc.bezierTo(0.5, [cc.v2(715, -40), cc.v2(759, 47), cc.v2(850, 52)]),
			cc.callFunc(() => {
				this.bubble.position = cc.v2(943, 116); //280 175
				this.bubble.active = true;
				this.bubble.runAction(cc.scaleTo(0.5, 1.1));
			}),
			cc.spawn(
				cc.moveBy(0.5, cc.v2(0, -40)).easing(cc.easeIn(3)),
				cc.fadeOut(0.5).easing(cc.easeIn(10))
			),
			cc.callFunc(() => {
				this.bubble.active = false;
				prop.active = false;
				this.badEnd1(true, index);
			})
		)

		this.runSeqAction(prop, action0);
	},

	//摇树出纸团
	continue3() {
		this.isPlayAni = true;

		this.other[0].runAction(
			cc.sequence(
				cc.repeat(
					cc.sequence(
						cc.moveBy(0.1, cc.v2(-5, 0)),
						cc.moveBy(0.1, cc.v2(5, 0))
					), 5
				),
				cc.callFunc(() => {
					this.prop[2].active = true;
					this.prop[2].opacity = 0;
					this.prop[2].runAction(
						cc.spawn(
							cc.moveBy(0.5, cc.v2(0, -40)).easing(cc.easeIn(3)),
							cc.fadeIn(0.5).easing(cc.easeOut(8))
						)
					)
				}),
				cc.delayTime(0.5),
				cc.callFunc(() => {
					this.isPlayAni = false;
				})
			)
		)
	},

	//加工纸团
	continue4() {
		this.float.active = false;
		this.isPlayAni = true;

		this.role1.runAction(
			cc.sequence(
				cc.repeat(
					cc.sequence(
						cc.moveBy(0.1, cc.v2(5, 0)),
						cc.moveBy(0.1, cc.v2(-5, 0))
					), 5
				),
				cc.callFunc(() => {
					this.isPlayAni = false;
					this.pocketPush(this.prop[0], this.target[0], () => {
						this.prop[0].active = true;
					})
				})
			)
		)
	},

	//在右边主任拖走，tag为false砸窗，true砸主任
	badEnd1(tag, index) {
		this.float.active = false;

		this.role2[2].position = cc.v2(878, -214);

		let action0 = cc.sequence(
			cc.toggleVisibility(),
			cc.callFunc(() => {
				this.role2[0].active = false;
				this.role2[1].active = true;
			}),
			cc.delayTime(1),
			cc.callFunc(() => {
				this.role2[1].active = false;
			}),
			cc.toggleVisibility(),
			cc.moveTo(1.5, cc.v2(1067, -167)),
			cc.fadeOut(0.3),
			cc.callFunc(() => {
				if (!tag) {
					if (index == 1) {
						this.gameCtrl.toBadEnd(0, 1);
					} else {
						this.gameCtrl.toBadEnd(1, 1);
					}
				} else {
					this.gameCtrl.toBadEnd(2, 1);
				}
			})
		)

		this.runSeqAction(this.role2[2], action0);
	},

	//砸左窗
	badEnd2(index) {
		let prop = null;
		if (index == 1) {
			prop = this.prop[1];
		} else {
			prop = this.prop[2];
		}
		this.float.active = false;
		prop.active = true;
		prop.position = cc.v2(-2, -40)

		let action0 = cc.sequence(
			cc.bezierTo(0.5, [cc.v2(-2, -40), cc.v2(27, 45), cc.v2(156, 74)]),
			cc.callFunc(() => {
				this.bubble.position = cc.v2(200, 175);
				this.bubble.active = true;
				this.bubble.runAction(cc.scaleTo(0.5, 1.1));
				if (index == 1) {
					this.window[0].position = cc.v2(156, 74);
					this.window[0].active = true;
				}
			}),
			cc.spawn(
				cc.moveBy(0.5, cc.v2(0, -40)).easing(cc.easeIn(3)),
				cc.fadeOut(0.5).easing(cc.easeIn(10))
			),
			cc.callFunc(() => {
				this.bubble.active = false;
				prop.active = false;
			})
		)

		let action1 = cc.sequence(
			cc.callFunc(() => {
				this.role2[1].position = cc.v2(444, -142);
				this.role2[2].position = cc.v2(104, -246);
			}),
			cc.moveTo(0.5, cc.v2(308, -142)),
			cc.delayTime(1)
		)

		let action2 = cc.sequence(
			cc.callFunc(() => {
				this.role1.active = false;
				this.role2[1].active = false;
			}),
			cc.moveTo(1.5, cc.v2(276, -167)),
			cc.fadeOut(0.3),
			cc.callFunc(() => {
				if (index == 1) {
					this.gameCtrl.toBadEnd(0, 1);
				} else {
					this.gameCtrl.toBadEnd(1, 1);
				}
			})
		)

		let nodes = [prop, this.role2[1], this.role2[2]];
		let actions = [action0, action1, action2];
		this.runSeqAction(nodes, actions);
	},

	happyEnd() {
		let windSprite = this.other[3].getComponent(cc.Sprite); //刮风
		this.other[3].active = true;
		setTimeout(() => {
			windSprite.fillStart = 0.83;
			setTimeout(() => {
				windSprite.fillStart = 0.37;
				setTimeout(() => {
					windSprite.fillStart = 0;
				}, 500)
			}, 500)
		}, 500)

		let action0 = cc.sequence( //掉头发
			cc.delayTime(1.5),
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
				), 5
			),
			cc.spawn(
				cc.jumpBy(1, cc.v2(400, -100), 40, 1),
				cc.rotateTo(1, -180)
			),
			cc.callFunc(()=>{
				this.other[3].active = false;
			})
		)

		let action1 = cc.moveTo(1, cc.v2(1218, -85));	//主任离开

		this.role1.opacity = 0;
		this.role1.position = cc.v2(794, -216); //887,-99
		let action2 = cc.sequence(		//进教室
			cc.fadeIn(1),
			cc.moveTo(0.5, cc.v2(887, -99)),
			cc.fadeOut(0.3),
			cc.callFunc(() => {
				this.gameCtrl.toHappyEnd(0,1);
			})
		)

		let nodes = [this.role2[3], this.role2[0], this.role1];
		let actions = [action0, action1, action2];
		this.runSeqAction(nodes, actions);
	},

	update(dt) {
		if (this.isRain) {
			if (this.root.position.x == -750) {
				this.happyEnd();
				this.isRain = false;
			}
		}
	},
});