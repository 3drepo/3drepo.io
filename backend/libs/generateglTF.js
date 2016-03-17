var normalVec = require('./normalVec');

// function generateglTFJSON(byteOffsets, binName, options){
// 	'use strict';
// 	// glTF const
// 	const ELEMENT_ARRAY_BUFFER = 34963;
// 	const ARRAY_BUFFER = 34962;
// 	const UNSIGNED_SHORT = 5123;
// 	const FLOAT = 5126;
// 	const SCALAR = 'SCALAR';
// 	const VEC3 = 'VEC3';
// 	const IDENTITY_MATRIX = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
// 	const PRIMITIVE_MODE_TRIANGLES = 4;
// 	const KHR_BINARY_GLTF = 'KHR_binary_glTF';

// 	let json = require('./glTFMetaTemplate.json');
// 	json = JSON.parse(JSON.stringify(json));

// 	// bin info
// 	if(options && options.forGlb){
// 		json.extensionsUsed.push(KHR_BINARY_GLTF);
// 		binName = KHR_BINARY_GLTF;
// 	} else {
// 		json.buffers[binName] = {
// 			"byteLength": byteOffsets.totalBytes,
// 			"type": "arraybuffer",
// 			"uri": binName + ".bin"
// 		};
// 	}

// 	// indices meta
// 	let indexInfo = byteOffsets.indices;
// 	let indexBufferViewName = 'bufferView_indices';
// 	let indexAccessorName = 'accessor_indices';

// 	json.bufferViews[indexBufferViewName] = {
// 		"buffer": binName,
// 		"byteLength": indexInfo.componentByte * indexInfo.componentCount * indexInfo.count,
// 		"byteOffset": 0,
// 		"target": ELEMENT_ARRAY_BUFFER
// 	};

// 	json.accessors[indexAccessorName] = {
// 		"bufferView": indexBufferViewName,
// 		"byteOffset": 0,
// 		"componentType": UNSIGNED_SHORT,
// 		"count": indexInfo.count,
// 		"type": SCALAR
// 	};

// 	// vertices meta
// 	let vertexInfo = byteOffsets.vertices;
// 	let vertexBufferViewName = 'bufferView_vertices';
// 	let vertexAccessorName = 'accessor_vertices';

// 	json.bufferViews[vertexBufferViewName] = {
// 		"buffer": binName,
// 		"byteLength": vertexInfo.componentByte * vertexInfo.componentCount * vertexInfo.count,
// 		"byteOffset": vertexInfo.offset,
// 		"target": ARRAY_BUFFER
// 	};

// 	json.accessors[vertexAccessorName] = {
// 		"bufferView": vertexBufferViewName,
// 		"byteOffset": 0,
// 		"componentType": FLOAT,
// 		"count": vertexInfo.count,
// 		"type": VEC3
// 	};

// 	//normals meta
// 	let normalInfo = byteOffsets.normals;
// 	let normalBufferViewName = 'bufferView_normals';
// 	let normalAccessorName = 'accessor_normals';

// 	json.bufferViews[normalBufferViewName] = {
// 		"buffer": binName,
// 		"byteLength": normalInfo.componentByte * normalInfo.componentCount * normalInfo.count,
// 		"byteOffset": normalInfo.offset,
// 		"target": ARRAY_BUFFER
// 	};

// 	json.accessors[normalAccessorName] = {
// 		"bufferView": normalBufferViewName,
// 		"byteOffset": 0,
// 		"componentType": FLOAT,
// 		"count": normalInfo.count,
// 		"type": VEC3
// 	};

// 	let meshName = 'mesh_1';
// 	let defaultEffectName = 'Effect-White';

// 	json.meshes[meshName] = {
// 		name: meshName,
// 		"primitives": [
// 			{
// 				"attributes": {
// 					"NORMAL": normalAccessorName,
// 					"POSITION": vertexAccessorName
// 				},
// 				"indices": indexAccessorName,
// 				"material": defaultEffectName,
// 				"mode": PRIMITIVE_MODE_TRIANGLES
// 			}
// 		]
// 	};

// 	let nodeName = 'node_1';
// 	json.nodes[nodeName] = {
// 		"children": [],
// 		"matrix": IDENTITY_MATRIX,
// 		"meshes": [meshName],
// 		"name": meshName
// 	};

// 	json.scenes.defaultScene.nodes = [nodeName];
	
// 	return json;
// }


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

	// json.accessors[indexAccessorName] = {
	// 	"bufferView": indexBufferViewName,
	// 	"byteOffset": 0,
	// 	"componentType": UNSIGNED_SHORT,
	// 	"count": indexInfo.count,
	// 	"type": SCALAR
	// };
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

	// byteOffsets.verticesGroup.forEach((byteInfo, index) => {
	// 	json.accessors[vertexAccessorName + '_' + index] = {
	// 		"bufferView": vertexBufferViewName,
	// 		"byteOffset": byteInfo.offset - vertexInfo.offset,
	// 		"componentType": FLOAT,
	// 		"count": byteInfo.count,
	// 		"type": VEC3
	// 	};
	// });

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

	// byteOffsets.normalsGroup.forEach((byteInfo, index) => {
	// 	json.accessors[normalAccessorName + '_' + index] = {
	// 		"bufferView": normalBufferViewName,
	// 		"byteOffset": byteInfo.offset - normalInfo.offset,
	// 		"componentType": FLOAT,
	// 		"count": byteInfo.count,
	// 		"type": VEC3
	// 	};
	// });

	// let meshName = 'mesh_1';
	// let defaultEffectName = 'Effect-White';

	// json.meshes[meshName] = {
	// 	name: meshName,
	// 	"primitives": [
	// 		{
	// 			"attributes": {
	// 				"NORMAL": normalAccessorName,
	// 				"POSITION": vertexAccessorName
	// 			},
	// 			"indices": indexAccessorName,
	// 			"material": defaultEffectName,
	// 			"mode": PRIMITIVE_MODE_TRIANGLES
	// 		}
	// 	]
	// };

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
// generateglB doesn't work correctly
// function generateglB(byteOffsets, buffer){

// 	const HEADER_BYTES = 20;

// 	let scene = generateglTFJSON(byteOffsets, null, true);
// 	scene = JSON.stringify(scene);
// 	console.log(scene);
// 	let sceneBytes = scene.length;

// 	console.log('HEADER_BYTES', HEADER_BYTES);
// 	console.log('sceneBytes', sceneBytes);
// 	console.log('buffer.length', buffer.length)
// 	let totalglbBytes = HEADER_BYTES + sceneBytes + buffer.length;

// 	console.log('totalglbBytes', totalglbBytes);

// 	let glB = new Buffer(totalglbBytes);
// 	//magic header
// 	glB.write('glTF', 0, 4, 'ascii');
// 	//glB version
// 	glB.writeUInt32LE(1, 4);
// 	//total length
// 	glB.writeUInt32LE(totalglbBytes, 8);
// 	//scene length
// 	glB.writeUInt32LE(sceneBytes, 12);
// 	//scene format 0 = JSON
// 	glB.writeUInt32LE(0, 16);

// 	// scene content
// 	glB.write(scene, 20, sceneBytes, 'utf8');

// 	//buffer
// 	buffer.copy(glB, 20 + sceneBytes);

// 	return glB;
// }

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

	glVertices.forEach(vertex => {
		// vertex = [x,y,z]
		vertex.forEach(val => {
			buffer.writeFloatLE(val, bufferOffset);
			bufferOffset = bufferOffset + GLBYTE.FLOAT;
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
	let json = generateglTFJSONGroup(byteOffsets, binName, {materialMapping});
	//all-in-one glb format
	// let glb;
	// glb = generateglB(byteOffsets, buffer);

	return { buffer: buffer, byteOffsets: byteOffsets, json: json /*glb: glb*/};
}


module.exports = generateBuffer;

// let glTFBuffer = generateBuffer(meshes);

// let buffer = glTFBuffer.buffer;
// let byteOffsets = glTFBuffer.byteOffsets;
// let glTFJSON = glTFBuffer.json;


// fs.open('/home/henry/development/glTF/sampleModels/test/triangle.bin', 'w+', (status, fd) => {

//     if (status) {
//         console.log(status.message);
//         return;
//     }

// 	fs.write(fd, buffer, 0, buffer.length, (err, written) => {
// 		if(err){
// 			console.log(err);
// 		} else {
// 			console.log(`${written} bytes written`);
// 		}
// 	});

//  });
