import { Processing } from './processing';
import { ITreeProcessingData } from './treeProcessing.constants';
// tslint:disable-next-line
const TreeLoaderWorker = require('worker-loader?inline!./workers/loading.worker');

class TreeProcessing {
	private resolves = {} as any;
	private rejects = {} as any;
	private loaderWorker;
	private processing = {
		clearCurrentlySelected: Function.prototype
	} as Processing;

	get data() {
		return (this.processing) as ITreeProcessingData;
	}

	public transformData = (payload) => {
		this.loaderWorker = new TreeLoaderWorker();
		this.loaderWorker.addEventListener('message', this.handleTransformedData, false);
		this.loaderWorker.addEventListener('messageerror', this.handleError, false);

		return new Promise((resolve) => {
			this.resolves.transform = resolve;
			this.loaderWorker.postMessage(payload);
		});
	}

	public selectNodes = (payload) => this.processing.selectNodes(payload);

	public deselectNodes = (payload) => this.processing.deselectNodes(payload);

	public updateVisibility = (payload) => this.processing.updateVisibility(payload);

	public isolateNodes = (payload) => this.processing.isolateNodes(payload);

	public clearSelected = () => this.processing.clearCurrentlySelected();

	public getParents = (node) => this.processing.getParents(node);

	public getChildren = (node) => this.processing.getChildren(node);

	private handleTransformedData = ({ data }) => {
		const { result: { data: { nodesList, ...auxiliaryMaps } } } = JSON.parse(data);

		this.loaderWorker.terminate();
		const resolve = this.resolves.transform;
		resolve({ nodesList, auxiliaryMaps });
		delete this.resolves.transform;

		console.time('INIT TREE SERVICE');
		this.processing = new Processing({
			nodesList,
			nodesIndexesMap: {...auxiliaryMaps.nodesIndexesMap},
			defaultVisibilityMap: {...auxiliaryMaps.nodesDefaultVisibilityMap},
			meshesByModelId: {...auxiliaryMaps.meshesByModelId},
			visibilityMap: {...auxiliaryMaps.nodesVisibilityMap},
			selectionMap: {...auxiliaryMaps.nodesSelectionMap},
			nodesBySharedIdsMap: {...auxiliaryMaps.nodesBySharedIdsMap}
		});
		console.timeEnd('INIT TREE SERVICE');
	}

	private handleError = (e) => {
		// tslint:disable-next-line
		console.error('Worker error', e);

		for (const reject in this.rejects) {
			if (this.rejects.hasOwnProperty(reject)) {
				this.rejects[reject]();
			}
		}
	}
}

export default new TreeProcessing();
