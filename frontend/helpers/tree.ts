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

import { hasSameElements } from './arrays';

export const calculateTotalMeshes = (nodes) => {
	return nodes && nodes.length ? nodes
		.map((node) => node.shared_ids ? node.shared_ids.length : 0)
		.reduce((acc, val) => acc + val, 0) : 0;
};

interface IMeshesObject {
	shared_ids: string[];
	account: string;
	model: string;
}

// This function is assuming have only one element by account/model combination,
// and that the share_ids array in each IMeshesObject is unique also
export const hasSameSharedIds = (meshesA: IMeshesObject[], meshesB: IMeshesObject[]): boolean => {
	if (meshesA.length !== meshesB.length) {
		return false;
	}

	const meshesBCacheDict: any = {};
	meshesB.forEach((meshes) => meshesBCacheDict[meshes.account + '.' + meshes.model] = meshes);

	return meshesA.every((modelMeshesA) => {
		const modelMeshesB = meshesBCacheDict[modelMeshesA.account + '.' + modelMeshesA.model];

		if (!modelMeshesB) {
			return false;
		}
		return hasSameElements(modelMeshesA.shared_ids, modelMeshesB.shared_ids);
	});
};
