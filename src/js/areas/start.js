
// billiard.start

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			el: window.find(".start-view"),
			star: window.find(`.logo .star`),
		};
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.start,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-view":
				// twinkle star
				Self.dispatch({ type: "twinkle-star" });
				break;
			case "twinkle-star":
				let starIndex = (Math.random() * 8 | 0) + 1,
					timer = ((Math.random() * 15 | 0) * 100) + 800;
				setTimeout(() => {
					if (Self.els.content.data("show") !== "start") return;
					Self.els.star.cssSequence(`twinkle-${starIndex}`, "animationend", el => {
						// reset star element
						el.removeClass(`twinkle-${starIndex}`);
						// twinkle again
						Self.dispatch({ type: "twinkle-star" });
					});
				}, timer);
				break;
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
