/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';

import { Color, Name, StyledSelect } from './cellJob.styles';

interface IProps {
	name: string;
	jobs: any[];
	onChange: (currentValue: string) => void;
}

interface IState {
	currentValue: any;
}

export class CellJob extends React.PureComponent<IProps, IState> {
	public static state = {
		currentValue: ''
	};

	public static getDerivedStateFromProps(nextProps) {
		return {
			currentValue: nextProps.name
		};
	}

	/**
	 * Render jobs with colors
	 */
	public renderJobOptions = (jobs) => {
		return jobs.map(({_id, color}, index) => {
			return (
				<MenuItem key={index} value={_id}>
					<Grid
						container
						direction="row"
						justify="flex-start"
						alignItems="center"
					>
						<Color item color={color} />
						<Name item>{_id}</Name>
					</Grid>
				</MenuItem>
			);
		});
	}

	public handleChange = (event) => {
		const currentValue = event.target.value;
		this.props.onChange(currentValue);
		this.setState({currentValue});
	}

	public render() {
		const { jobs } = this.props;
		const { currentValue } = this.state;

		return (
			<StyledSelect
				value={currentValue}
				onChange={this.handleChange}
			>
				{this.renderJobOptions(jobs)}
			</StyledSelect>
		);
	}
}
