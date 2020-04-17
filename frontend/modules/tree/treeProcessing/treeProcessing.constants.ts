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
