export const ACTION_TYPES = {
	SET_DATA: 'SET_DATA',
	UPDATE_VISIBILITY: 'UPDATE_VISIBILITY',
	SELECT_NODES: 'SELECT_NODES',
	DESELECT_NODES: 'DESELECT_NODES',
	ISOLATE_NODES: 'ISOLATE_NODES'
};

export interface INode {
	_id: string;
	namespacedId: string;
	name: string;
	level: number;
	parentId: number;
	hasChildren: boolean;
	deepChildrenNumber: number;
	isFederation?: boolean;
	isModel?: boolean;
	shared_ids?: string[];
	defaultVisibility: string;
	childrenIds: string[];
}

export interface TreeProcessingData {
	selectedNodesIds: string[];
	visibilityMap: any;
	selectionMap: any;
	invisibleNodesIds: any;
	defaultVisibilityMap: any;
	nodesList: INode[];
	nodesIndexesMap: any;
	meshesByModelId: any;
	nodesBySharedIdsMap: any;
}
