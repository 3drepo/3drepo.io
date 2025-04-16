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

import GearIcon from '@assets/icons/outlined/gear-outlined.svg';
import { ActionMenu } from '@controls/actionMenu';
import { SearchContext, SearchContextComponent } from '@controls/search/searchContext';
import { getColumnLabel } from '../../../ticketsTable.helper';
import { SearchInputContainer } from '@controls/searchSelect/searchSelect.styles';
import { MenuItem, IconContainer, SearchInput } from './columnsVisibilitySettings.styles';
import { Checkbox } from '@controls/inputs/checkbox/checkbox.component';
import { xor } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { matchesQuery } from '@controls/search/searchContext.helpers';
import { formatMessage } from '@/v5/services/intl';
import { Divider } from '@mui/material';

export const ColumnsVisibilitySettingsMenu = ({ newHiddenColumns, setNewHiddenColumns }) => {
	const { hiddenColumns, getAllColumnsNames } = useContext(ResizableTableContext);
	const columnsNames = getAllColumnsNames();
	const newVisibleColumnsCount = columnsNames.filter((c) => !newHiddenColumns.includes(c)).length;

	const onChange = (columnName) => setNewHiddenColumns(xor(newHiddenColumns, [columnName]));
	const isVisible = (columnName) => !newHiddenColumns.includes(columnName);
	const filteringFunction = (cols, query) => (
		cols.filter((col) => matchesQuery(getColumnLabel(col), query))
	);

	const modulePrefixRE = /modules\.([\w ]+\.)/;
	const getModule = (property = '') => modulePrefixRE.exec(property)?.[1];

	const shouldRenderDivider = (previousProperty, currentProperty) => {
		if (!previousProperty) return false;
		return getModule(currentProperty) !== getModule(previousProperty);
	};

	useEffect(() => {
		setNewHiddenColumns(hiddenColumns);
	}, []);

	return (
		<SearchContextComponent items={columnsNames} filteringFunction={filteringFunction}>
			<SearchInputContainer>
				<SearchInput
					placeholder={formatMessage({ id: 'ticketsTable.columnsVisibilitySettings.search.placeholder', defaultMessage: 'Search...' })}
				
				/>
			</SearchInputContainer>
			<SearchContext.Consumer>
				{({ filteredItems }) => filteredItems.map((columnName, i) => (
					<>
						{shouldRenderDivider(filteredItems[i - 1], columnName) && (<Divider />)}
						<MenuItem key={columnName}>
							<Checkbox
								disabled={newVisibleColumnsCount === 1 && isVisible(columnName)}
								onChange={() => onChange(columnName)}
								value={isVisible(columnName)}
								label={getColumnLabel(columnName)}
							/>
						</MenuItem>
					</>
				))}
			</SearchContext.Consumer>
		</SearchContextComponent>
	);
};

export const ColumnsVisibilitySettings = () => {
	const { setHiddenColumns } = useContext(ResizableTableContext);
	const [newHiddenColumns, setNewHiddenColumns] = useState([]);

	const onClose = () => setHiddenColumns(newHiddenColumns);

	return (
		<ActionMenu
			TriggerButton={(
				<IconContainer>
					<GearIcon />
				</IconContainer>
			)}
			PopoverProps={{
				transformOrigin: {
					vertical: 'top',
					horizontal: 'left',
				},
			}}
			onClose={onClose}
		>
			<ColumnsVisibilitySettingsMenu newHiddenColumns={newHiddenColumns} setNewHiddenColumns={setNewHiddenColumns} />
		</ActionMenu>
	);
};