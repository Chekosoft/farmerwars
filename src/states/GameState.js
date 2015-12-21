import _ from 'lodash';
import Floor from '../objects/Floor';
import Player from '../objects/Player';
import StatusText from '../objects/StatusText';
import TimeText from '../objects/TimeText';
import WinnerText from '../objects/WinnerText';
import Car from '../objects/Car';

class GameState extends Phaser.State {

	create() {
		var self = this;

		//Terrain
		this.ground = this.game.add.group();
		this.buildMap();

		//Players
		this.player1 = new Player(this.game, 0, 6, 'chicken_farmer', 'right');
		this.player2 = new Player(this.game, 19, 8, 'cow_farmer', 'left');

		//Hazards
		this.car = null;

		this.player1.setMovementDelay(300);
		this.player1.setRecoveryDelay(1000);
		this.player2.setMovementDelay(500);
		this.player2.setRecoveryDelay(500);

		this.player1Status = new StatusText(this.game, 25, 600, "left");
		this.player2Status = new StatusText(this.game, 650, 600, "right");
		this.timerStatus = new TimeText(this.game, 340, 600);

		//Timers
		this.playTime = this.game.time.create(true);
		this.playTimeEvent = this.playTime.add(Phaser.Timer.SECOND * 30 + Phaser.Timer.MINUTE * 2,
			this.endGame, this);

		//cartimer
		this.carTimer = this.game.time.create(true);
		this.carTimer.loop(Phaser.Timer.SECOND * 25, function() {
			this.car = new Car(this.game,
				this.game.rnd.pick(this.roadPoints),
				this.game.rnd.pick(['left', 'right']));
			console.log(this.car.position.x, this.car.position.y);
			let tween = this.game.add.tween(this.car).
				to({ x : this.car.stop_at }, Phaser.Timer.SECOND * 3,
				 Phaser.Easing.Linear.None);
			tween.onComplete.add(function() {
				this.car.destroy(true);
				this.car = null;
			}, this);
			this.car_sound.play();
			tween.start();
		}, this);

		//Audio assets (to not overcrowd the environment)
		this.cow_sound = this.game.add.audio('cow_sp');
		this.chicken_sound = this.game.add.audio('chicken_sp');
		this.shovel_1 = this.game.add.audio('shovel_1');
		this.shovel_2 = this.game.add.audio('shovel_2');
		this.car_sound = this.game.add.audio('car');

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

		//Start timers
		this.playTime.start();
		this.carTimer.start();
	}

	_movePlayer(key, player, place) {
		if(!player.canMove) return;
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
					player.lowerStamina(15);
					player.score += 15;
				} else if(tileOn.groundType == 'soil') {
					player.lowerStamina(10);
					player.score += 10;
				} else if(tileOn.groundType == 'grass') {
					player.lowerStamina(35);
					player.score += 50;
				} else {
					if(player.stamina <= 100) {
						player.lowerStamina(-10 * tileOn.animals);
					}
					player.score += 15*tileOn.animals;
				}
				tileOn.changeType('grains');
				tileOn.startGrowTimer();
			}
			else if(player.playerType == 'cow_farmer') {
				if(tileOn.groundType == 'dead') {
					player.lowerStamina(15);
					player.score += 15;
				} else if(tileOn.groundType == 'soil') {
					player.lowerStamina(10);
					player.score += 10;
				} else if(tileOn.groundType == 'grains') {
					player.lowerStamina(35);
					player.score += 50;
				} else {
					if(player.stamina <= 100) {
						player.lowerStamina(-10 * tileOn.animals);
					}
					player.score += 15*tileOn.animals;
				}
				tileOn.changeType('grass');
				tileOn.startGrowTimer();

			}
		}
	}

	_getFloorAt(x, y) {
		let tileAt = x + 20*y;
		return (tileAt < 0 || tileAt >= 300) ?
				null : this.ground.children[tileAt];
	}

	shutdown() {
		this.player1.destroy(true);
		this.player2.destroy(true);
		this.player1Status.destroy(true);
		this.player2Status.destroy(true);
		this.timerStatus.destroy(true);
		this.carTimer.stop();
		this.carTimer.destroy(true);
		this.playTime.stop(true);
		this.playTime.destroy();
		if(this.winnerText) {
			this.winnerText.destroy(true);
		}
	}

	update() {
		//Update statustexts
		this.player1Status.updateStatus(this.player1);
		this.player2Status.updateStatus(this.player2);
		this.timerStatus.updateStatus(this.playTime, this.playTimeEvent);

		//Get floor
		var player1pos = this.player1.getPosition(),
			player2pos = this.player2.getPosition();
		var p1Ground = this._getFloorAt(player1pos.x, player1pos.y),
			p2Ground = this._getFloorAt(player2pos.x, player2pos.y);

		//What if players collide with each other
		if(_.isEqual(player1pos, player2pos)) {
			this.player1.setPosition(0, 6);
			this.player2.setPosition(19, 8);
			this.player1.stamina = 85;
			this.player2.stamina = 85;
		}

		//What if players collide with environment
		if(p1Ground.groundType == 'water') {
			this.player1.setPosition(0, 6);
			this.player1.stamina = 30;
		}

		if(p2Ground.groundType == 'water') {
			this.player2.setPosition(19, 8);
			this.player2.stamina = 30;
		}

		//What if players collide with the car
		if(this.car !== null) {
			//player 1
			if(this.car.overlap(this.player1)) {
				this.player1.setPosition(0, 6);
				this.player1.stamina = 50;
			}
			if(this.car.overlap(this.player2)) {
				this.player2.setPosition(19, 8);
				this.player2.stamina = 50;
			}
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

		this.roadPoints = roadPoints;

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
						if(point - currentX > 2)
							currentX = point - 2;
						break;
					case 1:
						if(currentX - point > 2)
							currentX = point + 2;
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

	endGame() {
		this.playTime.stop();
		this.game.paused = true;
		var winner = null;
		console.log(this.player1.ownedTerrain, this.player2.ownedTerrain);
		if(this.player1.ownedTerrain > this.player2.ownedTerrain) {
			winner = this.player1;
		} else if(this.player2.ownedTerrain > this.player1.ownedTerrain) {
			winner = this.player2;
		}
		this.winnerText = new WinnerText(this.game, 400, 330);
		this.winnerText.anchor.set(0.5);
		this.winnerText.setWinner(winner);

		this.esc.onUp.add(function() {
			this.game.paused = false;
			this.game.state.restart();
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
		//cow farmer
		this.game.load.image('cow_farmer_sitting', 'def_sprites/game/cow_farmer_sitting_down.png');
		this.game.load.image('cow_farmer_down', 'def_sprites/game/cow_farmer_standing_down.png');
		this.game.load.image('cow_farmer_left', 'def_sprites/game/cow_farmer_standing_left.png');
		this.game.load.image('cow_farmer_right', 'def_sprites/game/cow_farmer_standing_right.png');
		this.game.load.image('cow_farmer_up', 'def_sprites/game/cow_farmer_standing_up.png');

		//chicken farmer
		this.game.load.image('chicken_farmer_sitting', 'def_sprites/game/chicken_farmer_sitting_down.png');
		this.game.load.image('chicken_farmer_down', 'def_sprites/game/chicken_farmer_standing_down.png');
		this.game.load.image('chicken_farmer_left', 'def_sprites/game/chicken_farmer_standing_left.png');
		this.game.load.image('chicken_farmer_right', 'def_sprites/game/chicken_farmer_standing_right.png');
		this.game.load.image('chicken_farmer_up', 'def_sprites/game/chicken_farmer_standing_up.png');

		//car
		this.game.load.image('car_left', 'def_sprites/game/car_left.png');
		this.game.load.image('car_right', 'def_sprites/game/car_right.png');

		//sound
		this.game.load.audio('cow_sp', 'sounds/cow_spawn.mp3');
		this.game.load.audio('chicken_sp', 'sounds/chicken_spawn.mp3');
		this.game.load.audio('shovel_1', 'sounds/shovel_1.mp3');
		this.game.load.audio('shovel_2', 'sounds/shovel_2.mp3');
		this.game.load.audio('car', 'sounds/car.mp3');
	}

}

export default GameState;
