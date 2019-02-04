// TODO:
// zooming
// more file types (text)

const { clipboard } = require('electron');
const nativeImage = require('electron').nativeImage;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  background(51);
  noFill();

  frameRate(60);

  // pic.x/pic.y is the center of the image
  imageMode(CENTER);

  canvas.drop(gotFile);
}

let offsetX = 0;
let offsetY = 0;
let offsetIncrement = 5;
let offsetLimit = 10000;

let pics = [];
let raw_pics = [];
let pmx;
let pmy;
let ppicx;
let ppicy;
let selectedPic;
let picSelected = false;

function draw() {
  background(51);

  pan();

  findPicFromCoords(mouseX, mouseY);

  drawPics();

  if (picSelected && mouseIsPressed) {
    let pic = pics[selectedPic];
    pic.x = ppicx + (mouseX - pmx);
    pic.y = ppicy + (mouseY - pmy);

    drawBorder(pic.x, pic.y, pic.width, pic.height, 229, 69, 69);
  } else if (picSelected) {
    let pic = pics[selectedPic];
    drawBorder(pic.x, pic.y, pic.width, pic.height, 76, 23, 23);
  }

  stroke('rgba(204,204,204,0.05)');
  for (let h = -offsetLimit; h < offsetLimit+windowHeight; h+= 50) {
    line(-offsetLimit, h, offsetLimit+windowWidth, h);
  }
  for (let w = -offsetLimit; w < offsetLimit+windowWidth; w+= 50) {
    line(w, -offsetLimit, w, offsetLimit+windowHeight);
  }
}

function pan () {
  if (keyIsPressed) {
    if (keyIsDown(LEFT_ARROW)) {
      offsetX -= offsetIncrement;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      offsetX += offsetIncrement;
    }
    if (keyIsDown(UP_ARROW)) {
      offsetY -= offsetIncrement;
    }
    if (keyIsDown(DOWN_ARROW)) {
      offsetY += offsetIncrement;
    }
  }

  if (offsetX > offsetLimit) {
    offsetX = offsetLimit;
  }
  if (offsetX < -offsetLimit) {
    offsetX = -offsetLimit;
  }
  if (offsetY > offsetLimit) {
    offsetY = offsetLimit;
  }
  if (offsetY < -offsetLimit) {
    offsetY = -offsetLimit;
  }

  //console.log(offsetX, offsetY);

  translate(-offsetX, -offsetY);
}

function drawBorder(x, y, w, h, r, g, b) {
  push();
  strokeWeight(5);
  stroke(r, g, b);
  beginShape();
  vertex(x-w/2, y-h/2);
  vertex(x+w/2, y-h/2);
  vertex(x+w/2, y+h/2);
  vertex(x-w/2, y+h/2);
  endShape(CLOSE);
  pop();
}

function keyPressed() {
  if (picSelected) {
    if (keyCode == BACKSPACE || keyCode == DELETE) {
      picSelected = false;
      pics.splice(selectedPic, 1);
      raw_pics.splice(selectedPic, 1);
    }
  }
}

function doubleClicked() {
  mousePressed();
  if (picSelected) {
    let rawPic = raw_pics[selectedPic];
    let image = nativeImage.createFromPath(rawPic.file.path);
    clipboard.writeImage(image);
  }
}

function mousePressed() {
  findPicFromCoords(mouseX, mouseY);
  pmx = mouseX;
  pmy = mouseY;
  try {
    ppicx = pics[selectedPic].x;
    ppicy = pics[selectedPic].y;
  } catch {
    //console.log('No picture selected');
  }

  if (!picSelected) {
    console.log('no pic selected');
  }
}

function mouseReleased() {
    picSelected = false;
}

function findPicFromCoords(mx, my) {
  picSelected = false;
  for (let i = pics.length - 1; i >= 0; i--) {
    let pic = pics[i];

    let picx = pic.x - offsetX;
    let picy = pic.y - offsetY;

    //if (((mx >= pic.x) && (my >= pic.y)) && ((mx <= pic.x + pic.width) && (my <= pic.y + pic.height))) {
    if (((mx>=picx-pic.width/2) && (my>=picy-pic.height/2))&&((mx<=picx+pic.width/2) && (my<=picy+pic.height/2))) {
      // prevent bug of selectedPic changing while mouse pressed
      if (!(mouseIsPressed && selectedPic != i)) {
        pics.push(pics.splice(i, 1)[0]);
        raw_pics.push(raw_pics.splice(i, 1)[0]);
        selectedPic = pics.length-1;
        picSelected = true;
        break;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(51);
}

function resizePicture(img) {
  let w = img.width;
  let h = img.height;

  const maxW = windowWidth / 2;
  const maxH = windowHeight;

  const wFactor = w / maxW;
  const hFactor = h / maxH;

  if (wFactor > 1) {
    w = Math.round(img.width / wFactor);
    h = Math.round(img.height / wFactor);
  }

  if (hFactor > 1) {
    w = Math.round(img.width / hFactor);
    h = Math.round(img.height / hFactor);
  }

  return {
    w: w,
    h: h
  }
}

function drawPics() {
  for (let i = 0; i < pics.length; i++) {
    let pic = pics[i];
    let p = resizePicture(pic);
    pic.width = p.w;
    pic.height = p.h;

    image(pic, pic.x, pic.y, pic.width, pic.height);
  }
}

function gotFile(file) {
  if (file.type === 'image') {
    // Create an image DOM element but don't show it
    let img = createImg(file.data).hide();

    img.x = mouseX;
    img.y = mouseY;

    pics.push(img);
    raw_pics.push(file)
  } else {
    console.log(`${file.type} not an image file!\nContents: ${file.data}`);
  }
}
