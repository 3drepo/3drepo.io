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
import { pick } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { theme } from '../../styles';
import { FloatingActionPanel } from '../components/floatingActionPanel/floatingActionPanel.component';
import { NewJobForm } from '../components/newJobForm/newJobForm.component';
import { CELL_TYPES, CustomTable } from '../components/customTable/customTable.component';

import { Container, Content, Footer } from './jobs.styles';

const JOBS_TABLE_CELLS = [{
	name: 'Job name',
	type: CELL_TYPES.NAME,
	searchBy: ['name']
}, {
	name: 'Colour',
	type: CELL_TYPES.COLOR,
	hideSortIcon: true
}, {
	type: CELL_TYPES.EMPTY
}, {
	type: CELL_TYPES.ICON_BUTTON
}];

interface IProps {
	jobs: any[];
	colors: any[];
	create: (job) => void;
	remove: (jobId) => void;
	updateColor: (job) => void;
	active?: boolean;
}

export class Jobs extends React.PureComponent<IProps, any> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState) {
		if (nextProps.active !== prevState.active) {
			return { active: nextProps.active };
		}

		return {
			rows: nextProps.jobs.map(({_id: name, color}) => ({name, color, value: name})),
			jobsSize: nextProps.jobs.length,
			panelKey: nextProps.jobs.length !== prevState.rows.length ? Math.random() : prevState.panelKey
		};
	}

	public state = {
		rows: [],
		jobsSize: 0,
		containerElement: null,
		active: true,
		panelKey: Math.random()
	};

	public componentDidMount() {
		const containerElement = (ReactDOM.findDOMNode(this) as HTMLElement).closest('md-content');
		this.setState({ containerElement });
	}

	public handleColorChange = (jobId) => (color) => {
		this.props.updateColor({_id: jobId, color});
	}

	public onRemove = (jobId) => {
		this.props.remove(jobId);
	}

	public onSave = ({name, color}) => {
		this.props.create({ _id: name, color });
	}

	public getJobsTableRows = (jobs = [], colors = []): any[] => {
		return jobs.map((job) => {
			const data = [
				pick(job, ['value']),
				{
					value: job.color,
					predefinedColors: colors,
					onChange: this.handleColorChange(job.name)
				},
				{},
				{
					icon: 'remove_circle',
					onClick: this.onRemove.bind(null, job.name)
				}
			];
			return { ...job, data };
		});
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
		const { containerElement, active, rows } = this.state;
		const { colors } = this.props;

		const preparedRows = this.getJobsTableRows(rows, colors);
		return (
			<MuiThemeProvider theme={theme}>
				<>
					<Container
						container
						direction="column"
						alignItems="stretch"
						wrap="nowrap"
					>
						<Content item>
							<CustomTable
								cells={JOBS_TABLE_CELLS}
								rows={preparedRows}
							/>
						</Content>
						{rows.length && (<Footer item>Manage jobs</Footer>)}
					</Container>
					{active && containerElement && this.renderNewJobForm(containerElement)}
				</>
			</MuiThemeProvider>
		);
	}
}
