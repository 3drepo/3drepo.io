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
import { findPropertyDefinition } from '@/v5/store/tickets/tickets.helpers';
import { difference, isNull } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { ChangeValue, ErrorMessage } from './changesTable.styles';
import { isArrayChange, isDateChange, isDescribableChange } from '../../ticketHistory.helpers';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { ITemplate, TicketChange } from '@/v5/store/tickets/tickets.types';
import { JobOrUserValue } from './jobOrUserValue.component';

type ChangeDetailProps = {
	propertyName: string;
	change: TicketChange;
	template: ITemplate;
};

const Value = ({ value, propertyDef }) => {
	if (propertyDef?.values === 'jobsAndUsers') {
		return <JobOrUserValue jobOrUserId={value} />;
	}
	if (isDateChange(propertyDef?.type)) {
		return <ChangeValue>{formatDateTime(value)}</ChangeValue>;
	}
	return <ChangeValue>{value?.toString() ?? ''}</ChangeValue>;
};

const CommaSeparatedList = ({ value, propertyDef }) =>{
	if (!isArrayChange(propertyDef?.type)) return <Value value={value} propertyDef={propertyDef} />;
	return (
		<>
			{value.reduce((acc, item, index) => {
				acc.push(<Value key={`value-${index}`} value={item} propertyDef={propertyDef} />);
				if (index < value.length - 1) {
					acc.push(<span key={`comma-${index}`}>,&nbsp;</span>);
				}
				return acc;
			}, [])}
		</>
	);
};

export const ChangeDetail = ({ propertyName, change, template }: ChangeDetailProps) => {
	const propertyDef = findPropertyDefinition(template, propertyName);
	const { from, to } = change;
	const emptyValue = [from, to].findIndex((value) => isNull(value)
		|| (isDateChange(propertyDef?.type) && !value)); // Unset dates can have a value of 0
	const wasDeleted = emptyValue === 1;
	const wasAdded = emptyValue === 0;
	const wasChanged = !wasDeleted && !wasAdded;
	const isTitleChange = propertyName === 'title'; // title property lacks a type

	if (!propertyDef?.type && !isTitleChange) {
		return (
			<ErrorMessage>
				<FormattedMessage
					id="ticketHistory.changesTable.missingType"
					defaultMessage="Missing property type for {propertyName}" values={{ propertyName }} />
			</ErrorMessage>
		);
	}

	if (wasDeleted) {
		if (isDescribableChange(propertyDef.type)) {
			return <FormattedMessage
				id="ticketHistory.changesTable.deleted.specific"
				defaultMessage="Deleted&nbsp;{from}" values={{ from: <CommaSeparatedList value={from} propertyDef={propertyDef} /> }} />;
		}
		// If value is complex return a generic deleted message
		return <FormattedMessage
			id="ticketHistory.changesTable.deleted.generic"
			defaultMessage="Deleted" />;
	} else if (wasAdded) {
		if (isDescribableChange(propertyDef.type)) {
			return <FormattedMessage
				id="ticketHistory.changesTable.set.specific"
				defaultMessage="Set to&nbsp;{to}" values={{ to: <CommaSeparatedList value={to} propertyDef={propertyDef} /> }} />;
		}
		// If value is complex return a generic set message
		return <FormattedMessage
			id="ticketHistory.changesTable.set.generic"
			defaultMessage="Value set" />;
	} else if (wasChanged) {
		if (isDescribableChange(propertyDef?.type) || isTitleChange) {
			if (isArrayChange(propertyDef?.type)) {
				const removed = difference(from, to);
				const added = difference(to, from);
				return (
					<>
						{removed.length > 0 &&
							<FormattedMessage
								id="ticketHistory.changesTable.array.removed"
								defaultMessage="Removed&nbsp;{removed}&nbsp;"
								values={{ removed: <CommaSeparatedList value={removed} propertyDef={propertyDef} /> }} />}
						{added.length > 0 &&
							<FormattedMessage
								id="ticketHistory.changesTable.array.added"
								defaultMessage="Added&nbsp;{added}"
								values={{ added: <CommaSeparatedList value={added} propertyDef={propertyDef} /> }} />}
					</>
				);
			}
			
			return <FormattedMessage
				id="ticketHistory.changesTable.changed.specific"
				defaultMessage="Changed from&nbsp;{from}&nbsp;to&nbsp;{to}"
				values={{
					from: <Value value={from} propertyDef={propertyDef} />,
					to: <Value value={to} propertyDef={propertyDef} />,
				}}
			/>;
		}
		// If value is complex return a generic change message
		return <FormattedMessage
			id="ticketHistory.changesTable.change.generic"
			defaultMessage="Value changed" />;
	}
	
	return (
		<ErrorMessage>
			<FormattedMessage
				id="ticketHistory.changesTable.unhandledType"
				defaultMessage="Unhandled property type: {type}" values={{ type: propertyDef.type }} />
		</ErrorMessage>
	);
};
