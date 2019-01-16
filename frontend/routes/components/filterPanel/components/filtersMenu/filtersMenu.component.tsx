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
import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import LuxonUtils from '@date-io/luxon';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import List from '@material-ui/core/List';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Copy from '@material-ui/icons/FileCopy';
import Check from '@material-ui/icons/Check';

import { renderWhenTrue } from '../../../../../helpers/rendering';
import { DATA_TYPES } from '../../filterPanel.component';

import {
	MenuList,
	NestedWrapper,
	ChildMenu,
	StyledItemText,
	StyledListItem,
	StyledDatePicker,
	CopyItem,
	CopyText,
	MenuFooter
} from './filtersMenu.styles';

interface IProps {
	items: any[];
	selectedItems: any[];
	onToggleFilter: (property, value) => void;
}

interface IState {
	activeItem: any;
	from: any;
	to: any;
	selectedDate: any;
}

export class FiltersMenu extends React.PureComponent<IProps, IState> {
	public state = {
		activeItem: null,
		from: new Date(),
		to: new Date(),
		selectedDate: new Date()
	};

	public parentRef = React.createRef<HTMLElement>();

	public componentDidMount() {
		const dateFilter = this.props.items.find((filter) => filter.type === DATA_TYPES.DATE);
	}

	public showSubMenu = (e) => {
		this.setState({ activeItem: e });
	}

	public hideSubMenu = () => {
		this.setState({ activeItem: null });
	}

	public toggleSelectItem = (itemParent, item) => () => {
		this.props.onToggleFilter(itemParent, item);
	}

	public isSelectedItem = (item) =>
		!!this.props.selectedItems.find((filter) => filter.value.value === item.value)

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
			subItem.date = value;
			this.props.onToggleFilter(item, subItem);
		});
	}

	public renderListChildItem = (index, item) => (subItem) => {
		return (
			<StyledListItem
				button
				onClick={this.toggleSelectItem(item, subItem)}
				key={`${subItem.label}-${index}`}
			>
				<StyledItemText>
					{subItem.label}
					{item.type === DATA_TYPES.DATE &&
						<StyledDatePicker
							value={this.state[subItem.value]}
							onChange={this.onDateChange(item, subItem)}
						/>
					}
					{this.isSelectedItem(subItem) && <Check fontSize={'small'} />}
				</StyledItemText>
			</StyledListItem>
		);
	}

	public renderChildItems = (index, item) => renderWhenTrue(() => (
		<ChildMenu>
			<List>{item.values.map(this.renderListChildItem(index, item))}</List>
		</ChildMenu>
	))(index === this.state.activeItem)

	public renderMenuItems = (items) => {
		return items.map((item, index) => (
			<NestedWrapper key={`${item.label}-${index}`} onMouseLeave={this.hideSubMenu}>
				{this.renderListParentItem(index, item)}
				{this.renderChildItems(index, item)}
			</NestedWrapper>
		));
	}

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

	public handleDateChange = (date) => {
		this.setState({ selectedDate: date });
	}

	public render() {
		return (
			<MuiPickersUtilsProvider utils={LuxonUtils}>
				<MenuList>
					{this.renderMenuItems(this.props.items)}
					{this.renderFooter()}
				</MenuList>
			</MuiPickersUtilsProvider>
		);
	}
}
