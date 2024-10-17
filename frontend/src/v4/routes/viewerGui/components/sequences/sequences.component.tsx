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
import { IconButton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { RouteComponentProps } from 'react-router';
import { STEP_SCALE } from '../../../../constants/sequences';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { EmptyStateInfo } from '../../../components/components.styles';
import { Loader } from '../../../components/loader/loader.component';
import { PanelBarActions } from '../panelBarActions';
import { SequenceForm } from './components/sequenceForm/';
import { SequencePlayer } from './components/sequencePlayer/sequencePlayer.component';
import SequencesList from './components/sequencesList/sequencesList.container';
import { TasksList } from './components/tasksList/sequenceTasksList.component';
import {
	LoaderContainer, SequencesContainer, SequencesIcon
} from './sequences.styles';

interface IProps extends RouteComponentProps<any> {
	sequences: any;
	setSelectedDate: (date: Date) => void;
	setStepInterval: (interval: number) => void;
	setStepScale: (scale: STEP_SCALE) => void;
	setSelectedSequence: (id: string) => void;
	endDate: Date;
	startDate: Date;
	frames: any[];
	selectedDate: Date;
	selectedStartDate: Date;
	selectedEndingDate: Date;
	stepInterval: number;
	stepScale: STEP_SCALE;
	currentTasks: any[];
	loadingFrame: boolean;
	selectedSequence: any;
	rightPanels: string[];
	setPanelVisibility: (panelName, visibility) => void;
	toggleActivitiesPanel: () => void;
	fetchActivityDetails: (id: string) => void;
	id?: string;
	isActivitiesPending: boolean;
	draggablePanels: string[];
	toggleLegend: () => void;
	resetLegendPanel: () => void;
	clearTransformations: () => void;
	viewpoint: any;
}

const SequenceDetails = ({
	startDate, endDate, selectedDate, selectedStartDate, selectedEndingDate, setSelectedDate, stepInterval, stepScale, setStepInterval,
	setStepScale, currentTasks, loadingFrame, rightPanels, toggleActivitiesPanel,
	fetchActivityDetails, frames, isActivitiesPending, toggleLegend, draggablePanels, viewpoint,
}) => (
	<>
		<SequenceForm />
		<SequencePlayer
			min={startDate}
			max={endDate}
			value={selectedDate}
			endingDate={selectedEndingDate}
			stepInterval={stepInterval}
			stepScale={stepScale}
			onChange={setSelectedDate}
			onChangeStepScale={setStepScale}
			onChangeStepInterval={setStepInterval}
			loadingFrame={loadingFrame}
			rightPanels={rightPanels}
			toggleActivitiesPanel={toggleActivitiesPanel}
			frames={frames}
			isActivitiesPending={isActivitiesPending}
			toggleLegend={toggleLegend}
			draggablePanels={draggablePanels}
			viewpoint={viewpoint}
		/>
		<TasksList
			tasks={currentTasks}
			startDate={selectedStartDate}
			endDate={selectedEndingDate}
			fetchActivityDetails={fetchActivityDetails}
		/>
	</>
);

const SequencesLoader = () => (<LoaderContainer><Loader /></LoaderContainer>);

export class Sequences extends PureComponent<IProps, {}> {
	public componentWillUnmount = () => {
		this.props.setPanelVisibility(VIEWER_PANELS.ACTIVITIES, false);
		this.props.resetLegendPanel();
	}

	public componentDidUpdate(prevProps: Readonly<IProps>) {
		const { selectedSequence, setPanelVisibility, resetLegendPanel } = this.props;
		if (selectedSequence !== prevProps.selectedSequence && !selectedSequence) {
			setPanelVisibility(VIEWER_PANELS.ACTIVITIES, false);
			resetLegendPanel();
		}
	}

	public onSequenceClose = () => {
		this.props.setSelectedSequence(null);
		this.props.clearTransformations();
	}

	public renderTitleIcon = () => {
		if (this.props.selectedSequence) {
			return (
                <IconButton onClick={this.onSequenceClose} size="large">
					<ArrowBack />
				</IconButton>
            );
		}
		return <SequencesIcon />;
	}

	public render = () => {
		const { selectedSequence, setSelectedSequence, sequences } = this.props;

		return (
			<SequencesContainer
				Icon={this.renderTitleIcon()}
				renderActions={() => <PanelBarActions
					type={VIEWER_PANELS.SEQUENCES}
					hideSearch
					hideMenu
				/>}
				id={this.props.id}
				title=""
			>

				{!sequences && <SequencesLoader />}

				{selectedSequence && sequences.length > 0 &&
					<SequenceDetails {...this.props} />
				}

				{sequences && !selectedSequence && sequences.length > 0 &&
					<SequencesList sequences={sequences} setSelectedSequence={setSelectedSequence} />
				}

				{sequences && sequences.length === 0 && <EmptyStateInfo>No sequences found</EmptyStateInfo>}
			</SequencesContainer>
		);
	}
}
