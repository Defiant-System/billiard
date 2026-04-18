
var Sound = new function() {
	this.on = true;
	this.master = this.on;
	this.slave = this.on;

	this.setMasterMute = (muted = false) => {
		this.master = !muted;
		this.updateMute();
	}
	
	this.setMute = (muted = false) => {
		this.slave = !muted;
		this.updateMute();
	}

	this.updateMute = () => {
		this.on = this.master && this.slave;
	}
}


Sound.Play = function(type, volume) {
	if (typeof(volume)==='undefined') {
		volume = 1;
	}

	if (Sound.on) {			
		var sound = new Phaser.Sound(Project.game, type, volume);
		sound.play();
		//console.log("playing sound: " + type);				
	}
}

Sound.createNewAudioContext = function() {
	//console.log('create new audio context');
	Project.game.sound.context = new AudioContext();
	Project.game.sound.masterGain.disconnect();

	Project.game.sound.masterGain = Project.game.sound.context.createGain();
	Project.game.sound.masterGain.connect(Project.game.sound.context.destination);
}

Sound.checkAudioContext = function() {
	if (this.isSuspended()) {
		//console.log('is suspended');
		this.startCheckingSuspended();
	}

	const oldCurrentTime = Project.game.sound.context.currentTime;

	setTimeout(() => {
		const newCurrentTime = Project.game.sound.context.currentTime;

		if (oldCurrentTime === newCurrentTime) {
			this.createNewAudioContext();
		}
	}, 1000);
}

Sound.startCheckingSuspended = function() {
	clearInterval(this.intervalId);

	this.intervalId = setInterval(() => {
		if (this.isSuspended()) {
			Project.game.sound.context.resume();
		} else {
			clearInterval(this.intervalId);
		}
	}, 1000);
}

Sound.isSuspended = function() {
	return Project.game.sound.usingWebAudio && Project.game.sound.context.state === 'suspended';
}

// setInterval(Sound.checkAudioContext.bind(Sound), 1000);
