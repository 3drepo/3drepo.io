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
import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import List from '@material-ui/core/List';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Copy from '@material-ui/icons/FileCopy';
import Check from '@material-ui/icons/Check';

import {
	MenuList, NestedWrapper, ChildMenu, StyledItemText, StyledListItem, StyledDatePicker, CopyItem, CopyText, MenuFooter
} from './filtersMenu.styles';
import { renderWhenTrue } from '../../../helpers/rendering';
import { dateType } from './../filterPanel/filterPanel.component';

interface IProps {
	items: any[];
	selectedItems: any[];
	onToggleFilter: (property, value) => void;
}

interface IState {
	activeItem: any;
	from: any;
	to: any;
}

export class FiltersMenu extends React.PureComponent<IProps, IState> {
	public state = {
		activeItem: null,
		from: new Date(),
		to: new Date()
	};

	public parentRef = React.createRef<HTMLElement>();

	public componentDidMount() {
		const dateFilter = this.props.items.find((filter) => filter.type === dateType);
	}

	public showSubMenu = (e) => {
		this.setState({ activeItem: e });
	}

	public hideSubMenu = () => {
		this.setState({ activeItem: null });
	}

	public toggleSelectItem = (itemParent, item) => {
		this.props.onToggleFilter(itemParent, item);
	}

	public isSelectedItem = (value) =>
		!!this.props.selectedItems.find((filter) => filter.value.value === value)

	public renderListParentItem = (index, item) => {
		return (
			<StyledListItem button onMouseEnter={() => this.showSubMenu(index)}>
				<StyledItemText>
					{item.label} <ArrowRight />
				</StyledItemText>
			</StyledListItem>
		);
	}

	public onDateChange = (value, item, subItem) => {
		this.setState({
			[subItem.value]: value
		}, () => {
			subItem.date = value;
			this.props.onToggleFilter(item, subItem);
		});
	}

	public renderListChildItem = (index, item, subItem) => {
		return (
			<StyledListItem button onClick={() => this.toggleSelectItem(item, subItem)} key={`${subItem.label}-${index}`}>
				<StyledItemText>
					{subItem.label}
					{item.type === dateType &&
						<StyledDatePicker
							value={this.state[subItem.value]} onChange={(value) => this.onDateChange(value, item, subItem)} />
					}
					{this.isSelectedItem(subItem.value) && <Check fontSize={'small'} />}
				</StyledItemText>
			</StyledListItem>
		);
	}

	public renderChildItems = (index, item) => renderWhenTrue(
		(
			<ChildMenu>
				<List>
					{item.values.map((subItem) => this.renderListChildItem(index, item, subItem ))}
				</List>
			</ChildMenu>
		)
	)(index === this.state.activeItem)

	public render() {
		const { items } = this.props;

		return (
			<MuiPickersUtilsProvider utils={DateFnsUtils}>
				<MenuList>
					{
						items.map((item, index) => (
							<NestedWrapper key={`${item.label}-${index}`} onMouseLeave={this.hideSubMenu}>
								{this.renderListParentItem(index, item)}
								{this.renderChildItems(index, item)}
							</NestedWrapper>
						))
					}
					<MenuFooter>
						<StyledListItem button disabled={!this.props.selectedItems.length}>
							<StyledItemText>
								<CopyToClipboard text={JSON.stringify(this.props.selectedItems)}>
									<CopyItem>
										<Copy fontSize={'small'} />
										<CopyText>Copy filters</CopyText>
									</CopyItem>
								</CopyToClipboard>
							</StyledItemText>
						</StyledListItem>
					</MenuFooter>
				</MenuList>
			</MuiPickersUtilsProvider>
		);
	}
}
