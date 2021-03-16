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

import React from 'react';

import { IconButton } from '@material-ui/core';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { STEP_SCALE } from '../../../../constants/sequences';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { EmptyStateInfo } from '../../../components/components.styles';
import { Loader } from '../../../components/loader/loader.component';
import { PanelBarActions } from '../panelBarActions';
import { SequenceForm } from './components/sequenceForm/';
import { SequencePlayer } from './components/sequencePlayer/sequencePlayer.component';
import { SequencesList } from './components/sequencesList/sequencesList.component';
import { TasksList } from './components/tasksList/sequenceTasksList.component';
import {
	LoaderContainer, SequencesContainer, SequencesIcon
} from './sequences.styles';

interface IProps {
	sequences: any;
	setSelectedDate: (date: Date) => void;
	fetchSelectedFrame: () => void;
	setStepInterval: (interval: number) => void;
	setStepScale: (scale: STEP_SCALE) => void;
	setSelectedSequence: (id: string) => void;
	maxDate: Date;
	minDate: Date;
	frames: any[];
	selectedDate: Date;
	selectedEndingDate: Date;
	colorOverrides: any;
	stepInterval: number;
	stepScale: STEP_SCALE;
	currentTasks: any[];
	loadingFrame: boolean;
	selectedSequence: any;
	rightPanels: string[];
	setPanelVisibility: (panelName, visibility) => void;
	toggleActivitiesPanel: () => void;
	fetchActivityDetails: (id: string) => void;
	deselectViewsAndLeaveClipping: () => void;
	id?: string;
	isActivitiesPending: boolean;
	draggablePanels: string[];
	toggleLegend: () => void;
	resetLegendPanel: () => void;
}

const da =  new Date();

const SequenceDetails = ({
	minDate, maxDate, selectedDate, selectedEndingDate, setSelectedDate, stepInterval, stepScale, setStepInterval,
	setStepScale, currentTasks, loadingFrame,  rightPanels, toggleActivitiesPanel, fetchActivityDetails, onPlayStarted,
	frames, isActivitiesPending, toggleLegend, draggablePanels
}) => (
		<>
			<SequenceForm />
			<SequencePlayer
				min={minDate}
				max={maxDate}
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
				onPlayStarted={onPlayStarted}
				frames={frames}
				isActivitiesPending={isActivitiesPending}
				toggleLegend={toggleLegend}
				draggablePanels={draggablePanels}
			/>
			<TasksList
				tasks={currentTasks}
				minDate={selectedDate}
				maxDate={selectedEndingDate}
				fetchActivityDetails={fetchActivityDetails}
			/>
		</>
	);

const SequencesLoader = () => (<LoaderContainer><Loader /></LoaderContainer>);

export class Sequences extends React.PureComponent<IProps, {}> {
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
				<IconButton onClick={() => this.props.setSelectedSequence(null)}>
					<ArrowBack />
				</IconButton>
			);
		}
		return <SequencesIcon />;
	}

	public onPlayStarted = () => {
		this.props.deselectViewsAndLeaveClipping();
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
