export default class TimeText extends Phaser.Text {

    constructor(game, x, y) {
        super(game, x, y, "",
        {
            font: "16px Wellfleet",
            align: "center",
            fill : "#ffffff"
        });
        this.game.stage.addChild(this);
    }

    updateStatus(time, timeEvent) {
        let secs = Math.round((timeEvent.delay - time.ms) / 1000);
        let minutes = '0' + Math.floor(secs/60);
        let seconds = '0' + (secs - (minutes * 60));
        var timeStatus = `Remaining Time:
${minutes.substr(-2)}:${seconds.substr(-2)}`;

        this.setText(timeStatus);
    }
}
