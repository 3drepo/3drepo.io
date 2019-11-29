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

import React from 'react';

import { renderWhenTrue } from '../../../helpers/rendering';
import { Loader } from '../loader/loader.component';
import { Log } from './components/log/log.component';
import { Container, EmptyStateInfo, LoaderContainer } from './logList.styles';

interface IProps {
	className?: string;
	items: any[];
	isPending: boolean;
	currentUser: string;
	teamspace: string;
	commentsRef?: any;
	removeLog: (index, guid) => void;
	setCameraOnViewpoint: (viewpoint) => void;
}

export class LogList extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		items: []
	};

	public renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>
			No comments
		</EmptyStateInfo>
	));

	public renderLogItem = (item, index) => {
		return (
			<Log
				{...item}
				key={item.guid + item._id}
				removeLog={this.props.removeLog}
				index={index}
				teamspace={this.props.teamspace}
				currentUser={this.props.currentUser}
				setCameraOnViewpoint={this.props.setCameraOnViewpoint}
			/>
		);
	}

	public renderLoader = () => {
		return (
			<LoaderContainer>
				<Loader size={18} />
			</LoaderContainer>
		);
	}

	public render() {
		return (
			<Container className={this.props.className} ref={this.props.commentsRef}>
				{this.props.isPending ? this.renderLoader() : this.props.items.map(this.renderLogItem)}
				{this.renderEmptyState(!this.props.isPending && !this.props.items.length)}
			</Container>
		);
	}
}
