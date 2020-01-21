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

import { IconButton } from '@material-ui/core';
import CollapsedIcon from '@material-ui/icons/ChevronRight';
import ExpandedIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { Task, TaskButton } from '../../sequences.styles';

export interface ITask {
	_id: string;
	name: string;
	tasks?: ITask[];
	startDate: Date;
	endDate: Date;
}

interface IProps {
	tasks: ITask[];
	nested?: boolean;
}

interface IState {
	collapsed: boolean;
}

const CollapseButton = ({collapsed, onClick}) => {
	const Icon = collapsed ? CollapsedIcon : ExpandedIcon;
	return (<TaskButton onClick={onClick}><Icon /></TaskButton>);
};

export class Tasks extends React.PureComponent<IProps, IState> {
	public state: IState = {
		collapsed: true
	};

	public toggleCollapse = () => {
		this.setState({collapsed: !this.state.collapsed});
	}

	public render = () => {
		const { tasks, nested } = this.props;
		const { collapsed } = this.state;

		return (
			<Task padding={nested}>
				{tasks.map((t) => (
					<Task key={t._id} padding={(!t.tasks || !t.tasks.length)}>
						{(t.tasks && t.tasks.length > 0) && <CollapseButton collapsed={collapsed} onClick={this.toggleCollapse} />}
						{t.name}
						{(t.tasks && !collapsed) && (<Tasks nested tasks={t.tasks} />)}
					</Task>))
				}
			</Task>
		);
	}
}
