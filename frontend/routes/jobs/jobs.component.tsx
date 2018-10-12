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
import * as ReactDOM from 'react-dom';
import { pick, isEqual, isEmpty } from 'lodash';

import { FloatingActionPanel } from '../components/floatingActionPanel/floatingActionPanel.component';
import { NewJobForm } from '../components/newJobForm/newJobForm.component';
import { CELL_TYPES, CustomTable, TableButton } from '../components/customTable/customTable.component';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import { ColorPicker } from '../components/colorPicker/colorPicker.component';
import { Container } from './jobs.styles';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';

const JOBS_TABLE_CELLS = [{
	name: 'Job name',
	type: CELL_TYPES.NAME,
	searchBy: ['name'],
	HeadingComponent: CellUserSearch
}, {
	name: 'Colour',
	type: CELL_TYPES.COLOR,
	HeadingProps: {
		component: {
			hideSortIcon: true
		}
	},
	CellComponent: ColorPicker
}, {
	type: CELL_TYPES.EMPTY
}, {
	type: CELL_TYPES.ICON_BUTTON,
	CellComponent: TableButton
}];

interface IProps {
	currentTeamspace: string;
	jobs: any[];
	colors: any[];
	create: (teamspace, job) => void;
	remove: (teamspace, jobId) => void;
	updateColor: (teamspace, job) => void;
}

interface IState {
	rows: any[];
	containerElement: Node;
	panelKey: number;
}

export class Jobs extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState) {
		return {
			panelKey: nextProps.jobs.length !== prevState.rows.length ? Math.random() : prevState.panelKey
		};
	}

	public state = {
		rows: [],
		containerElement: null,
		panelKey: Math.random()
	};

	public handleColorChange = (jobId) => (color) => {
		this.props.updateColor(this.props.currentTeamspace, {_id: jobId, color});
	}

	public onRemove = (jobId) => {
		this.props.remove(this.props.currentTeamspace, jobId);
	}

	public onSave = ({name, color}) => {
		this.props.create(this.props.currentTeamspace, { _id: name, color });
	}

	public getJobsTableRows = (jobs = [], colors = []): any[] => {
		return jobs.map((job) => {
			const data = [
				{
					value: job._id
				},
				{
					value: job.color,
					predefinedColors: colors,
					disableUnderline: true,
					onChange: this.handleColorChange(job._id)
				},
				{},
				{
					icon: 'remove_circle',
					onClick: this.onRemove.bind(null, this.props.currentTeamspace, job._id)
				}
			];
			return { ...job, name: job._id, data };
		});
	}

	public componentDidMount() {
		const containerElement = (ReactDOM.findDOMNode(this) as HTMLElement).parentNode;
		this.setState({
			containerElement,
			rows: this.getJobsTableRows(this.props.jobs, this.props.colors)
		});
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as any;

		const colorsChanged = !isEqual(prevProps.colors, this.props.colors);
		const jobsChanged = !isEqual(prevProps.jobs, this.props.jobs);

		if (jobsChanged || colorsChanged) {
			changes.rows = this.getJobsTableRows(this.props.jobs, this.props.colors);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderNewJobForm = (container) => {
		const formProps = {
			title: 'Add new job',
			colors: this.props.colors,
			onSave: this.onSave
		};

		return (
			<FloatingActionPanel
				container={container}
				key={this.state.panelKey}
				render={({ closePanel }) => {
					return <NewJobForm {...formProps} onCancel={closePanel} />;
				}}
			/>
		);
	}

	public render() {
		const { containerElement, rows } = this.state;
		const { colors } = this.props;

		return (
			<Container>
					<UserManagementTab footerLabel="Manage jobs">
							<CustomTable
									cells={JOBS_TABLE_CELLS}
									rows={rows}
							/>
					</UserManagementTab>
					{containerElement && this.renderNewJobForm(containerElement)}
			</Container>
		);
	}
}
