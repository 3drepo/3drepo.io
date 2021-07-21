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

import CollapsedIcon from '@material-ui/icons/ChevronRight';
import ExpandedIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { SubTasksItemContainer, Task, TaskButton, TaskItemLabel, TaskSmallDot } from '../../sequences.styles';

export interface IActivity {
	id: string;
	name: string;
	subActivities?: IActivity[];
	startDate: Date;
	endDate: Date;
}

interface IProps {
	task: IActivity;
	nested?: boolean;
	defaultCollapsed?: boolean;
	onItemClick?: (value?: any) => void;
}

interface IState {
	collapsed: boolean;
}

const CollapseButton = ({collapsed, onClick}) => {
	const Icon = collapsed ? CollapsedIcon : ExpandedIcon;
	return (<TaskButton onClick={onClick}><Icon /></TaskButton>);
};

export class TaskItem extends React.PureComponent<IProps, IState> {
	public state: IState = {
		collapsed: this.props.defaultCollapsed  || false
	};

	public componentDidUpdate(prevProps, prevState) {
		const { defaultCollapsed } = this.props;

		if (prevProps.defaultCollapsed !== defaultCollapsed) {
			this.setState({
				collapsed: defaultCollapsed,
			});
		}
	}

	public toggleCollapse = () => {
		this.setState({collapsed: !this.state.collapsed});
	}

	public handleItemClick = () => {
		this.props.onItemClick(this.props.task);
	}

	public render = () => {
		const { task: task, nested, defaultCollapsed, onItemClick } = this.props;
		const { collapsed } = this.state;
		const subActivities = task.subActivities || [];
		const hasSubtasks = subActivities.length > 0;

		return (
			<>
				<Task>
					{hasSubtasks && <CollapseButton collapsed={collapsed} onClick={this.toggleCollapse} />}
					{!hasSubtasks && <TaskSmallDot />}
					<TaskItemLabel clickable onClick={this.handleItemClick} >
						{task.name || 'Unnamed'}
					</TaskItemLabel>
				</Task>
				<SubTasksItemContainer>
					{!collapsed && subActivities.map((t) => (
						<TaskItem key={t.id} task={t} defaultCollapsed={defaultCollapsed} onItemClick={onItemClick} />
					))}
				</SubTasksItemContainer>
			</>
		);
	}
}
