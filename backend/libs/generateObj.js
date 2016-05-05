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