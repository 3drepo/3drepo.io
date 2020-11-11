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

	public transformData = async (payload, setIsProcessed) => {
		const { nodesList, treePath, ...auxiliaryMaps } = await transformTree(payload) as any;
		this.processing = new Processing({
			nodesList,
			treePath,
			nodesIndexesMap: auxiliaryMaps.nodesIndexesMap,
			defaultVisibilityMap: auxiliaryMaps.nodesDefaultVisibilityMap,
			meshesByNodeId: auxiliaryMaps.meshesByNodeId,
			visibilityMap: auxiliaryMaps.nodesVisibilityMap,
			selectionMap: auxiliaryMaps.nodesSelectionMap,
			nodesBySharedIdsMap: auxiliaryMaps.nodesBySharedIdsMap,
			subModelsRootNodes: auxiliaryMaps.subModelsRootNodes
		});
		setIsProcessed(true);
		return { nodesList, treePath, auxiliaryMaps };
	}

	public selectNodes = (payload) => this.processing.selectNodes(payload);

	public deselectNodes = (payload) => this.processing.deselectNodes(payload);

	public updateVisibility = (payload) => this.processing.updateVisibility(payload);

	public showAllExceptMeshIDs = (ifcSpacesHidden, meshes) => {
		if (this.processing && this.processing.showAllExceptMeshIDs) {
			return this.processing.showAllExceptMeshIDs(ifcSpacesHidden, meshes);
		}
	}

	public isolateNodes = (payload) => this.processing.isolateNodes(payload);

	public getMeshesByNodeIds = (payload) => this.processing.getMeshesByNodeIds(payload);

	public clearSelected = () => this.processing.clearCurrentlySelected();

	public getParents = (node) => this.processing.getParentsByPath(node);

	public getParentsID = (node) => this.processing.getParentsID(node);

}

export default new TreeProcessing();
