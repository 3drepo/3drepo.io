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

import { formatMessage, formatRelativeTime } from '@/v5/services/intl';
import { formatInfoUnit } from '@/v5/helpers/intl.helper';
import _ from 'lodash';
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
	message: extractMetadataValue(message, 'message'),
	images: extractMetadataImages(message),
});

export const createMetadata = (comment: ITicketComment): TicketCommentReplyMetadata => (
	_.pick(comment, '_id', 'author', 'message', 'images') as TicketCommentReplyMetadata
);

export const stripMetadata = (message: string = '') => message.replaceAll(/\[[_a-z]*\]:- "([^"]*)"(\n)+/g, '');
export const sanitiseMessage = (message: string = '') => message.replaceAll('"', '&#34;');
export const desanitiseMessage = (message: string = '') => message.replaceAll('&#34;', '"');

const createMetadataValue = (metadataName: keyof TicketCommentReplyMetadata, metadataValue: string) => (
	`[${metadataName}]:- "${metadataValue}"\n`
);

const stringifyMetadata = ({ author, _id, message, images = [] }: TicketCommentReplyMetadata) => {
	const metadata = [
		createMetadataValue('_id', _id),
		createMetadataValue('author', author),
		createMetadataValue('message', stripMetadata(message)),
		createMetadataValue('images', images.join(',')),
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

// Time related functions
const TIME_UNIT = {
	second: formatMessage({ id: 'timeUnit.second', defaultMessage: 'second' }),
	minute: formatMessage({ id: 'timeUnit.minute', defaultMessage: 'minute' }),
	hour: formatMessage({ id: 'timeUnit.hour', defaultMessage: 'hour' }),
	day: formatMessage({ id: 'timeUnit.day', defaultMessage: 'day' }),
	month: formatMessage({ id: 'timeUnit.month', defaultMessage: 'month' }),
	year: formatMessage({ id: 'timeUnit.year', defaultMessage: 'year' }),
};

export const getRelativeTime = (from: Date | number) => {
	let timeDifference = ((new Date().getTime() - new Date(from).getTime()) / 1000) + 1;
	if (timeDifference < 60) return formatRelativeTime(-Math.floor(timeDifference), TIME_UNIT.second);

	timeDifference /= 60;
	if (timeDifference < 60) return formatRelativeTime(-Math.floor(timeDifference), TIME_UNIT.minute);

	timeDifference /= 60;
	if (timeDifference < 24) return formatRelativeTime(-Math.floor(timeDifference), TIME_UNIT.hour);

	timeDifference /= 24;
	if (timeDifference < 30) return formatRelativeTime(-Math.floor(timeDifference), TIME_UNIT.day);
	const daysDifference = timeDifference;

	timeDifference /= 30;
	if (timeDifference < 12) return formatRelativeTime(-Math.floor(timeDifference), TIME_UNIT.month);

	return formatRelativeTime(-Math.floor(daysDifference / 365), TIME_UNIT.year);
};
