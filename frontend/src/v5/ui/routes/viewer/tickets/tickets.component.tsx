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

import TicketsIcon from '@mui/icons-material/FormatListBulleted';
import { FormattedMessage } from 'react-intl';
import { CardContainer, CardHeader, EmptyCardMessage } from '@/v5/ui/components/viewer/cards/card.styles';
import { useEffect, useState } from 'react';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks/federationsSelectors.hooks';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers/containersActions.dispatchers';
import { ContainersHooksSelectors } from '@/v5/services/selectorsHooks/containersSelectors.hooks';
import { countBy } from 'lodash';
import { TicketsList } from './ticketsList/ticketsList.component';
import { SearchValue, SearchValues, CardContent } from './tickets.styles';

export const Tickets = () => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = FederationsHooksSelectors.selectContainersByFederationId(containerOrFederation)?.length === 1;
	const tickets = isFederation
		? FederationsHooksSelectors.selectFederationTickets(containerOrFederation)
		: ContainersHooksSelectors.selectContainerTickets(containerOrFederation);

	useEffect(() => {
		if (isFederation) {
			FederationsActionsDispatchers.fetchFederationTickets(teamspace, project, containerOrFederation);
		} else {
			ContainersActionsDispatchers.fetchContainerTickets(teamspace, project, containerOrFederation);
		}
	}, [containerOrFederation]);

	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

	const toggleSelectedType = (type: string) => {
		if (selectedTypes.includes(type)) {
			setSelectedTypes(selectedTypes.filter((selectedType) => selectedType !== type));
		} else {
			setSelectedTypes(selectedTypes.concat(type));
		}
	};

	const getFilteredTickets = () => {
		if (selectedTypes.length === 0) return tickets;
		return tickets.filter(({ type }) => selectedTypes.includes(type));
	};

	const getTypesByCount = () => countBy(tickets.map(({ type }) => type));

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon fontSize="small" />
				<FormattedMessage id="viewer.cards.ticketsTitle" defaultMessage="Tickets" />
			</CardHeader>
			<CardContent autoHeightMax="100%">
				{!tickets?.length ? (
					<EmptyCardMessage>
						<FormattedMessage id="viewer.tickets.emptyList" defaultMessage="No entries have been created yet" />
					</EmptyCardMessage>
				) : (
					<>
						<SearchValues>
							{Object.entries(getTypesByCount()).map(([type, count]) => (
								<SearchValue
									key={type}
									$selected={selectedTypes.includes(type)}
									onClick={() => toggleSelectedType(type)}
								>
									{type} ({count})
								</SearchValue>
							))}
						</SearchValues>
						<TicketsList tickets={getFilteredTickets()} />
					</>
				)}
			</CardContent>
		</CardContainer>
	);
};
