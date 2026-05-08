
function checkPositionOverlapping(_x, _y, _m=10) {
	var gameInfo = playState.gameInfo;
	var overlapping = false;
	//check for this position overlapping all balls except cue ball
	for (var n = 1; n < gameInfo.ballArray.length; n++) {
		var ball = gameInfo.ballArray[n];
		if (ball.active == true) {
			var distSq =
				(ball.position.x - _x) * (ball.position.x - _x) +
				(ball.position.y - _y) * (ball.position.y - _y);
			if (distSq < gameInfo.ballRadius * 2 * gameInfo.ballRadius * 2 + _m) {
				overlapping = true;
				break;
			}
		}
	}

	return overlapping;
}

function renderScreen() {
	var gameInfo = playState.gameInfo;

	for (var n = 0; n < gameInfo.ballArray.length; n++) {
		var ball = gameInfo.ballArray[n];

		if (ball.active == true) {
			//update ball mc positions
			ball.mc.x = ball.position.x * gameInfo.physScale;
			ball.mc.y = ball.position.y * gameInfo.physScale;

			if (ball.shadow) {
				ball.shadow.x =
					ball.mc.x +
					0.7 *
						gameInfo.ballRadius *
						gameInfo.physScale *
						(ball.mc.x / (300 * 2.4));
				ball.shadow.y =
					ball.mc.y +
					0.7 *
						gameInfo.ballRadius *
						gameInfo.physScale *
						(ball.mc.y / (150 * 2.4));
			}

			if (n == 0) {
				ball.mover.x = ball.mc.x;
				ball.mover.y = ball.mc.y;
			}

			ball.mc.updateRotation(
				ball.velocity.x * gameInfo.physScale * ball.grip,
				ball.velocity.y * gameInfo.physScale * ball.grip,
				ball.ySpin
			);
		}
	}
}
