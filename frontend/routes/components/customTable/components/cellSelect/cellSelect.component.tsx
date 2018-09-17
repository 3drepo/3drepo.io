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

import { Item, StyledSelect, EmptyValue } from './cellSelect.styles';

interface IProps {
	items: any[];
	placeholder?: string;
	readOnly?: boolean;
	value?: string;
	itemTemplate?: React.Component;
	disabled?: boolean;
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
		readOnly: false
	};

	public state = {
		selectedValue: ''
	};

	/**
	 * Render items
	 */
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
		const { items, itemTemplate, disabled, placeholder, value, readOnly } = this.props;
		const { selectedValue } = this.state;
		const hasNoOptions = !items.length;

		return (
			<StyledSelect
				readOnly={readOnly}
				disabled={readOnly || disabled || hasNoOptions}
				displayEmpty
				value={selectedValue || value}
				onChange={this.handleChange}
			>
				{ placeholder ? <EmptyValue value="">{placeholder}</EmptyValue> : null }
				{this.renderOptions(items, itemTemplate)}
			</StyledSelect>
		);
	}
}
