import GameState from './states/GameState';
import MainMenu from './states/MainMenu';
import Credits from './states/Credits';
import Historical from './states/Historical';
import AfterGame from './states/AfterGame';

class Game extends Phaser.Game {

	constructor() {
		super(800, 680, Phaser.AUTO, 'content', null);
		this.state.add('MainMenu', MainMenu, false);
		this.state.add('GameState', GameState, false);
		this.state.add('Credits', Credits, false);
		this.state.add('Historical', Historical, false);
		this.state.add('AfterGame', AfterGame, false);
		this.state.start('MainMenu');
	}

}

new Game();
