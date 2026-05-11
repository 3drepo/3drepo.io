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

import { EmptyList, ViewpointsList } from './viewsList.styles';
import { ViewItem } from './viewItem/viewItem.component';
import { useContext } from 'react';
import { SearchContext, SearchContextType } from '@controls/search/searchContext';
import { FormattedMessage } from 'react-intl';
import { ViewpointsHooksSelectors } from '@/v5/services/selectorsHooks';
import { IViewpoint } from '@/v5/store/viewpoints/viewpoints.types';

type IViewsList = {
	editMode: boolean;
	activeViewpoint: IViewpoint;
	setActiveViewpoint: (viewpoint: IViewpoint | null) => void;
	setEditMode: (mode: boolean) => void;
	createMode: boolean;
	setCreateMode: (mode: boolean) => void;
};

export const ViewsList = ({ editMode, activeViewpoint, setActiveViewpoint, setEditMode, createMode, setCreateMode }: IViewsList) => {
	const { items: viewpoints, filteredItems: filteredViewpoints } = useContext<SearchContextType<IViewpoint>>(SearchContext);
	const newViewpoint = ViewpointsHooksSelectors.selectNewViewpoint();
	if (!filteredViewpoints.length) {
	    return (
			<ViewpointsList>
				<EmptyList>
					{!viewpoints.length ? (
						<FormattedMessage id="viewer.cards.views.noViewpoints" defaultMessage="No views created" />
					) : (
						<FormattedMessage id="viewer.cards.views.noResults" defaultMessage="No views found. Please try another search." />
					)}
				</EmptyList>
			</ViewpointsList>
		);
	}

	return (
		<ViewpointsList>
			{filteredViewpoints.map((viewpoint) => (
				<ViewItem
					key={viewpoint._id}
					viewpoint={viewpoint}
					active={activeViewpoint?._id === viewpoint._id}
					editMode={editMode}
					setActiveViewpoint={setActiveViewpoint}
					setEditMode={setEditMode}
					createMode={createMode}
					setCreateMode={setCreateMode}
				/>
			))}
			{ createMode && newViewpoint && (
				<ViewItem
					key={newViewpoint._id}
					viewpoint={newViewpoint}
					active={true}
					editMode={true}
					setActiveViewpoint={setActiveViewpoint}
					setEditMode={setEditMode}
					createMode={createMode}
					setCreateMode={setCreateMode}
				/>
			)}
		</ViewpointsList>
	);
};
