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

import { IComment } from '@/v5/store/tickets/tickets.types';

const breakLine = (textBeforeLineBreak, textAfterLineBreak) => `${textBeforeLineBreak}\n\n${textAfterLineBreak}`;

export type Metadata = {
	author: string,
	referenceId: string,
	reply: string,
};

const addMetadataValue = (comment: string, metadataName: keyof Metadata, metadataValue: string) => (
	`[${metadataName}]:- ${metadataValue}\n${comment}`
);

const replyToMetadata = (text: string) => text.replace("\n", "<br />");
const metadataToReply = (text: string) => text.replace("<br />", "\n");

export const addMetadata = (comment: string, { author, referenceId, reply }: Metadata) => {
	let metadata = addMetadataValue(comment, 'author', author);
	metadata = addMetadataValue(metadata, 'referenceId', referenceId);
	metadata = addMetadataValue(metadata, 'reply', replyToMetadata(reply));
	return metadata;
};

const getMetadataValue = (comment, metadataName) => {
	const regex = new RegExp(`\\[${metadataName}\\]:- (.*)`);
	const line = regex.exec(comment);
	if (line?.[1]) return line[1];
	return '';
};

export const getMetadata = (comment: string): Metadata => ({
	author: getMetadataValue(comment, 'author'),
	referenceId: getMetadataValue(comment, 'referenceId'),
	reply: metadataToReply(getMetadataValue(comment, 'reply')),
})

export const addAuthor = (author, comment) => breakLine(`# ${author}`, comment);

export const addReply = ({ comment, author, _id }: IComment, newComment: string) => {
	const reply = addMetadata(newComment, {
		author,
		reply: comment,
		referenceId: _id,
	});
	return breakLine(reply, newComment);
};

export const destructureComment = (comment: string) => {
	const commentElements = {
		id: comment.match(/\!\[\dCommentReference\]\([]\)/),
		author: '',
		reply: '',
		message: '',
	};

	const lines = comment.split("\n");
	commentElements.author = lines.shift();
	const commentMessage = [];
	for (const line of comment.split("\n").reverse()) {
		if (line.startsWith(">")) {
			commentElements.reply = lines.reverse().join("\n");
			break;
		}
		commentMessage.push(lines.pop());
	}
	commentElements.message = commentMessage.reverse().join("\n");

	return commentElements;
}