const { addComment, deleteComment, getCommentById, getCommentsByTicket, updateComment } = require('../../../../../models/tickets.comments');
const { storeFile } = require('../../../../../services/filesManager');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { generateUUID } = require('../../../../../utils/helper/uuids');
const { isBuffer } = require('../../../../../utils/helper/typeCheck');

const Comments = {};

const storeFiles = (teamspace, project, model, ticket, binaryData) => Promise.all(
	binaryData.map(({ ref, data }) => storeFile(
		teamspace, TICKETS_RESOURCES_COL, ref, data, { teamspace, project, model, ticket },
	)),
);

const processCommentImages = (images = []) => {
	const refsAndBinary = [];

	for (let i = 0; i < images.length; i++) {
		const data = images[i];

		if (isBuffer(data)) {
			const ref = generateUUID();
			refsAndBinary.push({ data, ref });
			// eslint-disable-next-line no-param-reassign
			images[i] = ref;
		}
	}

	return refsAndBinary;
};

Comments.addComment = async (teamspace, project, model, ticket, commentData, author) => {
	const refsAndBinary = processCommentImages(commentData.images);
	const res = await addComment(teamspace, project, model, ticket, commentData, author);
	await storeFiles(teamspace, project, model, ticket, refsAndBinary);
	return res;
};

Comments.updateComment = async (teamspace, project, model, ticket, oldComment, updateData) => {
	const refsAndBinary = processCommentImages(updateData.images);
	await updateComment(teamspace, oldComment, updateData);
	await storeFiles(teamspace, project, model, ticket, refsAndBinary);
};

Comments.deleteComment = deleteComment;

Comments.getCommentsByTicket = getCommentsByTicket;

Comments.getCommentById = getCommentById;

module.exports = Comments;
