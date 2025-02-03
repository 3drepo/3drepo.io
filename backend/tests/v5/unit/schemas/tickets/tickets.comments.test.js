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

const { readFileSync } = require('fs');
const { src, image } = require('../../../helper/path');
const { determineTestGroup, generateRandomString, generateUUIDString } = require('../../../helper/services');

const CommentSchema = require(`${src}/schemas/tickets/tickets.comments`);

const testValidateComment = () => {
	const existingRef = generateUUIDString();
	const existingRef2 = generateUUIDString();
	const existingComment = {
		message: generateRandomString(),
		author: generateRandomString(),
		images: [existingRef],
		history: [{ images: [existingRef2] }, { message: generateRandomString() }],
	};
	const viewComment = {
		camera: {
			position: [
				0,
				0,
				0,
			],
			up: [
				0,
				0,
				0,
			],
			forward: [
				0,
				0,
				0,
			],
			type: 'perspective',
		},
		clippingPlanes: [],
	};
	const invalidViewComment = {
		screenshot: [existingRef2],
		camera: {
			position: [
				0,
				0,
				0,
			],
			up: [
				0,
				0,
				0,
			],
			forward: [
				0,
				0,
				0,
			],
			type: 'perspective',
		},
		clippingPlanes: [],
	};
	describe.each([
		['with empty message (new comment)', false, { message: '' }],
		['with no object (undefined)', false, undefined],
		['with no object (null)', false, null],
		['with too long message (new comment)', false, { message: generateRandomString(1201) }],
		['with valid message (new comment)', true, { message: generateRandomString() }],
		['with invalid images (new comment)', false, { images: [] }],
		['with valid image (new comment)', true, { images: [readFileSync(image, { encoding: 'base64' })] }],
		['with empty body (new comment)', false, {}],
		['with empty message (update comment)', false, { message: '' }, existingComment],
		['with too long message (update comment)', false, { message: generateRandomString(1201) }, existingComment],
		['with valid message (update comment)', true, { message: generateRandomString() }, existingComment],
		['with invalid images (update comment)', false, { images: [] }, existingComment],
		['with valid image (update comment)', true, { images: [readFileSync(image, { encoding: 'base64' })] }, existingComment],
		['with empty body (update comment)', false, {}, existingComment],
		['with valid image refs (update comment)', true, { images: [existingRef, existingRef2] }, existingComment],
		['with valid image ref from history (update comment)', true, { images: [existingRef2] }, existingComment],
		['with invalid image ref (update comment)', false, { images: [generateUUIDString()] }, existingComment],
		['with both an image ref and a new message', true, { images: [existingRef2], message: generateRandomString() }, existingComment],
		['with just view', true, { views: viewComment }],
		['with just view and existing comment', true, { views: viewComment }, existingComment],
		['with view and image', true, { views: viewComment, images: [existingRef2] }],
		['with view and image with an existing comment', true, { views: viewComment, images: [existingRef2] }, existingComment],
		['with view and message', true, { views: viewComment, message: generateRandomString() }],
		['with view and message with an existing comment', true, { views: viewComment, message: generateRandomString() }, existingComment],
		['with view, image and message', true, { views: viewComment, images: [existingRef2], message: generateRandomString() }],
		['with view, image and message with an existing comment', true, { views: viewComment, images: [existingRef2], message: generateRandomString() }, existingComment],
		['with an invalid view without existing comments', false, { views: invalidViewComment }],
		['with an invalid view with existing comments', false, { views: invalidViewComment }, existingComment],
	])('Validate comment', (desc, success, newData, existingData) => {
		test(`should ${success ? 'succeed' : 'fail'} if ${desc}`, async () => {
			const test = expect(CommentSchema.validateComment(newData, existingData));
			if (success) {
				await test.resolves.not.toBeUndefined();
			} else {
				await test.rejects.not.toBeUndefined();
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateComment();
});
