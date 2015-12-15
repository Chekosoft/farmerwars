var config = {
    floorwidth: 40,
    floorheight: 40,
    baseSpawnTime: 12,
    cowSpawnFactor: 1.1,
    chickenSpawnFactor: 0.8
}

export default class Floor extends Phaser.Sprite {
    constructor(game, x, y, type) {
        super(game, x*config.floorwidth, y*config.floorheight, type);
        this.groundType = type;
        this.grid_x = x;
        this.grid_y = y;
        this.animals = 0;
        this.growTimer = null;
        this.owner = null;

        // this.ne = this.game.add.sprite(config.floorwidth*x, config.floorheight*y, 'transparent_small');
        // this.nw = this.game.add.sprite(config.floorwidth*(x+20), config.floorheight*y, 'transparent_small');
        // this.se = this.game.add.sprite(config.floorwidth*x, config.floorheight*(y+20), 'transparent_small');
        // this.sw = this.game.add.sprite(config.floorwidth*(x+20), config.floorheight*(y+20), 'transparent_small');
        // this.animal = this.game.add.sprite(config.floorwidth*x, config.floorheight*y, 'transparent');
        //
        // this.addChild(this.ne);
        // this.addChild(this.nw);
        // this.addChild(this.se);
        // this.addChild(this.sw);
        // this.addChild(this.animal);

        this.game.stage.addChild(this);
    }

    getPosition() {
        return {
            x: this.grid_x,
            y: this.grid_y
        };
    }

    changeType(new_type) {
        this.groundType = new_type;
        this.loadTexture(new_type);
        this.animals = 0;
    }

    changeOwner(owner) {
        this.owner = owner;
    }

    startGrowTimer() {
        let time = config.baseSpawnTime;
        if(this.groundType == 'grains') {
            time *= config.chickenSpawnFactor;
        } else if(this.groundType == 'grass') {
            time *= config.cowSpawnFactor;
        }

        if(this.growTimer && this.growTimer.running) {
            this.stopGrowTimer();
            this.growTimer.destroy();
        }

        this.growTimer = this.game.time.create(false);
        this.growTimer.loop(
            Phaser.Timer.SECOND * time, this._growAnimals, this
        );
        this.growTimer.start();
    }

    stopGrowTimer() {
        if(this.growTimer.running) {
            this.growTimer.stop(true);
        }
    }

    _growAnimals() {
        this.animals++;
        this.owner.score += 20;
        var state = this.game.state.getCurrentState();
        if(this.animals <= 3) {
            if(this.owner.playerType == 'cow_farmer') {
                this.loadTexture('cow_' + this.animals);
                this.owner.score += 15;
                if(!state.cow_sound.isPlaying && this.game.rnd.between(0,2) == 2)
                    state.cow_sound.play();

            } else if(this.owner.playerType == 'chicken_farmer') {
                this.loadTexture('chicken_' + this.animals);
                this.owner.score += 10;
                if(!state.chicken_sound.isPlaying  && this.game.rnd.between(0,2) == 2)
                    state.chicken_sound.play();
            }
        }
        else {
            this.animals = 0;
            this.changeType('dead');
            this.stopGrowTimer();
        }
    }
}
