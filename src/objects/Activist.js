var config = {
    width: 40,
    height: 40
};


export default class Activist extends Phaser.Sprite {
	constructor(game) {
		//get nearest chicken field
		let x = game.rnd.between(3,11);
		//let x = 0;
		let y = game.rnd.pick([0, 14]);
		let state = game.state.getCurrentState();

		while(state._getFloorAt(x, y).groundType == 'water') {
			x += (state.player1.initial_orientation == 'left') ? -1 : 1;
		}
		super(game, x*config.width, y*config.height, (y == 0) ? 'activist_down' : 'activist_up');
		this.orientation = (y == 0) ? 'down' : 'up';
		this.grid_x = x;
		this.grid_y = y;
		this.isSleeping = false;
    this.canMove = true;
		this.nearestCow = Activist.getNearestCow(game, x, y);
		this.moveEvent = this.game.time.create(false);
		this.sleepEvent = this.game.time.create(false);
		this.eatenAnimals = 0;
		this.game.stage.addChild(this);
		this.startMovementLoop();
	}

	moveToChicken() {
		let rel_x = this.grid_x - this.nearestCow.x;
		let rel_y = this.grid_y - this.nearestCow.y
		let x_distance = Math.abs(rel_x);
		let y_distance = Math.abs(rel_y);
		let state = this.game.state.getCurrentState();

		if(x_distance > 0 || y_distance > 0) {
			let x_step = 0;
			let y_step = 0;
			if(x_distance == 0) {
				y_step = (rel_y > 0) ? -1 : 1;
			} else if (y_distance == 0) {
				x_step = (rel_x > 0) ? -1 : 1;
			} else if (x_distance < y_distance) {
				x_step = (rel_x > 0) ? -1 : 1;
			} else if(y_distance < x_distance ) {
				y_step = (rel_y > 0) ? -1 : 1;
			}
      if(this.canMove){
  			if(x_step > 0) {
  				this.goRight();
  			} else if(x_step < 0) {
  				this.goLeft();
  			}
  			if(y_step < 0) {
  				this.goUp();
  			} else if(y_step > 0) {
  				this.goDown();
  			}
      }

      this.current_floor = state._getFloorAt(this.grid_x, this.grid_y);

			if(this.current_floor.groundType == 'grass' && this.current_floor.animals > 0){
				this.eatChicken();
			} else if((this.current_floor.groundType != 'grass'
        || this.current_floor.animals == 0)
        && this.canMove == false) {
          this.resumeMovementLoop();
        }
        else {
			    this.isTargetStillChicken();
			}
		} else {
      if(this.canMove == false)
        this.resumeMovementLoop();
			this.isTargetStillChicken();
		}
	}

	startMovementLoop() {
		this.moveEvent.loop(Phaser.Timer.SECOND * 0.8, this.moveToChicken, this);
		this.moveEvent.start();
	}

  pauseMovementLoop() {
    this.canMove = false;
    this.moveEvent.pause();
  }

  resumeMovementLoop() {
    this.canMove = true;
    this.moveEvent.resume();
  }


  stopAllTimers() {
    this.sleepEvent.stop();
    this.moveEvent.stop();
  }

	isTargetStillChicken() {
		if(this.current_floor &&
      this.current_floor.groundType == 'grass' &&
      this.current_floor.animals > 0) {
			return;
		} else {
			this.nearestCow = Activist.getNearestCow(this.game, this.grid_x, this.grid_y);
		}
	}

	eatChicken() {
		if(this.current_floor.groundType == 'grass' && this.current_floor.animals > 0) {
			this.current_floor.hasActivist = true;
      this.current_floor.setActivist(this);
      this.pauseMovementLoop();
		}
	}

  isActivistSleepy() {
    if(this.eatenAnimals >= 5) {
      this.goToSleep();
    } else {
      this.resumeMovementLoop();
    }
  }

	goToSleep() {
		this.isSleeping = true;
		this.loadTexture('activist_sleep');
		this.sleepEvent.add(Phaser.Timer.SECOND * 5, function() {
			this.eatenAnimals = 0;
			this.isSleeping = false;
			this.loadTexture('activist_' + this.orientation);
			this.isTargetStillChicken();
			this.resumeMovementLoop();
		}, this);
		this.sleepEvent.start();
	}

	updateTexture() {
		this.loadTexture('activist_' + this.orientation);
	}

	_repositionSprite() {
		this.position.x = this.grid_x * config.width;
		this.position.y = this.grid_y * config.height;
	}

    goLeft() {
        this.grid_x = (this.grid_x == 0) ? 0 : this.grid_x - 1;
        this.orientation = 'left';
	    this.updateTexture();
        this._repositionSprite();
    }

    goRight() {
        this.grid_x = (this.grid_x == 19) ? 19 : this.grid_x + 1;
        this.orientation = 'right';
        this.updateTexture();
        this._repositionSprite();
    }

    goUp() {
        this.grid_y = (this.grid_y == 0) ? 0 : this.grid_y - 1;
        this.orientation = 'up';
        this.updateTexture();
        this._repositionSprite();
    }

    goDown(){
        this.grid_y = (this.grid_y == 14) ? 14 : this.grid_y + 1;
        this.orientation = 'down';
        this.updateTexture();
        this._repositionSprite();
    }


	static getNearestCow(game, x, y) {
		var position = {x: -1, y: -1};
		let state = game.state.getCurrentState();
		let current_distance = -1;
		let found = false;

		for(let i = 0, max = state.cow_lands.length; i < max; i++) {
			let field = state.cow_lands[i];
			let distance = Math.sqrt(
				Math.pow(x - field.grid_x, 2) + Math.pow(y - field.grid_y, 2)
			);

			if(field.animals == 0) {
				continue;
			} else {
				found = true;
				if(current_distance == -1 || distance < current_distance) {
					position.x = field.grid_x;
					position.y = field.grid_y;
					current_distance = distance;
				} else {
					break;
				}
			}
		}

		if(found)
			return position;
		else {
			return state.cow_farmer.getPosition();
		}
	}
}
