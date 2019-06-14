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
import { ViewerPanelContent } from '../viewerPanel/viewerPanel.styles';
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
import TreeNode from './components/treeNode/treeNode.container';
import { EmptyStateInfo } from '../views/views.styles';

interface IProps {
	className: string;
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
	treeNodesList: any[];
	expandedNodesMap: any;
	selectedNodesMap: any;
	nodesIndexesMap: any;
	hiddenNodesMap: any;
	isPending?: boolean;
	setState: (componentState: any) => void;
	showAllNodes: () => void;
	isolateSelectedNodes: () => void;
	hideIfcSpaces: () => void;
	expandNode: (id) => void;
	collapseNode: (id) => void;
	selectNode: (id) => void;
	deselectNode: (id) => void;
}

const MenuButton = (props) => <MenuButtonComponent ariaLabel="Show tree menu" {...props} />;

export class Tree extends React.PureComponent<IProps, any> {

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

	public static defaultProps = {
		selectedFilters: [],
		searchEnabled: true
	};

	private renderEmptyState = renderWhenTrue(() => (
		<EmptyStateInfo>No entry have been created yet</EmptyStateInfo>
	));

	private renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No nodes matched</EmptyStateInfo>
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

	public selectNode = (id) => {
		this.props.selectNode(id);
	}

	public deselectNode = (id) => {
		this.props.deselectNode(id);
	}

	public isHighlighted = (treeNode) => {
		if (!treeNode.hasChildren) {
			return this.props.selectedNodesMap[treeNode._id] && !this.props.hiddenNodesMap[treeNode._id];
		} else {
			return false;
		}
	}

	public renderNodesList = renderWhenTrue(() => {
		const {
			treeNodesList,
			expandedNodesMap,
			searchEnabled,
			selectedNodesMap,
			nodesIndexesMap,
			selectedFilters
		} = this.props;

		const isSearchActive = searchEnabled && selectedFilters.length;
		return (
			<TreeNodes>
				{treeNodesList.map((treeNode) => {
					const isFirstLevel = treeNode.level === 1;
					const isSecondLevel = treeNode.level === 2;
					const parentIndex = nodesIndexesMap[treeNode.parentId];
					const isFederation = treeNode.isFederation;
					const isModel = (isFirstLevel && !treeNode.isFederation) ||
						(isSecondLevel && treeNodesList[parentIndex].isFederation);

					const isSearchResult = isSearchActive && !isFederation && !isModel;
					const isRegularNode = !isSearchActive && (isFirstLevel || isSecondLevel || expandedNodesMap[treeNode.parentId]);

					if (isSearchResult || isRegularNode) {
						return (
							<TreeNode
								key={treeNode._id}
								data={treeNode}
								isModel={isModel}
								isSearchResult={isSearchResult}
								selected={selectedNodesMap[treeNode._id]}
								highlighted={this.isHighlighted(treeNode)}
								parentIndex={parentIndex}
								expanded={expandedNodesMap[treeNode._id]}
							/>
						);
					}
				})}
			</TreeNodes>
		);
	});

	public render() {
		const { searchEnabled, treeNodesList, isPending } = this.props;

		return (
			<ViewerPanel
				title="Tree"
				Icon={<TreeIcon/>}
				renderActions={this.renderActions}
				pending={isPending}
			>
				{this.renderFilterPanel(searchEnabled)}
				<ViewerPanelContent className="height-catcher">
					{this.renderNodesList(!!treeNodesList.length)}
					{this.renderNotFound(!treeNodesList.length)}
				</ViewerPanelContent>
			</ViewerPanel>
		);
	}

	private renderActionsMenu = () => (
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
}
