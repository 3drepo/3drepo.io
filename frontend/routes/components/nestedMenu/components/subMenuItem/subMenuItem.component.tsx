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
import MenuItem from '@material-ui/core/MenuItem';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import {NestedMenu} from './../../nestedMenu.component';

interface IProps {
	menuItems: any[];
	caption: string;
}

interface IState {
	anchorElement: any;
	menuOpen: boolean;
}

export class SubMenuItem extends React.PureComponent<IProps, IState> {
	public state = {
		menuOpen: false,
		anchorElement: null
	};

	public showSubMenu = (event) => {
		if (!this.state.anchorElement) {
			this.setState({
				anchorElement: event.currentTarget
			});
		}
		this.setState({
			menuOpen: true
		});
	}

	public hideSubMenu = (event) => {
		if (event.currentTarget === this.state.anchorElement) {
			this.setState({
				menuOpen: false
			});
		}
	}


	public render() {
		const { menuItems, caption } = this.props;

		return (
			<React.Fragment>
			<MenuItem
				onMouseEnter={(event) => this.showSubMenu(event)}
				onMouseLeave={(event) => this.hideSubMenu(event)}
			>
				{caption}
				<ArrowRightIcon /> Menu Item!!
			</MenuItem>
			<NestedMenu
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'center',
					horizontal: 'right'
				}}
				open={this.state.menuOpen}
				anchorElement={this.state.anchorElement}
				menuItems={menuItems}
			/>
		</React.Fragment>
		);
	}
}
