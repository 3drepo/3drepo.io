/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import { ViewerCard } from '../viewerCard/viewerCard.component';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import AddCircleIcon from '@material-ui/icons/AddCircle';

import {
	FooterWrapper,
	ViewsCountInfo,
	StyledFooterButton
 } from './views.styles';

interface IProps {
	noop: string; // TODO: Remove sample
}

interface IState {
	views: any[];
}

export class Views extends React.PureComponent<IProps, IState> {
	public state = {
		views: []
	};

	public getTitleIcon = () => <PhotoCameraIcon/>;

	public handleSearchView = () => {
		console.log('Search');
	}

	public handleAddView = () => {
		console.log('Add');
	}

	public getSearchButton = () => 	(
		<IconButton onClick={this.handleSearchView}>
			<SearchIcon />
		</IconButton>)

	public getActions = () =>
	[
		{ Button: this.getSearchButton }
	]

	public renderFooterContent = () => {
		return (
			<FooterWrapper>
				<ViewsCountInfo>{`${this.state.views.length} views displayed`}</ViewsCountInfo>
				<StyledFooterButton aria-label="Add view" onClick={this.handleAddView}>
					<AddCircleIcon color="secondary" />
				</StyledFooterButton>
			</FooterWrapper>
		);
	}

	public render() {
		return (
			<ViewerCard
				title="Views"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				renderFooterContent={this.renderFooterContent}
			>
				Views component
			</ViewerCard>
		);
	}
}
