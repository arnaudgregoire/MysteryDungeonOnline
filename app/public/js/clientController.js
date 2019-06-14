class ClientController{
    
    constructor(){
        this.gameView = new GameView();
        window.addEventListener('gameSceneCreated',this.initialize.bind(this));
    }

    initialize(){
        let self = this;
        self.socket = io();
        // id of the socket that server gave to the connection
        this.socket.on('sendId', function (socketId) {
            self.gameView.game.scene.getScene('gameScene').setSocketId(socketId);
        })
        // We used  socket.on to listen for the  currentPlayers event, and when this event is triggered,
        // the function we provided will be called with the  players object that we passed from our server.
        this.socket.on('currentPlayers', function (players) {
            //When this function is called,
            //we loop through each of the players and we check to see if that player’s id matches the current player’s socket id.
            Object.keys(players).forEach(function (id) {
                self.gameView.game.scene.getScene('gameScene').displayPlayers(players[id]);
            });
        });
        
        this.socket.on('newPlayer', function (playerInfo) {
            self.gameView.game.scene.getScene('gameScene').displayPlayers(playerInfo);
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
            self.gameView.game.scene.getScene('gameScene').removePlayer(id);
        });
    
        this.socket.on('playerUpdates', function (players) {
            self.gameView.game.scene.getScene('gameScene').updatePlayers(players);
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

        window.addEventListener('playerInput',function(e){
            self.socket.emit('playerInput',e.detail);
        });
    }
}