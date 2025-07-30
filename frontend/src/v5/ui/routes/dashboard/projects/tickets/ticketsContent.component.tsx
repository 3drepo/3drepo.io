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

import { useEffect } from 'react';
import { Routes, Route, useParams  } from 'react-router-dom';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { TicketsTable } from './ticketsTable/ticketsTable.component';
import { TicketsSelection } from './ticketsSelection/ticketsSelection.component';
import { useContainersData } from '../containers/containers.hooks';
import { useFederationsData } from '../federations/federations.hooks';
import { EmptyPageView } from '../../../../components/shared/emptyPageView/emptyPageView.styles';
import { DashboardParams, TICKETS_ROUTE } from '../../../routes.constants';
import { TicketsAndResizableTableProvider } from './ticketsTable/ticketsAndResizableTableProvider.component';

export const TicketsContent = () => {
	const { teamspace, project } = useParams<DashboardParams>();
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const templatesArePending = ProjectsHooksSelectors.selectTemplatesArePending();
	const { isListPending: containersArePending, containers } = useContainersData();
	const { isListPending: federationsArePending, federations } = useFederationsData();
	const isLoadingModels = containersArePending || federationsArePending;
	const hasModels = !![...containers, ...federations].length;

	useEffect(() => {
		if (isLoadingModels || templates.length) return;
		ProjectsActionsDispatchers.fetchTemplates(teamspace, project);
	}, [isLoadingModels]);

	if (isLoadingModels || templatesArePending) return (<Loader />);

	if (!hasModels && !templatesArePending) {
		return (
			<EmptyPageView>
				<FormattedMessage
					id="ticketsTable.emptyModels"
					defaultMessage="This project is empty. Please, proceed to create a container or a federation to access this content."
				/>
			</EmptyPageView>
		);
	}

	if (hasModels && !templatesArePending && !templates.length) {
		return (
			<EmptyPageView>
				<FormattedMessage
					id="ticketsTable.emptyTemplates"
					defaultMessage="There are no templates available for this project."
				/>
			</EmptyPageView>
		);
	}

	return (
		<Routes>
			<Route path={TICKETS_ROUTE} element={
				<TicketsAndResizableTableProvider>
					<TicketsTable />
				</TicketsAndResizableTableProvider>
			} />
			<Route path="*" element={
				<TicketsSelection />
			} />
		</Routes>
	);
};
