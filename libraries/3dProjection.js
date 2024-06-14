	function x3_coord(i,j,k){
		return cos(b)*cos(c)*i-cos(b)*sin(c)*j+sin(b)*k
	}
	function y3_coord(i,j,k){
		return (sin(b)*sin(a)*cos(c)+cos(a)*sin(c))*i + (cos(a)*cos(c)-sin(b)*sin(a)*sin(c))*j - cos(b)*sin(a)*k
	}

	function z3_coord(i,j,k){
		return (sin(a)*sin(c)-sin(b)*cos(a)*cos(c))*i + (sin(b)*cos(a)*sin(c)+sin(a)*cos(c))*j + cos(b)*cos(a)*k
	}

	function projectX(i,j,k){
	  if (CAM/(CAM+z3_coord(i,j,k))>=0){
		return CAM*x3_coord(i,j,k)/(CAM+z3_coord(i,j,k));
	  } else {
		return null;
	  }
	}

	function projectY(i,j,k){
	  if (CAM/(CAM+z3_coord(i,j,k))>=0){
		return CAM*y3_coord(i,j,k)/(CAM+z3_coord(i,j,k));
	  } else {
		return null;
	  }
	}