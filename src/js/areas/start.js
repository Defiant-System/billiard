
// billiard.start

{
	init() {
		// fast references
		this.els = {
			el: window.find(".start-view"),
		};
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.start,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "select-opponent":
				APP.els.content.data({ show: "game" });
				APP.game.dispatch({ type: "start-game" });
				break;
		}
	}
}
