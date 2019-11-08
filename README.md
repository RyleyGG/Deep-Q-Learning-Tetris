# Deep Q-Learning Tetris
A ground-up recreation of the classic game of 'Tetris', with the added layer of an AI learning the game via Deep Q-Learning, specifically utilizing the ConvnetJS library within Javascript.

This project can be found [here](https://www.projects.ryleygg.com/tetris/).

The project is written completely in Javascript, save for the baseline needed HTML and CSS to create and structure the different elements; all animations are handled within the Javascript.


## The Tetris Portion -- Introduction

In order to create an AI that could manipulate the game of Tetris and learn from its experiences, I first had to create the game itself from the ground-up. Technically speaking, this was relatively straight-forward. At its core, the code was written with the assumption that the game board could be represented as a matrix filled with binary values of 0 or 1; a 0 indicates a gridspace isn't occupied, and 1 indicates a gridspace is occupied, meaning a shape is currently in that spot. The same assumption was made of the individual shapes -- they can be represented as matrices with binary values representing whether or not the shape is actually occupying that space or not. Upon this basis, I was able to sort the various pieces of code into 3 main categories: shape related, board related, and gamestate related. 

### Shape Related Functions

* Drawing the shape - this includes both drawing the shape and any properties associated with it, primarily the outline. As stated above, this is predicated among the assumption that a shape can be represented as a matrix. Take, for example, the T-Shape: 

<img src="https://vice-images.vice.com/images/content-images/2016/05/18/tetris-the-movie-vgtrn-body-image-1463571891.png" width="175" alt='T-Shape'>

This shape can be represented in a 3x3 matrix in the following configuration:
[
[0,0,0],
[1,1,1],
[0,1,0],
]

Using this information is what allows the program to draw the shape in the proper position, given also that the gameboard itself is represented in a matrix in a similar fashion.

* Drawing the predictive outline - There exists a predictive outline that will display where the shape will land were you to continue moving straight down. This is more of a quality-of-life feature for players. This works very similarly to how drawing the shape works, with the added quality of invoking the collision algorithm (which will get discussed later) in order to determine how much further down the shape can go before colliding with another object. Once that point has been reached, the predictive outline will be rendered at that point with the proper orientation.

* Choosing a new shape - In order to implement the 'next shape' indicator to the player, the easiest method I saw of achieving this was by randomly generating shapes and adding these to an array up to a length of 50000 and using that as the shape list. Every time a game over state is reached, the list is regenerated upon the start of a new game. It is also at this point that the 'next shape' indicator is updated to be accurate. The quickest implementation for this was to just use images, and so it is at this point that the associated CSS element with the image element is updated to reflect how that shape should look.

* Player movement - Whenever the player moves positions, they are either moving left or right or moving downward. These movements have been consolidated into two different functions -- one for moving left/right and one for moving downward. The function handling left/right movement will invoke the collision algorithm to determine whether or not the player can move into a space and, depending on the value, place the current shape appropriately. The function handling downward movement does something similar but has a couple of extra responsibilites: firstly, the player's shape automatically drops a space at a rate determined by the game's current level. As with most other versions of Tetris, the game level determines how fast the player's shape drops on the screen. The drop rate is determined by the drop rates found in the earliest versions of Tetris. Secondly, the function also handles the transition between the current shape and the next once the current shape can no longer move down -- this is caused by the shape either landing on top of another shape or reaching the bottom of the game board. In either case, the player drop functionw ill invoke the collision algorithm to determine if this is the case, and if it is, then it will update the board, check for any lines that can be removed, and grants the player a new shape.

### Board Related Functions

* Creating the Board Matrix - As stated before, the game board is represented as a matrix. At the beginning of execution, a function runs that actually creates the matrix that represents the game board, as well as the matrix that holds all the associated color values for the boards various spaces.

* Drawing/updating the board - After a shape is placed, the board has to be updated so that the placement of this shape is retained and visually represented after the next shape is generated. This is done by iterating through the matrix representation of the shape and, if a certain space in that matrix is filled, fill the assocaited space on the game board matrix with the shape and the correct corresponding color.

* Removing lines - Everytime a shape is placed, a check is done for any lines that have been completed and therefore be removed. The check is done by iterating through every row in the matrix and determing whether or not the entire row is filled. if it is, that row is spliced, a new row is added at the top of the matrix, and score is applied. Much like the other attributes of the game, the scoring is based on the original versions of Tetris; the score gained is dependent on the current game level and how many lines were cleared at the same time.


### Gamestate Related Functions

* New game/game over - Whenever a new game state is instantiated, certain variables are reset and the game board is redrawn so that its clear for the upcoming game. The set of shapes is also reset. Whenever a gameover state is reached, the display is changed to display the 'game over' screen with the option of starting another game.

* Setting the game level & drop rates - The current game level is dependent on how many lines the player has cleared in the current game. Every 10 lines the player clears will raise the game level by 1. The drop rate of the current shape is completely dependent on the game level. At level 0, the drop rate is 1 second, at level 1 it is 0.8 seconds, and so on until level 29 with a drop rate of every 20 milliseconds.

* Collision algorithm - In order to ensure that shapes don't collide with each other or go out of bounds, there exists a collision algorithm that will stop these interactions from occuring or if possible, allow the interactions with a slight modification in the outcome. For example, if the player was attempting to rotate a shape into an orientation that would normally put it partially out-of-bounds, the collision algorithm may still allow the rotation but only after moving the shape inwards to prevent it from going out-of-bounds. The collision algorithm currently works by gathering the x and y based boundaries - meaning the leftmost/rightmost filled spots and the highest/lowest filled spots - and determining whether or not these will collide with something on the game board.

## The AI Portion -- ConvnetJS

As stated at the top of the description, I decided to use ConvnetJS as my library of choice for this project. Specifically, I decided on using the Deep Q-Learning module of the library as this particular method of training is exceptionally interesting to me and intuitive in design. There have been entire academic papers published on the topic that attempt to explain the complexities of such a network, so I won't do so in detail here - instead, [check this out](https://www.analyticsvidhya.com/blog/2019/04/introduction-deep-q-learning-python/) if you are intersted in learning about Deep Q-Learning in detail. In summary, it is a method of training an Artifical Intelligence towards an objective by defining objects such states and actions. The state is simply the state of the game, which the AI interprets in a mathematical sense. The actions, of course, represent the various actions the bot can take, also represented in a numerical sense. Deep Q-Learning is all about using trial and error to train an AI. When a person is learning by trial and error, we have the ability to abstract information about the scenario and think to ourselves "I know if I perform this move, it will lead to a success 10 steps from now." In case of a failure, we also have the ability to recount our previous steps and realize what we should avoid doing in the future. Deep Q-Learning takes these concepts and essentially tansforms them into a mathematical concept that the AI can understand. When we are strategizing about what move to perform at a given time in a task, what we are really doing is pairing the current state to the different actions and determing the value of these pairs. The AI does this exact thing by assigning a 'Q-Value', or Quality value, to various state-action pairs, which is where the Q part of Q-Learning comes from. The developer is able to assign rewards or punishments to various outcomes, which is what's used to make up the AI's Q-value. In the case of Tetris, there would be rewards for something like clearing a line, and a punishment for getting a game over. The magic happens with the following formula:

<img src="https://s3-ap-south-1.amazonaws.com/av-blog-media/wp-content/uploads/2019/04/1_lTVHyzT3d26Bd_znaKaylQ-768x84.png" width="750" alt='Q-Learning Formula'>

Where r(s,a) represents the immediate reward if that state-action pair is executed, and the other term is the potential maximum value of future state-action pairs if the current state-action pair is executed. This second term is modified by Gamma, which is essentially the mathematical representation for how much the AI thinks ahead.

So -- by defining various inputs for the bot to make up a state, over time it is able to learn which state-action pairs will lead to good results and act those out on the environment. [This demo](https://cs.stanford.edu/people/karpathy/convnetjs/demo/rldemo.html), written by the creator of ConvnetJS, is a great representation of this concept.
