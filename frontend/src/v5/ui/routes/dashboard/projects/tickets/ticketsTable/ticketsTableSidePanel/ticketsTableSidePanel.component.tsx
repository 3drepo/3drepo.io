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

import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { useParams, generatePath } from 'react-router-dom';
import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import { CircleButton } from '@controls/circleButton';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme } from '@/v5/ui/routes/viewer/theme';
import { TicketContextComponent } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { DashboardTicketsParams, VIEWER_ROUTE } from '../../../../../routes.constants';
import { Link, SidePanel, SlidePanelHeader, OpenInViewerButton } from './ticketsTableSidePanel.styles';
import { NEW_TICKET_ID, SetTicketValue } from '../ticketsTable.helper';
import { NewTicketSlide } from '../../ticketsList/slides/newTicketSlide.component';
import { TicketSlide } from '../../ticketsList/slides/ticketSlide.component';
import { useSelectedModels } from '../newTicketMenu/useSelectedModels';
import { memo, useContext, useEffect, useState } from 'react';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsTableContext } from '../ticketsTableContext/ticketsTableContext';
import { isEqual } from 'lodash';

type TicketsTableSidePanelProps = {
	setIsNewTicketDirty: (isDirty: boolean) => void;
	setTicketValue: SetTicketValue;
};

export const TicketsTableSidePanel = memo(({ setIsNewTicketDirty, setTicketValue }: TicketsTableSidePanelProps) => {
	const { teamspace, project, template } = useParams<DashboardTicketsParams>();
	const { selectedTicket, onSelectedTicketChange, selectedModel, onSelectedModelChange } = useContext(TicketsTableContext);
	const [ticketId, setTicketId] = useState(selectedTicket.current);
	const [modelId, setModelId] = useState(selectedModel.current);
	const [groupBy] = useSearchParam('groupBy');
	const [groupByValue] = useSearchParam('groupByValue');
	const models = useSelectedModels();

	const isFed = FederationsHooksSelectors.selectIsFederation();
	const readOnly = isFed(modelId)
		? !FederationsHooksSelectors.selectHasCommenterAccess(modelId)
		: !ContainersHooksSelectors.selectHasCommenterAccess(modelId);

	const isNewTicket = (ticketId || '').toLowerCase() === NEW_TICKET_ID;
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	
	const clearTicketId = () => setTicketValue();
	const onSaveTicket = (_id: string) => setTicketValue(modelId || '', _id, null);

	const getOpenInViewerLink = () => {
		if (!modelId) return '';

		const pathname = generatePath(VIEWER_ROUTE, {
			teamspace,
			project,
			containerOrFederation: modelId || '',
		});
		return pathname + (ticketId ? `?ticketId=${ticketId}` : '');
	};

	useEffect(() => {
		TicketsCardActionsDispatchers.setReadOnly(readOnly);
	}, [readOnly]);

	useEffect(() => {
		return onSelectedTicketChange(setTicketId);
	}, [setTicketId, onSelectedTicketChange]);

	useEffect(() => {
		return onSelectedModelChange(setModelId);
	}, [setModelId, onSelectedModelChange]);

	return (
		<SidePanel open={!!ticketId && !!models.length && !!modelId}>
			<SlidePanelHeader>
				<Link to={getOpenInViewerLink()} target="_blank" disabled={isNewTicket}>
					<OpenInViewerButton disabled={isNewTicket}>
						<FormattedMessage
							id="ticketsTable.button.openIn3DViewer"
							defaultMessage="Open in 3D viewer"
						/>
					</OpenInViewerButton>
				</Link>
				<CircleButton onClick={clearTicketId}>
					<ExpandIcon />
				</CircleButton>
			</SlidePanelHeader>
			<MuiThemeProvider theme={theme}>
				<TicketContextComponent isViewer={false} containerOrFederation={modelId}>
					{!isNewTicket && (
						<TicketSlide
							ticketId={ticketId}
							template={selectedTemplate}
							containerOrFederation={modelId}
						/>
					)}
					{isNewTicket && (
						<NewTicketSlide
							preselectedValue={{ [groupBy]: groupByValue }}
							template={selectedTemplate}
							containerOrFederation={modelId}
							onSave={onSaveTicket}
							onDirtyStateChange={setIsNewTicketDirty}
						/>
					)}
				</TicketContextComponent>
			</MuiThemeProvider>
		</SidePanel>
	);
}, isEqual);