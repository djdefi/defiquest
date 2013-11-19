// # Quintus platformer example
//
// [Run the example](../examples/platformer/index.html)
// WARNING: this game must be run from a non-file:// url
// as it loads a level json file.
//
// This is the example from the website homepage, it consists
// a simple, non-animated platformer with some enemies and a 
// target for the player.
window.addEventListener("load",function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus({ audioSupported: [ 'ogg','mp3' ] })
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, Audio, UI")
        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls().touch()
                  .enableSound();

// ## Player Sprite
// The very basic player sprite, this is just a normal sprite
// using the player sprite sheet with default controls added to it.
Q.Sprite.extend("Player",{

  // the init constructor is called on creation
  init: function(p) {

    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sheet: "player",  // Setting a sprite sheet sets sprite width and height
      x: 410,           // You can also set additional properties that can
      y: 90,             // be overridden on object creation
      hitPoints: 100,
      damage: 5
    });

    // Add in pre-made components to get up and running quickly
    // The `2d` component adds in default 2d collision detection
    // and kinetics (velocity, gravity)
    // The `platformerControls` makes the player controllable by the
    // default input actions (left, right to move,  up or action to jump)
    // It also checks to make sure the player is on a horizontal surface before
    // letting them jump.
    this.add('2d, platformerControls');
    
    // Write event handlers to respond hook into behaviors.
    // hit.sprite is called everytime the player collides with a sprite
    this.on("hit.sprite",function(collision) {

      // Check the collision, if it's the Tower, you win!
      if(collision.obj.isA("Tower")) {
        Q.stageScene("endGame",1, { label: "You Won!" }); 
        this.destroy();
      }
    });

  },
step: function(dt) {
        if(Q.inputs['left'] && this.p.direction == 'right') {
            this.p.flip = 'x';
        } 
        if(Q.inputs['right']  && this.p.direction == 'left') {
            this.p.flip = false;                    
        }
    } 

});


// ## Tower Sprite
// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Tower", {
  init: function(p) {
    this._super(p, { sheet: 'tower' });
  }
});

// ## Enemy Sprite
// Create the Enemy class to add in some baddies
Q.Sprite.extend("Enemy",{
  init: function(p) {
    this._super(p, { sheet: 'enemy', vx: 100 });

    // Enemies use the Bounce AI to change direction 
    // whenver they run into something.
    this.add('2d, aiBounce');

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
        Q.stageScene("endGame",1, { label: "You Died" }); 
        collision.obj.destroy();
      }
    });

    // If the enemy gets hit on the top, destroy it
    // and give the user a "hop"
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
        this.destroy();
        collision.obj.p.vy = -300;
      }
    });
  }
});

//enemy that goes up and down
Q.Sprite.extend("VerticalEnemy", {
    init: function(p) {
        this._super(p, { sheet: 'enemy', vy: -100, rangeY: 100, gravity: 0 });
        this.add("2d,aiBounce");
        
        this.p.initialY = this.p.y;
        
	this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) {
        Q.stageScene("endGame",1, { label: "You Died" });
        collision.obj.destroy();
      }
    });

    // If the enemy gets hit on the top, destroy it
    // and give the user a "hop"
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) {
        this.destroy();
        collision.obj.p.vy = -300;
      }
    });    
},
    step: function(dt) {                
    if(this.p.y - this.p.initialY >= this.p.rangeY && this.p.vy > 0) {
        this.p.vy = -this.p.vy;
    } 
    else if(-this.p.y + this.p.initialY >= this.p.rangeY && this.p.vy < 0) {
        this.p.vy = -this.p.vy;
    }     
}    
});


Q.Sprite.extend("Block", {
  init: function(p) {
    this._super(p);
  },

  draw: function(ctx) {
    if(!this.p.points) {
      Q._generatePoints(this);
    }

    ctx.beginPath();
    ctx.fillStyle = this.p.hit ? "green" : "red";
    ctx.strokeStyle = "#F00F00";
    ctx.fillStyle = "#FFF000";
    ctx.moveTo(this.p.points[0][0],this.p.points[0][1]);
    for(var i=0;i<this.p.points.length;i++) {
      ctx.lineTo(this.p.points[i][0],this.p.points[i][1]);
    }
    ctx.lineTo(this.p.points[0][0],this.p.points[0][1]);
    ctx.stroke();
  }
});

// ## Level1 scene
// Create a new scene called level 1
Q.scene("level1",function(stage) {
//Q.audio.play('deletedworldlow.ogg');

  // Add in a repeater for a little parallax action
  stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5, speedY: 0.5 }));

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level.json',
                             sheet:     'tiles' }));


  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);

  // Add in a couple of enemies
  stage.insert(new Q.Enemy({ x: 700, y: 15 }));
  stage.insert(new Q.Enemy({ x: 700, y: 0 }));
  stage.insert(new Q.Enemy({ x: 800, y: 0 }));
  stage.insert(new Q.Enemy({ x: 250, y: 300 }));
  stage.insert(new Q.Enemy({ x: 350, y: 200 }));
  stage.insert(new Q.Enemy({ x: 1000, y: -50 }));
  stage.insert(new Q.Enemy({ x: 1200, y: 430 }));
  stage.insert(new Q.Enemy({ x: 600, y: 400 }));
  stage.insert(new Q.Enemy({ x: 1000, y: 400 })); 

  stage.insert(new Q.VerticalEnemy({ x: 220, y: 100 }));
  stage.insert(new Q.VerticalEnemy({ x: 720, y: 390 }));
  stage.insert(new Q.VerticalEnemy({ x: 780, y: 380 }));
  stage.insert(new Q.VerticalEnemy({ x: 1200, y: 300 }));

  //Rocks
  stage.insert(new Q.Block({
    x: 800, y: 700, h: 100, w: 100,
    points: [ [ 7, -50], [25, -40] ,[ 50, 0 ], [ 0, 50 ], [ -100, 0 ] ]
  }));
  stage.insert(new Q.Block({
    x: 400, y: 710, h: 110, w: 100,
    points: [ [ 6, -55], [20, -20] ,[ 50, 0 ], [ 30, 50 ], [ 100, 0 ] ]
  }));
  stage.insert(new Q.Block({
    x: 500, y: 690, h: 110, w: 130,
    points: [ [ 16, -55], [30, -10] ,[ 40, 10 ], [ 30, 50 ], [ 100, 0 ] ]
  }));  
stage.insert(new Q.Block({
    x: 200, y: 630, h: 110, w: 130,
    points: [ [ 16, -55], [10, -15] ,[ 40, 10 ], [ 30, 50 ], [ 100, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: 100, y: 800, h: 110, w: 130,
    points: [ [ 16, -55], [30, -10] ,[ 40, 10 ], [ 30, 50 ], [ 100, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -20, y: 790, h: 65, w: 130,
    points: [ [ 16, -45], [30, -10] ,[ 40, 10 ], [ 30, 50 ], [ 100, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -80, y: 750, h: 65, w: 130,
    points: [ [ 0, -45], [30, -50] ,[ 60, 0 ], [ 0, 50 ], [ -100, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -180, y: 600, h: 100, w: 100,
    points: [ [ 0, -50], [25, -40] ,[ 50, 0 ], [ 0, 50 ], [ -100, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -255, y: 490, h: 100, w: 100,
    points: [ [ 9, -10], [65, -20] ,[ 20, 0 ], [ 0, 20 ], [ -50, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -335, y: 660, h: 100, w: 100,
    points: [ [ 20, -20], [10, -25] ,[ 20, 0 ], [ 0, 60 ], [ 50, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -220, y: 715, h: 100, w: 100,
    points: [ [ 0, -20], [15, -20] ,[ 20, 0 ], [ 0, 20 ], [ -50, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -120, y: 515, h: 100, w: 100,
    points: [ [ 0, -20], [15, -20] ,[ 20, 0 ], [ 0, 20 ], [ -50, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -85, y: 415, h: 100, w: 100,
    points: [ [ 0, -80], [30, -40] ,[ 30, 60 ], [ -100, 20 ], [ -50, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -55, y: 650, h: 100, w: 100,
    points: [ [ 0, -20], [15, -20] ,[ 20, 0 ], [ 0, 20 ], [ -50, 0 ] ]
  }));
stage.insert(new Q.Block({
    x: -22, y: 290, h: 100, w: 100,
    points: [ [ -10, -25], [15, -20] ,[ 20, 0 ], [ 0, 20 ], [ -50, 0 ] ]
  }));
// Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 1250, y: 435 }));
});

// To display a game over / game won popup box, 
// create a endGame scene that takes in a `label` option
// to control the displayed message.
Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));
  // When the button is clicked, clear all the stages
  // and restart the game.
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
  });
Q.audio.stop();
  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(20);
});

// ## Asset Loading and Game Launch
// Q.load can be called at any time to load additional assets
// assets that are already loaded will be skipped
// The callback will be triggered when everything is loaded
Q.load("sprites.png, sprites.json, level.json, tiles.png, background-wall.png ", function() {
  // Sprites sheets can be created manually
  Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });

  // Or from a .json asset that defines sprite locations
  Q.compileSheets("sprites.png","sprites.json");

  // Finally, call stageScene to run the game
  Q.stageScene("level1");
});

// ## Possible Experimentations:
// 
// The are lots of things to try out here.
// 
// 1. Modify level.json to change the level around and add in some more enemies.
// 2. Add in a second level by creating a level2.json and a level2 scene that gets
//    loaded after level 1 is complete.
// 3. Add in a title screen
// 4. Add in a hud and points for jumping on enemies.
// 5. Add in a `Repeater` behind the TileLayer to create a paralax scrolling effect.

});
