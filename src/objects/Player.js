var config = {
    playerwidth: 40,
    playerheight: 40
}

export default class Player extends Phaser.Sprite {
    constructor(game, x, y, type) {
        super(game, x*config.playerwidth, y*config.playerheight, type);
        this.grid_x = x;
        this.grid_y = y;
        this.game.stage.addChild(this);
    }


    setScore(score) {
        this.score = score;
    }

    getPosition() {
        return {
            x: this.grid_x,
            y: this.grid_y
        };
    }

    setPosition(x, y) {
        this.grid_x = x;
        this.grid_y = y;
        this._repositionSprite();
    }

    _repositionSprite() {
        this.position.x = config.playerwidth * this.grid_x;
        this.position.y = config.playerheight* this.grid_y;
    }


    goLeft() {
        this.grid_x = (this.grid_x == 0) ? 0 : this.grid_x - 1;
        this._repositionSprite();
    }

    goRight() {
        this.grid_x = (this.grid_x == 19) ? 19 : this.grid_x + 1;
        this._repositionSprite();
    }

    goUp() {
        this.grid_y = (this.grid_y == 0) ? 0 : this.grid_y - 1;
        this._repositionSprite();
    }

    goDown() {
        this.grid_y = (this.grid_y == 14) ? 14 : this.grid_y + 1;
        this._repositionSprite();
    }

    setFarmerType(type) {
        this.type = type;
    }
}
