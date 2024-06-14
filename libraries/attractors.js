function cliff(x,y,a,b,c,d){
	return [sin(a*y)+c*cos(a*x),sin(b*x) + d*cos(b*y)]
}
function Svensson(x, y, a, b, c, d){
	return [d*sin(a*x)-sin(b*y),c*cos(a*x)+cos(b*y)]
}
function Hopalong1(x, y, a, b, c){
	return [y - sqrt(abs(b * x - c)) * Math.sign(x),a - x]
}
function Hopalong2(x, y, a, b, c){
	return [y - 1.0 - sqrt(abs(b * x - 1.0 - c)) * Math.sign(x - 1.0),a - x - 1.0]
}
function G(x, mu){
	return mu * x + 2 * (1 - mu) * x*x / (1.0 + x*x)
}

function Gumowski_Mira(x, y, a, b, mu){
	let xn = y + a*(1 - b*y*y)*y  +  G(x, mu)
	let yn = -x + G(xn, mu)
	return [xn, yn]
}

function Symmetric_Icon(x, y, a, b, g, om, l, d){
	let zzbar = x*x + y*y
	let p = a*zzbar + l
	let zreal = x
	let zimag = y
	
	for (let r = 1; r<d;r++){
		let za = zreal * x - zimag * y
		let zb =  zimag * x + zreal * y
		zreal = za
		zimag = zb
	}
	
	let zn = x*zreal - y*zimag
	p = p + b*zn
	
	return [p*x + g*zreal - om*y,p*y - g*zimag + om*x]
}

function trajectory(n,x0,y0,a,b,c,d,t,variety){
	let x = [] 
	let y = []
	x[0] = x0
	y[0] = y0
	for (let i = 0;i<n;i++){
		switch(variety){
			case "Cliff":
				fxy = cliff(x[i],y[i],1.1,-1.32-0.5*t,-1.03,1.54)
				break;
			case "Svensson":
				fxy = Svensson(x[i],y[i],1.4,1.56,1.4-0.6*t,-6.56)
				break;
			case "Hopalong1":
				fxy = Hopalong1(x[i],y[i],2,1+t,0)
				break;
			case "Hopalong2":
				fxy = Hopalong2(x[i],y[i],9.7-0.5*t,1.6,7.9)
				break;
			case "Gumowski_Mira":
				fxy = Gumowski_Mira(x[i],y[i],0.008+0.5*t,0.05,-0.496)
				break;
			case "Symmetric_Icon":
				fxy = Symmetric_Icon(x[i],y[i],-2.5,-0.1,0.9,-0.15,2.39-0.3*t,8)
				break;
			default:
				fxy = cliff(x[i],y[i],1.1,-1.32+0.07*t+0.03,-1.03,1.54)
		}
		
		x[i+1] = fxy[0]
		y[i+1] = fxy[1]
	}
	return [x,y]
}