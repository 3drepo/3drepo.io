/**
 *  Copyright (C) 2021 3D Repo Ltd
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


 const { getArrayDifference } = require("../../../../../utils/helper/arrays");
 const { templates, createResponseCode } = require('../../../../../utils/responseCodes');

 const Favourites = {};
 
 Favourites.editFavourites = async (username, teamspace, acessibleModels, favourites, modelMethod) =>{
    const invalidFavourites = getArrayDifference(acessibleModels.map((c)=>c._id), favourites);
	if (invalidFavourites.length) {
		throw createResponseCode(templates.invalidArguments,  "Invalid Arguements: " + invalidFavourites);
	}

	await modelMethod(username, teamspace, favourites);
 };
 
 module.exports = Favourites;
 