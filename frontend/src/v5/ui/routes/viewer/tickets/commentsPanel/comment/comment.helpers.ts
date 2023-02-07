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
import { CommentReplyMetadata, IComment } from '@/v5/store/tickets/tickets.types';
import _ from 'lodash';
import { clientConfigService } from '@/v4/services/clientConfig';

export const imageIsTooBig = (file): boolean => (file.size > clientConfigService.resourceUploadSizeLimit);

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

// Time related functions
const TIME_UNIT = {
	second: formatMessage({ id: 'timeUnit.second', defaultMessage: 'second' }),
	minute: formatMessage({ id: 'timeUnit.minute', defaultMessage: 'minute' }),
	hour: formatMessage({ id: 'timeUnit.hour', defaultMessage: 'hour' }),
	day: formatMessage({ id: 'timeUnit.day', defaultMessage: 'day' }),
	month: formatMessage({ id: 'timeUnit.month', defaultMessage: 'month' }),
	year: formatMessage({ id: 'timeUnit.year', defaultMessage: 'year' }),
};

export const getRelativeTime = (from: Date) => {
	let timeDifference = (new Date().getTime() - from.getTime()) / 1000;
	if (timeDifference < 60) return formatRelativeTime(-Math.ceil(timeDifference), TIME_UNIT.second);

	timeDifference /= 60;
	if (timeDifference < 60) return formatRelativeTime(-Math.ceil(timeDifference), TIME_UNIT.minute);

	timeDifference /= 60;
	if (timeDifference < 24) return formatRelativeTime(-Math.ceil(timeDifference), TIME_UNIT.hour);

	timeDifference /= 24;
	if (timeDifference < 30) return formatRelativeTime(-Math.ceil(timeDifference), TIME_UNIT.day);
	const daysDifference = timeDifference;

	timeDifference /= 30;
	if (timeDifference < 12) return formatRelativeTime(-Math.ceil(timeDifference), TIME_UNIT.month);

	return formatRelativeTime(-Math.ceil(daysDifference / 365), TIME_UNIT.year);
};
