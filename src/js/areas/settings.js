
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
			ai: .4,
		};
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
				break;
			case "show-settings":
				Self.els.content.addClass("show-settings");
				APP.game.dispatch({ type: "game-pause" });
				break;
			case "close-settings":
				Self.els.content.removeClass("show-settings");
				APP.game.dispatch({ type: "game-resume" });
				break;
			case "quit-game":
				Self.els.content.removeClass("show-settings");
				APP.game.dispatch({ type: "game-pause" });
				APP.dispatch({ type: "switch-view", arg: "start" });
				break;
			case "set-ai-difficulty":
				console.log(event.value);
				break;
			case "toggle-music":
				value = event.el.data("value") === "on";
				if (value) {
					event.el.removeAttr("data-value");
				} else {
					event.el.data({ value: "on" });
				}
				break;
			case "toggle-soundFx":
				value = event.el.data("value") === "on";
				if (value) {
					event.el.removeAttr("data-value");
					Sound.setMute(true);
				} else {
					event.el.data({ value: "on" });
					Sound.setMute(false);
				}
				break;
			case "toggle-aim-assist":
				value = event.el.data("value") === "on";
				if (value) {
					event.el.removeAttr("data-value");
					Project.guideOn = false;
				} else {
					event.el.data({ value: "on" });
					Project.guideOn = true;
				}
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
				// unbind event handlers
				Self.els.doc.off("mousemove mouseup", Self.doRange);
				break;
		}
	}
}
