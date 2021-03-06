"use strict";
class UIScene extends Phaser.Scene{
  constructor()
  {
    super({ key: "uiScene", active: true });
    this.rectangleGeometry = new Phaser.Geom.Rectangle(0,0,140,140);
  }

  preload()
  {
    this.load.multiatlas("portraits","../../assets/pokemonPortraits.json");
    this.load.multiatlas("typeIcons", "../../assets/typeIcons.json");
    this.load.multiatlas("objects",'../../assets/objects/objects.json');
    this.load.image("dashboard","../../assets/ui/dashboard.png" );
    this.load.image("inventory", "../../assets/ui/inventory.png");
    this.load.image("whiteBackground", "../../assets/ui/whiteBackground.png");
    this.load.image("yellowBackground", "../../assets/ui/yellowBackground.png");
    this.load.image("redstage","../../assets/ui/redstage.png");
    this.load.image("greenstage","../../assets/ui/greenstage.png");
  }

  create()
  {
    let self = this;
    self.textStyle = 
    {
      fontSize: "30px",
      fontFamily: "Verdana",
      color: "white",
      align: "center"
    };
    self.redTextStyle = 
    {
      fontSize: "30px",
      fontFamily: "Verdana",
      color: "red",
      align: "center"
    };
    self.greenTextStyle = 
    {
      fontSize: "30px",
      fontFamily: "Verdana",
      color: "lightgreen",
      align: "center"
    };
    self.portraits = self.add.container(70, 70);
    self.add.image(800,900,"dashboard");
    self.inventory = self.add.container(1000, 885);

    let keyI = self.input.keyboard.addKey('I');
    keyI.on('down',function(){self.switchInventoryUI()});

    window.addEventListener('setItemDescription',function(e){
      self.setItemDescription(e.detail);
  });
    window.dispatchEvent(new CustomEvent("uiSceneCreated"));
  }

  setDashboard(player)
  {
    this.dashboardPortrait = this.add.sprite(80,880,"portraits","portrait" + player.pokemon.gameIndex).setScale(3,3);
    this.dashboardName = this.add.text(160,830,player.name,this.textStyle);
    this.dashboardPokemonName = this.add.text(160,870,player.pokemon.name, this.textStyle);
    this.dashboardLevel = this.add.text(160,910, "Lvl " + player.pokemon.level, this.textStyle);
    this.gender = this.add.text(160, 950, player.pokemon.gender, this.textStyle);
    this.types = [];
    
    for (var i = 0; i < player.pokemon.types.length; i++) 
    {
      this.types.push(this.add.sprite(50 + 70 * i, 970, "typeIcons", player.pokemon.types[i]));
    }
    this.health = this.add.text(510, 820, player.pokemon.health + " / "+ player.pokemon.stats.HP + " HP", this.textStyle);
    this.belly = this.add.text(510, 870, player.belly + " / 100", this.textStyle); 
    this.healthBar = new LifeBar(this, 350, 825, player.pokemon.stats.HP);
    this.bellyBar = new LifeBar(this, 350, 880, 100);
    this.setHealth(player);
    this.setBelly(player);

    this.ability = this.add.text(350, 920, "Talent  : " + player.pokemon.ability.name, this.textStyle);
    this.nature = this.add.text(350,960, "Nature : " + player.pokemon.nature, this.textStyle);

    this.hp = this.add.text(700, 830, "Hp  : " + player.pokemon.stats.HP, this.textStyle);
    this.atk = this.add.text(700, 860, "Atk : " + player.pokemon.stats.ATTACK, this.textStyle);
    this.def = this.add.text(700, 890, "Def : " + player.pokemon.stats.DEFENSE, this.textStyle);
    this.spa = this.add.text(700, 920, "Spa : " + player.pokemon.stats.SPECIAL_ATTACK, this.textStyle);
    this.spd = this.add.text(700, 950, "Spd : " + player.pokemon.stats.SPECIAL_DEFENSE, this.textStyle);

    this.ivHp = this.add.text(830, 830, "(" + player.pokemon.ivs.HP + ")", this.redTextStyle);
    this.ivAtk = this.add.text(830, 860, "(" + player.pokemon.ivs.ATTACK + ")", this.redTextStyle);
    this.ivDef = this.add.text(830, 890, "(" + player.pokemon.ivs.DEFENSE + ")", this.redTextStyle);
    this.ivSpa = this.add.text(830, 920, "(" + player.pokemon.ivs.SPECIAL_ATTACK + ")", this.redTextStyle);
    this.ivSpd = this.add.text(830, 950, "(" + player.pokemon.ivs.SPECIAL_DEFENSE + ")", this.redTextStyle);

    this.evHp = this.add.text(900, 830, "(" + player.pokemon.evs.HP + ")", this.greenTextStyle);
    this.evAtk = this.add.text(900, 860, "(" + player.pokemon.evs.ATTACK + ")", this.greenTextStyle);
    this.evDef = this.add.text(900, 890, "(" + player.pokemon.evs.DEFENSE + ")", this.greenTextStyle);
    this.evSpa = this.add.text(900, 920, "(" + player.pokemon.evs.SPECIAL_ATTACK + ")", this.greenTextStyle);
    this.evSpd = this.add.text(900, 950, "(" + player.pokemon.evs.SPECIAL_DEFENSE + ")", this.greenTextStyle);
  }

  setHealth(player)
  {
    this.health.setText(player.pokemon.health + " / "+ player.pokemon.stats.HP + " HP");
    this.healthBar.setLife(player.pokemon.health);
  }

  setBelly(player)
  {
    this.belly.setText(player.belly + " / 100");
    this.bellyBar.setLife(player.belly);
  }

  updateInventory(player)
  {
    this.inventory = player.inventory;
    if(this.inventoryUI != undefined)
    {
      this.inventoryUI.updateInventory(this.inventory);
    }
  }

  displayPortrait(playerInfo)
  {
    var self = this;
    var portrait = self.add.container(0, 180 * self.portraits.length);
    portrait.userId = playerInfo.userId;

    var sprite = self.add.sprite(0, 0, "portraits", "portrait" + playerInfo.pokemon.gameIndex);
    sprite.setScale(3,3);

    var text = self.add.text(-70,70,playerInfo.name,self.textStyle);
    var rectangle = self.add.graphics({
      x:-69, y:-70,
      fillStyle: { color: 0x00C100, alpha: 1 },
      add:true
    });

    var types = [];

    rectangle.fillRectShape(self.rectangleGeometry);
    portrait.add(rectangle);
    portrait.add(sprite);
    portrait.add(text);
    
    this.imageStageCompleted = new Phaser.GameObjects.Image(this,40,40,'redstage');

    if(playerInfo.stageCompleted)
    {
      this.imageStageCompleted.setTexture('greenstage');
    }
    portrait.add(this.imageStageCompleted);
    types.forEach(function(type) { portrait.add(type); });
    self.portraits.add(portrait);
  }


  removePortrait(userId) 
  {
    var self = this;
    self.portraits.remove(self.portraits.getFirst("userId", userId));
    self.portraits.iterate(function(portrait) {
      portrait.setPosition(0, 180 * self.portraits.getIndex(portrait));
    }, self);
  }

  updatePlayers(players)
  {
    var self = this;
    var rectStyle = {"false": 0xDC143C, "true": 0x00C100};
    Object.keys(players).forEach(function (index)
    {
      if (players[index].socketId == self.socketId)
      {
        self.setHealth(players[index]);
        self.setBelly(players[index]);
      }
      self.portraits.iterate(function (portrait)
      {
        if (portrait.userId == players[index].userId)
        {
          var graphic = portrait.getFirst();
          graphic.fillStyle(rectStyle[players[index].turnPlayed], 1);
          graphic.fillRectShape(self.rectangleGeometry);
        }
      }, self);
    });
  }

  switchInventoryUI()
  {
    if(this.inventoryUI == undefined)
    {
      this.inventoryUI = new InventoryUI(this, this.inventory);
    }
    else{
      this.inventoryUI.destroy();
      this.inventoryUI = null;
    }
  }

  setItemDescription(item)
  {
    if(this.inventoryUI != undefined)
    {
      this.inventoryUI.inventoryDescription.setItemDescription(item);
    }
  }

  setSocketId(id){
    this.socketId = id;
  }
}
