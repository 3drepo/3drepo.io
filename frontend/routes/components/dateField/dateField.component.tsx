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

import { Container, StyledDatePicker } from './dateField.styles';

interface IProps {
	inputId: string;
	value: string;
	name: string;
	onChange: (event) => void;
	onBlur: (event) => void;
}

interface IState {
	value: any;
}

export class DateField extends React.PureComponent<IProps, IState> {
	public state = {
		value: new Date()
	};

	public componentDidMount() {
		this.setState({
			value: this.props.value ? new Date(this.props.value) : undefined
		});
	}

	public componentDidUpdate(prevProps) {
		if (!prevProps.value && this.props.value) {
			this.setState({
				value: new Date(this.props.value)
			});
		}
	}

	public handleChange = (newDate) => {
		if (this.props.onChange) {
			this.props.onChange({
				target: { value: newDate.ts, name: this.props.name }
			});
		}
		this.setState({ value: newDate });
	}

	public render() {
		const { value } = this.state;
		const { onBlur, name } = this.props;

		return (
			<Container>
				<StyledDatePicker
					value={value}
					onBlur={onBlur}
					name={name}
					onChange={this.handleChange}
				/>
			</Container>
		);
	}
}
