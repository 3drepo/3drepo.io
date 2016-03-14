

function sub(a, b) {

	var res = [];

	res[0] = a[0] - b[0];
	res[1] = a[1] - b[1];
	res[2] = a[2] - b[2];

	return res;
}

function cross(a, b) {

	//(a2b3−a3b2)i−(a1b3−a3b1)j+(a1b2−a2b1)k.

	var res = [];

    res[0] = a[1] * b[2] - a[2] * b[1];
    res[1] = a[2] * b[0] - a[0] * b[2];
    res[2] = a[0] * b[1] - a[1] * b[0];

    return res;
}

function normalize(a) {

	var res = [];

	var x = a[0];
	var y = a[1];
	var z = a[2];

	var len = x*x + y*y + z*z;

	if (len > 0) {
		len = Math.sqrt(len);
		res[0] = a[0] / len;
		res[1] = a[1] / len;
		res[2] = a[2] / len;
	}

	res.forEach((n, i) => {
		res[i] = (n === -0 ? 0 : n);
	});

    return res;
}


function normalVec(a, b, c){
	var v1 = sub(b, a);
	var v2 = sub(c, a);

	return normalize(cross(v1, v2));
}

module.exports = normalVec;


