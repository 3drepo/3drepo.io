import { Processing } from './processing';
import transformTree from './transforming';
import { ITreeProcessingData } from './treeProcessing.constants';

class TreeProcessing {
	private processing = {
		clearCurrentlySelected: Function.prototype
	} as Processing;

	get data() {
		return (this.processing || {}) as ITreeProcessingData;
	}

	public transformData = async (payload) => {
		const { nodesList, treePath, ...auxiliaryMaps } = await transformTree(payload) as any;
		this.processing = new Processing({
			nodesList,
			treePath,
			nodesIndexesMap: auxiliaryMaps.nodesIndexesMap,
			defaultVisibilityMap: auxiliaryMaps.nodesDefaultVisibilityMap,
			meshesByNodeId: auxiliaryMaps.meshesByNodeId,
			visibilityMap: auxiliaryMaps.nodesVisibilityMap,
			selectionMap: auxiliaryMaps.nodesSelectionMap,
			nodesBySharedIdsMap: auxiliaryMaps.nodesBySharedIdsMap
		});
		return { nodesList, treePath, auxiliaryMaps };
	}

	public selectNodes = (payload) => this.processing.selectNodes(payload);

	public deselectNodes = (payload) => this.processing.deselectNodes(payload);

	public updateVisibility = (payload) => this.processing.updateVisibility(payload);

	public showAllNodes = (ifcSpacesHidden) => this.processing.showAllNodes(ifcSpacesHidden);

	public isolateNodes = (payload) => this.processing.isolateNodes(payload);

	public clearSelected = () => this.processing.clearCurrentlySelected();

	public getParents = (node) => this.processing.getParentsByPath(node);

	public getParentsID = (node) => this.processing.getParentsID(node);

	public getChildren = (node) => this.processing.getChildren(node);
}

export default new TreeProcessing();
