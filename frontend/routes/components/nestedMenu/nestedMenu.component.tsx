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

import { MenuList, NestedWrapper, ChildMenu, StyledItemText, StyledListItem } from './nestedMenu.styles';

interface IProps {
	items: any[];
}

export const MenuListItem = ({Icon, caption, parent = false, onMouseEnter = null}) => (
	<StyledListItem button onMouseEnter={parent ? onMouseEnter : null}>
		{Icon &&
			<ListItemIcon>
				<Icon />
			</ListItemIcon>
		}
		<StyledItemText>{caption} {parent && <ArrowRight />}</StyledItemText>
	</StyledListItem>
);
export class NestedMenu extends React.PureComponent<IProps, any> {
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

	public render() {
		const { items } = this.props;

		return (
			<MenuList>
			{
				items.map((item, index) => {
					if (!item.subItems) {
						return (
							<MenuListItem
								Icon={item.Icon}
								caption={item.caption}
							/>
						);
					} else {
						return (
							<NestedWrapper onMouseLeave={this.hideSubMenu}>
								<MenuListItem
									Icon={item.Icon}
									caption={item.caption}
									parent={true}
									onMouseEnter={() => this.showSubMenu(index)}
								/>
								{index === this.state.activeItem &&
									<ChildMenu>
										<List>
											{item.subItems.map((subItem) =>
												(<MenuListItem
														Icon={subItem.Icon}
														caption={subItem.caption}
													/>
												))
											}
										</List>
									</ChildMenu>
								}
							</NestedWrapper>
						);
					}
				})
			}
			</MenuList>
		);
	}
}
