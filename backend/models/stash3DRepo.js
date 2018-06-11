/**
 *  Copyright (C) 2016 3D Repo Ltd
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


let mongoose = require("mongoose");
let ModelFactory = require("./factory/modelFactory");
let Schema = mongoose.Schema;

let schema = Schema({
	_id: Object
});

let Stash3DRepo = ModelFactory.createClass(
	"Stash3DRepo", 
	schema, 
	arg => { 
		return `${arg.model}.stash.3drepo`;
	}
);

module.exports = Stash3DRepo;