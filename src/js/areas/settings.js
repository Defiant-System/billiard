
// billiard.settings

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".settings-view"),
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
		}
	}
}
