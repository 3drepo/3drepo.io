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
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import Icon from '@material-ui/core/Icon';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import Switch from '@material-ui/core/Switch';

import { UserIcon } from './userMenu.styles';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';

interface IProps {
	currentUser: any;
	isLiteMode: boolean;
	onLiteModeChange?: () => void;
	onLogout?: () => void;
}

const UserButton = ({ IconProps, icon, ...props }) => {
	return (
		<IconButton
			{...props}
			aria-label="Toggle user menu"
			aria-haspopup="true"
		>
			<UserIcon {...IconProps}>{icon}</UserIcon>
		</IconButton>
	);
};

const UserMenuContent = (props) => {
	return (
		<List component="nav">
			<ListItem>
				<Avatar alt={props.currentUser} src="/static/images/remy.jpg" />
				<ListItemText primary={props.currentUser} />
			</ListItem>
			<Divider />
			<ListItem button>
				<ListItemIcon>
					<Icon>view_list</Icon>
				</ListItemIcon>
				<ListItemText primary="Teamspaces" />
			</ListItem>
			<ListItem button>
				<ListItemIcon>
					<Icon>description</Icon>
				</ListItemIcon>
				<ListItemText primary="User manual" />
			</ListItem>
			<ListItem>
				<Switch
					/* checked={this.state.checkedB} */
					onChange={() => { }}
					color="secondary"
				/>
				<ListItemText primary="Lite mode" />
			</ListItem>
			<ListItem button>
				<ListItemIcon>
					<Icon>exit_to_app</Icon>
				</ListItemIcon>
				<ListItemText primary="Logout" />
			</ListItem>
		</List >
	);
};

export class UserMenu extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<ButtonMenu
				renderButton={UserButton}
				renderContent={() => <UserMenuContent {...this.props} />}
				icon="account_circle"
				PopoverProps={{
					anchorOrigin: {
						vertical: 'top',
						horizontal: 'right'
					}
				}}
			/>
		);
	}
}
