// TODO:
// more file types (text)

const {
	clipboard
} = require('electron');
const nativeImage = require('electron').nativeImage;

let canvas;

let maximizedHeight;
let fullscreen = false;

let offsetX = 0;
let offsetY = 0;
let offsetIncrement = 5;
let offsetLimit = 10000;

let sclFactor = 1;
let scaleDelta = 1.02;
let scaleOffsetX;
let scaleOffsetY;


let pics = [];
let raw_pics = [];
let pMouseX;
let pMouseY;
let selectedPic;
let picSelected = false;
let mouseDown;

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	background(51);

	maximizedHeight = height;

	scaleOffsetX = -width / 2;
	scaleOffsetY = -height / 2;

	noFill();

	frameRate(60);

	// pic.x/pic.y is the center of the image
	imageMode(CENTER);

	canvas.drop(gotFile);
}




function draw() {
	background(51);

	// workaround to zoom in on the center
	translate(width / 2, height / 2);

	zoom();
	pan();

	drawPics();


	findPicFromCoords(mouseX, mouseY);

	if (picSelected && mouseDown) {
		let pic = pics[selectedPic];

		let mx = (mouseX + scaleOffsetX) / sclFactor + offsetX;
		let my = (mouseY + scaleOffsetY) / sclFactor + offsetY;

		pic.x += mx - pMouseX;
		pic.y += my - pMouseY;

		pMouseX = mx;
		pMouseY = my;

		drawBorder(pic.x, pic.y, pic.width, pic.height, 229, 69, 69);
	} else if (picSelected) {
		let pic = pics[selectedPic];
		drawBorder(pic.x, pic.y, pic.width, pic.height, 76, 23, 23);
	}

	strokeWeight(1);
	stroke('rgba(204,204,204,0.05)');
	for (let h = -offsetLimit; h < offsetLimit + windowHeight; h += 50) {
		line(-offsetLimit, h, offsetLimit + windowWidth, h);
	}
	for (let w = -offsetLimit; w < offsetLimit + windowWidth; w += 50) {
		line(w, -offsetLimit, w, offsetLimit + windowHeight);
	}
}

function pan() {
	if (keyIsPressed) {
		if (keyIsDown(LEFT_ARROW)) {
			offsetX -= offsetIncrement / sclFactor;
		}
		if (keyIsDown(RIGHT_ARROW)) {
			offsetX += offsetIncrement / sclFactor;
		}
		if (keyIsDown(UP_ARROW)) {
			offsetY -= offsetIncrement / sclFactor;
		}
		if (keyIsDown(DOWN_ARROW)) {
			offsetY += offsetIncrement / sclFactor;
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

	translate(-offsetX, -offsetY);
}

function zoom() {
	scale(sclFactor)
}

function drawBorder(x, y, w, h, r, g, b) {
	push();
	strokeWeight(5);
	stroke(r, g, b);
	beginShape();
	vertex(x - w / 2, y - h / 2);
	vertex(x + w / 2, y - h / 2);
	vertex(x + w / 2, y + h / 2);
	vertex(x - w / 2, y + h / 2);
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

	if (picSelected) {
		pMouseX = (mouseX + scaleOffsetX) / sclFactor + offsetX;
		pMouseY = (mouseY + scaleOffsetY) / sclFactor + offsetY;
	}

	mouseDown = true;

	if (!picSelected) {
		console.log('no pic selected');
	}
}

function mouseReleased() {
	picSelected = false;
	mouseDown = false;
}

function mouseWheel(event) {
	sclFactor *= 1 - event.delta / 250;

	if (sclFactor > 100) {
		sclFactor = 100;
	} else if (sclFactor < 0.1) {
		sclFactor = 0.1;
	}
}

function findPicFromCoords(mx, my) {
	stroke(255);
	strokeWeight(8 / sclFactor);

	let x = (mx + scaleOffsetX) / sclFactor + offsetX;
	let y = (my + scaleOffsetY) / sclFactor + offsetY;

	point(x, y);
	picSelected = false;
	for (let i = pics.length - 1; i >= 0; i--) {
		let pic = pics[i];

		// stroke(43, 12, 156);

		let picx = pic.x;
		let picy = pic.y;
		let picw = pic.width;
		let pich = pic.height;

		// point(picx - picw / 2, picy - pich / 2);
		// point(picx + picw / 2, picy + pich / 2);

		if (((x >= picx - picw / 2) && (y >= picy - pich / 2)) && ((x <= picx + picw / 2) && (y <= picy + pich / 2))) {
			// prevent bug of selectedPic changing while mouse pressed
			if (!(mouseIsPressed && selectedPic != i)) {
				pics.push(pics.splice(i, 1)[0]);
				raw_pics.push(raw_pics.splice(i, 1)[0]);
				selectedPic = pics.length - 1;
				picSelected = true;
				break;
			}

			// stroke(255);
			// point(pic.x, pic.y);
		}
	}
}

function windowResized() {
	background(51);

	// remove title-bar margin when in fullscreen mode
	if (!fullscreen && windowHeight > maximizedHeight) {
		canvas.style('margin-top', '0px');
		fullscreen = true;
	} else if (fullscreen && windowHeight <= maximizedHeight) {
		canvas.style('margin-top', '23px');
		fullscreen = false;
	}
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
		console.log(file);
		let img = createImg(file.data).hide();

		img.x = (mouseX + scaleOffsetX) / sclFactor + offsetX;
		img.y = (mouseY + scaleOffsetY) / sclFactor + offsetY;

		pics.push(img);
		raw_pics.push(file)
	} else {
		console.log(`${file.type} not an image file!\nContents: ${file.data}`);
	}
}