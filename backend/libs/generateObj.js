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


function generateObj(meshesArray){

	let out = '';
	let vCount = 0;
	meshesArray.forEach(meshes => {
		//each building's meshes
		meshes.forEach(mesh => {
			// each triangle plane

			let a = mesh[0];
			let b = mesh[1];
			let c = mesh[2];

			out += `v ${a[0]} ${a[1]} ${a[2]}\n`;
			out += `v ${b[0]} ${b[1]} ${b[2]}\n`;
			out += `v ${c[0]} ${c[1]} ${c[2]}\n`;
			out += `f ${vCount+1} ${vCount+2} ${vCount+3}\n`;

			vCount = vCount + 3;
		});
	});

	return out;
}

module.exports = generateObj;