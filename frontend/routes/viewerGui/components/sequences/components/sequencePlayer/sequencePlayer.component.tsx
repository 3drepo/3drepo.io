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

import { IconButton } from '@material-ui/core';
import FastForwardIcon from '@material-ui/icons/FastForward';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import Slider from '@material-ui/lab/Slider';
import React from 'react';
import { Value } from '../../../../../components/property/property.styles';

const MILLI_PER_DAY = 1000 * 60 * 60 * 24;

interface IProps {
	max: Date;
	min: Date;
	onChange?: (date: Date) => void;
	value?: Date;
}

interface IState {
	value?: Date;
}

const getDays = (min, max) => {
	const maxDay = new Date(max).setHours(0, 0, 0, 0);
	const minDay = new Date(min).setHours(0, 0, 0, 0);
	return  Math.round((maxDay - minDay) / MILLI_PER_DAY);
};

const getDate = (base, days) => {
	const baseDate = new Date(base).setHours(0, 0, 0, 0);
	return new Date(baseDate.valueOf() + days * MILLI_PER_DAY);
};

export class SequencePlayer extends React.PureComponent<IProps, IState> {
	public state: IState = {
		value: null
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

	public setValue = (newValue) => {
		if (this.props.onChange) {
			this.props.onChange(newValue);
		}

		this.setState({value: newValue});
	}

	public setDay = (val) => {
		const newValue = getDate(this.props.min, val);
		this.setValue(newValue);
	}

	public componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({value: this.props.value});
		}
	}

	public componentDidMount() {
		this.setState({value: this.props.value || this.props.min});
	}

	public rewindDay = () =>  this.setDay(this.currentDay - 1);

	public forwardDay = () =>  this.setDay(this.currentDay + 1);

	public render() {
		const {value} = this.state;
		return (
			<>
				<IconButton disabled={this.isFirstDay} onClick={this.rewindDay}><FastRewindIcon /></IconButton>
				{(value || '').toString()}
				<IconButton disabled={this.isLastDay} onClick={this.forwardDay}><FastForwardIcon /></IconButton>
				<Slider min={0} max={this.totalDays} step={1} value={this.currentDay} onChange={(e, val) => this.setDay(val)} />
			</>
		);
	}
}
