
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
				
				el = $(event.target);
				APP.game.dispatch({
					type: "start-game",
					name: el.find(".photo").data("name"),
					level: +el.find(".photo").data("level"),
				});
				break;
		}
	}
}
