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
        this.initialGroundType = type;
        this.grid_x = x;
        this.grid_y = y;
        this.animals = 0;
        this.growTimer = null;
        this.owner = null;
        this.soilRadius = 0;
        this.hasFox = false;
        this.hasActivist = false;
        this.fox = null;
        this.activist = null;

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
        this.stopGrowTimer();
    }

    changeOwner(owner) {
        if(this.owner !== null) {
            this.owner.ownedTerrain--;
        }
        this.owner = owner;
        if(owner !== null){
            owner.ownedTerrain++;
        }
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
        if(this.growTimer && this.growTimer.running) {
            this.growTimer.stop(true);
        }
    }

    setFox(foxInstance) {
      this.fox = foxInstance;
    }

    setActivist(activistInstance) {
      this.activist = activistInstance;
    }

    _growAnimals() {
        this.animals++;
        var state = this.game.state.getCurrentState();
        if(this.hasFox) {
         this.fox.eatenAnimals += this.animals;
         this.animals = 0;
         this.changeOwner(null);
         this.changeType('soil');
         this.fox.isFoxSleepy();
         this.stopGrowTimer();
         this.setFox(null);
         this.hasFox = false;
         let positionAt = state.chicken_lands.indexOf(this);
         if(positionAt >= 0)
             state.chicken_lands.splice(positionAt, 1);
       } else if(this.hasActivist) {
         this.activist.eatenAnimals += this.animals;
         this.animals = 0;
         this.changeOwner(null);
         this.changeType('soil');
         this.activist.isActivistSleepy();
         this.stopGrowTimer();
         this.setActivist(null);
         this.hasActivist = false;
         let positionAt = state.cow_lands.indexOf(this);
         if(positionAt >= 0)
             state.cow_lands.splice(positionAt, 1);
       }
       else if(this.animals <= 3) {
            if(this.owner.playerType == 'cow_farmer') {
                this.loadTexture('cow_' + this.animals);
                if(!state.cow_sound.isPlaying && this.game.rnd.between(0,2) == 2)
                    state.cow_sound.play();

            } else if(this.owner.playerType == 'chicken_farmer') {
                this.loadTexture('chicken_' + this.animals);
                if(!state.chicken_sound.isPlaying  && this.game.rnd.between(0,2) == 2)
                    state.chicken_sound.play();
            }
        }
        else {
            this.animals = 0;
            this.changeType('dead');

            if(this.owner.playerType == 'chicken_farmer'){
                let positionAt = state.chicken_lands.indexOf(this);
                if(positionAt >= 0)
                    state.chicken_lands.splice(positionAt, 1);
           }
            else if(this.owner.playerType == 'cow_farmer'){
                let positionAt = state.cow_lands.indexOf(this);
                if(positionAt >= 0)
                    state.cow_lands.splice(positionAt, 1);
            }

            this.changeOwner(null);
            this.stopGrowTimer();
        }
    }
}
