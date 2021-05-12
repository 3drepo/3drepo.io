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

import { FormControlLabel, FormGroup, Grid, IconButton, MenuItem, Select, Switch } from '@material-ui/core';
import StepForwardIcon from '@material-ui/icons/FastForward';
import StepBackIcon from '@material-ui/icons/FastRewind';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Replay from '@material-ui/icons/Replay';
import Stop from '@material-ui/icons/Stop';
import { debounce, findIndex, noop } from 'lodash';

import { STEP_SCALE } from '../../../../../../constants/sequences';
import { VIEWER_PANELS } from '../../../../../../constants/viewerGui';
import { isDateOutsideRange, MILLI_PER_HOUR } from '../../../../../../helpers/dateTime';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { IFrame } from '../../../../../../modules/sequences';
import { getDateByStep, getSelectedFrameIndex } from '../../../../../../modules/sequences/sequences.helper';
import { LONG_DATE_TIME_FORMAT_NO_MINUTES } from '../../../../../../services/formatting/formatDate';
import {
	DatePicker,
	IntervalRow,
	SequencePlayerColumn,
	SequencePlayerContainer,
	SequenceRow,
	SequenceSlider,
	SliderRow,
	StepInput,
	StyledLoader,
} from '../../sequences.styles';

interface IProps {
	max: Date;
	min: Date;
	onChange?: (date: Date) => void;
	value?: Date;
	endingDate?: Date;
	stepInterval?: number;
	stepScale?: STEP_SCALE;
	onChangeStepInterval?: (value: number) => void;
	onChangeStepScale?: (value: STEP_SCALE) => void;
	loadingFrame: boolean;
	rightPanels: string[];
	toggleActivitiesPanel: () => void;
	onPlayStarted?: () => void;
	frames: IFrame[];
	isActivitiesPending: boolean;
	draggablePanels: string[];
	toggleLegend: () => void;
}

interface IState {
	value?: Date;
	playing: boolean;
	intervalId: number;
	stepInterval: number;
	stepScale: STEP_SCALE;
	waitingForFrameLoad: boolean;
	sliderValue: number | null;
}

export class SequencePlayer extends React.PureComponent<IProps, IState> {
	private playInterval = 1000;
	public state: IState = {
		value: null,
		playing: false,
		intervalId: 0,
		stepInterval: 1,
		stepScale: STEP_SCALE.DAY,
		waitingForFrameLoad: false,
		sliderValue: null,
	};

	get currentTime() {
		return (+this.state.value) - (+this.props.min);
	}

	get totalTime() {
		return (+this.props.max) - (+this.props.min);
	}

	get isFirstDay() {
		return this.currentTime === 0;
	}

	get isLastDay() {
		return this.currentTime === this.totalTime;
	}

	get PlayButtonIcon() {
		return this.state.playing ?
				Stop :
			this.isLastDay ?
				Replay :
				PlayArrow;
	}

	public setValue = (newValue: Date) => {
		const endDate = this.props.max.valueOf();
		const startDate = this.props.min.valueOf();
		newValue = new Date(Math.min(endDate, Math.max(startDate, newValue.valueOf())));

		if (this.props.onChange) {
			this.props.onChange(newValue);
		}

		this.setState({value: newValue, sliderValue: null});
	}

	public setTime = (currentTime) => {
		const newValue = new Date(this.props.min + currentTime);
		this.setValue(newValue);
	}

	public goTo = (val) => {
		this.stop();
		this.setTime(val);
	}

	public debouncedGoto = debounce(this.goTo, 150);

	public gotoDate = (val) => {
		this.stop();
		this.setValue(val);
	}

	public componentDidUpdate(prevProps: IProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({value: this.props.value});
		}

		if (prevProps.stepScale !== this.props.stepScale) {
			this.setState({stepScale: this.props.stepScale});
		}

		if (prevProps.stepInterval !== this.props.stepInterval) {
			this.setState({stepInterval: this.props.stepInterval});
		}

		if (prevProps.loadingFrame !== this.props.loadingFrame &&
			!this.props.loadingFrame && this.state.waitingForFrameLoad) {
			setTimeout(() => {
				this.nextStep();
				this.play();
			}, this.playInterval);
		}
	}

	public onClickPlayStop = () => {
		if (this.state.playing) {
			this.stop();
		} else {
			this.play();
		}
	}

	public onChangeStepInterval = (e) => {
		let stepInterval = parseInt(e.target.value, 10);
		stepInterval = isNaN(stepInterval) ? 1 : Math.max(1, Math.min(100, stepInterval));
		this.setState({stepInterval});
		if (this.props.onChangeStepInterval) {
			this.props.onChangeStepInterval(stepInterval);
		}
	}

	public onChangeStepScale = (e) => {
		const stepScale = parseInt(e.target.value, 10);
		this.setState({ stepScale });
		if (this.props.onChangeStepScale) {
			this.props.onChangeStepScale(stepScale);
		}
	}

	public moveStep = (direction) => {
		const { value, stepInterval, stepScale } = this.state;

		if (stepScale !== STEP_SCALE.FRAME) {
			const nextValue = getDateByStep(value, stepScale, stepInterval * direction);
			this.setValue(nextValue);
		} else {
			const { frames } = this.props;
			const index = getSelectedFrameIndex(frames, value);
			const newValue = frames[index + stepInterval * direction]?.dateTime;
			if (newValue) {
				this.setValue(newValue);
			}
		}

		// If it reached the end of the timeline, stop playing.
		if (this.isLastDay) {
			this.stop();
		}
	}

	public nextStep = this.moveStep.bind(this, 1);

	public prevStep = this.moveStep.bind(this, -1);

	public play = () => {
		(this.props.onPlayStarted || noop )();
		this.stop();

		const intervalId = (setInterval(() => {
			if (this.props.loadingFrame && this.state.playing) {
				clearInterval(this.state.intervalId);
				this.setState({ waitingForFrameLoad: true});
				return;
			}

			this.nextStep();
		}, this.playInterval) as unknown) as number;

		this.setState({
			playing: true,
			waitingForFrameLoad: false,
			intervalId
		});

		// This sets the date value back to the start if it reached the end of the timeline
		const dateValue = this.isLastDay ? this.props.min : this.state.value;
		this.setValue(dateValue);
	}

	public stop() {
		clearInterval(this.state.intervalId);
		this.setState({playing: false, waitingForFrameLoad: false});
	}

	public componentDidMount() {
		if (this.props.value) {
			this.setState({value: this.props.value});
			if (this.props.onChange) {
				this.props.onChange(this.props.value);
			}
		}

		if (this.props.stepInterval) {
			this.setState({stepInterval: this.props.stepInterval});
		}

		if (this.props.stepScale) {
			this.setState({stepScale: this.props.stepScale});
		}
	}

	public componentWillUnmount() {
		this.stop();
	}

	public rewind = () => {
		this.stop();
		this.prevStep();
	}

	public forward =  () => {
		this.stop();
		this.nextStep();
	}

	private renderLoader = renderWhenTrue(() => (
		<StyledLoader horizontal size={14} content="Loading frame..." />
	));

	public render() {
		const { value, stepScale , stepInterval } = this.state;

		return (
			<SequencePlayerContainer>
				<SequencePlayerColumn>
					<SequenceRow>
						<Grid item>
							<IconButton disabled={this.isFirstDay} onClick={this.rewind} size="small">
								<StepBackIcon fontSize="large" />
							</IconButton>
						</Grid>
						<Grid item>
							<DatePicker
								shouldDisableDate={(date) => isDateOutsideRange(this.props.min, this.props.max, date.$d)}
								name="date"
								inputId="1"
								value={value}
								format={LONG_DATE_TIME_FORMAT_NO_MINUTES}
								onChange={(e) => this.gotoDate(new Date(Math.floor(e.target.value / MILLI_PER_HOUR) * MILLI_PER_HOUR))}
								placeholder="date"
								dateTime
							/>
						</Grid>
						<Grid item>
							<IconButton disabled={this.isLastDay} onClick={this.forward} size="small">
								<StepForwardIcon fontSize="large" />
							</IconButton>
						</Grid>
					</SequenceRow>
					<IntervalRow>
						Step interval: <StepInput value={stepInterval} onChange={this.onChangeStepInterval} />
						&nbsp;
						<Select value={stepScale} onChange={this.onChangeStepScale} >
							<MenuItem value={STEP_SCALE.HOUR}>hour(s)</MenuItem>
							<MenuItem value={STEP_SCALE.DAY}>day(s)</MenuItem>
							<MenuItem value={STEP_SCALE.MONTH}>month(s)</MenuItem>
							<MenuItem value={STEP_SCALE.YEAR}>year(s)</MenuItem>
							<MenuItem value={STEP_SCALE.FRAME}>frame(s)</MenuItem>
						</Select>
					</IntervalRow>
					<SliderRow>
						<Grid item>
							<IconButton onClick={this.onClickPlayStop} ><this.PlayButtonIcon /></IconButton>
						</Grid>
						<Grid item>
							<SequenceSlider
								max={this.totalTime}
								step={36000000}
								value={this.state.sliderValue || this.currentTime}
								onChange={(e, val) =>  {
									this.debouncedGoto(val);
									this.setState({sliderValue: val});
								}}
							/>
						</Grid>
					</SliderRow>
					<FormGroup row>
						<FormControlLabel
							control={<Switch
								checked={this.props.draggablePanels.includes(VIEWER_PANELS.LEGEND)}
								onChange={this.props.toggleLegend}
								color="primary"
							/>}
							label="Show Legend"
						/>
						<FormControlLabel
							control={<Switch
								checked={this.props.rightPanels.includes(VIEWER_PANELS.ACTIVITIES)}
								onChange={this.props.toggleActivitiesPanel}
								color="primary"
							/>}
							label="Full Activity List"
						/>
					</FormGroup>
					{this.renderLoader(this.props.loadingFrame && !this.props.isActivitiesPending)}
				</SequencePlayerColumn>
			</SequencePlayerContainer>
		);
	}
}
