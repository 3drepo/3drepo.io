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
import LayersIcon from '@material-ui/icons/Layers';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';

import { Container } from './gis.styles';

interface IProps {
	noop: string; // TODO: Remove sample
}

export class Gis extends React.PureComponent<IProps, any> {
	public handleIconClick = () => {}

	public handleSearchClick = () => {}

	public handleMoreClick = () => {}

	public getTitleIcon = () => {
		return <LayersIcon onClick={this.handleIconClick} />;
	}

	public getActions = () => [
		{
			Icon: SearchIcon,
			handleAction: this.handleSearchClick
		},
		{
			Icon: MoreIcon,
			handleAction: this.handleMoreClick
		}
	]

	public renderFooterContent = () => (
		<>GIS footer</>
	)

	public render() {
		return (
			<ViewerCard
				title="GIS"
				Icon={this.getTitleIcon()}
				actions={this.getActions()}
				renderFooterContent={this.renderFooterContent}
				>
				GIS content
			</ViewerCard>
		);
	}
}
