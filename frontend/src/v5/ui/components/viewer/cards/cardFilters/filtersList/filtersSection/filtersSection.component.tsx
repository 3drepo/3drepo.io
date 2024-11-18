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

import { CardFilterOperator } from '../../cardFilters.types';
import { FilterChip } from '../../filterChip/filterChip.component';
import { Section } from './filtersSection.styles';

type FiltersSectionProps = {
	filters: Record<string, Record<string, any[]>>;
	onDeleteFilter: (property: string, operator: CardFilterOperator) => void;
};
export const FiltersSection = ({ filters, onDeleteFilter }: FiltersSectionProps) => {
	const filtersToChips = () => {
		const filterChips = [];
		Object.entries(filters).forEach(([property, operatorAndValues]) => {
			const moduleFilterChips = Object.entries(operatorAndValues).map(([operator, values]) => [property, operator, values]);
			filterChips.push(...moduleFilterChips);
		});
		return filterChips;
	};

	return (
		<Section>
			{filtersToChips().map(([property, operator, values]) => (
				<FilterChip
					key={`${property}.${operator}`}
					values={values}
					operator={operator}
					property={property}
					onDelete={() => onDeleteFilter(property, operator)}
				/>
			))}
		</Section>
	);
};
