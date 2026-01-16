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
import { Headers } from './ticketsTableHeaders.styles';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { TicketsTableHeaderBulkEdit } from './ticketsTableHeaderBulkEdit/ticketsTableHeaderBulkEdit.component';
import { NON_BULK_EDITABLE_COLUMNS } from './ticketsTableHeaders.helpers';
import { TicketsTableHeader } from './ticketsTableHeader.component';
import { TicketsTableContext } from '../../../ticketsTableContext/ticketsTableContext';
import { useContext } from 'react';
import { findPropertyDefinition } from '@/v5/store/tickets/tickets.helpers';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { isSequencingProperty } from '@/v5/ui/routes/viewer/tickets/ticketsForm/propertiesList.component';

export const TicketsTableHeaders = () => {
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);
	const { selectedIds } = useContext(TicketsTableContext);

	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);

	const canBulkEditProperty = (name: string) => {
		const propDef = findPropertyDefinition(template, name);
		const isReadOnly = propDef?.readOnly || propDef?.readOnlyOnUI || propDef?.deprecated;
		return !NON_BULK_EDITABLE_COLUMNS.includes(name)
			&& selectedIds.size > 0
			&& !propDef?.immutable // cannot bulk edit immutable properties to prevent user error
			&& !propDef?.unique // user is unlikely to want to bulk edit unique properties and it will usually error
			&& !isSequencingProperty(name) // sequencing dates have complex rules (start must be before end), disallow bulk edit for now
			&& !isReadOnly;
	}
	
	return (
		<Headers>
			{visibleSortedColumnsNames.map((name) => (
				canBulkEditProperty(name) ? <TicketsTableHeaderBulkEdit key={name} name={name} /> : <TicketsTableHeader key={name} name={name} />
			))}
		</Headers>
	);
};