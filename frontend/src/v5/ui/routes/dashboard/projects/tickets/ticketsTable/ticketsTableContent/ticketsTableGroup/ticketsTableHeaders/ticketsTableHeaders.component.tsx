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
import { TicketsTableHeader } from './ticketsTableHeader.component';
import { TicketsTableContext } from '../../../ticketsTableContext/ticketsTableContext';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { canBulkEditProperty } from '@/v5/store/tickets/tickets.helpers';

type TicketsTableHeadersProps = {
	ticketsIds: string[]
};

// The ticketsids refer to the group's tickets ids if the 
export const TicketsTableHeaders = ({ ticketsIds }: TicketsTableHeadersProps) => {
	const { visibleSortedColumnsNames } = useContextWithCondition(ResizableTableContext, ['visibleSortedColumnsNames']);
	const { selectedIds } = useContext(TicketsTableContext);

	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);

	const groupSelectedIds = new Set(ticketsIds.filter((id) => selectedIds.has(id)));

	return (
		<Headers>
			{visibleSortedColumnsNames.map((name) => (
				canBulkEditProperty(template, name) && groupSelectedIds.size > 0 ? 
					<TicketsTableHeaderBulkEdit key={name} name={name} groupSelectedIds={groupSelectedIds}/> : <TicketsTableHeader key={name} name={name} />
			))}
		</Headers>
	);
};