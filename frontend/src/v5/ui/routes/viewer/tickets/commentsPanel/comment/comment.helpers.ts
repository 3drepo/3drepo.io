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

export const CHARS_LIMIT = 1200;

export const deletedCommentText = formatMessage({ id: 'ticket.comment.message.delete', defaultMessage: 'Message deleted' });

export const deletedOtherUserCommentTime = (name) => formatMessage({
	id: 'ticket.otherUser.comment.time.delete',
	defaultMessage: '{name} deleted this message',
}, { name });

export const deletedCurrentUserCommentTime = formatMessage({
	id: 'ticket.currentUser.comment.time.delete',
	defaultMessage: 'You deleted this message',
});

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
