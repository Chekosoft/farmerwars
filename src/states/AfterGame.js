var config = {
  'font': 'Wellfleet',
  'fontsize_normal': '36px',
  'fontsize_small': '30px',
  'terrain_amount': '300'
}

export default class AfterGame extends Phaser.Stage {
  preload() {
    this.game.load.spritesheet('menu-button',
    'def_sprites/game/menu-button.png',
    164, 75);
    this.game.load.spritesheet('restart-button',
    'def_sprites/game/restart-button.png',
    164, 75);
    this.game.load.image('results',
    'def_sprites/game/results-background.png');
  }

  init(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.stats = JSON.parse(window.localStorage.getItem('farmerwars'));
    if(this.stats === null) {
      this.stats = {
        played_games: 0,
        p1_victories: 0,
        p2_victories: 0,
        p1_owned_lands: 0,
        p2_owned_lands: 0,
      }
    }

    this.stats.played_games++;
    this.winner = null;
    this.stats.p1_owned_lands += this.player1.ownedTerrain;
    this.stats.p2_owned_lands += this.player2.ownedTerrain;
    if(this.player1.ownedTerrain > this.player2.ownedTerrain) {
      this.stats.p1_victories++;
      this.winner = this.player1;

    } else if(this.player2.ownedTerrain > this.player1.ownedTerrain) {
      this.stats.p2_victories++;
      this.winner = this.player2;
    }

    window.localStorage.setItem('farmerwars', JSON.stringify(this.stats));
  }


  create() {

    this.restart = this.game.add.button()

     let bigStyle = `${config.fontsize_normal} ${config.font}`;
     let normalStyle = `${config.fontsize_small} ${config.font}`;

     this.stats_bg = this.game.add.image(0, 0, 'results');

     let winnerString = 'Game ended in Draw';

     if(this.winner === this.player1){
       winnerString = 'Player 1 is the Winner!';
     } else if(this.winner === this.player2) {
       winnerString = 'Player2 is the Winner!';
     }

     this.winner_text = this.game.add.text(400, 160, winnerString , {
       font: bigStyle
     });
     this.winner_text.anchor.x = 0.5;
     this.winner_text.anchor.y = 0.5;

     this.p1_terrain_text = this.game.add.text(490, 245, this.player1.ownedTerrain,
       {
         font: normalStyle
       }
     );


     this.p1_percentage_text = this.game.add.text(570, 290,
       Math.round((this.player1.ownedTerrain / config.terrain_amount) * 100),
       {
         font: normalStyle
       }
     );

     this.p2_terrain_text = this.game.add.text(490, 350, this.player2.ownedTerrain,
     {
       font: normalStyle
     });

     this.p1_percentage_text = this.game.add.text(570, 410,
       Math.round((this.player2.ownedTerrain / config.terrain_amount) * 100),
       {
         font: normalStyle
       }
     );

     this.menubutton = this.game.add.button(200, 600 , 'menu-button',
      function() {
        this.game.state.start('MainMenu');
      }, this, 1, 0, 2, 0);

      this.menubutton.anchor.x = 0.5;
      this.menubutton.anchor.y = 0.5;

      this.restartbutton = this.game.add.button(600, 600 , 'restart-button',
       function() {
         this.game.state.start('GameState');
       }, this, 1, 0, 2, 0);

       this.restartbutton.anchor.x = 0.5;
       this.restartbutton.anchor.y = 0.5;
  }
}
