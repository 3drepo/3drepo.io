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

import { Container } from './viewerCard.styles';
import { Panel } from '../../../components/panel/panel.component';

const ViewerCardTitle = ({title, Icon}) => (
	<p>
		{title}
		{Icon}
	</p>
);

interface IProps {
	title: string;
	Icon: JSX.Element;
}

export class ViewerCard extends React.PureComponent<IProps, any> {
	public getTitle = () => {
		const { title, Icon } = this.props;
		return (
			<ViewerCardTitle title={title} Icon={Icon} />
		);
	}

	public render() {
		return (
			<Panel title={this.getTitle()}>
				ViewerCard component
			</Panel>
		);
	}
}
