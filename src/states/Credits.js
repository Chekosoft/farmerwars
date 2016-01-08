
export default class Credits extends Phaser.State {
  preload() {
    this.game.load.spritesheet('back-button',
    'def_sprites/game/back-button.png',
    164, 75);
    this.game.load.image('credits',
    'def_sprites/game/credits.png');
  }

  create() {
    this.image = this.game.add.image(0,0, 'credits');
    this.playbutton = this.game.add.button(400, 600, 'back-button',
     function() {
       this.game.state.start('MainMenu');
     }, this, 1, 0, 2, 0);
     this.playbutton.anchor.x = 0.5;
     this.playbutton.anchor.y = 0.5;
  }
}
