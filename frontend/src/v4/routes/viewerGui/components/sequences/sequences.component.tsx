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
import { PureComponent, useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { STEP_SCALE } from '../../../../constants/sequences';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { MODAL_TODAY_NOT_AVAILABLE_BODY, getDateWithinBoundaries, getSelectedFrame } from '../../../../modules/sequences/sequences.helper';
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

interface IProps {
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
	colorOverrides: any;
	stepInterval: number;
	stepScale: STEP_SCALE;
	currentTasks: any[];
	loadingFrameState: boolean;
	loadingViewpoint: boolean;
	selectedSequence: any;
	rightPanels: string[];
	setPanelVisibility: (panelName, visibility) => void;
	toggleActivitiesPanel: () => void;
	fetchActivityDetails: (id: string) => void;
	deselectViewsAndLeaveClipping: () => void;
	showViewpoint: (teamspace: string, model: string, viewpoint: any) => void;
	id?: string;
	isActivitiesPending: boolean;
	draggablePanels: string[];
	toggleLegend: () => void;
	resetLegendPanel: () => void;
	openOnToday: boolean;
}

const da =  new Date();

const SequenceDetails = ({
	startDate, endDate, selectedDate, selectedStartDate, selectedEndingDate, setSelectedDate, stepInterval, stepScale, setStepInterval,
	setStepScale, currentTasks, loadingFrameState, loadingViewpoint, rightPanels, toggleActivitiesPanel, openOnToday,
	fetchActivityDetails, onPlayStarted, frames, isActivitiesPending, toggleLegend, draggablePanels
}) => {
	const [dateToUse, setDateToUse] = useState(null);

	useEffect(() => {
		if (!openOnToday || selectedDate) {
			setDateToUse(selectedDate);
			return;
		}

		const now = new Date();
		const newDateToUse = getDateWithinBoundaries(now, new Date(startDate), new Date(endDate));
		setDateToUse(newDateToUse);

		if (newDateToUse.getTime() !== now.getTime()) {
			DialogsActionsDispatchers.open('info', MODAL_TODAY_NOT_AVAILABLE_BODY);
		}
	}, []);

	if (!dateToUse) {
		return null;
	}

	return (
		<>
			<SequenceForm />
			<SequencePlayer
				min={startDate}
				max={endDate}
				value={dateToUse}
				endingDate={selectedEndingDate}
				stepInterval={stepInterval}
				stepScale={stepScale}
				onChange={setSelectedDate}
				onChangeStepScale={setStepScale}
				onChangeStepInterval={setStepInterval}
				loadingFrame={loadingFrameState || loadingViewpoint}
				rightPanels={rightPanels}
				toggleActivitiesPanel={toggleActivitiesPanel}
				onPlayStarted={onPlayStarted}
				frames={frames}
				isActivitiesPending={isActivitiesPending}
				toggleLegend={toggleLegend}
				draggablePanels={draggablePanels}
			/>
			<TasksList
				tasks={currentTasks}
				startDate={selectedStartDate}
				endDate={selectedEndingDate}
				fetchActivityDetails={fetchActivityDetails}
			/>
		</>
	);
};

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

	public renderTitleIcon = () => {
		if (this.props.selectedSequence) {
			return (
                <IconButton onClick={() => this.props.setSelectedSequence(null)} size="large">
					<ArrowBack />
				</IconButton>
            );
		}
		return <SequencesIcon />;
	}

	public onPlayStarted = () => {
		const {
			selectedStartDate,
			frames,
			deselectViewsAndLeaveClipping
		} = this.props;
		const { viewpoint } = getSelectedFrame(frames, selectedStartDate);

		if (!viewpoint) {
			deselectViewsAndLeaveClipping();
		}
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
			>

				{!sequences && <SequencesLoader />}

				{selectedSequence && sequences.length > 0 &&
					<SequenceDetails {...this.props} onPlayStarted={this.onPlayStarted} />
				}

				{sequences && !selectedSequence && sequences.length > 0 &&
					<SequencesList sequences={sequences} setSelectedSequence={setSelectedSequence} />
				}

				{sequences && sequences.length === 0 && <EmptyStateInfo>No sequences found</EmptyStateInfo>}
			</SequencesContainer>
		);
	}
}
