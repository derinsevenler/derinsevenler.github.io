// http://sjbyrnes.com/fresnel_manual.pdf
// https://en.wikipedia.org/wiki/Transfer-matrix_method_%28optics%29

var fresnel = function (n1, n2, theta1){
	// Fresnel reflection at an interface between materials
	// with refractive indices (from) n1, (to) n2, at angle theta
	// it returns reflectivity coefficients for p and s polarization,
	// and the angle 'theta2' of the propagating wave
	var rdata = {};
	var theta2 = Math.asin( n1/n2 * Math.sin(theta1) ); // snell's law
	rdata.theta2 = theta2;
	rdata.rs = ( n1*Math.cos(theta1) - n2*Math.cos(theta2) )/ ( n1*Math.cos(theta1) + n2*Math.cos(theta2) );
	rdata.rp = ( n2*Math.cos(theta1) - n1*Math.cos(theta2) )/ ( n2*Math.cos(theta1) + n1*Math.cos(theta2) );
	rdata.ts = ( 2*n1*Math.cos(theta1) )/ ( n1*Math.cos(theta1) + n2*Math.cos(theta2) );
	rdata.tp = ( 2*n1*Math.cos(theta1) )/ ( n2*Math.cos(theta1) + n1*Math.cos(theta2) );
	return rdata;
};

var complexMatrixMultiply = function(A,B){
	// dot product of two matrices of complex numbers
	// A and B must be 'Complex' objects.
	
	var len1 = A[0].length;
	var len2 = B.length;
	if (len1!= len2){
		throw "Matrix A and B must have correct dimensions";
	}
	var C = new Array(A.length);
	var count= Complex(0,0);
	for (var n = 0; n<A.length; n++){
		C[n] = new Array(B[0].length);
		for (var m = 0; m<B[0].length; m++){
			for (var k = 0; k<A[0].length; k++){
				count= count['+'](A[n][k]['*'](B[k][m]));
			}
			C[n][m]= count;
			count= Complex(0,0);
		}
	}
	return C;
};

var rayReflectivity = function (nVec, d, lambda, theta0, rp) {
	// calculate the reflectivity of a single wavelength, single angle
	//
	// nVec - vector of all the indices of refraction (minimum 2)
	// nf - refractive index of right medium
	// n - array of refractive indices of films
	// d - array of film thicknesses (in nanometers)
	// lambda - wavelength of incident light (in nanometers)
	// theta0 - incident angle (0 is perpendicular)
	// rp - polarization state, 'p' or 's'
	// **** It just returns 's' right now, either way ****

	// first interface
	var theta = theta0;
	var n1 = nVec[0];
	var n2 = nVec[1];
	var rdata = fresnel(n1,n2,theta);
	var Ms = [[Complex(1/rdata.ts,0), Complex(rdata.rs/rdata.ts,0)], [Complex(rdata.rs/rdata.ts,0), Complex(1/rdata.ts,0)]];

	var deltaMat, Ms_idx, Mp_idx; // propagation matrix
	for (var idx = 1; idx<nVec.length-1; idx++){
		// Calculate M for each interface except the first one
		n1 = nVec[idx];
		n2 = nVec[idx+1];
		theta = rdata.theta2;

		rdata = fresnel(n1,n2,theta);
		delta = 2*Math.PI*d[idx-1]*n1/lambda*Math.cos(theta);

		// update Ms and Mp - pretty complex...
		deltaMat = [ [ Complex.exp(Complex(0,-delta)), Complex(0,0) ], [ Complex(0,0), Complex.exp(Complex(0,delta)) ] ];

		Ms_idx = complexMatrixMultiply(deltaMat, [ [Complex(1/rdata.ts,0), Complex(rdata.rs/rdata.ts,0)], [Complex(rdata.rs/rdata.ts,0), Complex(1/rdata.ts,0)]]);
		Ms = complexMatrixMultiply(Ms, Ms_idx);
	}
	var rtot_s = Ms[1][0]['/'](Ms[0][0]);

	var ttot_s = Complex(1,0)['/'](Ms[0][0]);

	var Rs = Math.pow(rtot_s.mag(),2);
	return Rs;
};

var measureFilm = function(sampleProps, theta, lambdaStart, lambdaEnd){
	// ignoring k (complex coefficient) for now.
	var refIndexData = refractiveIndicesData;
	var nPts = 150;
	var lambda = linspace(lambdaStart,lambdaEnd,nPts);
	var thisMat,matData;
	var d = new Array(sampleProps.films.length);
	var nData = new Array(sampleProps.films.length+2);


	// first material
	thisMat = sampleProps.matI;
	matData = refIndexData[thisMat];
	nData[0] = interpolate(matData.lambda,matData.n, lambda);

	for (var a= 0; a<sampleProps.films.length; a++){
		// each film material...
		d[a] = sampleProps.films[a].d;

		thisMat = sampleProps.films[a].mat;
		matData = refIndexData[thisMat];
		nData[a+1] = interpolate(matData.lambda,matData.n, lambda);
	}
	// last material
	thisMat = sampleProps.matF;
	matData = refIndexData[thisMat];
	nData[sampleProps.films.length+1] = interpolate(matData.lambda, matData.n, lambda);



	var R = new Array(lambda.length);
	var nn = new Array(d.length+2);
	for (var idx= 0; idx<lambda.length; idx++){
		for (var xx= 0; xx<nData.length; xx++){
			nn[xx] = nData[xx][idx];
		}
		R[idx] = rayReflectivity(nn, d, lambda[idx], theta, 'p');
	}
	return {
		lambda: lambda,
		R: R
	};
};

//quicksort, copied from
//http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers#4228448
// array must be sorted ascending, and element must be within bounds
function locationOf(element, array, start, end) {
	start = start || 0;
	end = end || array.length;
	var pivot = parseInt(start + (end - start) / 2, 10); // rounding down, crucially
	if (end-start <= 1 || array[pivot] === element) return pivot;
	if (array[pivot] < element) {
	  return locationOf(element, array, pivot, end);
	} else {
	  return locationOf(element, array, start, pivot);
	}
}

function interpolate(x,y,x0){
	// interpolate (x,y) for each value in x0
	// x must be sorted ascending
	// y is the corresponding values, must be the same length as x obviously
	// x0 must be within the range of (x[0], x[end]) - no extrapolation
	var xs_idx, deltax, deltay;
	var y0 = new Array(x0.length);
	for (var n=0; n<x0.length; n++){
		// make sure the element is within x, which is sorted
		if ( x0[n]<x[0] || x0[n]>x[x.length-1]) {
			throw("Interpolation value is outside range");
		}
		xs_idx = locationOf(x0[n],x);
		deltax = x[xs_idx+1] - x[xs_idx];
		deltay = y[xs_idx+1] - y[xs_idx];
		y0[n] = deltay/deltax*(x0[n]-x[xs_idx]) + y[xs_idx];
	}
	return y0;
}

// https://github.com/jfhbrook/node-linspace/blob/master/index.js
function linspace(start, end, n){
	var every = (end-start)/(n-1);
	var a = new Array(n);
	for (var x=0; x<n; x++){
		a[x] = start+every*x;
	}
	return a;
}