import _ from 'lodash';
import Floor from '../objects/Floor';
import Player from '../objects/Player';

class GameState extends Phaser.State {

	create() {
		this.ground = this.game.add.group();

		for(let i = 0; i < 15; i++) {
			for(let j = 0; j < 20; j++) {
				var ground = 'soil';
				if(this.game.rnd.integerInRange(0,10) == 10) {
					ground = 'water';
				}
				this.ground.addChild(new Floor(this.game, j, i, ground, this.ground));
			}
		}

		console.log(this.ground.children.length);

		this.player1 = new Player(this.game, 0, 5, 'chicken_farmer');
		this.player2 = new Player(this.game, 19, 6, 'cow_farmer');

		this.keyboard1 = {
			up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
			down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
		};

		this.keyboard2 = {
			up: this.game.input.keyboard.addKey(Phaser.Keyboard.UP),
			down: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
		};

		var self = this;
		this.keyboard1.up.onUp.add(function() {self.player1.goUp()});
		this.keyboard1.down.onUp.add(function() {self.player1.goDown()});
		this.keyboard1.left.onUp.add(function() {self.player1.goLeft()});
		this.keyboard1.right.onUp.add(function() {self.player1.goRight()});

		this.keyboard2.up.onUp.add(function() {self.player2.goUp()});
		this.keyboard2.down.onUp.add(function() {self.player2.goDown()});
		this.keyboard2.left.onUp.add(function() {self.player2.goLeft()});
		this.keyboard2.right.onUp.add(function() {self.player2.goRight()});

	}

	update() {
		var player1pos = this.player1.getPosition(),
			player2pos = this.player2.getPosition();
		var p1Ground = this.ground.getChildAt(player1pos.x + 20*player1pos.y),
			p2Ground = this.ground.getChildAt(player2pos.x + 20*player2pos.y);

		if(_.isEqual(player1pos, player2pos)) {
			this.player1.setPosition(0, 6);
			this.player2.setPosition(19, 7);
		}

		if(p1Ground.type == 'water') {
			console.log(p1Ground.getPosition());
			this.player1.setPosition(0, 6);
		}

		if(p2Ground.type == 'water') {
			this.player2.setPosition(19, 7);
		}
	}

	preload() {
		this.game.load.image('water', '/sprites/water.png');
		this.game.load.image('dead', '/sprites/dead.png');
		this.game.load.image('grass', '/sprites/grass.png');
		this.game.load.image('soil', '/sprites/soil.png');
		this.game.load.image('grains', '/sprites/grains.png');
		this.game.load.image('cow_farmer', '/sprites/cow_farmer.png');
		this.game.load.image('chicken_farmer', '/sprites/chicken_farmer.png');
	}

}

export default GameState;
