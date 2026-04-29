
// billiard.settings

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".settings-view"),
		};
		// default settings
		this.defaultSettings = {
			audio: "off",
			guide: "on",
		};
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
		}
	}
}
