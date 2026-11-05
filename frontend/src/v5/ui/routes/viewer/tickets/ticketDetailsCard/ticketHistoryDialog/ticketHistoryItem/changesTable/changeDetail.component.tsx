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
import { isDateType } from '@components/viewer/cards/cardFilters/cardFilters.helpers';
import { difference, isNull } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { ChangeValue, ErrorMessage } from './changesTable.styles';
import { isArrayChange, isDescribableChange } from '../../ticketHistory.helpers';
import { formatDateTime } from '@/v5/helpers/intl.helper';

const parseValueOfType = (value, type) => {
	if (isDateType(type)) {
		return formatDateTime(value);
	}
	if (type === 'coords') {
		return null;
	}
	return value?.toString() ?? '';
};

export const ChangeDetail = ({ propertyName, change }) => {
	const template = TicketsCardHooksSelectors.selectSelectedTemplate();
	const propertyDef = findPropertyDefinition(template, propertyName);
	const { from, to } = change;
	const emptyValue = [from, to].findIndex((value) => isNull(value));
	const wasDeleted = emptyValue === 1;
	const wasAdded = emptyValue === 0;
	const wasChanged = !wasDeleted && !wasAdded;
	const isTitleChange = propertyName === 'title'; // title lacks a type

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
				defaultMessage="Deleted {from}" values={{ from: <ChangeValue>{parseValueOfType(from, propertyDef.type)}</ChangeValue> }} />;
		}
		// If value is complex return a generic deleted message
		return <FormattedMessage
			id="ticketHistory.changesTable.deleted.generic"
			defaultMessage="Deleted" />;
	} else if (wasAdded) {
		if (isDescribableChange(propertyDef.type)) {
			return <FormattedMessage
				id="ticketHistory.changesTable.set.specific"
				defaultMessage="Set to {to}" values={{ to: <ChangeValue>{parseValueOfType(to, propertyDef.type)}</ChangeValue> }} />;
		}
		// If value is complex return a generic set message
		return <FormattedMessage
			id="ticketHistory.changesTable.set.generic"
			defaultMessage="Value set" />;
	} else if (wasChanged) {
		if (isDescribableChange(propertyDef?.type) || isTitleChange) {
			if (isArrayChange(propertyDef?.type)) {
				const removed = difference(from, to).map((item) => parseValueOfType(item, propertyDef.type));
				const added = difference(to, from).map((item) => parseValueOfType(item, propertyDef.type));
				return (
					<>
						{removed.length > 0 && <FormattedMessage id="ticketHistory.changesTable.array.removed" defaultMessage="Removed {removed}" values={{ removed: <ChangeValue>{removed.join(', ')}</ChangeValue> }} />}
						{added.length > 0 && <FormattedMessage id="ticketHistory.changesTable.array.added" defaultMessage="Added {added}" values={{ added: <ChangeValue>{added.join(', ')}</ChangeValue> }} />}
					</>
				);
			}
			
			return <FormattedMessage
				id="ticketHistory.changesTable.changed.specific"
				defaultMessage="Changed from {from} to {to}"
				values={{
					from: <ChangeValue>{parseValueOfType(from, propertyDef?.type)}</ChangeValue>,
					to: <ChangeValue>{parseValueOfType(to, propertyDef?.type)}</ChangeValue>,
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