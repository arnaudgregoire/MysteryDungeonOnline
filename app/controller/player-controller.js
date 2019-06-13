class PlayerController{
  constructor(socket, gameParent){
    this.gameParent = gameParent;
    this.playerId = socket.handshake.session.passport.user._id;
    this.name = socket.handshake.session.passport.user.name;
    this.email = socket.handshake.session.passport.user.email;
    this.socket = socket;
    this.input= {
      left: false,
      right: false,
      up: false,
      down: false
    }
    console.log(this.email + " connected");
  }

  initialize(){
    let self = this;
    // send the players object to the new player
    this.socket.emit("currentPlayers", self.gameParent.game.players);
    // update all other players of the new player
    this.socket.broadcast.emit("newPlayer", self.gameParent.game.getPlayerById(self.playerId));

    this.socket.on("disconnect", function(){
      self.gameParent.onPlayerDisconnect(self)
    });
    // when a player moves, update the player data
    this.socket.on("playerInput", function (input) {
      self.input = input;
      self.gameParent.onPlayerInput(self);
    });
  }
}

module.exports = PlayerController;