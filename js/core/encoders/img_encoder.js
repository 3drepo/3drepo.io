/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

exports.route = function(router)
{
	var imgObject = function(res, params) {
		router.dbInterface.getObject(params.account, params.project, params.uid, null, null, function(err, type, uid, obj)
		{
			if(err) throw err;

			if (type == "texture")
			{
			  res.write(obj.textures[uid].data.buffer);
			  res.end();
			} else {
				throw new Error("Type of object not supported");
			}
		});
	};

	router.get('jpg', '/:account/:project/:uid', imgObject);
	router.get('png', '/:account/:project/:uid', imgObject);
	router.get('bmp', '/:account/:project/:uid', imgObject);
	router.get('gif', '/:account/:project/:uid', imgObject);
};


