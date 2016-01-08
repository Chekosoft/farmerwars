export default class TimeText extends Phaser.Text {

    constructor(game, x, y) {
        super(game, x, y, "",
        {
            font: "32px Wellfleet",
            align: "center",
            fill : "#ffffff"
        });
        this.game.stage.addChild(this);
    }

    setWinner(player) {
        if(player === null) {
            this.setText('No one won :C');
        }
        else if(player.playerType == 'cow_farmer') {
            this.setText('Cow Farmer is the Winner!');
        } else if(player.playerType == 'chicken_farmer'){
            this.setText('Chicken Farmer is the Winner!');
        }
        this.setShadow(2, 2, 'rgba(0,0,0,1)', 3);
    }
}
