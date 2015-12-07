export default class StatusText extends Phaser.Text {

    constructor(game, x, y, player) {
        super(game, x, y, "asdf",
        {
            font: "14px Droid Sans",
            align: "left",
            fill : "#ffffff"
        });
        this.player = player;
        this.game.stage.addChild(this);
    }

    updateStatus(player) {
        var playerStatus = `Player Type: ${player.playerType}, Is resting: ${(player.isTired) ? "Yes" : "No"}
Energy: ${player.stamina}, Score: ${player.score}, Can move? ${player.canMove}`;

this.setText(playerStatus);
    }
}
