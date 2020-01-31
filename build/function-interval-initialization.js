function botAge()
{
    curTime = gatherTime() - startTime;
    document.getElementById("ageText").innerHTML = 'Age: '+(curTime/60000).toFixed(2)+" minutes";
} 

const gatherTime = () => //Simple function for getting the current time
{
    const curDate = new Date(); //Just necessary to get current time
    time = curDate.getTime(); //Getting current time in ms.
    return time;
}    
startTime = gatherTime();

const arraySum = inputArray => inputArray.reduce((a,b) => a + b, 0)

let curGamemode = 'AI';
let botReadyFuncInterval = '';
let botAgeInterval = '';
let valueAverageOverTimeInterval = '';

function changeGameplayMode()
{
    if (curGamemode === 'AI')
    {
        curGamemode = 'player';
        botReady = 0;
        clearInterval(botReadyFuncInterval);
        clearInterval(botAgeInterval);
        clearInterval(valueAverageOverTimeInterval);
        
        if (mobileCheckVal)
        {
            document.getElementById('buttonBorder').style.width = '65vw'; 
            document.getElementById('mobile-aistats').style.display = 'none';            
            document.getElementById('mobile-maindisplay').style.display = 'none';
            document.getElementById('scoreText').style.display = 'block';
            document.getElementById('levelText').style.display = 'block';   
            document.getElementById('textBorder').style.display = 'block';    
            document.getElementById('left-arrow-image').style.display = 'block'; 
            document.getElementById('right-arrow-image').style.display = 'block'; 
            document.getElementById('up-arrow-image').style.display = 'block'; 
            document.getElementById('down-arrow-image').style.display = 'block'; 
        }
        else
        {

            document.getElementById('buttonBorder').style.width = '24vw';
            document.getElementById('saveProgress').style.right = '19vw';
        }

        document.getElementById('saveProgress').style.display = 'none';
        document.getElementById('reloadProgress').style.display = 'none';  
        document.getElementById('botInfoBorder').style.display = 'none';
        document.getElementById('ageText').style.display = 'none';
        document.getElementById('totalScoreText').style.display = 'none';
        document.getElementById('actionText').style.display = 'none';
        document.getElementById('totalGamesText').style.display = 'none';
        document.getElementById('rewardText').style.display = 'none';
        document.getElementById('shapeGameText').style.display = 'none';
        document.getElementById('goodShapeText').style.display = 'none';
        document.getElementById('gameplayMode').innerHTML = 'Current Gamemode: Player';
        newGame();
    }
    else
    {
        curGamemode = 'AI';
        botReadyFuncInterval = setInterval(botReadyFunc, 1);
        botAgeInterval = setInterval(botAge, 1);
        valueAverageOverTimeInterval = setInterval(valueAverageOverTime, 900000);
        document.getElementById('botInfoBorder').style.display = 'block';
        document.getElementById('ageText').style.display = 'block';
        document.getElementById('totalScoreText').style.display = 'block';
        document.getElementById('actionText').style.display = 'block';
        document.getElementById('totalGamesText').style.display = 'block';
        document.getElementById('rewardText').style.display = 'block';
        document.getElementById('shapeGameText').style.display = 'block';
        document.getElementById('goodShapeText').style.display = 'block';
        document.getElementById('saveProgress').style.display = 'block';
        document.getElementById('reloadProgress').style.display = 'block'; 
        if (mobileCheckVal)
        {
            document.getElementById('buttonBorder').style.width = '66vw';
            document.getElementById('saveProgress').style.right = '20vw';
            document.getElementById('mobile-maindisplay').style.display = 'block';       
            document.getElementById('scoreText').style.display = 'none';
            document.getElementById('levelText').style.display = 'none';    
            document.getElementById('textBorder').style.display = 'none';    
            document.getElementById('left-arrow-image').style.display = 'none'; 
            document.getElementById('right-arrow-image').style.display = 'none'; 
            document.getElementById('up-arrow-image').style.display = 'none'; 
            document.getElementById('down-arrow-image').style.display = 'none'; 
        }
        else
        {
            document.getElementById('buttonBorder').style.width = '20vw';
            document.getElementById('saveProgress').style.right = '15vw';
        }

        document.getElementById('gameplayMode').innerHTML = 'Current Gamemode: AI';
        shapeCounter = 0;
        newGame();
        botReady = 1;
    }
}

botReadyFuncInterval = setInterval(botReadyFunc, 1);
botAgeInterval = setInterval(botAge, 1);
valueAverageOverTimeInterval = setInterval(valueAverageOverTime, 900000);