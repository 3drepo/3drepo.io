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
 
 (function (ns) {

    const expiryTime = 1000*60*60*24*15;

    // Dependencies
    var UUID = require('node-uuid');
    var mongodb = require('mongodb');
    var Crypto = require('crypto');

    // Shortcuts
    var Binary = mongodb.Binary;

    //-------------------------------------------------------------------------
    /**
     * Returns a binary uuid from given string
     * eg 9f217dd3-0958-415e-8958-015e0958015e
     *
     * Use this to find objects in the database by _id or shared_id
     * fields.
     *
     * TODO: refactor to parseUUID or something sensible
     *
     * @param {string} sid
     */
    ns.stringToUUID = function(id) {
        var octets = UUID.parse(id);
        var buffer = new Buffer(octets);
        return Binary(buffer, 3);
    };

    //-------------------------------------------------------------------------
    // Returns a new binary uuid suitable for DB insertion (level 3)
    ns.generateUUID = function() {
	return ns.stringToUUID(UUID.v4()); 		
    };

    //-------------------------------------------------------------------------
    // Hashes (md5) given text into a uuid
    ns.hashTextToUUID = function(text) {
        var hash = Crypto.createHash('md5').update(text).digest('hex');
        return ns.stringToUUID(hash);
    };

    //-------------------------------------------------------------------------
    // Returns a string representation from a binary UUID
    ns.uuidToString = function(uuid) {
	return UUID.unparse(uuid.buffer);
    };

    //-------------------------------------------------------------------------
    ns.setCacheHeaders = function(res) {
        var expires = new Date((new Date()).valueOf() + expiryTime);
        res.setHeader("Cache-Control", "public, max-age=345600");
        res.setHeader("Expires", expires.toUTCString());
    }

}(exports));
