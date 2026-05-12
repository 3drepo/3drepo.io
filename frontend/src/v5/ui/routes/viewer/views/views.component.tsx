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
import { SearchBar } from './views.styles';
import { CardContainer } from '@components/viewer/cards/card.styles';
import { CardHeader } from '@components/viewer/cards/cardHeader.component';
import { formatMessage } from '@/v5/services/intl';
import { ViewsList } from './viewsList/viewsList.component';
import ViewsIcon from '@assets/icons/outlined/view-outlined.svg';
import { ViewsCardActions } from './viewsCardActions/viewsCardActions.component';
import { ViewsCardFooter } from './viewsCardFooter/viewsCardFooter.component';
import { SearchContextComponent } from '@controls/search/searchContext';
import { ViewpointsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { CentredContainer } from '@controls/centredContainer';
import { IViewpoint } from '@/v5/store/viewpoints/viewpoints.types';

export const Views = () => {
	const viewpoints = ViewpointsHooksSelectors.selectViewpointsList();
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(false);
	const [activeViewpoint, setActiveViewpoint] = useState<IViewpoint | null>(null);
	const isPending = ViewpointsHooksSelectors.selectIsPending();


	if (isPending) {
		return (
			<CardContainer>
				<CentredContainer>
					<Spinner />
				</CentredContainer>
			</CardContainer>
		);
	}
	return (
		<CardContainer>
			<CardHeader
				icon={<ViewsIcon />}
				title={formatMessage({ id: 'viewer.cards.views.title', defaultMessage: 'Views' })}
				actions={(<ViewsCardActions />)}
			/>
			<SearchContextComponent items={viewpoints} fieldsToFilter={['name']}>
				<SearchBar placeholder={formatMessage({ id: 'containers.search.placeholder', defaultMessage: 'Search views...' })} />
				<ViewsList
					editMode={editMode}
					activeViewpoint={activeViewpoint}
					setActiveViewpoint={setActiveViewpoint}
					setEditMode={setEditMode}
					createMode={createMode}
					setCreateMode={setCreateMode}
				/>
			</SearchContextComponent>
			<ViewsCardFooter setActiveViewpoint={setActiveViewpoint} createMode={createMode} setCreateMode={setCreateMode} />
		</CardContainer>
	);
};
