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

export const ACTION_TYPES = {
	SET_DATA: 'SET_DATA',
	UPDATE_VISIBILITY: 'UPDATE_VISIBILITY',
	SELECT_NODES: 'SELECT_NODES',
	DESELECT_NODES: 'DESELECT_NODES',
	ISOLATE_NODES: 'ISOLATE_NODES'
};

export interface INode {
	_id: string;
	shared_id: string;
	namespacedId: string;
	name: string;
	level: number;
	parentId: number;
	expandable: boolean;
	hasChildren: boolean;
	deepChildrenNumber: number;
	isFederation?: boolean;
	isModel?: boolean;
	defaultVisibility: string;
	childrenIds: string[];
	rootParentId?: string;
	type: string;
	subTreeRoots: string[];
}

export interface ITreeProcessingData {
	subModelsRootNodes: any;
	fullySelectedNodesIds: string[];
	visibilityMap: any;
	selectionMap: any;
	defaultVisibilityMap: any;
	nodesList: INode[];
	nodesIndexesMap: any;
	meshesByNodeId: any;
	nodesBySharedIdsMap: any;
}

export const DEFAULT_NODE_NAME = '(No Name)';
