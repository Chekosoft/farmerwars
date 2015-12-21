var config = {
    playerwidth: 40,
    playerheight: 40
}

export default class Player extends Phaser.Sprite {
    constructor(game, x, y, type, orientation) {
        super(game, x*config.playerwidth, y*config.playerheight, type + '_' + orientation);
        this.playerType = type;
        this.grid_x = x;
        this.grid_y = y;
        this.canMove = true;
        this.isTired = false;
        this.score = 0;
        this.ownedTerrain = 0;
        this.game.stage.addChild(this);
        this.max_stamina = 100;
        this.stamina = this.max_stamina;
    }

    setMovementDelay(delay) {
        this.movementDelay = delay;
    }

    setRecoveryDelay(delay) {
        this.recoveryDelay = delay;
    }

    lowerStamina(factor) {
        this.stamina -= factor;
        this.checkStamina();
    }

    checkStamina() {
        if(this.stamina <= 0) {
            this.isTired = true;
            this.stamina = 0;
            this.canMove = false;
            this.loadTexture(this.playerType + '_sitting');
            this.game.time.events.add(
            this.recoveryDelay,
            function() {
                this.stamina = this.max_stamina;
                this.canMove = true;
                this.isTired = false;
                this.updateTexture();
            },
            this);
        }
    }

    _stopMoving() {
        if(this.canMove && !this.isTired){
            this.canMove = false;
            this.game.time.events.add(this.movementDelay, function() {
                if(!this.isTired)
                    this.canMove = true;
            }, this);
        }
    }

    getPosition() {
        return {
            x: this.grid_x,
            y: this.grid_y
        };
    }

    updateTexture() {
        this.loadTexture(this.playerType + '_' + this.orientation);
    }

    setPosition(x, y) {
        this.grid_x = x;
        this.grid_y = y;
        this._repositionSprite();
    }

    _repositionSprite() {
        this.position.x = config.playerwidth * this.grid_x;
        this.position.y = config.playerwidth * this.grid_y;
        this._stopMoving();
        this.checkStamina();
        this.updateTexture();
    }

    goLeft() {
        if(this.canMove && !this.isTired){
            this.grid_x = (this.grid_x == 0) ? 0 : this.grid_x - 1;
            this.orientation = 'left';
            this.updateTexture();
            this._repositionSprite();
        }
    }

    goRight() {
        if(this.canMove && !this.isTired){
            this.grid_x = (this.grid_x == 19) ? 19 : this.grid_x + 1;
            this.orientation = 'right';
            this.updateTexture();
            this._repositionSprite();
        }
    }

    goUp() {
        if(this.canMove && !this.isTired){
            this.grid_y = (this.grid_y == 0) ? 0 : this.grid_y - 1;
            this.orientation = 'up';
            this.updateTexture();
            this._repositionSprite();
        }
    }

    goDown(){
        if(this.canMove && !this.isTired){
            this.grid_y = (this.grid_y == 14) ? 14 : this.grid_y + 1;
            this.orientation = 'down';
            this.updateTexture();
            this._repositionSprite();
        }
    }

}
