// Offset of each block
var offset = 15;

// Basic settings
var objectNumber = 6;
var objectWidth = 128;

var preClick;
var clickCount = 0;

// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.CanvasRenderer(window.innerWidth, window.innerHeight)
renderer.backgroundColor = 0xfaf8ef;

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.body.appendChild(renderer.view);

// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container();

var graphics = new PIXI.Graphics();


var totalWidth = objectNumber*objectWidth+(objectNumber+1)*offset;

// Position of the inside window
var startX = (window.innerWidth-totalWidth)/2;
var startY = (window.innerHeight-totalWidth)/2;

// Initial position
graphics.moveTo(startX, startY);

// Draw background round rect
graphics.beginFill(0xbbada0);
graphics.drawRoundedRect(startX, startY, totalWidth, totalWidth, 10);
graphics.endFill();

// Draw tiny round rect block
graphics.beginFill(0xcdc1b4);
for (var i = 0; i < objectNumber; i++) {
    for (var j = 0; j < objectNumber; j++) {
        graphics.drawRoundedRect(startX+offset*(j+1)+objectWidth*j, startY+offset*(i+1)+objectWidth*i, objectWidth, objectWidth, 10);   
    };
};
graphics.endFill();

var resourcePath = "imgs/";
// Prelaod the asset
var textureArray = [['material1', resourcePath+'g1.png'], ['material2', resourcePath+'g2.png'], ['material3', resourcePath+'g3.png'], ['material4', resourcePath+'g4.png']];


for (var i = 0; i < textureArray.length; i++) {
    PIXI.loader.add(textureArray[i][0], textureArray[i][1]);
};

var clickObjs = [];
var valObjs = [];

var rtnValue = generateTexture(objectNumber, textureArray);
clickObjs = rtnValue.clkObj;
valObjs = rtnValue.clkcValue;

var explosionTexture = [];

var explosionArray = [];

var totalScore = 0;
var scoreLabel = new PIXI.Text('Score',{font : '20px Arial', fill : 0xFFFFFF, align : 'center'});
var scoreTextLabel = new PIXI.Text(totalScore, {font : '25px Arial', fill : 0xFFFFFF, align : 'center'});

var stopFlag = false;

PIXI.loader.load(function (loader, resources) {

    // for(var i = 1; i <= 9; i++ ){
    //     PIXI.loader.add('explosion1_000'+i, resourcePath+'explosion1_000'+i+'.png');
    // }
    // for(var i = 10; i <= 90; i++){
    //     PIXI.loader.add('explosion1_00'+i, resourcePath+'explosion1_00'+i+'.png');
    // }


    for(var i = 1; i <= 9; i++){
        var texture = PIXI.Texture.fromImage(resourcePath+'explosion1_000'+i+'.png');
        explosionTexture.push(texture);
    }

    for(var i = 10; i <= 90; i++){
        var texture = PIXI.Texture.fromImage(resourcePath+'explosion1_00'+i+'.png');
        explosionTexture.push(texture);
    }

    for (var i = 0; i < objectNumber*objectNumber ; i++){
        var tempexplosion = new PIXI.extras.MovieClip(explosionTexture);
        tempexplosion.loop = false;
        explosionArray.push(tempexplosion);
    }

    for(var i = 0; i < objectNumber; i++) {
        for(var j = 0; j < objectNumber; j++){
            clickObjs[i*objectNumber+j].scale.x = 1;
            clickObjs[i*objectNumber+j].scale.y = 1;
            clickObjs[i*objectNumber+j].position.x = startX+offset*(j+1)+objectWidth*j;
            clickObjs[i*objectNumber+j].position.y = startY+offset*(i+1)+objectWidth*i;
            clickObjs[i*objectNumber+j].interactive = true;
            //mousedown
            clickObjs[i*objectNumber+j].on('mousedown', function(){
                pairwiseCheck(this);
            }).on('tap', function(){
                pairwiseCheck(this);
            });
        }
    }

    scoreLabel.position.x = (startX+offset*(objectNumber+1)+objectNumber*objectWidth-objectWidth/2)-scoreLabel.width/2;
    scoreLabel.position.y = startY/2-(scoreLabel.height+scoreTextLabel.height)*1.3/2;

    scoreTextLabel.position.x = (startX+offset*(objectNumber+1)+objectNumber*objectWidth-objectWidth/2)-scoreTextLabel.width/2;
    scoreTextLabel.position.y = startY/2;

    graphics.beginFill(0xcdc1b4);
    graphics.drawRoundedRect(startX+offset*(objectNumber+1)+objectNumber*objectWidth-objectWidth, startY/2-(scoreLabel.height+scoreTextLabel.height)*1.3/2, objectWidth, (startY*2/3 > scoreLabel.height+scoreTextLabel.height)?1.3*(scoreLabel.height+scoreTextLabel.height):(startY*2/3), 10)

    graphics.endFill();

    stage.addChild(graphics);

    stage.addChild(scoreLabel);

    stage.addChild(scoreTextLabel);
    for (var i = 0; i < clickObjs.length; i++) {
        stage.addChild(clickObjs[i]);
    }

    renderer.render(stage);
});


// Check each pairwise
function pairwiseCheck(currentClick){

    clickCount++;

    if(clickCount ==1 || clickCount == 2){
        drawHighLighter(currentClick);
    }

    if(clickCount == 1){
        preClick = currentClick;
    }else if(clickCount == 2){

        var nxtIndex = clickObjs.indexOf(currentClick);
        var preIndex = clickObjs.indexOf(preClick);

        if(valObjs[preIndex] == valObjs[nxtIndex] && valObjs[preIndex] > 0 && valObjs[nxtIndex] > 0 && preIndex!=nxtIndex){
            var preClk_X = clickObjs[preIndex].position.x;
            var preClk_Y = clickObjs[preIndex].position.y;
            var nxtClk_X = clickObjs[nxtIndex].position.x;
            var nxtClk_Y = clickObjs[nxtIndex].position.y;

            stopFlag = false;

            explosionEffect(preClk_X+objectWidth/2, preClk_Y+objectWidth/2, preIndex);

            explosionEffect(nxtClk_X+objectWidth/2, nxtClk_Y+objectWidth/2, nxtIndex);

            valObjs[preIndex] = -1;
            valObjs[nxtIndex] = -1;

            setTimeout(function(){
                redrawContainer();
                stopFlag = true;
            },800);

            totalScore += 36;
        }else{
            redrawContainer(); 
        }
        if(totalScore==36){
            menuShow();
        }
        clickCount = 0;
    } 
}

// Show the control menu
function menuShow(){
    $(document).ready(function(){
        $('#myModal').modal('show');
    }); 
}

// Draw the select block
function drawHighLighter(currentClick){
    var coverGraphics = new PIXI.Graphics();

    var cIndex = clickObjs.indexOf(currentClick);

    coverGraphics.beginFill(0xf2b179);
    coverGraphics.drawRoundedRect(clickObjs[cIndex].position.x, clickObjs[cIndex].position.y, objectWidth, objectWidth, 10); 
    coverGraphics.endFill();
    stage.addChild(coverGraphics);
    stage.addChild(clickObjs[cIndex]);
    renderer.render(stage);
}

// Redraw the whole canvas
function redrawContainer(){

        var coverGraphics = new PIXI.Graphics(); 

        stage = new PIXI.Container();
        graphics.beginFill(0xbbada0);
        graphics.drawRoundedRect(startX, startY, totalWidth, totalWidth, 10);
        graphics.endFill();

        graphics.beginFill(0xcdc1b4);
        graphics.drawRoundedRect(startX+offset*(objectNumber+1)+objectNumber*objectWidth-objectWidth, startY/2-(scoreLabel.height+scoreTextLabel.height)*1.3/2, objectWidth, (startY*2/3 > scoreLabel.height+scoreTextLabel.height)?1.3*(scoreLabel.height+scoreTextLabel.height):(startY*2/3), 10)

        graphics.endFill();

        stage.addChild(graphics);

        for (var i = 0; i < clickObjs.length; i++) {
            if(valObjs[i]!=-1){
                stage.addChild(clickObjs[i]);
            }
        }

        graphics.beginFill(0xcdc1b4);
        for (var i = 0; i < objectNumber; i++) {
            for (var j = 0; j < objectNumber; j++) {
                if(valObjs[i*objectNumber+j]!=-1)
                    graphics.drawRoundedRect(startX+offset*(j+1)+objectWidth*j, startY+offset*(i+1)+objectWidth*i, objectWidth, objectWidth, 10);   
            };
        };
        graphics.endFill();

        scoreTextLabel.text = totalScore;

        scoreLabel.position.x = (startX+offset*(objectNumber+1)+objectNumber*objectWidth-objectWidth/2)-scoreLabel.width/2;
        scoreLabel.position.y = startY/2-(scoreLabel.height+scoreTextLabel.height)*1.3/2;

        scoreTextLabel.position.x = (startX+offset*(objectNumber+1)+objectNumber*objectWidth-objectWidth/2)-scoreTextLabel.width/2;
        scoreTextLabel.position.y = startY/2;

        stage.addChild(scoreLabel);
        stage.addChild(scoreTextLabel);
        stage.addChild(coverGraphics);

        renderer.render(stage);

}

// Animation effect
function explosionEffect(expX, expY, expIndex){

    explosionArray[expIndex].position.x = expX;
    explosionArray[expIndex].position.y = expY;
    explosionArray[expIndex].anchor.x = 0.5;
    explosionArray[expIndex].anchor.y = 0.5;

    explosionArray[expIndex].scale.x = 6;
    explosionArray[expIndex].scale.y = 6;
    explosionArray[expIndex].loop = false;

    explosionArray[expIndex].rotation = Math.random() * Math.PI;

    explosionArray[expIndex].gotoAndPlay(0);
    
    stage.addChild(explosionArray[expIndex]);

    requestAnimationFrame(animate);
    
    setTimeout(800);
}

// Generate all the texture
function generateTexture(objectNumber, textureArray){

    var clickObjs = [];
    var valueArray = [];
    var sumTexture = [];

    do{
        clickObjs = [];
        sumTexture = [];
        valueArray = [];

        for (var i = 0; i < textureArray.length; i++) {
            sumTexture.push(0);
        }

        for (var i = 0; i < objectNumber*objectNumber; i++) {
            var objIndex = Math.floor(Math.random()*textureArray.length+1);
            sumTexture[objIndex-1]++;
            var tempTexture = new PIXI.Sprite.fromImage(textureArray[objIndex-1][1]);
            valueArray.push(objIndex);
            clickObjs.push(tempTexture);
        }
    }while(!validateArray(sumTexture));

    return {
        clkObj: clickObjs,
        clkcValue: valueArray
    };
}

// Validate the pairwise
function validateArray(sumTexture){
    for(var i = 0; i < sumTexture.length; i++){
        if(sumTexture[i]%2!=0)
            return false;
    }
    return true;
}

// Animate control
function animate() {

    if(!stopFlag){
        renderer.render(stage);
        requestAnimationFrame(animate);        
    }else{
        return true;
    }
    return false;
}