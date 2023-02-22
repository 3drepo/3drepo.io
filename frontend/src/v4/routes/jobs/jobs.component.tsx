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
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import ReactDOM from 'react-dom';
import { isV5 } from '@/v4/helpers/isV5';
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
import { Container, NewJobBottomButton } from './jobs.styles';

const JOBS_TABLE_CELLS = [{
	name: 'Job name',
	type: CELL_TYPES.NAME,
	searchBy: ['name'],
	HeadingComponent: CellUserSearch
}, {
	name: isV5() ? formatMessage({ id: 'job.assignedColours', defaultMessage: 'Assigned Colours' }) : 'Colour',
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
	users: Array<{ job: string }>;
	colors: any[];
	create: (teamspace, job) => void;
	remove: (teamspace, jobId) => void;
	updateColor: (teamspace, job) => void;
	fetchJobsAndColors: () => void;
	isPending: boolean;
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

	public handleColorChange = (jobId) => (color) => {
		this.props.updateColor(this.props.currentTeamspace, {_id: jobId, color});
	}

	public onRemove = (jobId) => {
		this.props.remove(this.props.currentTeamspace, jobId);
	}

	public onSave = ({name, color}) => {
		this.props.create(this.props.currentTeamspace, { _id: name, color });
	}

	public jobIsAssigned = ({ _id }) => {
		const { users } = this.props;
		const assignedJobs = new Set(users.map(({ job }) => job));
		return assignedJobs.has(_id);
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
					Icon: isV5() ? BinIcon : RemoveCircle,
					disabled: this.jobIsAssigned(job),
					onClick: this.onRemove.bind(null, job._id)
				}
			];
			return { ...job, name: job._id, data };
		});
	}

	public componentDidMount() {
		const containerElement = (ReactDOM.findDOMNode(this) as HTMLElement).parentNode;
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
			{...(isV5() ? {
				Icon: () => (
					<>
						<AddCircleIcon />
						<FormattedMessage id="newJob.panelButton" defaultMessage="New job" />
					</>
				)
			} : {})}
		/>
	)

	public render() {
		const { jobs, colors, isPending, currentTeamspace } =  this.props;
		const { containerElement, panelBottomAnchorEl } = this.state;

		const openNewJobForm = ({ currentTarget }: React.MouseEvent<HTMLDivElement>) => {
			this.setState({
				...this.state,
				panelBottomAnchorEl: currentTarget,
			});
		};

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
			<Container>
				<UserManagementTab footerLabel="Manage jobs">
					<CustomTable
						cells={JOBS_TABLE_CELLS}
						rows={this.getJobsTableRows(jobs, colors)}
					/>
				</UserManagementTab>
				{containerElement && this.renderNewJobForm(containerElement)}
				{isV5() && (
					<>
						<NewJobBottomButton onClick={openNewJobForm}>
							<AddCircleIcon />
							<FormattedMessage id="jobs.addJobButton" defaultMessage="Add new Job" />
						</NewJobBottomButton>
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
					</>
				)}
			</Container>
		);
	}
}
