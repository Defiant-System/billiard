
// billiard.loser

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".loser-view"),
		};
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.loser,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-view":
				break;
			case "show-start":
				APP.els.content.data({ show: "start" });
				break;
		}
	}
}
