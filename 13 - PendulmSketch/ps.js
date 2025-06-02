import { RK4 } from "../libraries/rk4-solver.js";

const canvas = document.getElementById("glcanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const CONSTANT = 332.5;

let g = 9.8
let l1 = CONSTANT*(4/9)
let l2 = CONSTANT*(4/9)
let m1 = 1
let m2 = 1

let max_frames = 720;

function f(t,y){
	let theta1 = y[0]
	let theta2 = y[1]
	let w1 = y[2]
	let w2 = y[3]
	let delta_theta = theta1-theta2

	let f0 = w1
	let f1 = w2
	let f2 = (-g*(2*m1+m2)*Math.sin(theta1)-m2*g*Math.sin(theta1-2*theta2)-2*Math.sin(delta_theta)*m2*(w2*w2*l2+w1*w1*l1*Math.cos(delta_theta)))/(l1*(2*m1+m2-m2*Math.cos(2*theta1-2*theta2)))
	let f3 = (2*Math.sin(theta1-theta2)*(w1*w1*l1*(m1+m2)+g*(m1+m2)*Math.cos(theta1)+w2*w2*l2*m2*Math.cos(delta_theta)))/(l1*(2*m1+m2-m2*Math.cos(2*theta1-2*theta2)))
	
	return [f0,f1,f2,f3]
}

function affine(x,a,b){
	return a*x + b;
}

const h = 0.005;
let y0 = [1.57+3.14*Math.random(),6.28*Math.random(),0,0]
let y = y0;
let t = 0

let linesPerFrame = 30.0;

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height);
let startTime = new Date().getTime();

let framesDrawn = 0.0;
let waiting = false
let waitFrames = 0.0;
let maxWaitFrames = 120.0;

let fadeImage;

function animate() {

	let endTime = new Date().getTime();
	let delayMilliseconds = (endTime - startTime)/1000.0;
		
	if (delayMilliseconds > 1.0/90.0){ //THROTTLE FRAMERATE
		startTime = endTime;
		//ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (framesDrawn > max_frames){
			waiting = true;
  			fadeImage = new Image();
  			fadeImage.src = canvas.toDataURL();
		}

		if (waiting == true){
			framesDrawn = 0.0;
			waitFrames++;
			ctx.fillStyle = 'black'
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.globalAlpha = 1.0-waitFrames/maxWaitFrames;
			ctx.drawImage(fadeImage, 0, 0);
			ctx.globalAlpha = 1.0;
			
			if (waitFrames > maxWaitFrames){
				waiting = false;
				waitFrames = 0.0;
				y0 = [1.57+3.14*Math.random(),6.28*Math.random(),0,0]
				y = y0;
				t = 0;
				l1 = CONSTANT*(4/9);
				l2 = CONSTANT*(4/9);		
				max_frames = 650 + 400*Math.random()	
				ctx.fillStyle = 'black'
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				console.log('start_new')
			}

		} else {
			ctx.filter = 'none';
			for (let i = 0.0;i<linesPerFrame;i++){

				l1 = l1+CONSTANT*(4/9)/(linesPerFrame*max_frames);
				l2 = l2-CONSTANT*(4/9)/(linesPerFrame*max_frames);

				let ynew = RK4(f,t,y,h);
				y = y.map((y,i) => y + h*ynew[i]);

				t = t + h

				const point1_x = l1*Math.sin(y[0])/CONSTANT;
				const point1_y = l1*Math.cos(y[0])/CONSTANT;

				const point2_x = point1_x + l2*Math.sin(y[1])/CONSTANT;
				const point2_y = point1_y + l2*Math.cos(y[1])/CONSTANT;

				const ellipseRadius1 = 0.25*(2.0 + 6.0*Math.abs(y[2]))
				const ellipseRadius2 = 1.25*(2.0 + 6.0*Math.abs(y[3]))

				const rotangle = Math.PI + y[1]
				
				/*
				const x1 = affine(point1_x,centerY,centerX)
				const y1 = affine(point1_y,centerY,centerY)

				ctx.fillStyle = 'white';
				ctx.beginPath();
				ctx.arc(x1, y1, ellipseRadius, 0, Math.PI * 2);
				ctx.fill();
				*/

				const x2 = affine(point2_x,centerY,centerX)
				const y2 = affine(point2_y,centerY,centerY)

				ctx.fillStyle = 'white';
				ctx.beginPath();
				ctx.ellipse(x2, y2, ellipseRadius1,ellipseRadius2,rotangle, 0, Math.PI * 2);
				ctx.fill();
			}
			framesDrawn++;
		}
	}
	requestAnimationFrame(animate);
}

animate();