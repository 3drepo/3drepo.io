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

import { JobsActionsDispatchers, ProjectsActionsDispatchers, TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
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
import { getTicketIsCompleted, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { FormProvider, useForm } from 'react-hook-form';
import _ from 'lodash';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme } from '@/v5/ui/routes/viewer/theme';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeContainerNewTicket, enableRealtimeContainerUpdateTicket, enableRealtimeFederationNewTicket, enableRealtimeFederationUpdateTicket } from '@/v5/services/realtime/ticket.events';
import { TicketContextComponent } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { TicketsTableContent } from './ticketsTableContent/ticketsTableContent.component';
import { useSearchParam } from '../../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE, VIEWER_ROUTE } from '../../../../routes.constants';
import { ContainersAndFederationsFormSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { GroupByFormSelect } from '../selectMenus/groupByFormSelect.component';
import { TemplateFormSelect } from '../selectMenus/templateFormSelect.component';
import { FiltersContainer, NewTicketButton, SelectorsContainer, SearchInput, SidePanel, SlidePanelHeader, OpenInViewerButton, FlexContainer, CompletedChip } from '../tickets.styles';
import { GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE, NONE_OPTION, hasRequiredViewerProperties } from './ticketsTable.helper';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { NewTicketSlide } from '../ticketsList/slides/newTicketSlide.component';
import { TicketSlide } from '../ticketsList/slides/ticketSlide.component';

type FormType = {
	containersAndFederations: string[],
	template: string,
	groupBy: string,
};
export const TicketsTable = () => {
	const history = useHistory();
	const params = useParams<DashboardTicketsParams>();
	const { teamspace, project, groupBy: groupByURLParam, template: templateURLParam } = params;
	const [models, setModels] = useSearchParam('models');
	const { getState } = useStore();
	const formData = useForm<FormType>({
		defaultValues: {
			containersAndFederations: models?.split(',') || [],
			template: templateURLParam,
			groupBy: GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE[groupByURLParam] || NONE_OPTION,
		},
	});
	const { containersAndFederations, groupBy, template } = formData.watch();

	const ticketsWithModelId = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const [sidePanelModelId, setSidePanelModelId] = useState<string>(null);
	const [sidePanelTicket, setSidePanelTicket] = useState<Partial<ITicket>>(null);
	const [showCompleted, setShowCompleted] = useState(false);
	const [isNewTicketDirty, setIsNewTicketDirty] = useState(false);

	const editingTicketId = sidePanelTicket?._id;
	const templateIsFetched = templateAlreadyFetched(selectedTemplate || {} as any);
	const isEditingValidTicket = sidePanelModelId && !editingTicketId && !hasRequiredViewerProperties(selectedTemplate);

	const ticketsFilteredByTemplate = useMemo(() => {
		const ticketsToShow = ticketsWithModelId.filter((t) => getTicketIsCompleted(t) === showCompleted);
		return ticketsToShow.filter(({ type }) => type === template);
	}, [template, ticketsWithModelId, showCompleted]);

	const setSidePanelData = (modelId: string, ticket?: Partial<ITicket>) => {
		setSidePanelModelId(modelId);
		setSidePanelTicket(ticket);
	};

	const onSaveTicket = (ticketId: string) => setSidePanelTicket({ _id: ticketId });

	const closeSidePanel = () => setSidePanelData(null, null);

	const filterTickets = (items, query: string) => items.filter((ticket) => {
		const templateCode = templates.find(({ _id }) => _id === ticket.type).code;
		const ticketCode = `${templateCode}:${ticket.number}`;
		return [ticketCode, ticket.title].some((str) => str.toLowerCase().includes(query.toLowerCase()));
	});

	const openInViewer = () => {
		const pathname = generatePath(VIEWER_ROUTE, {
			teamspace,
			project,
			containerOrFederation: sidePanelModelId,
		});
		history.push({ pathname, search: sidePanelTicket?._id ? `?ticketId=${sidePanelTicket._id}` : '' });
	};

	// We are using getState here because is being used inside a function
	const isFed = (modelId) => !!selectFederationById(getState(), modelId);

	useEffect(() => {
		setModels(containersAndFederations.join(','));

		if (!containersAndFederations.length) return;

		containersAndFederations.forEach((modelId) => {
			if (selectTicketsHaveBeenFetched(getState(), modelId)) return;
			TicketsActionsDispatchers.fetchTickets(teamspace, project, modelId, isFed(modelId));
		});
	}, [containersAndFederations]);

	useEffect(() => {
		const subscriptions = containersAndFederations.flatMap((modelId) => {
			if (isFed(modelId)) {
				return [
					enableRealtimeFederationNewTicket(teamspace, project, modelId),
					enableRealtimeFederationUpdateTicket(teamspace, project, modelId),
				];
			}
			return [
				enableRealtimeContainerNewTicket(teamspace, project, modelId),
				enableRealtimeContainerUpdateTicket(teamspace, project, modelId),
			];
		});
		return combineSubscriptions(...subscriptions);
	}, [containersAndFederations]);

	useEffect(() => {
		if (templateIsFetched) return;
		ProjectsActionsDispatchers.fetchTemplate(teamspace, project, template);
	}, [template]);

	useEffect(() => {
		const newURL = generatePath(TICKETS_ROUTE, {
			...params,
			groupBy: _.snakeCase(groupBy),
			template,
		});
		history.push(newURL + window.location.search);
	}, [groupBy, template]);

	useEffect(() => () => {
		setModels('');
		formData.setValue('containersAndFederations', []);
	}, [project]);

	useEffect(() => {
		const { containerOrFederation, ...newParams } = params;
		if (sidePanelTicket?._id) {
			newParams.containerOrFederation = sidePanelModelId;
		}
		const path = generatePath(TICKETS_ROUTE, newParams);
		history.replace(path + window.location.search);
	}, [sidePanelTicket?._id]);

	useEffect(() => {
		JobsActionsDispatchers.fetchJobs(teamspace);
		TicketsActionsDispatchers.fetchRiskCategories(teamspace);
	}, []);

	useEffect(() => { closeSidePanel(); }, [template, containersAndFederations]);

	return (
		<SearchContextComponent items={ticketsFilteredByTemplate} filteringFunction={filterTickets}>
			<FormProvider {...formData}>
				<FiltersContainer>
					<FlexContainer>
						<SelectorsContainer>
							<ContainersAndFederationsFormSelect
								name="containersAndFederations"
								isNewTicketDirty={isNewTicketDirty}
							/>
							<TemplateFormSelect
								name="template"
								isNewTicketDirty={isNewTicketDirty}
							/>
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
									disabled={!containersAndFederations.length}
								>
									<FormattedMessage id="ticketsTable.button.newTicket" defaultMessage="New Ticket" />
								</NewTicketButton>
							)}
							onContainerOrFederationClick={setSidePanelData}
						/>
					</FlexContainer>
				</FiltersContainer>
			</FormProvider>
			<TicketsTableContent setSidePanelData={setSidePanelData} />
			<SidePanel open={!!sidePanelModelId}>
				<SlidePanelHeader>
					<OpenInViewerButton disabled={isEditingValidTicket} onClick={openInViewer}>
						<FormattedMessage
							id="ticketsTable.button.openIn3DViewer"
							defaultMessage="Open in 3D viewer"
						/>
					</OpenInViewerButton>
					<CircleButton onClick={closeSidePanel}>
						<ExpandIcon />
					</CircleButton>
				</SlidePanelHeader>
				{sidePanelModelId && (
					<MuiThemeProvider theme={theme}>
						<TicketContextComponent isViewer={false}>
							{editingTicketId && (<TicketSlide ticketId={sidePanelTicket._id} template={selectedTemplate} />)}
							{!editingTicketId && (
								<NewTicketSlide
									defaultValue={sidePanelTicket}
									modelId={sidePanelModelId}
									template={selectedTemplate}
									onSave={onSaveTicket}
									onDirtyStateChange={setIsNewTicketDirty}
								/>
							)}
						</TicketContextComponent>
					</MuiThemeProvider>
				)}
			</SidePanel>
		</SearchContextComponent>
	);
};
