/**
 *  Copyright (C) 2026 3D Repo Ltd
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
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { findPropertyDefinition } from '@/v5/store/tickets/tickets.helpers';
import { isDateType, isSelectType, isTextType } from '@components/viewer/cards/cardFilters/cardFilters.helpers';
import { difference } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { ChangeValue, ErrorMessage } from '../ticketHistoryDialog.styles';
import { formatDate, formatTime } from '@/v5/services/intl';


export const ChangeDetail = ({ propertyName, change }) => {
	const template = TicketsCardHooksSelectors.selectSelectedTemplate();
	const propertyDef = findPropertyDefinition(template, propertyName);
	const { from, to } = change;
	const emptyValue = [from, to].findIndex((value) => !value?.length);
	const wasDeleted = emptyValue === 1;
	const wasAdded = emptyValue === 0;
	const wasChanged = !wasDeleted && !wasAdded;

	console.log('@@- propertyDef', propertyDef);
	if (!propertyDef?.type) {
		return (
			<ErrorMessage>
				<FormattedMessage
					id="ticketHistory.missingType"
					defaultMessage="Missing property type for {propertyName}" values={{ propertyName }} />
			</ErrorMessage>
		);
	}
	if (isDateType(propertyDef.type)) {
		const formattedDates = [from, to].map((date) => date ? formatDate(date) : '');
		const formattedTimes = [from, to].map((date) => date ? formatTime(date) : '');
		if (wasAdded) {
			return <FormattedMessage
				id="ticketHistory.date.setTo"
				defaultMessage="Set to {date} {time}"
				values={{ date: <ChangeValue>{formattedDates[1]}</ChangeValue>, time: <ChangeValue>{formattedTimes[1]}</ChangeValue> }}
			/>;
		} else if (wasDeleted) {
			return <FormattedMessage
				id="ticketHistory.date.deleted"
				defaultMessage="Deleted {date} {time}"
				values={{ date: <ChangeValue>{formattedDates[0]}</ChangeValue>, time: <ChangeValue>{formattedTimes[0]}</ChangeValue> }}
			/>;
		} else if (wasChanged) {
			if (formattedDates[0] === formattedDates[1]) {
				return <FormattedMessage
					id="ticketHistory.date.timeChanged"
					defaultMessage="Changed time from {from} to {to}"
					values={{ from: <ChangeValue>{formattedTimes[0]}</ChangeValue>, to: <ChangeValue>{formattedTimes[1]}</ChangeValue> }}
				/>;
			} else {
				return <FormattedMessage
					id="ticketHistory.date.changed"
					defaultMessage="Changed from {fromDate} {fromTime} to {toDate} {toTime}"
					values={{
						fromDate: <ChangeValue>{formattedDates[0]}</ChangeValue>,
						fromTime: <ChangeValue>{formattedTimes[0]}</ChangeValue>,
						toDate: <ChangeValue>{formattedDates[1]}</ChangeValue>,
						toTime: <ChangeValue>{formattedTimes[1]}</ChangeValue>
					}}
				/>;
			}
		}
	}
	if (propertyDef.type === 'coords') {
		if (wasAdded) {
			return <FormattedMessage
				id="ticketHistory.coords.setTo"
				defaultMessage="Pin set"/>;
		} else if (wasDeleted) {
			return <FormattedMessage
				id="ticketHistory.coords.deleted"
				defaultMessage="Deleted pin" />;
		} else if (wasChanged) {
			return <FormattedMessage
				id="ticketHistory.coords.setTo"
				defaultMessage="Changed pin location"/>;
		}
	}
	if (propertyDef.type === 'view') {
		return <>Object TODO</>
	}
	if (['imageList', 'image'].includes(propertyDef.type)) {
	}
	if (isSelectType(propertyDef.type)) {
		if (propertyDef.values === 'jobsAndUsers') {
		}
		const removed = difference(from, to);
		const added = difference(to, from);
		return (
			<>
				{removed.length > 0 && <FormattedMessage id="ticketHistory.select.removed" defaultMessage="Removed {removed}" values={{ removed: <ChangeValue>{removed.join(', ')}</ChangeValue> }} />}
				{added.length > 0 && <FormattedMessage id="ticketHistory.select.added" defaultMessage="Added {added}" values={{ added: <ChangeValue>{added.join(', ')}</ChangeValue> }} />}
			</>
		);
	}
	if (isTextType(propertyDef.type) || propertyDef.type === 'number' || propertyDef.type === 'boolean') {
		if (wasAdded) {
			return <FormattedMessage
				id="ticketHistory.default.setTo"
				defaultMessage="Set to {to}" values={{ to: <ChangeValue>{to.toString()}</ChangeValue> }} />;
		} else if (wasDeleted) {
			return <FormattedMessage
				id="ticketHistory.default.deleted"
				defaultMessage="Deleted {from}" values={{ from: <ChangeValue>{from.toString()}</ChangeValue> }} />;
		} else if (wasChanged) {
			return <FormattedMessage
				id="ticketHistory.default.setTo"
				defaultMessage="Changed from {from} to {to}" values={{ from: <ChangeValue>{from.toString()}</ChangeValue>, to: <ChangeValue>{to.toString()}</ChangeValue> }} />;
		}
	}
	return (
		<ErrorMessage>
			<FormattedMessage
				id="ticketHistory.unhandledType"
				defaultMessage="Unhandled property type: {type}" values={{ type: propertyDef.type }} />
		</ErrorMessage>
	);
};