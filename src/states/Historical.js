var config = {
  'font': 'Wellfleet',
  'fontsize_big': '42px',
  'fontsize_normal': '36px',
  'fontsize_small': '30px'
}

export default class Historical extends Phaser.Stage {
  preload() {
    this.game.load.spritesheet('back-button',
    'def_sprites/game/back-button.png',
    164, 75);
    this.game.load.image('stats',
    'def_sprites/game/stats-background.png');
  }

  create() {
    this.playbutton = this.game.add.button(400, 600, 'back-button',
     function() {
       this.game.state.start('MainMenu');
     }, this, 1, 0, 2, 0);
     this.playbutton.anchor.x = 0.5;
     this.playbutton.anchor.y = 0.5;

     this.stats_bg = this.game.add.image(0, 0, 'stats');

     let bigStyle = `${config.fontsize_normal} ${config.font}`;
     let smallStyle = `${config.fontsize_small} ${config.font}`;

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

     this.played_games = this.game.add.text(460, 210, this.stats.played_games,
     {
       font: bigStyle
     });

     this.p1_victories= this.game.add.text(530, 260, this.stats.p1_victories,
     {
       font: bigStyle
     });

     this.p2_victories = this.game.add.text(520, 310, this.stats.p2_victories,
     {
       font: bigStyle
     });

     this.p1_owned_lands = this.game.add.text(490, 375, this.stats.p1_owned_lands,
     {
       font: smallStyle
     });

     this.p2_owned_lands = this.game.add.text(490, 420, this.stats.p2_owned_lands,
     {
       font: smallStyle
     });

     this.playbutton = this.game.add.button(400, 600, 'back-button',
      function() {
        this.game.state.start('MainMenu');
      }, this, 1, 0, 2, 0);
      this.playbutton.anchor.x = 0.5;
      this.playbutton.anchor.y = 0.5;
  }
}
