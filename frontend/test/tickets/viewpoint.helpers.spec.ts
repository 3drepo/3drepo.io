/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import TreeProcessing from '@/v4/modules/tree/treeProcessing/treeProcessing';
import { NODE_TYPES } from '@/v4/constants/tree';
import { setStore } from '@/v5/helpers/redux.helpers';
import { convertToV4GroupNodes, toGroupPropertiesDicts, viewpointV5ToV4 } from '@/v5/helpers/viewpoint.helpers';

describe('viewpoint helpers', () => {
	const teamspace = 'teamspace';
	const modelA = 'model-a';
	const modelB = 'model-b';
	const root = {
		_id: 'federation-root',
		namespacedId: `${teamspace}@federation`,
		model: 'federation',
		teamspace,
		subTreeRoots: ['model-a-root', 'model-b-root'],
	};
	const modelARoot = {
		_id: 'model-a-root',
		namespacedId: `${teamspace}@${modelA}`,
		model: modelA,
		teamspace,
	};
	const modelBRoot = {
		_id: 'model-b-root',
		namespacedId: `${teamspace}@${modelB}`,
		model: modelB,
		teamspace,
	};
	const meshA = { _id: 'mesh-a', shared_id: 'shared-a', model: modelA, teamspace, type: NODE_TYPES.MESH };
	const meshB = { _id: 'mesh-b', shared_id: 'shared-b', model: modelA, teamspace, type: NODE_TYPES.MESH };
	const meshC = { _id: 'mesh-c', shared_id: 'shared-c', model: modelB, teamspace, type: NODE_TYPES.MESH };
	const folder = { _id: 'folder', shared_id: 'folder-shared-id', model: modelA, teamspace, type: 'folder' };
	const inverseGroup = {
		name: 'Other Objects',
		excludeDefinedObjects: true,
		objects: [{ container: modelA, _ids: [meshA._id] }],
	};

	beforeEach(() => {
		(TreeProcessing as any).processing = {
			nodesList: [root, modelARoot, modelBRoot, meshA, meshB, meshC, folder],
			nodesIndexesMap: {
				[root._id]: 0,
				[modelARoot._id]: 1,
				[modelBRoot._id]: 2,
				[meshA._id]: 3,
				[meshB._id]: 4,
				[meshC._id]: 5,
				[folder._id]: 6,
			},
			subModelsRootNodes: {
				[modelA]: { children: [{}] },
				[modelB]: { children: [{}] },
			},
			meshesByNodeId: {
				[modelARoot.namespacedId]: { [modelARoot._id]: [meshA._id, meshB._id] },
				[modelBRoot.namespacedId]: { [modelBRoot._id]: [meshC._id] },
			},
		};
		setStore({
			dispatch: jest.fn(),
			getState: () => ({
				teamspaces2: { currentTeamspace: teamspace },
				tree: { dataRevision: 'revision' },
			}),
			subscribe: jest.fn(),
		} as any);
	});

	it('keeps excludeDefinedObjects metadata in hidden groups', () => {
		const result = viewpointV5ToV4({
			state: { hidden: [{ group: inverseGroup }] },
		} as any);

		expect(result.viewpoint.hidden_group.objects).toEqual([
			{ account: teamspace, model: modelA, shared_ids: [meshA.shared_id], excludeDefinedObjects: true },
		]);
	});

	it('applies coloured excludeDefinedObjects groups using excludeIds metadata', () => {
		const result = toGroupPropertiesDicts([{
			group: inverseGroup,
			color: [182, 188, 193],
			opacity: 0.02,
		}]);

		expect(result).toEqual({
			overrides: {
				[meshA.shared_id]: { color: '#B6BCC1', excludeIds: true },
			},
			transparencies: {
				[meshA.shared_id]: { transparency: 0.02, excludeIds: true },
			},
		});
	});

	it('keeps mapped shared ids as provided container entries', () => {
		const result = convertToV4GroupNodes({
			...inverseGroup,
			objects: [{ container: modelA, _ids: [meshC._id] }],
		});

		expect(result).toEqual([
			{ account: teamspace, model: modelA, shared_ids: [meshC.shared_id], excludeDefinedObjects: true },
		]);
	});

	it('keeps ordinary include groups unchanged', () => {
		const result = toGroupPropertiesDicts([{
			group: {
				name: 'Object A',
				objects: [{ container: modelA, _ids: [meshA._id] }],
			},
			color: [255, 0, 0],
		}]);

		expect(result).toEqual({
			overrides: { [meshA.shared_id]: '#FF0000' },
			transparencies: { [meshA.shared_id]: 1 },
		});
	});
});
