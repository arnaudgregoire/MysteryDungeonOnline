"use strict";
const config = {
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
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  scale:{
    mode: Phaser.Scale.FIT
  }
}
// https://phasertutorials.com/creating-a-simple-multiplayer-game-in-phaser-3-with-an-authoritative-server-part-2/
var game = new Phaser.Game(config);
 
function preload() {
  this.load.image('tiles','../../assets/test_tileset.png');
  this.load.tilemapTiledJSON('map','../../assets/test_map.json');
  this.load.multiatlas('sprites','../../assets/test_sprites.json');
}
 
function create() {
  var self = this;
  this.socket = io();
  // First, we created a new Phaser group which will be used to manage all of the player’s game objects on the client side.
  this.players = this.physics.add.group();
  this.texts = this.physics.add.group();
  createAnimations(self);
  this.map = this.make.tilemap({key:'map'});
  const tileset = this.map.addTilesetImage('test_tileset', 'tiles');
  const worldLayer = this.map.createStaticLayer('world', tileset, 0, 0);   


  // We used  socket.on to listen for the  currentPlayers event, and when this event is triggered,
  // the function we provided will be called with the  players object that we passed from our server.
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      //When this function is called,
      //we loop through each of the players and we check to see if that player’s id matches the current player’s socket id.
      displayPlayers(self, players[id]);
    });
  });
 
  this.socket.on('newPlayer', function (playerInfo) {
    displayPlayers(self, playerInfo);
  });

  this.socket.on('alreadyLog', function (player_email) {
    alert("Account (" + player_email + ") already in use");
    window.location.replace('/index.html');
  });
 
  /*
  When the  disconnect event is fired, we take that player’s id and we remove that player’s ship from the game.
  We do this by calling the  getChildren() method on our  players group.
  The  getChildren() method will return an array of all the game objects that are in that group,
  and from there we use the  forEach() method to loop through that array.
  */
  this.socket.on('disconnect', function (id) {
    self.players.getChildren().forEach(function (player) {
      if (id === player.id) {
        player.destroy();
      }
    });
    self.texts.getChildren().forEach(function (player) {
      if (id === player.id) {
        player.destroy();
      }
    });
  });

  this.socket.on('playerUpdates', function (players) {
    Object.keys(players).forEach(function (index) {
      self.players.getChildren().forEach(function (player) {
        if (players[index].id === player.id) {
          player.setPosition(players[index].x, players[index].y);
          //if the actual animation sprite currently played client side is different from the server one,
          // the client start to play and save the new sprite
          if(player.orientation != players[index].orientation
            || player.action != players[index].action){
            player.action = players[index].action;
            player.orientation = players[index].orientation;
            displayPlayer(self, player);
          }
        }
      });
      self.texts.getChildren().forEach(function (player) {
        if (players[index].id === player.id) {
          player.setPosition(players[index].x, players[index].y);
        }
      })
    });
  });

  
  this.socket.on('new-message', (data) => {
    var usernameSpan = document.createElement('span');
    var usernameText = document.createTextNode(data.username);
    usernameSpan.className = 'username';
    usernameSpan.appendChild(usernameText);
  
    var messageBodySpan = document.createElement('span');
    var messageBodyText = document.createTextNode(data.message);
    messageBodySpan.className = 'messageBody';
    messageBodySpan.appendChild(messageBodyText);
  
    var messageLi = document.createElement('li');
    messageLi.setAttribute('username', data.username);
    messageLi.appendChild(usernameSpan);
    messageLi.appendChild(messageBodySpan);
  
    addMessageElement(messageLi);
  });

  /* 
  This will populate the cursors object with our four main Key objects (up, down, left, and right),
  which will bind to those arrows on the keyboard
  */
  this.cursors = this.input.keyboard.createCursorKeys();
  this.leftKeyPressed = false;
  this.rightKeyPressed = false;
  this.upKeyPressed = false;
  this.downKeyPressed = false;
}
 
function update() {

  const left = this.leftKeyPressed;
  const right = this.rightKeyPressed;
  const up = this.upKeyPressed;
  const down = this.downKeyPressed;
  
  // Horizontal movement
  if (this.cursors.left.isDown){this.leftKeyPressed = true}
  else{this.leftKeyPressed = false}

  if (this.cursors.right.isDown){this.rightKeyPressed = true}
  else{this.rightKeyPressed = false}

  // Vertical movement
  if (this.cursors.up.isDown){this.upKeyPressed = true}
  else{this.upKeyPressed = false}

  if (this.cursors.down.isDown){this.downKeyPressed = true}
  else{this.downKeyPressed = false}  
  
  if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed || down != this.downKeyPressed) {
    this.socket.emit('playerInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed });
  }
}

/*
Created our player by using the x and y coordinates that we generated in our server code.
We used  setOrigin() to set the origin of the game object to be in the middle of the object instead of the top left.
We stored the id so we can find the game object by that id later.
Lastly, we added the player’s game object to the Phaser group we created.
 */
function displayPlayers(self, playerInfo) {
  console.log(playerInfo);
  const player = self.add.sprite(playerInfo.x, playerInfo.y, 'sprites', playerInfo.pokedexIdx + '_0_0_0').setOrigin(0.5, 0.5);
  player.id = playerInfo.id;
  player.orientation = playerInfo.orientation;
  player.action = playerInfo.action;
  player.pokedexIdx = playerInfo.pokedexIdx;
  player.socketId = playerInfo.socketId;
  player.name = playerInfo.name;
  var text = self.add.text(playerInfo.x, playerInfo.y, playerInfo.name, {
    fontSize: '15px',
    fontFamily: 'Verdana',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5,1.6);
  text.setShadow(1, 1, 'rgba(0,0,0,0.5)', 0);
  text.id = playerInfo.id;
  displayPlayer(self, player);
  if(player.socketId == self.socket.id){
    //we set the camera on the player hero
    setCamera(self, player);
  }
  self.players.add(player);
  self.texts.add(text);
}

/*
Set the camera on the pokemon that player is controlling
*/
function setCamera(self, hero){
  console.log("setting camera");
  // Phaser supports multiple cameras, but you can access the default camera like this:
  const camera = self.cameras.main;
  camera.startFollow(hero);
  camera.setBounds(0, 0, self.map.widthInPixels, self.map.heightInPixels);
  camera.zoom = 3;
}

/**
 * Get the sprite key corresponding to player orientation and action
 * for example a squirtle moving down will be 7_0_0
 */
function getSpriteKey(player) {
  const orientationTable = {
    "down": 0,
    "downleft": 1,
    "left": 2,
    "upleft": 3,
    "up": 4,
    "upright": 3,
    "right": 2,
    "downright":1
  };
  var key = "";
  key += player.pokedexIdx;
  key += "_";
  key += player.action;
  key += "_";
  key += orientationTable[player.orientation];
  return key;
}

/*
Change the animation on phaser
change the flipX value to, cause we only load down, left, upleft and downleft sprites and then flip them for right etc ...
*/
function playAnimation(player, spriteKey){
  var flipxTable = {"down":false, "downleft":false, "left":false, "upleft":false, "up":false, "upright":true, "right":true, "downright":true};
  player.flipX = flipxTable[player.orientation];
  player.anims.play(spriteKey);
}

/*
Display one player animation, by playing his new animation. Only called if something (orientation or action) changed server side
If the animation has not been used before, the animation is created
*/
function displayPlayer(self, player){
  // We get the key corresponding of the sprite animation for example a bulbasaur moving left will be 1_0_2
  var spriteKey = getSpriteKey(player);
  // if sprite not already loaded, we create it
  if(!self.anims.exists(spriteKey)){
    createAnimations(self, player.pokedexIdx);
  }
  // We play the new correct animation
  playAnimation(player, spriteKey);
}