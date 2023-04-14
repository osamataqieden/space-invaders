const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 500;
const gameObjectEnums = {
    player: "player",
    shot: "shot",
    enemy: "enemy"
};
const gameObjectMetadata = {
    player: {
        width: 20,
        height: 20,
        color: "white"
    },
    shot: {
        width: 5,
        height: 10,
        color: "red"
    },
    enemy: {
        width: 20,
        height: 20,
        color: "purple"
    }
}
let canvasManager = (() => {
    const PLAYER_WIDTH = 20;
    const PLAYER_HEIGHT = 20;
    let initCanvas = () => {
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        if(ctx){
            ctx.fillStyle = "black";
            ctx.fillRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
            return true;    
        }
        return false;
    }

    let drawGameObjects = (gameObjects) => {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        if(ctx){
            gameObjects.forEach(element => {
                switch(element.objectType){
                    case gameObjectEnums.player: {
                        ctx.fillStyle = gameObjectMetadata.player.color;
                        ctx.fillRect(element.x, element.y, gameObjectMetadata.player.width, gameObjectMetadata.player.height);
                        break;
                    }
                    case gameObjectEnums.shot: {
                        ctx.fillStyle = gameObjectMetadata.shot.color;
                        ctx.fillRect(element.x, element.y, gameObjectMetadata.shot.width, gameObjectMetadata.shot.height);
                        break;
                    }
                    case gameObjectEnums.enemy: {
                        ctx.fillStyle = gameObjectMetadata.enemy.color;
                        ctx.fillRect(element.x, element.y, gameObjectMetadata.enemy.width, gameObjectMetadata.enemy.height);
                        break;
                    }
                }
            });
        }
    }

    return {
        initCanvas: initCanvas,
        drawGameObjects: drawGameObjects
    }
})();
let gameManager = (() => {

    let playerPos = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        objectType: gameObjectEnums.player
    };
    let gameObjects = [playerPos]
    let currentCommand = "NA";

    let addRandomEnemies = () => {
        let enemyContainerX = 60;
        let enemyContainerY = 100;
        for(var i = 1; i<= 30; i++){
            let enemy = {
                x: enemyContainerX + (i % 10) * 2 * gameObjectMetadata.enemy.width ,
                y: enemyContainerY,
                objectType: gameObjectEnums.enemy
            }
            gameObjects.push(enemy);
            if(i % 10 == 0){
                enemyContainerY += gameObjectMetadata.enemy.height + 2;
            }
        }
    }

    window.addEventListener("keydown", (event) => {
        if(event.key == "ArrowUp"){
            currentCommand = "up";
        }
        else if(event.key == "ArrowLeft"){
            currentCommand = "left";
        }
        else if(event.key == "ArrowRight"){
            currentCommand = "right";
        }
        else if(event.key == "ArrowDown"){
            currentCommand = "down";
        }
        else if(event.code == "Space"){
            currentCommand = "shoot";
        }
    });

    let gameLoop = () => {
        if(currentCommand == "shoot"){
            let playerObject = gameObjects.find((element) => {
                return element.objectType == gameObjectEnums.player;
            });
            let shot = {
                x: playerObject.x + gameObjectMetadata.player.width / 2,
                y: playerObject.y - 30,
                objectType: gameObjectEnums.shot
            };
            gameObjects.push(shot);
            let shotAudio = new Audio("./media/audio/laser.wav");
            shotAudio.play();
        }
        gameObjects.forEach((element) => {
            if(element.objectType == gameObjectEnums.shot){
                element.y -= 10  
            }
            else if(element.objectType == gameObjectEnums.player){
                if(currentCommand == "up"){
                    element.y -= 10;
                }
                else if(currentCommand == "left"){
                    element.x -= 10;
                }
                else if(currentCommand == "right"){
                    element.x += 10;
                }
                else if(currentCommand == "down"){
                    element.y += 10;
                }        
            }
        });
        gameObjects.forEach((element) => {
            if(element.objectType == gameObjectEnums.enemy){
                let collideElement = gameObjects.find((el) => {
                    return el.objectType == gameObjectEnums.shot &&
                        (el.y <= (element.y + gameObjectMetadata.enemy.height) && el.y >= element.y)
                        && (el.x >= element.x && el.x <= (element.x + gameObjectMetadata.enemy.width));         
                });
                if(collideElement){
                    gameObjects = gameObjects.filter((el) => {
                        return el != element && el != collideElement;
                    });
                    let deathAudio = new Audio("./media/audio/echosplosion.wav");
                    deathAudio.play();
                }
            }
        });
        canvasManager.initCanvas();
        canvasManager.drawGameObjects(gameObjects);
        currentCommand = "NA";
    }

    let initGame = () => {
        canvasManager.initCanvas();
        addRandomEnemies();
        canvasManager.drawGameObjects(gameObjects);
        setInterval(() => {
            gameLoop();
        }, 25);
    }

    return {
        initGame: initGame
    }
})();
gameManager.initGame();