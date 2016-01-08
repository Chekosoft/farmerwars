export default class StatusText extends Phaser.Text {

    constructor(game, x, y, align) {
        super(game, x, y, "",
        {
            font: "14px Wellfleet",
            align: align || "left",
            fill : "#ffffff"
        });
        this.game.stage.addChild(this);
    }

    updateStatus(player) {
        let playerType = '';
        switch(player.playerType) {
            case 'cow_farmer':
                playerType = 'Cow Farmer';
                break;
            case 'chicken_farmer':
                playerType = 'Chicken Farmer';
                break;
        }
        var playerStatus = `${playerType}
Energy: ${player.stamina} Score: ${player.score}`;

this.setText(playerStatus);
    }
}
