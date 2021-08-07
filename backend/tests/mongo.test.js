/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { MongoClient } = require('mongodb');

describe('insert', () => {
	let connection;
	let db;

	beforeAll(async () => {
		connection = await MongoClient.connect(process.env.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		db = await connection.db();
	});

	afterAll(async () => {
		await connection.close();
	});

	it('should insert a doc into collection', async () => {
		const users = db.collection('users');

		const mockUser = { _id: 'some-user-id', name: 'John' };
		await users.insertOne(mockUser);

		const insertedUser = await users.findOne({ _id: 'some-user-id' });
		expect(insertedUser).toEqual(mockUser);
	});
});
