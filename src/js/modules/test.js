
let TestState = {
	mode: 1,
    shotNum: 2,
    pottedBallArray: [6, 12, 15, 13],
    cueBallInHand: false,
    turn: "p2",
    p1TargetType: "SOLIDS",
    p2TargetType: "STRIPES",
    p1: [
        { id: "b1" },
        { id: "b2" },
        { id: "b3" },
        { id: "b4" },
        { id: "b5" },
        { id: "b6", state: "potted" },
        { id: "b7" }
    ],
    p2: [
        { id: "b9" },
        { id: "b10" },
        { id: "b11" },
        { id: "b12", state: "potted" },
        { id: "b13", state: "potted" },
        { id: "b14" },
        { id: "b15", state: "potted" }
    ],
    cue: {
        x: 392.735479,
        y: 67.974199
    },
    balls: [
        { x: 39273.5479, y: 6797.4199 },
        { x: 18364.2897, y: 26091.2899, targetType: "SOLIDS" },
        { x: 19983.6955, y: 13832.9609, targetType: "SOLIDS" },
        { x: 24539.3554, y: 20780.6278, targetType: "SOLIDS" },
        { x: 15044.1497, y: 19414.3481, targetType: "SOLIDS" },
        { x: 29967.1538, y: 3673.5693, targetType: "SOLIDS" },
        { x: -68124.2809, y: -34033.1264, targetType: "SOLIDS" },
        { x: 29637.2366, y: -7413.3544, targetType: "SOLIDS" },
        { x: 42782.5504, y: -2223.4473, targetType: "8 BALL" },
        { x: 39627.2423, y: -5993.9949, targetType: "STRIPES" },
        { x: 53724.4171, y: -28461.2471, targetType: "STRIPES" },
        { x: 53131.062, y: -19767.0209, targetType: "STRIPES" },
        { x: 70295.2821, y: 32818.9528, targetType: "STRIPES" },
        { x: -68422.9292, y: 33590.9773, targetType: "STRIPES" },
        { x: 51520.8057, y: 5451.8491, targetType: "STRIPES" },
        { x: 68920.5847, y: 33161.9828, targetType: "STRIPES" }
    ]
};

let Test = {
	init(APP) {

		// setTimeout(() => APP.spinSetter.dispatch({ type: "open-spin-setter" }), 500);
		
		// setTimeout(() => APP.dispatch({ type: "output-pgn" }), 500);
		setTimeout(() => APP.dispatch({ type: "restore-state", state: TestState }), 500);

		// setTimeout(() => {
		// 	APP.game.dispatch({ type: "game-stop" });
		// }, 1000);

	}
};
