import { uniqueId } from 'lodash';
import { ACTION_TYPES } from './treeProcessing.constants';
import { Processing } from './tree.service';
// tslint:disable-next-line
const TreeLoaderWorker = require('worker-loader?inline!./workers/loading.worker');
// tslint:disable-next-line
const TreeProcessingWorker = require('worker-loader?inline!./workers/processing.worker');

class TreeProcessing {
	private resolves = {} as any;
	private rejects = {} as any;

	private dataWorker = new TreeProcessingWorker();
	private loaderWorker;
	private processing: Processing;

	constructor() {
		this.dataWorker.addEventListener('message', this.handleDataResult, false);
		this.dataWorker.addEventListener('messageerror', this.handleError, false);
	}

	get data() {
		return this.processing || {};
	}

	get selectedNodesIds() {
		return this.processing ? this.processing.selectedNodesIds : [];
	}

	get visibilityMap() {
		return this.processing ? this.processing.visibilityMap : {};
	}

	get selectionMap() {
		return this.processing ? this.processing.selectionMap : {};
	}

	get invisibleNodesIds() {
		return this.processing ? this.processing.invisibleNodesIds : {};
	}

	public terminate = () => {
		this.dataWorker.terminate();
	}

	public callAction = (type, payload) => {
		const actionId = uniqueId(`${type}.`);

		return new Promise((resolve, reject) => {
			this.resolves[actionId] = resolve;
			this.rejects[actionId] = reject;
		});
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

	private handleDataResult = ({ data }) => {
		const { actionId, error, result } = JSON.parse(data);

		if (error) {
			const reject = this.rejects[actionId];
			reject(error);
		} else {
			const resolve = this.resolves[actionId];
			resolve(result);
		}

		delete this.resolves[actionId];
		delete this.rejects[actionId];
	}

	private handleTransformedData = async ({ data }) => {
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

		console.time('SET DATA REAL TIME');
		await this.callAction(ACTION_TYPES.SET_DATA, {
			nodesList,
			nodesIndexesMap: auxiliaryMaps.nodesIndexesMap,
			defaultVisibilityMap: auxiliaryMaps.nodesDefaultVisibilityMap,
			meshesByModelId: auxiliaryMaps.meshesByModelId,
			visibilityMap: auxiliaryMaps.nodesVisibilityMap,
			selectionMap: auxiliaryMaps.nodesSelectionMap,
			nodesBySharedIdsMap: auxiliaryMaps.nodesBySharedIdsMap
		});
		console.timeEnd('SET DATA REAL TIME')
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
