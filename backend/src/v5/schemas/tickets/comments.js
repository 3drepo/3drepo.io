const { UUIDToString } = require('../../utils/helper/uuids');
const Yup = require('yup');

const Comments = {};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal));

Comments.serialiseComment = (comment) => {
	const caster = Yup.object({
		_id: uuidString,
		createdAt: Yup.number().transform((_, val) => val.getTime()),
		updatedAt: Yup.number().transform((_, val) => val.getTime()),
		images: Yup.array().of(uuidString),
		history: Yup.array().of(Yup.object({
			timestamp: Yup.number().transform((_, val) => val.getTime()),
			images: Yup.array().of(uuidString)
		})),
	});
	return caster.cast(comment);
};

module.exports = Comments;
