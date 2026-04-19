
/*
 * Remove first break flag
 * Hide potted balls
 * 
 */

playState.getState = function() {
	let gameInfo = this.gameInfo,
		mode = Project.mode,
		turn = gameInfo.turn,
		pottedBallArray = gameInfo.pottedBallArray,
		cueBallInHand = gameInfo.cueBallInHand,
		shotNum = gameInfo.shotNum,
		p1TargetType = gameInfo.p1TargetType,
		p2TargetType = gameInfo.p2TargetType,
		p1 = [],
		p2 = [],
		balls = [];
	// console.log(gameInfo);

	Project.APP.game.els.hud.find(`.player.left .ball-slots li`).map(elem => {
		let el = $(elem),
			id = el.data("id"),
			state = el.prop("className");
		p1.push({ id, state });
	});

	Project.APP.game.els.hud.find(`.player.right .ball-slots li`).map(elem => {
		let el = $(elem),
			id = el.data("id"),
			state = el.prop("className");
		p2.push({ id, state });
	});

	gameInfo.ballArray.map(ball => {
		let { x, y } = ball.position,
			targetType = ball.targetType;
		// console.log(ball);
		balls.push({ x, y, targetType });
	});
	let cue = {
		x: gameInfo.cueCanvas.position.x,
		y: gameInfo.cueCanvas.position.y,
	}

	return { mode, p1, p2, cue, balls, pottedBallArray, cueBallInHand, shotNum, p1TargetType, p2TargetType, turn };
}

playState.setState = function(state) {
	var gameInfo = this.gameInfo,
		{ p1, p2, cue, balls } = state,
		p1Slots = Project.APP.game.els.hud.find(`.player.left .ball-slots li`),
		p2Slots = Project.APP.game.els.hud.find(`.player.right .ball-slots li`);

	// reset hud ball slots
	Project.APP.game.els.hud.find(`.ball-slots li`).removeAttr("data-id").removeClass("potted");
	p1.map((b, index) => p1Slots.get(index).data({ id: b.id }).addClass(b.state || ""));
	p2.map((b, index) => p2Slots.get(index).data({ id: b.id }).addClass(b.state || ""));

	balls.map((ball, index) => {
		let nBall = gameInfo.ballArray[index];
		if (state.pottedBallArray.includes(index)) {
			gameInfo.shadowCanvas.add(nBall.shadow);
			nBall.mc.visible = false;
			nBall.shadow.visible = false;
			nBall.active = false;
			// nBall.shadow = null;
		}
		nBall.targetType = ball.targetType;
		nBall.position.x = ball.x;
		nBall.position.y = ball.y;
	});

	gameInfo.cueCanvas.position.x = cue.x;
	gameInfo.cueCanvas.position.y = cue.y;

	gameInfo.p1TargetType = state.p1TargetType;
	gameInfo.p2TargetType = state.p2TargetType;
	gameInfo.ballsPotted = state.pottedBallArray.length > 0;
	gameInfo.pottedBallArray = state.pottedBallArray;
	gameInfo.cueBallInHand = state.cueBallInHand;
	gameInfo.shotNum = state.shotNum;
	gameInfo.turn = state.turn;

	Project.mode = state.mode;

	gameInfo.phys.updatePhysics();
	renderScreen();

	console.log( gameInfo );
}

playState.update = function () {
	var gameInfo = this.gameInfo;
	var turn = gameInfo.turn;
	var preventQuit;
	var gameRunning;

	if (gameInfo.gameRunning == true) {
		//console.log("shot reset: " + gameInfo.shotReset);

		if (gameInfo.shotRunning == false && gameInfo.shotReset == true) {
			//pre-shot functions

			if (gameInfo.initVars == false) {
				resetVars();
				gameInfo.initVars = true;
			}

			if (gameInfo.turn == "p1" || Project.mode == 2) {
				// real players only
				updateCursor();
				placeCueBall();
				// setSpin();
				aim();
				setPower();
				beginStrike();
			}

			if (gameInfo.turn == "p2" && Project.mode == 1) {
				//ai only
				aiPlaceCueBall();
				aiFindCalculatedShots();
				aiTestShot();
				aiPlayBreakShot();
			}

			//ai and p1/p2
			updateCue();
		}

		if (gameInfo.shotRunning == true) {
			checkShotOver();
			applyRulings(); // leads onto setNextTargetType, checkWhosTurn and resetVars

			gameInfo.phys.updatePhysics();
			renderScreen();
		}

		if (Project.levelComplete == false) {
			if (Project.mode == 1 && gameInfo.turn == "p1") {
				// updateTimer();
			}
		}

		checkGameOver();
	}

	function updateCursor() {
		//utility function for finding the cursor position relative to the gameInfo.gameCanvas
		var cursorGlobal = Project.game.input.activePointer;
		gameInfo.cursorLocal = new Point(
			cursorGlobal.x - gameInfo.gameCanvas.x,
			cursorGlobal.y - gameInfo.gameCanvas.y
		);

		if (!gameInfo.landscape) {
			gameInfo.cursorLocal = new Point(
				-gameInfo.cursorLocal.y,
				gameInfo.cursorLocal.x
			);
		}
	}

	function updateCue() {
		if (
			gameInfo.cueSet == false &&
			gameInfo.preventUpdateCue == false &&
			gameInfo.trial == false
		) {
			//console.log("updating cue");
			gameInfo.cueSet = true;
			gameInfo.cueCanvas.visible = true;
			//console.log(gameInfo.ballArray);
			gameInfo.cueCanvas.x = gameInfo.ballArray[0].position.x * gameInfo.physScale;
			gameInfo.cueCanvas.y = gameInfo.ballArray[0].position.y * gameInfo.physScale;
			gameInfo.cue.x = -gameInfo.ballRadius * gameInfo.physScale * 1.5;
			// gameInfo.cueShadow.x = gameInfo.cue.x;
		}
	}

	function placeCueBall() {
		if (
			gameInfo.cueBallInHand == true &&
			gameInfo.shotRunning == false &&
			gameInfo.settingPower == false
		) {
			var cueBall = gameInfo.ballArray[0];
			cueBall.mover.visible = true;

			//if not break off shot, cue ball may have been been potted and hidden, so make visible and place in centre
			if (gameInfo.shotNum > 0 && gameInfo.placedInCenter == false) {
				gameInfo.placedInCenter = true;
				cueBall.mc.visible = true;
				cueBall.shadow.visible = true;
				cueBall.position.x = 0;
				cueBall.position.y = 0;
				//console.log("cue ball at: " + gameInfo.ballArray[0].x);
				cueBall.mc.x = 0;
				cueBall.mc.y = 0;
				cueBall.active = true;

				//now check the space is unoccupied, and move backwards if necessary until a free space is found
				var success = false;
				var i = 0;
				do {
					i++;
					if (
						checkPositionOverlapping(cueBall.position.x, cueBall.position.y) ==
						false
					) {
						success = true;
					} else {
						cueBall.x -= gameInfo.ballRadius;
					}
				} while (i < 500 && success == false);

				renderScreen();
			}

			//console.log(cueBall.events);

			cueBall.mover.events.onInputDown.add(mouseDown, this);
			cueBall.mover.events.onInputUp.add(mouseUp, this);
			cueBall.mover.events.onInputOver.add(mouseOver, this);
			cueBall.mover.events.onInputOut.add(mouseOut, this);

			function mouseDown() {
				gameInfo.moverMouseDown = true;
			}

			function mouseUp() {
				gameInfo.moverMouseDown = false;
			}

			function mouseOver() {
				gameInfo.moverMouseOver = true;
			}

			function mouseOut() {
				gameInfo.moverMouseOver = false;
			}

			if (gameInfo.moverMouseOver == true) {
				gameInfo.placeFirstTimeMouseUp = true;
				gameInfo.cueCanvas.visible = false;
				gameInfo.guideCanvas.visible = false;
				gameInfo.guide.visible = false;
				gameInfo.preventAim = true;
				gameInfo.preventSetPower = true;

				gameInfo.preventUpdateCue = true;
				gameInfo.drawGuide = false;
			}

			if (gameInfo.moverMouseDown == true) {
				gameInfo.placeFirstTimeMouseUp = true;
				Project.game.add.tween(cueBall.mover).to({ alpha: 1 }, 500, "Linear", true);
				gameInfo.cueCanvas.visible = false;
				gameInfo.guideCanvas.visible = false;
				//console.log("hiding guide");
				gameInfo.preventAim = true;
				gameInfo.preventSetPower = true;
				gameInfo.preventUpdateCue = true;
				gameInfo.drawGuide = false;
				cueBall.mc.visible = true;

				//check location of cursor in relation to other balls/cushions and move cue ball accordingly
				var cursor = new Vector2D(
					gameInfo.cursorLocal.x / gameInfo.physScale,
					gameInfo.cursorLocal.y / gameInfo.physScale
				);

				positionCueBall(cursor);
				//cueBall.position.x = cursor.x;
				//cueBall.position.y = cursor.y;

				gameInfo.cueSet = false; // enables access to updateCue()
				renderScreen();
			}

			if (
				gameInfo.moverMouseDown == false &&
				gameInfo.moverMouseOver == false
			) {
				if (gameInfo.placeFirstTimeMouseUp == true) {
					gameInfo.preventAim = false;
					gameInfo.preventSetPower = false;
					gameInfo.cueCanvas.visible = true;
					gameInfo.placeFirstTimeMouseUp = false;
					gameInfo.cueCanvas.x =
						gameInfo.ballArray[0].position.x * gameInfo.physScale;
					gameInfo.cueCanvas.y =
						gameInfo.ballArray[0].position.y * gameInfo.physScale;

					var ang = Maths.findBearing(
						-gameInfo.cueCanvas.x,
						-gameInfo.cueCanvas.y
					);

					gameInfo.cueCanvas.angle = ang;

					var compX = Math.cos((gameInfo.cueCanvas.angle * Math.PI) / 180);
					var compY = Math.sin((gameInfo.cueCanvas.angle * Math.PI) / 180);
					gameInfo.aimDirectionVector = new Vector2D(compX, compY).normalize();

					//gameInfo.guideCanvas.visible = true;
					gameInfo.preventUpdateCue = false;
					gameInfo.drawGuide = true;
					updateAimingGuide();

					Project.game.add.tween(cueBall.mover).to({ alpha: 0.2 }, 500, "Linear", true);
				}
			}
		}
	}

	function positionCueBall(cursor) {
		//note - if break off shot, alter allowable area
		var cueBall = gameInfo.ballArray[0];

		//var projectionUnitVec = (cursor.minus(cueBall.position)).normalize(); //unit vector from current cue ball position to mouse cursor
		//var projectionVec = projectionUnitVec.times(500000);  //projection in that direction
		//var projectionVec = cueBall.position.plus(cursor.minus(cueBall.position));

		var collision = new Array();
		var intersect = new Array();
		var touching = false;

		//find all balls intersecting aiming line
		//console.log("checking obstructions");

		//project cue ball back one radius from cue ball away from cursor and start line intersection from there to check collisions with multiple balls
		//var cueBallVec = new Vector2D(cueBall.position.x, cueBall.position.y);
		//var targetVec = new Vector2D(cursor.x, cursor.y);
		//var unitVec = targetVec.minus(cueBallVec).normalize();
		//var startVec = cueBallVec.plus(unitVec.times(gameInfo.ballRadius * 1.1));

		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var target = gameInfo.ballArray[n];

			if (target.active == true) {
				var A = new Point(cueBall.position.x, cueBall.position.y);
				var B = new Point(cursor.x, cursor.y);
				var C = new Point(target.position.x, target.position.y);
				var r = gameInfo.ballRadius * 2;
				var result = Maths.lineIntersectCircle(A, B, C, r);

				if (result.intersects == true) {
					collision.push(target);
					if (result.enter != null) {
						intersect.push(result.enter);
					} else if (result.exit != null) {
						intersect.push(result.exit);
					} else {
						//touching ball
						intersect.push(new Point(cueBall.position.x, cueBall.position.y));
						touching = true;
					}
				}
			}
		}

		//find ball intersecting,
		var ball;
		var intersectPoint;

		if (collision.length == 1) {
			//position just infront of the intersect point - ie along the line between cue ball and cursor, just before intersection
			//console.log(intersectPoint);
			//var cueBallVec = new Vector2D(cueBall.position.x, cueBall.position.y);
			ball = collision[0];
			intersectPoint = intersect[0];
			var targetVec = new Vector2D(ball.position.x, ball.position.y);
			var intersectVec = new Vector2D(intersectPoint.x, intersectPoint.y);
			var unitVec = targetVec.minus(intersectVec).normalize();

			var newPos = intersectVec.minus(unitVec.times(200));
			cueBall.position = newPos;
		}

		if (collision.length > 1) {
			//if the the cueBall to Cursor vector intersects more than one target balls, find out where the cue ball wouldn't be able to fit between target balls by performing a circle-circle intersection on target balls with raius * 2.  If these intersections exist, find the closest to the cursor and place cue ball there.
			var intersectArray = new Array();

			for (var c1 = 0; c1 < collision.length; c1++) {
				for (var c2 = c1; c2 < collision.length; c2++) {
					//don't test ball on itself
					if (c1 != c2) {
						var ball1 = collision[c1];
						var ball2 = collision[c2];

						var int = Maths.circleIntersectCircle(
							ball1.position.x,
							ball1.position.y,
							gameInfo.ballRadius * 2,
							ball2.position.x,
							ball2.position.y,
							gameInfo.ballRadius * 2
						);
						if (int != null) {
							//intersect returns two x,y values
							var int1 = new Point(int.x3, int.y3);
							var int2 = new Point(int.x4, int.y4);
							intersectArray.push(int1);
							intersectArray.push(int2);
						}
					}
				}
			}

			var closestDist = 100000000000000;
			var intPoint;

			if (intersectArray.length > 0) {
				//cycle through all intersections and find closest to cursor, so long as it doesn't overlap another ball
				//console.log("ints: " + intersectArray.length);

				for (var k = 0; k < intersectArray.length; k++) {
					//does intersect point overlap another ball?
					if (
						checkPositionOverlapping2(
							intersectArray[k].x,
							intersectArray[k].y
						) == false
					) {
						var distSq =
							(intersectArray[k].x - cursor.x) *
								(intersectArray[k].x - cursor.x) +
							(intersectArray[k].y - cursor.y) *
								(intersectArray[k].y - cursor.y);

						if (distSq < closestDist) {
							closestDist = distSq;
							intPoint = intersectArray[k];
						}
						//}else{
						//console.log("overlaps");
					}
				}
			}

			//var targetVec = new Vector2D(ball.position.x, ball.position.y);
			if (intPoint) {
				var intersectVec = new Vector2D(intPoint.x, intPoint.y);
				var unitVec = cursor.minus(intersectVec).normalize();
				var newPos = intersectVec.minus(unitVec.times(100));
				cueBall.position = newPos;
			}
		}

		if (collision.length == 0) {
			//no balls intersecting - check intersection with table edge
			//array of four lines representing table edge (simpler than involving all lines)
			var pointArray = new Array();

			var A;
			var B = new Point(cursor.x, cursor.y);

			if (gameInfo.shotNum > 0) {
				A = new Point(0, 0);

				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 10,
						gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius - 10,
						gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius - 10,
						gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 10,
						gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 10,
						gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 10
					)
				); //allows n+1 below to represent the first point
			} else {
				A = new Point(gameInfo.adjustmentScale * -22500, 0);

				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 10,
						gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -15000 + 10,
						gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -15000 + 10,
						gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 10,
						gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 10
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 10,
						gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 10
					)
				); //allows n+1 below to represent the first point
			}

			var intersectPoint;
			for (var n = 0; n < 4; n++) {
				var intersect = Maths.lineIntersectLine(
					A,
					B,
					pointArray[n],
					pointArray[n + 1]
				);
				if (intersect != null) {
					intersectPoint = intersect;
				}
			}

			if (intersectPoint != null) {
				//console.log(intersectPoint);
				var cueBallVec = new Vector2D(cueBall.position.x, cueBall.position.y);
				var intersectVec = new Vector2D(intersectPoint.x, intersectPoint.y);
				var unitVec = cursor.minus(cueBallVec).normalize();
				cueBall.position = intersectVec.minus(unitVec.times(100));
			} else {
				cueBall.position.x = cursor.x;
				cueBall.position.y = cursor.y;
			}
		}

		//final belt and braces check for overlaps, simply move ball to the left if so
		while (
			checkPositionOverlapping2(cueBall.position.x, cueBall.position.y) == true
		) {
			cueBall.position.x -= gameInfo.ballRadius / 4;
		}

		//and final check to make sure on table
		checkOnTable();
	}

	function checkOnTable() {
		//force cue ball onto table if it isnt already

		var cueBallPosition = gameInfo.ballArray[0].position;

		var onTable = false;
		if (
			cueBallPosition.x > gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius &&
			cueBallPosition.x < gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius &&
			cueBallPosition.y > gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius &&
			cueBallPosition.y < gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius
		) {
			onTable = true;
		}

		if (!onTable) {
			var cushion;
			if (cueBallPosition.x < gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 5) {
				cueBallPosition.x = gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 5;
				cushion = "left";
			}
			if (cueBallPosition.x > gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius - 5) {
				cueBallPosition.x = gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius - 5;
				cushion = "right";
			}
			if (cueBallPosition.y < gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 5) {
				cueBallPosition.y = gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 5;
				cushion = "top";
			}
			if (cueBallPosition.y > gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 5) {
				cueBallPosition.y = gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 5;
				cushion = "bottom";
			}

			while (checkPositionOverlapping2(cueBallPosition.x, cueBallPosition.y) == true) {
				//move ball clockwise around table edge until a free gap is found
				if (cushion == "left") {
					cueBallPosition.y -= gameInfo.ballRadius / 4;
					if (cueBallPosition.y < gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 5) {
						cueBallPosition.y = gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius + 5;
						cushion = "top";
					}
				}

				if (cushion == "top") {
					cueBallPosition.x += gameInfo.ballRadius / 4;
					if (cueBallPosition.x > gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius - 5) {
						cueBallPosition.x = gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius - 5;
						cushion = "right";
					}
				}

				if (cushion == "right") {
					cueBallPosition.y += gameInfo.ballRadius / 4;
					if (cueBallPosition.y > gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 5) {
						cueBallPosition.y = gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius - 5;
						cushion = "bottom";
					}
				}
				if (cushion == "bottom") {
					cueBallPosition.x -= gameInfo.ballRadius / 4;
					if (cueBallPosition.x < gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 5) {
						cueBallPosition.x = gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius + 5;
						cushion = "left";
					}
				}
			}
		}
	}

	function setSpin() {
		if (gameInfo.startAim == false || !Project.game.device.touch) {
			if (
				gameInfo.spinSetterZoom.visible == true &&
				gameInfo.settingSpin == false
			) {
				if (Project.game.input.activePointer.isDown) {
					if (
						Project.game.input.activePointer.x > gameInfo.spinSetterZoom.x + gameInfo.spinSetterZoom.width / 2 ||
						Project.game.input.activePointer.x < gameInfo.spinSetterZoom.x - gameInfo.spinSetterZoom.width / 2 ||
						Project.game.input.activePointer.y > gameInfo.spinSetterZoom.y + gameInfo.spinSetterZoom.height / 2 ||
						Project.game.input.activePointer.y < gameInfo.spinSetterZoom.y - gameInfo.spinSetterZoom.height / 2
					) {
						gameInfo.spinSetterZoom.visible = false;
						gameInfo.preventAim = false;
						gameInfo.preventSetPower = false;
					}
				}
			}

			if (gameInfo.settingSpin == true && Project.game.input.activePointer.isDown == false) {
				//ensures mouse comes up once after setting spin before clicking away the spin setter above
				gameInfo.settingSpin = false;
			}

			if (gameInfo.settingPower == false && gameInfo.shotRunning == false) {
				if (
					gameInfo.spinSetter.input.checkPointerDown(Project.game.input.activePointer) &&
					gameInfo.spinSetterZoom.visible == false
				) {
					gameInfo.spinSetterZoom.visible = true;
					gameInfo.preventAim = true;
					gameInfo.preventSetPower = true;
				}
			}

			if (
				gameInfo.spinSetterZoom.input.checkPointerDown(Project.game.input.activePointer) &&
				gameInfo.spinSetterZoom.visible == true
			) {
				gameInfo.settingSpin = true;

				gameInfo.cueBallSpotZoom.x = Project.game.input.x - gameInfo.spinSetterZoom.x;
				gameInfo.cueBallSpotZoom.y = Project.game.input.y - gameInfo.spinSetterZoom.y;
				// console.log( gameInfo.cueBallSpotZoom.x, gameInfo.cueBallSpotZoom.y );

				var distSq =
					gameInfo.cueBallSpotZoom.x * gameInfo.cueBallSpotZoom.x +
					gameInfo.cueBallSpotZoom.y * gameInfo.cueBallSpotZoom.y;
				if (distSq > 130 * 130) {
					var ang = Math.atan2(
						gameInfo.cueBallSpotZoom.y,
						gameInfo.cueBallSpotZoom.x
					);
					gameInfo.cueBallSpotZoom.x = 130 * Math.cos(ang);
					gameInfo.cueBallSpotZoom.y = 130 * Math.sin(ang);
				}

				gameInfo.cueBallSpot.x = (50 * gameInfo.cueBallSpotZoom.x) / 130;
				gameInfo.cueBallSpot.y = (50 * gameInfo.cueBallSpotZoom.y) / 130;
				// console.log( gameInfo.cueBallSpot.x, gameInfo.cueBallSpot.y );

				gameInfo.ballArray[0].screw = Maths.fixNumber(
					(0.5 * gameInfo.cueBallSpot.y) / 100
				); //value between -0.5 (topspin) and 0.5 (backspin)
				gameInfo.ballArray[0].english = Maths.fixNumber(
					gameInfo.cueBallSpot.x / 100
				); //value between -1 (left side) and 1 (right side)
				gameInfo.cue.y =
					0.8 *
					gameInfo.ballArray[0].english *
					gameInfo.ballRadius *
					gameInfo.physScale;
			}
		}
	}

	function aim() {
		if (gameInfo.preventAim == false) {
			if (gameInfo.settingPower == false) {
				if (!Project.game.device.touch) {
					var dx = gameInfo.cursorLocal.x - gameInfo.ballArray[0].position.x * gameInfo.physScale;
					var dy = gameInfo.cursorLocal.y - gameInfo.ballArray[0].position.y * gameInfo.physScale;

					gameInfo.cueCanvas.angle = (180 / Math.PI) * Math.atan2(dy, dx);

					//shadow
					var xOffset = gameInfo.ballArray[0].position.x * gameInfo.physScale * 0.02;
					var yOffset = gameInfo.ballArray[0].position.y * gameInfo.physScale * -0.02;
					var ang = yOffset + Math.sin((Math.PI / 180) * gameInfo.cueCanvas.angle) * xOffset;

					if (ang > 5) {
						ang = 5;
					}
					if (ang < -5) {
						ang = -5;
					}

					// gameInfo.cueShadow.angle = 3 + ang;
					var compX = Math.cos((gameInfo.cueCanvas.angle * Math.PI) / 180);
					var compY = Math.sin((gameInfo.cueCanvas.angle * Math.PI) / 180);
					gameInfo.aimDirectionVector = new Vector2D(compX, compY).normalize();
					updateAimingGuide();
				}

				if (Project.game.device.touch) {
					if (Project.game.input.activePointer.isDown == true) {
						if (gameInfo.startAim) {
							var newCursorGlobal = Project.game.input;
							var newCursorLocal = new Point(
								newCursorGlobal.x - gameInfo.gameCanvas.x,
								newCursorGlobal.y - gameInfo.gameCanvas.y
							);

							if (!gameInfo.landscape) {
								newCursorLocal = new Point(-newCursorLocal.y, newCursorLocal.x);
							}
							var newAng =
								(180 / Math.PI) *
								Math.atan2(
									newCursorLocal.y / gameInfo.physScale -
										gameInfo.ballArray[0].position.y,
									newCursorLocal.x / gameInfo.physScale -
										gameInfo.ballArray[0].position.x
								);

							//newAng = Maths.wrapValue(newAng);

							var angleDiff = Maths.angleDiff(
								Maths.wrapValue(newAng),
								Maths.wrapValue(gameInfo.startAng)
							);
							//var angleDiff;

							angleDiff *= gameInfo.aimSensitivity;
							//angleDiff = Math.abs(angleDiff) * 0.8;
							gameInfo.cueCanvas.angle = gameInfo.startCue + angleDiff;

							var compX = Math.cos((gameInfo.cueCanvas.angle * Math.PI) / 180);
							var compY = Math.sin((gameInfo.cueCanvas.angle * Math.PI) / 180);
							gameInfo.aimDirectionVector = new Vector2D(compX, compY).normalize();
							updateAimingGuide();

							if (angleDiff > 10 || angleDiff < -10) {
								gameInfo.startCue = Maths.wrapValue(gameInfo.cueCanvas.angle);
								gameInfo.startAng =
									(180 / Math.PI) *
									Math.atan2(
										gameInfo.cursorLocal.y / gameInfo.physScale - gameInfo.ballArray[0].position.y,
										gameInfo.cursorLocal.x / gameInfo.physScale - gameInfo.ballArray[0].position.x
									);
								gameInfo.aimSensitivity += 0.1;

								if (gameInfo.aimSensitivity > 1) {
									gameInfo.aimSensitivity = 1;
								}
							}
						} else {
							if (
								gameInfo.cursorLocal.x < gameInfo.tableTop.width / 2 &&
								gameInfo.cursorLocal.x > -gameInfo.tableTop.width / 2 &&
								gameInfo.cursorLocal.y < gameInfo.tableTop.height / 2 &&
								gameInfo.cursorLocal.y > -gameInfo.tableTop.height / 2
							) {
								gameInfo.preventSetPower = true;
								gameInfo.startCue = Maths.wrapValue(gameInfo.cueCanvas.angle);
								gameInfo.startAng =
									(180 / Math.PI) *
									Math.atan2(
										gameInfo.cursorLocal.y / gameInfo.physScale - gameInfo.ballArray[0].position.y,
										gameInfo.cursorLocal.x / gameInfo.physScale - gameInfo.ballArray[0].position.x
									);
								gameInfo.startAim = true;
								gameInfo.aimSensitivity = 0.5;

								if (!gameInfo.firstTouch) {
									gameInfo.startCue = gameInfo.cueCanvas.angle;
									gameInfo.firstTouch = true;
								}
							}
						}
					} else {
						gameInfo.startAim = false;
						gameInfo.preventSetPower = false;
					}
				}
			}
		}
	}

	function updateAimingGuide() {
		if (gameInfo.drawGuide == true) {
			gameInfo.guideCanvas.visible = true;
			gameInfo.guide.visible = true;
			gameInfo.guide.lineStyle(3, 0xff0000, 1);

			var startVec = gameInfo.ballArray[0].position;
			var projectionVec = startVec.plus(gameInfo.aimDirectionVector.times(500000));
			var collision = new Array();
			var intersect = new Array();
			var touching = false;
			var cueBall = gameInfo.ballArray[0];

			for (var n = 1; n < gameInfo.ballArray.length; n++) {
				var target = gameInfo.ballArray[n];

				if (target.active == true) {
					var A = new Point(cueBall.position.x, cueBall.position.y);
					var B = new Point(projectionVec.x, projectionVec.y);
					var C = new Point(target.position.x, target.position.y);
					var r = gameInfo.ballRadius * 2;
					var result = Maths.lineIntersectCircle(A, B, C, r);

					if (result.intersects == true) {
						collision.push(target);
						if (result.enter != null) {
							intersect.push(result.enter);
						} else {
							//touching ball
							intersect.push(new Point(cueBall.position.x, cueBall.position.y));
							touching = true;
						}
					}
				}
			}

			//find ball intersecting,
			var ball;
			var intersectPoint;

			if (collision.length > 0) {
				//if more than one ball intersects, find closest to cueball
				var closestDist = 100000000000;
				for (var k = 0; k < collision.length; k++) {
					var distSq =
						(collision[k].position.x - cueBall.position.x) *
							(collision[k].position.x - cueBall.position.x) +
						(collision[k].position.y - cueBall.position.y) *
							(collision[k].position.y - cueBall.position.y);

					//console.log("intersect dist: " + distSq);
					if (distSq < closestDist) {
						closestDist = distSq;
						ball = collision[k];
						//console.log("ball: " + ball);
						intersectPoint = intersect[k];
					}
				}

				//now draw lines - we now have the positions of the cueball, the object ball, and the intersect point
				gameInfo.guide.clear();
				gameInfo.guide.lineStyle(3, 0xffffff, 1);

				var bearingAim = Maths.findBearing(
					intersectPoint.x - cueBall.position.x,
					intersectPoint.y - cueBall.position.y
				);
				var bearingBall = Maths.findBearing(
					ball.position.x - intersectPoint.x,
					ball.position.y - intersectPoint.y
				);
				var diff = Math.abs(Maths.angleDiff(bearingBall, bearingAim));
				var mag = gameInfo.ballRadius * 5 * ((90 - diff) / 90);

				var dest = new Point(
					ball.position.x + Math.cos((bearingBall * Math.PI) / 180) * mag,
					ball.position.y + Math.sin((bearingBall * Math.PI) / 180) * mag
				);

				if (Project.guideOn == true) {
					gameInfo.guide.moveTo(cueBall.position.x * gameInfo.physScale, cueBall.position.y * gameInfo.physScale);
					gameInfo.guide.lineTo(intersectPoint.x * gameInfo.physScale, intersectPoint.y * gameInfo.physScale);
				}

				//draw the circle regardless of whether guide is on or off
				gameInfo.guide.drawCircle(
					intersectPoint.x * gameInfo.physScale,
					intersectPoint.y * gameInfo.physScale,
					gameInfo.ballRadius * 2 * gameInfo.physScale
				);

				if (Project.guideOn == true) {
					gameInfo.guide.moveTo(
						ball.position.x * gameInfo.physScale,
						ball.position.y * gameInfo.physScale
					);
					gameInfo.guide.lineTo(
						dest.x * gameInfo.physScale,
						dest.y * gameInfo.physScale
					);
				}

				//draw cueball path
				if (touching == false) {
					var bearingCueBall = Maths.findBearing(
						intersectPoint.x - cueBall.position.x,
						intersectPoint.y - cueBall.position.y
					);
					var bearingObjectBall = Maths.findBearing(
						dest.x - intersectPoint.x,
						dest.y - intersectPoint.y
					);
					var diff = Maths.angleDiff(bearingObjectBall, bearingCueBall);
					var mag = (gameInfo.ballRadius * 5 * diff) / 90;
					var bearingRebound = bearingObjectBall - 90;
					var dest2 = new Point(
						intersectPoint.x + mag * Math.cos((bearingRebound * Math.PI) / 180),
						intersectPoint.y + mag * Math.sin((bearingRebound * Math.PI) / 180)
					);
					if (Project.guideOn == true) {
						gameInfo.guide.moveTo(
							intersectPoint.x * gameInfo.physScale,
							intersectPoint.y * gameInfo.physScale
						);
						gameInfo.guide.lineTo(
							dest2.x * gameInfo.physScale,
							dest2.y * gameInfo.physScale
						);
					}
				}
			} else {
				//no balls intersecting - draw line to table edge

				//array of four lines representing table edge (simpler than involving all lines)
				var pointArray = new Array();
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -31100 + gameInfo.ballRadius,
						gameInfo.adjustmentScale * -15400 + gameInfo.ballRadius
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * 31100 - gameInfo.ballRadius,
						gameInfo.adjustmentScale * -15400 + gameInfo.ballRadius
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * 31100 - gameInfo.ballRadius,
						gameInfo.adjustmentScale * 15600 - gameInfo.ballRadius
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -31100 + gameInfo.ballRadius,
						gameInfo.adjustmentScale * 15600 - gameInfo.ballRadius
					)
				);
				pointArray.push(
					new Point(
						gameInfo.adjustmentScale * -31100 + gameInfo.ballRadius,
						gameInfo.adjustmentScale * -15400 + gameInfo.ballRadius
					)
				); //allows n+1 below to represent the first point

				var A = new Point(cueBall.position.x, cueBall.position.y);
				var B = new Point(projectionVec.x, projectionVec.y);
				var intersectPoint;

				for (var n = 0; n < 4; n++) {
					var intersect = Maths.lineIntersectLine(
						A,
						B,
						pointArray[n],
						pointArray[n + 1]
					);

					if (intersect != null) {
						intersectPoint = intersect;
					}
				}

				if (intersectPoint != null) {
					gameInfo.guide.clear();
					gameInfo.guide.lineStyle(3, 0xffffff, 1);

					if (Project.guideOn == true) {
						gameInfo.guide.moveTo(
							cueBall.position.x * gameInfo.physScale,
							cueBall.position.y * gameInfo.physScale
						);
						gameInfo.guide.lineTo(
							intersectPoint.x * gameInfo.physScale,
							intersectPoint.y * gameInfo.physScale
						);
					}
					gameInfo.guide.drawCircle(
						intersectPoint.x * gameInfo.physScale,
						intersectPoint.y * gameInfo.physScale,
						gameInfo.ballRadius * 2 * gameInfo.physScale
					);
				}
			}
		}
	}

	function setPower() {
		if (gameInfo.preventSetPower == false) {
			//mouse
			if (!Project.game.device.touch) {
				//start drag
				if (
					Project.game.input.activePointer.isDown == true &&
					gameInfo.settingPower == false &&
					gameInfo.beginStrike == false
				) {
					if (
						gameInfo.cursorLocal.x < gameInfo.tableTop.width / 2 &&
						gameInfo.cursorLocal.x > -gameInfo.tableTop.width / 2 &&
						gameInfo.cursorLocal.y < gameInfo.tableTop.height / 2 &&
						gameInfo.cursorLocal.y > -gameInfo.tableTop.height / 2
					) {
						gameInfo.settingPower = true;
						//store mouse position
						gameInfo.mouseX = Project.game.input.x;
						gameInfo.mouseY = Project.game.input.y;
					}
				}

				//continue drag
				if (
					Project.game.input.activePointer.isDown == true &&
					gameInfo.settingPower == true &&
					gameInfo.beginStrike == false
				) {
					//measure mouse drag from original position, in direction of aim
					var dragX = Project.game.input.x - gameInfo.mouseX;
					var dragY = Project.game.input.y - gameInfo.mouseY;
					var maxDrag = 180;
					var dragVector = new Vector2D(-dragX, -dragY);

					if (!gameInfo.landscape) {
						dragVector = new Vector2D(dragY, -dragX);
					}
					var drag = dragVector.dot(gameInfo.aimDirectionVector);

					if (drag > maxDrag) {
						drag = maxDrag;
					}
					if (drag < 0) {
						drag = 0;
					}

					gameInfo.power = gameInfo.maxPower * (Math.pow(drag, 1.4) / Math.pow(maxDrag, 1.4));
					updateAimingGuide();
					gameInfo.cue.x = -0.5 * drag - gameInfo.ballRadius * 1.5 * gameInfo.physScale;
					// gameInfo.cueShadow.x = gameInfo.cue.x;
				}
			}

			//both mouse and touch

			//cancel shot and allow aiming
			if (
				gameInfo.power < 40 &&
				Project.game.input.activePointer.isDown == false &&
				gameInfo.settingPower == true
			) {
				gameInfo.settingPower = false;
			}
		}
	}

	function beginStrike() {
		//trigger the shot
		if (
			gameInfo.power > 40 &&
			Project.game.input.activePointer.isDown == false &&
			gameInfo.settingPower == true &&
			gameInfo.beginStrike == false
		) {
			gameInfo.beginStrike = true;

			// hideMarkers();

			var tweenTime = 1 / gameInfo.power;

			if (tweenTime > 0.8) {
				tweenTime = 0.8;
			}
			if (tweenTime < 0.1) {
				tweenTime = 0.1;
			}

			var cueTween = Project.game.add.tween(gameInfo.cue);
			cueTween.to(
				{ x: gameInfo.power / 400 },
				tweenTime * 1000,
				Phaser.Easing.Linear.Out
			);

			// var cueShadowTween = Project.game.add.tween(gameInfo.cueShadow);
			// cueShadowTween.to(
			// 	{ x: gameInfo.power / 400 },
			// 	tweenTime * 1000,
			// 	Phaser.Easing.Linear.Out
			// );

			var cueFadeTween = Project.game.add.tween(gameInfo.cueCanvas);
			cueFadeTween.to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, 1500);
			cueFadeTween.onComplete.add(hideCueCanvas, this);

			cueTween.start();
			// cueShadowTween.start();
			cueFadeTween.start();

			function hideCueCanvas() {
				gameInfo.cueCanvas.visible = false;
				gameInfo.cueCanvas.alpha = 1;
				gameInfo.cueTweenComplete = true;
			}

			gameInfo.guideCanvas.visible = false;
			gameInfo.cueBallInHand = false;
		}

		if (gameInfo.beginStrike == true) {
			//console.log("striking");

			if (gameInfo.cue.x >= -gameInfo.ballRadius * gameInfo.physScale) {
				strikeBall();
			}
		}
	}

	function strikeBall() {
		Sound.Play("cueHit", 1);
		//console.log("strike");

		gameInfo.ballArray[0].mover.visible = false;
		gameInfo.shotRunning = true;
		gameInfo.shotNum++;
		gameInfo.ballArray[0].velocity = gameInfo.aimDirectionVector.times(
			gameInfo.power
		);
		gameInfo.shotReset = false;

		if (gameInfo.timerStarted == false) {
			// Start the time

			gameInfo.timerStarted = true;
			// startTimer();

			// var tween = Project.game.add.tween(gameInfo.levelText);
			// tween.to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, 2000);
			// tween.onComplete.add(hideText, this);

			// function hideText() {
			// 	gameInfo.levelText.visible = false;
			// }
		}
	}

	function checkShotOver() {
		//check cueTween is complete
		if (gameInfo.cueTweenComplete == true || gameInfo.trial == true) {
			//check pocketTween is complete for each ball
			var pocketTweensComplete = true;
			for (var b = 0; b < gameInfo.ballArray.length; b++) {
				if (gameInfo.ballArray[b].pocketTweenComplete == false) {
					pocketTweensComplete = false;
				}
			}

			if (pocketTweensComplete == true || gameInfo.trial == true) {
				//check ball are stationary
				var ballsMoving = false;
				for (var n = 0; n < gameInfo.ballArray.length; n++) {
					var ball = gameInfo.ballArray[n];
					if (ball.velocity.magnitude > 0) {
						ballsMoving = true;
					}
				}

				if (ballsMoving == false) {
					gameInfo.shotRunning = false;
					gameInfo.shotComplete = true; // allows access to applyRulings()
				}
			}
		}
	}

	function applyRulings() {
		//called after each shot is over, and all balls are static.
		//these rulings are the same functions regardless of who's turn.

		if (
			gameInfo.shotComplete == true &&
			gameInfo.rulingsApplied == false &&
			gameInfo.shotRunning == false
		) {
			//console.log("applying rulings 1");

			preventQuit = true;

			gameInfo.rulingsApplied = true;

			//each of the following fouls will override the previous ones.
			checkForMiss();
			checkIllegalContact();
			checkForScratch();
			checkPots(); //need to check even if foul was committed in case 8 ball was illegally potted
			checkCushionContacts(); //has to come after checkPots because if a ball is potted, this is irrelevant.

			if (gameInfo.mode != "practice") {
				if (gameInfo.fouled == true) {
					//trace("foul committed:");

					if (gameInfo.trial == false) {
						//Project.game.time.events.add(Phaser.Timer.SECOND * 5, applyRulings2, this);

						gameInfo.cueBallInHand = true;

						//if break off shot, rerack
						if (gameInfo.shotNum == 1) {
							gameRunning = false;
							gameInfo.rerack = true;
						}

						showFoulMessage();
					} else {
						gameInfo.shotRating = -1;
						applyRulings2();
					}
				} else {
					//no foul occured, so theoretically there is no chance of a rerack - we can reset rerack and lastBreaker here.
					if (gameInfo.trial == false) {
						gameInfo.cueBallInHand = false;
						Project.lastBreaker = "none";
						gameInfo.rerack = false;
						//console.log("rerack = false");
					}

					if (!gameInfo.fouled) {
						if (gameInfo.turn == "p1") {
							// famobi_analytics.trackEvent("EVENT_LIVESCORE", {
							// 	liveScore: Project.score,
							// });
						}
					}

					applyRulings2();
				}
			}
		}
	}

	function applyRulings2() {
		Project.APP.spinSetter.dispatch({ type: "reset-spin-setter" });

		//new - apply rulings split into 2 to allow time delay after showing foul messsage and before continuing with switching turns and moving onto next shot.
		if (gameInfo.gameRunning == true) {
			//prevents coming here in the event of rerack, in which case gameRunning is set to false

			//console.log("apply rulings 2");

			//check to see if all object balls have been potted, in which case end the game
			if (gameInfo.mode == "practice") {
				var ballActive = false;
				for (var n = 1; n < gameInfo.ballArray.length; n++) {
					if (gameInfo.ballArray[n].active == true) {
						ballActive = true;
					}
				}
				if (ballActive == false) {
					gameInfo.gameOver = true;
				}
			}

			if (gameInfo.gameOver == false) {
				if (gameInfo.trial == false && gameInfo.mode != "practice") {
					setNextTargetType();
					checkWhosTurn();
				}
				resetVars();
			} else {
				//game is over - show results
				//trace("game over");
				//gameInfo.gameRunning = false;
				//showGameOver();
			}
		}

		preventQuit = false;

		if (gameInfo.rerack == true) {
			preventQuit = true;
			//setTimeout(rerackBalls, 3000);
			Project.game.time.events.add(500, rerackBalls, this);
		}
	}

	/*
	function initNextLevel() {
		if (Project.levelComplete == true) {
			//gameInfo.allowTransferPoints = true;
		}
	}
	*/

	/*
	function transferBonusPoints() {
		if (gameInfo.allowTransferPoints == true) {
			//here every loop if stage complete

			if (parseInt(gameInfo.gameOverPanel.text1.text) < Project.score) {
				gameInfo.gameOverPanel.text1.text = String(
					parseInt(gameInfo.gameOverPanel.text1.text) + 5
				);

				if (parseInt(gameInfo.gameOverPanel.text1.text) > Project.score) {
					gameInfo.gameOverPanel.text1.text = String(Project.score);
				}

				//update highscore display
				if (
					parseInt(gameInfo.gameOverPanel.text2.text) <
					parseInt(gameInfo.gameOverPanel.text1.text)
				) {
					gameInfo.gameOverPanel.text2.text = gameInfo.gameOverPanel.text1.text;
				}

				Sound.Play("ding", 0.3);
			} else {
				gameInfo.allowTransferPoints = false;
				if (gameInfo.transfer1Complete == false) {
					gameInfo.transfer1Complete = true;
					Project.game.time.events.add(1000, showBonus2, this);
				}
				if (gameInfo.transfer2Complete == false) {
					gameInfo.transfer2Complete = true;
				}
			}
		}
	}
	*/

	function checkGameOver() {
		//gameInfo.gameOver = true is set in timer.js when time runs out.
		if (gameInfo.gameOver == true) {
		// if (gameInfo.gameOver == true && gameInfo.foulDisplayComplete == true) {
			//console.log("checked game over");

			gameInfo.cueBaseCanvas.visible = false;
			gameInfo.guideCanvas.visible = false;

			gameInfo.gameRunning = false;

			showGameOver();
		}
	}

	function showGameOver(forceWinP1 = false) {
		if (forceWinP1) gameInfo.winner = "p1";

		if (gameInfo.winner = "p1") {
			Project.APP.els.content.addClass("game-won");
		} else {
			Project.APP.els.content.addClass("game-lost");
		}
		
		return console.log("winner: ", gameInfo.winner);
		

		//console.log("show game over");

		// window.famobi_analytics.trackScreen("SCREEN_LEVELRESULT");

		gameInfo.gameOverPanel.visible = true;

		if (gameInfo.winner == "p1" && Project.mode == 1) {
			gameInfo.playerWin.visible = true;
		}
		if (gameInfo.winner == "p2" && Project.mode == 1) {
			gameInfo.aiWin.visible = true;
			Project.score = 0;
		}

		if (Project.mode == 2) {
			gameInfo.p1Icon.visible = true;
			gameInfo.p2Icon.visible = true;

			let pIconY = -100;

			if (gameInfo.winner == "p1") {
				gameInfo.p2Icon.rosette.visible = false;
				gameInfo.p2Icon.scale = new Phaser.Point(0.4, 0.4);

				gameInfo.p2Icon.y = pIconY + 256 * 0.05;
				gameInfo.p1Icon.y = pIconY;
			} else {
				gameInfo.p1Icon.rosette.visible = false;
				gameInfo.p1Icon.scale = new Phaser.Point(0.4, 0.4);

				gameInfo.p2Icon.y = pIconY;
				gameInfo.p1Icon.y = pIconY + 256 * 0.05;
			}

			gameInfo.gameOverWindow.visible = false;
			gameInfo.GOscoreIcon.visible = false;
			gameInfo.GOhighScoreIcon.visible = false;
			gameInfo.gameOverPanel.text1.visible = false;
			gameInfo.gameOverPanel.text2.visible = false;
		}

		gameInfo.gameOverPanel.text1.text = String(Project.score);
		gameInfo.gameOverPanel.text2.text = String(Project.bestScore);

		gameInfo.GOaiLevel.visible = false;
		gameInfo.GOclockIcon.visible = false;

		gameInfo.gameOverPanel.text3.visible = false;
		gameInfo.gameOverPanel.text4.visible = false;

		if (gameInfo.winner == "p1" && Project.mode == 1) {
			gameInfo.quitButton2.visible = false;
			gameInfo.replayButton.visible = false;
			showBonuses();
		} else {
			gameInfo.quitButton2.visible = false;
			gameInfo.replayButton.visible = false;

			var showButtons = function () {
				gameInfo.quitButton2.visible = true;
				gameInfo.replayButton.visible = true;

				gameInfo.quitButton2.input.enabled = true;
				gameInfo.replayButton.input.enabled = true;
			};

			Project.game.time.events.add(
				2000,
				function () {
					sendGameOverToAPI().then(showButtons, showButtons);
				},
				this
			);
		}
	}

	window.FORCE_LOSE = (forceP1 = true) => {
		showGameOver(forceP1);
	};

	function showBonuses() {
		// Sound.Play("cheer", 1);
		Project.game.time.events.add(2000, showBonus1, this);
	}

	function showBonus1() {
		gameInfo.GOclockIcon.visible = true;
		var timeBonus = 180 - Math.round(gameInfo.time / 60);
		if (timeBonus < 0) {
			timeBonus = 0;
		}
		gameInfo.gameOverPanel.text3.text = String(timeBonus);

		gameInfo.gameOverPanel.text3.visible = true;

		Project.score += timeBonus;

		if (timeBonus > 0) {
			gameInfo.allowTransferPoints = true;
			gameInfo.transfer1Complete = false;
		} else {
			Project.game.time.events.add(2000, showBonus2, this);
		}
	}

	function showBonus2() {
		gameInfo.GOaiLevel.visible = true;
		gameInfo.GOaiLevel.frame = Project.aiRating - 1;
		gameInfo.gameOverPanel.text4.visible = true;
		var levelBonus = Project.aiRating * 100;
		gameInfo.gameOverPanel.text4.text = String(levelBonus);

		Project.score += levelBonus;

		gameInfo.allowTransferPoints = true;
		gameInfo.transfer2Complete = false;
	}

	function showButtons() {
		gameInfo.quitButton2.visible = true;
		gameInfo.replayButton.visible = true;
		gameInfo.quitButton2.input.enabled = true;
		gameInfo.replayButton.input.enabled = true;
	}

	function rerackBalls() {
		Project.lastBreaker = gameInfo.turn;
		Project.game.state.start("play");
	}

	function showFoulMessage() {
		console.log(gameInfo.foulMessage);
		if (gameInfo.foulMessage != "potted the cue ball") {
			// gameInfo.gameRunning = false;

			if (gameInfo.turn == "p2") {
				//console.log("FOUL: Player 2 " + gameInfo.foulMessage);
			} else {
				//console.log("FOUL: Player 1 " + gameInfo.foulMessage);
			}

			// gameInfo.foulWindow.visible = true;
			// gameInfo.foulWindow.alpha = 0;
			// Project.game.add
			// 	.tween(gameInfo.foulWindow)
			// 	.to({ alpha: 1 }, 1000, "Linear", true);
			// Project.game.time.events.add(Phaser.Timer.SECOND * 4, fadeFoulWindow, this);

			setTimeout(hideFoulWindow, Phaser.Timer.SECOND);

			function hideFoulWindow() {
				if (gameInfo.rerack == false) {
						// gameInfo.gameRunning = true;
					}
					applyRulings2();
			}

			function fadeFoulWindow() {
				if (gameInfo.foulWindow.visible == true) {
					var foulTween = Project.game.add.tween(gameInfo.foulWindow);
					foulTween.to({ alpha: 0 }, 1000, "Linear", true);
					foulTween.onComplete.add(hideFoulWindow, this);
				}
			}

			// gameInfo.foulWindow.display1.visible = false;
			// gameInfo.foulWindow.display2.visible = false;
			// gameInfo.foulWindow.display3.visible = false;
			// gameInfo.foulWindow.display4.visible = false;

			/*
			switch (gameInfo.foulDisplay1) {
				case "8 BALL":
					gameInfo.foulWindow.display1.visible = true;
					gameInfo.foulWindow.display1.frame = 0;
					break;

				case "MISS":
					gameInfo.foulWindow.display1.visible = true;
					gameInfo.foulWindow.display1.frame = 1;
					//console.log("showing frame 2");
					break;

				case "SOLIDS":
					gameInfo.foulWindow.display1.visible = true;
					gameInfo.foulWindow.display1.frame = 2;
					break;

				case "STRIPES":
					gameInfo.foulWindow.display1.visible = true;
					gameInfo.foulWindow.display1.frame = 3;
					break;
			}

			switch (gameInfo.foulDisplay2) {
				case "8 BALL":
					gameInfo.foulWindow.display2.visible = true;
					gameInfo.foulWindow.display2.frame = 0;
					break;

				case "SOLIDS":
					gameInfo.foulWindow.display2.visible = true;
					gameInfo.foulWindow.display2.frame = 2;
					break;

				case "ANY":
					gameInfo.foulWindow.display2.visible = true;
					gameInfo.foulWindow.display2.frame = 2;
					break;

				case "STRIPES":
					gameInfo.foulWindow.display2.visible = true;
					gameInfo.foulWindow.display2.frame = 3;
					break;
			}

			switch (gameInfo.foulDisplay3) {
				case "CUSHION":
					gameInfo.foulWindow.display1.visible = false; //fouls of this type can also trigger display1 and 2 to show as fouls override each other
					gameInfo.foulWindow.display2.visible = false;
					gameInfo.foulWindow.display3.visible = true;
					gameInfo.foulWindow.display3.frame = 0;
					break;

				case "POTTED8BALL":
					gameInfo.foulWindow.display1.visible = false;
					gameInfo.foulWindow.display2.visible = false;
					gameInfo.foulWindow.display3.visible = true;
					gameInfo.foulWindow.display3.frame = 1;
					break;

				case "POTTEDCUEBALL":
					gameInfo.foulWindow.display1.visible = false;
					gameInfo.foulWindow.display2.visible = false;
					gameInfo.foulWindow.display3.visible = true;
					gameInfo.foulWindow.display3.frame = 2;
					break;
			}

			switch (gameInfo.foulDisplay4) {
				case "CUSHIONONBREAK":
					gameInfo.foulWindow.display4.visible = true;
					break;
			}
			*/
		} else {
			applyRulings2();
		}
	}

	function checkIllegalContact() {
		//first contact of cue ball needs to match with gameInfo.playerTargetType / gameInfo.npcTargetType
		for (var n = 0; n < gameInfo.ballArray[0].contactArray.length; n++) {
			var contact = gameInfo.ballArray[0].contactArray[n];
			if (contact.type == "ball") {
				var targetID = contact.target.id;
				var targetType;
				if (gameInfo.turn == "p1") {
					targetType = gameInfo.p1TargetType;
				} else {
					targetType = gameInfo.p2TargetType;
				}
				if (
					targetType == "ANY" ||
					targetType == "SOLIDS" ||
					targetType == "STRIPES"
				) {
					if (targetID == 8) {
						//8 ball was struck first
						gameInfo.fouled = true;
						gameInfo.foulMessage = "struck the wrong ball first";
						gameInfo.foulDisplay1 = "8 BALL"; //what was hit
						gameInfo.foulDisplay2 = targetType; //what should have been hit
					}
				}
				if (targetType == "SOLIDS") {
					if (targetID > 7) {
						//0 to 7 are the solids, 8 is 8 ball, so anything over 7 is not a solid
						gameInfo.fouled = true;
						gameInfo.foulMessage = "struck the wrong ball first";
						if (targetID == 8) {
							gameInfo.foulDisplay1 = "8 BALL"; //what was hit
						} else {
							gameInfo.foulDisplay1 = "STRIPES";
						}
						gameInfo.foulDisplay2 = "SOLIDS"; //what should have been hit
					}
				}
				if (targetType == "STRIPES") {
					if (targetID < 9) {
						//9 to 15 are the stripes
						gameInfo.fouled = true;
						gameInfo.foulMessage = "struck the wrong ball first";

						if (targetID == 8) {
							gameInfo.foulDisplay1 = "8 BALL"; //what was hit
						} else {
							gameInfo.foulDisplay1 = "SOLIDS";
						}
						gameInfo.foulDisplay2 = "STRIPES"; //what should have been hit
					}
				}
				if (targetType == "8 BALL") {
					if (targetID != 8) {
						//8 ball was not hit
						gameInfo.fouled = true;
						gameInfo.foulMessage = "struck the wrong ball first";

						if (targetID < 8) {
							gameInfo.foulDisplay1 = "SOLIDS"; //what was hit
						} else {
							gameInfo.foulDisplay1 = "STRIPES";
						}
						gameInfo.foulDisplay2 = "8 BALL"; //what should have been hit
					}
				}
				break;
				//no need to check for any further contacts after the first one
			}
		}
	}

	function checkCushionContacts() {
		//on the break, if no object ball is potted, 4 object balls need to touch the cushions after the initial cue ball contact
		//on other shots, if no ball is potted, at least 1 ball needs to touch the cushion after the first cue ball contact

		if (gameInfo.ballsPotted == 0 && gameInfo.fouled == false) {
			if (gameInfo.shotNum == 1) {
				//break off shot
				//trace("checking cushions on break shot");
				var firstContact = false;
				var counter = 0;
				for (var n = 1; n < gameInfo.ballArray.length; n++) {
					//cycle through all object balls and check if they had any cushion contacts.

					var ball = gameInfo.ballArray[n];
					var cushionContact = false;
					if (ball.active == true) {
						for (var c = 0; c < ball.contactArray.length; c++) {
							var contact = ball.contactArray[c];

							if (contact.type == "line" || contact.type == "vertex") {
								cushionContact = true;
								break;
								//no need to check for any further cushion contacts for this ball
							}
						}
					}
					if (cushionContact == true) {
						counter++;
						//trace("balls hitting cushions: " + counter);
					}
				}

				if (counter < 2) {
					gameInfo.fouled = true;
					gameInfo.foulMessage = " failed to make 2 balls hit the cushions on the break";
					gameInfo.foulDisplay4 = "CUSHIONONBREAK";
				}
			} else {
				//after the break, 1 ball needs to hit a cushion after first contact (could be the cue ball)
				var cushionContact2 = false;
				var firstContact = false;
				for (var n2 = 0; n2 < gameInfo.ballArray.length; n2++) {
					//cycle through all balls and check if they had any cushion contacts.
					//for cue ball (n2 == 0) it needs to have hit a ball first

					var ball2 = gameInfo.ballArray[n2];

					if (ball2.active == true) {
						for (var c2 = 0; c2 < ball2.contactArray.length; c2++) {
							//error throw here - undefined term

							var contact2 = ball2.contactArray[c2];

							if (n2 == 0) {
								if (contact2.type == "ball") {
									firstContact = true;
								}
							}
							if (firstContact == true || n2 > 0) {
								//if the ball is an object ball, or if it is a cue ball then check if it has collided with another ball
								if (contact2.type == "line" || contact2.type == "vertex") {
									cushionContact2 = true;
									break;
									//no need to check for any further contacts
								}
							}
						}
						if (cushionContact2 == true) {
							break; //and no need to check any more balls
						}
					}
				}
				if (cushionContact2 == false) {
					gameInfo.fouled = true;
					//trace("no cushion contact");
					gameInfo.foulMessage = " failed to make a ball hit a cushion after the first contact with the cue ball";

					gameInfo.foulDisplay3 = "CUSHION";
				}
			}
		}
	}

	function checkForScratch() {
		//scratches are set in contact listener as soon as they happen - gameInfo.scratched has been set to true.
		//trace("checking scratch");
		if (gameInfo.scratched == true) {
			//trace("cue ball in pocket");
			gameInfo.fouled = true;
			gameInfo.foulMessage = "potted the cue ball";
			gameInfo.foulDisplay3 = "POTTEDCUEBALL";

			//note - cueBallInHand is set in applyRulings, although not for practice mode, so do it here
			if (gameInfo.mode == "practice") {
				gameInfo.cueBallInHand = true;
			}
		}
	}

	function checkForMiss() {
		//take a look at the cue ball's contact array, and check that it hit at least one other ball
		var miss = true;
		var ball = gameInfo.ballArray[0];
		for (var n = 0; n < ball.contactArray.length; n++) {
			var contact = ball.contactArray[n];
			if (contact.collisionType == "ball") {
				miss = false;
				break;
			}
		}

		if (miss == true) {
			gameInfo.foulMessage = "missed the balls";
			gameInfo.fouled = true;
			gameInfo.foulDisplay1 = "MISS";

			var targetType;
			if (gameInfo.turn == "p2") {
				targetType = gameInfo.p2TargetType;
			} else {
				targetType = gameInfo.p1TargetType;
			}

			gameInfo.foulDisplay2 = targetType;
		}
	}

	function checkPots() {
		//trace("checking for pots");

		//the only possibility of a foul is if the 8 ball is potted illegally.
		//if the 8 ball is potted legally, the game is won
		//if a ball of targetType is potted, the players turn is extended, otherwise the turn is ended
		//if the targetType is "ANY" and one or more balls are potted of the same type, and it's not the break off shot, the targetTypes for both players can be set

		//cycle through each ball (except cue ball, we have already checked that for scratched) to see if it has been potted.

		var firstType;
		var nextType;
		gameInfo.ballsPottedSameType = true;

		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n];
			//trace(ball);
			for (var c = 0; c < ball.contactArray.length; c++) {
				var contact = ball.contactArray[c];
				//trace(contact.type);
				if (contact.type == "pocket") {
					//ball was potted
					if (gameInfo.trial == false) {
						//trace("ball potted")
					}

					gameInfo.ballsPotted++;

					var targetType;
					if (gameInfo.turn == "p2") {
						targetType = gameInfo.p2TargetType;
					} else {
						targetType = gameInfo.p1TargetType;
					}

					//firstly check if 8 ball was potted
					if (ball.id == 8 && gameInfo.mode != "practice") {
						if (targetType == "8 BALL") {
							//8 ball was the target, and was potted - so game is won
							//console.log("game won");

							if (gameInfo.trial == true) {
								gameInfo.shotRating = 1;
							} else {
								gameInfo.gameOver = true;
								gameInfo.winner = gameInfo.turn;
							}
						}
						if (targetType != "8 BALL" || gameInfo.fouled == true) {
							//8 ball was illegally potted - game is lost

							if (gameInfo.trial == true) {
								gameInfo.shotRating = -1.5;
							} else {
								gameInfo.gameOver = true;
								//console.log("game lost");

								gameInfo.foulDisplay3 = "POTTED8BALL";

								if (gameInfo.turn == "p2") {
									gameInfo.winner = "p1";
								} else {
									gameInfo.winner = "p2";
								}
							}
						}
					}

					if (gameInfo.fouled == false && ball.id != 8) {
						//check whether all balls potted were of same type - this is used in setNextTargetType
						if (gameInfo.ballsPotted == 1) {
							//this is the first ball potted - store its type
							if (ball.id > 8) {
								firstType = "STRIPES";
							}
							if (ball.id < 8) {
								firstType = "SOLIDS";
							}
							gameInfo.typesPotted = firstType;
						}

						if (gameInfo.ballsPotted > 1) {
							if (ball.id > 8) {
								nextType = "STRIPES";
							}
							if (ball.id < 8) {
								nextType = "SOLIDS";
							}

							if (nextType != firstType) {
								gameInfo.ballsPottedSameType = false;
								gameInfo.typesPotted = "";
							}
						}

						if (
							(targetType == "STRIPES" && ball.id > 8) ||
							(targetType == "SOLIDS" && ball.id < 8) ||
							(targetType == "ANY" && ball.id != 8)
						) {
							//9 to 15 are the stripes, 1 to 7 are solids. 8 is the id of the 8 ball
							//player potted correct ball.  Doesn't matter what else happens or when - the turn is extended

							if (gameInfo.trial == true) {
								gameInfo.shotRating += 0.1;
							}
							if (gameInfo.trial == false) {
								gameInfo.turnExtended = true;
								//trace("turn extended");
							}
						}
					}
				}
			}
		}
		if (gameInfo.ballsPotted == 0 && gameInfo.trial == false) {
			gameInfo.ballsPottedSameType = false;
			gameInfo.typesPotted = "";
		}
	}

	function setNextTargetType() {
		//if the table is still open, check whether a group of balls has been determined
		//trace ("set next target type?");

		var targetType;
		if (gameInfo.turn == "p2") {
			targetType = gameInfo.p2TargetType;
		} else {
			targetType = gameInfo.p1TargetType;
		}

		if (
			targetType == "ANY" &&
			gameInfo.shotNum > 1 &&
			gameInfo.ballsPottedSameType == true &&
			gameInfo.ballsPotted > 0 &&
			gameInfo.fouled == false
		) {
			//added fouled == false on off chance that a ball was potted and the cue ball also went in, in which case all other conditions above are met, and this probably caused the bug where p1 target was set as ""
			//can't determine group on the break off shot
			//all balls potted must be of same type for group to be determined - this is set above in checkPots()

			//trace ("setting next target type");

			if (gameInfo.turn == "p2") {
				gameInfo.p2TargetType = gameInfo.typesPotted;
				if (gameInfo.p2TargetType == "STRIPES") {
					gameInfo.p1TargetType = "SOLIDS";

					//gameInfo.rackSolids.x = Project.game.width / 4;
					//gameInfo.rackStripes.x = 3 * Project.game.width / 4;
				} else {
					gameInfo.p1TargetType = "STRIPES";
				}
			} else {
				gameInfo.p1TargetType = gameInfo.typesPotted;
				if (gameInfo.p1TargetType == "STRIPES") {
					gameInfo.p2TargetType = "SOLIDS";
				} else {
					gameInfo.p2TargetType = "STRIPES";
				}
			}

			/*
			set gui ball racks into right positions and make all balls visible - need to consider 
			resizing will change these positions!!
			*/
			if (gameInfo.p1TargetType == "SOLIDS") {
				gameInfo.p1Rack = "solids";
				gameInfo.p2Rack = "stripes";

				Project.APP.game.els.hud.find(`.player.left .ball-slots li`)
						.map((el, index) => $(el).data({ id: `b${index + 1}` }));
				Project.APP.game.els.hud.find(`.player.right .ball-slots li`)
						.map((el, index) => $(el).data({ id: `b${index + 9}` }));
			}

			if (gameInfo.p1TargetType == "STRIPES") {
				gameInfo.p2Rack = "solids";
				gameInfo.p1Rack = "stripes";

				Project.APP.game.els.hud.find(`.player.left .ball-slots li`)
						.map((el, index) => $(el).data({ id: `b${index + 9}` }));
				Project.APP.game.els.hud.find(`.player.right .ball-slots li`)
						.map((el, index) => $(el).data({ id: `b${index + 1}` }));
			}
			// console.log(`P1 is ${gameInfo.p1Rack}`);

			//show all balls
			console.log("show all balls");
			// for (var n = 0; n < 7; n++) {
			// 	gameInfo.rackSolidsArray[n].visible = true;
			// 	gameInfo.rackStripesArray[n].visible = true;
			// }
		}

		//check if 8 ball is the target.  This happens if there are none of the current target balls left.  Usually this will mean there are no stripes or solids left, but it's possible for the table to remain open right up until the 8 ball is on, so the previous target could theoretically be "ANY"

		//on rare occassions, it's conceivable that at the end of a turn, his opponent's target is set as the 8 ball at that time - this would happen if for example a player sinks his opponents last ball (legally or illegally).  For this reason, don't just check for the player whos turn it is, check for both

		var stripesRemaining = 0;
		var solidsRemaining = 0;
		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n];
			if (ball.active == true) {
				if (ball.id < 8) {
					solidsRemaining++;
				}
				if (ball.id > 8) {
					stripesRemaining++;
				}
			}
		}

		//p2 first
		if (gameInfo.p2TargetType == "STRIPES" || gameInfo.p2TargetType == "ANY") {
			if (stripesRemaining == 0) {
				gameInfo.p2TargetType = "8 BALL";

				//trace("stripes remaining = 0");
			}
		}
		if (gameInfo.p2TargetType == "SOLIDS" || gameInfo.p2TargetType == "ANY") {
			if (solidsRemaining == 0) {
				gameInfo.p2TargetType = "8 BALL";
				//trace("solids remaining = 0");
			}
		}
		//and then player 1
		if (gameInfo.p1TargetType == "STRIPES" || gameInfo.p1TargetType == "ANY") {
			if (stripesRemaining == 0) {
				gameInfo.p1TargetType = "8 BALL";
				//trace("stripes remaining = 0");
			}
		}
		if (gameInfo.p1TargetType == "SOLIDS" || gameInfo.p1TargetType == "ANY") {
			if (solidsRemaining == 0) {
				gameInfo.p1TargetType = "8 BALL";
				//trace("solids remaining = 0");
			}
		}

		updateRacks();
	}

	function updateRacks() {
		var gameInfo = playState.gameInfo;

		for (var n = 0; n < gameInfo.pottedBallArray.length; n++) {
			var id = gameInfo.pottedBallArray[n];
			Project.APP.game.els.hud.find(`.ball-slots li[data-id="b${id}"]`).addClass("potted");
			// gameInfo.rackSpotNumberArray[id].visible = false;
		}

		if (gameInfo.p1TargetType == "8 BALL") {
			let bSlot = Project.APP.game.els.hud.find(`.player.left .ball-slots li:nth-child(1)`);
			bSlot.removeClass("potted");
			bSlot.data({ id: "b8" });
		}

		if (gameInfo.p2TargetType == "8 BALL") {
			let bSlot = Project.APP.game.els.hud.find(`.player.right .ball-slots li:nth-child(1)`);
			bSlot.removeClass("potted");
			bSlot.data({ id: "b8" });
		}
	}

	function checkWhosTurn() {
		//trace("should we switch turns?");

		if (gameInfo.turnExtended == false || gameInfo.fouled == true) {
			/**/
			if (gameInfo.turn == "p2") {
				gameInfo.turn = "p1";
				// gameInfo.turnArrow1.frame = 1;
				// gameInfo.turnArrow2.frame = 0;
			} else {
				gameInfo.turn = "p2";
				// gameInfo.turnArrow1.frame = 0;
				// gameInfo.turnArrow2.frame = 1;
			}
			
			Project.APP.game.els.hud.find(".spin-setter").toggleClass("disabled", gameInfo.turn === "p1");
			Project.APP.game.els.hud.data({ turn: gameInfo.turn });

			//console.log("switching turns");

			//turns have now been switched
			/*
			gameInfo.rackStripes.tint = 1;
			gameInfo.rackSolids.tint = 1;

			if (gameInfo.p1Rack == "solids" && gameInfo.turn == "p1") {
				gameInfo.rackStripes.tint = 0;
			}
			if (gameInfo.p1Rack == "stripes" && gameInfo.turn == "p1") {
				gameInfo.rackSolids.tint = 0;
			}
			if (gameInfo.p2Rack == "solids" && gameInfo.turn == "p2") {
				gameInfo.rackStripes.tint = 0;
			}
			if (gameInfo.p2Rack == "stripes" && gameInfo.turn == "p2") {
				gameInfo.rackSolids.tint = 0;
			}
			*/
		}
	}

	function resetVars() {
		gameInfo.cueSet = false;
		gameInfo.lockAim = false;
		gameInfo.executeStrike = false;
		gameInfo.settingPower = false;
		gameInfo.beginStrike = false;
		gameInfo.cueTweenComplete = false;
		if (gameInfo.ballPotted == false || gameInfo.fouled == true) {
			gameInfo.multiplier = 1;
			// gameInfo.multiplierText.text = "x" + gameInfo.multiplier;
		}
		gameInfo.ballPotted = false;
		gameInfo.fouled = false;
		gameInfo.firstTouch = false;

		gameInfo.rulingsApplied = false;

		//==========================================
		//from bb5
		//==========================================

		gameInfo.ballsPotted = 0;
		gameInfo.turnExtended = false;
		gameInfo.ballsPottedSameType = false;
		gameInfo.typesPotted = "";
		gameInfo.scratched = false;
		gameInfo.settingPower = false;

		if (gameInfo.trial == false) {
			//this is the end of an actual shot
			gameInfo.foundCalculatedShots = false;
			gameInfo.foundRandomShots = false;
		}

		//reset variables at the beginning of each shot
		for (var b = 0; b < gameInfo.ballArray.length; b++) {
			gameInfo.ballArray[b].lastCollisionObject = null;
			gameInfo.ballArray[b].firstContact = false;
			gameInfo.ballArray[b].contactArray = new Array();
		}

		//mouseOverStrike = false;
		//preventAim = false;

		if (gameInfo.turn == "p1" || Project.mode == 2) {
			//player's turn is next (we always come through here after who's turn has been decided).

			gameInfo.ballArray[0].mc.visible = true;

			if (gameInfo.cueBallInHand == true) {
				gameInfo.ballArray[0].active = true;

				gameInfo.ballArray[0].shadow.visible = true;
				gameInfo.ballArray[0].mc.visible = true;

				renderScreen();
			}

			//show target balls
			// if (gameInfo.shotNum > 0 && gameInfo.rerack == false) {
			// 	for (var n = 1; n < gameInfo.ballArray.length; n++) {
			// 		var ball = gameInfo.ballArray[n];
			// 		if (ball.active == true) {
			// 			if (gameInfo.turn == "p1") {
			// 				if (
			// 					ball.targetType == gameInfo.p1TargetType ||
			// 					(gameInfo.p1TargetType == "ANY" && ball.targetType != "8 BALL")
			// 				) {
			// 					ball.marker.visible = true;
			// 					ball.marker.alpha = 0;

			// 					ball.marker.x = ball.mc.x;
			// 					ball.marker.y = ball.mc.y;
			// 				} else {
			// 					//console.log("p1 target type: " + gameInfo.p1TargetType);
			// 				}
			// 			} else {
			// 				if (
			// 					ball.targetType == gameInfo.p2TargetType ||
			// 					(gameInfo.p2TargetType == "ANY" && ball.targetType != "8 BALL")
			// 				) {
			// 					ball.marker.visible = true;
			// 					ball.marker.alpha = 0;

			// 					ball.marker.x = ball.mc.x;
			// 					ball.marker.y = ball.mc.y;
			// 				} else {
			// 					//console.log("p2 target type: " + gameInfo.p2TargetType);
			// 				}
			// 			}
			// 		}
			// 	}

			// 	playMarkerAnims();
			// }
		} else {
			if (gameInfo.cueBallInHand == true) {
				gameInfo.ballArray[0].active = true;
				gameInfo.ballArray[0].shadow.visible = true;
				gameInfo.ballArray[0].mc.visible = true;
			}
		}

		// if (gameInfo.turn == "p2" && Project.mode == 1) {
		// 	//make sure all markers are hidden if it's not the player's turn next
		// 	for (var n = 1; n < gameInfo.ballArray.length; n++) {
		// 		var ball = gameInfo.ballArray[n];
		// 		//ball.marker.animations.stop(null, true);
		// 		ball.marker.visible = false;
		// 		ball.marker.x = ball.mc.x;
		// 		ball.marker.y = ball.mc.y;
		// 	}
		// }

		//ai's turn next
		if (gameInfo.turn == "p2" && Project.mode == 1) {
			gameInfo.power = 4000;

			if (gameInfo.cueBallInHand == false) {
				//gameInfo.cueCanvas.visible = true;
			}
		}
		if (gameInfo.turn == "p1" || Project.mode == 2) {
			if (Project.game.device.touch && gameInfo.cueBallInHand == false) {
				updateCue();
				var ang = Maths.findBearing(
					-gameInfo.cueCanvas.x,
					-gameInfo.cueCanvas.y
				);

				gameInfo.cueCanvas.angle = ang;
				gameInfo.drawGuide = true;
				var compX = Math.cos((gameInfo.cueCanvas.angle * Math.PI) / 180);
				var compY = Math.sin((gameInfo.cueCanvas.angle * Math.PI) / 180);
				gameInfo.aimDirectionVector = new Vector2D(compX, compY).normalize();

				updateAimingGuide();
			}
		}

		if (gameInfo.rerack == false) {
			gameInfo.shotReset = true;
		}

		gameInfo.ballArray[0].spin = 0;
		gameInfo.ballArray[0].english = 0;

		gameInfo.foulDisplay1 = "NONE";
		gameInfo.foulDisplay2 = "NONE";
		gameInfo.foulDisplay3 = "NONE";
		gameInfo.foulDisplay4 = "NONE";

		gameInfo.placedInCenter = false;

		//console.log("finished resetVars");

		//after placeCueBall, these should be reset but in some cases are not - ie if mouse over mover whilst setting power.
		gameInfo.preventAim = false;
		gameInfo.preventSetPower = false;
		//gameInfo.cueCanvas.visible = true;
		//gameInfo.guideCanvas.visible = true;
		gameInfo.preventUpdateCue = false;
		gameInfo.drawGuide = true;

		gameInfo.moverMouseDown = false;

		Project.APP.game.els.hud.data({ turn: gameInfo.turn });
	}

	function aiPlaceCueBall() {
		//trace("ai placing ball");

		//note shot num starts at 0 and is only increased when a player strikes the ball.  So shot num BEFORE the shot is played (eg. in placement) is not the same as the shot num AFTER it is played (eg in rulings).

		if (gameInfo.shotNum == 0 && gameInfo.shotRunning == false) {
			//break off shot - allow random placement behind line.

			gameInfo.ballArray[0].position.x = -15000 * gameInfo.adjustmentScale;
			var polarity;
			if (Math.random() > 0.5) {
				polarity = 1;
			} else {
				polarity = -1;
			}

			gameInfo.ballArray[0].position.y =
				Math.random() *
				(15000 * gameInfo.adjustmentScale - gameInfo.ballRadius) *
				polarity;

			gameInfo.cueCanvas.x =
				gameInfo.gameCanvas.x +
				gameInfo.ballArray[0].position.x * gameInfo.physScale;
			gameInfo.cueCanvas.y =
				gameInfo.gameCanvas.y +
				gameInfo.ballArray[0].position.y * gameInfo.physScale;

			renderScreen();
		}

		if (
			gameInfo.shotNum > 0 &&
			gameInfo.shotRunning == false &&
			gameInfo.cueBallInHand == true
		) {
			//find best place on table for cue ball.
			//trace("finding best place");

			//if not break off shot, cue ball may have been been potted and hidden, so make visible and place in centre
			var cueBall = gameInfo.ballArray[0];
			if (gameInfo.shotNum > 0 && cueBall.mc.visible == false) {
				cueBall.mc.visible = true;
				cueBall.shadow.visible = true;
				cueBall.active = true;
			}

			//start with locating target balls
			var targetBallArray = new Array();

			for (var n = 1; n < gameInfo.ballArray.length; n++) {
				var ball = gameInfo.ballArray[n];
				if (ball.active == true) {
					if (
						ball.targetType == gameInfo.p2TargetType ||
						(gameInfo.p2TargetType == "ANY" && ball.targetType != "8 BALL")
					) {
						targetBallArray.push(ball);
					}
				}
			}
			//trace("found " + targetBallArray.length + " target balls");

			//now find out which of the target balls have a clear path to pocket
			var pathClearArray = new Array();
			for (var n2 = 0; n2 < targetBallArray.length; n2++) {
				var ball2 = targetBallArray[n2];
				for (var p = 0; p < 6; p++) {
					var pocket = gameInfo.pocketArray[p];
					if (checkPathClear(ball2, pocket) == true) {
						//store this ball and pocket combination as an object in an array
						var ballToPocket = new Object();
						ballToPocket.ball = ball;
						ballToPocket.pocket = pocket;
						pathClearArray.push(ballToPocket);
					}
				}
			}

			//now, if there are any balls which have clear paths to pocket, try to find a position for the cue ball which is on the other side of the ball and not intersected by any other balls.  Try various positions with random elements and keep iterating until a suitable position is found.

			var success = false;
			if (pathClearArray.length > 0) {
				//trace("found " + pathClearArray.length + " clear paths");
				for (var n3 = 0; n3 < pathClearArray.length; n3++) {
					var ball3 = pathClearArray[n3].ball;
					var pocket3 = pathClearArray[n3].pocket;

					var pocketToBallVector = new Vector2D(
						pocket3.position,
						ball3.position
					);
					var unitVector = pocketToBallVector.normalize();
					var testPosition = ball3.position.plus(unitVector.times(4000));

					//see if this is on the table
					if (
						testPosition.x >
							gameInfo.adjustmentScale * -30000 + gameInfo.ballRadius &&
						testPosition.x <
							gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius &&
						testPosition.y >
							gameInfo.adjustmentScale * -15000 + gameInfo.ballRadius &&
						testPosition.y <
							gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius
					) {
						//see if the path from the test position to the ball is clear
						var testObject = new Object();
						testObject.position = testPosition;
						if (
							checkPathClear(testObject, ball3) == true &&
							checkPositionOverlapping(testPosition.x, testPosition.y) == false
						) {
							success = true;
							gameInfo.cueBallInHand = false;
							gameInfo.ballArray[0].position.x = testPosition.x;
							gameInfo.ballArray[0].position.y = testPosition.y;
							//trace("found placement in line");
							renderScreen();
							break;
						}
					} else {
						//trace("placement not on table");
					}
				}
			}

			//the above didn't give any good placements - try some random ones instead and just check the space isn't occupied by another ball
			if (success == false) {
				var i = 0;
				do {
					i++;

					var randomX = Math.random() * 50000 - 25000;
					var randomY = Math.random() * 20000 - 10000;

					//check contact with other balls
					if (checkPositionOverlapping(randomX, randomY) == false) {
						success = true;
						gameInfo.cueBallInHand = false;
						gameInfo.ballArray[0].position.x = randomX;
						gameInfo.ballArray[0].position.y = randomY;
						//trace("found random placement");
						renderScreen();
						break;
					}
				} while (i < 500 && success == false);
			}

			if (success == false) {
				//still no placement found.  Just slap it in the middle and hope for the best
				gameInfo.cueBallInHand = false;
				gameInfo.ballArray[0].position.x = 0;
				gameInfo.ballArray[0].position.y = 0;
				//trace("Found no placement.  Bollocks.");
			}

			gameInfo.cueCanvas.x =
				gameInfo.gameCanvas.x +
				gameInfo.ballArray[0].position.x * gameInfo.physScale;
			gameInfo.cueCanvas.y =
				gameInfo.gameCanvas.y +
				gameInfo.ballArray[0].position.y * gameInfo.physScale;
		}
	}

	function checkPositionOverlapping(_x, _y) {
		var overlapping = false;

		//check for this position overlapping all balls except cue ball

		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n];
			if (ball.active == true) {
				var distSq =
					(ball.position.x - _x) * (ball.position.x - _x) +
					(ball.position.y - _y) * (ball.position.y - _y);
				if (distSq < gameInfo.ballRadius * 2 * gameInfo.ballRadius * 2 + 10) {
					overlapping = true;
					break;
				}
			}
		}

		return overlapping;
	}

	function checkPositionOverlapping2(_x, _y) {
		var overlapping = false;
		//check for this position overlapping all balls except cue ball
		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n];
			if (ball.active == true) {
				var distSq =
					(ball.position.x - _x) * (ball.position.x - _x) +
					(ball.position.y - _y) * (ball.position.y - _y);
				if (distSq < gameInfo.ballRadius * 2 * gameInfo.ballRadius * 2 - 10) {
					overlapping = true;
					break;
				}
			}
		}

		return overlapping;
	}

	function checkPathClear(object1, object2) {
		//checks the path is clear between the two objects, assuming all objects are of radius gameInfo.ballRadius
		var clear = true;
		var A = new Point(object1.position.x, object1.position.y); //position of object1
		var B = new Point(object2.position.x, object2.position.y); //position of object2
		var r = 2 * gameInfo.ballRadius; //doubling the ball radius has the effect of testing a line of thickness = gameInfo.ballRadius

		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n]; //test for all active balls (not including the cue ball or any ball which might be object1 or object2) for intersection with this line
			if (ball.active == true && ball != object1 && ball != object2) {
				var C = new Point(ball.position.x, ball.position.y);
				var intersection = Maths.lineIntersectCircle(A, B, C, r);
				if (intersection.intersects == true && intersection.tangent == false) {
					clear = false;
					break;
				}
			}
		}

		return clear;
	}

	function checkPathBetweenPointsClear(A, B) {
		//checks the path is clear of balls between the two points, not counting intersections with the cue ball
		var clear = true;
		var r = 2 * gameInfo.ballRadius; //doubling the ball radius has the effect of testing a line of thickness = gameInfo.ballRadius
		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n]; //test for all active balls (not including the cue ball for intersection with this line
			if (ball.active == true) {
				var C = new Point(ball.position.x, ball.position.y);
				var intersection = Maths.lineIntersectCircle(A, B, C, r);
				if (intersection.intersects == true && intersection.tangent == false) {
					clear = false;
					break;
				}
			}
		}

		return clear;
	}

	function aiFindCalculatedShots() {
		if (gameInfo.foundCalculatedShots == false) {
			//ensure we come through here just once before each AI shot.
			gameInfo.foundCalculatedShots = true; //even if it doesn't actually find any actual valid shots, set this to true to prevent coming here more than once.
			//this is reset in resetShotVars only if gameInfo.trial == false

			gameInfo.shotInfo = new Object();

			if (gameInfo.shotNum > 0) {
				//gui.thinking.visible = true;
				//gui.thinking.dots.gotoAndPlay(1);
				//console.log("thinking")
				gameInfo.trial = true;
				gameInfo.shotRating = 0;
				gameInfo.testNumber = 0;

				//store positions of all balls, try out some shots, but don't render the results.  Store the details of the best shot, reset the balls and play that shot.

				//store ball positions
				gameInfo.storeBallArray = new Array();

				for (var n = 0; n < gameInfo.ballArray.length; n++) {
					var ball = gameInfo.ballArray[n];
					var storeBall = new Object(); // new object created to prevent shallow copying
					storeBall.position = ball.position;
					storeBall.active = ball.active;
					gameInfo.storeBallArray.push(storeBall);
				}

				//bestShot stores the highest value of gameInfo.shotRating.  Each trial shot is given a rating in applyRulings - +0.1 for each correct ball potted, 1 for legally potting the 8 ball, and -1 for fouling.  Then we can pick the best at the end
				gameInfo.bestShot = -2; //this effectively means that even a foul shot (rating = -1) is better than finding no shot at all.

				//come up with some calculated angles to try first.  Test those out, then try some random ones too.  Score each trial shot and pick the best.

				var ghostArray = findGhosts();
				//console.log("found " + ghostArray.length + " ghosts");

				//test for ghost which have a clear cueball to ghost path and ball to pocket path

				gameInfo.shotTrialArray = new Array();
				for (var g = 0; g < ghostArray.length; g++) {
					var ghostObj = ghostArray[g];
					if (
						checkPathClear(gameInfo.ballArray[0], ghostObj) == true &&
						checkPathClear(ghostObj.ball, ghostObj.pocket) == true
					) {
						//also check that the angle of contact isn't too oblique.  0-75 degrees should be about the limit.
						//measure angle by getting the difference in bearings between ghost to cue ball, and ghost to target ball.  When the shot is straight, this will be 180 degrees or -180 degrees.  So we want the angle to always be > 105 or < -105 degrees.
						//var bearingGhostToCueBall = Maths.findBearing(gameInfo.ballArray[0].x - ghost.position.x, gameInfo.ballArray[0].y - ghost.position.y);
						//var bearingGhostToTargetBall = Maths.findBearing(ghost.ball.position.x - ghost.position.x, ghost.ball.position.y - ghost.position.y);
						//var diff = Maths.angleDiff(bearingGhostToCueBall, bearingGhostToTargetBall);
						//trace("found shot with angle = " + diff);
						//if (diff > 105 || diff < -105) {
						//ghost.shotAngle = diff;
						//}

						var trialPower = 500 + Math.random() * 1500;
						var cueBallToGhost = new Vector2D(
							ghostObj.position.x - gameInfo.ballArray[0].position.x,
							ghostObj.position.y - gameInfo.ballArray[0].position.y
						);
						var aimVectorUnit = cueBallToGhost.normalize();
						var aimVector = aimVectorUnit.times(trialPower);

						gameInfo.shotTrialArray.push(aimVector);
					}
				}

				//if no direct viable shots are found yet, try some kicks and banks
				//kick shots - cue ball hits cushion on it's way to ghost.

				if (gameInfo.shotTrialArray.length == 0) {
					for (var g = 0; g < ghostArray.length; g++) {
						var ghostObj = ghostArray[g];
						if (checkPathClear(ghostObj.ball, ghostObj.pocket) == true) {
							//path from ball to pocket is clear.  See if we can find a path from cue ball to ghost off a cushion
							for (var c = 0; c < 3; c++) {
								//we know the cue ball position and the ghost position.  We can reflect both these balls to form a 'virtual' point off the table.  The direction to aim is towards the virtual ghost.  And we need to check the two paths are clear - cue ball to virtual ghost, and virtual cue ball to ghost.  The reflection point is actually 1 ball radius infront of the cushion.

								var cueBall = new Point(
									gameInfo.ballArray[0].position.x,
									gameInfo.ballArray[0].position.y
								);
								var ghost = new Point(ghostObj.position.x, ghostObj.position.y);
								var virtualGhost;
								var virtualCueBall;

								var width =
									gameInfo.adjustmentScale * 30000 - gameInfo.ballRadius;
								var height =
									gameInfo.adjustmentScale * 15000 - gameInfo.ballRadius;
								switch (c) {
									case 0:
										//right hand cushion
										virtualGhost = new Point(2 * width - ghost.x, ghost.y);
										virtualCueBall = new Point(
											2 * width - cueBall.x,
											cueBall.y
										);
										break;

									case 1:
										//left hand cushion
										virtualGhost = new Point(-2 * width - ghost.x, ghost.y);
										virtualCueBall = new Point(
											-2 * width - cueBall.x,
											cueBall.y
										);
										break;

									case 2:
										//bottom cushion
										virtualGhost = new Point(ghost.x, 2 * height - ghost.y);
										virtualCueBall = new Point(
											cueBall.x,
											2 * height - cueBall.y
										);
										break;

									case 3:
										//top cushion
										virtualGhost = new Point(ghost.x, -2 * height - ghost.y);
										virtualCueBall = new Point(
											cueBall.x,
											-2 * height - cueBall.y
										);
										break;
								}

								//check path from cueball to virtual ghost and virtual cue ball to ghost are both clear
								if (
									checkPathBetweenPointsClear(cueBall, virtualGhost) == true &&
									checkPathBetweenPointsClear(virtualCueBall, ghost) == true
								) {
									//both paths to and from the cushion are clear - store the vector from cue ball to virtual ghost as a viable shot
									var trialPower = 500 + Math.random() * 1500;
									var cueBallToVirtualGhost = new Vector2D(
										virtualGhost.x - cueBall.x,
										virtualGhost.y - cueBall.y
									);
									var aimVectorUnit = cueBallToVirtualGhost.normalize();
									var aimVector = aimVectorUnit.times(trialPower);
									gameInfo.shotTrialArray.push(aimVector);
									gameInfo.shotInfo.bankShot = true;
								}
							}
						}
					}
				}

				//console.log("found " + gameInfo.shotTrialArray.length + " viable shots");
				if (gameInfo.shotInfo.bankShot == true) {
					//console.log("(Bank shots)");
				}

				if (gameInfo.shotTrialArray.length == 0) {
					gameInfo.shotInfo.calculated = false;
					aiFindRandomShots();
				} else {
					gameInfo.shotInfo.calculated = true;
				}
			}
		}
	}

	function aiFindRandomShots() {
		//we come here just once, only if no calculated shots were found, OR if all the calculated shots were trialled and still gave a best shot of 0
		//so - two different entry points into this function, but still only want one execution ... so call this from those two places rather than from the main loop.
		//console.log("testing random shots");

		if (gameInfo.foundRandomShots == false) {
			gameInfo.foundRandomShots = true;

			gameInfo.testNumber = 0;
			gameInfo.shotTrialArray = new Array(); //we're clearing any calculated contents, because they were no good.
			gameInfo.bestShot = -2; //set this to -2 again so that if the best we can find is a -1 or a 0, it will still find something

			var iterations = Math.round(Project.aiRating * 10); //this will test between 8 and 48 shots depending on rating

			for (var i = 0; i < iterations; i++) {
				var rotation = Math.random() * 360;
				var compX = Math.cos((rotation * Math.PI) / 180);
				var compY = Math.sin((rotation * Math.PI) / 180);
				var aimVectorUnit = new Vector2D(compX, compY).normalize();
				var trialPower = 500 + Math.random() * 1500;
				var aimVector = aimVectorUnit.times(trialPower);

				gameInfo.shotTrialArray.push(aimVector);
			}
			//console.log("found " + iterations + " random shots");
		}
	}

	function aiTestShot() {
		//come through here each loop if gameInfo.shotsToTest > 0, and assuming we haven't already found the perfect shot (rating == 1, potting 8 ball legally)
		//if break off shot, trial is false so we don't do this

		if (gameInfo.trial == true) {
			//console.log("aiTestShot. Trial: " + gameInfo.trial + ". test number: " + gameInfo.testNumber + ". Trial array length: " + gameInfo.shotTrialArray.length);

			if (gameInfo.testNumber < gameInfo.shotTrialArray.length) {
				gameInfo.shotRating = 0;
				//trace("testing shot number " + gameInfo.testNumber + ". Calculated = " + gameInfo.shotInfo.calculated);

				var aimVector = gameInfo.shotTrialArray[gameInfo.testNumber];
				strikeBallAI(aimVector.x, aimVector.y, 0, 0);
				//console.log("testing shot");

				do {
					gameInfo.phys.updatePhysics();
					checkShotOver();
				} while (gameInfo.shotRunning == true);

				applyRulings();

				//evaluate the shot rating, and if it's the best one so far, store it
				//trace("rating = " + gameInfo.shotRating);

				if (gameInfo.shotRating > gameInfo.bestShot) {
					gameInfo.bestShot = gameInfo.shotRating;
					gameInfo.shotInfo.aimVector = aimVector;

					//shotInfo.ghostPosition = pathClearArray[i].position; //debug info
					//shotInfo.shotAngle = pathClearArray[i].shotAngle; //debug info
					//store spin and english too

					//console.log("best rating: " + gameInfo.bestShot);
				}

				//reset the balls and shot number
				restorePositions(gameInfo.storeBallArray);
				gameInfo.testNumber++;

				//check to see if all of the above trials have been completed, and if they have, and if they were calculated, check if the best shot rating is above 0.  If it isn't then we need to add some random shots to the trial

				if (
					gameInfo.shotInfo.calculated &&
					gameInfo.testNumber >= gameInfo.shotTrialArray.length &&
					gameInfo.bestShot <= 0
				) {
					//trails were calculated, all of them completed, and no shot over 0 was found
					gameInfo.shotInfo.calculated = false;
					aiFindRandomShots();
				}

				if (
					gameInfo.testNumber >= gameInfo.shotTrialArray.length ||
					gameInfo.shotRating == 1
				) {
					//we've tested all of the trial shots (or we've found a legal black ball pot) - time to play the best one
					//note - testNumber has been reset to zero in findRandomShots, so those will get tested too before coming here
					//console.log("play shot");
					aiPlayShot();
				}
			}

			//console.log("test shot complete");
		}
	}

	function aiPlayBreakShot() {
		if (gameInfo.shotNum == 0) {
			gameInfo.shotReset = false; //actually set when ball is struck, but in this case set it early to allow a delay before striking, and not have this function repeated

			var rotation =
				Math.random() * 2 -
				1 +
				Maths.findBearing(
					gameInfo.ballArray[1].position.x - gameInfo.ballArray[0].position.x,
					gameInfo.ballArray[1].position.y - gameInfo.ballArray[0].position.y
				);
			var compX = Math.cos((rotation * Math.PI) / 180);
			var compY = Math.sin((rotation * Math.PI) / 180);
			var aimVectorUnit = new Vector2D(compX, compY).normalize();
			var trialPower = 4000 + Math.random() * 500;

			gameInfo.shotInfo.aimVector = aimVectorUnit.times(trialPower);

			//TweenLite.to(cueCanvas, 1, {rotation: (180 / Math.PI) * Math.atan2(gameInfo.shotInfo.aimVector.y, gameInfo.shotInfo.aimVector.x), ease:Quart.easeInOut } );
			Project.game.add.tween(gameInfo.cueCanvas).to(
				{
					angle:
						(180 / Math.PI) *
						Math.atan2(
							gameInfo.shotInfo.aimVector.y,
							gameInfo.shotInfo.aimVector.x
						),
				},
				1000,
				Phaser.Easing.Linear.easeInOut,
				true
			);

			//setTimeout(strikeBallAI, 2000, gameInfo.shotInfo.aimVector.x, gameInfo.shotInfo.aimVector.y, 0, 0);
			Project.game.time.events.add(
				2000,
				strikeBallAI,
				this,
				gameInfo.shotInfo.aimVector.x,
				gameInfo.shotInfo.aimVector.y,
				0,
				0
			);
		} else {
			//console.log("not break shot");
		}
	}

	function aiPlayShot() {
		//need to come here once - this is the actual shot to be played

		//gui.thinking.visible = false;
		//gui.thinking.dots.stop();
		//console.log("stop thinking")

		gameInfo.trial = false;

		//add inaccuracy depending on rating/randomness
		var inaccuracy = 0; // let the variable take values between 0 and 50

		//likelihood of having any inaccuracy greater with lower ratings
		if (Math.random() * 5 > Project.aiRating) {
			//if player has low rating, eg 1, the random number (0-5) is quite likely to be above this, so there will be innacuracy.  For high rankings, eg 4.8, this is less likely
			inaccuracy = Math.random() * 20 * (5 - Project.aiRating); //rating of 4.8, innacuracy will be between 0 and 20.  rating of 0.8, it will be between 0 and 42
			//trace("added inaccuracy: " + inaccuracy);
		} else {
			inaccuracy = 0;
		}

		//add the innacuracy to the x component of the aim vector

		gameInfo.shotInfo.aimVector = new Vector2D(
			gameInfo.shotInfo.aimVector.x + inaccuracy,
			gameInfo.shotInfo.aimVector.y
		);

		//TweenLite.to(cueCanvas, 1, {rotation: (180 / Math.PI) * Math.atan2(gameInfo.shotInfo.aimVector.y, gameInfo.shotInfo.aimVector.x), onComplete:strike, ease:Quart.easeInOut } );
		var cueCanvasTween = Project.game.add.tween(gameInfo.cueCanvas);
		cueCanvasTween.to(
			{
				angle:
					(180 / Math.PI) *
					Math.atan2(
						gameInfo.shotInfo.aimVector.y,
						gameInfo.shotInfo.aimVector.x
					),
			},
			1000,
			Phaser.Easing.Linear.easeInOut,
			true
		);
		cueCanvasTween.onComplete.add(strike, this);

		function strike() {
			strikeBallAI(
				gameInfo.shotInfo.aimVector.x,
				gameInfo.shotInfo.aimVector.y,
				0,
				0
			);
		}
	}

	function strikeBallAI(vx, vy, s, e) {
		if (gameInfo.turn == "p2") {
			gameInfo.shotNum++;
			gameInfo.shotReset = false;

			gameInfo.rulingsApplied = false;
			gameInfo.shotRunning = true;
			gameInfo.ballArray[0].screw = s;
			gameInfo.ballArray[0].english = e;
			gameInfo.ballArray[0].velocity = new Vector2D(vx, vy);
			gameInfo.ballArray[0].ySpin =
				(-gameInfo.ballArray[0].english *
					gameInfo.ballArray[0].velocity.magnitude) /
				300;
			if (gameInfo.ballArray[0].ySpin > 20) {
				gameInfo.ballArray[0].ySpin = 20;
			}
			if (gameInfo.ballArray[0].ySpin < -20) {
				gameInfo.ballArray[0].ySpin = -20;
			}
			if (gameInfo.trial == false) {
				var volume = gameInfo.ballArray[0].velocity.magnitude / 6000;
				if (volume > 1) {
					volume = 1;
				}
				if (volume < 0.3) {
					volume = 0.3;
				}
				Sound.Play("cueHit", volume);

				//not sure why this was here - wrong angle
				//gameInfo.cueCanvas.rotation = (180 / Math.PI) * Math.atan2(vy, vx);

				//TweenLite.to(cue, 0.5, { x: (power / 600), ease:Quad.easeOut } );
				Project.game.add
					.tween(gameInfo.cue)
					.to(
						{ x: gameInfo.power / 600 },
						500,
						Phaser.Easing.Linear.easeOut,
						true
					);

				var hideCueTween = Project.game.add.tween(gameInfo.cueCanvas);
				hideCueTween.to({ alpha: 0 }, 1000, "Linear", true, 1500);
				hideCueTween.onComplete.add(hideCueCanvas, this);
				gameInfo.cueTweenComplete = false;

				function hideCueCanvas() {
					gameInfo.cueCanvas.visible = false;
					gameInfo.cueCanvas.alpha = 1;
					gameInfo.cueTweenComplete = true;
				}
			}
		}
	}

	function findGhosts() {
		//there are 6 ghost points for each ball - the point in line with the ball and each pocket, touching the ball on the side opposite the pocket
		var ghostArray = new Array();

		for (var n = 1; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n];
			if (ball.active == true) {
				var targetType;
				if (gameInfo.turn == "p2") {
					targetType = gameInfo.p2TargetType;
				} else {
					targetType = gameInfo.p1TargetType;
				}
				if (
					ball.targetType == targetType ||
					(targetType == "ANY" && ball.targetType != "8 BALL")
				) {
					for (var p = 0; p < 6; p++) {
						var pocket = gameInfo.pocketArray[p];
						var ballToPocket = new Vector2D(
							pocket.position.x - ball.position.x,
							pocket.position.y - ball.position.y
						);
						var unitVector = ballToPocket.normalize();
						var ballToGhost = unitVector.times(-gameInfo.ballRadius * 2.01);
						var ghost = new Object();
						//ghost.position = new Point(ball.position.x + ballToGhost.x, ball.position.y + ballToGhost.y);
						ghost.position = ball.position.plus(ballToGhost);
						ghost.ball = ball;
						ghost.pocket = pocket;
						ghostArray.push(ghost);
						//var ghostMarker = new ghostMarker_mc();
						//gameInfo.gameCanvas.addChild(ghostMarker);
						//ghostMarker.x = ghost.position.x * gameInfo.physScale;
						//ghostMarker.y = ghost.position.y * gameInfo.physScale;
					}
				}
			}
		}

		return ghostArray;
	}

	function restorePositions(storeBallArray) {
		//restore ball positions
		//trace("restoring positions");

		for (var n = 0; n < gameInfo.ballArray.length; n++) {
			var ball = gameInfo.ballArray[n];
			ball.position = storeBallArray[n].position;
			ball.active = storeBallArray[n].active;
		}
	}
};
