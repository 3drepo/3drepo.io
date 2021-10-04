require('fake-indexeddb/auto');
const nock = require('nock');
import axios from 'axios';
import clientConfigMock from './clientConfig.mock';

axios.defaults.adapter = require('axios/lib/adapters/http');

nock.disableNetConnect();

(window as any).ClientConfig = clientConfigMock;

beforeAll(() => {
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
	if (!nock.isActive()) {
		nock.activate();
	}
});

const nockCleanup = () => {
	nock.cleanAll();
	nock.restore();
};

afterEach(() => {
	if (!nock.isDone()) {
		nockCleanup();
		throw new Error('Not all nock interceptors were used!');
	}
	nockCleanup();
});
