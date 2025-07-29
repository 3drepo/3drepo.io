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
import { createRef, PureComponent } from 'react';
import { formatMessage } from '@/v5/services/intl';
import BinIcon from '@assets/icons/outlined/delete-outlined.svg'
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';

import { ColorPicker } from '../components/colorPicker/colorPicker.component';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import { CustomTable, CELL_TYPES, TableButton } from '../components/customTable/customTable.component';
import { FloatingActionPanel } from '../components/floatingActionPanel/floatingActionPanel.component';
import { Loader } from '../components/loader/loader.component';
import { NewJobForm } from '../components/newJobForm/newJobForm.component';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';
import { LoaderContainer } from '../userManagement/userManagement.styles';
import { Panel } from '../components/floatingActionPanel/floatingActionPanel.styles';
import { Container } from './jobs.styles';

const JOBS_TABLE_CELLS = [{
	name: 'Job name',
	type: CELL_TYPES.NAME,
	searchBy: ['name'],
	HeadingComponent: CellUserSearch
}, {
	name: formatMessage({ id: 'job.assignedColours', defaultMessage: 'Assigned Colours' }),
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
	fetchJobsAndColors: () => void;
	isPending: boolean;
	usersProvisionedEnabled: boolean;
}

interface IState {
	rows: any[];
	containerElement: Node;
	panelKey: number;
	panelBottomAnchorEl: any;
}

export class Jobs extends PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState) {
		return {
			panelKey: nextProps.jobs.length !== prevState.rows.length ? Math.random() : prevState.panelKey
		};
	}

	public state = {
		rows: [],
		containerElement: null,
		panelKey: Math.random(),
		panelBottomAnchorEl: null,
	};

	public inputRef = createRef<HTMLDivElement>();

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
					disabled: this.props.usersProvisionedEnabled,
					onChange: this.handleColorChange(job._id)
				},
				{},
			];
			if (!this.props.usersProvisionedEnabled) {
				data.push({
					// @ts-expect-error
					Icon: BinIcon,
					onClick: this.onRemove.bind(null, job._id)
				});
			}
			return { ...job, name: job._id, data };
		});
	}

	public componentDidMount() {
		const containerElement = this.inputRef.current?.parentNode;
		this.setState({ containerElement });
		this.props.fetchJobsAndColors();
	}

	public componentDidUpdate(prevProps: Readonly<IProps>) {
		if (prevProps.currentTeamspace !== this.props.currentTeamspace) {
			this.props.fetchJobsAndColors();
		}
	}

	public renderNewJobFormPanel = ({ closePanel }) => {
		const formProps = {
			title: formatMessage({ id: 'jobPanel.addJob', defaultMessage: 'Add new job' }),
			colors: this.props.colors,
			onSave: this.onSave
		};
		return <NewJobForm {...formProps} onCancel={closePanel} />;
	}

	public renderNewJobForm = (container) => (
		<FloatingActionPanel
			container={container}
			key={this.state.panelKey}
			render={this.renderNewJobFormPanel}
			Icon={() => (
				<>
					<AddCircleIcon />
					<FormattedMessage id="newJob.panelButton" defaultMessage="New job" />
				</>
			)}
		/>
	)

	public render() {
		const { jobs, colors, isPending, currentTeamspace, usersProvisionedEnabled } =  this.props;
		const { containerElement, panelBottomAnchorEl } = this.state;

		const closeNewJobForm = () => {
			this.setState({
				...this.state,
				panelBottomAnchorEl: null,
			});
		};

		if (isPending) {
			const content = formatMessage({
				id: 'jobs.loading',
				defaultMessage: 'Loading "{currentTeamspace}" jobs data...',
			}, { currentTeamspace });
			return (
				<LoaderContainer>
					<Loader content={content} />
				</LoaderContainer>
			);
		}

		return (
			<Container ref={this.inputRef}>
				<UserManagementTab footerLabel="Manage jobs">
					<CustomTable
						cells={JOBS_TABLE_CELLS}
						rows={this.getJobsTableRows(jobs, colors)}
					/>
				</UserManagementTab>
				{containerElement && !usersProvisionedEnabled && this.renderNewJobForm(containerElement)}
				<Panel
					open={Boolean(panelBottomAnchorEl)}
					anchorEl={panelBottomAnchorEl}
					onClose={closeNewJobForm}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
					transformOrigin={{
						vertical: 'center',
						horizontal: 'center',
					}}
				>
					{this.renderNewJobFormPanel({ closePanel: () => {} })}
				</Panel>
			</Container>
		);
	}
}
