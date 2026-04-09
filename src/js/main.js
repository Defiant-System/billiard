
const { Phaser } = await window.fetch("~/js/bundle.js");

@import "./modules/Ball.js"
@import "./modules/contactListener.js"
@import "./modules/billiardPhysics.js"
@import "./modules/levelData.js"
@import "./modules/maths.js"
@import "./modules/vector2d.js"
// @imp-ort "./modules/render.js"
// @imp-ort "./modules/sound.js"
// @imp-ort "./modules/effects.js"
// @imp-ort "./modules/timer.js"
@import "./modules/load.js"
// @imp-ort "./modules/mainMenu.js"
@import "./modules/setup.js"
// @imp-ort "./modules/gameController.js"
@import "./modules/boot.js"

@import "./modules/test.js"


const billiard = {
	init() {
		// fast references
		this.content = window.find("content");

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END

		console.log( game );
	},
	dispatch(event) {
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = billiard;
