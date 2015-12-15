import _ from 'lodash';
import Floor from '../objects/Floor';
import Player from '../objects/Player';
import StatusText from '../objects/StatusText';

class GameState extends Phaser.State {

	create() {
		var self = this;

		//Players
		this.player1 = new Player(this.game, 0, 6, 'chicken_farmer');
		this.player2 = new Player(this.game, 19, 8, 'cow_farmer');

		this.player1.setMovementDelay(300);
		this.player1.setRecoveryDelay(1000);
		this.player2.setMovementDelay(500);
		this.player2.setRecoveryDelay(500);

		this.player1Status = new StatusText(this.game, 50, 600);
		this.player2Status = new StatusText(this.game, 500, 600);

		//Terrain
		this.ground = this.game.add.group();
		this.buildMap();

		//Timer
		this.playTime = this.game.time.create(true);
		this.playTime.add()

		//Audio assets (to not overcrowd the environment)
		this.cow_sound = this.game.add.audio('cow_sp');
		this.chicken_sound = this.game.add.audio('chicken_sp');
		this.shovel_1 = this.game.add.audio('shovel_1');
		this.shovel_2 = this.game.add.audio('shovel_2');

		//User interaction

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


		this.keyboard1.up.onUp.add(this._movePlayer, this, 0, this.player1, 'up');
		this.keyboard1.down.onUp.add(this._movePlayer, this, 0, this.player1, 'down');
		this.keyboard1.left.onUp.add(this._movePlayer, this, 0, this.player1, 'left');
		this.keyboard1.right.onUp.add(this._movePlayer, this, 0, this.player1, 'right');

		this.keyboard2.up.onUp.add(this._movePlayer, this, 0, this.player2, 'up');
		this.keyboard2.down.onUp.add(this._movePlayer, this, 0, this.player2, 'down');
		this.keyboard2.left.onUp.add(this._movePlayer, this, 0, this.player2, 'left');
		this.keyboard2.right.onUp.add(this._movePlayer, this, 0, this.player2, 'right');

		this.esc = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.esc.onUp.add(function() { self.game.state.restart(); });

	}

	_movePlayer(key, player, place) {
		if(!player.canMove) return;

		var staminaReduction = 5;
		player.lowerStamina(staminaReduction);
		switch(place) {
			case 'up':
				player.goUp();
				break;
			case 'down':
				player.goDown();
				break;
			case 'left':
				player.goLeft();
				break;
			case 'right':
				player.goRight();
				break;
		}
		var playerNewPosition = player.getPosition();
		var tileOn = this._getFloorAt(playerNewPosition.x, playerNewPosition.y);

		if(tileOn.groundType == 'water' || tileOn.groundType == 'pavement') {
			return;
		} else {
			tileOn.changeOwner(player);
			if(player.playerType == 'chicken_farmer') {
				if(tileOn.groundType == 'dead') {
					player.lowerStamina(10);
					player.score += 15;
				} else if(tileOn.groundType == 'soil') {
					player.lowerStamina(5);
					player.score += 10;
				} else if(tileOn.groundType == 'grass') {
					player.lowerStamina(20);
					player.score += 20;
				}
				tileOn.changeType('grains');
				tileOn.startGrowTimer();
			}
			else if(player.playerType == 'cow_farmer') {
				if(tileOn.groundType == 'dead') {
					player.lowerStamina(10);
					player.score += 15;
				} else if(tileOn.groundType == 'soil') {
					player.lowerStamina(5);
					player.score += 10;
				} else if(tileOn.groundType == 'grains') {
					player.lowerStamina(15);
					player.score += 20;
				}
				tileOn.startGrowTimer();
				tileOn.changeType('grass');
			}
		}
	}

	_getFloorAt(x, y) {
		let tileAt = x + 20*y;
		return (tileAt < 0 || tileAt >= 300) ?
				null : this.ground.getChildAt(tileAt);
	}

	shutdown() {
		this.player1.destroy(true);
		this.player2.destroy(true);
		this.player1Status.destroy(true);
		this.player2Status.destroy(true);
	}

	update() {
		//Update statustexts
		this.player1Status.updateStatus(this.player1);
		this.player2Status.updateStatus(this.player2);

		//Get floor
		var player1pos = this.player1.getPosition(),
			player2pos = this.player2.getPosition();
		var p1Ground = this._getFloorAt(player1pos.x, player1pos.y),
			p2Ground = this._getFloorAt(player2pos.x, player2pos.y);

		//What if players collide with each other
		if(_.isEqual(player1pos, player2pos)) {
			this.player1.setPosition(0, 6);
			this.player2.setPosition(19, 8);
		}

		//What if players collide with environment
		if(p1Ground.groundType == 'water') {
			this.player1.setPosition(0, 6);
		}

		if(p2Ground.groundType == 'water') {
			this.player2.setPosition(19, 8);
		}
	}

	buildMap() {
		for(let i = 0; i < 15; i++) {
			for(let j = 0; j < 20; j++) {
				var ground = 'dead';
				this.ground.addChild(new Floor(this.game, j, i, ground, this.ground));
			}
		}

		var roadPoints = [3,7,11].filter(function(el) {
			return (this.game.rnd.between(0,4) > 2);
		}, this);

		if(roadPoints.length == 0) {
			roadPoints = [7];
		}

		roadPoints.forEach(function(point) {
			for(let i = 0; i < 20; i++) {
				this._getFloorAt(i, point).changeType('pavement');
			}
		}, this);

		var waterSeeds = [4,9,10,15].filter(function(el) {
			return (this.game.rnd.between(0,4) > 2);
		}, this);

		var waterPoints = [];

		waterSeeds.forEach(function(point) {
			let down = this.game.rnd.pick([0,1]);
			let currentX = point;
			let y = 0;
			let sub = false;
			if(down){
				y = 14;
				sub = true;
			}

			while(!sub && y < 15 || sub && y > 0) {
				let advance = this.game.rnd.pick([-1, 0, 1]);
				switch(advance) {
					case -1:
						currentX--;
						break;
					case 1:
						currentX++;
						break;
					default:
						break;
				}

				let tile = this._getFloorAt(currentX, y);
				if(currentX == 0 || currentX == 14
					|| tile == null || tile.groundType == 'water') {
					break;
				}
				else if(tile.groundType == 'dead') {
					tile.changeType('water');
					waterPoints.push({
						x: currentX,
						y: y
					});
					let filler = null;
					switch(advance) {
						case -1:
							filler = this._getFloorAt(currentX + 1, y);
							if(filler && filler.grid_x > 0 && filler.groundType == 'dead') {
								filler.changeType('water');
							} else {
								filler = null;
							}
						break;
						case 1:
							filler = this._getFloorAt(currentX - 1, y);
							if(filler && filler.grid_x < 18 && filler.groundType == 'dead') {
								filler.changeType('water');
							} else {
								filler = null;
							}
						break;
					}
					if(filler != null) {
						waterPoints.push({
							x: filler.grid_x,
							y: filler.grid_y
						});
					}
				}
				y = (sub) ? y-1: y+1;
			}
		}, this);

		waterPoints.forEach(function(point) {
			let tile = this._getFloorAt(point.x - 1, point.y);
			if(tile && tile.groundType == 'dead') {
				tile.changeType('soil');
			}

			tile = this._getFloorAt(point.x + 1, point.y);
			if(tile && tile.groundType == 'dead')
				tile.changeType('soil');

			tile = this._getFloorAt(point.x, point.y - 1);
			if(tile && tile.groundType == 'dead')
				tile.changeType('soil');

			tile = this._getFloorAt(point.x, point.y + 1);
			if(tile && tile.groundType == 'dead')
				tile.changeType('soil');
		}, this);
	}

	preload() {
		//sprites

		//ground types
		this.game.load.image('water', 'sprites/new/water.png');
		this.game.load.image('dead', 'sprites/new/dead.png');

		this.game.load.image('pavement', 'sprites/new/pavement.png');

		//soil
		this.game.load.image('soil', 'sprites/new/soil.png');
		this.game.load.image('grains', 'sprites/new/grains.png');
		this.game.load.image('chicken_1', 'sprites/new/chicken_1.png');
		this.game.load.image('chicken_2', 'sprites/new/chicken_2.png');
		this.game.load.image('chicken_3', 'sprites/new/chicken_3.png');

		this.game.load.image('grass', 'sprites/new/grass.png');
		this.game.load.image('cow_1', 'sprites/new/cow_1.png');
		this.game.load.image('cow_2', 'sprites/new/cow_2.png');
		this.game.load.image('cow_3', 'sprites/new/cow_3.png');

		//players
		this.game.load.image('cow_farmer', 'sprites/new/cow_farmer.png');
		this.game.load.image('chicken_farmer', 'sprites/new/chicken_farmer.png');

		//sound
		this.game.load.audio('cow_sp', 'sounds/cow_spawn.mp3');
		this.game.load.audio('chicken_sp', 'sounds/chicken_spawn.mp3');
		this.game.load.audio('shovel_1', 'sounds/shovel_1.mp3');
		this.game.load.audio('shovel_2', 'sounds/shovel_2.mp3');
	}

}

export default GameState;
