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
import { convertToV4GroupNodes, mergeGroupsDataFromViewpoint, toGroupPropertiesDicts, viewpointV5ToV4 } from '@/v5/helpers/viewpoint.helpers';

describe('viewpoint helpers', () => {
	describe('mergeGroupsDataFromViewpoint', () => {
		it.each([
			['highlighted_group_id', 'highlighted_group', 'highlighted', { objects: [] }],
			['hidden_group_id', 'hidden_group', 'hidden', { objects: [] }],
			['shown_group_id', 'shown_group', 'shown', { objects: [] }],
			['override_group_ids', 'override_groups', ['override'], [{ objects: [] }]],
			['transformation_group_ids', 'transformation_groups', ['transform'], [{ objects: [] }]],
		])('merges %s without mutating a frozen viewpoint', (idProperty, groupProperty, ids, groups) => {
			const target = Object.freeze({ [idProperty]: ids, type: 'perspective' });
			const origin = Object.freeze({ [groupProperty]: groups });

			const result = mergeGroupsDataFromViewpoint(target, origin);

			expect(result).toEqual({ ...target, ...origin });
			expect(result).not.toBe(target);
			expect(target).not.toHaveProperty(groupProperty);
		});

		it('preserves embedded groups and ignores groups without matching ID properties', () => {
			const target = Object.freeze({ hidden_group: { objects: [] }, override_group_ids: ['override'] });
			const result = mergeGroupsDataFromViewpoint(target, { shown_group: { objects: [] } });

			expect(result).toEqual(target);
		});
	});

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

	it('expands excludeDefinedObjects hidden groups to all non-defined objects', () => {
		const result = viewpointV5ToV4({
			state: { hidden: [{ group: inverseGroup }] },
		} as any);

		expect(result.viewpoint.hidden_group.objects).toEqual([
			{ account: teamspace, model: modelA, shared_ids: [meshB.shared_id] },
			{ account: teamspace, model: modelB, shared_ids: [meshC.shared_id] },
		]);
	});

	it('applies coloured excludeDefinedObjects groups to all non-defined objects', () => {
		const result = toGroupPropertiesDicts([{
			group: inverseGroup,
			color: [182, 188, 193],
			opacity: 0.02,
		}]);

		expect(result).toEqual({
			overrides: {
				[meshB.shared_id]: '#B6BCC105',
				[meshC.shared_id]: '#B6BCC105',
			},
			transparencies: {
				[meshB.shared_id]: 0.02,
				[meshC.shared_id]: 0.02,
			},
		});
	});

	it('only excludes meshes from the container they are listed against', () => {
		const result = convertToV4GroupNodes({
			...inverseGroup,
			objects: [{ container: modelA, _ids: [meshC._id] }],
		});

		expect(result).toEqual([
			{ account: teamspace, model: modelA, shared_ids: [meshA.shared_id, meshB.shared_id] },
			{ account: teamspace, model: modelB, shared_ids: [meshC.shared_id] },
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

	it('converts camera zoom targets to viewer entries', () => {
		const zoomTo = [{ container: modelA, _ids: [meshA._id] }];

		const result = viewpointV5ToV4({
			camera: {
				type: 'perspective',
				position: [0, 0, 0],
				forward: [0, 0, 1],
				up: [0, 1, 0],
				zoomTo,
			},
		});

		expect(result.viewpoint.zoomTo).toEqual([{
			modelId: modelA,
			teamspace,
			meshes: [meshA._id],
		}]);
	});
});
