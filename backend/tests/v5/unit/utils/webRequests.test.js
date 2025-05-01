/**
 *  Copyright (C) 2022 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

jest.mock('axios');
const axios = require('axios');
const { src } = require('../../helper/path');
const Crypto = require('crypto');

// We can't use the one from service helper because mocking axios upsets
// frontegg, which is a dependence of something that is being imported in that file...
const generateRandomString = (length = 20) => Crypto.randomBytes(Math.ceil(length / 2.0)).toString('hex').substring(0, length);

const WebRequests = require(`${src}/utils/webRequests`);

const testGetRequest = () => {
	describe('Get request', () => {
		test('Should make a get request', async () => {
			const getResponse = generateRandomString();
			axios.get.mockResolvedValueOnce(getResponse);

			const uri = generateRandomString();
			const res = await WebRequests.get(uri);
			expect(res).toEqual(getResponse);
			expect(axios.get).toHaveBeenCalledTimes(1);
			expect(axios.get).toHaveBeenCalledWith(uri, {});
		});

		test('Should make a get request with headers', async () => {
			const getResponse = generateRandomString();
			axios.get.mockResolvedValueOnce(getResponse);

			const uri = generateRandomString();
			const headers = { Authorisation: `Bearer ${generateRandomString()}` };
			const res = await WebRequests.get(uri, headers);
			expect(res).toEqual(getResponse);
			expect(axios.get).toHaveBeenCalledTimes(1);
			expect(axios.get).toHaveBeenCalledWith(uri, { headers });
		});
	});
};

const testDeleteRequest = () => {
	describe('Delete request', () => {
		test('Should make a delete request', async () => {
			const deleteResponse = generateRandomString();
			axios.delete.mockResolvedValueOnce(deleteResponse);

			const uri = generateRandomString();
			const res = await WebRequests.delete(uri);
			expect(res).toEqual(deleteResponse);
			expect(axios.delete).toHaveBeenCalledTimes(1);
			expect(axios.delete).toHaveBeenCalledWith(uri, {});
		});

		test('Should make a delete request with headers', async () => {
			const deleteResponse = generateRandomString();
			axios.delete.mockResolvedValueOnce(deleteResponse);

			const uri = generateRandomString();
			const headers = { Authorisation: `Bearer ${generateRandomString()}` };
			const res = await WebRequests.delete(uri, headers);
			expect(res).toEqual(deleteResponse);
			expect(axios.delete).toHaveBeenCalledTimes(1);
			expect(axios.delete).toHaveBeenCalledWith(uri, { headers });
		});
	});
};

const testPostRequest = () => {
	describe('Post request', () => {
		test('Should make a post request with body params', async () => {
			const data = { someData: generateRandomString() };
			const uri = generateRandomString();
			await WebRequests.post(uri, data);
			expect(axios.post).toHaveBeenCalledTimes(1);
			expect(axios.post).toHaveBeenCalledWith(uri, data);
		});

		test('Should make a post request with query params', async () => {
			const config = { params: { someData: generateRandomString() } };
			const uri = generateRandomString();
			await WebRequests.post(uri, undefined, config);
			expect(axios.post).toHaveBeenCalledTimes(1);
			expect(axios.post).toHaveBeenCalledWith(uri, undefined, config);
		});
	});
};

const testPutRequest = () => {
	describe('Put request', () => {
		test('Should make a put request with body params', async () => {
			const data = { someData: generateRandomString() };
			const uri = generateRandomString();
			await WebRequests.put(uri, data);
			expect(axios.put).toHaveBeenCalledTimes(1);
			expect(axios.put).toHaveBeenCalledWith(uri, data);
		});

		test('Should make a put request with query params', async () => {
			const config = { params: { someData: generateRandomString() } };
			const uri = generateRandomString();
			await WebRequests.put(uri, undefined, config);
			expect(axios.put).toHaveBeenCalledTimes(1);
			expect(axios.put).toHaveBeenCalledWith(uri, undefined, config);
		});
	});
};

describe('utils/webRequests', () => {
	testGetRequest();
	testPostRequest();
	testPutRequest();
	testDeleteRequest();
});
