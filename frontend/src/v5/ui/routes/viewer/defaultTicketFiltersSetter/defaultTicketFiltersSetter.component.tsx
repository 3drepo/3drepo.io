/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { uniq } from 'lodash';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ViewerParams } from '../../routes.constants';
import { Transformers, useSearchParam } from '../../useSearchParam';
import { CardFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { StatusValue } from '@/v5/store/tickets/tickets.types';
import { TicketStatusDefaultValues, TicketStatusTypes, TreatmentStatuses } from '@controls/chip/chip.types';
import { selectStatusConfigByTemplateId } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';

const TICKET_CODE_REGEX = /^[a-zA-Z]{3}:\d+$/;
export const DefaultTicketFiltersSetter = () => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const [ticketSearchParam, setTicketSearchParam] = useSearchParam('ticketSearch', Transformers.STRING_ARRAY);
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();

	const getTicketFiltersFromURL = (values): CardFilter[] => [{
		module: '',
		property: 'Ticket ID',
		type: 'ticketCode',
		filter: {
			operator: 'eq',
			values,
		},
	}];
	
	const getNonCompletedTicketFiltersByStatus = (): CardFilter => {
		const isCompletedValue = ({ type }: StatusValue) => [TicketStatusTypes.DONE, TicketStatusTypes.VOID].includes(type);
		const getValuesByTemplate = ({ _id }) => selectStatusConfigByTemplateId(getState(), containerOrFederation, _id).values;

		const completedValueNames = templates
			.flatMap(getValuesByTemplate)
			.filter(isCompletedValue)
			.map((v) => v.name);

		const values = uniq([
			TicketStatusDefaultValues.CLOSED,
			TicketStatusDefaultValues.VOID,
			...completedValueNames,
		]);

		return {
			module: '',
			property: 'Status',
			type: 'status',
			filter: {
				operator: 'nis',
				values,
			},
		};
	};
	const getNonCompletedTicketFiltersBySafetibase = (): CardFilter => ({
		module: 'safetibase',
		property: 'Treatment Status',
		type: 'oneOf',
		filter: {
			operator: 'nis',
			values: [
				TreatmentStatuses.REJECTED,
				TreatmentStatuses.VOID,
			],
		},
	});

	const getNonCompletedTicketFilters = (): CardFilter[] => {
		let filters = [getNonCompletedTicketFiltersByStatus()];
		const hasSafetibase = templates.some((t) => t?.modules?.some((module) => module.type === 'safetibase'));
		if (hasSafetibase) {
			filters.push(getNonCompletedTicketFiltersBySafetibase());
		}
		return filters;
	};

	useEffect(() => {
		if (templates.length) {
			const ticketCodes = ticketSearchParam.filter((query) => TICKET_CODE_REGEX.test(query)).map((q) => q.toUpperCase());
			const filters: CardFilter[] = ticketCodes.length ? getTicketFiltersFromURL(ticketCodes) : getNonCompletedTicketFilters();
			filters.forEach(TicketsCardActionsDispatchers.upsertFilter);
			setTicketSearchParam();
		}
	}, [templates.length]); 

	return <></>;
};
