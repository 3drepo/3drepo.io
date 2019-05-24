import { flattenDeep } from 'lodash';
import { VISIBILITY_STATES, SELECTION_STATES, BACKEND_VISIBILITY_STATES } from '../../constants/tree';


self.addEventListener('message', ({ data }) => {
	const { mainTree, subTrees, subModels, modelsWithMeshes } = data;

	// @ts-ignore
	self.postMessage(JSON.stringify({ result }));
}, false);
