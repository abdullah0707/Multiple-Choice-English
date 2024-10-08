var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;

var soundsArr;
var video, video_div;
var clickSd, quizSd, rightFbSd, wrongFbSd

var timeCounter = 40;

ansTrue = 3;
// countQuestion= 1;

// answerName = '';

// questionsScore = [ 'a1', 'a2', 'a3', 'a4' , 'a5'];

var numOfAns = 4;
// currentQ = 5,
correctAns = false;
soundMuted = false;


var score = 0,
   prevAns = null;

var attempts = 0,
   maxAttempts = 3;

var counter = 0;

var overOut = [];
var retryV = false;
var l = console.log;

var isFirefox = typeof InstallTrigger !== 'undefined';
/*========Start=======*/

var correctAnswersCountV = 0;

/*========End=======*/

function init() {
   canvas = document.getElementById("canvas");
   anim_container = document.getElementById("animation_container");
   dom_overlay_container = document.getElementById("dom_overlay_container");
   var comp = AdobeAn.getComposition("82F6770C1313B34385EFC2E3BB3F32CB");
   var lib = comp.getLibrary();
   var loader = new createjs.LoadQueue(false);
   loader.addEventListener("fileload", function (evt) { handleFileLoad(evt, comp) });
   loader.addEventListener("complete", function (evt) { handleComplete(evt, comp) });
   var lib = comp.getLibrary();
   loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
   var images = comp.getImages();
   if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }
}
function handleComplete(evt, comp) {
   //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
   var lib = comp.getLibrary();
   var ss = comp.getSpriteSheet();
   var queue = evt.currentTarget;
   var ssMetadata = lib.ssMetadata;
   for (i = 0; i < ssMetadata.length; i++) {
      ss[ssMetadata[i].name] = new createjs.SpriteSheet({
         "images": [queue.getResult(ssMetadata[i].name)],
         "frames": ssMetadata[i].frames
      })
   }
   exportRoot = new lib.ACT443();

   stage = new lib.Stage(canvas);
   fnStartAnimation = function () {
      stage.addChild(exportRoot);
      stage.enableMouseOver(10);
      createjs.Touch.enable(stage);
      stage.mouseMoveOutside = true;
      stage.update();
      createjs.Ticker.setFPS(lib.properties.fps);
      createjs.Ticker.addEventListener("tick", stage);
      prepareTheStage();
   }
   //Code to support hidpi screens and responsive scaling.
   function makeResponsive(isResp, respDim, isScale, scaleType) {
      var lastW, lastH, lastS = 1;
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      function resizeCanvas() {
         var w = lib.properties.width,
            h = lib.properties.height;
         var iw = window.innerWidth,
            ih = window.innerHeight;
         var pRatio = window.devicePixelRatio || 1,
            xRatio = iw / w,
            yRatio = ih / h,
            sRatio = 1;
         if (isResp) {
            if ((respDim == 'width' && lastW == iw) || (respDim == 'height' && lastH == ih)) {
               sRatio = lastS;
            } else if (!isScale) {
               if (iw < w || ih < h)
                  sRatio = Math.min(xRatio, yRatio);
            } else if (scaleType == 1) {
               sRatio = Math.min(xRatio, yRatio);
            } else if (scaleType == 2) {
               sRatio = Math.max(xRatio, yRatio);
            }
         }
         canvas.width = w * pRatio * sRatio;
         canvas.height = h * pRatio * sRatio;
         canvas.style.width = dom_overlay_container.style.width = anim_container.style.width = w * sRatio + 'px';
         canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = h * sRatio + 'px';
         stage.scaleX = pRatio * sRatio;
         stage.scaleY = pRatio * sRatio;
         lastW = iw;
         lastH = ih;
         lastS = sRatio;
         stage.tickOnUpdate = false;
         stage.update();
         stage.tickOnUpdate = true;
         canvas.style.display = "block";
         anim_container.style.display = "block";
      }
   }
   makeResponsive(true, 'both', true, 1);
   AdobeAn.compositionLoaded(lib.properties.id);
   fnStartAnimation();
   l("helloooo1")
}

function playFn() {
   clickSd.play();
   stopAllSounds();
   exportRoot.play();
}

function prepareTheStage() {
   overOut = [exportRoot["showAnsBtn"], exportRoot["retryBtn"], exportRoot["confirmBtn"]];

   for (var i = 0; i < overOut.length; i++) {
      l(i);
      overOut[i].cursor = "pointer";
      overOut[i].on("mouseover", over);
      overOut[i].on("mouseout", out);
   }
   exportRoot["soundBtn"].cursor = "pointer";

   clickSd = new Howl({
      src: ['sounds/click.mp3']
   });

   rightFbSd = new Howl({
      src: ['sounds/rightFbSd.mp3']
   });
   wrongFbSd = new Howl({
      src: ['sounds/wrongFbSd.mp3']
   });

   quizSd = new Howl({
      src: ['sounds/quizSd.mp3']
   });


   soundsArr = [clickSd, quizSd, rightFbSd, wrongFbSd];
   stopAllSounds();

   for (var i = 1; i <= numOfAns; i++) {
      exportRoot["a" + i].id = i;
      exportRoot["a" + i].placeNum = null;
   }




   exportRoot["confirmBtn"].addEventListener("click", confirmFN);
   exportRoot["retryBtn"].addEventListener("click", retryFN);
   exportRoot["showAnsBtn"].addEventListener("click", function () {
      stopAllSounds();
      hideFB();
      exportRoot["showAnsBtn"].alpha = 0;
      exportRoot["answers"].alpha = 1;
      exportRoot["answers"].gotoAndPlay(0);
   });
   exportRoot["soundBtn"].addEventListener("click", function () {
      exportRoot["soundBtn"].gotoAndStop(1);
      if (!soundMuted) {
         quizSd.play();
         quizSd.on('end', function () {
            exportRoot["soundBtn"].gotoAndStop(0);
         });
         soundMuted = true;
      } else {
         stopAllSounds();
         soundMuted = false;
         exportRoot["soundBtn"].gotoAndStop(0);
      }
   });

   hideFB();
}


function hideFB() {
   exportRoot["wrongFB"].alpha = 0;
   exportRoot["wrongFB"].playV = false;
   exportRoot["rightFB"].alpha = 0;
   exportRoot["rightFB"].playV = false;
   exportRoot["answers"].alpha = 0;
   exportRoot["showAnsBtn"].alpha = 0;
   exportRoot["showAnsBtn"].gotoAndStop(0);
   exportRoot["confirmBtn"].alpha = 0;
   exportRoot["confirmBtn"].gotoAndStop(0);
   exportRoot["retryBtn"].alpha = 0;
   exportRoot["retryBtn"].gotoAndStop(0);
}

function stopAllSounds() {
   for (var s = 0; s < soundsArr.length; s++) {
      soundsArr[s].stop();
   }
}

function activateButtons() {
   for (var i = 1; i <= numOfAns; i++) {
      exportRoot["a" + i].gotoAndStop(0);
      exportRoot["a" + i].clicked = true;
      exportRoot["a" + i].cursor = "pointer";
      exportRoot["a" + i].addEventListener("click", chooseAnsFn);
      exportRoot["a" + i].addEventListener("mouseover", over);
      exportRoot["a" + i].addEventListener("mouseout", out);
      exportRoot["a" + i].placeNum = null;
   }
   exportRoot["confirmBtn"].alpha = 0;
}

function deactivateButtons() {

   for (var i = 1; i <= numOfAns; i++) {
      exportRoot["a" + i].gotoAndStop(0);
      exportRoot["a" + i].cursor = "auto";
      exportRoot["a" + i].clicked = false;
      exportRoot["a" + i].removeEventListener("click", chooseAnsFn);
      exportRoot["a" + i].removeEventListener("mouseover", over);
      exportRoot["a" + i].removeEventListener("mouseout", out);
      exportRoot["a" + i].placeNum = null;
   }
   exportRoot["confirmBtn"].alpha = 0;
}

function chooseAnsFn(e2) {
   stopAllSounds();
   clickSd.play();

   for (var i = 1; i <= numOfAns; i++) {

      e2.currentTarget.gotoAndStop(2);
      e2.currentTarget.cursor = "auto";
      e2.currentTarget.removeEventListener("click", chooseAnsFn);
      e2.currentTarget.removeEventListener("mouseover", over);
      e2.currentTarget.removeEventListener("mouseout", out);
      e2.currentTarget.placeNum = i;
      break;
   }
   exportRoot["confirmBtn"].alpha = 1;

}


function confirmFN() {
   hideFB();
   stopAllSounds();
   clickSd.play();

   for (var i = 1; i <= numOfAns; i++) {
      if (exportRoot["a" + i].placeNum !== null && i <= ansTrue) {
         score++;
      } else if (i > ansTrue && exportRoot["a" + i].placeNum !== null) {
         --score;
      }
   }
   // for (var i = 1; i <= numOfAns; i++) {
   //    if (exportRoot["a" + i].placeNum !== null && i <= ansTrue) {
   //       score++;
   //    }
   // }
   exportRoot["soundBtn"].alpha = 0;
   console.log(score);
   if (score == ansTrue) {
      /*========Start=======*/
      correctAnswersCountV++;
      /*========End=======*/
      exportRoot["rightFB"].playV = true;
      exportRoot["rightFB"].alpha = 1;
      exportRoot["rightFB"].gotoAndPlay(0);
      exportRoot["confirmBtn"].alpha = 0;
      showBtns();
      /*========Start=======*/
      finalSendMessageFn();
      /*========End=======*/
   } else {
      // attempts++;
      // if (attempts == maxAttempts)
      // {
      exportRoot["wrongFB"].playV = true;
      exportRoot["wrongFB"].alpha = 1;
      exportRoot["wrongFB"].gotoAndPlay(0);
      exportRoot["confirmBtn"].alpha = 0;
      exportRoot["retryBtn"].alpha = 0;
      /*========Start=======*/
      finalSendMessageFn();
      /*========End=======*/
   }

   deactivateButtons();
}


function over(e) {
   e.currentTarget.gotoAndStop(1);
}
function over2(e) {
   e.currentTarget.gotoAndStop(2);
}

function out(e) {
   e.currentTarget.gotoAndStop(0);
}

function retryFN() {
   stopAllSounds();
   soundMuted = false;
   exportRoot["soundBtn"].gotoAndStop(0);
   exportRoot["soundBtn"].alpha = 1;
   clickSd.play();
   counter = 0;
   score = 0;
   hideFB();
   retryV = true;
   activateButtons();
   retryV = false;
}

function showBtns() {
   if (score == ansTrue) {
      exportRoot["showAnsBtn"].alpha = 1;
   } else {
      exportRoot["showAnsBtn"].alpha = 1;
      exportRoot["retryBtn"].alpha = 1;
   }
}

/*========Start=======*/

function sendMessageToParent(message) {
   window.parent.postMessage(message, '*');
}

function startTimeFn() {
   sendMessageToParent({
      action: 'start',
      data: {
         startDateTime: (new Date()).toISOString()
      }
   });
}

function finalSendMessageFn() {
   sendMessageToParent({
      action: 'end',
      data: {
         endDateTime: (new Date()).toISOString(),
         retryTimes: (attempts + correctAnswersCountV),
         wrongAnswersCount: attempts,
         correctAnswersCount: correctAnswersCountV
      }
   });
}

/*========End=======*/