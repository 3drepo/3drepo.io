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

import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '../../../../routes.constants';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsTableContextComponent } from './ticketsTableContext/ticketsTableContext';
import { ResizableTableContextComponent } from '@controls/resizableTableContext/resizableTableContext';
import { getAvailableColumnsForTemplate } from './ticketsTableContext/ticketsTableContext.helpers';

export const TicketsAndResizableTableProvider = ({ children }) => {
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const templatHasBeenFetched = templateAlreadyFetched(template);
	const columns = templatHasBeenFetched ? getAvailableColumnsForTemplate(template) : [];

	return (
		<TicketsTableContextComponent>
			<ResizableTableContextComponent columns={columns} columnGap={1} key={templateId + templatHasBeenFetched}>
				{children}
			</ResizableTableContextComponent>
		</TicketsTableContextComponent>
	);
};