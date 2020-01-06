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

import { Grid, IconButton, Select, MenuItem } from '@material-ui/core';
import FastForwardIcon from '@material-ui/icons/FastForward';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Stop from '@material-ui/icons/Stop';

import DayJsUtils from '@date-io/dayjs';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import React from 'react';
import { NAMED_MONTH_DATE_FORMAT } from '../../../../../../services/formatting/formatDate';
import { DatePicker, SequenceRow, SequenceSlider, StepInput } from '../../sequences.styles';

const MILLI_PER_DAY = 1000 * 60 * 60 * 24;

interface IProps {
	max: Date;
	min: Date;
	onChange?: (date: Date) => void;
	value?: Date;
}

interface IState {
	value?: Date;
	playing: boolean;
	intervalId: number;
	stepInterval: number;
	stepScale: number;
}

const getDays = (min, max) => {
	const maxDate = new Date(max).setHours(0, 0, 0, 0);
	const minDate = new Date(min).setHours(0, 0, 0, 0);
	return  Math.round((maxDate - minDate) / MILLI_PER_DAY);
};

const getDate = (base, days) => {
	const baseDate = new Date(base).setHours(0, 0, 0, 0);
	return new Date(baseDate.valueOf() + days * MILLI_PER_DAY);
};

export class SequencePlayer extends React.PureComponent<IProps, IState> {
	public state: IState = {
		value: null,
		playing: false,
		intervalId: 0,
		stepInterval: 1,
		stepScale: 0
	};

	get currentDay() {
		return getDays(this.props.min, this.state.value);
	}

	get totalDays() {
		return getDays(this.props.min, this.props.max);
	}

	get isFirstDay() {
		return this.currentDay === 0;
	}

	get isLastDay() {
		return this.currentDay === this.totalDays;
	}

	public setValue = (newValue: Date) => {
		const maxDate = new Date(this.props.max).setHours(0, 0, 0, 0);
		const minDate = new Date(this.props.min).setHours(0, 0, 0, 0);
		newValue = new Date(Math.min(maxDate, Math.max(minDate, newValue.valueOf())));

		if (this.props.onChange) {
			this.props.onChange(newValue);
		}

		this.setState({value: newValue});
	}

	public setDayNumber = (dayNumber) => {
		const newValue = getDate(this.props.min, dayNumber);
		this.setValue(newValue);
	}

	public isDateOusideRange = (date) => {
		const {max, min} = this.props;
		const maxDate = new Date(max).setHours(0, 0, 0, 0);
		const minDate = new Date(min).setHours(0, 0, 0, 0);
		return maxDate < date || minDate > date;
	}

	public goTo = (val) => {
		this.stop();
		this.setDayNumber(val);
	}

	public componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({value: this.props.value});
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
	}

	public nextStep = () => {
		if (this.state.stepScale === 0) {
			this.setDayNumber(this.currentDay + this.state.stepInterval);
		}

		if (this.state.stepScale === 1) {
			const newValue = new Date(this.state.value);
			newValue.setMonth(newValue.getMonth() + this.state.stepInterval);

			this.setValue(newValue);
		}

		if (this.state.stepScale === 2) {
			const newValue = new Date(this.state.value);
			newValue.setFullYear(newValue.getFullYear() + this.state.stepInterval);
			this.setValue(newValue);
		}

		if (this.isLastDay) {
			this.stop();
		}
	}

	public play() {
		this.stop();
		const intervalId = (setInterval(this.nextStep, 1000) as unknown) as number;
		this.setState({
			playing: true,
			value: this.isLastDay ? this.props.min : this.state.value,
			intervalId
		});
	}

	public stop() {
		clearInterval(this.state.intervalId);
		this.setState({playing: false});
	}

	public componentDidMount() {
		this.setState({value: this.props.value || this.props.min});
	}

	public componentWillUnmount() {
		this.stop();
	}

	public rewindDay = () => this.goTo(this.currentDay - 1);

	public forwardDay = () => this.goTo(this.currentDay + 1);

	public render() {
		const {value, playing, stepScale , stepInterval} = this.state;

		return (
			<MuiPickersUtilsProvider utils={DayJsUtils}>
			<Grid
			container
			direction="column"
			justify="flex-start"
			alignItems="center"
		>
			<SequenceRow>
				<Grid item>
					<IconButton disabled={this.isFirstDay} onClick={this.rewindDay}><FastRewindIcon /></IconButton>
				</Grid>
				<Grid item>
					<DatePicker
						shouldDisableDate={(date) => this.isDateOusideRange(date.$d)}
						name="date"
						inputId="1"
						value={value}
						format={NAMED_MONTH_DATE_FORMAT}
						onChange={(e) => this.setState({value: new Date(e.target.value)})}
						placeholder="date"
					/>
				</Grid>
				<Grid item>
					<IconButton disabled={this.isLastDay} onClick={this.forwardDay}><FastForwardIcon /></IconButton>
				</Grid>
			</SequenceRow>
			<SequenceRow>
				Step interval: <StepInput value={stepInterval} onChange={this.onChangeStepInterval} />
				<Select value={stepScale} onChange={(e) => this.setState({stepScale: parseInt(e.target.value, 10)})} >
					<MenuItem value={0}>day(s)</MenuItem>
					<MenuItem value={1}>month(s)</MenuItem>
					<MenuItem value={2}>year(s)</MenuItem>
				</Select>
			</SequenceRow>
			<SequenceRow>
				<Grid item>
					<IconButton onClick={this.onClickPlayStop} >{!playing && <PlayArrow />}{playing &&  <Stop />}</IconButton>
				</Grid>
				<Grid item>
					<SequenceSlider max={this.totalDays} step={1} value={this.currentDay} onChange={(e, val) => this.goTo(val)} />
				</Grid>
			</SequenceRow>
		</Grid>
		</MuiPickersUtilsProvider>
		);
	}
}
