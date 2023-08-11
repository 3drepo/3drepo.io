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
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { CircleButton } from '@controls/circleButton';
import { getTicketIsCompleted } from '@/v5/store/tickets/tickets.helpers';
import { FormProvider, useForm } from 'react-hook-form';
import _ from 'lodash';
import { JobsActions } from '@/v4/modules/jobs';
import { TicketsTableContent } from './ticketsTableContent/ticketsTableContent.component';
import { useSearchParam } from '../../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE } from '../../../../routes.constants';
import { ContainersAndFederationsFormSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { GroupByFormSelect } from '../selectMenus/groupByFormSelect.component';
import { TemplateFormSelect } from '../selectMenus/templateFormSelect.component';
import { FiltersContainer, NewTicketButton, SelectorsContainer, SearchInput, SidePanel, SlidePanelHeader, OpenInViewerButton, FlexContainer, CompletedChip } from '../tickets.styles';
import { GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE } from './ticketsTable.helper';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';

type FormType = {
	containersAndFederations: string[],
	template: string,
	groupBy: string,
};
export const TicketsTable = () => {
	const history = useHistory();
	const { teamspace, project, groupBy: groupByURLParam, template: templateURLParam } = useParams<DashboardTicketsParams>();
	const [models, setModels] = useSearchParam('models');
	const { getState, dispatch } = useStore();
	const formData = useForm<FormType>({
		defaultValues: {
			containersAndFederations: models?.split(',') || [],
			template: templateURLParam,
			groupBy: GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE[groupByURLParam],
		},
	});
	const { containersAndFederations, groupBy, template } = formData.watch();

	const ticketsWithModelId = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const [sidePanelMode, setSidePanelMode] = useState<'edit' | 'new' | null>(null);
	const [sidePanelModelId, setSidePanelModelId] = useState<string>(null);
	const [sidePanelTicket, setSidePanelTicket] = useState<Partial<ITicket>>({});
	const [showCompleted, setShowCompleted] = useState(false);

	const ticketsFilteredByTemplate = useMemo(() => {
		const ticketsToShow = ticketsWithModelId.filter((t) => getTicketIsCompleted(t) === showCompleted);
		return ticketsToShow.filter(({ type }) => type === template);
	}, [template, ticketsWithModelId, showCompleted]);

	const setSidePanelModelIdAndTicket = (modelId: string, ticket: Partial<ITicket> = {}) => {
		setSidePanelModelId(modelId);
		setSidePanelTicket(ticket);
	}

	const onEditTicket = (modelId: string, ticket: Partial<ITicket>) => {
		setSidePanelModelIdAndTicket(modelId, ticket);
		setSidePanelMode('edit');
	};

	const onNewTicket = (modelId: string, ticket?: Partial<ITicket>) => {
		setSidePanelModelIdAndTicket(modelId, ticket);
		setSidePanelMode('new');
	};

	const onCloseSidePanel = () => {
		setSidePanelModelIdAndTicket(null);
		setSidePanelMode(null);
	};

	const filterTickets = (items, query: string) => {
		if (!query) return items;
		return items.filter((ticket) => {
			const templateCode = templates.find(({ _id }) => _id === ticket.type).code;
			const ticketCode = `${templateCode}:${ticket.number}`;
			return [ticketCode, ticket.title].some((str) => str.toLowerCase().includes(query.toLowerCase()));
		});
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
			groupBy: _.snakeCase(groupBy),
			template,
		});
		if (models) {
			newURL += `?models=${models}`;
		}
		history.push(newURL);
	}, [groupBy, template]);

	useEffect(() => { setModels(containersAndFederations.join(',')); }, [containersAndFederations]);

	useEffect(() => () => {
		setModels('');
		formData.setValue('containersAndFederations', []);
	}, [project]);

	useEffect(() => {
		dispatch(JobsActions.fetchJobs(teamspace));
	}, []);

	return (
		<SearchContextComponent items={ticketsFilteredByTemplate} filteringFunction={filterTickets}>
			<FormProvider {...formData}>
				<FiltersContainer>
					<FlexContainer>
						<SelectorsContainer>
							<ContainersAndFederationsFormSelect name="containersAndFederations" />
							<TemplateFormSelect name="template" />
							<GroupByFormSelect name="groupBy" />
						</SelectorsContainer>
						<CompletedChip
							selected={showCompleted}
							icon={<TickIcon />}
							onClick={() => setShowCompleted(!showCompleted)}
							label={formatMessage({ id: 'ticketsTable.filters.completed', defaultMessage: 'Completed' })}
						/>
					</FlexContainer>
					<FlexContainer>
						<SearchInput
							placeholder={formatMessage({ id: 'ticketsTable.search.placeholder', defaultMessage: 'Search...' })}
						/>
						<NewTicketMenu
							TriggerButton={(
								<NewTicketButton
									startIcon={<AddCircleIcon />}
									disabled={!templates.length}
								>
									<FormattedMessage id="ticketsTable.button.newTicket" defaultMessage="New Ticket" />
								</NewTicketButton>
							)}
							onContainerOrFederationClick={onNewTicket}
						/>
					</FlexContainer>
				</FiltersContainer>
			</FormProvider>
			<TicketsTableContent onEditTicket={onEditTicket} onNewTicket={onNewTicket} />
			<SidePanel open={!!sidePanelMode}>
				<SlidePanelHeader>
					<OpenInViewerButton disabled={sidePanelMode !== 'edit'}>
						<FormattedMessage
							id="ticketsTable.button.openInViewer"
							defaultMessage="Open in viewer"
						/>
					</OpenInViewerButton>
					<CircleButton onClick={onCloseSidePanel}>
						<ExpandIcon />
					</CircleButton>
				</SlidePanelHeader>
				{sidePanelMode === 'edit' && (<div>Editing ticket {sidePanelTicket.title}</div>)}
				{sidePanelMode === 'new' && (<div>Attempting to create a new ticket for {sidePanelModelId}</div>)}
			</SidePanel>
		</SearchContextComponent>
	);
};
