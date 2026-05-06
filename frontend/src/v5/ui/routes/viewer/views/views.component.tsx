/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { useState } from 'react';
import { Container } from './views.styles';
import { CardContainer, CardContent } from '@components/viewer/cards/card.styles';
import { CardHeader } from '@components/viewer/cards/cardHeader.component';
import { formatMessage } from '@/v5/services/intl';
import { ViewsList } from './viewsList/viewsList.component';
import ViewsIcon from '@assets/icons/outlined/view-outlined.svg';
import { selectViewpointsList } from '@/v4/modules/viewpoints';
import { getState } from '@/v5/helpers/redux.helpers';
import { ViewsCardActions } from './viewsCardActions/viewsCardActions.component';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { ViewsCardFooter } from './viewsCardFooter/viewsCardFooter.component';

export const Views = () => {
	const viewpoints = selectViewpointsList(getState());
	const [editMode, setEditMode] = useState(false);
	const [activeViewpoint, setActiveViewpoint] = useState(null);
	const [sortOrder, setSortOrder] = useState(SortingDirection.ASCENDING);
	const [searchEnabled, setSearchEnabled] = useState(false);
	
	return (
		<CardContainer>
			<CardHeader
				icon={<ViewsIcon />}
				title={formatMessage({ id: 'viewer.cards.views.title', defaultMessage: 'Views' })}
				actions={(<ViewsCardActions sortOrder={sortOrder} setSortOrder={setSortOrder} searchEnabled={searchEnabled} setSearchEnabled={setSearchEnabled} />)}
			/>
			<CardContent>
				<Container>
					{/* <SearchBar */}
					<ViewsList
						viewpoints={viewpoints}
						editMode={editMode}
						activeViewpoint={activeViewpoint}
						setActiveViewpoint={setActiveViewpoint}
					/>
				</Container>
			</ CardContent>
			<ViewsCardFooter />
		</CardContainer>
								
	);
};
