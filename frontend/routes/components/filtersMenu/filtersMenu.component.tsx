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

import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Check from '@material-ui/icons/Check';

import { MenuList, NestedWrapper, ChildMenu, StyledItemText, StyledListItem } from './filtersMenu.styles';
import { renderWhenTrue } from '../../../helpers/rendering';

interface IProps {
	items: any[];
	selectedItems: any[];
	onToggleFilter: (property, value) => void;
}

export const MenuListItem = ({Icon, label, onClick, values, onMouseEnter = null, isSelected = false}) => (
	<StyledListItem button onMouseEnter={parent ? onMouseEnter : null} onClick={onClick}>
		{Icon &&
			<ListItemIcon>
				<Icon />
			</ListItemIcon>
		}
		<StyledItemText>{label} {!!values && <ArrowRight />} {isSelected && <Check fontSize={'small'} />}</StyledItemText>
	</StyledListItem>
);

export class FiltersMenu extends React.PureComponent<IProps, any> {
	public state = {
		activeItem: null
	};

	public parentRef = React.createRef<HTMLElement>();

	public showSubMenu = (e) => {
		this.setState({ activeItem: e });
	}

	public hideSubMenu = () => {
		this.setState({ activeItem: null });
	}

	public toggleSelectItem = (itemParent, item) => {
		this.props.onToggleFilter(itemParent, item);
	}

	public isSelectedItem = (item) =>
		!!this.props.selectedItems.find((filter) => filter.value.value === item.value)

	public renderChildItem = (index, item) => renderWhenTrue(
		(
			<ChildMenu>
				<List>
					{item.values.map((subItem) =>
						(<MenuListItem
								{...subItem}
								key={subItem.label}
								onClick={() => this.toggleSelectItem(item, subItem)}
								isSelected={this.isSelectedItem(subItem)}
							/>
						))
					}
				</List>
			</ChildMenu>
		)
	)(index === this.state.activeItem)

	public render() {
		const { items } = this.props;

		return (
			<MenuList>
			{
				items.map((item, index) => (
					<NestedWrapper key={index} onMouseLeave={this.hideSubMenu}>
						<MenuListItem
							{...item} onMouseEnter={() => this.showSubMenu(index)}
						/>
						{this.renderChildItem(index, item)}
					</NestedWrapper>
				))
			}
			</MenuList>
		);
	}
}
