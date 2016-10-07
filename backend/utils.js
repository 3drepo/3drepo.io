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
var _ = require('lodash');

function Utils() {
    "use strict";

    let nodeuuid = require("node-uuid");
    let mongo    = require("mongodb");

    let self = this;

    /*******************************************************************************
    * Convert a string to a UUID
    * @param {string} uuid - String representation of a UUID
    * @returns {Buffer} binuuid - Binary representation of a UUID
    *******************************************************************************/
    this.uuidToMongoBuf3 = function(buf) {
        return mongo.Binary(buf, 3);
    };

    /*******************************************************************************
    * Convert a string to a UUID
    * @param {string} uuid - String representation of a UUID
    * @returns {Buffer} binuuid - Binary representation of a UUID
    *******************************************************************************/
    this.stringToUUID = function(uuid) {
        let bytes = nodeuuid.parse(uuid);
        let buf   = new Buffer(bytes);

        return mongo.Binary(buf, 3);
    };

    /*******************************************************************************
    * Convert a binary representation of an UUID to a string
    * @param {Buffer} binuuid - Binary representation of a UUID
    * @returns {string} uuid - String representation of a UUID
    *******************************************************************************/
    this.uuidToString = function(binuuid) {
        return nodeuuid.unparse(binuuid.buffer);
    };

    /*******************************************************************************
    * Convert a set of strings to binary representation
    * @param {Array} uuids - String representation of a UUID
    * @returns {Buffer} binuuids - Binary representation of a UUID
    *******************************************************************************/
    this.stringsToUUIDs = function(uuids) {
        return uuids.map(function(uuid) {
            return self.stringToUUID(uuid);
        });
    };

    /*******************************************************************************
    * Convert a binary representation of an UUID to a string
    * @param {Buffer} binuuid - Binary representation of a UUID
    * @returns {string} uuid - String representation of a UUID
    *******************************************************************************/
    this.uuidsToStrings = function(binuuids) {
        return binuuids.map(function(binuuid) {
            return self.uuidToString(binuuid);
        });
    };

    /*******************************************************************************
    * Generate a random UUID
    * @returns {Buffer} - Binary representation of a UUID
    *******************************************************************************/
    this.generateUUID = function() {
       return self.stringToUUID(nodeuuid.v4());
    };

    /*******************************************************************************
    * Test if a given string conforms a valid UUID format
    * @returns {Boolean}
    *******************************************************************************/
    this.isUUID = function(uuid) {

       return uuid && Boolean(uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
    };


    /*******************************************************************************
      * Coalesce function
      * @param {Object} variable - variable to coalesce
      * @param {Object} value - value to return if object is null or undefined
      *******************************************************************************/
    this.coalesce = function(variable, value)
    {
        if (variable === null || variable === undefined) {
            return value;
        } else {
            return variable;
        }
    };

    /*******************************************************************************
    * Given an array of BSON objects and a Type return a map of JS Objects
    * @returns {Object} - Map of the objects
    *******************************************************************************/
    this.bulkDecode = function(Type, bsons)
    {
        let results = {};

        for (let i = 0; i < bsons.length; i++)
        {
            let obj = new Type(bsons[i]);
            results[obj.getID()] = obj;
        }

        return results;
    };

    /**
     * Expects a byte array where each offset bytes are integers.
     * Faces are stored as [n_0, i_{0,0}, i_{0,2}... , n_1, i{1,0}, i{1,1}...]
     *
     * @param {Object} facesBinaryObject
     * @param {Object} offset // 4 for 4 bytes in integer32
     * @param {boolean} isLittleEndian
     */
    this.toFaceArray = function(facesBinaryObject, offset, isLittleEndian) {
        let facesArray = [];
        // return variable, array of arrays of face indices
        let byteBuffer = toDataView(facesBinaryObject);

        // You do not know the number of faces up front as each can
        // have a different number of indices (ie triangle, polygon etc).
        let index = 0;
        while (index < facesBinaryObject.position) {
            // true for little Endianness
            let numberOfIndices = byteBuffer.getInt32(index, isLittleEndian);
            let lastFaceIndex = index + (numberOfIndices + 1) * offset;
            let face = [];
            for (index += offset; index < lastFaceIndex; index += offset) {
                face.push(byteBuffer.getInt32(index, isLittleEndian));
            }
            facesArray.push(face);
        }

        return facesArray;
    };

    /**
     * Transforms a byte object of aiVector3D (3 floats) into an array of vectors [x,y,z]
     *
     * @param {Object} binaryObject
     * @param {boolean} isLittleEndian
     * @return {Float32Array}
     */
    this.toFloat32Array = function(binaryObject, isLittleEndian) {
        let result = new Float32Array(binaryObject.position / Float32Array.BYTES_PER_ELEMENT);
        // array of floats [x,y,z ...], return variable
        let byteBuffer = toDataView(binaryObject);

        let count = 0,
            floatValue;
        for (let i = 0; i < binaryObject.position; i += Float32Array.BYTES_PER_ELEMENT) {
            floatValue = byteBuffer.getFloat32(i, isLittleEndian);
            result[count++] = floatValue;
        }
        return result;
    };


    /**
     * Returns an array of arrays of uv channels, where each channel
     * has 2 floats per vertex (there is vertices count pairs)
     *
     * @param {Object} binaryObject
     * @param {number} channelsCount Number of channels, 1 for now
     * @param {boolean} isLittleEndian True or false
     * @return {Array.<Float32Array>}
     */
    this.toUVChannelsArray = function(binaryObject, channelsCount, isLittleEndian) {
        let uvChannelsArray = new Array(channelsCount);

        let byteBuffer = toDataView(binaryObject);
        let channelBytesCount = binaryObject.position / channelsCount;

        for (let i = 0; i < channelsCount; ++i) {
            let channel = new Float32Array(channelBytesCount / Float32Array.BYTES_PER_ELEMENT);
            let offset = i * channelBytesCount;
            let count = 0,
                floatValue;
            for (let j = 0; j < channelBytesCount; j += Float32Array.BYTES_PER_ELEMENT) {
                floatValue = byteBuffer.getFloat32(offset + j, isLittleEndian);
                channel[count++] = floatValue;
            }
            uvChannelsArray[i] = channel;
        }
        return uvChannelsArray;
    };

    /**
     * Returns a DataView out of a given BSON binary object (BinDataGeneral).
     * See also: http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
     *
     * @param {BinDataGeneral} binary object
     */
    this.toDataView = function(binaryObject) {
        return new DataView(toArrayBuffer(binaryObject.buffer));
    };

    /**
     * Returns an ArrayBuffer from a binary buffer. This can
     * be used to create a DataView from it.
     * See: http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
     *
     * @param {Buffer} binary buffer
     */
    this.toArrayBuffer = function(binaryBuffer) {
        let arrayBuffer = new ArrayBuffer(binaryBuffer.length);
        let view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryBuffer.length; ++i) {
            view[i] = binaryBuffer[i];
        }
        return arrayBuffer;
    };

    /**
     * Map http promise error to our defined error codes
     *
     * @param {Object} err object from mongoose
     * @param {number} channelsCount Number of channels, 1 for now
     * @param {boolean} isLittleEndian True or false
     * @return {Object} our defined response code 
     */
    this.mongoErrorToResCode = function(err){

      //let _ = require('lodash');
      let responseCodes = require('./response_codes');
      if(err.name === 'ValidationError'){
        return responseCodes.MONGOOSE_VALIDATION_ERROR(err);
      } else if(err.name === 'MongoError') {
        return responseCodes.DB_ERROR(err);
      } else {
        return err;
      }
    };

    /**
     * Clean req body and assign it to mongoose model
     *
     * @param {Array} list of accepted keys
     * @param {Object} express req.body
     * @param {Object} mongoose model instance to be updated
     * @return {Object} updated mongoose model instance
     */
    this.writeCleanedBodyToModel = function(whitelist, dirtyBody, model){

        let cleanedReq = _.pick(dirtyBody, whitelist);
        _.forEach(cleanedReq, (value, key) => {
            model[key] = value;
        });

        return model;
    };

    /**
     * Return API method and pathname, no more hardcoding for something like '/login POST' in logging. Happy days
     *
     * @param {Object} this request object given by express.js
     * @return {String} string describing an API's method and pathname
     */
    this.APIInfo = function(req){
        return `${req.method} ${req._parsedUrl.pathname}`;
    };

}

module.exports = new Utils();
