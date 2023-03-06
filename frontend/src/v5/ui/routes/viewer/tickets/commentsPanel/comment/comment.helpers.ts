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

import { formatMessage } from '@/v5/services/intl';
import { CommentReplyMetadata, IComment } from '@/v5/store/tickets/tickets.types';
import _ from 'lodash';

// Message metadata and text functions
export const MAX_MESSAGE_LENGTH = 1200;
export const deletedCommentMessage = formatMessage({ id: 'ticket.comment.message.deleted', defaultMessage: 'Message deleted' });
export const editedCommentMessage = formatMessage({ id: 'ticket.comment.message.edited', defaultMessage: 'edited' });

const extractMetadataValue = (message: string, metadataName: keyof CommentReplyMetadata) => {
	// eslint-disable-next-line security/detect-non-literal-regexp
	const regex = new RegExp(`\\[${metadataName}\\]:- "([^"]*)"\\n`);
	return regex.exec(message)?.[1] || '';
};

export const extractMetadata = (message: string): CommentReplyMetadata => ({
	_id: extractMetadataValue(message, '_id'),
	author: extractMetadataValue(message, 'author'),
	message: extractMetadataValue(message, 'message'),
});

export const createMetadata = (comment: IComment): CommentReplyMetadata => (
	_.pick(comment, '_id', 'author', 'message') as CommentReplyMetadata
);

export const extractMessage = (message: string) => message.replaceAll(/\[[_a-z]*\]:- ".*"\n[\n]?/g, '');
export const sanitiseMessage = (message: string) => message.replaceAll('"', '&#34;').replaceAll('\n', '<br />');
export const desanitiseMessage = (message: string) => message.replaceAll('&#34;', '"').replaceAll('<br />', '\n');

const createMetadataValue = (metadataName: keyof CommentReplyMetadata, metadataValue: string) => (
	`[${metadataName}]:- "${metadataValue}"\n`
);

const stringifyMetadata = ({ author, _id, message }: CommentReplyMetadata) => {
	const metadata = [
		createMetadataValue('_id', _id),
		createMetadataValue('author', author),
		createMetadataValue('message', extractMessage(message)),
	];
	return metadata.join('');
};

export const addReply = (metadata: CommentReplyMetadata, newMessage: string) => `${stringifyMetadata(metadata)}\n${newMessage}`;
