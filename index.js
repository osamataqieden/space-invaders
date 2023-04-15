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
        color: {
            full: "purple",
            half: "yellow",
            low: "red"
        }
    }
}
const healthEnum = {
    full: "full",
    half: "half",
    low: "low",
    dead: "dead"
}
let canvasManager = (() => {
    const healthBarPos = {
        x: 60,
        y: 30
    };
    const enemyCounterPos = {
        x: CANVAS_WIDTH - 120,
        y: 30
    };
    let drawPlayerData = (numOfEnemies, playerHealth) => {
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        if(ctx){
            ctx.fillStyle = "white";
            ctx.fillText("HP: " + playerHealth, healthBarPos.x, healthBarPos.y);
            ctx.fillStyle = "white";
            ctx.fillText("Enemies: " + numOfEnemies, enemyCounterPos.x, enemyCounterPos.y);
        }
    }
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
                        ctx.fillStyle = gameObjectMetadata.enemy.color[element.health];
                        ctx.fillRect(element.x, element.y, gameObjectMetadata.enemy.width, gameObjectMetadata.enemy.height);
                        break;
                    }
                }
            });
        }
    }
    return {
        initCanvas: initCanvas,
        drawGameObjects: drawGameObjects,
        drawPlayerData: drawPlayerData
    }
})();
let gameManager = (() => {
    let playerPos = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        objectType: gameObjectEnums.player,
        health: healthEnum.full
    };
    let gameObjects = [playerPos]
    let currentMovementCommand = "NA";
    let currentShotCommand = "NA";
    let currentEnemyCount = 0;
    let prevKey = "NA";
    let stopMovementFlag = false;

    let addRandomEnemies = () => {
        let enemyContainerX = 60;
        let enemyContainerY = 100;
        for(var i = 1; i<= 20; i++){
            let enemy = {
                x: enemyContainerX + (i % 10) * 2 * gameObjectMetadata.enemy.width ,
                y: enemyContainerY,
                objectType: gameObjectEnums.enemy,
                health: healthEnum.full
            }
            gameObjects.push(enemy);
            if(i % 10 == 0){
                enemyContainerY += gameObjectMetadata.enemy.height + 2;
            }
            currentEnemyCount++;
        }
    }

    window.addEventListener("keydown", (event) => {
        console.log(event);
        if(event.key == "ArrowUp"){
            currentMovementCommand = "up";
            prevKey = event.key;
        }
        else if(event.key == "ArrowLeft"){
            currentMovementCommand = "left";
            prevKey = event.key;
        }
        else if(event.key == "ArrowRight"){
            currentMovementCommand = "right";
            prevKey = event.key;
        }
        else if(event.key == "ArrowDown"){
            currentMovementCommand = "down";
            prevKey = event.key;
        }
        if(event.code == "Space"){
            currentShotCommand = "shoot";
        }
    });

    window.addEventListener("keyup", (event) => {
        console.log(event);
        if(event.key == "ArrowLeft" || event.key == "ArrowRight" || event.key == "ArrowDown" || event.key == "ArrowUp"){
            if(prevKey == event.key)
                currentMovementCommand = "NA";
        } 
    });

    let gameLoop = () => {
        if(currentShotCommand == "shoot"){
            let playerObject = gameObjects.find((element) => {
                return element.objectType == gameObjectEnums.player;
            });
            let shot = {
                x: playerObject.x + gameObjectMetadata.player.width / 2,
                y: playerObject.y - 30,
                objectType: gameObjectEnums.shot,
                health: "N/A"
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
                if(currentMovementCommand == "up"){
                    element.y -= 10;
                }
                else if(currentMovementCommand == "left"){
                    element.x -= 10;
                }
                else if(currentMovementCommand == "right"){
                    element.x += 10;
                }
                else if(currentMovementCommand == "down"){
                    element.y += 10;
                }        
            }
        });
        gameObjects.forEach((element) => {
            if(element.objectType == gameObjectEnums.enemy){
                let collideElements = gameObjects.filter((el) => {
                    return el.objectType == gameObjectEnums.shot &&
                        (el.y <= (element.y + gameObjectMetadata.enemy.height) && el.y >= element.y)
                        && (el.x >= element.x && el.x <= (element.x + gameObjectMetadata.enemy.width));         
                });
                if(collideElements){
                    let elementsToRemove = [];
                    collideElements.forEach((col) => {
                        if(col.objectType != gameObjectEnums.shot){
                            return;
                        }
                        let deathAudio = new Audio("./media/audio/echosplosion.wav");
                        deathAudio.play();
                        if(element.health == healthEnum.full){
                            element.health = healthEnum.half;
                        }
                        else if(element.health == healthEnum.half){
                            element.health = healthEnum.low;
                        }
                        else if(element.health == healthEnum.low){
                            elementsToRemove.push(element);
                            currentEnemyCount--;
                            element.health = healthEnum.dead;
                        }
                        elementsToRemove.push(col);
                    });
                    gameObjects = gameObjects.filter((el) => {
                        return !elementsToRemove.includes(el);  
                    });
                }
            }
        });
        let healthText = "100%";
        canvasManager.initCanvas();
        canvasManager.drawPlayerData(currentEnemyCount, healthText);
        canvasManager.drawGameObjects(gameObjects);
        currentShotCommand = "NA";
        window.requestAnimationFrame(gameLoop);
    }

    let initGame = () => {
        canvasManager.initCanvas();
        addRandomEnemies();
        canvasManager.drawPlayerData(currentEnemyCount, "100%");
        canvasManager.drawGameObjects(gameObjects);
        window.requestAnimationFrame(gameLoop);
    }

    return {
        initGame: initGame
    }
})();
gameManager.initGame();