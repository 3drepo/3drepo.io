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
import { theme } from '../../../../styles/theme';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { StyledSelect, StyledTextField, Input } from './countriesSelect.styles';

interface IProps {
	name: string;
	value: any[];
	onChange: (event) => void;
	onBlur: (event) => void;
	countries: any[];
	label: string;
}

interface IState {
	value: any[];
}

const selectStyles = {
	input: (base) => ({
		...base,
		'color': theme.colors.BLACK_20,
		'& input': {
			font: 'inherit'
		}
	})
};

function inputComponent({ inputRef, ...props }) {
	return <Input {...props} />;
}

function Menu(props) {
	return (
		<Paper square {...props.innerProps}>
			{props.children}
		</Paper>
	);
}

function Control(props) {
	return (
		<StyledTextField
			fullWidth
			InputProps={{
				inputComponent,
				inputProps: {
					children: props.children,
					...props.innerProps
				}
			}}
			{...props.selectProps.textFieldProps}
		/>
	);
}
function Option(props) {
	return (
		<MenuItem
			selected={props.isFocused}
			style={{
				fontWeight: props.isSelected ? 500 : 400
			}}
			{...props.innerProps}
		>
			{props.children}
		</MenuItem>
	);
}

function ValueContainer(props) {
	return <div >{props.children}</div>;
}

const components = {
	Option,
	Control,
	ValueContainer
	// Menu
};

export class CountriesSelect extends React.PureComponent<IProps, IState> {
	public state = {
		value: []
	};

	public componentDidMount() {
		this.setState({ value: this.props.value });
	}

	public handleChange = (option) => {
		if (this.props.onChange) {
			this.props.onChange({
				target: {
					value: option.value,
					name: this.props.name
				}
			});
		}
	}

	public render() {
		const { onBlur, label } = this.props;

		return (
			<>
				<StyledSelect
					components={components}
					options={this.props.countries}
					onChange={this.handleChange}
					onBlur={onBlur}
					placeholder=""
					textFieldProps={{
						label,
						InputLabelProps: {
							shrink: false
						}
					}}
				/>
			</>
		);
	}
}
