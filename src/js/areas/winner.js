
// billiard.winner

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".winner-view"),
		};
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.winner,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-view":
				break;
		}
	}
}
