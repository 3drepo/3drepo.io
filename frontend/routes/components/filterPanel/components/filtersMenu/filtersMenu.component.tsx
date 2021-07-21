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

import List from '@material-ui/core/List';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Check from '@material-ui/icons/Check';
import Copy from '@material-ui/icons/FileCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import { FILTER_TYPES } from '../../filterPanel.component';
import { ChildMenu } from '../childMenu/childMenu.component';

import {
	CopyItem,
	CopyText,
	DataTypesWrapper,
	MenuFooter,
	MenuList,
	NestedWrapper,
	StyledDatePicker,
	StyledItemText,
	StyledListItem
} from './filtersMenu.styles';

interface IProps {
	items: any[];
	selectedItems: any[];
	dataTypes?: any[];
	selectedDataTypes?: any[];
	left?: boolean;
	onToggleFilter: (property, value) => void;
	onToggleDataType: (value) => void;
}

interface IState {
	activeItem: any;
}

export class FiltersMenu extends React.PureComponent<IProps, IState> {
	public state = {
		activeItem: null,
		from: null,
		to: null
	};

	public parentRef = React.createRef<HTMLElement>();

	public showSubMenu = (e) => {
		this.setState({ activeItem: e });
	}

	public hideSubMenu = () => {
		this.setState({ activeItem: null });
	}

	public toggleSelectItem = (itemParent, item) => () => {
		this.props.onToggleFilter(itemParent, item);
	}

	public toggleSelectDataType = (type) => () => {
		this.props.onToggleDataType(type);
	}

	public getSelectedDate = (parentItem, itemValue) => {
		const selectDateItem = this.props.selectedItems.find((selectedItem) =>
			parentItem.relatedField === selectedItem.relatedField && selectedItem.value.value === itemValue.value);

		if (selectDateItem) {
			return selectDateItem.value.date;
		}

		return null;
	}

	public isSelectedItem = (parentLabel, itemValue) =>
		!!this.props.selectedItems.find((filter) => filter.label === parentLabel && filter.value.value === itemValue)

	public renderListParentItem = (index, item) => {
		return (
			<StyledListItem button onMouseEnter={() => this.showSubMenu(index)}>
				<StyledItemText>
					{item.label} <ArrowRight />
				</StyledItemText>
			</StyledListItem>
		);
	}

	public onDateChange = (item, subItem) => (value) => {
		this.setState({ [subItem.value]: value } as any, () => {
			subItem.date = value.valueOf();
			this.props.onToggleFilter(item, subItem);
		});
	}

	public renderListChildItem = (index, item) => (subItem) => {
		const name = subItem.label || subItem.value;
		return (
			<StyledListItem
				button
				onClick={this.toggleSelectItem(item, subItem)}
				key={`${name}-${index}`}
			>
				<StyledItemText>
					{name}
					{item.type === FILTER_TYPES.DATE &&
						<StyledDatePicker
							value={this.getSelectedDate(item, subItem.value)}
							placeholder="Select date"
							onChange={this.onDateChange(item, subItem.value)}
						/>
					}
					{this.isSelectedItem(item.label, subItem.value) && <Check fontSize={'small'} />}
				</StyledItemText>
			</StyledListItem>
		);
	}

	public renderChildItems = (index, item) => renderWhenTrue(() => (
		<ChildMenu item={item} renderItem={this.renderListChildItem(index, item)} />
	))(index === this.state.activeItem && item.values)

	public renderMenuItems = (items) => {
		return (
			<List>
				{
					items.map((item, index) => (
						<NestedWrapper key={`${item.label}-${index}`} onMouseLeave={this.hideSubMenu}>
							{this.renderListParentItem(index, item)}
							{this.renderChildItems(index, item)}
						</NestedWrapper>
					))
				}
			</List>
		);
	}

	public renderMenuDataTypes = renderWhenTrue(() => {
		return (
			<DataTypesWrapper>
				<List>
					{
						this.props.dataTypes.map((item, index) => {
							const isSelected = this.props.selectedDataTypes.includes(item.type);
							return (

								<StyledListItem button key={`${item.label}-${index}`} onClick={this.toggleSelectDataType(item.type)}>
									<StyledItemText>
										{item.label}
										{isSelected && <Check fontSize={'small'} />}
									</StyledItemText>
								</StyledListItem>
							);
						})
					}
				</List>
			</DataTypesWrapper>
		);
	});

	public renderFooter = () => (
		<MenuFooter>
			<StyledListItem button disabled={!this.props.selectedItems.length}>
				<StyledItemText>
					<CopyToClipboard text={JSON.stringify(this.props.selectedItems)}>
						<CopyItem>
							<Copy fontSize="small" />
							<CopyText>Copy filters</CopyText>
						</CopyItem>
					</CopyToClipboard>
				</StyledItemText>
			</StyledListItem>
		</MenuFooter>
	)

	public render() {
		return (
			<MenuList>
				{this.renderMenuDataTypes(this.props.dataTypes && this.props.dataTypes.length)}
				{this.renderMenuItems(this.props.items)}
				{this.renderFooter()}
			</MenuList>
		);
	}
}
