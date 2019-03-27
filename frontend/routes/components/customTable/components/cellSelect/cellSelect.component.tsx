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
import { Item, StyledSelect } from './cellSelect.styles';

interface IProps {
	items: any[];
	name?: string;
	placeholder?: string;
	readOnly?: boolean;
	value?: string;
	itemTemplate?: React.Component;
	disabled?: boolean;
	disabledPlaceholder?: boolean;
	inputId?: string;
	onChange: (event, selectedValue: string) => void;
}

interface IState {
	selectedValue: string;
}

export class CellSelect extends React.PureComponent<IProps, IState> {
	public menuWrapper;
	public menuItems;
	public query = '';
	public searchTimeout;
	public selectedItem;

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
			this.props.onChange(event, selectedValue);
		}
	}

	public findMenuItem = (pressedKey) => {
		return this.menuItems.find((item) => {
			return item.innerText.toLowerCase().startsWith(pressedKey.toLowerCase());
		});
	}

	public focusOnItem = (selectedItem) => {
		selectedItem.focus();
		selectedItem.style.backgroundColor = MuiTheme.palette.action.hover;
		selectedItem.tabindex = 0;

		const scrollTop = selectedItem.offsetTop;
		this.menuWrapper.scrollTop = scrollTop;
		this.selectedItem = selectedItem;
	}

	public blurItem = (selectedItem) => {
		if (selectedItem) {
			selectedItem.style.backgroundColor = '';
			selectedItem = null;
		}
	}

	public handleKeyPress = (event) => {
		clearTimeout(this.searchTimeout);
		this.blurItem(this.selectedItem);

		const { key: pressedKey } = event;
		if (pressedKey.length === 1) {
			this.query += pressedKey;

			const currentItem = this.menuWrapper.querySelector('[tabindex="0"]');
			const selectedItem = this.findMenuItem(this.query);

			if (selectedItem) {
				event.preventDefault();

				if (currentItem) {
					currentItem.tabindex = -1;
				}

				this.focusOnItem(selectedItem);
			}

			this.searchTimeout = setTimeout(() => {
				this.query = '';
			}, 220);
		}
	}

	public render() {
		const {items, itemTemplate, disabled, placeholder, disabledPlaceholder, readOnly, inputId, name} = this.props;
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
				displayEmpty={true}
				input={<Input id={inputId} readOnly={readOnly} />}
				value={selectedValue}
				onChange={this.handleChange}
			>
				{this.renderOptions(options, itemTemplate)}
			</StyledSelect>
		);
	}
}
