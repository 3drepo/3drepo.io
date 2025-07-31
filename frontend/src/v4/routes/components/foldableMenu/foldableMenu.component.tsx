/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { ReactNode, PureComponent, useRef, useEffect, useState } from 'react';

import { ListItemProps } from '@mui/material/ListItem';
import { Check } from '@mui/icons-material';

import { IconWrapper, MenuList, NestedWrapper, StyledItemText, StyledListItem, Wrapper } from './foldableMenu.style';

/**
// Example:

import Upload from '@mui/icons-material/CloudUpload';

export const TestFold = () => (
	<FoldableMenu>
		<SubMenu left>
			<MenuItem button>item 1 <ArrowRight /></MenuItem>
			<List>
				<MenuItem button>1. subitem 1</MenuItem>
				<MenuItem button>1. subitem 2</MenuItem>
			</List>
		</SubMenu>
		<SubMenu>
			<MenuItem button>item 2 <ArrowRight /></MenuItem>
			<List>
				<StyledListItem button><StyledItemText>2. subitem 1</StyledItemText></StyledListItem>
				<MenuItem button icon={<Upload fontSize="small" />} checked>Import BCF </MenuItem>
				<StyledListItem button><StyledItemText>2. subitem 2</StyledItemText></StyledListItem>
			</List>
		</SubMenu>
		<MenuItem checked>item without submenu 1</MenuItem>
		<MenuItem button>item without submenu 2</MenuItem>
		<MenuItem button icon={<Upload fontSize="small" />} checked>Import BCF </MenuItem>
	</FoldableMenu>
);
 */

export interface ISubMenuProps extends ListItemProps {
	active?: boolean;
	left?: boolean;
}

export const SubMenu = (props: ISubMenuProps) => {
	const [top, setTop] = useState(0);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const rect = wrapperRef.current.getBoundingClientRect();

		if (rect.top !== top) {
			setTop(Math.floor(rect.top));
		}
	}, [wrapperRef]);

	return (
		<NestedWrapper {...props}>
			{(props.children  as any[]).slice(0, -1)}
			<Wrapper top={top} ref={wrapperRef} left={props.left}>
				{!!top && props.active && props.children[(props.children as any[]).length - 1]}
			</Wrapper>
		</NestedWrapper>
	);
};

export interface IFoldableMenuItemProps {
	icon?: ReactNode;
	checked?: boolean;
	arrow?: boolean;
	onClick: (event?) => void;
	children?: any;
}

export const FoldableMenuItem = ({children, ...props}: IFoldableMenuItemProps) => (
	<StyledListItem {...props}>
		{props.icon  && <IconWrapper>{props.icon}</IconWrapper>}
		<StyledItemText>
			{children}
			{props.checked && <Check fontSize="small" />}
		</StyledItemText>
	</StyledListItem>
);

interface IProps {
	left?: boolean;
	children: any;
}

interface IState {
	activeItem: any;
}

export class FoldableMenu extends PureComponent<IProps, IState> {
	public state = {
		activeItem: null,
	};

	public showSubMenu = (e) => {
		this.setState({ activeItem: e });
	}

	public hideSubMenu = () => {
		this.setState({ activeItem: null });
	}

	public componentDidMount() {
		for (let i: number = 0; i < 10 ; i++ ) {
		}
	}

	public render() {
		return (
			<MenuList>
				{(this.props.children as any[]).map((child, index) => {
					if (child.type === SubMenu) {
						return (<SubMenu
							key={index}
							active={index === this.state.activeItem}
							{...child.props} onMouseEnter={() => this.showSubMenu(index)} onMouseLeave={this.hideSubMenu}
						/>);
					} else {
						return child;
					}
				})}
			</MenuList>
		);
	}
}
