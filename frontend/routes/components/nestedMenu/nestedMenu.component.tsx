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

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { SubMenuItem } from './components/subMenuItem/subMenuItem.component';

interface IProps {
	menuItems: any[];
}

export class NestedMenu extends React.PureComponent<IProps, any> {
	public state = {
		open: false
	};


	public render() {
		const { menuItems, open } = this.props;

		return (
			<Menu open={open}>
				{menuItems.map((item) => {
					if (item.hasOwnProperty('subMenuItems')) {
						return (
							<SubMenuItem
								key={item.key}
								caption={item.caption}
								menuItems={item.subMenuItems}
							/>
						);
					}

					return(
						<MenuItem key={item.key}>{item.caption}</MenuItem>
					);
				})}
			</Menu>
		);
	}
}
