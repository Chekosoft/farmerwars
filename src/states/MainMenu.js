
export default class MainMenu extends Phaser.State {
	preload() {
		this.game.load.spritesheet('play-button',
		'def_sprites/game/play-button.png',
		164, 75);
		this.game.load.spritesheet('hiscore-button',
		'def_sprites/game/hiscore-button.png',
		164, 75);
		this.game.load.spritesheet('credits-button',
		'def_sprites/game/credits-button.png',
		164, 75);
		this.game.load.image('background',
		'def_sprites/game/farmer-wars-title.png');
	}

	create() {
		this.background = this.game.add.image(0, 0, 'background');
		this.playbutton = this.game.add.button(400, 600, 'play-button',
		 function() {
			 this.game.state.start('GameState');
		 }, this, 1, 0, 2, 0);
		this.playbutton.anchor.x = 0.5;
		this.playbutton.anchor.y = 0.5;
		this.hiscorebutton = this.game.add.button(150, 600, 'hiscore-button',
		 function() {
			 this.game.state.start('Historical');
		 }, this, 1, 0, 2, 0);
		this.hiscorebutton.anchor.y = 0.5;
		this.hiscorebutton.anchor.x = 0.5;
		this.creditsbutton = this.game.add.button(650, 600, 'credits-button',
		 function() {
			 this.game.state.start('Credits');
		 }, this, 1, 0, 2, 0);
		this.creditsbutton.anchor.y = 0.5;
		this.creditsbutton.anchor.x = 0.5;
	}
}
