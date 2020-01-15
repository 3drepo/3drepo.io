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

import { STEP_SCALE } from '../../../../constants/sequences';
import { SequencePlayer } from './components/sequencePlayer/sequencePlayer.component';
import {
	SequencesContainer, SequencesIcon,
} from './sequences.styles';

interface IProps {
	sequences: any;
	initializeSequences: () => void;
	setSelectedFrame: (date: Date) => void;
	setStepInterval: (interval: number) => void;
	setStepScale: (scale: STEP_SCALE) => void;
	maxDate: Date;
	minDate: Date;
	selectedDate: Date;
	colorOverrides: any;
	stepInterval: number;
	stepScale: STEP_SCALE;
	currentActivities: any[];
}

export class Sequences extends React.PureComponent<IProps, {}> {
	public componentDidMount = () => {
		this.props.initializeSequences();
	}

	public componentDidUpdate = () => {
		// console.log(this.props.currentActivities);
	}

	public render = () => {
		const {minDate, maxDate, selectedDate,
			setSelectedFrame, stepInterval,
			stepScale, setStepInterval, setStepScale } = this.props;

		return (
			<SequencesContainer
				Icon={<SequencesIcon />}
				renderActions={() => (<></>)}
				pending={false}
			>
				<SequencePlayer
					min={minDate}
					max={maxDate}
					value={selectedDate}
					stepInterval={stepInterval}
					stepScale={stepScale}
					onChange={setSelectedFrame}
					onChangeStepScale={setStepScale}
					onChangeStepInterval={setStepInterval}
				/>
			</SequencesContainer>

	);
	}
}
