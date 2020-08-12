/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import { renderWhenTrue } from '../../../helpers/rendering';
import { ViewItem } from '../../viewerGui/components/views/components/viewItem/viewItem.component';
import { Container, StyledLoader } from './viewsDialog.styles';

interface IProps {
	className?: string;
	isPending: boolean;
	fetchViewpoints: (teamspace, modelId) => void;
	viewpoints: any[];
	searchEnabled: boolean;
	searchQuery: string;
	teamspace: string;
	modelId: string;
	handleClose: () => void;
	onChange: (v) => void;
	modelSettings: any;
}

const renderLoadingState = renderWhenTrue(<StyledLoader />);

export const ViewsDialog = ({ viewpoints, searchQuery, searchEnabled, teamspace, modelId, ...props }: IProps) => {
	const [filteredViews, setFilteredViewpoints] = React.useState([]);

	React.useEffect(() => {
		if (!viewpoints.length) {
			props.fetchViewpoints(teamspace, modelId);
		}
	}, []);

	React.useEffect(() => {
		const filteredViewpoints = searchEnabled
			? viewpoints.filter(({ name }) => name.toLowerCase().includes(searchQuery.toLowerCase()))
			: viewpoints;

		setFilteredViewpoints(filteredViewpoints);
	}, [viewpoints, searchQuery, searchEnabled]);

	const handleViewpointItemClick = (viewpoint) => () => {
		props.onChange({ target: { value: {
			id: viewpoint._id,
			name: viewpoint.name,
		}, name: 'defaultView' }});
		props.handleClose();
	};

	const renderViewsList = renderWhenTrue(() => filteredViews.map((viewpoint) => {
		return (
			<ViewItem
				key={viewpoint._id}
				viewpoint={viewpoint}
				onClick={handleViewpointItemClick(viewpoint)}
				teamspace={teamspace}
				modelId={modelId}
			/>
		);
	}));

	return (
		<Container>
			{renderViewsList(!props.isPending)}
			{renderLoadingState(props.isPending)}
		</Container>
	);
};
