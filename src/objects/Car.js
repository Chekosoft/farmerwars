var config = {
    carwidth: 40,
    carheight: 40
};


export default class Car extends Phaser.Sprite {
    constructor(game, y, orientation) {
        let x = null;
        orientation = orientation || game.rnd.pick(['left', 'right']);
        if(orientation == 'right')
            x = -1*config.carwidth;
        else if(orientation == 'left')
            x = 20*config.carwidth;

        super(game, x, y*config.carwidth, 'car_' + orientation);
        this.orientation = orientation;
        this.stop_at = (orientation == 'left') ? -1*config.carwidth : 20 * config.carwidth;
        this.game.stage.addChild(this);
    }
}
