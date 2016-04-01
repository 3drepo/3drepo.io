var normalVec = require('./normalVec');


function generateglTFJSONGroup(byteOffsets, binUri, options){
	'use strict';
	// glTF const
	const ELEMENT_ARRAY_BUFFER = 34963;
	const ARRAY_BUFFER = 34962;
	const UNSIGNED_SHORT = 5123;
	const FLOAT = 5126;
	const SCALAR = 'SCALAR';
	const VEC3 = 'VEC3';
	const IDENTITY_MATRIX = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	const PRIMITIVE_MODE_TRIANGLES = 4;
	const KHR_BINARY_GLTF = 'KHR_binary_glTF';

	let json = require('./glTFMetaTemplate.json');
	json = JSON.parse(JSON.stringify(json));

	// bin info
	let binId = 'buffer1';
	if(options && options.forGlb){
		json.extensionsUsed.push(KHR_BINARY_GLTF);
		binId = KHR_BINARY_GLTF;
	} else {
		json.buffers[binId] = {
			"byteLength": byteOffsets.totalBytes,
			"type": "arraybuffer",
			"uri": binUri
		};
	}

	// indices meta
	let indexInfo = byteOffsets.indices;
	let indexBufferViewName = 'bufferView_indices';
	let indexAccessorName = 'accessor_indices';

	json.bufferViews[indexBufferViewName] = {
		"buffer": binId,
		"byteLength": indexInfo.componentByte * indexInfo.componentCount * indexInfo.count,
		"byteOffset": 0,
		"target": ELEMENT_ARRAY_BUFFER
	};

	byteOffsets.indicesGroup.forEach((byteInfo, index) => {
		json.accessors[indexAccessorName + '_' + index] = {
			"bufferView": indexBufferViewName,
			"byteOffset": byteInfo.offset - indexInfo.offset,
			"componentType": UNSIGNED_SHORT,
			"count": byteInfo.count,
			"type": SCALAR
		};
	});

	// vertices meta
	let vertexInfo = byteOffsets.vertices;
	let vertexBufferViewName = 'bufferView_vertices';
	let vertexAccessorName = 'accessor_vertices';

	json.bufferViews[vertexBufferViewName] = {
		"buffer": binId,
		"byteLength": vertexInfo.componentByte * vertexInfo.componentCount * vertexInfo.count,
		"byteOffset": vertexInfo.offset,
		"target": ARRAY_BUFFER
	};

	json.accessors[vertexAccessorName] = {
		"bufferView": vertexBufferViewName,
		"byteOffset": 0,
		"componentType": FLOAT,
		"count": vertexInfo.count,
		"type": VEC3
	};

	if(options.min && options.max){
		json.accessors[vertexAccessorName].min = options.min;
		json.accessors[vertexAccessorName].max = options.max;
	}


	//normals meta
	let normalInfo = byteOffsets.normals;
	let normalBufferViewName = 'bufferView_normals';
	let normalAccessorName = 'accessor_normals';

	json.bufferViews[normalBufferViewName] = {
		"buffer": binId,
		"byteLength": normalInfo.componentByte * normalInfo.componentCount * normalInfo.count,
		"byteOffset": normalInfo.offset,
		"target": ARRAY_BUFFER
	};

	json.accessors[normalAccessorName] = {
		"bufferView": normalBufferViewName,
		"byteOffset": 0,
		"componentType": FLOAT,
		"count": normalInfo.count,
		"type": VEC3
	};

	let meshName = 'mesh_';

	let effect = 'Effect-White';
	
	byteOffsets.indicesGroup.forEach((byteInfo, index) => {

		if(options && options.materialMapping && options.materialMapping[byteInfo.group]){
			effect = options.materialMapping[byteInfo.group];
		}

		json.meshes[meshName + index] = {
			name: meshName + index,
			"primitives": [
				{
					"attributes": {
						"NORMAL": normalAccessorName,
						"POSITION": vertexAccessorName,
					},
					"indices": indexAccessorName + '_' + index,
					"material": effect,
					"mode": PRIMITIVE_MODE_TRIANGLES
				}
			]
		};
	});

	let nodeName = 'node_1';
	json.nodes[nodeName] = {
		"children": [],
		"matrix": IDENTITY_MATRIX,
		"meshes": [],
		"name": meshName
	};

	byteOffsets.indicesGroup.forEach((x, index) => {
		json.nodes[nodeName].meshes.push(meshName + index);
	});

	json.scenes.defaultScene.nodes = [nodeName];
	
	return json;
}

function generateglTFJSON(bufferInfos, binUri, options){
	'use strict';
	// glTF const
	const ELEMENT_ARRAY_BUFFER = 34963;
	const ARRAY_BUFFER = 34962;
	const UNSIGNED_SHORT = 5123;
	const FLOAT = 5126;
	const SCALAR = 'SCALAR';
	const VEC3 = 'VEC3';
	const IDENTITY_MATRIX = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
	const PRIMITIVE_MODE_TRIANGLES = 4;
	const KHR_BINARY_GLTF = 'KHR_binary_glTF';

	let json = require('./glTFMetaTemplate.json');
	json = JSON.parse(JSON.stringify(json));

	// bin info
	let buffertotalBytes = 0;

	bufferInfos.forEach(bufferInfo => {
		buffertotalBytes += bufferInfo.totalBytes;
	});

	let binId = 'buffer1';
	if(options && options.forGlb){
		json.extensionsUsed.push(KHR_BINARY_GLTF);
		binId = KHR_BINARY_GLTF;
	} else {
		json.buffers[binId] = {
			"byteLength": buffertotalBytes,
			"type": "arraybuffer",
			"uri": binUri
		};
	}
	
	let bufferOffset = 0;

	let nodeName = 'node_1';
	let meshName = 'mesh_1';

	json.meshes[meshName] = {
		'name': meshName,
		"primitives": []
	}

	json.nodes[nodeName] = {
		"children": [],
		"matrix": IDENTITY_MATRIX,
		"meshes": [meshName],
		"name": nodeName,
		"extras" : { "multipart" : "true" }
	};



	bufferInfos.forEach(bufferInfo => {
		
		// generate gltf meta for each building

		let vertexBufferViewName = `vertex_buffer_${bufferInfo.id}`;
		let vertexAccessorName = `vertex_accessor_${bufferInfo.id}`;

		json.bufferViews[vertexBufferViewName] = {
			"buffer": binId,
			"byteLength": bufferInfo.verticesLength,
			"byteOffset": bufferOffset + bufferInfo.verticesOffset,
			"target": ARRAY_BUFFER
		};

		json.accessors[vertexAccessorName] = {
			"bufferView": vertexBufferViewName,
			"byteOffset": 0,
			"componentType": FLOAT,
			"count": bufferInfo.verticesCount,
			"min": bufferInfo.verticesMin,
			"max": bufferInfo.verticesMax,
			"type": VEC3
		};



		let normalBufferViewName = `normal_buffer_${bufferInfo.id}`;
		let normalAccessorName = `normal_accessor_${bufferInfo.id}`;

		json.bufferViews[normalBufferViewName] = {
			"buffer": binId,
			"byteLength": bufferInfo.normalsLength,
			"byteOffset": bufferOffset + bufferInfo.normalsOffset,
			"target": ARRAY_BUFFER
		};

		json.accessors[normalAccessorName] = {
			"bufferView": normalBufferViewName,
			"byteOffset": 0,
			"componentType": FLOAT,
			"count": bufferInfo.normalsCount,
			"type": VEC3,
			"min": bufferInfo.normalsMin,
			"max": bufferInfo.normalsMax
		};


		let indexBufferViewName = `index_buffer_${bufferInfo.id}`;
		let indexAccessorName = `index_accessor_${bufferInfo.id}`;

		json.bufferViews[indexBufferViewName] = {
			"buffer": binId,
			"byteLength": bufferInfo.indicesLength,
			"byteOffset": bufferOffset + bufferInfo.indicesOffset,
			"target": ELEMENT_ARRAY_BUFFER
		}

		json.accessors[indexAccessorName] = {
			"bufferView": indexBufferViewName,
			"byteOffset": 0,
			"componentType": UNSIGNED_SHORT,
			"count": bufferInfo.indicesCount,
			"type": SCALAR,
			"min": bufferInfo.indicesMin,
			"max": bufferInfo.indicesMax
		};


		let idMapBufferViewName = `idMap_buffer_${bufferInfo.id}`;
		let idMapAccessorName = `idMap_accessor_${bufferInfo.id}`;

		json.bufferViews[idMapBufferViewName] = {
			"buffer": binId,
			"byteLength": bufferInfo.idMapLength,
			"byteOffset": bufferOffset + bufferInfo.idMapOffset,
			"target": ARRAY_BUFFER
		}

		json.accessors[idMapAccessorName] = {
			"bufferView": idMapBufferViewName,
			"byteOffset": 0,
			"componentType": FLOAT,
			"count": bufferInfo.idMapCount,
			"type": SCALAR,
			"min": bufferInfo.idMapMin,
			"max": bufferInfo.idMapMax
		};

		let effect = 'Effect-White';

		if(options && options.materialMapping && options.materialMapping[bufferInfo.classCode]){
			effect = options.materialMapping[bufferInfo.classCode];
		}

		json.meshes[meshName].primitives.push({
			"attributes": {
				"NORMAL": normalAccessorName,
				"POSITION": vertexAccessorName,
				"IDMAP": idMapAccessorName
			},
			"extras":{
				"refID": bufferInfo.id
			},
			"indices": indexAccessorName,
			"material": effect,
			"mode": PRIMITIVE_MODE_TRIANGLES
		});

		bufferOffset += bufferInfo.totalBytes;

	});

	json.scenes.defaultScene.nodes = [nodeName];

	return json;
}

function generateBufferNew(meshesByBuilding, binName, materialMapping){
	'use strict';
	
	let GLBYTE = {
		FLOAT: 4,
		UINT: 2
	};


	// var to keep track of byteOffsets info
	let bufferInfos = [];

	let buildingIndex = 0;
	//all building buffers
	let buffers = [];

	Object.keys(meshesByBuilding).forEach(id => {
		// each building

		let building = meshesByBuilding[id];

		let vertexIndex = -1;

		let glIndices = [];
		let glVertices = [];
		let glNormals = [];
		let idMaps = [];

		building.meshes.forEach(mesh => {

			let normal = normalVec(mesh[0], mesh[1], mesh[2]);

			glNormals.push(normal, normal, normal);
			glVertices.push(mesh[0], mesh[1], mesh[2]);
			glIndices.push(++vertexIndex, ++vertexIndex, ++vertexIndex);
			idMaps.push(buildingIndex, buildingIndex, buildingIndex);

		});

		console.log('Debug Info: Indices', id , glIndices);
		console.log('Debug Info: idMaps', id , idMaps);
		let totalBytes = 
			( glVertices.length * 3 ) * GLBYTE.FLOAT +
			( glNormals.length * 3 ) * GLBYTE.FLOAT +
			glIndices.length * GLBYTE.UINT +
			idMaps.length *GLBYTE.FLOAT;

		//console.log('totalBytes', totalBytes);

		let bufferInfo = {
			id: id,
			totalBytes: totalBytes,
			classCode: building.classCode,
			verticesCount: glVertices.length,
			normalsCount: glNormals.length,
			indicesCount: glIndices.length,
			idMapCount: idMaps.length
		};

		let buffer = new Buffer(totalBytes);
		let bufferOffset = 0;
		let min, max;

		/*** vertices ***/

		min = [0,0,0];
		max = [0,0,0];

		if (glVertices.length){
			min = [glVertices[0][0], glVertices[0][1], glVertices[0][2]];
			max = [glVertices[0][0], glVertices[0][1], glVertices[0][2]];
		}

		bufferInfo.verticesOffset = bufferOffset;

		glVertices.forEach(vertex => {
			// vertex = [x,y,z]
			vertex.forEach((val, i) => {
				buffer.writeFloatLE(val, bufferOffset);
				bufferOffset = bufferOffset + GLBYTE.FLOAT;

				if (vertex[i] < min[i]){
					min[i] = vertex[i];
				} else if (vertex[i] > max[i]){
					max[i] = vertex[i];
				}
			});
		});

		bufferInfo.verticesLength = ( glVertices.length * 3 ) * GLBYTE.FLOAT;
		bufferInfo.verticesMin = min;
		bufferInfo.verticesMax = max;

		/*** normals ***/

		min = [0,0,0];
		max = [0,0,0];

		if (glNormals.length){
			min = [glNormals[0][0], glNormals[0][1], glNormals[0][2]];
			max = [glNormals[0][0], glNormals[0][1], glNormals[0][2]];
		}

		bufferInfo.normalsOffset = bufferOffset;

		glNormals.forEach(vertex => {
			// vertex = [x,y,z]
			vertex.forEach((val, i) => {
				buffer.writeFloatLE(val, bufferOffset);
				bufferOffset = bufferOffset + GLBYTE.FLOAT;

				if (vertex[i] < min[i]){
					min[i] = vertex[i];
				} else if (vertex[i] > max[i]){
					max[i] = vertex[i];
				}
			});
		});

		bufferInfo.normalsLength = ( glNormals.length * 3 ) * GLBYTE.FLOAT;
		bufferInfo.normalsMin = min;
		bufferInfo.normalsMax = max;

		/*** indices ***/

		bufferInfo.indicesOffset = bufferOffset;

		min = [0];
		max = [0];

		if (glIndices.length){
			min = [glIndices[0]];
			max = [glIndices[glIndices.length - 1]];
		}

		glIndices.forEach(index => {
			buffer.writeUInt16LE(index, bufferOffset);
			bufferOffset = bufferOffset + GLBYTE.UINT;
		});

		bufferInfo.indicesLength = glIndices.length * GLBYTE.UINT;
		bufferInfo.indicesMin = min;
		bufferInfo.indicesMax = max;

		/*** idMap ***/

		min = [0];
		max = [0];

		if (idMaps.length){
			min = [idMaps[0]];
			max = [idMaps[0]];
		}

		bufferInfo.idMapOffset = bufferOffset;

		idMaps.forEach(val => {
			buffer.writeFloatLE(val, bufferOffset);
			bufferOffset = bufferOffset + GLBYTE.FLOAT;
		});

		bufferInfo.idMapLength = idMaps.length * GLBYTE.FLOAT;
		bufferInfo.idMapMin = min;
		bufferInfo.idMapMax = max;



		buffers.push(buffer);
		bufferInfos.push(bufferInfo);

		buildingIndex++;
	});

	console.log(bufferInfos);

	let json = generateglTFJSON(bufferInfos, binName, { materialMapping });

	return { buffer: Buffer.concat(buffers), json };
}

function generateBuffer(meshesByGroup, binName, materialMapping){
	'use strict';
	
	let GLBYTE = {
		FLOAT: 4,
		UINT: 2
	};

	let vertexIndex = -1;
	let glIndices = [];
	let glVertices = [];
	let glNormals = [];

	// var to keep track of byteOffsets info
	let byteOffsets = {};
	let groupByIndex = {};
	// init glVertices and generate glIndices and glNormals
	Object.keys(meshesByGroup).forEach(key => {

		let meshes = meshesByGroup[key];

		let count = 0;
		meshes.forEach(vertices => {
			
			let normal = normalVec(vertices[0], vertices[1], vertices[2]);

			glNormals.push(normal, normal, normal);
			glVertices.push(vertices[0], vertices[1], vertices[2]);
			glIndices.push(++vertexIndex, ++vertexIndex, ++vertexIndex);

			count += 3;
		});

		groupByIndex[key] = count;

	});

	console.log(groupByIndex);
	// meshes.forEach(vertices => {
		
	// 	let normal = normalVec(vertices[0], vertices[1], vertices[2]);

	// 	glNormals.push(normal, normal, normal);
	// 	glVertices.push(vertices[0], vertices[1], vertices[2]);
	// 	glIndices.push(++vertexIndex, ++vertexIndex, ++vertexIndex);

	// });


	// calulate total bytes needed
	let totalBytes = 
		( glVertices.length * 3 ) * GLBYTE.FLOAT +
		( glNormals.length * 3 ) * GLBYTE.FLOAT +
		glIndices.length * GLBYTE.UINT;
		
	console.log('totalBytes', totalBytes);

	let buffer = new Buffer(totalBytes);
	let bufferOffset = 0;
	let bufferOffsetGroup = 0;

	// Write indices to buffer START
	console.log('indices count', glIndices.length);
	byteOffsets.indices = { offset: bufferOffset, count: glIndices.length, componentByte: GLBYTE.UINT, componentCount: 1};
	byteOffsets.indicesGroup = [];

	glIndices.forEach(index => {
		buffer.writeUInt16LE(index, bufferOffset);
		bufferOffset = bufferOffset + GLBYTE.UINT;
	});

	console.log('indices end buffer offset', bufferOffset);

	Object.keys(groupByIndex).forEach(key => {
		let count = groupByIndex[key];
		let componentCount = 1;
		let componentByte = GLBYTE.UINT;

		byteOffsets.indicesGroup.push({ offset: bufferOffsetGroup, count, componentByte,componentCount, group: key});
		bufferOffsetGroup += componentByte * componentCount * count;
	});
	
	console.log('group indices end buffer offset', bufferOffsetGroup);
	// Write indices to buffer END



	// Write vertices to buffer START
	console.log('vertices count', glVertices.length);
	byteOffsets.vertices = { offset: bufferOffset, count: glVertices.length, componentByte: GLBYTE.FLOAT, componentCount: 3};
	byteOffsets.verticesGroup = [];

	let min = [0,0,0];
	let max = [0,0,0];

	if (glVertices.length){
		min = [glVertices[0][0], glVertices[0][1], glVertices[0][2]];
		max = [glVertices[0][0], glVertices[0][1], glVertices[0][2]];
	}


	glVertices.forEach(vertex => {
		// vertex = [x,y,z]
		vertex.forEach((val, i) => {
			buffer.writeFloatLE(val, bufferOffset);
			bufferOffset = bufferOffset + GLBYTE.FLOAT;

			if (vertex[i] < min[i]){
				min[i] = vertex[i];
			} else if (vertex[i] > max[i]){
				max[i] = vertex[i];
			}
		});


	});

	console.log('vertices end buffer offset', bufferOffset);

	Object.keys(groupByIndex).forEach(key => {
		let count = groupByIndex[key];
		let componentCount = 3;
		let componentByte = GLBYTE.FLOAT;

		byteOffsets.verticesGroup.push({ offset: bufferOffsetGroup, count, componentByte,componentCount});
		bufferOffsetGroup += componentByte * componentCount * count;
	});
	
	console.log('group vertices end buffer offset', bufferOffsetGroup);

	// Write vertices to buffer END



	// Write normals to buffer START
	console.log('normals count', glNormals.length);
	byteOffsets.normals = { offset: bufferOffset, count: glNormals.length, componentByte: GLBYTE.FLOAT, componentCount: 3};
	byteOffsets.normalsGroup = [];

	glNormals.forEach(vertex => {
		// vertex = [x,y,z]
		vertex.forEach(val => {
			buffer.writeFloatLE(val, bufferOffset);
			bufferOffset = bufferOffset + GLBYTE.FLOAT;
		});
	});

	console.log('normals end buffer offset', bufferOffset);

	Object.keys(groupByIndex).forEach(key => {
		let count = groupByIndex[key];
		let componentCount = 3;
		let componentByte = GLBYTE.FLOAT;

		byteOffsets.normalsGroup.push({ offset: bufferOffsetGroup, count, componentByte,componentCount});
		bufferOffsetGroup += componentByte * componentCount * count;
	});
	
	console.log('group normals end buffer offset', bufferOffsetGroup);

	// Write normals to buffer END
	
	byteOffsets.totalBytes = totalBytes;

	console.log(byteOffsets);

	//let json = generateglTFJSON(byteOffsets, binName);
	let json = generateglTFJSONGroup(byteOffsets, binName, {materialMapping, min, max});
	//all-in-one glb format
	// let glb;
	// glb = generateglB(byteOffsets, buffer);

	return { buffer, byteOffsets, json, min, max /*glb: glb*/};
}


module.exports = generateBufferNew;

