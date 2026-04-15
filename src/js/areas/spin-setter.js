
// billiard.spinSetter

{
	init() {
		// fast references
		this.els = {
			el: window.find(".spin-setter.big"),
		};
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.spinSetter,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "open-spin-setter":
				APP.game.els.el.addClass("show-spin-setter");
				break;
			case "close-spin-setter":
				APP.game.els.el.removeClass("show-spin-setter");
				break;
		}
	}
}
