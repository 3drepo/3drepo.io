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
import { PureComponent, Component } from 'react';
import Input from '@mui/material/Input';
import { Item, StyledSelect } from './cellSelect.styles';

interface IProps {
	items: any[];
	name?: string;
	placeholder?: string;
	readOnly?: boolean;
	value?: string;
	itemTemplate?: Component;
	disabled?: boolean;
	disabledPlaceholder?: boolean;
	hidden?: boolean;
	inputId?: string;
	labelName?: string;
	onChange: (event, selectedValue: string) => void;
}

interface IState {
	selectedValue: string;
}

export class CellSelect extends PureComponent<IProps, IState> {
	public static defaultProps = {
		value: '',
		items: [],
		disabled: false,
		readOnly: false,
		disabledPlaceholder: false,
		hidden: false,
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
		const labelName =  this.props.labelName || 'name';

		return items.map((item, index) => {
			if (!item[labelName] && !item.value) {
				const val = item;
				item = {[labelName]: val, value: val};
			}

			return (
				<Item
					group={item.group ? 1 : 0}
					disabled={item.disabled}
					key={index}
					value={item.value}
				>
					{
						TemplateComponent ?
							(<TemplateComponent {...item} />) :
							item[labelName] || item.value
					}
				</Item>
			);
		});
	}

	public handleChange = (event) => {
		const selectedValue = event.target.value;

		if (this.state.selectedValue !== selectedValue) {
			this.props.onChange(event, selectedValue);
		}
	}

	public render() {
		const {items, itemTemplate, disabled, placeholder, disabledPlaceholder, readOnly, inputId, name, hidden} = this.props;
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
				name={name}
				readOnly={readOnly}
				disabled={readOnly || disabled || hasNoOptions}
				hidden={hidden}
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
