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
import TreeIcon from '@material-ui/icons/DeviceHub';
import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import {
	MenuList
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { MenuButton as MenuButtonComponent } from '../../../components/menuButton/menuButton.component';
import { Container } from './tree.styles';

interface IProps {
	className: string;
}

const MenuButton = (props) => <MenuButtonComponent ariaLabel="Show tree menu" {...props} />;

export class Tree extends React.PureComponent<IProps, any> {
	public getSearchButton = () => {
		const searchEnabled = false;
		if (searchEnabled) {
			return <IconButton onClick={() => {}}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={() => {}}><SearchIcon /></IconButton>;
	}

	public renderActionsMenu = () => (
		<MenuList>
		</MenuList>
	)

	public getMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={this.renderActionsMenu}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled: false }}
		/>
	)

	public renderActions = () => (
		<>
			{this.getSearchButton()}
			{this.getMenuButton()}
		</>
	)

	public render() {
		return (
			<ViewerPanel
				title="Tree"
				Icon={<TreeIcon/>}
				renderActions={this.renderActions}
				pending={false}
			>
			Tree
		</ViewerPanel>
		);
	}
}
