/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { UUIDToString } = require('../../utils/helper/uuids');
const Validators = require('./validators');
const Yup = require('yup');
const { isUUIDString } = require('../../utils/helper/typeCheck');
const { propTypes } = require('./templates.constants');
const { types } = require('../../utils/helper/yup');

const Comments = {};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal));

const generateCommentSchema = (existingComment, isImport = false) => {
	const isNewComment = !existingComment;
	const history = existingComment?.history ?? [];
	const historyImages = history.flatMap(({ images }) => images ?? []);
	const currentImages = existingComment?.images ?? [];
	const acceptableRefs = [...new Set([...currentImages, ...historyImages])].map(UUIDToString);

	const schemaObj = {
		message: types.strings.longDescription,
		images: Yup.array().min(1).of(
			isNewComment
				? types.embeddedImage()
				: types.embeddedImageOrRef()
					.test('Image ref test', 'One or more image refs do not correspond to a current comment image ref',
						(value, { originalValue }) => !isUUIDString(originalValue)
								|| acceptableRefs.includes(originalValue)),
		),
		views: Validators.propTypesToValidator(propTypes.VIEW, !isNewComment, true, true),
	};

	if (isImport) {
		schemaObj.originalAuthor = types.strings.title.required();
		schemaObj.createdAt = types.dateInThePast.required();
	}

	return Yup.object().shape(schemaObj).test(
		'at-least-one-property',
		'You must provide at least a message, a set of images or a viewpoint',
		({ message, images, views }) => message || images || views,
	).required()
		.noUnknown();
};

Comments.importCommentSchema = generateCommentSchema(undefined, true);

Comments.validateComment = (newData, existingComment) => generateCommentSchema(existingComment).validate(newData);

Comments.serialiseComment = (comment) => {
	const caster = Yup.object({
		_id: uuidString,
		ticket: uuidString,
		createdAt: types.timestamp,
		updatedAt: types.timestamp,
		importedAt: types.timestamp,
		images: Yup.array().of(uuidString),
		history: Yup.array().of(Yup.object({
			timestamp: types.timestamp,
			images: Yup.array().of(uuidString),
		})),
	});
	return caster.cast(comment);
};

module.exports = Comments;
