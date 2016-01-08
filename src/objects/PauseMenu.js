var config = {
  'font': 'Wellfleet',
  'fontsize_normal': '36px',
  'fontsize_small': '30px',
  'grid_size': 300
}

export default class Player extends Phaser.Sprite {
  constructor(game, player1, player2) {
    super(game, 0, 0, 'pause_menu');
    this.anchor.x = 0;
    this.anchor.y = 0;
    this.player1 = player1;
    this.player2 = player2;

    let bigStyle = `${config.fontsize_normal} ${config.font}`;
    let smallStyle = `${config.fontsize_small} ${config.font}`;

    this.p1terraintext = this.game.add.text(495, 245, '', {
      font: bigStyle
    });
    this.p2terraintext = this.game.add.text(495, 295, '', {
      font: bigStyle
    });

    this.playbutton = this.game.add.button(400, 450, 'play-button',
     null, this, 1, 0, 2, 0);
     this.playbutton.anchor.x = 0.5;
     this.playbutton.anchor.y = 0.5;

     this.backbutton = this.game.add.button(200, 450, 'menu-button',null, this, 1, 0, 2, 0);

      this.backbutton.anchor.x = 0.5;
      this.backbutton.anchor.y = 0.5;

      this.restartbutton = this.game.add.button(600, 450, 'restart-button',
       null, this, 1, 0, 2, 0);

       this.restartbutton.anchor.x = 0.5;
       this.restartbutton.anchor.y = 0.5;


    this.game.stage.addChild(this);
    this.addChild(this.p1terraintext);
    this.addChild(this.p2terraintext);
    this.addChild(this.backbutton);
    this.addChild(this.playbutton);
    this.addChild(this.restartbutton);
    this.updateText();

    this.game.input.onDown.add(function(e) {
      if(this.game.paused) {
        let cursor_x = e.x;
        let cursor_y = e.y;

        if(this.backbutton.getBounds().contains(cursor_x, cursor_y)) {
          this.game.paused = false;
          this.visible = false;
          this.game.input.onDown.dispose();
          this.game.state.start('MainMenu');
          this.destroy();
        } else if(this.playbutton.getBounds().contains(cursor_x, cursor_y)) {
          this.game.paused = false;
          this.visible = false;
          this.game.input.onDown.dispose();
          this.game.state.getCurrentState().music.resume();
          this.destroy();
        } else if(this.restartbutton.getBounds().contains(cursor_x, cursor_y)) {
          this.game.paused = false;
          this.visible = false;
          this.game.input.onDown.dispose();
          this.game.state.restart();
          this.destroy();
        }
      }
    }, this);
  }

  updateText() {
    let p1TerrainText = Math.round((this.player1.ownedTerrain / config.grid_size) * 100);
    let p2TerrainText = Math.round((this.player2.ownedTerrain / config.grid_size) * 100);
    this.p1terraintext.setText(p1TerrainText + '%');
    this.p2terraintext.setText(p2TerrainText + '%');
  }
}
