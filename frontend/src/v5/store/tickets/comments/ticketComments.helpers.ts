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
import { formatInfoUnit } from '@/v5/helpers/intl.helper';
import { clientConfigService } from '@/v4/services/clientConfig';
import { stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { TicketCommentReplyMetadata, ITicketComment } from './ticketComments.types';

export const IMAGE_MAX_SIZE_MESSAGE = formatInfoUnit(clientConfigService.resourceUploadSizeLimit);
export const imageIsTooBig = (file): boolean => (file.size > clientConfigService.resourceUploadSizeLimit);

// Message metadata and text functions
export const MAX_MESSAGE_LENGTH = 1200;
export const deletedCommentMessage = formatMessage({ id: 'customTicket.comment.message.deleted', defaultMessage: 'Message deleted' });
export const editedCommentMessage = formatMessage({ id: 'customTicket.comment.message.edited', defaultMessage: 'edited' });

const extractMetadataValue = (message: string, metadataName: keyof TicketCommentReplyMetadata) => {
	// eslint-disable-next-line security/detect-non-literal-regexp
	const regex = new RegExp(`\\[${metadataName}\\]:- "([^"]*)"\\n`);
	return regex.exec(message)?.[1] || '';
};

const extractMetadataImages = (message: string) => {
	const images = extractMetadataValue(message, 'images');
	return images ? images.split(',') : [];
};

export const extractMetadata = (message: string): TicketCommentReplyMetadata => ({
	_id: extractMetadataValue(message, '_id'),
	author: extractMetadataValue(message, 'author'),
	originalAuthor: extractMetadataValue(message, 'originalAuthor'),
	message: extractMetadataValue(message, 'message'),
	images: extractMetadataImages(message),
	view: extractMetadataValue(message, 'view') === 'true',
});

export const stripMetadata = (message: string = '') => message.replaceAll(/\[[_a-zA-Z]*\]:- "([^"]*)"(\n)+/g, '');
export const sanitiseMessage = (message: string = '') => message.replaceAll('"', '&#34;');
export const desanitiseMessage = (message: string = '') => message.replaceAll('&#34;', '"');

const createMetadataValue = (metadataName: keyof TicketCommentReplyMetadata, metadataValue: string) => (
	`[${metadataName}]:- "${metadataValue}"\n`
);

const stringifyMetadata = ({ originalAuthor = '', author, _id, message, images = [], view = false }: TicketCommentReplyMetadata) => {
	const metadata = [
		createMetadataValue('_id', _id),
		createMetadataValue('originalAuthor', originalAuthor),
		createMetadataValue('author', author),
		createMetadataValue('message', stripMetadata(message)),
		createMetadataValue('images', images.join(',')),
		createMetadataValue('view', `${!!view}`), // reduces metadata size. For comment replies only need to know if a view exists
	];
	return metadata.join('');
};

export const addReply = (metadata: TicketCommentReplyMetadata, newMessage: string) => `${stringifyMetadata(metadata)}\n${newMessage}`;

export const parseMessageAndImages = (inputComment: Partial<ITicketComment>) => {
	const comment = { ...inputComment };
	if (!comment.message) {
		delete comment.message;
	}
	if (!comment.images?.length) {
		delete comment.images;
	} else {
		comment.images = comment.images.map(stripBase64Prefix);
	}
	return comment;
};
