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

import { JobsActionsDispatchers, ProjectsActionsDispatchers, TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ContainersHooksSelectors, FederationsHooksSelectors, ProjectsHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'react-redux';
import { selectFederationById } from '@/v5/store/federations/federations.selectors';
import { FormattedMessage } from 'react-intl';
import { formatMessage } from '@/v5/services/intl';
import { useParams, generatePath, useHistory } from 'react-router-dom';
import { SearchContextComponent } from '@controls/search/searchContext';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { getTemplateDefaultStatus, selectTemplateById, selectTicketsHaveBeenFetched } from '@/v5/store/tickets/tickets.selectors';
import ExpandIcon from '@assets/icons/outlined/expand_panel-outlined.svg';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';
import { CircleButton } from '@controls/circleButton';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { FormProvider, useForm } from 'react-hook-form';
import _ from 'lodash';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme } from '@/v5/ui/routes/viewer/theme';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeContainerNewTicket, enableRealtimeContainerUpdateTicket, enableRealtimeFederationNewTicket, enableRealtimeFederationUpdateTicket } from '@/v5/services/realtime/ticket.events';
import { TicketContextComponent } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { isCommenterRole } from '@/v5/store/store.helpers';
import { TicketsTableContent } from './ticketsTableContent/ticketsTableContent.component';
import { Transformers, useSearchParam } from '../../../../useSearchParam';
import { DashboardTicketsParams, TICKETS_ROUTE, VIEWER_ROUTE } from '../../../../routes.constants';
import { ContainersAndFederationsFormSelect } from '../selectMenus/containersAndFederationsFormSelect.component';
import { GroupByFormSelect } from '../selectMenus/groupByFormSelect.component';
import { TemplateFormSelect } from '../selectMenus/templateFormSelect.component';
import { Link, FiltersContainer, NewTicketButton, SelectorsContainer, SearchInput, SidePanel, SlidePanelHeader, OpenInViewerButton, FlexContainer, CompletedChip } from '../tickets.styles';
import { GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE, NONE_OPTION, hasRequiredViewerProperties } from './ticketsTable.helper';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { NewTicketSlide } from '../ticketsList/slides/newTicketSlide.component';
import { TicketSlide } from '../ticketsList/slides/ticketSlide.component';
import { useSelectedModels } from './newTicketMenu/useSelectedModels';
import { ticketIsCompleted } from '@controls/chip/chip.helpers';

type FormType = {
	containersAndFederations: string[],
	template: string,
	groupBy: string,
};
export const TicketsTable = () => {
	const history = useHistory();
	const params = useParams<DashboardTicketsParams>();
	const { teamspace, project, groupBy: groupByURLParam, template: templateURLParam, containerOrFederation } = params;
	const [modelsIds, setModelsIds] = useSearchParam('models', Transformers.STRING_ARRAY);
	const [showCompleted, setShowCompleted] = useSearchParam('showCompleted', Transformers.BOOLEAN);
	const models = useSelectedModels();
	const { getState } = useStore();
	const formData = useForm<FormType>({
		defaultValues: {
			containersAndFederations: modelsIds,
			template: templateURLParam,
			groupBy: GROUP_BY_URL_PARAM_TO_TEMPLATE_CASE[groupByURLParam] || NONE_OPTION,
		},
	});
	const { containersAndFederations, groupBy, template } = formData.watch();

	const tickets = TicketsHooksSelectors.selectTicketsByContainersAndFederations(containersAndFederations);
	const templates = ProjectsHooksSelectors.selectCurrentProjectTemplates();
	const selectedTemplate = ProjectsHooksSelectors.selectCurrentProjectTemplateById(template);
	const [sidePanelTicket, setSidePanelTicket] = useState<Partial<ITicket>>(null);
	const [isNewTicketDirty, setIsNewTicketDirty] = useState(false);
	
	const federations = FederationsHooksSelectors.selectFederations();
	const isFederation = (modelId) => federations.some(({ _id }) => _id === modelId);

	const readOnly = isFederation(containerOrFederation)
		? !FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: !ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);
	const selectedTicketId = sidePanelTicket?._id;
	const templateIsFetched = templateAlreadyFetched(selectedTemplate || {} as any);
	const isCreatingNewTicket = containerOrFederation && !selectedTicketId && !hasRequiredViewerProperties(selectedTemplate);

	const ticketsFilteredByTemplate = useMemo(() => {
		const ticketsToShow = tickets.filter((t) => ticketIsCompleted(t, selectedTemplate) === showCompleted);
		return ticketsToShow.filter(({ type }) => type === template);
	}, [template, tickets, showCompleted]);
	const newTicketButtonIsDisabled = !containersAndFederations.length || models.filter(({ role }) => isCommenterRole(role)).length === 0;

	const setSidePanelData = (modelId: string, ticket?: Partial<ITicket>) => {
		const newParams = {
			...params,
			template,
			containerOrFederation: modelId,
		};
		const path = generatePath(TICKETS_ROUTE, newParams);
		history.replace(path + window.location.search);
		setSidePanelTicket(ticket);
	};

	const onSaveTicket = (ticketId: string) => setSidePanelTicket({ _id: ticketId });

	const closeSidePanel = () => setSidePanelData(null, null);

	const filterTickets = (items, query: string) => items.filter((ticket) => {
		const templateCode = templates.find(({ _id }) => _id === ticket.type).code;
		const ticketCode = `${templateCode}:${ticket.number}`;

		const elementsToFilter = [ticketCode, ticket.title];
		if (containersAndFederations.length > 1) {
			elementsToFilter.push(ticket.modelName);
		}
		return elementsToFilter.some((str) => str.toLowerCase().includes(query.toLowerCase()));
	});

	const getOpenInViewerLink = () => {
		if (!containerOrFederation) return '';

		const pathname = generatePath(VIEWER_ROUTE, {
			teamspace,
			project,
			containerOrFederation: containerOrFederation || '',
		});
		return pathname + (selectedTicketId ? `?ticketId=${selectedTicketId}` : '');
	};

	// We are using getState here because is being used inside a function
	const isFed = (modelId) => !!selectFederationById(getState(), modelId);

	useEffect(() => {
		setModelsIds(containersAndFederations);

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
		setModelsIds();
		formData.setValue('containersAndFederations', []);
	}, [project]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setSelectedTicket(selectedTicketId);
	}, [selectedTicketId]);

	useEffect(() => {
		JobsActionsDispatchers.fetchJobs(teamspace);
		TicketsActionsDispatchers.fetchRiskCategories(teamspace);
	}, []);

	useEffect(() => { closeSidePanel(); }, [template, containersAndFederations]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setReadOnly(readOnly);
	}, [readOnly]);

	useEffect(() => {
		_.uniqBy(ticketsFilteredByTemplate, 'modelId').forEach(({ modelId, type }) => {
			const tmpl = selectTemplateById(getState(), modelId, type);
			if (!tmpl || !getTemplateDefaultStatus(tmpl)) {
				TicketsActionsDispatchers.fetchTemplates(
					teamspace,
					project,
					modelId,
					isFederation(modelId),
					true,
				);
			}
		});
	}, [ticketsFilteredByTemplate]);

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
									disabled={newTicketButtonIsDisabled}
								>
									<FormattedMessage id="ticketsTable.button.newTicket" defaultMessage="New Ticket" />
								</NewTicketButton>
							)}
							disabled={newTicketButtonIsDisabled}
							onContainerOrFederationClick={setSidePanelData}
						/>
					</FlexContainer>
				</FiltersContainer>
				<TicketsTableContent setSidePanelData={setSidePanelData} selectedTicketId={selectedTicketId} />
			</FormProvider>
			<SidePanel open={!!containerOrFederation}>
				<SlidePanelHeader>
					<Link to={getOpenInViewerLink()} target="_blank" disabled={isCreatingNewTicket}>
						<OpenInViewerButton disabled={isCreatingNewTicket}>
							<FormattedMessage
								id="ticketsTable.button.openIn3DViewer"
								defaultMessage="Open in 3D viewer"
							/>
						</OpenInViewerButton>
					</Link>
					<CircleButton onClick={closeSidePanel}>
						<ExpandIcon />
					</CircleButton>
				</SlidePanelHeader>
				{containerOrFederation && (
					<MuiThemeProvider theme={theme}>
						<TicketContextComponent isViewer={false}>
							{selectedTicketId && (<TicketSlide ticket={sidePanelTicket as ITicket} template={selectedTemplate} />)}
							{!selectedTicketId && (
								<NewTicketSlide
									defaultValue={sidePanelTicket}
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
