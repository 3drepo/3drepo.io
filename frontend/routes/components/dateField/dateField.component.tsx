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

import React from 'react';

import { Container, StyledDatePicker } from './dateField.styles';

interface IProps {
	inputId: string;
	value: string;
	name: string;
	disabled?: boolean;
	format?: string;
	placeholder?: string;
	onChange: (event) => void;
	onBlur: (event) => void;
}

interface IState {
	value: any;
}

export class DateField extends React.PureComponent<IProps, IState> {
	public state = {
		value: new Date().valueOf()
	};

	public componentDidMount() {
		this.setState({
			value: this.props.value ? this.props.value : null
		});
	}

	public componentDidUpdate(prevProps) {
		if (!prevProps.value && this.props.value) {
			this.setState({
				value: this.props.value
			});
		}
	}

	public handleChange = (newDate) => {
		if (this.props.onChange) {
			this.props.onChange({
				target: { value: newDate.valueOf(), name: this.props.name }
			});
		}
		this.setState({ value: newDate.valueOf() });
	}

	public render() {
		const { value } = this.state;
		const { onBlur, name, placeholder, format, disabled } = this.props;

		return (
			<Container>
				<StyledDatePicker
					disabled={disabled}
					value={value}
					onBlur={onBlur}
					name={name}
					onChange={this.handleChange}
					placeholder={placeholder}
					format={format}
				/>
			</Container>
		);
	}
}
