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

import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { CardContainer, CardContent } from '@components/viewer/cards/card.styles';
import { FormattedMessage } from 'react-intl';
import DrawingsIcon from '@assets/icons/outlined/drawings-outlined.svg';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { DrawingsList } from './drawingsList.component';
import { DrawingRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ViewerParams } from '../../../routes.constants';
import { CardHeader } from '@components/viewer/cards/cardHeader.component';

export const DrawingsListCard = () => {
	const { teamspace, project } = useParams<ViewerParams>();
	const drawings = DrawingsHooksSelectors.selectNonEmptyDrawings();

	useEffect(() => {
		drawings.forEach((d) => DrawingRevisionsActionsDispatchers.fetch(teamspace, project, d._id));
	}, []);

	return (
		<CardContainer>
			<CardHeader
				icon={<DrawingsIcon />}
				title={<FormattedMessage id="viewer.cards.drawings.title" defaultMessage="Drawings" />}
			/>
			{drawings.length
				? (<DrawingsList />)
				: (
					<CardContent>
						<EmptyListMessage>
							<FormattedMessage id="viewer.cards.drawings.noDrawings" defaultMessage="No drawings have been created yet" />
						</EmptyListMessage>
					</CardContent>
				)
			}
		</CardContainer>
	);
};
