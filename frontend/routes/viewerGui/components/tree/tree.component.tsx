/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import Check from '@material-ui/icons/Check';
import TreeIcon from '@material-ui/icons/DeviceHub';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

import { TREE_ACTIONS_ITEMS, TREE_ACTIONS_MENU, TREE_ITEM_SIZE } from '../../../../constants/tree';
import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { EmptyStateInfo } from '../../../components/components.styles';
import {
	IconWrapper,
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { FilterPanel } from '../../../components/filterPanel/filterPanel.component';
import { PanelBarActions } from '../panelBarActions';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';
import TreeNode from './components/treeNode/treeNode.container';

interface IProps {
	className: string;
	selectedFilters: any[];
	searchEnabled: boolean;
	ifcSpacesHidden: boolean;
	nodesList: any[];
	expandedNodesMap: any;
	nodesSelectionMap: any;
	nodesVisibilityMap: any;
	nodesIndexesMap: any;
	dataRevision: string;
	activeNode: string;
	isPending?: boolean;
	visibleNodesIds: any[];
	handleNodesClick?: (nodes, skipExpand) => boolean;
	setState: (componentState: any) => void;
	showAllNodes: () => void;
	isolateSelectedNodes: (nodeIds: any[]) => void;
	hideIfcSpaces: () => void;
	goToRootNode: (nodeId: boolean) => void;
	selectNodes: (nodesIds: any[]) => void;
}

interface IState {
	isFederation?: boolean;
	isScrollToActive: boolean;
}

export class Tree extends React.PureComponent<IProps, IState> {

	get type() {
		return VIEWER_PANELS.TREE;
	}

	get menuActionsMap() {
		const { isolateSelectedNodes, hideIfcSpaces } = this.props;
		return {
			[TREE_ACTIONS_ITEMS.SHOW_ALL]: this.handleShowAllNodes,
			[TREE_ACTIONS_ITEMS.ISOLATE_SELECTED]: () => isolateSelectedNodes(undefined),
			[TREE_ACTIONS_ITEMS.HIDE_IFC_SPACES]: hideIfcSpaces,
			[TREE_ACTIONS_ITEMS.SELECT_ALL]: this.handleSelectAllNodes
		};
	}

	get filters() {
		return [];
	}

	get isFederation() {
		const rootNode = this.props.nodesList[0];
		if (rootNode) {
			return rootNode.isFederation;
		}

		return false;
	}

	public static defaultProps = {
		selectedFilters: [],
		searchEnabled: true
	};
	public state = {
		isScrollToActive: true
	};

	public nodeListRef = React.createRef() as any;

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			filters={this.filters}
			onChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
			hideMenu
		/>
	));

	public renderNodesList = renderWhenTrue(() => {
		const { nodesList, dataRevision } = this.props;
		const size = nodesList.length;
		const maxHeight = 842;

		const treeHeight = TREE_ITEM_SIZE * size;
		const treeNodesHeight = Math.min(maxHeight, treeHeight) + 1;

		return (
			<div style={{ height: treeNodesHeight, flex: 1 }}>
				<AutoSizer>
					{({ width, height }) => (
						<List
							dataRevision={dataRevision}
							ref={this.nodeListRef}
							height={height - 1}
							width={width - 1}
							itemData={nodesList}
							itemCount={size}
							itemSize={TREE_ITEM_SIZE}
							itemKey={this.getNodeId}
						>
							{this.renderTreeNode}
						</List>
					)}
				</AutoSizer>
			</div>
		);
	});

	private renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No nodes matched</EmptyStateInfo>
	));

	public componentDidUpdate(prevProps: IProps) {
		const { activeNode, nodesList } = this.props;
		if (prevProps.activeNode !== activeNode && activeNode) {
			if (this.state.isScrollToActive) {
				const index = nodesList.findIndex(({ _id }) => _id === activeNode);
				this.nodeListRef.current.scrollToItem(index, 'start');
			} else {
				this.setState({ isScrollToActive: true });
			}
		}
	}

	public render() {
		const { searchEnabled, nodesList, isPending } = this.props;

		return (
			<ViewerPanel
				title="Tree"
				Icon={<TreeIcon />}
				renderActions={this.renderActions}
				pending={isPending}
			>
				{this.renderFilterPanel(searchEnabled)}
				{this.renderNodesList(!isPending && !!nodesList.length)}
				{this.renderNotFound(!isPending && !nodesList.length)}
			</ViewerPanel>
		);
	}

	private getNodeId = (index, data) => data[index]._id;

	private handleShowAllNodes = () => {
		this.props.showAllNodes();
	}

	private handleSelectAllNodes = () => {
		this.props.selectNodes(this.props.visibleNodesIds);
	}

	private handleFilterChange = (selectedFilters) => {
		this.props.setState({ selectedFilters });
	}

	private handleCloseSearchMode = () => {
		this.props.setState({ searchEnabled: false, selectedFilters: [] });
	}

	private handleOpenSearchMode = () => {
		this.props.setState({ searchEnabled: true });
	}

	private renderActions = () => (
		<PanelBarActions
			type={this.type}
			menuLabel="Show tree menu"
			menuActions={this.renderActionsMenu}
			isSearchEnabled={this.props.searchEnabled}
			onSearchOpen={this.handleOpenSearchMode}
			onSearchClose={this.handleCloseSearchMode}
		/>
	)

	private handleScrollToTop = (index) => {
		const treeNode = this.props.nodesList[index];
		this.props.goToRootNode(treeNode.rootParentId);
	}

	private handleNodesClick = (nodeId) => {
		this.setState({ isScrollToActive: false }, () => {
			this.props.handleNodesClick([nodeId], true);
		});
	}

	private renderTreeNode = (props) => {
		const { index, style, data } = props;
		const { expandedNodesMap, activeNode } = this.props;
		const treeNode = data[index];

		return (
			<TreeNode
				index={index}
				style={style}
				key={treeNode._id}
				data={treeNode}
				hasFederationRoot={this.isFederation}
				isSearchResult={treeNode.isSearchResult}
				active={activeNode === treeNode._id}
				expanded={expandedNodesMap[treeNode._id]}
				onScrollToTop={this.handleScrollToTop}
				onClick={this.handleNodesClick}
			/>
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
