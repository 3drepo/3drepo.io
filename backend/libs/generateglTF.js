var normalVec = require('./normalVec');


function generateglTFJSON(totalBufferInfo, buildingBufferInfos, binUri, options){
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
			"byteLength": totalBufferInfo.totalBytes,
			"type": "arraybuffer",
			"uri": binUri
		};
	}

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

	let vertexBufferViewName = `vertex_buffer`;

	json.bufferViews[vertexBufferViewName] = {
		"buffer": binId,
		"byteLength": totalBufferInfo.verticesLength,
		"byteOffset": totalBufferInfo.verticesOffset,
		"target": ARRAY_BUFFER
	};

	let normalBufferViewName = `normal_buffer`;

	json.bufferViews[normalBufferViewName] = {
		"buffer": binId,
		"byteLength": totalBufferInfo.normalsLength,
		"byteOffset": totalBufferInfo.normalsOffset,
		"target": ARRAY_BUFFER
	};

	let indexBufferViewName = `index_buffer`;

	json.bufferViews[indexBufferViewName] = {
		"buffer": binId,
		"byteLength": totalBufferInfo.indicesLength,
		"byteOffset": totalBufferInfo.indicesOffset,
		"target": ELEMENT_ARRAY_BUFFER
	}

	let idMapBufferViewName = `idMap_buffer`;

	json.bufferViews[idMapBufferViewName] = {
		"buffer": binId,
		"byteLength": totalBufferInfo.idMapsLength,
		"byteOffset": totalBufferInfo.idMapsOffset,
		"target": ARRAY_BUFFER
	}

	buildingBufferInfos.forEach(bufferInfo => {
		
		// generate gltf meta for each building
		let vertexAccessorName = `vertex_accessor_${bufferInfo.id}`;


		json.accessors[vertexAccessorName] = {
			"bufferView": vertexBufferViewName,
			"byteOffset": bufferInfo.verticesOffset,
			"componentType": FLOAT,
			"count": bufferInfo.verticesCount,
			"min": bufferInfo.verticesMin,
			"max": bufferInfo.verticesMax,
			"type": VEC3,
			"byteStride": 12
		};


		let normalAccessorName = `normal_accessor_${bufferInfo.id}`;

		json.accessors[normalAccessorName] = {
			"bufferView": normalBufferViewName,
			"byteOffset": bufferInfo.normalsOffset,
			"componentType": FLOAT,
			"count": bufferInfo.normalsCount,
			"type": VEC3,
			"min": bufferInfo.normalsMin,
			"max": bufferInfo.normalsMax,
			"byteStride": 12
		};


		let indexAccessorName = `index_accessor_${bufferInfo.id}`;

		json.accessors[indexAccessorName] = {
			"bufferView": indexBufferViewName,
			"byteOffset": bufferInfo.indicesOffset,
			"componentType": UNSIGNED_SHORT,
			"count": bufferInfo.indicesCount,
			"type": SCALAR,
			"min": bufferInfo.indicesMin,
			"max": bufferInfo.indicesMax,
			"byteStride": 2
		};


		let idMapAccessorName = `idMap_accessor_${bufferInfo.id}`;

		json.accessors[idMapAccessorName] = {
			"bufferView": idMapBufferViewName,
			"byteOffset": bufferInfo.idMapsOffset,
			"componentType": FLOAT,
			"count": bufferInfo.idMapsCount,
			"type": SCALAR,
			"min": bufferInfo.idMapsMin,
			"max": bufferInfo.idMapsMax,
			"byteStride": 4
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

	});

	json.scenes.defaultScene.nodes = [nodeName];

	return json;
}

function generateBuffer(meshesByBuilding, binName, materialMapping){
	'use strict';
	
	let GLBYTE = {
		FLOAT: 4,
		UINT: 2
	};


	// var to keep track of byteOffsets info
	let bufferInfos = [];

	let buildingIndex = 0;
	//all building buffers
	let verticesBuffers = [];
	let normalsBuffers = [];
	let indicesBuffers = [];
	let idMapsBuffers = [];

	let totalVerticesOffset = 0;
	let totalNormalsOffset = 0;
	let totalIndicesOffset = 0;
	let totalIdMapsOffset = 0;

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

		// console.log('Debug Info: Indices', id , glIndices);
		// console.log('Debug Info: idMaps', id , idMaps);
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
			idMapsCount: idMaps.length
		};

		let verticesBuffer = new Buffer(( glVertices.length * 3 ) * GLBYTE.FLOAT);
		let normalsBuffer = new Buffer(( glNormals.length * 3 ) * GLBYTE.FLOAT);
		let indicesBuffer = new Buffer(glIndices.length * GLBYTE.UINT);
		let idMapsBuffer = new Buffer(idMaps.length *GLBYTE.FLOAT);


		let writeBufferOffset;
		let min, max;

		/*** vertices ***/

		min = [0,0,0];
		max = [0,0,0];

		if (glVertices.length){
			min = [glVertices[0][0], glVertices[0][1], glVertices[0][2]];
			max = [glVertices[0][0], glVertices[0][1], glVertices[0][2]];
		}

		bufferInfo.verticesOffset = totalVerticesOffset;

		writeBufferOffset = 0;
		glVertices.forEach(vertex => {
			// vertex = [x,y,z]
			vertex.forEach((val, i) => {
				verticesBuffer.writeFloatLE(val, writeBufferOffset);
				writeBufferOffset = writeBufferOffset + GLBYTE.FLOAT;

				if (vertex[i] < min[i]){
					min[i] = vertex[i];
				} else if (vertex[i] > max[i]){
					max[i] = vertex[i];
				}
			});
		});

		totalVerticesOffset += writeBufferOffset;
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

		bufferInfo.normalsOffset = totalNormalsOffset;

		writeBufferOffset = 0;
		glNormals.forEach(vertex => {
			// vertex = [x,y,z]
			vertex.forEach((val, i) => {
				normalsBuffer.writeFloatLE(val, writeBufferOffset);
				writeBufferOffset = writeBufferOffset + GLBYTE.FLOAT;

				if (vertex[i] < min[i]){
					min[i] = vertex[i];
				} else if (vertex[i] > max[i]){
					max[i] = vertex[i];
				}
			});
		});

		totalNormalsOffset += writeBufferOffset;
		bufferInfo.normalsLength = ( glNormals.length * 3 ) * GLBYTE.FLOAT;
		bufferInfo.normalsMin = min;
		bufferInfo.normalsMax = max;

		/*** indices ***/

		bufferInfo.indicesOffset = totalIndicesOffset;

		min = [0];
		max = [0];

		if (glIndices.length){
			min = [glIndices[0]];
			max = [glIndices[glIndices.length - 1]];
		}

		writeBufferOffset = 0;
		glIndices.forEach(index => {
			indicesBuffer.writeUInt16LE(index, writeBufferOffset);
			writeBufferOffset = writeBufferOffset + GLBYTE.UINT;
		});

		totalIndicesOffset += writeBufferOffset;
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

		bufferInfo.idMapsOffset = totalIdMapsOffset;

		writeBufferOffset = 0;
		idMaps.forEach(val => {
			idMapsBuffer.writeFloatLE(val, writeBufferOffset);
			writeBufferOffset = writeBufferOffset + GLBYTE.FLOAT;
		});

		totalIdMapsOffset += writeBufferOffset;
		bufferInfo.idMapsLength = idMaps.length * GLBYTE.FLOAT;
		bufferInfo.idMapsMin = min;
		bufferInfo.idMapsMax = max;



		verticesBuffers.push(verticesBuffer);
		normalsBuffers.push(normalsBuffer);
		indicesBuffers.push(indicesBuffer);
		idMapsBuffers.push(idMapsBuffer);

		bufferInfos.push(bufferInfo);

		buildingIndex++;
	});

	//console.log(bufferInfos);

	let vBuffer = Buffer.concat(verticesBuffers);
	let nBuffer = Buffer.concat(normalsBuffers);
	let iBuffer = Buffer.concat(indicesBuffers);
	let idBuffer = Buffer.concat(idMapsBuffers);

	let totalBufferInfo = {
		verticesOffset: 0,
		verticesLength: vBuffer.length,
		normalsOffset: vBuffer.length,
		normalsLength: nBuffer.length,
		indicesOffset: vBuffer.length + nBuffer.length,
		indicesLength: iBuffer.length,
		idMapsOffset: vBuffer.length + nBuffer.length + iBuffer.length,
		idMapsLength: idBuffer.length,
		totalBytes: vBuffer.length + nBuffer.length + iBuffer.length + idBuffer.length
	};

	let json = generateglTFJSON(totalBufferInfo, bufferInfos, binName, { materialMapping });

	return { buffer: Buffer.concat([vBuffer, nBuffer, iBuffer, idBuffer]), json };
}



module.exports = generateBuffer;

