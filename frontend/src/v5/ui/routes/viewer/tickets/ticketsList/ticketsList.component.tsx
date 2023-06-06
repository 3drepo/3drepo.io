/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { flatMap, get } from 'lodash';
import { TicketsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { FilterChip } from '@controls/chip/filterChip/filterChip.styles';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { TicketStatuses, TreatmentLevels } from '@controls/chip/chip.types';
import { formatMessage } from '@/v5/services/intl';
import { TicketItem } from './ticketItem/ticketItem.component';
import { List, Filters, CompletedFilterChip } from './ticketsList.styles';
import { ViewerParams } from '../../../routes.constants';
import { AdditionalProperties, TicketsCardViews } from '../tickets.constants';

type TicketsListProps = {
	tickets: ITicket[];
};

export const TicketsList = ({ tickets }: TicketsListProps) => {
	const [showingCompleted, setShowingCompleted] = useState(false);
	const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
	const { containerOrFederation } = useParams<ViewerParams>();
	const templates = TicketsHooksSelectors.selectTemplates(containerOrFederation);
	const selectedTicket = TicketsCardHooksSelectors.selectSelectedTicket();

	const ticketIsSelected = (ticket: ITicket) => selectedTicket === ticket;

	const toggleTemplate = (templateId: string) => {
		if (selectedTemplates.has(templateId)) {
			selectedTemplates.delete(templateId);
		} else {
			selectedTemplates.add(templateId);
		}
		setSelectedTemplates(new Set(selectedTemplates));
	};

	const filterCompleted = (ticket) => {
		const issuePropertyStatus = get(ticket, 'properties.Status');
		const treatmentStatus = get(ticket, 'modules.safetibase.Treatment Status');

		const isCompletedIssueProperty = [TicketStatuses.CLOSED, TicketStatuses.VOID].includes(issuePropertyStatus);
		const isCompletedTreatmentStatus = [TreatmentLevels.AGREED_FULLY, TreatmentLevels.VOID].includes(treatmentStatus);

		return (isCompletedIssueProperty || isCompletedTreatmentStatus) === showingCompleted;
	};

	const getTicketsByTemplateId = (templateId: string) => tickets.filter(({ type }) => type === templateId);

	const getFilteredTickets = () => {
		if (selectedTemplates.size === 0) return tickets.filter(filterCompleted);
		return flatMap([...selectedTemplates], getTicketsByTemplateId).filter(filterCompleted);
	};

	const getTemplatesForFilter = () => templates.filter(({ _id }) => getTicketsByTemplateId(_id).length > 0);

	const onTicketClick = (ticket: ITicket, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation();

		const wasSelected = ticketIsSelected(ticket);

		TicketsCardActionsDispatchers.setSelectedTicket(ticket._id);
		if (wasSelected) {
			TicketsCardActionsDispatchers.setCardView(TicketsCardViews.Details);
		}
		const view = ticket?.properties?.[AdditionalProperties.DEFAULT_VIEW];
		if (!(view?.camera)) return;
		ViewerService.setViewpoint(view);
	};

	useEffect(() => {
		ViewerService.on(VIEWER_EVENTS.BACKGROUND_SELECTED, () => TicketsCardActionsDispatchers.setSelectedTicket(null));
		return () => ViewerService.off(VIEWER_EVENTS.BACKGROUND_SELECTED);
	}, []);

	return (
		<>
			<Filters>
				<CompletedFilterChip
					key="completed"
					selected={showingCompleted}
					onClick={() => setShowingCompleted((prev) => !prev)}
					label={formatMessage({ id: 'ticketsList.filters.completed', defaultMessage: 'Completed' })}
				/>
				{getTemplatesForFilter().map(({ name, _id }) => (
					<FilterChip
						key={_id}
						selected={selectedTemplates.has(_id)}
						onClick={() => toggleTemplate(_id)}
						label={`${name} (${getTicketsByTemplateId(_id).length})`}
					/>
				))}
			</Filters>
			<List>
				{getFilteredTickets().map((ticket) => (
					<TicketItem
						ticket={ticket}
						key={ticket._id}
						onClick={(e) => onTicketClick(ticket, e)}
						selected={ticketIsSelected(ticket)}
					/>
				))}
			</List>
		</>
	);
};
