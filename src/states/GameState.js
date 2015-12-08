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
		if(player.playerType == 'chicken_farmer') {
			if(tileOn.groundType == 'dead') {
				tileOn.changeType('grains');
				player.lowerStamina(10);
				player.score += 15;
			} else if(tileOn.groundType == 'soil') {
				tileOn.changeType('grains');
				player.lowerStamina(5);
				player.score += 10;
			} else if(tileOn.groundType == 'grass') {
				tileOn.changeType('grains');
				player.lowerStamina(20);
				player.score += 20;
			}
		} else if(player.playerType == 'cow_farmer') {
			if(tileOn.groundType == 'dead') {
				tileOn.changeType('grass');
				player.lowerStamina(10);
				player.score += 15;
			} else if(tileOn.groundType == 'soil') {
				tileOn.changeType('grass');
				player.lowerStamina(5);
				player.score += 10;
			} else if(tileOn.groundType == 'grains') {
				tileOn.changeType('grass');
				player.lowerStamina(15);
				player.score += 20;
			}
		}
	}

	_getFloorAt(x, y) {
		let tileAt = x + 20*y;
		return (this.ground.children.length < tileAt || tileAt < 0) ?
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

		var waterMass = [];

		for(let j = 1; j < 3; j++){
			for(let i = 0; i < 3; i++) {
				let put_water = this.game.rnd.between(0, 1);
				let size = this.game.rnd.between(1,3);
				if(put_water) {

					waterMass.push({
						x: 5*j, y: 5*i, size: size
					});

					for(let k = 0; k < size; k++) {
						for(let l = 0; l < size; l++) {
							let tile = this._getFloorAt(5*j+l, 5*i+k);
							if(tile.groundType == 'dead')
								tile.changeType('water');
						}
					}
				}
			}
		}

		for(let i = 0, wl = waterMass.length; i < wl; i++) {
			let water = waterMass[i];
			let soilSize = this.game.rnd.between(1, water.size);
			//left and right of water mass
			for(let j = 0; j < water.size; j++) {
				for(let k = 1; k <= soilSize; k++) {
					let tile = this._getFloorAt(water.x - k, water.y + j);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}

				for(let k = 0; k < soilSize; k++) {
					let tile = this._getFloorAt(water.x + water.size + k, water.y + j);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}
			}
			//top and bottom of water mass

			for(let j = 0; j < water.size; j++) {
				for(let k = 1; k <= soilSize; k++) {
					let tile = this._getFloorAt(water.x + j, water.y - k);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}

				for(let k = 0; k < soilSize; k++) {
					let tile = this._getFloorAt(water.x + j, water.y + water.size + k);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}
			}

			for(let j = 0; j <= soilSize; j++) {
				for(let k = 0; k <= soilSize; k++) {
					let tile = this._getFloorAt(water.x - j, water.y - k);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}
				for(let k = 0; k < soilSize; k++) {
					let tile = this._getFloorAt(water.x - j, water.y + water.size + k);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}
			}

			for(let j = 0; j < soilSize; j++) {
				for(let k = 0; k <= soilSize; k++) {
					let tile = this._getFloorAt(water.x + water.size + j, water.y - k);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}
				for(let k = 0; k < soilSize; k++) {
					let tile = this._getFloorAt(water.x + water.size + j, water.y + water.size + k);
					if(tile === null || tile.groundType !== 'dead') {
						continue;
					}
					tile.changeType('soil');
				}
			}
		}
	}

	preload() {
		this.game.load.image('water', 'sprites/water.png');
		this.game.load.image('dead', 'sprites/dead.png');
		this.game.load.image('grass', 'sprites/grass.png');
		this.game.load.image('soil', 'sprites/soil.png');
		this.game.load.image('grains', 'sprites/grains.png');
		this.game.load.image('cow_farmer', 'sprites/cow_farmer.png');
		this.game.load.image('chicken_farmer', 'sprites/chicken_farmer.png');
	}

}

export default GameState;
