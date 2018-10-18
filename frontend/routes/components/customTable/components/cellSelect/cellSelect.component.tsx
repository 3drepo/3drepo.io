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

import Input from '@material-ui/core/Input';
import { Item, StyledSelect, EmptyValue } from './cellSelect.styles';

interface IProps {
	items: any[];
	placeholder?: string;
	readOnly?: boolean;
	value?: string;
	itemTemplate?: React.Component;
	disabled?: boolean;
	disabledPlaceholder?: boolean;
	inputId?: string;
	onChange: (selectedValue: string) => void;
}

interface IState {
	selectedValue: string;
}

export class CellSelect extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		value: '',
		items: [],
		disabled: false,
		readOnly: false,
		disabledPlaceholder: false
	};

	public state = {
		selectedValue: ''
	};

	public componentDidUpdate(prevProps, prevState) {
		if (prevProps.value !== this.props.value) {
			this.setState({selectedValue: this.props.value});
		}
	}

	public componentDidMount() {
		this.setState({selectedValue: this.props.value});
	}

	public renderOptions = (items, TemplateComponent) => {
		return items.map((item, index) => {
			return (
				<Item
					disabled={item.disabled}
					key={index}
					value={item.value}
				>
					{
						TemplateComponent ?
							(<TemplateComponent {...item}/>) :
							item.name || item.value
					}
				</Item>
			);
		});
	}

	public handleChange = (event) => {
		const selectedValue = event.target.value;

		if (this.state.selectedValue !== selectedValue) {
			this.setState({selectedValue});
			this.props.onChange(selectedValue);
		}
	}

	public render() {
		const {items, itemTemplate, disabled, placeholder, disabledPlaceholder, value, readOnly, inputId} = this.props;
		const {selectedValue} = this.state;
		const hasNoOptions = !items.length;
		const options = [];

		if (placeholder) {
			const placeholderValue = {
				name: placeholder,
				value: '',
				disabled: disabledPlaceholder
			};
			options.push(placeholderValue);
		}
		options.push(...items);

		return (
			<StyledSelect
				readOnly={readOnly}
				disabled={readOnly || disabled || hasNoOptions}
				displayEmpty
				input={<Input id={inputId} readOnly={readOnly} />}
				value={selectedValue}
				onChange={this.handleChange}
			>
				{this.renderOptions(options, itemTemplate)}
			</StyledSelect>
		);
	}
}
