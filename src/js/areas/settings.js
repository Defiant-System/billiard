
// billiard.settings

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
			el: window.find(".settings-view"),
		};
		// default settings
		this.defaultSettings = {
			music: "off",
			soundFx: "on",
			guide: "on",
			vs: "on",
			// ai: .4,
		};
		// music info
		this.tune = { name: "tune-1" };
		// bind event handlers
		this.els.el.on("mousedown", ".control .track", this.doRange);
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.settings,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-view":
				break;
			case "init-settings":
				Self.values = window.settings.getItem("settings") || Self.defaultSettings;
				// apply settings
				for (let key in Self.values) {
					let type = "toggle-"+ key,
						arg = Self.values[key] === "off";
					// call dispatch
					Self.dispatch({ type, arg });
				}
				break;
			case "show-settings":
				APP.game.dispatch({ type: "game-pause" });
				Self.els.content.addClass("open-settings");
				break;
			case "close-settings":
				Self.els.content.cssSequence("close-settings", "transitionend", el => {
					el.removeClass("open-settings close-settings");
					APP.game.dispatch({ type: "game-resume" });
				});
				break;
			case "quit-game":
				Self.els.content.removeClass("show-settings");
				APP.game.dispatch({ type: "game-pause" });
				APP.game.dispatch({ type: "game-stop" });
				APP.dispatch({ type: "switch-view", arg: "start" });
				break;
			case "toggle-music":
				el = Self.els.el.find(`div[data-click="${event.type}"]`);
				value = event.arg === undefined ? el.data("value") === "on" : event.arg;
				if (value) {
					el.removeAttr("data-value");
					if (Self.tune.song) Self.tune.song.stop();
					delete Self.tune.song;
				} else {
					el.data({ value: "on" });
					if (!Self.tune.song) {
						let rowEl = el.parents(".row").addClass("loading"),
							opt = {
								onend: e => {
									if (!Self.tune.song) return;
									let [a, b] = Self.tune.name.split("-");
									b = (+b) + 1;
									// next tune
									if (b > 3) b = 1;
									Self.tune.name = "tune-"+ b;
									// play next song
									playSong();
								}
							},
							playSong = () => window.audio.play(Self.tune.name, opt)
													.then(song => {
														rowEl.removeClass("loading");
														Self.tune.song = song;
													});
						playSong();
						return true;
					}
				}
				break;
			case "toggle-soundFx":
				el = Self.els.el.find(`div[data-click="${event.type}"]`);
				value = event.arg === undefined ? el.data("value") === "on" : event.arg;
				if (value) {
					el.removeAttr("data-value");
					Sound.setMute(true);
				} else {
					el.data({ value: "on" });
					Sound.setMute(false);
				}
				break;
			case "toggle-guide":
				el = Self.els.el.find(`div[data-click="${event.type}"]`);
				value = event.arg === undefined ? el.data("value") === "on" : event.arg;
				if (value) {
					el.removeAttr("data-value");
					Project.guideOn = false;
				} else {
					el.data({ value: "on" });
					Project.guideOn = true;
				}
				break;
			case "toggle-vs":
				el = Self.els.el.find(`div[data-click="${event.type}"]`);
				value = event.arg === undefined ? el.data("value") === "on" : event.arg;
				if (value) {
					el.removeAttr("data-value");
					Project.mode = 2;
				} else {
					el.data({ value: "on" });
					Project.mode = 1;
					if (playState.gameInfo) {
						if (playState.gameInfo.turn === "p2") {
							playState.gameInfo.drawGuide = false;
							playState.gameInfo.guideCanvas.visible = false;
							playState.gameInfo.ballArray[0].mover.visible = false;
						} else {
							playState.gameInfo.drawGuide = true;
							playState.gameInfo.guideCanvas.visible = true;
						}
					}
				}
				break;
			case "set-ai-difficulty":
				console.log(event.value);
				// multiply ai rating
				// Project.aiRating
				break;
		}
	},
	doRange(event) {
		let Self = billiard.settings,
			Drag = Self.drag;
		// console.log(event);
		switch (event.type) {
			case "mousedown":
				let el = $(event.target),
					startV = +el.data("value"),
					clientX = event.clientX,
					minX = 0,
					maxX = 100;
				Self.drag = { el, startV, clientX, minX, maxX };

				// bind event handlers
				Self.els.doc.on("mousemove mouseup", Self.doRange);
				break;
			case "mousemove":
				let value = Drag.startV + (event.clientX - Drag.clientX);
				value = Math.min(Math.max(value, Drag.minX), Drag.maxX);
				// console.log(value);
				Drag.el.data({ value });
				break;
			case "mouseup":
				// update ai difficulty
				Self.dispatch({ type: "set-ai-difficulty", value: +Drag.el.data("value") });
				// unbind event handlers
				Self.els.doc.off("mousemove mouseup", Self.doRange);
				break;
		}
	}
}
