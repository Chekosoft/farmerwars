var config = {
    floorwidth: 40,
    floorheight: 40,
}

export default class Floor extends Phaser.Sprite {
    constructor(game, x, y, type) {
        super(game, x*config.floorwidth, y*config.floorheight, type);
        this.groundType = type;
        this.grid_x = x;
        this.grid_y = y;
        this.animals = 0;
        this.game.stage.addChild(this);
    }

    getPosition() {
        return {
            x: this.grid_x,
            y: this.grid_y
        };
    }

    changeType(new_type) {
        this.loadTexture(new_type);
        this.groundType = new_type;
    }
}
