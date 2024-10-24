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

import { PureComponent } from 'react';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { SequenceTasksListContainer, SequenceTasksListItem, TaskListLabel, TaskListLabelTime } from '../../sequences.styles';
import { IActivity, TaskItem } from './sequenceTaskItem.component';

interface IProps {
	tasks: IActivity[];
	startDate: Date;
	endDate: Date;
	fetchActivityDetails: (id: string) => void;
}

interface IState {
	collapsed: boolean;
}

const equalsDate = (dateA: Date, dateB: Date) =>
	(!dateA && !dateB) || (
		dateA.getDate() === dateB.getDate() &&
		dateA.getMonth() === dateB.getMonth() &&
		dateA.getFullYear() === dateB.getFullYear()
	);

export class TasksList extends PureComponent<IProps, IState> {
	public state: IState = {
		collapsed: true
	};

	public get durationLabel() {
		const  {  startDate, endDate } = this.props;

		return (
			<>
				Activities from
				<TaskListLabelTime> {formatDateTime(startDate)} </TaskListLabelTime>
				to
				<TaskListLabelTime> {formatDateTime(endDate)}</TaskListLabelTime>
			</>
		);
	}

	private handleItemClick = (task) => this.props.fetchActivityDetails(task.id);

	private renderTaskList = () => this.props.tasks.map((t) => (
		<SequenceTasksListItem key={t.id}>
			<TaskItem task={t} onItemClick={this.handleItemClick} />
		</SequenceTasksListItem>
	))

	public render = () => {
		return (
			<SequenceTasksListContainer>
				<TaskListLabel>{this.durationLabel}</TaskListLabel>
				{this.renderTaskList()}
			</SequenceTasksListContainer>
		);
	}
}
