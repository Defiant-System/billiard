
let DEBUG;

let TestState = {
    "mode": 1,
    "p1": [
        { "id": "b8", "state": "" },
        { "id": "b10", "state": "appear potted" },
        { "id": "b11", "state": "disappear potted" },
        { "id": "b12", "state": "disappear potted" },
        { "id": "b13", "state": "disappear potted" },
        { "id": "b14", "state": "disappear potted" },
        { "id": "b15", "state": "disappear potted" }
    ],
    "p2": [
        { "id": "b1", "state": "" },
        { "id": "b2", "state": "disappear potted" },
        { "id": "b3", "state": "" },
        { "id": "b4", "state": "" },
        { "id": "b5", "state": "" },
        { "id": "b6", "state": "disappear potted" },
        { "id": "b7", "state": "disappear potted" }
    ],
    "cue": {
        "x": 221.596279,
        "y": -149.480242
    },
    "balls": [
        { "x": -10671.565, "y": -9165.3437, "targetType": "SOLIDS" },
        { "x": -39710.2925, "y": 19234.3956, "targetType": "SOLIDS" },
        { "x": -38165.2732, "y": -3442.4365, "targetType": "SOLIDS" },
        { "x": -20676.5707, "y": 7056.9468, "targetType": "SOLIDS" },
        { "x": -17905.4418, "y": 13390.4472, "targetType": "SOLIDS" },
        { "x": -40165.6303, "y": -18471.0543, "targetType": "SOLIDS" },
        { "x": 34194.8033, "y": 18658.1814, "targetType": "SOLIDS" },
        { "x": 9291.4488, "y": -6541.6433, "targetType": "8 BALL" },
        { "x": 34036.4348, "y": -19059.2901, "targetType": "STRIPES" },
        { "x": 35441.4295, "y": -17658.7496, "targetType": "STRIPES" },
        { "x": 34677.476, "y": -18058.5505, "targetType": "STRIPES" },
        { "x": -3108.6012, "y": -18387.3082, "targetType": "STRIPES" },
        { "x": 34635.8591, "y": -18094.4205, "targetType": "STRIPES" },
        { "x": 34132.1659, "y": -18788.535, "targetType": "STRIPES" },
        { "x": 34142.0471, "y": 18766.2649, "targetType": "STRIPES" }
    ],
    "opponent": "Ali",
    "pottedBallArray": [10, 9, 14, 7, 15, 2, 6, 12, 13, 11],
    "cueBallInHand": false,
    "shotNum": 7,
    "p1TargetType": "STRIPES",
    "p2TargetType": "SOLIDS",
    "turn": "p1"
};

let Test = {
	init(APP) {
		return;

		// DEBUG = true;
		
		// return setTimeout(() => APP.dispatch({ type: "restore-game" }), 700);
		
		// return setTimeout(() => APP.settings.dispatch({ type: "show-settings" }), 700);
		
		// return setTimeout(() => APP.els.content.find(".opponents .player").get(2).trigger("click"), 500);
		// return setTimeout(() => APP.dispatch({ type: "switch-view", arg: "game" }), 500);

		/*
		*/
		return setTimeout(() => {
		    APP.game.dispatch({
		        type: "start-game",
		        name: "Yasmin",
		        level: 15,
		        arg: 1,
		    });

		    setTimeout(() => APP.game.els.el.find(`.menu[data-click="show-settings"]`).trigger("click"), 2200);
		    // setTimeout(() => console.log(APP.settings.els.el), 3200);
		    // setTimeout(() => APP.settings.dispatch({ type: "show-settings" }), 2200);
			// setTimeout(() => APP.game.dispatch({ type: "game-pause" }), 500);

		    // setTimeout(() => APP.game.dispatch({
		    //     type: "show-foul-message",
		    //     message: "Player 1 potted cue ball",
		    // }), 1500);

			return;
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 1 }), 900);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 2 }), 1200);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 3 }), 3000);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 4 }), 4500);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 5 }), 6000);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 6 }), 7500);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 7 }), 9000);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 8 }), 10500);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 9 }), 12000);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 10 }), 13500);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 11 }), 15000);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 12 }), 16500);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 13 }), 18000);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 14 }), 19500);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 15 }), 21000);
			setTimeout(() => APP.game.dispatch({ type: "put-ball-in-tray", num: 0 }), 22500);
		}, 1300);
		
		// setTimeout(() => APP.els.content.find(`.button[data-click="open-help"]`).trigger("click"), 500);
		// setTimeout(() => APP.spinSetter.dispatch({ type: "open-spin-setter" }), 500);
		
		// setTimeout(() => APP.dispatch({ type: "output-pgn" }), 500);
		// setTimeout(() => APP.game.dispatch({ type: "game-pause" }), 4500);
		// setTimeout(() => console.log( Project.game.state ), 1500);
		// setTimeout(() => APP.game.dispatch({ type: "restore-state", state: TestState }), 500);
		// setTimeout(() => APP.game.dispatch({ type: "start-player-timer" }), 800);

		// setTimeout(() => {
		// 	APP.game.dispatch({ type: "game-stop" });
		// }, 1000);

	}
};
