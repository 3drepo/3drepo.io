import { mockedTreeFlatList } from '../../constants/tree';

self.addEventListener('message', ({ data }) => {
	const result = { data: mockedTreeFlatList };

 self.postMessage(JSON.stringify({result}));
}, false);
