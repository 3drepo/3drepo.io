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
import { getPropertiesInCamelCase } from '@/v5/store/tickets/tickets.helpers';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { BaseInfoContainer, Description, Title } from './ticketItemBaseInfo.styles';
import { FlexRow } from '../ticketItem.styles';
import { TicketItemThumbnail } from '../ticketItemThumbnail/ticketItemThumbnail.component';
import { has } from 'lodash';

export const TicketItemBaseInfo = ({ ticket }) => {
	const { type, properties, title } = ticket;
	const { containerOrFederation } = useParams<ViewerParams>();
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, type);
	const queries = TicketsCardHooksSelectors.selectFilteringQueries();
	const { description = '' } = getPropertiesInCamelCase(properties);

	const templateHasThumbnail = has(template, ['config', 'defaultView']) || has(template, ['config', 'defaultImage']);

	return (
		<FlexRow>
			<BaseInfoContainer>
				<Title>
					<Highlight search={queries}>
						{title}
					</Highlight>
				</Title>
				{description && <Description>{description}</Description>}
			</BaseInfoContainer>
			{templateHasThumbnail && <TicketItemThumbnail ticket={ticket} />}
		</FlexRow>
	);
};