

var diffY = 150;
var diffX = 0;
var playState = new Object();

playState.init = function () {
	
};

playState.create = function () {

	function resizeGame(scale, bounds) {
		//set to landscape mode
		gameInfo.landscape = true;
		//Project.game.scale.setGameSize(1024, 690);
		Project.game.scale.setGameSize(Project.width, Project.height);

		gameInfo.gameCanvas.x = Project.game.width / 2;
		gameInfo.gameCanvas.y = Project.game.height / 2 - 75;

		//rotate table
		gameInfo.gameCanvas.y += diffY;
		gameInfo.gameCanvas.x += diffX;
		gameInfo.gameCanvas.angle = 0;
	};

	this.gameInfo = new Object(); //gameInfo is a property of playState
	var gameInfo = this.gameInfo;

	initGameInfo();
	initCanvases();
	initTable();
	// initDebug(); //
	initBalls();
	initGuide();
	initCue();
	initContactListener();
	initPhysics();
	renderScreen();
	setTurn();

	resizeGame();

	gameInfo.gameRunning = true;

	function setTurn() {
		if (Project.lastBreaker == "none") {
			gameInfo.turn = Math.random() < 0.5 ? "p1" : "p2";
		} else {
			//this is a re-rack due to a foul, so switch turns
			gameInfo.turn = Project.lastBreaker == "p2" ? "p1" : "p2";
		}
	}

	function initGameInfo() {
		gameInfo.adjustmentScale = 2.3; //converts many variables throughout the code to account for a change in the original table size of 60000x30000 physics units or 600x300 pixels
		gameInfo.settingSpin = false;

		gameInfo.pointerStartL = new Point(-850, -200);
		gameInfo.pointerStartP = new Point(100, -450);
		gameInfo.pointerEndL = new Point(-850, -50);
		gameInfo.pointerEndP = new Point(-80, -450);
		gameInfo.pointerProgress = 0;

		gameInfo.numLevels = 6;
		gameInfo.ballRadius = gameInfo.adjustmentScale * 1000; //1.4 * 1000 * 1.7; //800
		gameInfo.physScale = 0.01; //physics values are 100 times bigger than screen values.  Helps increase precision without increasing number of decimal places
		gameInfo.friction = 1.5;
		gameInfo.gameOver = false;
		gameInfo.counter = 0;
		gameInfo.transferCounter = 0;
		gameInfo.bonusStarOn = false;
		gameInfo.starNumber = 2;
		gameInfo.timerStarted = false;
		gameInfo.ballPotted = false;
		gameInfo.ballsPotted = 0;
		gameInfo.fouled = false;
		gameInfo.multiplier = 1;
		gameInfo.frictionSpeedThreshold = 85;
		gameInfo.pocketRadius = 3000;
		gameInfo.minVelocity = 2;
		gameInfo.cushionRestitution = 0.6; //.56
		gameInfo.ballRestitution = 0.94; //.91
		gameInfo.maxPower = 5000;
		gameInfo.trial = false;
		gameInfo.overlap = false; // debugging
		gameInfo.cueBallInHand = true;
		gameInfo.preventAim = false;
		gameInfo.preventSetPower = false;
		gameInfo.preventUpdateCue = false;
		gameInfo.cueSet = false;
		gameInfo.shotRunning = false;
		gameInfo.settingPower = false;
		gameInfo.executeStrike = false;
		gameInfo.beginStrike = false;
		gameInfo.cueTweenComplete = false;
		gameInfo.firstTouch = false;
		gameInfo.tutStage = 0;
		gameInfo.shotComplete = false;
		gameInfo.rulingsApplied = false;
		gameInfo.shotNum = 0;
		gameInfo.scratched = false;
		gameInfo.trial = false;
		gameInfo.pottedBallArray = new Array();
		gameInfo.time = 0;
		gameInfo.scratchFoulShown = false;

		//added from bb5
		gameInfo.p1TargetType = "ANY";
		gameInfo.p2TargetType = "ANY";
		gameInfo.scratch = false;
		gameInfo.foulMessage = "";
		gameInfo.shotNum = 0; //increased when either play
		gameInfo.turnExtended = false;
		gameInfo.ballsPottedSameType = false;
		gameInfo.typesPotted = "";
		gameInfo.trial = false;
		gameInfo.initVars = false;
		gameInfo.shotReset = true;

		gameInfo.drawGuide = true;
		gameInfo.allowTransferPoints = false;
		gameInfo.placedInCenter = false;
		gameInfo.foulDisplayComplete = true;
		gameInfo.transfer1Complete = true;
		gameInfo.transfer2Complete = true;

		gameInfo.aimDirectionVector = new Vector2D(1, 0).normalize();
	}

	function resume() {
		playState.resumeGame();
	}

	function toggleSound() {
		if (Sound.slave == false) {
			Sound.setMute(false);
			gameInfo.muteButtonPU.setFrames(1, 0, 1, 0);
		} else {
			//Sound.on = false;
			Sound.setMute(true);
			gameInfo.muteButtonPU.setFrames(3, 2, 3, 2);
		}

		playState.resumeGame();
	}

	function gameToPopUpMenu() {
		if (gameInfo.foulWindow.visible != true && gameInfo.gameOver == false) {
			// window.famobi_analytics.trackScreen("SCREEN_PAUSE");

			gameInfo.gameRunning = false;
			gameInfo.popUpPanel.visible = true;

			gameInfo.quitButtonPU.input.enabled = true;
			gameInfo.replayButtonPU.input.enabled = true;
			gameInfo.playButtonPU.input.enabled = true;
			gameInfo.muteButtonPU.input.enabled = true;
		}
	}

	function gameToMenu() {
		//console.log("game to menu");

		var tween1 = Project.game.add
			.tween(gameInfo.guiCanvas)
			.to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		var tween3 = Project.game.add
			.tween(gameInfo.guiBaseCanvas)
			.to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		var tween2 = Project.game.add
			.tween(gameInfo.gameCanvas)
			.to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		tween2.onComplete.add(initMenu, this);

		function initMenu() {
			if (gameInfo.gameOver) {
				Project.game.state.start("mainMenu");
				return;
			}

			Project.game.state.start("mainMenu");
		}
	}

	function replayGame() {
		Project.lastBreaker = "none";

		if (gameInfo.gameOver) {
			Project.game.state.start("play");
			return;
		}

		Project.game.state.start("play");
	}

	function initCanvases() {
		gameInfo.bgCanvas = new Phaser.Group(Project.game, Project.game.stage, "bgCanvas");
		gameInfo.guiBaseCanvas = new Phaser.Group(
			Project.game,
			Project.game.stage,
			"guiBaseCanvas"
		);
		//creates game canvas and adds it to the stage
		gameInfo.gameCanvas = new Phaser.Group(Project.game, Project.game.stage, "gameCanvas");

		gameInfo.gameCanvas.x = Project.game.width / 2;
		gameInfo.gameCanvas.y = Project.game.height / 2 - 15;
		//gameInfo.gameCanvas.scale = new Point(1.4, 1.4);
		gameInfo.tableCanvas = new Phaser.Group(
			Project.game,
			gameInfo.gameCanvas,
			"tableCanvas"
		);
		gameInfo.tableCanvas.y += 2;
		gameInfo.ballCanvas = new Phaser.Group(
			Project.game,
			gameInfo.gameCanvas,
			"ballCanvas"
		);
		gameInfo.guiCanvas = new Phaser.Group(Project.game, Project.game.stage, "guiCanvas");
		gameInfo.cueBaseCanvas = new Phaser.Group(
			Project.game,
			gameInfo.gameCanvas,
			"cueCanvas"
		);
		gameInfo.cueCanvas = new Phaser.Group(
			Project.game,
			gameInfo.cueBaseCanvas,
			"cueCanvas"
		);

		gameInfo.guideCanvas = new Phaser.Group(
			Project.game,
			gameInfo.gameCanvas,
			"guideCanvas"
		);

		gameInfo.debugCanvas = new Phaser.Group(
			Project.game,
			gameInfo.gameCanvas,
			"debugCanvas"
		);
	}

	function initGuide() {
		//gameInfo.guide = gameInfo.guideCanvas.add.graphics();
		gameInfo.guide = new Phaser.Graphics(Project.game);
		gameInfo.guideCanvas.addChild(gameInfo.guide);
	}

	function initDebug() {
		var graphics = new Phaser.Graphics(Project.game, 0, 0);
        gameInfo.debugCanvas.addChild(graphics);

		//for each line, store the direction vector, normal vector and projection (p3 and p4) of line by distance r (see notes)
		for (var n = 0; n < gameInfo.lineArray.length; n++) {
			//debug drawings
			var line = gameInfo.lineArray[n];

			graphics.lineStyle(3, 0xff0000, 1);
			graphics.moveTo(line.p1.x * gameInfo.physScale, line.p1.y * gameInfo.physScale);
			graphics.lineTo(line.p2.x * gameInfo.physScale, line.p2.y * gameInfo.physScale);

			// graphics.lineStyle(2, 0xffff00, 1);
			// graphics.moveTo(line.p3.x * gameInfo.physScale, line.p3.y * gameInfo.physScale);
			// graphics.lineTo(line.p4.x * gameInfo.physScale, line.p4.y * gameInfo.physScale);
		}

		// pockets
		// graphics.beginFill(0xFFFFFF, .5);
		for(var n = 0; n < gameInfo.pocketArray.length; n ++) {
			var pocket = gameInfo.pocketArray[n];
			graphics.drawCircle(pocket.position.x * gameInfo.physScale, pocket.position.y * gameInfo.physScale, gameInfo.pocketRadius * 2 * gameInfo.physScale);
		}

		// set a fill and line style
		graphics.beginFill(0xFFFFFF, .5);
		for(var n = 0; n < gameInfo.vertexArray.length; n ++) {
			var vertex = gameInfo.vertexArray[n];
			// graphics.drawCircle(vertex.position.x * gameInfo.physScale, vertex.position.y * gameInfo.physScale, gameInfo.ballRadius * 2 * gameInfo.physScale);
		}
		
	}

	function initTable() {
		//create table sprites
		gameInfo.pockets = new Phaser.Sprite(Project.game, 0, 0, "pockets");
		gameInfo.pockets.anchor = new Phaser.Point(0.5, 0.5);
		gameInfo.tableCanvas.add(gameInfo.pockets);

		gameInfo.tunnelCanvas = new Phaser.Group(
			Project.game,
			gameInfo.tableCanvas,
			"tunnels"
		); //balls are switched to this canvas after being potted

		gameInfo.cloth = new Phaser.Sprite(Project.game, 0, 0, "cloth");
		gameInfo.cloth.anchor = new Phaser.Point(0.5, 0.5);
		gameInfo.tableCanvas.add(gameInfo.cloth);

		gameInfo.shadowCanvas = new Phaser.Group(
			Project.game,
			gameInfo.tableCanvas,
			"shadows"
		); //balls are switched to this canvas after being potted

		gameInfo.tableTop = new Phaser.Sprite(Project.game, 0, 0, "tableTop");
		// gameInfo.tableTop.alpha = .5;
		gameInfo.tableTop.anchor = new Phaser.Point(0.5, 0.5);
		gameInfo.tableCanvas.add(gameInfo.tableTop);

		//create table physics
		//note, a line going from left to right will detect collisions from below, so make sure lines are drawn in the right direction.  Draw all lines clockwise around the table
		//table playing area is 600 x 300 pixels.  Physics values are x100, so table area in physics is 60,000 x 30,000.

		var tableScale = gameInfo.adjustmentScale * 600; //allows conversion from inches (assuming a 100" by 50" playing surface, standard for a 9' table) to physics values (60,000 x 30,000)
		// ^ additional multiple of 1.4 applied after we scaled up the table in flash by multiplying dimensions of all layers by 1.4

		var line;
		var vertex;
		var pocket;

		gameInfo.pocketArray = new Array();
		gameInfo.vertexArray = new Array();
		gameInfo.lineArray = new Array();

		//    \                  /  \                  /
		//     \                /    \                /
		//   0  \--------------/   1  \--------------/
		// \                                            2  /
		//  \                                             /
		//   \                                           /
		//   |                                           |
		//   |                                           |
		//   |                                           |
		//   /                                           \
		//  /                                             \
		// /  5                                         3  \
		//      /--------------\   4  /--------------\
		//     /                \    /                \
		//    /                  \  /                  \

		gameInfo.pocketArray.push({
			id: 0,
			position: new Vector2D(
				-50.25 * tableScale - gameInfo.pocketRadius / 2,
				-25.25 * tableScale - gameInfo.pocketRadius / 4
			),
			dropPosition: new Vector2D(
				-51 * tableScale - gameInfo.pocketRadius / 2,
				-26 * tableScale - gameInfo.pocketRadius / 4
			),
			starPosition: new Vector2D(
				-50.4 * tableScale - gameInfo.pocketRadius / 2,
				-25.8 * tableScale - gameInfo.pocketRadius / 4
			)
		});

		gameInfo.pocketArray.push({
			id: 1,
			position: new Vector2D(
				0 * tableScale,
				-24.5 * tableScale - gameInfo.pocketRadius
			),
			dropPosition: new Vector2D(
				0 * tableScale,
				-25.5 * tableScale - gameInfo.pocketRadius
			),
			starPosition: new Vector2D(
				-0.2 * tableScale,
				-25.5 * tableScale - gameInfo.pocketRadius
			)
		});

		gameInfo.pocketArray.push({
			id: 2,
			position: new Vector2D(
				50.25 * tableScale + gameInfo.pocketRadius / 2,
				-25.25 * tableScale - gameInfo.pocketRadius / 4
			),
			dropPosition: new Vector2D(
				51 * tableScale + gameInfo.pocketRadius / 2,
				-26 * tableScale - gameInfo.pocketRadius / 4
			),
			starPosition: new Vector2D(
				50 * tableScale + gameInfo.pocketRadius / 2,
				-26 * tableScale - gameInfo.pocketRadius / 4
			)
		});

		gameInfo.pocketArray.push({
			id: 3,
			position: new Vector2D(
				-50.25 * tableScale - gameInfo.pocketRadius / 2,
				25.25 * tableScale + gameInfo.pocketRadius / 4
			),
			dropPosition: new Vector2D(
				-51 * tableScale - gameInfo.pocketRadius / 2,
				26 * tableScale + gameInfo.pocketRadius / 4
			),
			starPosition: new Vector2D(
				-50.3 * tableScale - gameInfo.pocketRadius / 2,
				25.5 * tableScale + gameInfo.pocketRadius / 4
			)
		});

		gameInfo.pocketArray.push({
			id: 4,
			position: new Vector2D(
				0 * tableScale,
				24.5 * tableScale + gameInfo.pocketRadius
			),
			dropPosition: new Vector2D(
				0 * tableScale,
				25.5 * tableScale + gameInfo.pocketRadius
			),
			starPosition: new Vector2D(
				-0.2 * tableScale,
				25.3 * tableScale + gameInfo.pocketRadius
			)
		});

		gameInfo.pocketArray.push({
			id: 5,
			position: new Vector2D(
				50.25 * tableScale + gameInfo.pocketRadius / 2,
				25.25 * tableScale + gameInfo.pocketRadius / 4
			),
			dropPosition: new Vector2D(
				51 * tableScale + gameInfo.pocketRadius / 2,
				26 * tableScale + gameInfo.pocketRadius / 4
			),
			starPosition: new Vector2D(
				50 * tableScale + gameInfo.pocketRadius / 2,
				27 * tableScale - gameInfo.pocketRadius / 4
			)
		});


		//start at top left adding vertices and lines - see diagram

		//    A                  D  E                  H
		//     \                /    \                /
		//      B--------------C      F--------------G
		// X                                               I
		//  \                                             /
		//   W                                           J
		//   |                                           |
		//   |                                           |
		//   |                                           |
		//   V                                           K
		//  /                                             \
		// U                                               L
		//      S--------------R      O--------------N
		//     /                \    /                \
		//    T                  Q  P                  M

		var mouth = 4;
		var throat = 2;

		//line AB
		line = new Object();
		line.name = "AB";
		line.p1 = new Vector2D(-50.5 * tableScale, -(25.5 + mouth) * tableScale);
		line.p2 = new Vector2D(-(49.5 - mouth) * tableScale, -25.15 * tableScale);
		gameInfo.lineArray.push(line);

		//vertexB
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "B";
		gameInfo.vertexArray.push(vertex);

		//line BC
		line = new Object();
		line.name = "BC";
		line.p1 = new Vector2D(-(49.5 - mouth) * tableScale, -25.15 * tableScale);
		line.p2 = new Vector2D(-5.15 * tableScale, -25.15 * tableScale);
		gameInfo.lineArray.push(line);

		//vertex C
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "C";
		gameInfo.vertexArray.push(vertex);

		//line CD
		line = new Object();
		line.name = "CD";
		line.p1 = new Vector2D(-5.15 * tableScale, -25.15 * tableScale);
		line.p2 = new Vector2D(-3.25 * tableScale, -(23.75 + mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//line EF
		line = new Object();
		line.name = "EF";
		line.p1 = new Vector2D(3.25 * tableScale, -(23.75 + mouth) * tableScale);
		line.p2 = new Vector2D(5.15 * tableScale, -25.15 * tableScale);
		gameInfo.lineArray.push(line);

		//vertex F
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "F";
		gameInfo.vertexArray.push(vertex);

		//line FG
		line = new Object();
		line.name = "FG";
		line.p1 = new Vector2D(5.15 * tableScale, -25.15 * tableScale);
		line.p2 = new Vector2D((49.5 - mouth) * tableScale, -25.15 * tableScale);
		gameInfo.lineArray.push(line);

		//vertex G
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "G";
		gameInfo.vertexArray.push(vertex);

		//line GH
		line = new Object();
		line.name = "GH";
		line.p1 = new Vector2D((49.5 - mouth) * tableScale, -25.15 * tableScale);
		line.p2 = new Vector2D(50.5 * tableScale, -(25.5 + mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//line IJ
		line = new Object();
		line.name = "IJ";
		line.p1 = new Vector2D((50.25 + mouth) * tableScale, -24.5 * tableScale);
		line.p2 = new Vector2D(50.25 * tableScale, -(24.5 - mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//vertex J
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "J";
		gameInfo.vertexArray.push(vertex);

		//line JK
		line = new Object();
		line.name = "JK";
		line.p1 = new Vector2D(50.25 * tableScale, -(24.5 - mouth) * tableScale);
		line.p2 = new Vector2D(50.25 * tableScale, (24.5 - mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//vertex K
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "K";
		gameInfo.vertexArray.push(vertex);

		//line KL
		line = new Object();
		line.name = "KL";
		line.p1 = new Vector2D(50.25 * tableScale, (24.5 - mouth) * tableScale);
		line.p2 = new Vector2D((50.25 + mouth) * tableScale, 24.5 * tableScale);
		gameInfo.lineArray.push(line);

		//line MN
		line = new Object();
		line.name = "MN";
		line.p1 = new Vector2D(49.25 * tableScale, (24.5 + mouth) * tableScale);
		line.p2 = new Vector2D((49.25 - mouth) * tableScale, 24.5 * tableScale);
		gameInfo.lineArray.push(line);

		//vertex N
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "N";
		gameInfo.vertexArray.push(vertex);

		//line NO
		line = new Object();
		line.name = "NO";
		line.p1 = new Vector2D((49.25 - mouth) * tableScale, 24.5 * tableScale);
		line.p2 = new Vector2D(5.15 * tableScale, 24.5 * tableScale);
		gameInfo.lineArray.push(line);

		//vertex O
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "O";
		gameInfo.vertexArray.push(vertex);

		//line OP
		line = new Object();
		line.name = "OP";
		line.p1 = new Vector2D(5.15 * tableScale, 24.5 * tableScale);
		line.p2 = new Vector2D(2.5 * tableScale, (24.5 + mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//line QR
		line = new Object();
		line.name = "QR";
		line.p1 = new Vector2D(-2.5 * tableScale, (24.5 + mouth) * tableScale);
		line.p2 = new Vector2D(-5.15 * tableScale, 24.5 * tableScale);
		gameInfo.lineArray.push(line);

		//vertex R
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "R";
		gameInfo.vertexArray.push(vertex);

		//line RS
		line = new Object();
		line.name = "RS";
		line.p1 = new Vector2D(-5.15 * tableScale, 24.5 * tableScale);
		line.p2 = new Vector2D(-(49.25 - mouth) * tableScale, 24.5 * tableScale);
		gameInfo.lineArray.push(line);

		//vertex S
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "S";
		gameInfo.vertexArray.push(vertex);

		//line ST
		line = new Object();
		line.name = "ST";
		line.p1 = new Vector2D(-(49.25 - mouth) * tableScale, 24.5 * tableScale);
		line.p2 = new Vector2D(-49.25 * tableScale, (24.5 + mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//line UV
		line = new Object();
		line.name = "UV";
		line.p1 = new Vector2D(-(50.5 + mouth) * tableScale, 24.5 * tableScale);
		line.p2 = new Vector2D(-50.5 * tableScale, (24.5 - mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//vertex V
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "V";
		gameInfo.vertexArray.push(vertex);

		//line VW
		line = new Object();
		line.name = "VW";
		line.p1 = new Vector2D(-50.5 * tableScale, (24.5 - mouth) * tableScale);
		line.p2 = new Vector2D(-50.5 * tableScale, -(24.5 - mouth) * tableScale);
		gameInfo.lineArray.push(line);

		//vertex W
		vertex = new Object();
		vertex.position = new Vector2D(line.p2.x, line.p2.y);
		vertex.name = "W";
		gameInfo.vertexArray.push(vertex);

		//line WX
		line = new Object();
		line.name = "WX";
		line.p1 = new Vector2D(-50.5 * tableScale, -(24.5 - mouth) * tableScale);
		line.p2 = new Vector2D(-(50.25 + mouth) * tableScale, -24.5 * tableScale);
		gameInfo.lineArray.push(line);

		var graphics = Project.game.add.graphics(
			gameInfo.gameCanvas.x,
			gameInfo.gameCanvas.y
		);

		//for each line, store the direction vector, normal vector and projection (p3 and p4) of line by distance r (see notes)
		for (var n = 0; n < gameInfo.lineArray.length; n++) {
			var line = gameInfo.lineArray[n];

			//unit direction vector of line
			line.direction = new Vector2D(
				line.p2.x - line.p1.x,
				line.p2.y - line.p1.y
			).normalize();
			//unit normal vector of line (right handed/clockwise)
			line.normal = line.direction.getLeftNormal();
			var extendedNormal = line.normal.times(gameInfo.ballRadius);
			line.p3 = line.p1.plus(extendedNormal);
			line.p4 = line.p2.plus(extendedNormal);

			var extendedNormal2 = line.normal.times(gameInfo.ballRadius * 0.8);
			line.p5 = line.p1.plus(extendedNormal2);
			line.p6 = line.p2.plus(extendedNormal2);
		}
	}

	function initBalls() {
		//create balls
		gameInfo.ballArray = new Array();
		var ballPositionArray = setBallPositions(gameInfo);
		gameInfo.numBalls = ballPositionArray.length;

		for (var n = 0; n < gameInfo.numBalls; n++) {
			var ball = new Object();

			//shadow
			ball.shadow = new Phaser.Sprite(Project.game, 0, 0, "shadow");
			gameInfo.shadowCanvas.add(ball.shadow);
			ball.shadow.anchor = new Point(0.5, 0.5);
			ball.shadow.width = gameInfo.ballRadius * gameInfo.physScale * 4;
			ball.shadow.height = gameInfo.ballRadius * gameInfo.physScale * 4;
			// ball.shadow.alpha = 0.9;

			//ball mc
			var s;
			switch (n) {
				case 0: s = 0;   break;
				case 1: s = 12;  break;
				case 2: s = 13;  break;
				case 3: s = 8;   break;
				case 4: s = 14;  break;
				case 5: s = 3;   break;
				case 6: s = 11;  break;
				case 7: s = 4;   break;
				case 8: s = 15;  break;
				case 9: s = 5;   break;
				case 10: s = 1;  break;
				case 11: s = 6;  break;
				case 12: s = 10; break;
				case 13: s = 7;  break;
				case 14: s = 9;  break;
				case 15: s = 2;  break;
			}
			ball.mc = new Ball(gameInfo.ballRadius * gameInfo.physScale, n);
			gameInfo.ballCanvas.add(ball.mc);

			if (n == 0) {
				ball.mover = new Phaser.Sprite(Project.game, 0, 0, "mover");
				gameInfo.ballCanvas.add(ball.mover);
				ball.mover.anchor = new Point(0.5, 0.5);
				ball.mover.inputEnabled = true;
				ball.mover.visible = false;
			}

			//ball properties
			if (n < 8 && n != 0) {
				ball.targetType = "SOLIDS";
			}
			if (n > 8) {
				ball.targetType = "STRIPES";
			}
			if (n == 8) {
				ball.targetType = "8 BALL";
			}

			ball.position = new Vector2D(
				ballPositionArray[n].x,
				ballPositionArray[n].y
			);
			ball.velocity = new Vector2D(0, 0);
			ball.lastCollisionObject = null;
			ball.id = n;
			ball.active = true;
			ball.firstContact = false;
			ball.contactArray = new Array();
			if (n == 0) {
				ball.screw = 0; //amount of scew applied to cue ball when it is struck - will take value between -1 (topspin) and 1 (backspin)
				ball.english = 0; //will take value between -1 (left side spin) and 1 (right side spin)
				ball.deltaScrew = new Vector2D(0, 0); //velocity applied to the cue ball each frame after contact due to screw - will take a vector which will decay to 0.
			}
			ball.grip = 1; //value between 0 and 1. 0: ball slides without rolling.  1: ball rolls without sliding
			ball.ySpin = 0;
			//grip and spin have no consequence on physics.  They only have graphical effects on rotation
			ball.pocketTweenComplete = true;
			ball.propelling = false;

			gameInfo.ballArray.push(ball);
		}
	}

	function initCue() {
		gameInfo.cue = new Phaser.Sprite(Project.game, 0, 0, "cue");
		gameInfo.cueCanvas.addChild(gameInfo.cue);
		gameInfo.cue.anchor = new Point(1, 0.5);
	}

	function initContactListener() {
		playState.contactEvent = new Phaser.Signal();
		playState.contactEvent.add(onContact, playState);
	}

	function initPhysics() {
		gameInfo.phys = new billiardPhysics(
			playState.contactEvent,
			gameInfo.ballArray,
			gameInfo.lineArray,
			gameInfo.vertexArray,
			gameInfo.pocketArray,
			0
		);
		gameInfo.phys.friction = gameInfo.friction;
		gameInfo.phys.ballRadius = gameInfo.ballRadius;
		gameInfo.phys.pocketRadius = gameInfo.pocketRadius;
		gameInfo.phys.physScale = gameInfo.physScale;
		gameInfo.phys.minVelocity = gameInfo.minVelocity;
		gameInfo.phys.cushionRestitution = gameInfo.cushionRestitution;
		gameInfo.phys.ballRestitution = gameInfo.ballRestitution;
	}
};

playState.resumeGame = function () {
	var gameInfo = this.gameInfo;
	if (gameInfo.gameOver != true) {
		gameInfo.gameRunning = true;
	}
};

playState.shutdown = function () {
	var gameInfo = this.gameInfo;
	gameInfo.gameCanvas.destroy();
	gameInfo.guiCanvas.destroy();
	gameInfo.debugCanvas.destroy();
	gameInfo.guiBaseCanvas.destroy();
	gameInfo.cueBaseCanvas.destroy();
};

