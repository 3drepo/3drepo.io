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

const Yup = require('yup');
const { access } = require('fs/promises');
const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const Common = require(`${src}/services/mailer/templates/common`);

const testRenderTemplate = () => {
	describe('Rendering template', () => {
		test('should fail if template path doesn\'t exist', async () => {
			const fn = Common.generateTemplateFn(Yup.object({}));
			await expect(fn).rejects.toThrow();
		});
		test('should return with html string if all parameters are provided', async () => {
			const templatePath = `${src}/services/mailer/templates/html/baseTemplate.html`;
			await access(templatePath);
			const dataSchema = Yup.object({
				domain: Yup.string().required(),
				firstName: Yup.string().required(),
				emailContent: Yup.string().required(),
				extraStyles: Yup.string().default(''),
			}).required(true);

			const data = {
				firstName: generateRandomString(),
				domain: generateRandomString(),
				emailContent: generateRandomString(),
			};
			const fn = Common.generateTemplateFn(dataSchema, templatePath);
			const res = await fn(data);
			expect(isHtml(res)).toBe(true);
		});
	});
};

describe('services/mailer/templates/common', () => {
	testRenderTemplate();
});
