

var game = new Phaser.Game(1920, 1080, Phaser.CANVAS, "mygame", {}, true);
//ratio 1.484

//global variables - persistent across states
var projectInfo = new Object();
// Sound.on = true;
projectInfo.alertSent = false;
projectInfo.tutorialPlayed = false;



game.state.add("load", loadState);
game.state.add("play", playState);

game.state.start("load");

