const TreeProcessingWorker = require('worker-loader?inline!./workers/processing.worker');
import { uniqueId } from 'lodash';

const ACTION_TYPES = {
	SET_DATA: 'SET_DATA',
	PROCESS: 'PROCESS',
	UPDATE_VISIBILITY: 'UPDATE_VISIBILITY',
	SELECT_NODES: 'SELECT_NODES',
	DESELECT_NODES: 'DESELECT_NODES',
};

export default class TreeProcessing {
	private resolves = {};
	private rejects = {};

	private worker = new TreeProcessingWorker();

	constructor() {
		this.worker.addEventListener('message', this.handleResult, false);
		this.worker.addEventListener('messageerror', this.handleError, false);
	}

	public terminate = () => {
		this.worker.terminate();
	}

	public callAction = (type, payload) => {
		const actionId = uniqueId(`${type}.`);

		return new Promise((resolve, reject) => {
			this.resolves[actionId] = resolve;
			this.rejects[actionId] = reject;
			this.worker.postMessage({ actionId, type, ...payload });
		});
	}

	public selectNodes = (payload) => this.callAction(ACTION_TYPES.SELECT_NODES, payload);

	public deselectNodes = (payload) => this.callAction(ACTION_TYPES.DESELECT_NODES, payload);

	public updateVisibility = (payload) => this.callAction(ACTION_TYPES.UPDATE_VISIBILITY, payload);

	private handleResult = ({ data }) => {
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
