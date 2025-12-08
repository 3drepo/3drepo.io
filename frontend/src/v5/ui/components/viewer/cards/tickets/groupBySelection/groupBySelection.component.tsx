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

import { formatMessage } from '@/v5/services/intl';
import { SearchContext, SearchContextComponent, SearchContextType } from '@controls/search/searchContext';
import { Tooltip, PopoverOrigin, PopoverProps } from '@mui/material';
import { useContext } from 'react';
import { CardAction } from '../../cardAction/cardAction.styles';
import { CardFilterActionMenu } from '../../cardFilters/filterForm/filterForm.styles';
import { SearchInput, TicketsFiltersModalItem } from '../../cardFilters/filtersSelection/tickets/ticketFiltersSelection.styles';
import GroupByIcon from '@assets/icons/viewer/grouped_list.svg';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { getTemplatePropertiesDefinitions, groupByProperties } from '@/v5/store/tickets/tickets.helpers';
import { getPropertyLabel } from '@/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTable.helper';
import { uniq } from 'lodash';
import { ActionMenuItem } from '@controls/actionMenu';

const TriggerButton = ({ disabled }) =>
	(<Tooltip title={disabled ? '' : formatMessage({ id: 'viewer.card.tickets.addFilter', defaultMessage: 'Add Filter' })}>
		<CardAction disabled={disabled}>
			<GroupByIcon />
		</CardAction>
	</Tooltip>
	);

type ItemType = {
	value:string,
	name: string
};
const GroupByList = ({ onChange }) => {
	const { filteredItems } = useContext<SearchContextType<ItemType>>(SearchContext);
	return <>{
		filteredItems.map((item) => (
			<ActionMenuItem key={item.value} onClick={() => onChange(item.value)}>
				{item.name}
			</ActionMenuItem>
		))}</>;
};


export const GroupBySelection = ({ onChange }) => {
	const disabled = false;
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();
	const definitions = uniq(templates.flatMap(getTemplatePropertiesDefinitions));
	const items = uniq(groupByProperties(definitions)).map((value) => ({ value, name: getPropertyLabel(value) }))
		.sort((a, b) => {
			const fieldsCountA = a.name.split(':').length;
			const fieldsCountB = b.name.split(':').length;
			
			if (fieldsCountA !== fieldsCountB) {
				return fieldsCountA - fieldsCountB;
			}
			
			return a.name.localeCompare(b.name);
		});

	const anchorOrigin: PopoverOrigin = {
		vertical: 'bottom',
		horizontal: 'right',
	};
            
	const transformOrigin: PopoverOrigin = {
		vertical: 'top',
		horizontal: 'right',
	};

	const popoverProps: Partial<PopoverProps> = { anchorOrigin, transformOrigin, marginThreshold: 20 };

	return (
		<CardFilterActionMenu
			TriggerButton={<TriggerButton disabled={disabled} />}
			disabled={disabled}
			PopoverProps={popoverProps}
			$displayMode="card"
		>
			<SearchContextComponent items={items} fieldsToFilter={['name']}>
				<TicketsFiltersModalItem $visible>
					<SearchInput
						placeholder={formatMessage({
							id: 'viewer.card.tickets.filters.searchInputPlaceholder',
							defaultMessage: 'Search for property...',
						})}
					/>
				</TicketsFiltersModalItem>
				<GroupByList onChange={onChange} />
			</SearchContextComponent>
		</CardFilterActionMenu>
	);
};