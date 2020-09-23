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
import { SequencePlayer } from './components/sequencePlayer/sequencePlayer.component';
import { SequencesList } from './components/sequencesList/sequencesList.component';
import { TasksList } from './components/tasksList/sequenceTasksList.component';
import {
	LoaderContainer, SequencesContainer, SequencesIcon
} from './sequences.styles';

interface IProps {
	sequences: any;
	initializeSequences: () => void;
	setSelectedFrame: (date: Date) => void;
	fetchFrame: (date: Date) => void;
	setStepInterval: (interval: number) => void;
	setStepScale: (scale: STEP_SCALE) => void;
	setSelectedSequence: (id: string) => void;
	restoreIfcSpacesHidden: () => void;
	maxDate: Date;
	minDate: Date;
	selectedDate: Date;
	selectedMinDate: Date;
	colorOverrides: any;
	stepInterval: number;
	stepScale: STEP_SCALE;
	currentTasks: any[];
	loadingFrame: boolean;
	selectedSequence: any;
}

const da =  new Date();

const SequenceDetails = ({ minDate, maxDate, selectedDate,
	setSelectedFrame, stepInterval,
	stepScale, setStepInterval, setStepScale,
	currentTasks, selectedMinDate, loadingFrame,
	fetchFrame }) => (
		<>
			<SequencePlayer
				min={minDate}
				max={maxDate}
				value={selectedDate}
				stepInterval={stepInterval}
				stepScale={stepScale}
				onChange={setSelectedFrame}
				onChangeStepScale={setStepScale}
				onChangeStepInterval={setStepInterval}
				loadingFrame={loadingFrame}
				fetchFrame={fetchFrame}
			/>
			<TasksList tasks={currentTasks}
				minDate={selectedMinDate}
				maxDate={selectedDate}
				loadingFrame={loadingFrame} />
		</>
	);

const SequencesLoader = () => (<LoaderContainer><Loader /></LoaderContainer>);

export class Sequences extends React.PureComponent<IProps, {}> {
	public componentDidMount = () => {
		this.props.initializeSequences();
	}

	public componentWillUnmount = () => {
		this.props.restoreIfcSpacesHidden();
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
			>

				{!sequences && <SequencesLoader />}

				{sequences && selectedSequence && sequences.length > 0 &&
					<SequenceDetails {...this.props} />
				}

				{sequences  && !selectedSequence && sequences.length > 0 &&
					<SequencesList sequences={sequences} setSelectedSequence={setSelectedSequence} />
				}

				{sequences && sequences.length === 0 && <EmptyStateInfo>No sequences found</EmptyStateInfo>}
			</SequencesContainer>
		);
	}
}
