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
import { COLUMN_NAME_TO_SETTINGS_FORMATTED_LABEL, getAllColumnsName, getAvailableColumnsForTemplate } from '../../../ticketsTable.helper';
import { SearchInputContainer } from '@controls/searchSelect/searchSelect.styles';
import { MenuItem, IconContainer, SearchInput } from './columnsVisibilitySettings.styles';
import { Checkbox } from '@controls/inputs/checkbox/checkbox.component';
import { xor } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { useParams } from 'react-router';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { matchesQuery } from '@controls/search/searchContext.helpers';

export const ColumnsVisibilitySettingsContent = ({ newHiddenColumns, setNewHiddenColumns }) => {
	const { hiddenColumns } = useContext(ResizableTableContext);
	const allColumns = getAllColumnsName();

	const onChange = (columnName) => setNewHiddenColumns(xor(newHiddenColumns, [columnName]));
	const isVisible = (columnName) => !newHiddenColumns.includes(columnName);

	useEffect(() => {
		setNewHiddenColumns(hiddenColumns);
	}, []);

	return (
		<>
			<SearchInputContainer>
				<SearchInput />
			</SearchInputContainer>
			<SearchContext.Consumer>
				{({ filteredItems }) => filteredItems.map((columnName) => (
					<MenuItem key={columnName}>
						<Checkbox
							disabled={(allColumns.length - newHiddenColumns.length) === 1 && isVisible(columnName)}
							onChange={() => onChange(columnName)}
							value={isVisible(columnName)}
							label={COLUMN_NAME_TO_SETTINGS_FORMATTED_LABEL[columnName]}
						/>
					</MenuItem>
				))}
			</SearchContext.Consumer>
		</>
	);
};
export const ColumnsVisibilitySettings = () => {
	const { setHiddenColumns } = useContext(ResizableTableContext);
	const [newHiddenColumns, setNewHiddenColumns] = useState([]);
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const columns = getAvailableColumnsForTemplate(template);

	const onClose = () => setHiddenColumns(newHiddenColumns);
	const filteringFunction = (cols, query) => (
		cols.filter((col) => matchesQuery(COLUMN_NAME_TO_SETTINGS_FORMATTED_LABEL[col], query))
	);

	return (
		<SearchContextComponent items={columns} filteringFunction={filteringFunction}>
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
				<ColumnsVisibilitySettingsContent newHiddenColumns={newHiddenColumns} setNewHiddenColumns={setNewHiddenColumns} />
			</ActionMenu>
		</SearchContextComponent>
	);
};