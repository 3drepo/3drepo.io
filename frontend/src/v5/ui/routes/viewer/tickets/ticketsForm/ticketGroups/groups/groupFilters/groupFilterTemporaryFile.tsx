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

import { FormattedMessage } from 'react-intl';
import CrossIcon from '@assets/icons/outlined/close-outlined.svg';
import { useFieldArray, useForm } from 'react-hook-form';
import { EmptyCardMessage } from '@components/viewer/cards/card.styles';
import { useState } from 'react';
import { IFilter, OPERATION_DISPLAY_NAMES } from '../groupFiltersForm/groupFiltersForm.helpers';
import { GroupFiltersForm } from '../groupFiltersForm/groupFiltersForm.component';
import { ChipWrapper, EditFilterActionMenu, FilterChip, Filters, NewFilterActionMenu, TriggerButton } from './groupFilters.styles';

export const GroupFiltersWithTriggerButton = () => {
	const [selectedChip, setSelectedChip] = useState<number>(null);
	const defaultFilters: IFilter[] = [
		{
			field: 'Analytical Properties:Absorptance',
			operation: 'CONTAINS',
			values: ['1', '34'],
		},
		{
			field: 'Absorptance',
			operation: 'EXISTS',
			values: [],
		},
		{
			field: 'Absorptance',
			operation: 'REGEX',
			values: ['/\d.*{e}+$/'],
		},
	];
	// TODO - replace with useFormContext
	const { control } = useForm({
		defaultValues: { filters: defaultFilters },
	});
	const { fields: filters, append, remove, update } = useFieldArray({
		control,
		name: 'filters',
	});

	return (
		<>
			<NewFilterActionMenu
				TriggerButton={(
					<TriggerButton>
						<FormattedMessage id="tickets.groups.addFilter" defaultMessage="Add filter" />
					</TriggerButton>
				)}
			>
				<GroupFiltersForm onSave={append} />
			</NewFilterActionMenu>
			<Filters>
				{filters.map((filter, i) => (
					<EditFilterActionMenu
						key={filter.id}
						onOpen={() => setSelectedChip(i)}
						onClose={() => setSelectedChip(null)}
						TriggerButton={(
							<ChipWrapper>
								<FilterChip
									label={(
										<>
											{filter.field}
											&nbsp;{OPERATION_DISPLAY_NAMES[filter.operation]}
											{!!filter.values?.length && (<b>&nbsp;{filter.values.join()}</b>)}
										</>
									)}
									deleteIcon={<CrossIcon />}
									onDelete={() => remove(i)}
									$selected={selectedChip === i}
								/>
							</ChipWrapper>
						)}
					>
						<GroupFiltersForm filter={filter} onSave={(updatedFilter) => update(i, updatedFilter)} />
					</EditFilterActionMenu>
				))}
			</Filters>
			{!filters.length && (
				<EmptyCardMessage>
						<FormattedMessage id="tickets.groups.filters.empty" defaultMessage="No filters" />
					</EmptyCardMessage>
			)}
		</>
	);
};
