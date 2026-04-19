
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
				APP.game.dispatch({ type: "start-game" });
				break;
		}
	}
}
