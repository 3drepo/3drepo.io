import { has } from 'lodash';

self.addEventListener('message', ({ data }) => {
	const result = { data: 'test' };

 self.postMessage(JSON.stringify({result}));
}, false);
