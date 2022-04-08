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

const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');

const FileMissing = require(`${src}/services/mailer/templates/fileMissing`);

const testHtml = () => {
	describe('get fileMissing template html', () => {
		test('should get fileMissing template html', async () => {
			const data = {
				account: generateRandomString(),
				model: generateRandomString(),
				collection: generateRandomString(),
				refId: generateRandomString(),
				link: generateRandomString(),
				domain: generateRandomString(),
			};

			const res = await FileMissing.html(data);

			expect(res).toEqual(
				`Backup read from GridFS triggered:
<br>
account: ${data.account}
<br>
model: ${data.model}
<br>
collection: ${data.collection}
<br>
ref: ${data.refId}
<br>
link: ${data.link}
<br>
domain: ${data.domain}`,
			);
		});

		test('should get fileMissing template subject', async () => {
			const data = {
				domain: generateRandomString(),
			};

			const res = await FileMissing.subject(data);
			expect(res).toEqual(`[System][${data.domain}] Missing file from Fileshare detected`);
		});
	});
};

describe('services/mailer/templates/fileMissing', () => {
	testHtml();
});
