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

import { ViewpointGroupHierarchy } from '@/v5/store/tickets/tickets.types';
import { Select } from '@controls/inputs/select/select.component';
import { FormControl, InputLabel, MenuItem } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { uniqBy } from 'lodash';
import { MenuItemPrefix } from './groupsCollectionSelect.styles';

const NONE = formatMessage({
	id: 'ticketsGroupSettings.form.groupCollection.option.none',
	defaultMessage: 'None',
});

const getAllPrefixesCombinations = (hierarchies: ViewpointGroupHierarchy[]): string[][] => {
	const prefixes = hierarchies.map(({ prefix }) => (prefix)).filter(Boolean);
	const uniquePrefixes = uniqBy(prefixes, JSON.stringify);
	const allPrefixesWithDuplicates: string[][] = [];

	uniquePrefixes.forEach((prefix) => {
		const usedSegments: string[] = [];
		prefix.forEach((segment) => {
			allPrefixesWithDuplicates.push(usedSegments.concat(segment));
			usedSegments.push(segment);
		});
	});

	const allPrefixes = uniqBy(allPrefixesWithDuplicates, JSON.stringify);
	return allPrefixes.sort();
};

type GroupsCollectionSelectProps = {
	label: string,
	value?: string[];
	onChange?: (value: string[]) => void;
	hierarchies: ViewpointGroupHierarchy[];
};
export const GroupsCollectionSelect = ({ label, value = [], onChange, hierarchies }: GroupsCollectionSelectProps) => {
	const prefixesCombinations = getAllPrefixesCombinations(hierarchies);

	return (
		<FormControl>
			<InputLabel>{label}</InputLabel>
			<Select value={JSON.stringify(value)} onChange={(e) => onChange(JSON.parse(e.target.value))}>
				<MenuItem value={JSON.stringify([])}>{NONE}</MenuItem>
				{prefixesCombinations.map((prefix) => (
					<MenuItemPrefix
						key={JSON.stringify(prefix)}
						selected={JSON.stringify(prefix) === JSON.stringify(value)}
						value={JSON.stringify(prefix)}
						$depth={prefix.length - 1}
					>
						{/* @ts-ignore */}
						<span>{prefix.at(-1)}</span>
					</MenuItemPrefix>
				))}
			</Select>
		</FormControl>
	);
};
