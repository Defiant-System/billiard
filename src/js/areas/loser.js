
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
			case "try-again":
				APP.game.dispatch({
					type: "start-game",
					name: Self.els.content.find(`.player.right .name`).data("name"),
					level: Project.aiRating,
					arg: Project.mode,
				});
				break;
		}
	}
}
