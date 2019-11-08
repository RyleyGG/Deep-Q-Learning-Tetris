// AI-STATE RELATED VARIABLES //
let brain;
let gameInfo;
let decision;
let reward = 0;
let botReady = 0; //Marker for whether or not the script is ready for the AI to take another action or not

// VARIABLES USED FOR DECISIONS/CALCULATIONS IN FUNCTIONS //
let prevDecisionTime = 0;
let boardUpdateCheck = 0;
let newShapeCheck = 1;
let finalShapeHeight = 0;
let finalShapePos = [];
let finalShapeOrientation = [];
let finalShapeName;
let playerScoreOld = 0; //Keeping a record of the total player score before the next action
let totalLinesClearedOld = 0; //Keeping a record of the total lines cleared before the next action


// VARIABLES USED FOR DISPLAYING DATA TO USER //
let actionCount = 0;

let currentRewardAverage = 0;
let timedRewardAverage = 0;

let totalGamesPlayed = 0;
let totalScore = 0;

let rewardValues = [];
let currentShapeAverage = 0;
let timedShapeAverage = 0;

let shapeCounter = 1;
let shapeCountSet = [];
let shapeCountSetSum = 0;
let timedShapeCountSetSum = 0;

let goodShapeCount = 0;
let goodShapeCountSetSum = 0;
let goodShapeCountSet = [];
let timedGoodShapeAverage = 0;
let currentGoodShapeAverage = 0;

inputNum = 13;
actionNum = 5;


function initNet()
{
    const temporal_window = 1; // amount of temporal memory. 0 = agent lives in-the-moment. Should keep at 1.
    const network_size = inputNum*temporal_window + actionNum*temporal_window + inputNum;
    
    
    let layer_defs = [];
    layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:network_size});
    layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons: 50, activation:'relu'});
    layer_defs.push({type:'regression', num_neurons:actionNum});
    
    
    // options for the Temporal Difference learner that trains the above net
    // by backpropping the temporal difference learning rule.
    let tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};
    
    //opt is the set of all configurable options related to the bot
    //Array of the various options
    let opt = {};
    opt.temporal_window = temporal_window; //The amount of "temporal memory" the AI has, in terms of "time steps"
    opt.experience_size = 500000; //size of experience replay memory
    opt.start_learn_threshold = 50000; //number of examples in experience replay memory before AI begins learning
    opt.gamma = 0.9; //Determines how much the AI plans ahead, on a scale of 0 to 1.
    opt.learning_steps_total = 500000; //Number of total steps to learn for
    opt.learning_steps_burnin  = 25000; //For the above number of steps, how many should be completely random at the beginning of the learning process?
    opt.epsilon_min = 0.01; //Epsilon determines the amount of randomness the AI will implement over time. Set to 0 for AI to only use learned experiences deep into the learning process
    opt.epsilon_test_time = 0.01; //what epsilon to use at test time? (i.e. when learning is disabled)
    opt.layer_defs = layer_defs; //For some reason, this is causing NaN values, so don't include for now.
    opt.tdtrainer_options = tdtrainer_options;
    brain = new deepqlearn.Brain(inputNum, actionNum, opt);
    botReady = 1;
}



function progressUpdate(action) //This function will allow the user to manually save or reload progress of the bot, including all its experiences and statistics
{
    if (action === 'save')
    {
        window.localStorage.clear();
        botReady = 0;
        window.localStorage.setItem('value_net',JSON.stringify(brain.value_net.toJSON()));
        botReady = 1;
    }

    else if (action === 'reload')
    {
        botReady = 0;
        brain.value_net.fromJSON(JSON.parse(window.localStorage.getItem('value_net')));
        botReady = 1;
    }
}



function actionSet(decision = '')
{
    if (document.querySelector('#gameover').style.display != 'block')
    {
        if (decision === 0)
        {
            playerAction('rotate');
        }
        else if (decision === 1)
        {
            playerAction('left');
        }
        else if (decision === 2)
        {
            playerAction('right');
        }
        else if (decision === 3)
        {
            playerAction('soft down');
        }
        else if (decision === 4)
        {
            //playerAction('hard down');
        }
    }

    if (document.querySelector("#gameover").style.display === 'block') //Automatically restart the game if bot fails
    {
        reward -= 50;
        brain.backward(reward);
        reward = 0;

        totalGamesPlayed++;

        //Setting up Average Shapes Per Game display
        shapeCountSet.push(shapeCounter);
        if (shapeCountSet[0] === 0) shapeCountSet.shift();
        shapeCountSetSum = arraySum(shapeCountSet);
        currentShapeAverage = (shapeCountSetSum/shapeCountSet.length);
        if (currentShapeAverage-timedShapeAverage > 0) document.getElementById('shapeGameText').innerHTML = 'Average Shapes Per Game: '+currentShapeAverage.toFixed(1)+' (+'+(currentShapeAverage-timedShapeAverage).toFixed(1)+' last 15 min.)';
        else if (currentShapeAverage-timedShapeAverage < 0) document.getElementById('shapeGameText').innerHTML = 'Average Shapes Per Game: '+currentShapeAverage.toFixed(1)+' ('+(currentShapeAverage-timedShapeAverage).toFixed(1)+' last 15 min.)';        


        //Setting up Average "Good Shapes" Per Game Display
        goodShapeCountSet.push(goodShapeCount);
        goodShapeCountSetSum = arraySum(goodShapeCountSet);
        currentGoodShapeAverage = (goodShapeCountSetSum/goodShapeCountSet.length);
        if (currentGoodShapeAverage-timedGoodShapeAverage > 0) document.getElementById('goodShapeText').innerHTML = 'Average "Good Shapes" Per Game: '+currentGoodShapeAverage.toFixed(1)+' (+'+(currentGoodShapeAverage-timedGoodShapeAverage).toFixed(1)+' last 15 min.)';
        else if (currentGoodShapeAverage-timedGoodShapeAverage < 0) document.getElementById('goodShapeText').innerHTML = 'Average "Good Shapes" Per Game: '+currentGoodShapeAverage.toFixed(1)+' ('+(currentGoodShapeAverage-timedGoodShapeAverage).toFixed(1)+' last 15 min.)';        

        shapeCounter = 0;
        totalLinesClearedOld = 0;
        goodShapeCount = 0;
        document.getElementById('totalGamesText').innerHTML = 'Total Games Played: '+totalGamesPlayed;
        playerScoreOld = 0; //Keeping a record of the total player score before the next game
        newGame();
    }
}

function botReadyFunc()
{
    if (botReady === 1 && ((gatherTime() - prevDecisionTime) >= 1))
    {
        refreshBot();
        prevDecisionTime = gatherTime();
    }
}

function valueAverageOverTime()
{
    rewardValues = brain.average_reward_window.v;

    for (x = 0; x < rewardValues.length; x++)
    {
        if (rewardValues[x] === 0)
        {
            rewardValues.splice(x);
        }
    }

    timedRewardAverage = (arraySum(rewardValues)/rewardValues.length);
    
    timedShapeAverage = (arraySum(shapeCountSet)/shapeCountSet.length);

    timedGoodShapeAverage = (arraySum(goodShapeCountSet)/goodShapeCountSet.length);
}

function highestShapeHeight(matrix)
{
   function isShape(value)
   {
       return value > 0;
   }

   for (i = 0; i < matrix.length; i++)
   {
       if (matrix[i].find(isShape) != undefined)
       {
           return i;
       }
   }
   return 0;

}

function refreshBot() //Refreshes the AI with no information regarding the gamestate and applies rewards
{
    botReady = 0;
    actionCount++;

    if (brain.experience_size === 500000 && actionCount >= 450000 && actionCount <= 450005) brain.experience_size = 1000000;
    else if (brain.experience_size === 1000000 && actionCount >= 950000 && actionCount <= 950005) brain.experience_size = 1500000;
    else if (brain.experience_size === 1500000 && actionCount >= 1450000 && actionCount <= 1450005) brain.experience_size = 2000000;
    else if (brain.experience_size === 2000000 && actionCount >= 1950000 && actionCount <= 1950005) brain.experience_size = 2500000;
    else if (brain.experience_size === 2500000 && actionCount >= 2450000 && actionCount <= 2450005) brain.experience_size = 3000000;
    else if (brain.experience_size === 3000000 && actionCount >= 2950000 && actionCount <= 2950005) brain.experience_size = 3500000;
    else if (brain.experience_size === 3000000 && actionCount >= 3499990 && actionCount <= 3499995) brain.experience_size = 5000000;

    if (brain.learning_steps_total === 500000 && actionCount >= 450000 && actionCount <= 450005) brain.learning_steps_total = 1000000;
    else if (brain.learning_steps_total === 1000000 && actionCount >= 950000 && actionCount <= 950005) brain.learning_steps_total = 2000000;
    else if (brain.learning_steps_total === 2000000 && actionCount >= 1450000 && actionCount <= 1450005) brain.learning_steps_total = 2500000;
    else if (brain.learning_steps_total === 2500000 && actionCount >= 1950000 && actionCount <= 1950005) brain.learning_steps_total = 3000000;
    else if (brain.learning_steps_total === 3000000 && actionCount >= 3000000 && actionCount <= 3000005) brain.learning_steps_total = 5000000;
    else if (brain.learning_steps_total === 5000000 && actionCount >= 7490000 && actionCount <= 7490005) brain.learning_steps_total = 12500000;
    else if (brain.learning_steps_total === 7500000 && actionCount >= 12500000 && actionCount <= 12500005) brain.learning_steps_total = 15000000;
    else if (brain.learning_steps_total === 15000000 && actionCount >= 15000000 && actionCount <= 15000005) brain.learning_steps_total = 25000000;
    

    document.getElementById('actionText').innerHTML = 'Total Actions: '+ actionCount;

    if (document.querySelector('#gameover').style.display != 'block')
    {
        //The following gameInfo breaks the source code as it includes non-number values
        //gameInfo = [player.matrix, [player.pos.x+1, player.pos.y+1], playArea, gameLevel]; //All the information available to the AI (origShapeList[shapeNameList.indexOf(nextShapeName)] for info on next shape)
        
        function rotationIndex() //For each shape, assign a value to the different possible rotations for the purposes of gameInfo
        {
            if (player.shapeName === 'tShape')
            {
                if (JSON.stringify(player.matrix) === JSON.stringify([[0,0,0],[1,1,1],[0,1,0]])) //Tail facing down
                {
                    return 1;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[1,1,0],[0,1,0]])) //Tail facing left
                {
                    return 2;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[1,1,1],[0,0,0]])) //Tail facing up
                {
                    return 3;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[0,1,1],[0,1,0]])) //Tail facing right
                {
                    return 4;
                }
            }

            else if (player.shapeName === 'zShape')
            {
                if (JSON.stringify(player.matrix) === JSON.stringify([[0,0,0],[1,1,0],[0,1,1]]) || (JSON.stringify(player.matrix) === JSON.stringify([[1,1,0],[0,1,1],[0,0,0]]))) //actual z-shape
                {
                    return 1;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[1,1,0],[1,0,0]]) || (JSON.stringify(player.matrix) === JSON.stringify([[0,0,1],[0,1,1],[0,1,0]]))) //z standing up
                {
                    return 2;
                }
            }

            else if (player.shapeName === 'sShape')
            {
                if (JSON.stringify(player.matrix) === JSON.stringify([[0,0,0],[0,1,1],[1,1,0]]) || (JSON.stringify(player.matrix) === JSON.stringify([[0,1,1],[1,1,0],[0,0,0]]))) //actual s-shape
                {
                    return 1;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[1,0,0],[1,1,0],[0,1,0]]) || (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[0,1,1],[0,0,1]]))) //s standing up
                {
                    return 2;
                }
            }

            else if (player.shapeName === 'jShape')
            {
                if (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[0,1,0],[1,1,0]])) //normal J shape
                {
                    return 1;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[1,0,0],[1,1,1],[0,0,0]])) //J laying on its long side
                {
                    return 2;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,1,1],[0,1,0],[0,1,0]])) //J laying on the tip of its long side
                {
                    return 3;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,0,0],[1,1,1],[0,0,1]])) //J laying on the tip of its short side
                {
                    return 4;
                }
            }

            else if (player.shapeName === 'lShape')
            {
                if (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[0,1,0],[0,1,1]])) //normal L shape
                {
                    return 1;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,0,0],[1,1,1],[1,0,0]])) //L laying on the tip of its short side
                {
                    return 2;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[1,1,0],[0,1,0],[0,1,0]])) //L laying on the tip of its long side
                {
                    return 3;
                }

                else if (JSON.stringify(player.matrix) === JSON.stringify([[0,0,1],[1,1,1],[0,0,0]])) //L laying on its long side
                {
                    return 4;
                }
            }

            else if (player.shapeName === 'iShape')
            {
                return 1;
            }

            else if (player.shapeName === 'iShapeSide')
            {
                return 1;
            }

            else if (player.shapeName === 'cubeShape')
            {
                return 1;
            }
        }
        rotationIndex();

        gameInfo = [shapeNameList.indexOf(player.shapeName), shapeNameList.indexOf(nextShapeName), rotationIndex(), (player.pos.x+1), (player.pos.y+1)];
        
        if (player.shapeName === 'iShape')
        {
            gameInfo[3] += 1;
            gameInfo[4] += 1;
        }
        else if (player.shapeName === 'iShapeSide')
        {
            gameInfo[4] += 1;
        }

        
        for (y = player.pos.y; y < player.pos.y+2; y++)
        {
            for (x = player.pos.x-2; x < player.pos.x+2; x++)
            {
                if (playArea[y] && playArea[y][x] != undefined)
                {
                    gameInfo.push(playArea[y][x]);
                }
                else
                {
                    gameInfo.push(2);
                }
            }
            
        }

        for (i = 0; x < gameInfo.length; i++)
        {
            if (typeof gameInfo[i] != 'number')
            {
                gameInfo[i] = 0;
            }
        }

        decision = brain.forward(gameInfo); //Based on the information above, the bot makes a decision
        actionSet(decision); //Apply that decision to the game
    }
    else actionSet();

    function rewardApplication()
    {
        if (totalLinesCleared > totalLinesClearedOld) //If, after applying the decision, the new number of lines cleared is greater than before the action, reward the AI
        {
            totalScore += (scoreGain);
            document.getElementById('totalScoreText').innerHTML = 'Total Score: '+totalScore;
            reward += ((playerScore-playerScoreOld)*10); //Reward the AI with an amount equivalent to the difference in player score*50
            brain.backward(reward);
            reward = 0;
            playerScoreOld = playerScore;
            totalLinesClearedOld = totalLinesCleared; //Keeping a record of the total lines cleared before the next action
        }

        function properShapeUsage() //After a shape is placed, this will determine whether the AI used that shape in an effective manner, and if so then reward it; punish it otherwise
        {
            finalShapePos = [finalShapePos[0]+1, finalShapePos[1]+1]; //Getting the actual values associated with the player position to match with the playArea matrix

            if (finalShapeName === 'tShape')
            {
                if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,0,0],[1,1,1],[0,1,0]])) //Tail facing down
                {
                    if ((playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1 || playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1) && (playArea[finalShapePos[1]+2] === undefined || playArea[finalShapePos[1]+2][finalShapePos[0]] === 1))
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,1,0],[1,1,0],[0,1,0]])) //Tail facing left
                {
                    if (playArea[finalShapePos[1]-1][finalShapePos[0]-1] === 1 || playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1)
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,1,0],[1,1,1],[0,0,0]])) //Tail facing up
                {
                    if ((playArea[finalShapePos[1]+1] && playArea[finalShapePos[1]+1][finalShapePos[0]] === 1) || (playArea[finalShapePos[1]-1][finalShapePos[0]-1] === 1 || playArea[finalShapePos[1]-1][finalShapePos[0]+1] === 1))
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else if (playArea[finalShapePos[1]+1] === undefined)
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,1,0],[0,1,1],[0,1,0]])) //Tail facing right
                {
                    if (playArea[finalShapePos[1]-1][finalShapePos[0]+1] === 1 || playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1)
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }
            }

            else if (finalShapeName === 'zShape' && shapeCounter > 3)
            {
                if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,0,0],[1,1,0],[0,1,1]]) || (JSON.stringify(player.matrix) === JSON.stringify([[1,1,0],[0,1,1],[0,0,0]]))) //actual z-shape
                {
                    if (playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1)
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,1,0],[1,1,0],[1,0,0]]) || (JSON.stringify(player.matrix) === JSON.stringify([[0,0,1],[0,1,1],[0,1,0]]))) //z standing up
                {
                    if (playArea[finalShapePos[1]+1][finalShapePos[0]] === 1)
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }
            }

            else if (finalShapeName === 'sShape' && shapeCounter > 3)
            {
                if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,0,0],[0,1,1],[1,1,0]]) || (JSON.stringify(player.matrix) === JSON.stringify([[0,1,1],[1,1,0],[0,0,0]]))) //actual s-shape
                {
                    if (playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1)
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[1,0,0],[1,1,0],[0,1,0]]) || (JSON.stringify(player.matrix) === JSON.stringify([[0,1,0],[0,1,1],[0,0,1]]))) //s standing up
                {
                    if (playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1)
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }
            }

            else if (finalShapeName === 'jShape')
            {
                if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,1,0],[0,1,0],[1,1,0]])) //normal J shape
                {
                    if ((playArea[finalShapePos[1]+2] === undefined) || (playArea[finalShapePos[1]+2][finalShapePos[0]] === 1 && playArea[finalShapePos[1]+2][finalShapePos[0]-1] === 1))
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[1,0,0],[1,1,1],[0,0,0]])) //J laying on its long side
                {
                    if ((playArea[finalShapePos[1]+1] === undefined) || (playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1 && playArea[finalShapePos[1]+1][finalShapePos[0]] === 1 && playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1))
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,1,1],[0,1,0],[0,1,0]])) //J laying on the tip of its long side
                {
                    if (playArea[finalShapePos[1]][finalShapePos[0]+1] === 1)
                    {
                        reward += 7.5;
                        goodShapeCount++;

                        if (playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1)
                        {
                            reward += 7.5;
                            goodShapeCount++;
                        }
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,0,0],[1,1,1],[0,0,1]])) //J laying on the tip of its short side
                {
                    if (playArea[finalShapePos[1]+1][finalShapePos[0]] === 1)
                    {
                        reward += 7.5;
                        goodShapeCount++;

                        if (playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1)
                        {
                            reward += 7.5;
                            goodShapeCount++;
                        }
                    }
                    else
                    {
                        reward -= 15;
                    }
                }
            }

            else if (finalShapeName === 'lShape')
            {
                if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,1,0],[0,1,0],[0,1,1]])) //normal L shape
                {
                    if ((playArea[finalShapePos[1]+2] === undefined) || (playArea[finalShapePos[1]+2][finalShapePos[0]] === 1 && playArea[finalShapePos[1]+2][finalShapePos[0]+1] === 1))
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,0,0],[1,1,1],[1,0,0]])) //L laying on the tip of its short side
                {
                    if (playArea[finalShapePos[1]+1][finalShapePos[0]] === 1)
                    {
                        reward += 7.5;
                        goodShapeCount++;

                        if (playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1)
                        {
                            reward += 7.5;
                            goodShapeCount++;
                        }
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[1,1,0],[0,1,0],[0,1,0]])) //L laying on the tip of its long side
                {
                    if (playArea[finalShapePos[1]][finalShapePos[0]-1] === 1)
                    {
                        reward += 7.5;
                        goodShapeCount++;

                        if (playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1)
                        {
                            reward += 7.5;
                            goodShapeCount++;
                        }
                    }
                    else
                    {
                        reward -= 15;
                    }
                }

                else if (JSON.stringify(finalShapeOrientation) === JSON.stringify([[0,0,1],[1,1,1],[0,0,0]])) //L laying on its long side
                {
                    if ((playArea[finalShapePos[1]+1] === undefined) || (playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1 && playArea[finalShapePos[1]+1][finalShapePos[0]] === 1 && playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1))
                    {
                        reward += 15;
                        goodShapeCount++;
                    }
                    else
                    {
                        reward -= 15;
                    }
                }
            }

            else if (finalShapeName === 'iShape')
            {
                if ((playArea[finalShapePos[1]][finalShapePos[0]-1] === undefined || playArea[finalShapePos[1]][finalShapePos[0]-1] === undefined) || (playArea[finalShapePos[1]+2][finalShapePos[0]-1] === 1 || playArea[finalShapePos[1]+2][finalShapePos[0]+1] === 1))
                {
                    reward += 15;
                    goodShapeCount++;
                }
            }

            else if (finalShapeName === 'iShapeSide')
            {
                if ((playArea[finalShapePos[1]+1] === undefined) || (playArea[finalShapePos[1]+1][finalShapePos[0]-1] === 1 && playArea[finalShapePos[1]+1][finalShapePos[0]] === 1 && playArea[finalShapePos[1]+1][finalShapePos[0]+1] === 1 && playArea[finalShapePos[1]+1][finalShapePos[0]+2] === 1))
                {
                    reward += 15;
                    goodShapeCount++;
                }
                else
                {
                    reward -= 15;
                }
            }

            else if (finalShapeName === 'cubeShape')
            {
                finalShapePos = [finalShapePos[0]+1, finalShapePos[1]+1];

                if ((playArea[finalShapePos[1]+2] == undefined) || (playArea[finalShapePos[1]+2][finalShapePos[0]-1] === 1 && playArea[finalShapePos[1]+2][finalShapePos[0]] === 1))
                {
                    reward += 15;
                    goodShapeCount++;
                }
                else
                {
                    reward -= 15;
                }
            }

            if (reward !== 0) 
            {
                brain.backward(reward);
                reward = 0;
            }
        }

        if (boardUpdateCheck === 1) properShapeUsage();
        
        //////////////////////////////// Rewarding/Punishing AI based on most recent shapes placement relative to the rest of the board ////////////////////////////////
        
        /*
        let playAreaOld = createBoardMatrix(10,20); //Keeping a record of the variance in play record between each action

        function setplayAreaOld()
        {
            for (i = 0; i < playArea[0].length; i++) //For however many columns there are
            {
                for (x = 0; x < playArea.length; x++) //For however many rows there are
                {
                    playAreaOld[x][i] = playArea[x][i];
                }
            }
        }
        setplayAreaOld();


    
        const playAreaOld_highestShapeHeight = (highestShapeHeight(playAreaOld));
        const playArea_highestShapeHeight = (highestShapeHeight(playArea));

        
        if ((playAreaOld_highestShapeHeight === playArea_highestShapeHeight) && boardUpdateCheck === 1) //Rewarding the AI for continuing already existing lines rather than needlessly building up
        {
            reward += 7.5;
        }
        else if ((finalShapeHeight > playArea_highestShapeHeight) === false && shapeCounter > 3 && boardUpdateCheck === 1)
        {
            reward -= 10;
        }
        

        if ((finalShapeHeight > playArea_highestShapeHeight) && boardUpdateCheck === 1 && shapeCounter > 3) //Rewarding the AI for placing the current shape lower than the currenlty highest row
        {
            reward += 15;
        }
        brain.backward(reward);
        reward = 0;
        */

        //////////////////////////////// Rewarding AI for filling consecutive spaces on the same line ////////////////////////////////

        //let consecutiveFilledSpaces = 0;
        //let consecutiveFilledSpacesTotal = 0;

        if (false) //(boardUpdateCheck === 1)
        {
            for (i = finalShapeHeight; i < (finalShapeHeight+3); i++) //Determing the ratio of filled gridspaces in a row to unfilled. If a shape is in a row, and less than 50% of the row is filled, punish
            {
                if (playArea[i] && playArea[i].indexOf(1) != -1) //If theres a filled gridspace on the current row
                {
                    consecutiveFilledSpaces = 0; //Set the counter for consecutive filled spaces to 0
                    consecutiveFilledSpacesTotal = 0; //Set the counter for consecutive filled spaces to 0
                    
                    for (x = 0; x < playArea[0].length; x++) //for all the values on that row
                    {
                        if (playArea[i][x] === 1) //if that gridspace is filled
                        {

                            if (playArea[i][x-1] === 1)
                            {
                                consecutiveFilledSpaces++;
                            }
                            else 
                            {
                                if (consecutiveFilledSpaces > consecutiveFilledSpacesTotal)
                                {
                                    consecutiveFilledSpacesTotal = consecutiveFilledSpaces;
                                    consecutiveFilledSpaces = 0;
                                }
                                else consecutiveFilledSpaces = 0;
                            }
                        }
                        else
                        {
                            if (consecutiveFilledSpaces > consecutiveFilledSpacesTotal)
                            {
                                consecutiveFilledSpacesTotal = consecutiveFilledSpaces;
                                consecutiveFilledSpaces = 0;
                            }
                            else consecutiveFilledSpaces = 0;
                        }
                    }
                }
                else
                {
                break;
                } 

                if (consecutiveFilledSpacesTotal >= 4) 
                {
                    reward += (3**consecutiveFilledSpacesTotal);
                }
            }
        }
    }
    rewardApplication();
    
    if (newShapeCheck === 1)
    {
        shapeCounter++;
    }

    boardUpdateCheck = 0;
    newShapeCheck = 0;


    if (reward === 0) brain.backward(reward); //Applying the rewards accrued if zero so that every action has feedback returned

    rewardValues = brain.average_reward_window.v;
    for (x = 0; x < rewardValues.length; x++)
    {
        if (rewardValues[x] === 0)
        {
            rewardValues.splice(x);
        }
    }
    if(rewardValues.length != 0) 
    {
        currentRewardAverage = (arraySum(rewardValues)/rewardValues.length);
        if (currentRewardAverage-timedRewardAverage > 0) document.getElementById('rewardText').innerHTML = 'Average Reward: '+currentRewardAverage.toFixed(1)+ ' ( +'+(currentRewardAverage-timedRewardAverage).toFixed(1)+' last 15 min.)';
        else document.getElementById('rewardText').innerHTML = 'Average Reward: '+currentRewardAverage.toFixed(1)+ ' ('+(currentRewardAverage-timedRewardAverage).toFixed(1)+' last 15 min.)';
    }

    botReady = 1;
    reward = 0;
}