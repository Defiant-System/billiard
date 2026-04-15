
// billiard.spinSetter

{
	init() {
		// fast references
		this.els = {
			doc: $(document),
			el: window.find(".spin-setter.big"),
			dot: window.find(".spin-setter.big .dot"),
		};
		// bind event handler
		this.els.el.on("mousedown", this.dispatch);
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.spinSetter,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "mousedown":
				let offset = {
						y: +Self.els.dot.cssProp("--sY"),
						x: +Self.els.dot.cssProp("--sX"),
					},
					click = {
						y: event.clientY - offset.y,
						x: event.clientX - offset.x,
					},
					maxDist = 80 * 80;
				// drag info
				Self.drag = { click, maxDist };
				// bind event handlers
				Self.els.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				value = {
					y: event.clientY - Self.drag.click.y,
					x: event.clientX - Self.drag.click.x,
				};
				let distSq = value.x * value.x + value.y * value.y;
				if (distSq > Self.drag.maxDist) {
					var ang = Math.atan2(
						value.y,
						value.x
					);
					value.x = 80 * Math.cos(ang);
					value.y = 80 * Math.sin(ang);
				}

				Self.els.dot.css({
					"--sY": value.y,
					"--sX": value.x,
				});
				break;
			case "mouseup":
				let gameInfo = Project.game.state.states.play.gameInfo,
					sY = +Self.els.dot.cssProp("--sY"),
					sX = +Self.els.dot.cssProp("--sX");

				// update hud
				APP.game.els.hud.find(".spin-setter .dot").css({
					"--sY": (sY / 80) * 31,
					"--sX": (sX / 80) * 31,
				});

				//value between -0.5 (topspin) and 0.5 (backspin)
				gameInfo.ballArray[0].screw = Maths.fixNumber((0.5 * sY) / 95);
				//value between -1 (left side) and 1 (right side)
				gameInfo.ballArray[0].english = Maths.fixNumber(sX / 95);
				gameInfo.cue.y =
					0.8 *
					gameInfo.ballArray[0].english *
					gameInfo.ballRadius *
					gameInfo.physScale;

				// unbind event handlers
				Self.els.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "open-spin-setter":
				APP.game.els.el.addClass("show-spin-setter");
				break;
			case "close-spin-setter":
				if (!$(event.target).hasClass("game-view")) return;
				APP.game.els.el.removeClass("show-spin-setter");
				break;
		}
	}
}
