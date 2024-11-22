/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { ActionMenu } from '@controls/actionMenu';
import { CardFilterOperator, CardFiltersByOperator } from '../cardFilters.types';
import { FilterChip } from '../filterChip/filterChip.component';
import { Section } from './filtersSection.styles';
import { FilterForm } from '../filterForm/filterForm.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { getFilterFormTitle } from '../cardFilters.helpers';

type FiltersSectionProps = {
	moduleName?: string;
	filters: Record<string, CardFiltersByOperator>;
	onDeleteFilter: (property: string, operator: CardFilterOperator) => void;
};
export const FiltersSection = ({ moduleName, filters, onDeleteFilter }: FiltersSectionProps) => {
	const filtersToChips = () => {
		const filterChips = [];
		Object.entries(filters).forEach(([property, operatorAndFilter]) => {
			const moduleFilterChips = Object.entries(operatorAndFilter).map(([operator, filter]) => [property, operator, filter]);
			filterChips.push(...moduleFilterChips);
		});
		return filterChips;
	};

	return (
		<Section>
			{filtersToChips().map(([property, operator, filter]) => (
				<ActionMenu key={`${property}.${operator}`} TriggerButton={(
					<FilterChip
						{...filter}
						operator={operator}
						property={property}
						onDelete={() => onDeleteFilter(property, operator)}
					/>
				)}>
					<ActionMenuContext.Consumer>
						{({ close }) => (
							<FilterForm
								onCancel={close}
								// TODO - call onEditFilter or smth alike
								onSubmit={close}
								title={getFilterFormTitle([moduleName, property])}
								{...filter}
								operator={operator}
							/>
						)}
					</ActionMenuContext.Consumer>
				</ActionMenu>
			))}
		</Section>
	);
};
