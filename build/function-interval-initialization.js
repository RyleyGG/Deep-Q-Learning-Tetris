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

setInterval(botReadyFunc, 1);
setInterval(botAge, 1);
setInterval(valueAverageOverTime, 900000);