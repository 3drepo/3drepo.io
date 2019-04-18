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
import Check from '@material-ui/icons/Check';
import IconButton from '@material-ui/core/IconButton';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import { ViewerPanelButton, ViewerPanelContent, ViewerPanelFooter } from '../viewerPanel/viewerPanel.styles';
import {
	IconWrapper,
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { MenuButton as MenuButtonComponent } from '../../../components/menuButton/menuButton.component';
import { Container, TreeNodes } from './tree.styles';
import { TREE_ACTIONS_MENU, TREE_ACTIONS_ITEMS } from '../../../../constants/tree';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { TreeNode } from './components/treeNode/treeNode.component';

interface IProps {
	className: string;
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
	setState: (componentState: any) => void;
	showAllNodes: () => void;
	isolateSelectedNodes: () => void;
	hideIfcSpaces: () => void;
}

const MenuButton = (props) => <MenuButtonComponent ariaLabel="Show tree menu" {...props} />;

export class Tree extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		selectedFilters: [],
		searchEnabled: true
	};

	get menuActionsMap() {
		const { showAllNodes, isolateSelectedNodes, hideIfcSpaces } = this.props;
		return {
			[TREE_ACTIONS_ITEMS.SHOW_ALL]: showAllNodes,
			[TREE_ACTIONS_ITEMS.ISOLATE_SELECTED]: isolateSelectedNodes,
			[TREE_ACTIONS_ITEMS.HIDE_IFC_SPACES]: hideIfcSpaces
		};
	}

	get filters() {
		return [];
	}

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			filters={this.filters}
			onChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
			hideMenu={true}
		/>
	));

	public handleFilterChange = (selectedFilters) => {
		this.props.setState({ selectedFilters });
		// this.setState({ filteredObjects: this.filteredObjects });
  }

	public handleCloseSearchMode = () => {
		this.props.setState({ searchEnabled: false, selectedFilters: [] });
	}

	public handleOpenSearchMode = () => {
		this.props.setState({ searchEnabled: true });
	}

	public getSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	public renderActionsMenu = () => (
		<MenuList>
			{TREE_ACTIONS_MENU.map(( {name, Icon, label }) => (
				<StyledListItem key={name} button onClick={this.menuActionsMap[name]}>
					<IconWrapper><Icon fontSize="small" /></IconWrapper>
					<StyledItemText>
						{label}
						{(name === TREE_ACTIONS_ITEMS.HIDE_IFC_SPACES && this.props.ifcSpacesHidden) && <Check fontSize="small" />}
					</StyledItemText>
				</StyledListItem>
			))}
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
				{this.renderFilterPanel(this.props.searchEnabled)}
				<ViewerPanelContent className="height-catcher">
					<TreeNodes>
						<TreeNode
							id={'fghjk-ertyui-cvbnm'}
							name={'Federation name'}
							level={1}
							isFederation={true}
						/>
						<TreeNode
							id={'asdfgh-xcvbnm-rtyuo'}
							name={'Model A - Revision AA'}
							level={2}
							isModel={true}
							hasChildren={true}
							collapsed={false}
						/>
						<TreeNode
							id={'cvbnm-dfghjk-qwerty'}
							name={'Object name'}
							level={3}
							hasChildren={true}
							collapsed={true}
							selected={true}
						/>
						<TreeNode
							id={'iuytr-mnhgfc-rthbvcd'}
							name={'Object some name'}
							level={4}
							hasChildren={true}
							collapsed={true}
						/>
						<TreeNode
							id={'xerfs-kjhgfd-rtyuhg'}
							name={'Object other name'}
							level={4}
							hasChildren={true}
							collapsed={false}
						/>
						<TreeNode
							id={'edcfg-iuytr-zxcvbh'}
							name={'Object name 3drepo'}
							level={5}
						/>
						<TreeNode
							id={'lkjhg-asdfgh-edcfty'}
							name={'Object name 4drepo'}
							level={5}
						/>
						<TreeNode
							id={'mnbv-lkjhg-poiuyt'}
							name={'Object lowest 5drepo'}
							level={5}
						/>
						<TreeNode
							id={'dfgfg-lkjhg-gfffh'}
							name={'Object lowest 6drepo'}
							level={5}
						/>
						<TreeNode
							id={'ujgfe-zxcvb-kjhgf'}
							name={'Object child 2'}
							level={4}
							collapsed={false}
							hasChildren={true}
							selected={true}
						/>
						<TreeNode
							id={'fhgdfh-asdfgh-edcfty'}
							name={'Object object'}
							level={5}
							collapsed={true}
							hasChildren={true}
						/>
						<TreeNode
							id={'mnbv-ityit-poiuyt'}
							name={'Object hello'}
							level={5}
							collapsed={false}
							hasChildren={true}
							selected={true}
						/>
						<TreeNode
							id={'dfhdfh-asdfgh-edcfty'}
							name={'Object lowest 1'}
							level={6}
							highlighted={true}
						/>
						<TreeNode
							id={'mnbv-ityit-gdfg'}
							name={'Object lowest 2'}
							level={6}
						/>
						<TreeNode
							id={'bnmgm-ityit-poiuyt'}
							name={'Object lowest 3'}
							level={6}
						/>
						<TreeNode
							id={'asdfgh-xcvbnm-rtyuo'}
							name={'Model B - Revision AA'}
							level={2}
							isModel={true}
							hasChildren={true}
							collapsed={true}
						/>
						<TreeNode
							id={'asdfgh-xcvbnm-rtyuo'}
							name={'Model C - Revision BBB'}
							level={2}
							isModel={true}
							hasChildren={true}
							collapsed={true}
						/>
					</TreeNodes>
				</ViewerPanelContent>
			</ViewerPanel>
		);
	}
}
