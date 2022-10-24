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
import { CardContainer, CardHeader } from '@/v5/ui/components/viewer/cards/card.styles';
import { CardContent } from '@/v5/ui/components/viewer/cards/cardContent.component';
import { CardContext } from '@components/viewer/cards/cardContext.component';
import { useContext } from 'react';
import { Button } from '@controls/button';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { ViewerParams } from '../../../routes.constants';
import { useParams } from 'react-router-dom';
import { Chip } from '@mui/material';
import { TicketsCardViews } from '../tickets.constants';
import { sortBy } from 'lodash';

export const TemplateSelectionCard = () => {
	const contextValue = useContext(CardContext);
	const { containerOrFederation } = useParams<ViewerParams>();
	const templates = TicketsHooksSelectors.selectTemplates(containerOrFederation)

	const goBack = () => {
		contextValue.setCardView(TicketsCardViews.List);
	};

	const selectTemplate = (template) => {
		contextValue.setCardView(TicketsCardViews.New, { template });
	};

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon fontSize="small" />
				<FormattedMessage id="viewer.cards.ticketsTitle" defaultMessage="Tickets" />
				<Button onClick={goBack}>back</Button>
			</CardHeader>
			<CardContent>
				{sortBy(templates, 'name').map((template) => (
					<Chip label={template.name} onClick={() => selectTemplate(template)} key={template._id} />
				))}
			</CardContent>
		</CardContainer>
	);
};