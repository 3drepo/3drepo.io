/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { Highlight } from '@controls/highlight/highlight.component';
import { CreationInfo, Description, Id, Title } from '../ticketItem.styles';
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';

export const TicketItemBaseInfo = ({ _id: ticketId, number, type, title, properties }) => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const queries = TicketsCardHooksSelectors.selectFilteringQueries();
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, type);
	const { description = '', createdAt, owner } = getPropertiesInCamelCase(properties);

	const expandTicket = () => TicketsCardActionsDispatchers.openTicket(ticketId);

	return (
		<div>
			<Id>
				<Highlight search={queries}>
					{`${template?.code}:${number}`}
				</Highlight>
			</Id>
			<Title onClick={expandTicket}>
				<Highlight search={queries}>
					{title}
				</Highlight>
			</Title>
			<CreationInfo
				owner={owner}
				createdAt={createdAt}
			/>
			<Description>
				{description}
			</Description>
		</div>
	);
};