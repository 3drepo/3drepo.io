import { Processing } from './processing';
import transformTree from './transforming';
import { ITreeProcessingData } from './treeProcessing.constants';

class TreeProcessing {
	private processing: Processing;

	get data() {
		return (this.processing || {}) as ITreeProcessingData;
	}

	public transformData = async (payload) => {
		const { nodesList, ...auxiliaryMaps } = await transformTree(payload) as any;

		console.time('INIT TREE SERVICE');
		this.processing = new Processing({
			nodesList,
			nodesIndexesMap: { ...auxiliaryMaps.nodesIndexesMap },
			defaultVisibilityMap: { ...auxiliaryMaps.nodesDefaultVisibilityMap },
			meshesByModelId: { ...auxiliaryMaps.meshesByModelId },
			visibilityMap: { ...auxiliaryMaps.nodesVisibilityMap },
			selectionMap: { ...auxiliaryMaps.nodesSelectionMap },
			nodesBySharedIdsMap: { ...auxiliaryMaps.nodesBySharedIdsMap }
		});
		console.timeEnd('INIT TREE SERVICE');
		return { nodesList, auxiliaryMaps };
	}

	public selectNodes = (payload) => this.processing.selectNodes(payload);

	public deselectNodes = (payload) => this.processing.deselectNodes(payload);

	public updateVisibility = (payload) => this.processing.updateVisibility(payload);

	public isolateNodes = (payload) => this.processing.isolateNodes(payload);

	public clearSelected = () => this.processing.clearCurrentlySelected();

	public getParents = (node) => this.processing.getParents(node);

	public getChildren = (node) => this.processing.getChildren(node);
}

export default new TreeProcessing();
