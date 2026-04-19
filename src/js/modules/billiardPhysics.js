

function billiardPhysics(contactEvent, balls, lines, vertices, pockets, sim) {
	//we could create setters for each of these as they are public variables that get injected into the class, but as each value is simply used 'as is' (ie we don't need a special setter function which modifies the values in any way), we can simply allow these variables to be created dynamically when they are injected from outside the class.
	//these are private vars used only within the function - some of which are passed in as params of the construtor
	this.targetID = -1; //for the presim, where only a single target ball needs to be simulated - set in reslove collision once target assigned, otherwise has value -1 to show it hasn't been assigned.
	this.omissionArray = new Array();
	this.ballArray = balls;
	this.lineArray = lines;
	this.vertexArray = vertices;
	this.pocketArray = pockets;
	this.simType = sim;
	this.simType = 0;
	this.contactEvent = contactEvent;

	//OverwriteManager.init(OverwriteManager.NONE);
}

//setter for resetting ballArray (which includes positions, velocities etc.) if we move the balls between real shots for AI
billiardPhysics.prototype = {
	set ballData(array) {
		this.ballArray = array;
	},
	set frameNumber(value) {
		this.frame = value;
	}
}

billiardPhysics.prototype.updatePhysics = function() {
	this.predictCollisions();
	this.updateFriction();
}

billiardPhysics.prototype.predictCollisions = function() {
	//predict collisions which will occur between now and the next frame, for each ball
	//Any collisions found will have the collision details (ball, target, position, and time) stored in an object 'collision'.  After all possibilities have been checked, the collision (if any) with the foremost time will be resolved (ie. new velocities applied), the ball(s) involved will be moved to the collision positions, and moveballs() will be called for all other balls to move them to their new positions for that time interval. The prediction process will then start again, until no further collisions occur before the next frame. Once no more collisions are predicted, moveBalls() is called for the remainder of the time step to the next frame.
	var time = 0; //0 is the time at the beginning of the frame, 1 is the time at the end
	var sanityCheck = 0;

	do {
		//start new iteration, checking all balls against all targets to check for earliest collision.  Iterations repeated until no collisions found before next frame
		//var collisionDetected:Boolean = false;
		var collisionTime = 1; //max default value, represents an entire frame
		var collision;

		if (collisionArray) {
			if (collisionArray.length > 0) {
				////////console.log("iterating again");
			}
		}

		var collisionArray = new Array();
		var omegaTime = Maths.fixNumber(1 - time); //time between most recent collision and end of frame
		var numBalls = 0;

		if (this.simType == 0) {
			numBalls = this.ballArray.length;
		}
		if (this.simType == 1) {
			numBalls = 1;
		}
		if (this.simType == 2) {
			if (this.targetID == -1) {
				numBalls = 1;
			} else {
				numBalls = this.ballArray.length;
			}
		}

		for (var b = 0; b < numBalls; b ++) {
			var skipBall = false;
			if (this.simType == 2 && this.targetID != -1 && b != this.targetID && b != 0) {
				//in sim2 only, we only need to check for this.targetID against all other balls - will get faster results although less accurate for multiple collisions
				skipBall = true;
			}

			var ball = this.ballArray[b];
			if (ball.active == true && skipBall == false) {
				var nextBallPosition = ball.position.plus(ball.velocity.times(omegaTime)); //position of ball at start of next frame assuming no collisions
				//=============================================================================
				//collisions with balls
				var s;
				if (this.simType == 2) {
					s = 0; //if sim2, we are ommiting most checks, so the rule below to prevent double checks doesn't apply, so we need to check against all other targets except itself
				} else {
					s = b; //sets target t = b otherwise
				}
				for (var t = s; t < this.ballArray.length; t ++) { //t = b prevents double checks like 1:2 and 2:1. t = 0 checks all balls
					var target = this.ballArray[t];

					if (ball.velocity.magnitudeSquared != 0 || target.velocity.magnitudeSquared != 0) { // balls can't collide if neither are moving.  However, keeping this in won't tell us if balls are touching (if that is actually possible - not sure).
						//check for collisions with all other balls except the current object ball
						//first check balls are in proximity of each other to prevent unnecessary checks.  Doesn't apply for sim1 where balls are moving much faster
						var close = true;
						if (this.simType != 1) {
							//if (Math.abs(ball.position.x - target.position.x) < 8000 && Math.abs(ball.position.y - target.position.y) < 8000) {
								//close = true;
							//} else {
								//close = false;
							//}
						}

						if (target != ball && target.active == true && close == true) { //ball cannot collide with itself
							// ball.velocity.magnitude == 0 && target.velocity.magnitude == 0 represents touching balls - still need to consider these
							//NEW - check if balls are closing - if they aren't, they don't need to be resolved
							if (Maths.checkObjectsConverging(ball.position, target.position, ball.velocity, target.velocity)) {

							//if (target != ball.lastCollisionObject || ball != target.lastCollisionObject) {
							//treat target ball as stationary object, and subtract it's velocity vector from object ball to get object's velocity vector in the target's frame of reference
							////////console.log("checking " + ball.id + " on " + target.id);
							var ballReferenceVector = ball.velocity.minus(target.velocity); //ball's velocity vector in targets f.o.r.
							var nextBallReferencePoint = ball.position.plus(ballReferenceVector.times(omegaTime));
							var A = new Point(ball.position.x, ball.position.y); //starting point of object ball
							var B = new Point(nextBallReferencePoint.x, nextBallReferencePoint.y); //point of object ball at next frame
							var C = new Point(target.position.x, target.position.y);
							var r = 2 * this.ballRadius;
							var intersection = Maths.lineIntersectCircle(A, B, C, r);
							/*
							//////console.log("_____________________");
							//////console.log("testing " + ball.id + " on " + target.id);
							//////console.log("inside: " + intersection.inside);
							//////console.log("tangent: " + intersection.tangent);
							//////console.log("intersects: " + intersection.intersects);
							//////console.log("enter: " + intersection.enter);
							//////console.log("exit: " + intersection.exit);
							//////console.log("_____________________");
							if (intersection.inside == true) {
								//////console.log("WTF??");
							}
							*/

							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							//                            NEW! CHECK intersection.inside TOO!
							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

							//after resolving a contact, the balls are placed at the intersection point.  Due to rounding errors, it's possible that this may cause balls which are very tightly packed to overlap very slightly, and this was causing the line-circle intersection detection to not detect collisions.  In these cases, the projected line was totally inside the circle.  Now we deal with those as collisions too, preventing the ball on ball tunnelling.

							if (intersection.intersects == true || intersection.inside == true) {
								//collisionDetected = true;
								var intersectPoint2; //the centre of the object ball, as a Point, at the moment it will make contact with the target.
								if (intersection.exit != null) {
									//console.log("exit");
									intersectPoint2	= intersection.exit;
								}
								if (intersection.enter != null) {
									//console.log("enter");
									intersectPoint2	= intersection.enter;
								}

								var intersectPointAsVector2;
								var intersectTime2;
								if (intersection.intersects == true) {
									intersectPointAsVector2 = new Vector2D(intersectPoint2.x, intersectPoint2.y);
									var vectorAB2 = Maths.createVectorFrom2Points(A, B); //current ball position to ball position at next frame in target's f.o.r.
									var vectorAP2 = Maths.createVectorFrom2Points(A, intersectPoint2); //current ball position to intersect point
									intersectTime2 = Maths.fixNumber(time + (vectorAP2.magnitude / vectorAB2.magnitude) * omegaTime); //time of collision since start of frame.  Value is between 0 and 1, where 0 is the time at the beginning of the frame and 1 is the end of the frame
								}

								if (intersection.inside == true) {
									//the balls must be overlapping (probably only slightly due to rounding errors) at the point the balls are currently positioned (not projected forward to some point over the next frame as the intersection.enter result would show), and we will treat it as a contact right now, with the contact point being where the balls would touch if we moved the ball directly away from the target it is overlapping. The intersection point is the centre of the object ball
									//console.log("overlap");
									var targetToBall = ball.position.minus(target.position).normalize();
									intersectPointAsVector2 = target.position.plus(targetToBall.times(r));
									intersectTime2 = time;
								}
								/*
								//////console.log("_____________________");
								//////console.log(ball.id + " hit " + target.id);
								//////console.log("intersect time = " + intersectTime2);
								//////console.log("collision time = " + collisionTime);
								//////console.log("_____________________");
								*/

								if (intersectTime2 < collisionTime) {
									//temporarily set the collision time and data to this collision.
									collision = new Object();
									collisionTime = intersectTime2;
									collision.type = "ball";
									collision.object = ball;
									collision.time = collisionTime;

									if (intersection.intersects == true) {
										//convert intersect point to observer's frame of reference
										//current ball position (which is either at the start of frame or at the last collision point if it's already been resolved this frame) plus current velocity multiplied by the time between last collision and this one
										collision.objectIntersectPoint = ball.position.plus(ball.velocity.times(collisionTime - time));
										//use same process to calculate target's collision point
										collision.targetIntersectPoint = target.position.plus(target.velocity.times(collisionTime - time));
										//var ballToTargetVector = new Vector2D(target.position.x - ball.position.x, target.position.y - ball.position.y).normalize();
										//collision.targetIntersectPoint = new Vector2D(intersectPoint2.x + (target.position.x - intersectPoint2.x) * r, intersectPoint2.y + (target.position.y - intersectPoint2.y) * r)
									}
									if (intersection.inside == true) {
										collision.objectIntersectPoint = intersectPointAsVector2;
										collision.targetIntersectPoint = target.position;
									}

									collision.target = target;
									collisionArray = new Array(); //clear array - this collision happens earlier than any other
									collisionArray.push(collision);
								} else if (intersectTime2 == collisionTime) {
									if (intersectTime2 != 1) {
										collision = new Object();
										collisionTime = intersectTime2;
										collision.type = "ball";
										collision.object = ball;
										collision.time = collisionTime;

										//convert intersect point to observer's frame of reference
										//original ball position plus original velocity multiplied by the time between last collision and this one
										collision.objectIntersectPoint = ball.position.plus(ball.velocity.times(collisionTime - time));
										collision.target = target;
										//use same process to calculate target's collision point
										collision.targetIntersectPoint = target.position.plus(target.velocity.times(collisionTime - time));

										if (intersection.inside == true) {
											collision.objectIntersectPoint = intersectPointAsVector2;
											collision.targetIntersectPoint = target.position;
										}

										//don't clear array - this is another collision at the same time
										collisionArray.push(collision);
										//console.log("double collision (ball)");
									}
								}
							}
						}
					}
				}
			}

			if (ball.velocity.magnitudeSquared != 0) {
				//============================================================================
				//detect collisions with lines
				//============================================================================
				for (var l = 0; l < this.lineArray.length; l ++) {
					var line = this.lineArray[l];
					//if (lastObjectCollided == ball && lastTargetCollided == line) {
					//if (line != ball.lastCollisionObject) { //not working
					//check if ball is moving towards the line and ball and line are in same sector
						//test intersection between line AB and EF (see diagram in notes)
						//var intersectPoint = Maths.lineIntersectLine(new Point(ball.position.x, ball.position.y), new Point(nextBallPosition.x, nextBallPosition.y), new Point(line.p3.x, line.p3.y), new Point(line.p4.x, line.p4.y));

						//TEST!! Hide above line and instead use Phaser's built in line on line intersection test
						var path = new Phaser.Line(ball.position.x, ball.position.y, nextBallPosition.x, nextBallPosition.y);
						var intersectPoint = path.intersects(new Phaser.Line(line.p3.x, line.p3.y, line.p4.x, line.p4.y));

						//NEW!! if no intersection is found, double check against secondary line, slightly behind the first.
						if (intersectPoint == null) {
							intersectPoint = Maths.lineIntersectLine(new Point(ball.position.x, ball.position.y), new Point(nextBallPosition.x, nextBallPosition.y), new Point(line.p5.x, line.p5.y), new Point(line.p6.x, line.p6.y));
							if (intersectPoint != null) {
								console.log("!!! SAVED BY SECOND LINE  !!! Ball: " + ball.id + ", line: " + line.name + ", Frame: " + this.frame);
								//adjust the intersect point so it is on the first line instead of the second
								var currentPointAsVec = new Vector2D(intersectPoint.x, intersectPoint.y);
								var normalProjection = line.normal.times(this.ballRadius * 0.2);
								var intersectPointAsVec = currentPointAsVec.plus(normalProjection);
								intersectPoint = new Point(intersectPointAsVec.x, intersectPointAsVec.y);
							}
						}

						if (intersectPoint != null) {
							var intersectPointAsVector = new Vector2D(intersectPoint.x, intersectPoint.y);
							//collisionDetected = true;
							//time if intersection is true
							var vectorAB = Maths.createVectorFrom2Points(ball.position, nextBallPosition); //current ball position to ball position at next frame
							var vectorAP = Maths.createVectorFrom2Points(ball.position, intersectPointAsVector); //current ball position to intersect point
							var intersectTime = Maths.fixNumber(time + (vectorAP.magnitude / vectorAB.magnitude) * omegaTime);
							//trace("time: " + time);
							//trace("intersectTime: " + intersectTime);
							//trace("collisionTime: " + collisionTime);

							if (intersectTime < collisionTime) {
								//trace("line");
								//trace("it: " + intersectTime);
								//temporarily set the collision time and data to this collision.  This will be overriden if an earlier collision time is found on this iteration
								collision = new Object();
								collisionTime = intersectTime;
								collision.type = "line";
								collision.time = collisionTime;
								collision.object = ball;
								collision.objectIntersectPoint = intersectPointAsVector;
								collision.target = line;
								//this event happens before any others, so clear the collision array and add this one
								collisionArray = new Array();
								collisionArray.push(collision);
							} else if (intersectTime == collisionTime) {
								//two possibilities why this might happen: a) if the predicted time of intersection with a line will happen exactly at the end of the frame (intersectTime == 1 and collisionTime == 1).  This is not a problem, as we can ignore this collision and catch it at the beginning of the next frame, where intersectTime will be 0.
								//b) if another ball/line collision has taken place at exactly the same time on the previous iteration.  This is a problem, as only the first one will be considered, and the second one will be ignored resulting in tunnelling.  Need to add to a queue of collisions to be resolved in this case

								if (intersectTime != 1) {
									collision = new Object();
									collisionTime = intersectTime;
									collision.type = "line";
									collision.time = collisionTime;
									collision.object = ball;
									collision.objectIntersectPoint = intersectPointAsVector;
									collision.target = line;
									//this collision happens (occassionally) in addition to any others, at the exact same time so add to the collision array,
									collisionArray.push(collision);
									console.log("double collision (line): frame " + this.frame);
								}
							}
						}
					}

					//===================================================
					//collisions with corners
					//===================================================
					for (var v = 0; v < this.vertexArray.length; v ++) {
						var vertex = this.vertexArray[v];

						var close = true;
						if (this.simType != 1) {
							if (Math.abs(ball.position.x - vertex.position.x) < 8000 && Math.abs(ball.position.y - vertex.position.y) < 8000) {
								close = true;
							} else {
								close = false;
							}
						}

						if (close == true) {
							var A3 = new Point(ball.position.x, ball.position.y); //starting point of ball
							var B3 = new Point(nextBallPosition.x, nextBallPosition.y); //point of ball at next frame
							var C3 = new Point(vertex.position.x, vertex.position.y);
							var r3 = this.ballRadius * 1.0;
							var intersection3 = Maths.lineIntersectCircle(A3, B3, C3, r3);
							if (intersection3.intersects == true || intersection3.inside == true) {
								var intersectPoint3; //the centre of the object ball, as a Point, at the moment it will make contact with the target.
								if (intersection3.enter != null) {
									intersectPoint3	= intersection3.enter;
									//console.log("!!!!!!   ENTER !!!!!!!!!!!!!!!: frame " + this.frame);
									if (ball.id == 8 && vertex.name == "K") {
										//console.log("intersect point: " + intersectPoint3.x + ", " + intersectPoint3.y);
									}
								}
								if (intersection3.exit != null) {
									intersectPoint3	= intersection3.exit;
									console.log("!!!!!!   EXIT !!!!!!!!!!!!!!!: frame " + this.frame);
								}

								if (intersection3.enter != null && intersection3.exit != null) {
									console.log("!!!!!! STRAIGHT THROUGH !!!!!!!!!!!!!!!: frame " + this.frame);
									intersectPoint3	= intersection3.enter;
								}

								if (intersection3.enter == null && intersection3.exit != null) {
									console.log("!!!!!! EXIT ONLY !!!!!!!!!!!!!!!: frame " + this.frame);
								}

								var intersectPointAsVector3;
								var intersectTime3;
								if (intersection3.intersects == true) {
									intersectPointAsVector3 = new Vector2D(intersectPoint3.x, intersectPoint3.y);
									var vectorAB3 = Maths.createVectorFrom2Points(A3, B3); //current ball position to ball position at next frame
									var vectorAP3 = Maths.createVectorFrom2Points(A3, intersectPoint3); //current ball position to intersect point
									intersectTime3 = Maths.fixNumber(time + (vectorAP3.magnitude / vectorAB3.magnitude) * omegaTime);
								}

								if (intersection3.inside == true) {
									//the balls must be overlapping (probably only slightly due to rounding errors) at the point the balls are currently positioned (not projected forward to some point over the next frame as the intersection.enter result would show), and we will treat it as a contact right now, with the contact point being where the balls would touch if we moved the ball directly away from the target it is overlapping. The intersection point is the centre of the object ball
									//var vertexToBall = Maths.createVectorFrom2Points(C3, A3).normalize();
									//intersectPointAsVector3 = new Vector2D(C3.x, C3.y).plus(vertexToBall.times(r3 * 1.01));
									var A3PV = ball.position.plus(ball.velocity.normalize().times(-r3*2)); //position of ball A3, projected backwards along the line of it's own velocity, as a vector, long enough to exit the vertex circle
									var A3P = new Point(A3PV.x, A3PV.y);
									var intersectionCorrection = Maths.lineIntersectCircle(A3, A3P, C3, r3);
									intersectPoint3	= intersectionCorrection.exit;
									intersectPointAsVector3 = new Vector2D(intersectPoint3.x, intersectPoint3.y);
									intersectTime3 = time;

									console.log("overlapping vertex: frame " + this.frame);
								}

								if (intersectTime3 < collisionTime) {
									//temporarily set the collision time and data to this collision.
									collision = new Object();
									collisionTime = intersectTime3;
									collision.type = "vertex";
									collision.object = ball;
									collision.time = collisionTime;
									collision.objectIntersectPoint = intersectPointAsVector3;
									collision.target = vertex;
									collisionArray = new Array(); //clear array - this collision happens earlier that any other
									collisionArray.push(collision);
								} else if (intersectTime3 == collisionTime) {
									if (intersectTime3 != 1) {
										collision = new Object();
										collisionTime = intersectTime3;
										collision.type = "vertex";
										collision.object = ball;
										collision.time = collisionTime;

										if (intersection3.intersects == true) {
											collision.objectIntersectPoint = new Vector2D(intersectPoint3.x, intersectPoint3.y);
										}
										if (intersection3.inside == true) {
											collision.objectIntersectPoint = intersectPointAsVector3;
										}

										collision.target = vertex;

										//don't clear array - this is another collision at the same time
										collisionArray.push(collision);
										console.log("double collision (vertex): frame " + this.frame);
									}
								}
							}
						}
					}

					//===================================================
					//collisions with pockets
					//===================================================
					for (var p = 0; p < this.pocketArray.length; p ++) {
						var pocket = this.pocketArray[p];

						var close = true;
						if (this.simType != 1) {
							if (Math.abs(ball.position.x - pocket.position.x) < 8000 && Math.abs(ball.position.y - pocket.position.y) < 8000) {
								close = true;
							} else {
								close = false;
							}
						}

						var towardsPocket = false;
						if (close == true) {
							//check if ball is moving towards this pocket.  This is primarily used for preventing a ball projected out of the pocket (in billiard blitz challenge) from being immediately swallowed by the same pocket again

							var vector = (pocket.position.minus(ball.position)).normalize();
							//var vector = new Vector2D(vec.x, vec.y);

							//component of ball vector in direction of ball to pocket, normalised
							var dotP = ball.velocity.dot(vector);
							//console.log(dotP);
							//var component = vector.times(dotP);
							//component = component.normalize();

							//compare sizes - same if in same direction, opposite sign if not
							if (dotP > 0) {
								//console.log("towards");
								towardsPocket = true;
							}//else{
								//console.log("away");
							//} else if (vector.magnitude =- component.magnitude) {
								//false by default
								//console.log("same direction");
							//} else{
								//console.log("BOLLOCKS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
							//}
						}

						//if (ball.propelling == false && close == true) {
						if (towardsPocket == true && close == true) {
							var A4 = new Point(ball.position.x, ball.position.y); //starting point of ball
							var B4 = new Point(nextBallPosition.x, nextBallPosition.y); //point of ball at next frame
							var C4 = new Point(pocket.position.x, pocket.position.y);
							var r4;

							if (pocket.radius) {
								r4 = pocket.radius;
							} else{
								r4 = this.pocketRadius;
							}

							var intersection4 = Maths.lineIntersectCircle(A4, B4, C4, r4);
							if (intersection4.intersects == true || intersection4.inside == true) {
								var intersectPoint4; //the centre of the object ball, as a Point, at the moment it will make contact with the target.
								if (intersection4.enter != null) {
									intersectPoint4	= intersection4.enter;
								}
								if (intersection4.exit != null) {
									intersectPoint4	= intersection4.exit;
								}

								var intersectPointAsVector4;
								var intersectTime4;

								if (intersection4.intersects == true) {
									intersectPointAsVector4 = new Vector2D(intersectPoint4.x, intersectPoint4.y);
									var vectorAB4 = Maths.createVectorFrom2Points(A4, B4); //current ball position to ball position at next frame
									var vectorAP4 = Maths.createVectorFrom2Points(A4, intersectPoint4); //current ball position to intersect point
									intersectTime4 = Maths.fixNumber(time + (vectorAP4.magnitude / vectorAB4.magnitude) * omegaTime);
								}

								if (intersection4.inside == true) {
									//the balls must be overlapping (probably only slightly due to rounding errors) at the point the balls are currently positioned (not projected forward to some point over the next frame as the intersection.enter result would show), and we will treat it as a contact right now, with the contact point being where the balls would touch if we moved the ball directly away from the target it is overlapping. The intersection point is the centre of the object ball
									var vertexToBall = Maths.createVectorFrom2Points(C4, A4).normalize();
									intersectPointAsVector4 = new Vector2D(C4.x, C4.y).plus(vertexToBall.times(r4));
									intersectTime4 = time;
									//////console.log("overlapping pocket");
								}

								if (intersectTime4 < collisionTime) {
									//temporarily set the collision time and data to this collision.
									collision = new Object();
									collisionTime = intersectTime4;
									collision.type = "pocket";
									collision.object = ball;
									collision.time = collisionTime;
									if (intersection4.intersects == true) {
										collision.objectIntersectPoint = new Vector2D(intersectPoint4.x, intersectPoint4.y);
									}
									if (intersection4.inside == true) {
										collision.objectIntersectPoint = intersectPointAsVector4;
									}
									collision.target = pocket;
									collisionArray = new Array(); //clear array - this collision happens earlier that any other
									collisionArray.push(collision);

								} else if (intersectTime4 == collisionTime) {
									if (intersectTime4 != 1) {
										collision = new Object();
										collisionTime = intersectTime4;
										collision.type = "pocket";
										collision.object = ball;
										collision.time = collisionTime;

										if (intersection4.intersects == true) {
											collision.objectIntersectPoint = new Vector2D(intersectPoint4.x, intersectPoint4.y);
										}
										if (intersection4.inside == true) {
											collision.objectIntersectPoint = intersectPointAsVector4;
										}
										collision.target = pocket;
										//////console.log("double collision (pocket)");
										//don't clear array - this is another collision at the same time
										collisionArray.push(collision);
									}
								}
							}
						}
					}
				}
			}
		}

		if (collisionArray.length > 0) {
			this.resolveCollision(collisionArray);
		}
		//move other balls on
		var deltaTime = Maths.fixNumber(collisionTime - time); //delta time is the time interval from the previous collision to the current one. If no collision occured on this iteration, deltaTime equates to the time remaining for this frame, and balls are moved onto their positions at the end of the frame

		if (this.simType != 1) {
			this.moveBalls(deltaTime); //this moves the balls not involved in collisions on to the time of the current collision if there is one, or the end of the frame if not.  Balls involved in collisions are already omitted by use of the ommission array in resolveCollision().
		}
		time = collisionTime; //update the time to that of the current collision

		sanityCheck ++;
		if (sanityCheck >= 20) {
			//console.log("max iterations");
		}

	} while (collisionArray.length > 0 && sanityCheck < 20);
}

billiardPhysics.prototype.resolveCollision = function(collisionArray) {
	var gameInfo = playState.gameInfo;
	this.omissionArray = new Array(); //these are all balls whose positions have been updated in this function, and don't need to be updated in moveBalls();

	if (collisionArray.length > 1) {
		//trace("num simult colls: " + collisionArray.length + ": " + collisionArray[0].type + ", " + collisionArray[1].type);
	}

	var ctp = 96;
	var ctb = 97;
	var ctl = 98;
	var ctv = 99;

	for (var c = 0; c < collisionArray.length; c ++) {
		var collision = collisionArray[c];
		////////console.log("collision type: " + collision.type);
		//apply new velocities and update position to the contact position
		//ball on ball
		if (collision.type == "ball") {
			//trace("ball");
			ctb = collision.time;
			var overlap = false;

			var ball = collision.object;
			ball.position = collision.objectIntersectPoint;
			var target = collision.target;
			if (this.targetID == -1) {
				this.targetID = target.id;
			}
			////////console.log(ball.id + " and " + target.id + " resolving");
			target.position = collision.targetIntersectPoint;
			//check overlaps

			this.omissionArray.push(ball);
			this.omissionArray.push(target);

			//find normal and tangent for contact
			var vec = (target.position.minus(ball.position)).normalize();
			var contactNormal = new Vector2D(vec.x, vec.y);
			var contactTangent = contactNormal.getRightNormal();

			//find vectors in normal and tangential directions
			var ballVelocityNormal = contactNormal.times(ball.velocity.dot(contactNormal));
			var ballVelocityTangent = contactTangent.times(ball.velocity.dot(contactTangent));
			//same for target ball
			var targetVelocityNormal = contactNormal.times(target.velocity.dot(contactNormal));
			var targetVelocityTangent = contactTangent.times(target.velocity.dot(contactTangent));

			//find final resultant velocity vectors (new normal velocity vector plus unchanged tangent velocity vector
			//ball.velocity = ballVelocityTangent.plus(targetVelocityNormal.times(this.ballRestitution));
			//target.velocity = targetVelocityTangent.plus(ballVelocityNormal.times(this.ballRestitution));

			//ySpin (visual effect only - has no effect on physics)
			//if (this.simType == 0) {
				if (Math.abs(target.ySpin) < Math.abs(ball.ySpin)) {
					target.ySpin = ball.ySpin * -0.5;
				}
			//}

			//======================================
			//graduated screw
			if (ball.id == 0 && ball.firstContact == false) {
				//if cueball on first contact, set initial screw vector
				ball.deltaScrew = ballVelocityNormal.times( -ball.screw * 0.17); //0.17
			}

			var newNormalVelocityBall = (targetVelocityNormal.times(this.ballRestitution)).plus(ballVelocityNormal.times(1 - this.ballRestitution));
			//=======================================
			var newNormalVelocityTarget = (ballVelocityNormal.times(this.ballRestitution)).plus(targetVelocityNormal.times(1 - this.ballRestitution));

			ball.velocity = ballVelocityTangent.plus(newNormalVelocityBall);
			target.velocity = targetVelocityTangent.plus(newNormalVelocityTarget);
			if (this.simType == 0) {
				if (newNormalVelocityTarget.magnitude > 450) {
					target.grip = 0;
				}
			}

			ball.lastCollisionObject = target; // used
			target.lastCollisionObject = ball; // used
		}

		//ball on line
		if (collision.type == "line") {
			ctl = collision.time;
			//trace("line");
			gameInfo.collisions ++;

			var ball = collision.object;
			ball.position = collision.objectIntersectPoint;
			var line = collision.target;

			//console.log("ball " + ball.id + " on line: " + line.name + ", frame: " + this.frame);
			this.omissionArray.push(ball);

			ball.ySpin += -ball.velocity.dot(line.direction) / 100; //300
			//trace(ball.ySpin);

			var spinMax = 50; //20
			if (ball.ySpin > spinMax) {
				ball.ySpin = spinMax;
			}
			if (ball.ySpin < -spinMax) {
				ball.ySpin = -spinMax;
			}

			//resolve ball velocity into components normal and tangential to the line
			var ballVelocityNormal = line.normal.times(ball.velocity.dot(line.normal));
			var ballVelocityTangent = line.direction.times(ball.velocity.dot(line.direction));

			//apply english.
			if (ball.id == 0) {
				ballVelocityTangent = ballVelocityTangent.plus(line.direction.times(Maths.fixNumber(ball.english * 0.2 * ball.velocity.magnitude))); //need to add a vector!
				//reduce english after contact with cushion
				ball.english = Maths.fixNumber(ball.english * 0.5);
				if (ball.english > -0.1 && ball.english < 0.1) {
					ball.english = 0;
				}
			}

			//reverse normal component
			ball.velocity = (ballVelocityNormal.times( -this.cushionRestitution)).plus(ballVelocityTangent);

			if (this.simType == 0) {
				if (ballVelocityNormal.magnitude > 700) {
					ball.grip = 0;
				}
			}

			ball.lastCollisionObject = line; //now used
			//move ball away from line by the smallest amount to prevent line intersection being detected on next iteration
			//ball.position = ball.position.plus(ball.velocity.normalize());
			ball.position = ball.position.plus(line.normal.times(200));

			if (ball.id == 0) {
				ball.deltaScrew = ball.deltaScrew.times(0.8); //reduce screw after cushion contact.  Not actuslly correct - better would be tostore screw as a vector so that the direction of spin is preserved after cushion contact.  At the moment screw is positive or negative, but after cueball direction change, this doesn't make sense.  A ball hit with backspin which hits a cushion, changes direction, then hits an object ball, will actually have top spin and follow the ball.  This isn't accounted for here - if the ball is hit with screw, it will still screw back from the ball even after a direction change.
			}
		}

		//ball on corner
		if (collision.type == "vertex") {
			gameInfo.collisions ++;
			//trace("vertex");
			var ball = collision.object;
			ball.position = collision.objectIntersectPoint;
			var vertex = collision.target;

			//console.log("ball " + ball.id + " on vertex: " + vertex.name + ", frame: " + this.frame);

			this.omissionArray.push(ball);

			//find collision normal and tangent
			var vec = (vertex.position.minus(ball.position)).normalize()
			var contactNormal = new Vector2D(vec.x, vec.y);
			var contactTangent = contactNormal.getRightNormal();

			//resolve ball velocity into components normal and tangential to the line
			var ballVelocityNormal = contactNormal.times(ball.velocity.dot(contactNormal));
			var ballVelocityTangent = contactTangent.times(ball.velocity.dot(contactTangent));

			//console.log("ball " + ball.id + " changing direction");
			ball.velocity = (ballVelocityNormal.times( -this.cushionRestitution)).plus(ballVelocityTangent);
			//move ball away from vertex by the smallest amount to prevent intersection being detected on next iteration
			//ball.position = ball.position.plus(ball.velocity.normalize());
			ball.position = ball.position.minus(contactNormal.times(200));

			ball.lastCollisionObject = vertex;
			ball.lastVertex = vertex.name;

			if (ball.id == 0) {
				ball.deltaScrew = new Vector2D(0, 0); //clear screw after cushion contact
			}
		}

		//ball in pocket
		if (collision.type == "pocket") {
			ctp = collision.time;
			//trace("pocket");
			if (collisionArray.length > 1) {
				//trace("ball pocketed and other collision on same frame");
			}
			var ball = collision.object;
			ball.position = collision.objectIntersectPoint;
			var pocket = collision.target;
			this.omissionArray.push(ball);

			//ball.active = false; //moved to contact listener
			var sinkSpeed = ball.velocity.magnitude; // store this before setting to zero for sending to contact listener for volume info
		}

		//allow information about this contact to be passed out of the class to the main program
		var contactData = new Object();
		contactData.collisionType = collision.type;
		contactData.ball = ball;
		contactData.target = collision.target;
		contactData.ballVelocity = ball.velocity;

		if (collision.type == "ball") {
			contactData.targetVelocity = target.velocity;
			if (ball.id == 0) {
				contactData.deltaScrew = ball.deltaScrew;
			}
		}
		if (collision.type == "line" || collision.type == "vertex") {
			contactData.normalVelocity = ballVelocityNormal; //used for ascertaining the volume of cushion impact sound
		}
		if (collision.type == "pocket") {
			contactData.speed = sinkSpeed;
		}
		this.sendContactEvent(contactData);

		//if collision was ball on ball, the target needs to send a contact event too, so that it's contactArray can be populated in the contactListener.  This has to be done here, because ball on target is only checked once (ie. no target on ball is checked to prevent double checking). May cause problems for playing sounds, where both balls will play a sound simultaneously
		if (collision.type == "ball") {
			//same as above but swap ball for target
			contactData = new Object();
			contactData.collisionType = collision.type;
			contactData.ball = collision.target;
			contactData.target = ball;
			contactData.ballVelocity = collision.target.velocity;
			contactData.targetVelocity = ball.velocity;
			if (target.id == 0) {
				contactData.deltaScrew = collision.target.deltaScrew;
			}
			this.sendContactEvent(contactData);
		}
	}
}

billiardPhysics.prototype.sendContactEvent = function(data) {
	this.contactEvent.dispatch(data);
}

billiardPhysics.prototype.moveBalls = function(delta) {
	for (var n = 0; n < this.ballArray.length; n ++) {
		var ball = this.ballArray[n];

		if (this.omissionArray.length == 0 || this.omissionArray.indexOf(ball) == -1) {
			if (ball.active == true) {
				ball.position = ball.position.plus(ball.velocity.times(delta));
			}
		}

	}
	this.omissionArray = new Array(); //clear omission array here, as otherwise will not be cleared in time for next moveBalls() if there is no collision
}

billiardPhysics.prototype.updateFriction = function() {
	//for simplicity, apply friction just once per frame here.  Applying this over variable time steps would be a nightmare.
	for (var b = 0; b < this.ballArray.length; b ++) {
		var ball = this.ballArray[b];
		//apply and reduce screw
		if (ball.id == 0) {
			ball.velocity = ball.velocity.plus(ball.deltaScrew);
			if (ball.deltaScrew.magnitude > 0) {
				ball.deltaScrew = ball.deltaScrew.times(0.8);
				if (ball.deltaScrew.magnitude < 1) {
					ball.deltaScrew = new Vector2D(0, 0);
				}
			}
		}

		var ballSpeed = ball.velocity.magnitude;
		ballSpeed -= this.friction;
		var ballUnitVec = ball.velocity.normalize();
		ball.velocity = ballUnitVec.times(ballSpeed);

		//if velocity of ball is less than min velocity, bring it to rest by multiplying be 0.
		if (ball.velocity.magnitude < this.minVelocity) {
			ball.velocity = new Vector2D(0, 0);
		}

		//add grip to balls
		if (ball.grip < 1) {
			ball.grip += 0.02; //.03
		}
		if (ball.ySpin >= 0.2) {
			ball.ySpin -= 0.2;
		}
		if (ball.ySpin <= -0.2) {
			ball.ySpin += 0.2;
		}
		if (ball.ySpin >= -0.2 && ball.ySpin <= 0.2) {
			ball.ySpin = 0;
		}

		//experimental - add swerve to ball based on spin.
		if (ball.ySpin != 0) {
			var normal = ball.velocity.getLeftNormal().normalize();
			var swerve = normal.times(0.3 * ball.ySpin * ball.velocity.magnitude / 800);
			ball.velocity = ball.velocity.plus(swerve);
		}
	}
}



