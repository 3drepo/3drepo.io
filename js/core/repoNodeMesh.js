/**
<<<<<<< Updated upstream
 *  Copyright (C) 2014 3D Repo Ltd 
=======
 *  Copyright (C) 2014 3D Repo Ltd
>>>>>>> Stashed changes
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

// Corresponds to repoNodeMesh in C++ definition of 3D Repo
var mongodb = require('mongodb');
var assert = require('assert');
var UUID = require('node-uuid');
var C = require('./constants');

exports.decode = function(bson, materials) {
    assert.equal(bson[C.REPO_NODE_LABEL_TYPE], C.REPO_NODE_TYPE_MESH, "Trying to convert " + bson[C.REPO_NODE_LABEL_TYPE] + " to mesh");

    if (0) {
        // Name
        if (bson[C.REPO_NODE_LABEL_NAME]) bson[C.M_NAME] = bson[C.REPO_NODE_LABEL_NAME];

        // Vertices
        var verticesCount = bson[C.REPO_NODE_LABEL_VERTICES_COUNT];
        if (bson[C.REPO_NODE_LABEL_VERTICES]) {
            var verticesBinaryObject = bson[C.REPO_NODE_LABEL_VERTICES];
            var vectorsArray = toFloat32Array(verticesBinaryObject, true);

            // TODO: change mVertices to vertices
            bson[C.M_VERTICES] = vectorsArray;
        }

        // Normals
        // There is the same number of normals as vertices.
        if (bson[C.REPO_NODE_LABEL_NORMALS]) {
            var normalsBinaryObject = bson[C.REPO_NODE_LABEL_NORMALS];
            var vectorsArray = toFloat32Array(normalsBinaryObject, true);

            // TODO: change mNormals to normals
            bson[C.M_NORMALS] = vectorsArray;
        }

        // Faces
        if (bson[C.REPO_NODE_LABEL_FACES]) {
            var expectedLength = bson[C.REPO_NODE_LABEL_FACES_COUNT];
            var facesBinaryObject = bson[C.REPO_NODE_LABEL_FACES];

            // number of bytes representing each value (int, should be 4)
            var offset = facesBinaryObject.position / expectedLength;

            // array of arrays of indices
            var facesArray = toFaceArray(facesBinaryObject, offset, true);
            bson[C.M_FACES] = facesArray;
            // TODO: change mFaces to faces
        }

        // UV channels
        if (bson[C.REPO_NODE_LABEL_UV_CHANNELS]) {
            var uvChannelsBinaryObject = bson[C.REPO_NODE_LABEL_UV_CHANNELS];
            var uvChannelsCount = bson[C.REPO_NODE_LABEL_UV_CHANNELS_COUNT] ? bson[C.REPO_NODE_LABEL_UV_CHANNELS_COUNT] : 0;
            var uvChannels = toUVChannelsArray(uvChannelsBinaryObject, uvChannelsCount, true);
            bson[C.REPO_NODE_LABEL_UV_CHANNELS] = uvChannels;
        }

    }

    // There should be always only a single material with the mesh!
    // Takes the very first match if multiple materials attached as children.
    // Children are appended on the fly from other repository components.
<<<<<<< Updated upstream
    // If a single mesh is being decoded on it's own, it will not have the 
=======
    // If a single mesh is being decoded on it's own, it will not have the
>>>>>>> Stashed changes
    // children array attached!
    if (bson[C.REPO_NODE_LABEL_CHILDREN]) {
        for (var i = 0; i < bson[C.REPO_NODE_LABEL_CHILDREN].length; ++i) {
            var childIDbytes = bson[C.REPO_NODE_LABEL_CHILDREN][i][C.REPO_NODE_LABEL_ID].buffer;
            var childID = UUID.unparse(childIDbytes);
            var material = materials[childID];
            if (material) {
                // TODO: change mMaterialIndex to material
                bson[C.M_MATERIAL_INDEX] = childID;
                break;
            }
        }
    }
    return bson;
}

<<<<<<< Updated upstream
=======
exports.extractBoundingBox = function(mesh) {
    var bbox = {};

    bbox.min = mesh['bounding_box'][0];
    bbox.max = mesh['bounding_box'][1];
    bbox.center = [(bbox.min[0] + bbox.max[0]) / 2, (bbox.min[1] + bbox.max[1]) / 2, (bbox.min[2] + bbox.max[2]) / 2];
    bbox.size = [(bbox.max[0] - bbox.min[0]), (bbox.max[1] - bbox.min[1]), (bbox.max[2] - bbox.min[2])];

    return bbox;
}

>>>>>>> Stashed changes
/**
 * Expects a byte array where each offset bytes are integers.
 * Faces are stored as [n_0, i_{0,0}, i_{0,2}... , n_1, i{1,0}, i{1,1}...]
 *
 * @param {Object} facesBinaryObject
 * @param {Object} offset // 4 for 4 bytes in integer32
 * @param {boolean} isLittleEndian
 */
function toFaceArray(facesBinaryObject, offset, isLittleEndian) {
    var facesArray = new Array();
    // return variable, array of arrays of face indices
    var byteBuffer = toDataView(facesBinaryObject);

    // You do not know the number of faces up front as each can
    // have a different number of indices (ie triangle, polygon etc).
    var index = 0;
    while (index < facesBinaryObject.position) {
        // true for little Endianness
        var numberOfIndices = byteBuffer.getInt32(index, isLittleEndian);
        var lastFaceIndex = index + (numberOfIndices + 1) * offset;
        var face = new Array();
        for (index += offset; index < lastFaceIndex; index += offset) {
            face.push(byteBuffer.getInt32(index, isLittleEndian));
        }
        facesArray.push(face);
    }
    return facesArray;
}

/**
 * Transforms a byte object of aiVector3D (3 floats) into an array of vectors [x,y,z]
 *
 * @param {Object} binaryObject
 * @param {boolean} isLittleEndian
 * @return {Float32Array}
 */
function toFloat32Array(binaryObject, isLittleEndian) {
    var result = new Float32Array(binaryObject.position / Float32Array.BYTES_PER_ELEMENT);
    // array of floats [x,y,z ...], return variable
    var byteBuffer = toDataView(binaryObject);

    var count = 0,
        floatValue;
    for (var i = 0; i < binaryObject.position; i += Float32Array.BYTES_PER_ELEMENT) {
        floatValue = byteBuffer.getFloat32(i, isLittleEndian);
        result[count++] = floatValue;
    }
    return result;
}


/**
 * Returns an array of arrays of uv channels, where each channel
<<<<<<< Updated upstream
 * has 2 floats per vertex (there is vertices count pairs) 
 *  
 * @param {Object} binaryObject 
=======
 * has 2 floats per vertex (there is vertices count pairs)
 *
 * @param {Object} binaryObject
>>>>>>> Stashed changes
 * @param {number} channelsCount Number of channels, 1 for now
 * @param {boolean} isLittleEndian True or false
 * @return {Array.<Float32Array>}
 */
function toUVChannelsArray(binaryObject, channelsCount, isLittleEndian) {
    var uvChannelsArray = new Array(channelsCount);

    var byteBuffer = toDataView(binaryObject);
    var channelBytesCount = binaryObject.position / channelsCount;

    for (var i = 0; i < channelsCount; ++i) {
        var channel = new Float32Array(channelBytesCount / Float32Array.BYTES_PER_ELEMENT);
        var offset = i * channelBytesCount;
        var count = 0,
            floatValue;
        for (var j = 0; j < channelBytesCount; j += Float32Array.BYTES_PER_ELEMENT) {
            floatValue = byteBuffer.getFloat32(offset + j, isLittleEndian);
            channel[count++] = floatValue;
        }
        uvChannelsArray[i] = channel;
    }
    return uvChannelsArray;
}

/**
 * Returns a DataView out of a given BSON binary object (BinDataGeneral).
 * See also: http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
 *
 * @param {BinDataGeneral} binary object
 */
function toDataView(binaryObject) {
    return new DataView(toArrayBuffer(binaryObject.buffer));
}

/**
 * Returns an ArrayBuffer from a binary buffer. This can
<<<<<<< Updated upstream
 * be used to create a DataView from it. 
 * See: http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer 
=======
 * be used to create a DataView from it.
 * See: http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
>>>>>>> Stashed changes
 *
 * @param {Buffer} binary buffer
 */
function toArrayBuffer(binaryBuffer) {
    var arrayBuffer = new ArrayBuffer(binaryBuffer.length);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < binaryBuffer.length; ++i) {
        view[i] = binaryBuffer[i];
    }
    return arrayBuffer;
}

