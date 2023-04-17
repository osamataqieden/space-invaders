const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 500;
const gameObjectEnums = {
    player: "player",
    shot: "shot",
    enemy: "enemy",
    enemyShot: "enemyShot"
};
const ASSESTS_MAP = [
    {
        name: "player.image.health.full",
        link: "./assests/imgs/playerAircraft.png",
        image: new Image()
    },
    {
        name: "player.image.health.half",
        link: "./assests/imgs/playerAircraftHit.png",
        image: new Image()
    },
    {
        name: "player.image.health.dead",
        link: "./assests/imgs/playerAircraftDead.png",
        image: new Image()
    },
    {
        name: "shot.image",
        link: "./assests/imgs/playerBullet.png",
        image: new Image()
    },
    {
        name: "enemy.image.health.full",
        link: "./assests/imgs/enemyAircraft.png",
        image: new Image()
    },
    {
        name:"enemy.image.health.half",
        link: "./assests/imgs/enemyAircraftHitRed.png",
        image: new Image()
    },
    {
        name: "enemy.image.health.dead",
        link: "./assests/imgs/playerAircraftDead.png",
        image: new Image()
    },
    {
        name: "enemyShot.image",
        link: "./assests/imgs/enemyBullet.png",
        image: new Image()
    }
]
const gameObjectMetadata = {
    player: {
        width: 40,
        height: 40,
        color: "white",
        images: {
            full: "player.image.health.full",
            half: "player.image.health.half",
            low: "player.image.health.half",
            dead: "player.image.health.dead",
            default: "player.image.health.full"
        }
    },
    shot: {
        width: 10,
        height: 20,
        color: "red",
        images: {
            default: "shot.image",
        }
    },
    enemy: {
        width: 40,
        height: 40,
        color: {
            full: "purple",
            half: "yellow",
            low: "red"
        },
        images: {
            full: "enemy.image.health.full",
            half: "enemy.image.health.half",
            low: "enemy.image.health.half",
            dead: "enemy.image.health.dead",
            default: "enemy.image.health.full"
        }
    },
    enemyShot: {
        width: 10,
        height: 20,
        color: "purple",
        images: {
            default: "enemyShot.image",
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
                        let currentImage = ASSESTS_MAP.find((el) => {
                            return el.name == gameObjectMetadata.player.images[element.health];
                        }).image;
                        ctx.drawImage(currentImage, element.x, element.y, gameObjectMetadata.player.width, gameObjectMetadata.player.height);
                        break;
                    }
                    case gameObjectEnums.shot: {
                        let currentImage = ASSESTS_MAP.find((el) => {
                            return el.name == gameObjectMetadata.shot.images.default;
                        }).image;
                        ctx.drawImage(currentImage, element.x, element.y, gameObjectMetadata.shot.width, gameObjectMetadata.shot.height);
                        break;
                    }
                    case gameObjectEnums.enemyShot: {
                        let currentImage = ASSESTS_MAP.find((el) => {
                            return el.name == gameObjectMetadata.enemyShot.images.default;
                        }).image;
                        ctx.drawImage(currentImage, element.x, element.y, gameObjectMetadata.enemyShot.width, gameObjectMetadata.enemyShot.height);
                        break;
                    }
                    case gameObjectEnums.enemy: {
                        let currentImage = ASSESTS_MAP.find((el) => {
                            return el.name == gameObjectMetadata.enemy.images[element.health];
                        }).image;
                        ctx.drawImage(currentImage, element.x, element.y, gameObjectMetadata.enemy.width, gameObjectMetadata.enemy.height);
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
    let shotInternvalCounter = 0;
    let shiftDirection = "left";
    let shifInternvalCounter = 30;

    let addInitialEnemies = () => {
        let enemyContainerX = 60;
        let enemyContainerY = 100;
        for(var i = 1; i<= 15; i++){
            let enemy = {
                x: enemyContainerX + (i % 5) * 2 * gameObjectMetadata.enemy.width ,
                y: enemyContainerY,
                objectType: gameObjectEnums.enemy,
                health: healthEnum.full
            }
            gameObjects.push(enemy);
            if(i % 5 == 0){
                enemyContainerY += gameObjectMetadata.enemy.height + 2;
            }
            currentEnemyCount++;
        }
    }


    window.addEventListener("keydown", (event) => {
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
            else if(element.objectType == gameObjectEnums.enemyShot){
                element.y += 10;
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
        if(shotInternvalCounter == 0){
            let randomEnemy = gameObjects.filter((el) => {
                return el.objectType == gameObjectEnums.enemy
            })[Math.floor(Math.random() * (currentEnemyCount - 1))];
            gameObjects.push({
                x: randomEnemy.x + gameObjectMetadata.enemy.width / 2,
                y: randomEnemy.y + 10,
                objectType: gameObjectEnums.enemyShot,
                health: "NA"
            });
            shotInternvalCounter = 20;
        }
        else shotInternvalCounter--;
        let elementsToRemove = [];
        gameObjects.forEach((element) => {
            if(element.objectType == gameObjectEnums.enemyShot){
                if((element.y <= (gameObjects[0].y + gameObjectMetadata.player.height) && element.y >= gameObjects[0].y) && (element.x >= gameObjects[0].x && element.x <= (gameObjects[0].x + gameObjectMetadata.player.width))){
                    if(gameObjects[0].health == healthEnum.full){
                        gameObjects[0].health = healthEnum.half;
                    }
                    else if(gameObjects[0].health == healthEnum.half){
                        gameObjects[0].health = healthEnum.dead;
                    }
                    elementsToRemove.push(element);
                } 
            }
        });
        gameObjects = gameObjects.filter((element) => {
            return !elementsToRemove.includes(element);
        });
        //shift the enemeies
        if(shifInternvalCounter > 0){
            shifInternvalCounter--;
        }
        else {
            let alterShiftDirection = false;
            if(shiftDirection == "left"){
                let edgeEnemies = gameObjects.filter((element) => {
                    return (element.x - (2 * gameObjectMetadata.enemy.width)) <= 0;
                });
                if(edgeEnemies.length > 0){
                    alterShiftDirection = true;
                }
                else {
                    gameObjects.forEach((element) => {
                        if(element.objectType == gameObjectEnums.enemy){
                            element.x -= (2 * gameObjectMetadata.enemy.width);
                        }
                    });
                }
            }
            else if(shiftDirection == "right"){
                let edgeEnemies = gameObjects.filter((element) => {
                    return (element.x + (2 * gameObjectMetadata.enemy.width)) >= CANVAS_WIDTH;
                });
                if(edgeEnemies.length > 0){
                    alterShiftDirection = true;
                }
                else {
                    gameObjects.forEach((element) => {
                        if(element.objectType == gameObjectEnums.enemy){
                            element.x += (2 * gameObjectMetadata.enemy.width);
                        }
                    });
                }
            }
            if(alterShiftDirection && shiftDirection == "left"){
                shiftDirection = "right";
            }
            else if(alterShiftDirection && shiftDirection == "right"){
                shiftDirection = "left";
            }
            else {
                shifInternvalCounter = 30;
            }
        }
        let healthText = "100%";
        if(gameObjects[0].health == healthEnum.half){
            healthText = "50%";
        }
        else if(gameObjects[0].health == healthEnum.dead) {
            healthText = "0%";
        }
        if(healthText == "0%"){
            alert("You are dead!");
        }
        else {
            canvasManager.initCanvas();
            canvasManager.drawPlayerData(currentEnemyCount, healthText);
            canvasManager.drawGameObjects(gameObjects);
            currentShotCommand = "NA";
            //window.requestAnimationFrame(gameLoop);    
            setTimeout(() => {
                gameLoop();
            }, 1000 / 30);    
        }
    }

    let initGame = () => {
        canvasManager.initCanvas();
        addInitialEnemies();
        canvasManager.drawPlayerData(currentEnemyCount, "100%");
        canvasManager.drawGameObjects(gameObjects);
        const assetsLoaded = ASSESTS_MAP.map(assest =>
            new Promise((resolve, reject) => {
                assest.image.onload = e => resolve("success");
                assest.image.onerror = e => reject("error");
                assest.image.src = assest.link;
            })
        );
        Promise.all(assetsLoaded)
            .then(() => {
                setTimeout(() => {
                    gameLoop();
                }, 1000 / 30);        
            });
    }

    return {
        initGame: initGame
    }
})();

gameManager.initGame();