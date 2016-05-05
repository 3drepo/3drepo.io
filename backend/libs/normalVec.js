/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


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


