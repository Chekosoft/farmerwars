export default class StatusText extends Phaser.Text {

    constructor(game, x, y, player) {
        super(game, x, y, "",
        {
            font: "14px Droid Sans",
            align: "left",
            fill : "#ffffff"
        });
        this.player = player;
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
        var playerStatus = `Player Type: ${playerType}, Is resting: ${(player.isTired) ? "Yes" : "No"}
Energy: ${player.stamina} / ${player.max_stamina}, Score: ${player.score}, Can move? ${(player.canMove) ? "Yes" : "No"}`;

this.setText(playerStatus);
    }
}
