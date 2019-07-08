class GameView{

  constructor(config){
    this.config = config;
    this.game = new Phaser.Game(this.config);
  }

  static getDefaultConfig(){
    return {
        type: Phaser.AUTO,
        parent: 'content',
        width: 1600,
        height: 1000,
        pixelArt: true,
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
            gravity: { y: 0 }
          }
        },
        scene: [GameScene, UIScene],
        scale:{
          mode: Phaser.Scale.FIT
        },
        tilesize: 24
    }
  }
}