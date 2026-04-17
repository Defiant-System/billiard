
let Test = {
	init(APP) {

		// setTimeout(() => APP.spinSetter.dispatch({ type: "open-spin-setter" }), 500);
		
		// setTimeout(() => APP.dispatch({ type: "output-pgn" }), 500);
		setTimeout(() => APP.dispatch({ type: "restore-state" }), 500);

		// setTimeout(() => {
		// 	APP.game.dispatch({ type: "game-stop" });
		// }, 1000);

	}
};
