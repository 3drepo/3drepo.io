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

import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ProjectsHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'react-redux';
import { selectFederationById } from '@/v5/store/federations/federations.selectors';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { useParams, generatePath, useHistory } from 'react-router-dom';
import { SearchContextComponent } from '@controls/search/searchContext';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { selectTicketsHaveBeenFetched } from '@/v5/store/tickets/tickets.selectors';
import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import { CircleButton } from '@controls/circleButton';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { FormProvider, useForm } from 'react-hook-form';
import { TicketsList } from './ticketsList/ticketsList.component';
import { useSearchParam } from '../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE } from '../../../routes.constants';
import { ContainersAndFederationsFormSelect } from './selectMenus/containersAndFederationsFormSelect.component';
import { GroupByFormSelect } from './selectMenus/groupByFormSelect.component';
import { TemplateFormSelect } from './selectMenus/templateFormSelect.component';
import { InputsContainer, NewTicketButton, SelectorsContainer, SearchInput, SidePanel, SlidePanelHeader, OpenInViewerButton, FlexContainer } from './tickets.styles';
import { NONE_OPTION } from './ticketsTable.helper';

type FormType = {
	containersAndFederations: string[],
	template: string,
	groupBy: string,
};
export const TicketsTable = () => {
	const history = useHistory();
	const { teamspace, project, groupBy: groupByURLParam, template: templateURLParam } = useParams<DashboardTicketsParams>();
	const [models, setModels] = useSearchParam('models');
	const { getState } = useStore();
	const formData = useForm<FormType>({
		defaultValues: {
			containersAndFederations: models?.split(',') || [],
			template: templateURLParam,
			groupBy: groupByURLParam || NONE_OPTION,
		},
	});
	const containersAndFederations = formData.watch('containersAndFederations');
	const groupBy = formData.watch('groupBy');
	const template = formData.watch('template');

	const tickets = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const [editingTicket, setEditingTicket] = useState<ITicket>(undefined);
	const [isEditingTicket, setIsEditingTicket] = useState(false);

	const ticketsFilteredByTemplate = useMemo(() => {
		if (template === NONE_OPTION) return tickets;
		return tickets.filter(({ type }) => type === template);
	}, [template, tickets]);

	const onSetEditingTicket = (ticket: ITicket) => {
		setEditingTicket(ticket);
		setIsEditingTicket(true);
	};

	useEffect(() => {
		if (!containersAndFederations.length) return;

		const isFed = (modelId) => !!selectFederationById(getState(), modelId);

		containersAndFederations.forEach((modelId) => {
			if (selectTicketsHaveBeenFetched(getState(), modelId)) return;
			TicketsActionsDispatchers.fetchTickets(teamspace, project, modelId, isFed(modelId));
		});
	}, [containersAndFederations]);

	useEffect(() => {
		let newURL = generatePath(TICKETS_ROUTE, {
			teamspace,
			project,
			groupBy,
			template,
		});
		if (models) {
			newURL = `${newURL}?models=${models || ''}`;
		}
		history.push(newURL);
	}, [groupBy, template]);

	useEffect(() => { setModels(containersAndFederations.join(',')); }, [containersAndFederations]);

	useEffect(() => () => setModels(''), []);

	return (
		<SearchContextComponent items={ticketsFilteredByTemplate} fieldsToFilter={['title']}>
			<FormProvider {...formData}>
				<InputsContainer>
					<SelectorsContainer>
						<ContainersAndFederationsFormSelect name="containersAndFederations" />
						<TemplateFormSelect name="template" />
						<GroupByFormSelect name="groupBy" />
					</SelectorsContainer>
					<FlexContainer>
						<SearchInput
							placeholder={formatMessage({ id: 'ticketsTable.search.placeholder', defaultMessage: 'Search...' })}
						/>
						<NewTicketButton
							startIcon={<AddCircleIcon />}
							onClick={() => onSetEditingTicket(null)}
							disabled={!templates.length}
						>
							<FormattedMessage id="ticketsTable.button.newTicket" defaultMessage="New Ticket" />
						</NewTicketButton>
					</FlexContainer>
				</InputsContainer>
			</FormProvider>
			<TicketsList onTicketClick={onSetEditingTicket} />
			<SidePanel open={isEditingTicket}>
				<SlidePanelHeader>
					<OpenInViewerButton disabled={!editingTicket?._id}>
						<FormattedMessage
							id="ticketsTable.button.openInViewer"
							defaultMessage="Open in viewer"
						/>
					</OpenInViewerButton>
					<CircleButton onClick={() => setIsEditingTicket(false)}>
						<ExpandIcon />
					</CircleButton>
				</SlidePanelHeader>
				{editingTicket?._id && (<div>Editing ticket {editingTicket.title}</div>)}
				{!editingTicket?._id && (<div>attempting to create a new ticket</div>)}
			</SidePanel>
		</SearchContextComponent>
	);
};
