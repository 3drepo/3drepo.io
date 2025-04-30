require('fake-indexeddb/auto');
import * as nock from 'nock'
import axios from 'axios';
import clientConfigMock from './clientConfig.mock';
import { authBroadcastChannel } from '../../src/v5/store/auth/authBrodcastChannel';
axios.defaults.adapter = 'http';

nock.disableNetConnect();

(window as any).ClientConfig = clientConfigMock;

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
		console.log('Missing Nocks:', nock.pendingMocks())
		nockCleanup();
		throw new Error('Not all nock interceptors were used!');
	}
	nockCleanup();
});

afterAll(() => {
	authBroadcastChannel.close()
});
