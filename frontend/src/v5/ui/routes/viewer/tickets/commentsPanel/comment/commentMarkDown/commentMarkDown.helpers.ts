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

import { CommentReplyMetadata, IComment } from '@/v5/store/tickets/tickets.types';
import _ from 'lodash';

const extractMetadataValue = (comment: string, metadataName: keyof CommentReplyMetadata) => {
	// eslint-disable-next-line security/detect-non-literal-regexp
	const regex = new RegExp(`\\[${metadataName}\\]:- "([^"]*)"\\n`);
	return regex.exec(comment)?.[1] || '';
};

export const extractMetadata = (comment: string): CommentReplyMetadata => ({
	_id: extractMetadataValue(comment, '_id'),
	author: extractMetadataValue(comment, 'author'),
	comment: extractMetadataValue(comment, 'comment'),
});

export const extractMetadataFromObject = (comment: IComment): CommentReplyMetadata => (
	_.pick(comment, '_id', 'author', 'comment') as CommentReplyMetadata
);

export const extractComment = (comment: string) => comment.replaceAll(/\[[_a-z]*\]:- ".*"\n[\n]?/g, '');
export const parseComment = (comment: string) => comment.replaceAll('"', '&#34;').replaceAll('\n', '<br />');
export const stringifyComment = (comment: string) => comment.replaceAll('&#34;', '"').replaceAll('<br />', '\n');

const createMetadataValue = (metadataName: keyof CommentReplyMetadata, metadataValue: string) => (
	`[${metadataName}]:- "${metadataValue}"\n`
);

const stringifyMetadata = ({ author, _id, comment }: CommentReplyMetadata) => {
	const metadata = [
		createMetadataValue('_id', _id),
		createMetadataValue('author', author),
		createMetadataValue('comment', extractComment(comment)),
	];
	return metadata.join('');
};

export const addReply = (metadata: CommentReplyMetadata, newComment: string) => `${stringifyMetadata(metadata)}\n${newComment}`;
