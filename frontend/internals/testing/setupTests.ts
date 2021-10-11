require("fake-indexeddb/auto");
import nock from 'nock';
import axios from 'axios';
import clientConfigMock from './clientConfig.mock';

axios.defaults.adapter = require('axios/lib/adapters/http');

nock.disableNetConnect();

let windowSpy;
const originalWindow = { ...window };

windowSpy = jest.spyOn(window, 'window', 'get');

windowSpy.mockImplementation(() => ({
	...originalWindow, // In case you need other window properties to be in place
	ClientConfig: clientConfigMock,
}));

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

afterAll(() => {
	windowSpy.mockRestore();
});
