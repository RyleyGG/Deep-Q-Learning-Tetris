const canvas = document.getElementById('tetris'); //Getting the ID of the canvas we want to work with
const context = canvas.getContext('2d'); //Getting the drawing context
context.scale(60,60); //Scaling

//There is a relationship between the size of the canvas, the scaling factor, and the matrix representation of the shapes...
//Take the T-shape for example - if it is assumed that the board can be broken down into a grid, wherein smaller squares make up the board and the shapes,
//Then it can be said that the shapes themselves can also be represented in a gridlike format. This can be programmatically expressed by using a matrix as the bounding box for the shape.
//So, for the T-shape, a 3x3 matrix is enough to contain the shape and all possible rotations. Using binary formatting, a 1 is used to represent a gridspace where the shape is present, and a 0 is used when the shape is not present in that part of the bounding box.
//Breaking the T-shape up into gridspaces shows that there is a 3:2 ratio between width and height. Therefore, this needs to be represented in the scaling factor in order for the piece to proportionally match with the original Tetris T-shape.
//Before scaling, the T-shape appears to be 3-pixels wide and 2-pixels tall (again showing the 3:2 ratio). Therefore, the scaling factor should maintain this ratio.
//The ratio can be maintained as long as the x-scaling and y-scaling factors are the same as a result of simple mathematic properties.
//This is where the canvas shows up in the equation. The original tetris board is 10 gridspaces wide and 20 gridspaces tall. Therefore the height should be twice as much as the width.
//It can also be said that it should be able to hold 3 t-shapes with one gridspace left over (because each t-shape is 3 long, 3 T-shapes is 9 gridspaces, leaving 1).
//10 divided by 3 is of course 3.33333. Multiplying this by the pixel width of the T-shape after scaling: (60 * 3) * 3.3333 = 599.99999 ~ 600
//Therefore, at this scaling factor, the width should be 600 and since the height should be twice this, the height becomes 1200.


//If it is assumed that the game of Tetris occurs on a grid,
//then it can also be assumed that each of the shapes can also be broken down into smaller squares.
//By understanding this, it is then possible to break each shape up into matrices with values of
//either 0 or 1, wherein a 1 indicates that the shape is taking that gridspace up.

//Matrix representation of the T-Shape
const tShape = //Has a length of 3 (where each row counts as 1)
[
    [0,0,0],
    [1,1,1],
    [0,1,0],
];

const sShape =
[
    [0,0,0],
    [0,1,1],
    [1,1,0],
];

const zShape =
[
    [0,0,0],
    [1,1,0],
    [0,1,1],
];

const lShape =
[
    [0,1,0],
    [0,1,0],
    [0,1,1],
];

const jShape =
[
    [0,1,0],
    [0,1,0],
    [1,1,0],
];

const cubeShape =
[
    [1,1],
    [1,1],
];

const iShape =
[
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0]
];

const iShapeSide =
[
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
];

//Versions of the shapes that don't get updated by things like the rotation functions. Used to handle rotation integrity on new shapes.
const tShapeOrig = //Has a length of 3 (where each row counts as 1)
[
    [0,0,0],
    [1,1,1],
    [0,1,0],
];
const sShapeOrig =
[
    [0,0,0],
    [0,1,1],
    [1,1,0],
];
const zShapeOrig =
[
    [0,0,0],
    [1,1,0],
    [0,1,1],
];
const lShapeOrig =
[
    [0,1,0],
    [0,1,0],
    [0,1,1],
];
const jShapeOrig =
[
    [0,1,0],
    [0,1,0],
    [1,1,0],
];
const cubeShapeOrig =
[
    [1,1],
    [1,1],
];
const iShapeOrig =
[
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0],
    [0,1,0,0]
];


//////////////////////////////////////////////////////////////////////////////////////////////////////////

//                                  GENERAL VARIABLES                                    /////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////

let playerScore = 0; //Players score
let gameLevel = 0; //Level of the game, higher levels signify higher drop rates and higher scores for completing lines
let totalLinesCleared = 0; //Total lines cleared by the player
let timeSinceLastDrop = 0;
let prevDropTime = 0; //Holds the time of the previous drop to know when the player should be allowed to drop again.
let dropRate = 0; //The rate at which the pieces should drop a space, expressed in ms.
let timeSinceLastRotation = 0; //Measures the time since the current shape last rotated
const rotationRate = 100; //The fastest rate at which a shape can be rotated, expressed in ms.
let randShapeList = [] //List of shapes when they are randomly selected.
let randShapeIndex = 0;
let x_shapeBoundary = [];
let y_shapeBoundary = [];
let scoreGain = 0; //Amount of score gained whenever a line is removed

shapeList = [tShape, sShape, zShape, jShape, lShape, cubeShape, iShape]; //List of all valid shapes
origShapeList = [tShapeOrig, sShapeOrig, zShapeOrig, jShapeOrig, lShapeOrig, cubeShapeOrig, iShapeOrig];
shapeNameList = ['tShape','sShape','zShape','jShape','lShape','cubeShape', 'iShape']; //Associated list of all valid shapes
colorList = ['purple','#A50000','green','blue','#F06109','#F0C609', '#09BFF0']; //Associated list of all valid colors


//////////////////////////////////////////////////////////////////////////////////////////////////////////

//                                  SHAPE RELATED FUNCTIONS                              /////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////


function drawShape(shape, offset, activeShapeCheck)
{
    //The outer for loop works by iterating over each row (wherein each row is given a different y-value.) Each subarray is iterated by using the x-values of the subelements.
    shape.forEach((row,y) => //For each element in the array (remembering that each element is also an array)
    {
        row.forEach((value, x) => // For each value in the subarray
        {
            if (value !== 0) //If the value is 0, it means the shape shouldn't be drawn there
            {
                context.fillStyle = colorMatrix[y][x];
                if (activeShapeCheck === 1) //If only the current shape is being updated
                {
                    context.fillStyle = player.color; //Filling the valid gridspaces with the correct color
                }

                context.fillRect(x+offset.x,y+offset.y,1,1); //Only fill in one pixel at the correct spot

                context.beginPath(); //Necessary so that the outline doesn't stay behind
                context.lineWidth = "0.07"; //Width of the outline
                context.strokeStyle = 'black'; //Color of the outline
                context.rect(x+offset.x,y+offset.y,1,1); //Position of the outline, which should just be the same position as the shape itself
                context.stroke(); //Committing the outline to the shape
            }
        });
    });
    drawOutline(playArea,player.pos);
}


function drawOutline(playArea,offset) //Drawing the outline for the currently active shape
{
    const playerOutline = //Setting playerOutline as a copy of the player
    {
        pos: {x: player.pos.x, y: player.pos.y},
        matrix: player.matrix,
        shapeName: player.shapeName,
        color: player.color,
    }
    
    while (collisionCheck(playArea,playerOutline.matrix,0,playerOutline) === false) //While collisionCheck returns false, essentially whenever there were no collisions
    {
        playerOutline.pos.y++; //Send the player outline down further
    }

    if (collisionCheck(playArea,playerOutline.matrix,0,playerOutline) === true) //If a collision was detected
    {
        playerOutline.pos.y--; //Send the outline back up so its not colliding anymore
    }
    
    player.matrix.forEach((row,y) => //For each element in the array (remembering that each element is also an array)
    {
        row.forEach((value, x) => // For each value in the subarray
        {
            if (value !== 0) //If the value is 0, it means the shape shouldn't be drawn there
            {
                context.beginPath(); //Necessary so that the outline doesn't stay behind
                context.lineWidth = "0.07"; //Width of the outline
                context.strokeStyle = player.color; //Color of the outline
                context.rect(x+offset.x,y+playerOutline.pos.y,1,1); //Position of the outline, which should just be the same position as the shape itself
                context.stroke(); //Committing the outline to the shape
            }
        });
    });

}


function newShape(playerInitial) //Handles choosing a new shape, and updates the associated color and name
{
    
    for (i = 0; i < 50000; i++)
    {
        randShapeList.push(Math.floor(Math.random()*shapeList.length));

        while (randShapeList[i] === randShapeList[i-1] || randShapeList[i] === randShapeList[i-2] || randShapeList[i] === randShapeList[i-3])
        {
            randShapeList[i] = (Math.floor(Math.random()*shapeList.length));
        }
    }

    if (randShapeIndex > 50000)
    {
        randShapeIndex = 0;
    }
    
    
    randShape = shapeList[randShapeList[randShapeIndex]];
    randShapeIndex++;
    shapeColor = colorList[shapeList.indexOf(randShape)];
    shapeName = shapeNameList[shapeList.indexOf(randShape)];
    nextShapeName = shapeNameList[shapeList.indexOf(shapeList[randShapeList[randShapeIndex]])];
    document.getElementById('nextShapeImage').src = `shapepictures/${nextShapeName}.png`;

    //Different configurations for the shape placement, size, etc
    if (nextShapeName === 'iShape')
    {
        document.getElementById('nextShapeImage').style.width = '4vw';
        document.getElementById('nextShapeImage').style.top = '7vh';
    }
    else if (nextShapeName === 'tShape')
    {
        document.getElementById('nextShapeImage').style.width = '7vw';
        document.getElementById('nextShapeImage').style.top = '12vh';
        document.getElementById('nextShapeImage').style.right = '2vw';
    }
    else if (nextShapeName === 'cubeShape')
    {
        document.getElementById('nextShapeImage').style.width = '7vw';
        document.getElementById('nextShapeImage').style.top = '11vh';
        document.getElementById('nextShapeImage').style.right = '2vw';
    }
    else if (nextShapeName === 'zShape' || nextShapeName === 'sShape')
    {
        document.getElementById('nextShapeImage').style.width = '7vw';
        document.getElementById('nextShapeImage').style.top = '13vh';
        document.getElementById('nextShapeImage').style.right = '2vw';
    }
    else if (nextShapeName === 'lShape' || nextShapeName === 'jShape')
    {
        document.getElementById('nextShapeImage').style.width = '5vw';
        document.getElementById('nextShapeImage').style.top = '10vh';
        document.getElementById('nextShapeImage').style.right = '3vw';
    }


    if (playerInitial === 0)
    {
        if (player.shapeName === shapeName) // If the same shape was generated by the function twice in a row, run it again
        {
            newShape(playerInitial);
        }
        else
        {
            newShapeCheck = 1;
            if (shapeName != 'iShape' && shapeName != 'iShapeSide')
            {
                while (JSON.stringify(randShape) != JSON.stringify(origShapeList[shapeList.indexOf(randShape)]))
                {
                    const resultantLength = randShape.length-1; //Length of resultant matrix (after rotation). If you don't subtract 1, the map functions later on will get a TypeError.
                    const resultant = randShape.map((row, y) => row.map((col, x) => randShape[resultantLength-x][y])); 
                    randShape.length = 0; //If this isn't included then the matrix will grow with every rotation
                    randShape.push(...resultant); //Pushing the rotation onto shape, replacing the original values
                }
            }
            player.matrix = randShape;
            player.color = shapeColor;
            player.shapeName = shapeName;
            player.pos.x = 3;
            player.pos.y = 0;
            
            if ((collisionCheck(playArea,player.matrix,0,player) === true) || (playArea[0][2] != 0 || playArea[0][3] != 0 || playArea[0][4] != 0))
            {
                gameOver();
            }
        }
    }
    return [randShape,shapeColor,shapeName]
}
const shapeAttrib = newShape(1); //Running the newShape function and saving the results


const player = //Player with attributes of position, shape, shape color, and shape name 
{
    pos: {x: 3, y: 0},
    matrix: shapeAttrib[0],
    color: shapeAttrib[1],
    shapeName: shapeAttrib[2],
}
if (player.shapeName === 'cubeShape')
{
    player.pos.x++;
}


function playerDropAnim() //Handles the lowering of the players shape, both automatic and keybind-induced. If the shape is then out-of-play, induces new shape
{
    player.pos.y++;
    timeSinceLastDrop = 0;
    if ((collisionCheck(playArea,player.matrix,0,player)) && (playArea[0][3] === 0 && playArea[0][2] === 0 && playArea[0][4] === 0))
    {
        player.pos.y--;
        updateBoard(playArea, player);
        removeLines();
        finalShapeHeight = y_shapeBoundary[0];
        newShape(0);
    }

    playArea.forEach((row, y) =>
    {
        row.forEach((value,x) =>
        {
            if (value !== 0 && value !== 1)
            {
                collisionCheck(playArea, player.matrix, 0, player);
            }
        });
    });
}


function playerMoveAnim(input) //Handles the horizontal movement of the player, and performs collision checks and the necessary adjustments as well
{
    player.pos.x += input;

    if(collisionCheck(playArea,player.matrix,0,player))
    {
        player.pos.x -= input;
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////

//                                  BOARD RELATED FUNCTIONS                              /////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////


function createBoardMatrix(width,height) //Will generate the matrix representation of the board itself
{
    const matrix = [];

    while (height--) //while there is still valid height
    {
        matrix.push(new Array(width).fill(0)); //Pushing new arrays
    }
    return matrix;
}
let playArea = createBoardMatrix(10,20); //Generates the board matrix
let colorMatrix = createBoardMatrix(10,20); //Holds the color values for each of the spaces in the play area


function drawBoard() //Draw function that draws the board and will then update the drawing of the currently active shape as well
{
    context.fillStyle = '#000'; //Simply filling the canvas with the Hex code for black
    context.fillRect(0, 0, canvas.width, canvas.height); //Boundaries of the rectangle to fill

    drawShape(playArea, {x: 0, y: 0}, 0); //Calling drawShape with these parameters ensures that shapes already on the board will remain visible

    /* Applies a gradient and outline to the main canvas
    var gradient = context.createLinearGradient(-3, 0, 11, 0); //Setting the boundaries for the background gradient
    gradient.addColorStop(0, "black"); //Setting the beginning color
    gradient.addColorStop(1, "white"); //Setting the ending color
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height); //Applying the gradient
    */

    drawShape(player.matrix, player.pos, 1); //Drawing a shape depending on player position and selected shape (shows the shape as its still active)
    drawOutline(playArea,player.pos);
}

function updateBoard(playArea, player) //Will update the board with data from the player whenever a shape is placed
{
    player.matrix.forEach((row, y) =>
    {
        row.forEach((value,x) =>
        {
            if (value !== 0)
            {
                try
                {
                    playArea[y+player.pos.y][x+player.pos.x] += value;
                    colorMatrix[y+player.pos.y][x+player.pos.x] = player.color;
                }
                catch(TypeError)
                {
                    gameOver();
                }
            }
        });
    });
    boardUpdateCheck = 1;
    finalShapePos = [player.pos.x, player.pos.y];
    finalShapeName = player.shapeName;
    finalShapeOrientation = player.matrix;
}


function removeLines()
{
    let filledSpaces = 0; //Count of the filed spaces in a particular row of playArea
    let filledRows = []; //If a row is deemed to be completely filled, the y-value of its placement in the playArea matrix is placed here

    playArea.forEach((row, y) => //For each row in the playArea matrix
    {
        filledSpaces = 0; //Set filled spaces to 0 at the beginning of every row
        row.forEach((value,x) => //For each value in each row
        {
            if (value === 1) //If the value is 0, essentially if there is a shape there
            {
                filledSpaces++; //Increment the filedSpaces variable
            }
        });

        if (filledSpaces === playArea[0].length) //If filledSpaces is the same as the length of the playArea row, it means that the entire row is filled with shapes
        {
            filledRows.push(y); //Push the y-value of the row's position to filledRows
        }
    });

    for (i = 0; i < (filledRows.length); i++) //For however many rows were deemed filled
    {
        playArea.splice(filledRows[i],1); //Remove the filled row
        colorMatrix.splice(filledRows[i],1); //Remove the filled row from the color matrix
        playArea.unshift(new Array(10).fill(0)); //Add a new row to the top with all 0's
        colorMatrix.unshift(new Array(10).fill(0)); //Add a new row to the top with all 0's
        totalLinesCleared++; //Increment totalLinesCleared. Used to determine game level.
    }

    //Scoring based on the original Tetris game(s). More points are added for more rows completed at a time, and more depending on game level.
    if (filledRows.length === 1) 
    {
        scoreGain = (playerScore + (40*(gameLevel+1))) - playerScore;
        playerScore = playerScore + (40*(gameLevel+1));
    }
    else if (filledRows.length === 2) 
    {
        scoreGain = (playerScore + (100*(gameLevel+1))) - playerScore;
        playerScore = playerScore + (100*(gameLevel+1));
    }
    else if (filledRows.length === 3)
    {
        scoreGain = (playerScore + (300*(gameLevel+1))) - playerScore;
        playerScore = playerScore + (300*(gameLevel+1));
    }
    else if (filledRows.length === 4)
    {
        scoreGain = (playerScore + (1200*(gameLevel+1))) - playerScore;
        playerScore = playerScore + (1200*(gameLevel+1));
    }

    document.getElementById('scoreText').innerHTML = `Score: ${playerScore}` //Update the HTML representation of the current score

    setGameLevel(); //Since totalLinesCleared changed, update the current game level
    setDropRate(); //Since game level could potentially change, update the current drop rate
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////

//                                  GAMESTATE RELATED FUNCTIONS                          /////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////


function newGame()
{
    playArea = createBoardMatrix(10,20); //Generates the board matrix
    colorMatrix = createBoardMatrix(10,20); //Holds the color values for each of the spaces in the play area
    document.querySelector("#tetris").style.display = 'block';
    document.querySelector("#gameover").style.display = 'none';
    playerScore = 0; //Players score
    gameLevel = 0; //Level of the game, higher levels signify higher drop rates and higher scores for completing lines
    totalLinesCleared = 0; //Total lines cleared by the player
    randShapeIndex = 0;
    randShapeList = [];
    nextShapeName = '';
    document.getElementById('scoreText').innerHTML = `Score: ${playerScore}`
    document.getElementById('levelText').innerHTML = `Level: ${gameLevel}`
    document.getElementById('nextShapeImage').style.display = 'block';
    newShape(0);
}

function gameOver() //If the gamestate fails, this presents a "game over" screen with the total score and option to restart.
{
    document.getElementById('lostText').innerHTML = `Game Over<br>Score: ${playerScore}`
    document.querySelector("#tetris").style.display = 'none';
    document.querySelector("#gameover").style.display = 'block';
    document.getElementById('nextShapeImage').style.display = 'none';
}


function setGameLevel()
{
    if (totalLinesCleared < 10)
    {
        gameLevel = 0;
    }
    else
    {
        gameLevel = Math.floor(totalLinesCleared/10);
    }
    
    document.getElementById('levelText').innerHTML = `Level: ${gameLevel}`;

    return gameLevel;
}

const dropRateTable = { //Dictionary to handle the various drop rates, which are dependent on the game level
    0: 1000,
    1: 800,
    2: 720,
    3: 550,
    4: 470,
    5: 380,
    6: 300,
    7: 220,
    8: 130,
    levelTen: 80,
    levelThirteen: 70,
    levelSixteen: 50,
    levelNineteen: 30,
    levelTwentyNine: 20
}

function setDropRate()
{
    if (gameLevel <= 8)
    {
        dropRate = dropRateTable[gameLevel];
    }  
    else if (gameLevel >= 10 && gameLevel <= 12)
    {
        dropRate = dropRateTable[levelTen];
    }
    else if (gameLevel >= 13 && gameLevel <= 15)
    {
        dropRate = dropRateTable[levelThirteen];
    }
    else if (gameLevel >= 16 && gameLevel <= 18)
    {
        dropRate = dropRateTable[levelSixteen];
    }
    else if (gameLevel >= 19 && gameLevel <= 28)
    {
        dropRate = dropRateTable[levelNineteen];
    }
    else if (gameLevel >= 29)
    {
        dropRate = 20;
    }
}
setDropRate();


function shapeBoundaries(activeShape)
{
    x_shapeBoundary = [player.pos.x, player.pos.x];
    y_shapeBoundary = [player.pos.y, player.pos.y];

    for (i = 0; i < activeShape.length; i++) //Determing the leftmost x-boundary
    {
        if (activeShape[i][0] === 1)
        {
            x_shapeBoundary[0] = (player.pos.x)-1;
            break;
        }
    }

    for (i = 0; i < activeShape.length; i++) //Determining the rightmost x-boundary
    {
        if (activeShape[i][2] === 1)
        {
            x_shapeBoundary[1] = (player.pos.x)+1;
            break;
        }
    }

    for (i = 0; i < activeShape[0].length; i++) //Determining the highest y boundary
    {
        if (activeShape[0][i] === 1) //Goes along the highest row to determine if the shape takes up any of the spaces.
        {
            y_shapeBoundary[0] = (player.pos.y-1); //Finding the new highest y-boundary
            break;
        }
    }

    for (i = 0; i < activeShape[0].length; i++) //Determining the lowest y boundary
    {
        if (activeShape[2][i] === 1)
        {
            y_shapeBoundary[1] = (player.pos.y+1);
            break;
        }
    }
}

function collisionCheck(playArea, activeShape, rotateCheck = 0, player) //Checks for a collision between the playArea (all previous shapes) and the player (the current shape)
{   
    //Will check collision between player and other shapes/bounds of the play area
    for (y = 0; y < activeShape.length; ++y) //For however many rows there are of the current shape
    {
        for (x = 0; x < activeShape[y].length; ++x) //For each column
        {
            if (activeShape[y][x] !== 0 && (playArea[y+player.pos.y] && playArea[y+player.pos.y][x+player.pos.x]) !== 0) //If the player has hit another shape and is in bounds
            {
                return true;
            }
            else //The above handles all detections, but as a QoL for rotations the rest will process these types of collisions and move the shape appropriately
            {

                try //Out-of-bounds values can sometimes cause an error, hence the need for a try/catch
                {   
                    if (player.shapeName != 'cubeShape' && player.shapeName != 'iShape' && player.shapeName != 'iShapeSide') //If the current shape is a T, S, L, J or Z-shape
                    {
                        shapeBoundaries(activeShape);

                        //If the leftmost shape boundary is outside of the play area and the spot to the right isn't filled in OR if the player is attempting a rotation and the region in which they want to rotate into is already filled
                        if ((x_shapeBoundary[0] < -1 && playArea[player.pos.y+1][x_shapeBoundary[1]+1] === 0 && playArea[player.pos.y+1][x_shapeBoundary[1]+2] === 0 && playArea[player.pos.y][x_shapeBoundary[1]+2] === 0) || (rotateCheck === 1 && playArea[player.pos.y+1][x_shapeBoundary[0]+1] === 1 && playArea[player.pos.y+1][x_shapeBoundary[1]+2] === 0 && playArea[player.pos.y+2][x_shapeBoundary[1]+1] === 0))
                        {
                            player.pos.x++; //Move the player right to avoid the obstacle
                        }


                        //If the rightmost x-value for the shape is out of bounds and the spot directly left of the shape isn't filled OR if the player is attempting to rotate, the spot they are attempting to rotate into is already filled, and the spot to the left isn't filled
                        if ((x_shapeBoundary[1] > 8 && playArea[player.pos.y+1][x_shapeBoundary[0]] === 0 && playArea[player.pos.y+1][x_shapeBoundary[0]-1] === 0) || (rotateCheck === 1 && playArea[player.pos.y+1][x_shapeBoundary[1]+1] === 1 && playArea[player.pos.y+1][x_shapeBoundary[0]] === 0 && playArea[player.pos.y+1][x_shapeBoundary[0]-1] === 0 && (playArea[player.pos.y+2] === undefined || playArea[player.pos.y+2][x_shapeBoundary[0]-1] === 0)))
                        {
                            player.pos.x--; //Move the player left to avoid the obstacle
                        }

                        if (y_shapeBoundary[1] > 18 && rotateCheck === 0)
                        {
                            return true; //Can't remedy the collision, so return true
                        }
                    }

                    else if (player.shapeName === 'iShape')
                    {
                        x_shapeBoundary = [player.pos.x+1, player.pos.x+1];
                        y_shapeBoundary = [player.pos.y-1, player.pos.y+2];

                        //If the leftmost shape boundary is outside of the play area and the spot to the right isn't filled in OR if the player is attempting a rotation and the region in which they want to rotate into is already filled
                        if ((x_shapeBoundary[0] < -1 && rotateCheck === 0) || (rotateCheck === 1 && (playArea[player.pos.y+1][x_shapeBoundary[0]-1] !== 0 && playArea[player.pos.y+1][x_shapeBoundary[1]+1] === 0 && playArea[player.pos.y+1][x_shapeBoundary[1]+2] === 0 && playArea[player.pos.y+1][x_shapeBoundary[1]+3] === 0 && playArea[player.pos.y+1][x_shapeBoundary[1]+4] === 0)))
                        {
                            player.pos.x++; //Move the player right to avoid the obstacle
                        }

                        //If the rightmost x-value for the shape is out of bounds and the spot directly left of the shape isn't filled OR if the player is attempting to rotate, the spot they are attempting to rotate into is already filled, and the spot to the left isn't filled
                        if ((x_shapeBoundary[1] > 9 && rotateCheck === 0) || (rotateCheck === 1 && playArea[player.pos.y+1][x_shapeBoundary[1]+2] !== 0 && playArea[player.pos.y+1][x_shapeBoundary[0]-1] === 0 && playArea[player.pos.y+1][x_shapeBoundary[0]-2] === 0 && playArea[player.pos.y+1][x_shapeBoundary[0]-3] === 0 && playArea[player.pos.y+1][x_shapeBoundary[0]-4] === 0))
                        {
                            player.pos.x--; //Move the player left to avoid the obstacle
                            
                            if (rotateCheck === 1 && playArea[player.pos.y][x_shapeBoundary[0]-2] === 0) //With the iShape you have to move left a second time to be completely in bounds on a rotate
                            {
                                player.pos.x--;
                            }
                            else if (rotateCheck === 1 && playArea[player.pos.y][x_shapeBoundary[0]-2] !== 0)
                            {
                                player.pos.x++; //Undo the movement done by collision detection
                            }
                        }

                        if (rotateCheck === 0 && y_shapeBoundary[1] > 18)
                        {
                            return true; //Collision can't be remedied, return true
                        }
                    }

                    else if (player.shapeName === 'iShapeSide')
                    {
                        // With iShapeSide, we always know that it will be flat, thus the bounds can be set as such rather than being dynamically determined.
                        x_shapeBoundary = [player.pos.x,player.pos.x+2];
                        y_shapeBoundary = [player.pos.y,player.pos.y];

                        
                        //If the leftmost shape boundary is outside of the play area and the spot to the right isn't filled in OR if the player is attempting a rotation and the region in which they want to rotate into is already filled
                        if ((x_shapeBoundary[0] < -1 && rotateCheck === 0) || (rotateCheck === 1 && (playArea[player.pos.y+1] && playArea[player.pos.y+1][x_shapeBoundary[0]] !== 0)))
                        {
                            player.pos.x++; //Move the player right to avoid the obstacle
                            return false;
                        }
                        

                        //If the rightmost x-value for the shape is out of bounds and the spot directly left of the shape isn't filled OR if the player is attempting to rotate, the spot they are attempting to rotate into is already filled, and the spot to the left isn't filled
                        if ((x_shapeBoundary[1] > 8 && playArea[player.pos.y][x_shapeBoundary[0]] === 0) || (rotateCheck === 1 && playArea[player.pos.y+1][x_shapeBoundary[1]+1] !== 0 && playArea[player.pos.y][x_shapeBoundary[0]-2] === 0))
                        {
                            player.pos.x--; //Move the player left to avoid the obstacle
                        }

                        if (rotateCheck === 0 && y_shapeBoundary[1] > 18)
                        {
                            return true; //Collision can't be remedied, return true
                        }
                    }

                    else if (player.shapeName === 'cubeShape')
                    {
                        x_shapeBoundary = [player.pos.x-1,player.pos.x];
                        y_shapeBoundary = [player.pos.y-1, player.pos.y];
                    }
                }
                catch(TypeError)
                {
                    return true;
                }
            }
            
        }
    }
    return false;
}


function canvasUpdate() //Continuously updates the canvas by using draw() and requestAnimationFrame
{
    const curTime = gatherTime();
    const deltaTime = curTime-prevDropTime;
    prevDropTime = curTime;
    timeSinceLastDrop += deltaTime;

    if (timeSinceLastDrop > dropRate)
    {
        playerDropAnim();
    }

    drawBoard(); //Calling drawBoard() to redraw the shape
    requestAnimationFrame(canvasUpdate); //Used to actually update the onscreen animation
}


prevRotationTime = gatherTime();

function playerAction(decision, event) //Combines both the player inputs and the AI inputs
{
    if (decision === 'right' || event === 'ArrowRight' )
    {
        playerMoveAnim(1);
    }
    else if (decision === 'left' || event === 'ArrowLeft') //Wherein 0 represents the leftmsot player position before clipping occurs. Will likely have to change depending on the shape.
    { 
        playerMoveAnim(-1);
    }
    else if (decision === 'rotate' || event === 'ArrowUp') //Will rotate the shape clockwise
    {
        function rotateShape() 
        {
            const curTime = gatherTime();
            const deltaTime = curTime-prevRotationTime;
            prevRotationTime = curTime;
            timeSinceLastRotation += deltaTime;
            if ((player.shapeName != 'cubeShape' && player.shapeName != 'iShape' && player.shapeName != 'iShapeSide') && (timeSinceLastRotation > rotationRate))
            {
                const resultantLength = player.matrix.length-1; //Length of resultant matrix (after rotation). If you don't subtract 1, the map functions later on will get a TypeError.
                const resultant = player.matrix.map((row, y) => row.map((col, x) => player.matrix[resultantLength-x][y])); //The rows are mapped to columns before being mapped to [reulstantLength-x][y], which yields a clockwise rotation
                if (collisionCheck(playArea, resultant,1,player) === false)
                {
                    player.matrix.length = 0; //If this isn't included then the matrix will grow with every rotation
                    player.matrix.push(...resultant); //Pushing the rotation onto shape, replacing the original values
                    timeSinceLastRotation = 0;
                    return player.matrix;
                }
            }
            else if ((player.shapeName === 'iShape' || player.shapeName === 'iShapeSide') && (timeSinceLastRotation > rotationRate))
            {
                let resultant = [];

                if (player.shapeName === 'iShape')
                {
                    resultant = iShapeSide;
                }
                else
                {
                    resultant = iShape;
                }

                if (collisionCheck(playArea, resultant, 1, player) === false)
                {
                    player.matrix = resultant;
                    timeSinceLastRotation = 0;

                    if (player.shapeName === 'iShape')
                    {
                        player.shapeName = 'iShapeSide';    
                    }
                    else
                    {
                        player.shapeName = 'iShape';
                    }
                    return player.matrix;
                }
            }
        }
        rotateShape(); //Center here should be generalized when other shapes are added
        drawBoard();
    }
    else if (decision === 'soft down' || event === 'ArrowDown') //Speeds up the fall rate of the shape
    {
        playerDropAnim();
    }
    else if (decision === 'hard down' || event === ' ') //Automatically sends shape to the bottom
    {
        
        while (collisionCheck(playArea,player.matrix,0,player) === false)
        {
            player.pos.y++;
        }
        

        if (collisionCheck(playArea,player.matrix,0,player) === true)
        {
            player.pos.y--;
            playerDropAnim();
        }
    }
}

document.addEventListener('keydown', event =>
{
    if (curGamemode === 'player') playerAction('',event.key);
});

canvasUpdate();