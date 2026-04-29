
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
			case "show-start":
				APP.dispatch({ type: "switch-view", arg: "start" });
				break;
			case "play-again":
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
