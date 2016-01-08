import _ from 'lodash';
import Floor from '../objects/Floor';
import Player from '../objects/Player';
import PauseMenu from '../objects/PauseMenu';
import StatusText from '../objects/StatusText';
import TimeText from '../objects/TimeText';
import WinnerText from '../objects/WinnerText';
import Car from '../objects/Car';
import Fox from '../objects/Fox';
import Activist from '../objects/Activist';

class GameState extends Phaser.State {

	create() {
		var self = this;

		//Terrain
		this.ground = this.game.add.group();
		this.buildMap();

		this.gameEnded = false;

		//Player initial positions
		let player1type = this.game.rnd.pick(['cow_farmer', 'chicken_farmer']);
		let p1_initial_y = this.game.rnd.between(3, 11);

		this.player_data = {
			p1: {
				type: player1type,
				initial_y: p1_initial_y,
				initial_x: 0
			},
			p2: {
				type: (player1type == 'cow_farmer') ? 'chicken_farmer' : 'cow_farmer',
				initial_y: 14 - p1_initial_y,
				initial_x: 19
			}
		};

		this.player_data.farmers = {
			chicken: {
				y: (this.player_data.p1.type == 'chicken_farmer') ? this.player_data.p1.initial_y : this.player_data.p2.initial_y,
				x: (this.player_data.p1.type == 'chicken_farmer') ? this.player_data.p1.initial_x : this.player_data.p2.initial_x,
			},
			cow: {
				x: (this.player_data.p1.type == 'cow_farmer') ? this.player_data.p1.initial_x : this.player_data.p2.initial_x,
				y: (this.player_data.p1.type == 'cow_farmer') ? this.player_data.p1.initial_y : this.player_data.p2.initial_y,
			}
		}

		//Players
		this.player1 = new Player(this.game,
			this.player_data.p1.initial_x,
			this.player_data.p1.initial_y,
			this.player_data.p1.type,
			'right');

		this.player2 = new Player(this.game,
			this.player_data.p2.initial_x,
			this.player_data.p2.initial_y,
			this.player_data.p2.type,
			'left');

		this.chicken_farmer = (this.player_data.p1.type == 'chicken_farmer') ? this.player1 : this.player2;
		this.cow_farmer = (this.player_data.p1.type == 'cow_farmer') ? this.player1 : this.player2;

		this.chicken_farmer.setMovementDelay(300);
		this.chicken_farmer.setRecoveryDelay(1000);
		this.cow_farmer.setMovementDelay(500);
		this.cow_farmer.setRecoveryDelay(500);

		this.player1Status = new StatusText(this.game, 25, 600, "left");
		this.player2Status = new StatusText(this.game, 630, 600, "right");
		this.timerStatus = new TimeText(this.game, 340, 600);

		//Terrain groups
		this.chicken_lands = [];
		this.cow_lands = [];

		//Hazards
		this.car = null;
		this.fox = null;
		this.activist = null;

		//pause menu
		this.pause_menu = null;

		//Timers
		this.playTime = this.game.time.create(true);
		this.playTimeEvent = this.playTime.add(Phaser.Timer.MINUTE * 2,
			this.endGame, this);
		//this.playTimeEvent = this.playTime.add(Phaser.Timer.SECOND * 5,
		//	this.endGame, this);

		//cartimer
		this.carTimer = this.game.time.create(true);
		this.carTimer.loop(Phaser.Timer.SECOND * 15, function() {
			this.car = new Car(this.game,
				this.game.rnd.pick(this.roadPoints),
				this.game.rnd.pick(['left', 'right']));
			let tween = this.game.add.tween(this.car).
				to({ x : this.car.stop_at }, Phaser.Timer.SECOND * 3,
				 Phaser.Easing.Linear.None);
			tween.onComplete.add(function() {
				if(this.car){
					this.car.destroy(true);
					this.car = null;
				}
			}, this);
			this.car_sound.play();
			tween.start();
		}, this);

		this.foxTimer = this.game.time.create(true);
		this.foxTimer.loop(Phaser.Timer.SECOND * this.game.rnd.between(25,30), function() {
			if(this.fox == null) {
				this.fox = new Fox(this.game);
				this.foxTimer.pause();
			}
		}, this);

		this.activistTimer = this.game.time.create(true);
		this.activistTimer.loop(Phaser.Timer.SECOND * this.game.rnd.between(25,30), function() {
			if(this.activist == null) {
				this.activist = new Activist(this.game);
				this.activistTimer.pause();
			}
		}, this);

		//Audio assets (to not overcrowd the environment)
		this.cow_sound = this.game.add.audio('cow_sp');
		this.chicken_sound = this.game.add.audio('chicken_sp');
		this.shovel_1 = this.game.add.audio('shovel_1');
		this.shovel_2 = this.game.add.audio('shovel_2');
		this.car_sound = this.game.add.audio('car');
		this.splash = this.game.add.audio('splash');
		this.music = this.game.add.audio('music');

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
		this.esc.onUp.add(function() {
			if((this.pause_menu == null || this.pause_menu.visible == false) && !this.gameEnded) {
				this.pause_menu = new PauseMenu(this.game, this.player1, this.player2);
				this.game.paused = true;
				this.music.pause();
			}
		}, this);

		//Start timers
		this.playTime.start();
		this.carTimer.start();
		this.foxTimer.start();
		this.activistTimer.start();
		this.music.play();
	}

	_movePlayer(key, player, place) {
		if(!player.canMove || this.gameEnded) return;
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
				if(this.chicken_lands.indexOf(tileOn) < 0) {
					this.chicken_lands.push(tileOn);
				}

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
				if(this.cow_lands.indexOf(tileOn) < 0) {
					this.cow_lands.push(tileOn);
				}
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
		this.music.stop();
		this.player1.destroy(true);
		this.player2.destroy(true);
		this.player1Status.destroy(true);
		this.player2Status.destroy(true);
		this.timerStatus.destroy(true);
		this.carTimer.stop();
		this.carTimer.destroy(true);
		this.playTime.stop(true);
		this.playTime.destroy();
		this.ground.destroy();
		if(this.fox)
			this.fox.destroy();
		if(this.activist)
			this.activist.destroy();
		if(this.car)
			this.car.destroy();
	}

	update() {
		//Update statustexts
		this.player1Status.updateStatus(this.player1);
		this.player2Status.updateStatus(this.player2);
		this.timerStatus.updateStatus(this.playTime, this.playTimeEvent);

		//Get floor
		var chickenFarmerPos = this.chicken_farmer.getPosition(),
			cowFarmerPos = this.cow_farmer.getPosition();
		var chfGround = this._getFloorAt(chickenFarmerPos.x, chickenFarmerPos.y),
			cofGround = this._getFloorAt(cowFarmerPos.x, cowFarmerPos.y);

		//What if players collide with each other
		if(_.isEqual(chickenFarmerPos, cowFarmerPos)) {
			this.player1.setPosition(this.player_data.p1.initial_x, this.player_data.p1.initial_y);
			this.player2.setPosition(this.player_data.p2.initial_x, this.player_data.p2.initial_y);
			this.player1.stamina = 85;
			this.player2.stamina = 85;
		}

		//What if players collide with environment
		if(chfGround.groundType == 'water') {
			this.chicken_farmer.visible = false;
			chfGround.loadTexture('chicken_farmer_drown');

			this.chicken_farmer.setPosition(
				this.player_data.farmers.chicken.x,
				this.player_data.farmers.chicken.y
			);
			this.chicken_farmer.canMove = false;
			this.chicken_farmer.stamina = 0;
			this.splash.play();


			this.game.time.events.add(Phaser.Timer.SECOND * 2, function(ground) {
				ground.loadTexture('water');
				this.chicken_farmer.orientation = this.chicken_farmer.initial_orientation;
				this.chicken_farmer.updateTexture();
				this.chicken_farmer.stamina = 30;
				this.chicken_farmer.visible = true;
				this.chicken_farmer.canMove = true;
			}, this, chfGround);

		}

		if(cofGround.groundType == 'water') {
			this.cow_farmer.visible = false;
			cofGround.loadTexture('cow_farmer_drown');

			this.cow_farmer.setPosition(
				this.player_data.farmers.cow.x,
				this.player_data.farmers.cow.y
			);
			this.cow_farmer.canMove = false;
			this.cow_farmer.stamina = 0;
			this.splash.play();


			this.game.time.events.add(Phaser.Timer.SECOND * 2, function(ground) {
				ground.loadTexture('water');
				this.cow_farmer.orientation = this.cow_farmer.initial_orientation;
				this.cow_farmer.updateTexture();
				this.cow_farmer.stamina = 30;
				this.cow_farmer.visible = true;
				this.cow_farmer.canMove = true;
			}, this, cofGround);
		}

		//What if players collide with the car
		if(this.car !== null) {
			//chicken farmer
			//FIXME: Add ouch sound!
			let intersect_chf = Phaser.Rectangle.intersection(this.car.getBounds(), this.chicken_farmer.getBounds());
			let intersect_cof = Phaser.Rectangle.intersection(this.car.getBounds(), this.cow_farmer.getBounds());
			if(intersect_chf.height >= 40) {
				this.chicken_farmer.canMove = false;
				this.chicken_farmer.stamina = 0;
				this.chicken_farmer.loadTexture('chicken_farmer_runover');
				this.game.time.events.add(Phaser.Timer.SECOND  * 2, function() {
					this.chicken_farmer.setPosition(
						this.player_data.farmers.chicken.x,
						this.player_data.farmers.chicken.y
						);
					this.chicken_farmer.updateTexture();
					this.chicken_farmer.stamina = 50;
					this.chicken_farmer.canMove = true;
				}, this);
			}

			//cow farmer
			if(intersect_cof.height >= 40) {
				this.cow_farmer.canMove = false;
				this.cow_farmer.stamina = 0;
				this.cow_farmer.loadTexture('cow_farmer_runover');
				this.game.time.events.add(Phaser.Timer.SECOND  * 2, function() {
					this.cow_farmer.setPosition(
						this.player_data.farmers.cow.x,
						this.player_data.farmers.cow.y
						);
					this.cow_farmer.updateTexture();
					this.cow_farmer.stamina = 50;
					this.cow_farmer.canMove = true;
				}, this);
			}

			if(this.fox) {
				let intersect_fox = Phaser.Rectangle.intersection(this.fox.getBounds(), this.car.getBounds());
				if(intersect_fox.height >= 40) {
					this.fox.pauseMovementLoop();
					this.fox.stopAllTimers();
					this.fox.loadTexture('fox_dead');

					this.game.time.events.add(Phaser.Timer.SECOND * 2, function (){
							this.fox.visible = false;
							this.fox.destroy();
							this.fox = null;
							this.foxTimer.resume();
					});
				}
			}

			if(this.activist) {
				let intersect_activist = Phaser.Rectangle.intersection(this.activist.getBounds(), this.car.getBounds());
				if(intersect_activist.height >= 40) {
					this.activist.pauseMovementLoop();
					this.activist.stopAllTimers();
					this.activist.loadTexture('activist_dead');

					this.game.time.events.add(Phaser.Timer.SECOND * 2, function (){
							this.activist.visible = false;
							this.activist.destroy();
							this.activist = null;
							this.activistTimer.resume();
					});
				}
			}
		}

		if(this.fox) {

			let fox_ground = this._getFloorAt(this.fox.grid_x, this.fox.grid_y);

			if(this.fox.grid_x == this.chicken_farmer.grid_x &&
				this.fox.grid_y == this.chicken_farmer.grid_y) {
					if(this.fox.isSleeping) {
						this.fox.pauseMovementLoop();
						this.fox.stopAllTimers();
						this.fox.loadTexture('fox_dead');
						this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
							this.fox.destroy();
							this.fox = null;
							this.foxTimer.resume();
							this.chicken_farmer.stamina -= 10;
							this.chicken_farmer.score += 100;
						}, this);
					} else if(!this.fox.isSleeping && this.chicken_farmer.canMove) {
						this.chicken_farmer.canMove = false;
						this.chicken_farmer.stamina = 0;
						this.chicken_farmer.loadTexture('chicken_farmer_runover');
						this.game.time.events.add(Phaser.Timer.SECOND  * 2, function() {
							this.chicken_farmer.setPosition(
								this.player_data.farmers.chicken.x,
								this.player_data.farmers.chicken.y
								);
							this.chicken_farmer.updateTexture();
							this.chicken_farmer.stamina = 50;
							this.chicken_farmer.canMove = true;
						}, this);
					}
			}

			if(this.fox.grid_x == this.cow_farmer.grid_x &&
				this.fox.grid_y == this.cow_farmer.grid_y) {
					if(!this.fox.isSleeping) {
						this.cow_farmer.canMove = false;
						this.cow_farmer.stamina = 0;
						this.cow_farmer.loadTexture('cow_farmer_runover');

						this.game.time.events.add(Phaser.Timer.SECOND  * 2, function() {
							this.cow_farmer.setPosition(
								this.player_data.farmers.cow.x,
								this.player_data.farmers.cow.y
								);
							this.cow_farmer.updateTexture();
							this.cow_farmer.stamina = 50;
							this.cow_farmer.canMove = true;
							}, this);
					}
				}

			if(fox_ground.groundType == 'water') {
				this.fox.visible = false;
				fox_ground.loadTexture('fox_drown');
				this.fox.stopAllTimers();
				this.splash.play();
				this.fox.destroy();
				this.fox = null;
				this.game.time.events.add(Phaser.Timer.SECOND * 2, function(ground) {
					this.foxTimer.resume();
					ground.loadTexture('water');
				}, this, fox_ground);
			}
		}

		if(this.activist) {

			let activist_ground = this._getFloorAt(this.activist.grid_x, this.activist.grid_y);

			if(this.activist.grid_x == this.cow_farmer.grid_x &&
				this.activist.grid_y == this.cow_farmer.grid_y) {
					if(this.activist.isSleeping) {
						this.actvist.pauseMovementLoop();
						this.activist.stopAllTimers();
						this.activist.loadTexture('activist_dead');
						this.game.time.events.add(Phaser.Timer.SECOND * 2, function() {
							this.activist.destroy();
							this.activist = null;
							this.activistTimer.resume();
							this.cow_farmer.stamina -= 10;
							this.cow_farmer.score += 100;
						}, this);
					} else if(!this.activist.isSleeping && this.cow_farmer.canMove) {
						this.cow_farmer.canMove = false;
						this.cow_farmer.stamina = 0;
						this.cow_farmer.loadTexture('cow_farmer_runover');
						this.game.time.events.add(Phaser.Timer.SECOND  * 2, function() {
							this.cow_farmer.setPosition(
								this.player_data.farmers.cow.x,
								this.player_data.farmers.cow.y
								);
							this.cow_farmer.updateTexture();
							this.cow_farmer.stamina = 50;
							this.cow_farmer.canMove = true;
						}, this);
					}
			}

			if(this.activist.grid_x == this.chicken_farmer.grid_x &&
				this.activist.grid_y == this.chicken_farmer.grid_y) {
					if(!this.activist.isSleeping && this.chicken_farmer.canMove) {
						this.chicken_farmer.canMove = false;
						this.chicken_farmer.stamina = 0;
						this.chicken_farmer.loadTexture('chicken_farmer_runover');

						this.game.time.events.add(Phaser.Timer.SECOND  * 2, function() {
							this.chicken_farmer.setPosition(
								this.player_data.farmers.chicken.x,
								this.player_data.farmers.chicken.y
								);
							this.chicken_farmer.updateTexture();
							this.chicken_farmer.stamina = 50;
							this.chicken_farmer.canMove = true;
							}, this);
					}
				}

			if(activist_ground.groundType == 'water') {
				this.activist.visible = false;
				activist_ground.loadTexture('activist_drown');
				this.activist.stopAllTimers();
				this.splash.play();
				this.activist.destroy();
				this.activist = null;
				this.game.time.events.add(Phaser.Timer.SECOND * 2, function(ground) {
					this.activistTimer.resume();
					ground.loadTexture('water');
				}, this, activist_ground);
			}
		}

		if(this.fox && this.activist) {
			if(this.activist.grid_x == this.fox.grid_x &&
				this.activist.grid_y == this.fox.grid_y) {
					if(!this.fox.isSleeping && this.activist.canMove) {
						this.activist.pauseMovementLoop();
						this.activist.stopAllTimers();
						this.activist.loadTexture('activist_dead');

						this.game.time.events.add(Phaser.Timer.SECOND  * 2, function() {
							this.activist.destroy();
							this.activist = null;
							this.activistTimer.resume();
							}, this);
					}
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

		var roadPoints = [3,11,7].filter(function(el) {
			return (this.game.rnd.between(0,4) > 2);
		}, this);

		if(roadPoints.length <= 1) {
			roadPoints = [7];
		}

		this.roadPoints = roadPoints;

		roadPoints.forEach(function(point) {
			for(let i = 0; i < 20; i++) {
				this._getFloorAt(i, point).changeType('pavement');
			}
		}, this);

		var waterSeeds = [4,9,10,14].filter(function(el) {
			return (this.game.rnd.between(0,4) > 2);
		}, this);

		if(waterSeeds.length == 0) {
			waterSeeds = [4, 14];
		}

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
		let player1 = {
			ownedTerrain: this.player1.ownedTerrain,
			type: this.player1.playerType,
		}
		let player2 = {
			ownedTerrain: this.player2.ownedTerrain,
			type: this.player2.playerType,
		}

		this.playTime.stop();
		this.music.stop();
		//this.game.input.keyboard.clearCaptures();
		//this.game.input.keyboard.destroy();
		this.gameEnded = true;
		this.player1.stamina = 0;
		this.player2.stamina = 0;
		this.player1.canMove = false;
		this.player2.canMove = false;
		let endImage = this.game.add.image(0, 0, 'timesup');
		endImage.bringToTop();

		this.foxTimer.stop();
		this.activistTimer.stop();
		this.carTimer.stop();

		if(this.activist)
			this.activist.stopAllTimers();
		if(this.fox)
			this.fox.stopAllTimers();


		this.ground.children.forEach(function(el) {
			el.stopGrowTimer();
		});

		this.game.time.events.add(Phaser.Timer.SECOND * 3, function() {
			this.game.state.start('AfterGame', true, false, player1, player2);
		}, this);

		/*
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
			this.game.state.restart(true);
		}, this);
		*/

	}

	preload() {
		//sprites

		//ground types
		this.game.load.image('water', 'sprites/new/water.png');
		this.game.load.image('water_drown', 'sprites/new/water_drown.png');
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
		this.game.load.image('cow_farmer_drown', 'def_sprites/game/cow_farmer_drown.png');
		this.game.load.image('cow_farmer_runover', 'def_sprites/game/cow_farmer_runover.png');

		//chicken farmer
		this.game.load.image('chicken_farmer_sitting', 'def_sprites/game/chicken_farmer_sitting_down.png');
		this.game.load.image('chicken_farmer_down', 'def_sprites/game/chicken_farmer_standing_down.png');
		this.game.load.image('chicken_farmer_left', 'def_sprites/game/chicken_farmer_standing_left.png');
		this.game.load.image('chicken_farmer_right', 'def_sprites/game/chicken_farmer_standing_right.png');
		this.game.load.image('chicken_farmer_up', 'def_sprites/game/chicken_farmer_standing_up.png');
		this.game.load.image('chicken_farmer_drown', 'def_sprites/game/chicken_farmer_drown.png');
		this.game.load.image('chicken_farmer_runover', 'def_sprites/game/chicken_farmer_runover.png');

		this.game.load.image('fox_left', 'def_sprites/game/fox_left.png');
		this.game.load.image('fox_right', 'def_sprites/game/fox_right.png');
		this.game.load.image('fox_down', 'def_sprites/game/fox_down.png');
		this.game.load.image('fox_up', 'def_sprites/game/fox_up.png');
		this.game.load.image('fox_dead', 'def_sprites/game/fox_dead.png');
		this.game.load.image('fox_sleep', 'def_sprites/game/fox_sleep.png');
		this.game.load.image('fox_drown', 'def_sprites/game/fox_drown.png');

		this.game.load.image('activist_left', 'def_sprites/game/hippie-left.png');
		this.game.load.image('activist_right', 'def_sprites/game/hippie-right.png');
		this.game.load.image('activist_down', 'def_sprites/game/hippie-down.png');
		this.game.load.image('activist_up', 'def_sprites/game/hippie-up.png');
		this.game.load.image('activist_dead', 'def_sprites/game/hippie-dead.png');
		this.game.load.image('activist_sleep', 'def_sprites/game/hippie-sleep.png');
		this.game.load.image('activist_drown', 'def_sprites/game/hippie-drown.png');

		//car
		this.game.load.image('car_left', 'def_sprites/game/car_left.png');
		this.game.load.image('car_right', 'def_sprites/game/car_right.png');

		//game pause
		this.game.load.image('pause_menu', 'def_sprites/game/game_paused.png');
		this.game.load.spritesheet('back-button',
		'def_sprites/game/back-button.png',
		164, 75);
		this.game.load.spritesheet('menu-button',
		'def_sprites/game/menu-button.png',
		164, 75);
		this.game.load.spritesheet('restart-button',
		'def_sprites/game/restart-button.png',
		164, 75);

		//timesup
		this.game.load.image('timesup', 'def_sprites/game/timesup.png');

		//sound
		this.game.load.audio('cow_sp', 'sounds/cow_spawn.mp3');
		this.game.load.audio('chicken_sp', 'sounds/chicken_spawn.mp3');
		this.game.load.audio('shovel_1', 'sounds/shovel_1.mp3');
		this.game.load.audio('shovel_2', 'sounds/shovel_2.mp3');
		this.game.load.audio('car', 'sounds/car.mp3');
		this.game.load.audio('splash', 'sounds/large_splash.mp3');

		this.game.load.audio('music', 'sounds/game_music.mp3');
	}

}

export default GameState;
