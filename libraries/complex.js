	function comMul(z1,z2){
		return [z1[0]*z2[0]-z1[1]*z2[1],z1[0]*z2[1]+z1[1]*z2[0]]
	}	
	
	function comDiv(z1){
		return [z1[0]/comMag2(z1),-z1[1]/comMag2(z1)];
	}
		
	function comMag2(z1){
		return z1[0]*z1[0]+z1[1]*z1[1]
	}
	
	function comExp(z1){
		return [Math.exp(z1[0])*cos(z1[1]),Math.exp(z1[0])*sin(z1[1])]
	}
	function comPow(z1,p){
		let powMag = Math.pow(comMag2(z1),p/2);
		let expMag = comExp([0,p*atan2(z1[1],z1[0])]);
		return [powMag*expMag[0],powMag*expMag[1]]
	}
	function comSin(z1){
		let sin1 = comMul(comExp([0-z1[1],z1[0]]),[0,-0.5]);
		let sin2 = comMul(comExp([z1[1],0-z1[0]]),[0,-0.5]);
		return [sin1[0]-sin2[0],sin1[1]-sin2[1]]
	}
	function comCos(z1){
		let cos1 = comExp([-z1[1],z1[0]]);
		let cos2 = comExp([z1[1],-z1[0]]);
		return [0.5*(cos1[0]+cos2[0]),0.5*(cos1[1]+cos2[1])]
	}
	
	function conjSin(z1){
		let sin1 = comMul(comExp([0-z1[1],z1[0]]),[0,0.5]);
		let sin2 = comMul(comExp([z1[1],0-z1[0]]),[0,0.5]);
		return [sin1[0]-sin2[0],sin1[1]-sin2[1]]
	}
	
	function comSinh(z1){
		let sh1 = comExp([z1[0],z1[1]]);
		let sh2 = comExp([-z1[0],-z1[1]]);
		return [0.5*(sh1[0]-sh2[0]),0.5*(sh1[1]-sh2[1])]
	}
	
	function comCosh(z1){
		let ch1 = comExp([z1[0],z1[1]]);
		let ch2 = comExp([-z1[0],-z1[1]]);
		return [0.5*(ch1[0]+ch2[0]),0.5*(ch1[1]+ch2[1])]
	}
	
	function conjDiv(z1){
		return [z1[0]/comMag2(z1),z1[1]/comMag2(z1)];
	}
	
	function conjTan(z1){
		return conjDiv(conjSin(z1),comCos(z1))
	}