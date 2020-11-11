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

import { ROUTES } from '../../../constants/routes';
import { renderWhenTrue } from '../../../helpers/rendering';
import { IViewpointsComponentState } from '../../../modules/viewpoints/viewpoints.redux';
import { ViewItem } from '../../viewerGui/components/views/components/viewItem/viewItem.component';
import { Link, SearchField } from '../../viewerGui/components/views/views.styles';
import { EmptyStateInfo } from '../components.styles';
import { Container, StyledLoader, ViewsWrapper, ViewList } from './viewsDialog.styles';

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
	fetchModelSettings: (teamspace: string, modelId: string) => void;
	modelSettings: any;
	setState: (componentState: IViewpointsComponentState) => void;
	onShare?: (teamspace, modelId, viewId) => void;
}

const renderLoadingState = renderWhenTrue(<StyledLoader />);

export const ViewsDialog = ({ viewpoints, searchQuery, searchEnabled, teamspace, modelId, ...props }: IProps) => {
	const [filteredViews, setFilteredViewpoints] = React.useState([]);

	React.useEffect(() => {
		props.fetchViewpoints(teamspace, modelId);
		if (props.modelSettings.model !== modelId) {
			props.fetchModelSettings(teamspace, modelId);
		}
	}, [teamspace, modelId]);

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

	const renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>
			No viewpoints have been created yet.<br />
			Press&nbsp;
			<Link href={`${ROUTES.VIEWER}/${teamspace}/${modelId}`}>
				visit the model</Link> and create some before using this option.
		</EmptyStateInfo>
	));

	const handleSearchQueryChange = ({ currentTarget }) =>
			props.setState({ searchQuery: currentTarget.value.toLowerCase() });

	const renderSearch = renderWhenTrue(() => (
		<SearchField
			placeholder="Search viewpoint..."
			onChange={handleSearchQueryChange}
			autoFocus
			defaultValue={searchQuery}
			fullWidth
			inputProps={{
				style: {
					padding: 12
				}
			}}
		/>
	));

	const { defaultView } = props.modelSettings;

	const checkIfDefaultView = (viewpoint) => defaultView ? viewpoint._id === defaultView.id : false;

	const renderViewsList = renderWhenTrue(() => (
		<ViewsWrapper>
			<ViewList>
				{filteredViews.map((viewpoint) => (
					<ViewItem
						key={viewpoint._id}
						viewpoint={viewpoint}
						onClick={handleViewpointItemClick(viewpoint)}
						onShare={props.onShare}
						teamspace={teamspace}
						modelId={modelId}
						defaultView={checkIfDefaultView(viewpoint)}
						displayShare
					/>
				))}
			</ViewList>
		</ViewsWrapper>
	));

	return (
		<Container loaded={!props.isPending}>
			{renderEmptyState(!viewpoints.length && !props.isPending)}
			{renderSearch(searchEnabled)}
			{renderViewsList(!props.isPending)}
			{renderLoadingState(props.isPending)}
		</Container>
	);
};
