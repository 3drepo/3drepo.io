// geometry generate function
var earcut = require('earcut');

function generateMeshes(coors, height, refPoint){
	'use strict';

	coors = coors[0];

	//let vCount = 0;
	let vertices = [];
	let meshes = [];

	//ditch the last coordinate as it is a dup coordinate of the first one
	coors.pop();
	

	coors.forEach( (coor) => {
		//normalize the coors positions
		coor[0] = coor[0] - refPoint[0];
		coor[1] = coor[1] - refPoint[1];
	});

	// generate base face
	coors.forEach( (coor) => {
		vertices.push([coor[0], 0, -coor[1]]);
	});

	// generate roof face
	coors.forEach( (coor) => {
		vertices.push([coor[0], height, -coor[1]]);
	});

	// flatten building shape coordinates
	var flattenCoors =  [];
	coors.forEach( (coor) => {
		flattenCoors.push(coor[0], -coor[1]);
	});

	//generate triangulated coordinates for the building shape
	var triangulateCoors = earcut(flattenCoors);

	for(let i=0; i < triangulateCoors.length; i=i+3){

		//base plane
		meshes.push([ 
			vertices[triangulateCoors[i]],
			vertices[triangulateCoors[i+1]],
			vertices[triangulateCoors[i+2]]   
		]);

		//upper plane
		meshes.push([ 
			vertices[triangulateCoors[i] + coors.length],
			vertices[triangulateCoors[i+1] + coors.length],
			vertices[triangulateCoors[i+2] +coors.length]   
		]);
	}

	//dirty trick to fix length-1/+1 problem
	coors.push([]);

	coors.forEach( (coor, index) => {
		if(coors.length - 1 !== index && index < coors.length - 2) {

			let a = index + 1;
			let b = index + 2 ;
			let c = coors.length + index + 1;
			let d = coors.length + index;


			//dup vertex
			a = vertices.push([vertices[a-1][0], vertices[a-1][1], vertices[a-1][2]]);
			b = vertices.push([vertices[b-1][0], vertices[b-1][1], vertices[b-1][2]]);
			c = vertices.push([vertices[c-1][0], vertices[c-1][1], vertices[c-1][2]]);
			d = vertices.push([vertices[d-1][0], vertices[d-1][1], vertices[d-1][2]]);

			meshes.push([ 
				vertices[a-1],
				vertices[b-1],
				vertices[c-1]  
			]);

			meshes.push([ 
				vertices[a-1],
				vertices[c-1],
				vertices[d-1]  
			]);
		}
	});

	//last face
	let a = coors.length - 1;
	let b = 1;
	let c = coors.length;
	let d = (coors.length) * 2 - 2;

	//dup vertex
	a = vertices.push([vertices[a-1][0], vertices[a-1][1], vertices[a-1][2]]);
	b = vertices.push([vertices[b-1][0], vertices[b-1][1], vertices[b-1][2]]);
	c = vertices.push([vertices[c-1][0], vertices[c-1][1], vertices[c-1][2]]);
	d = vertices.push([vertices[d-1][0], vertices[d-1][1], vertices[d-1][2]]);

	meshes.push([ 
		vertices[a-1],
		vertices[b-1],
		vertices[c-1]  
	]);

	meshes.push([ 
		vertices[a-1],
		vertices[c-1],
		vertices[d-1]  
	]);

	return meshes;

}

module.exports = generateMeshes;
