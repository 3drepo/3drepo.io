import { uniqueId } from 'lodash';
import { ACTION_TYPES } from './treeProcessing.constants';
// tslint:disable-next-line
const TreeLoaderWorker = require('worker-loader?inline!./workers/loading.worker');
// tslint:disable-next-line
const TreeProcessingWorker = require('worker-loader?inline!./workers/processing.worker');

export default class TreeProcessing {
	private resolves = {} as any;
	private rejects = {} as any;

	private dataWorker = new TreeProcessingWorker();
	private loaderWorker;

	constructor() {
		this.dataWorker.addEventListener('message', this.handleDataResult, false);
		this.dataWorker.addEventListener('messageerror', this.handleError, false);
	}

	public terminate = () => {
		this.dataWorker.terminate();
	}

	public callAction = (type, payload) => {
		const actionId = uniqueId(`${type}.`);

		return new Promise((resolve, reject) => {
			this.resolves[actionId] = resolve;
			this.rejects[actionId] = reject;
			this.dataWorker.postMessage({ actionId, type, ...payload });
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

	public selectNodes = (payload) => this.callAction(ACTION_TYPES.SELECT_NODES, payload);

	public deselectNodes = (payload) => this.callAction(ACTION_TYPES.DESELECT_NODES, payload);

	public updateVisibility = (payload) => this.callAction(ACTION_TYPES.UPDATE_VISIBILITY, payload);

	public isolateNodes = (payload) => this.callAction(ACTION_TYPES.ISOLATE_NODES, payload);

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

		this.callAction(ACTION_TYPES.SET_DATA, {
			nodesList,
			nodesIndexesMap: auxiliaryMaps.nodesIndexesMap,
			defaultVisibilityMap: auxiliaryMaps.nodesDefaultVisibilityMap,
			meshesByModelId: auxiliaryMaps.meshesByModelId
		});
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
