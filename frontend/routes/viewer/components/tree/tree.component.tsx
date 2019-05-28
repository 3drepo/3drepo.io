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
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import List from 'react-virtualized/dist/es/List';

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
import { TreeNodes } from './tree.styles';
import { TREE_ACTIONS_MENU, TREE_ACTIONS_ITEMS, TREE_ITEM_SIZE } from '../../../../constants/tree';
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
	nodesSelectionMap: any;
	nodesVisibilityMap: any;
	nodesIndexesMap: any;
	isPending?: boolean;
	setState: (componentState: any) => void;
	showAllNodes: () => void;
	isolateSelectedNodes: () => void;
	hideIfcSpaces: () => void;
}

interface IState {
	scrollToIndex: number;
}

const MenuButton = (props) => <MenuButtonComponent ariaLabel="Show tree menu" {...props} />;

export class Tree extends React.PureComponent<IProps, IState> {
	public state = {
		scrollToIndex: undefined
	};

	get menuActionsMap() {
		const { isolateSelectedNodes, hideIfcSpaces } = this.props;
		return {
			[TREE_ACTIONS_ITEMS.SHOW_ALL]: this.handleShowAllNodes,
			[TREE_ACTIONS_ITEMS.ISOLATE_SELECTED]: isolateSelectedNodes,
			[TREE_ACTIONS_ITEMS.HIDE_IFC_SPACES]: hideIfcSpaces
		};
	}

	get filters() {
		return [];
	}

	public nodeListRef = React.createRef() as any;

	public renderFilterPanel = renderWhenTrue(() => (
		<FilterPanel
			filters={this.filters}
			onChange={this.handleFilterChange}
			selectedFilters={this.props.selectedFilters}
			hideMenu={true}
		/>
	));

	public renderNodesList = renderWhenTrue(() => {
		const { treeNodesList, expandedNodesMap } = this.props;
		const size = treeNodesList.length;
		const maxHeight = 842;

		const treeHeight = TREE_ITEM_SIZE * size;
		const treeNodesHeight = treeHeight > maxHeight ?	maxHeight : treeHeight;

		return (
			<TreeNodes style={{ height: treeNodesHeight }}>
				<AutoSizer>
					{({ width, height }) => (
						<List
							treeNodesList={treeNodesList}
							expandedNodesMap={expandedNodesMap}
							// className="height-catcher"
							ref={this.nodeListRef}
							overscanRowCount={50}
							height={height}
							width={width}
							rowCount={size}
							rowHeight={TREE_ITEM_SIZE}
							rowRenderer={this.renderTreeNode}
							scrollToIndex={this.state.scrollToIndex}
						/>
					)}
				</AutoSizer>
			</TreeNodes>
		);
	});

	public static defaultProps = {
		selectedFilters: [],
		searchEnabled: true
	};

	private renderNotFound = renderWhenTrue(() => (
		<EmptyStateInfo>No nodes matched</EmptyStateInfo>
	));

	public componentDidUpdate(prevProps: IProps) {
		if (prevProps.expandedNodesMap !== this.props.expandedNodesMap) {
			this.nodeListRef.current.recomputeRowHeights();
			this.nodeListRef.current.forceUpdateGrid();
			this.setState({
				scrollToIndex: undefined
			});
		}
	}

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
					{this.renderNodesList(!isPending && !!treeNodesList.length)}
					{this.renderNotFound(!isPending && !treeNodesList.length)}
				</ViewerPanelContent>
			</ViewerPanel>
		);
	}

	private handleShowAllNodes = () => {
		this.props.showAllNodes();
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

	private renderSearchButton = () => {
		if (this.props.searchEnabled) {
			return <IconButton onClick={this.handleCloseSearchMode}><CancelIcon /></IconButton>;
		}
		return <IconButton onClick={this.handleOpenSearchMode}><SearchIcon /></IconButton>;
	}

	private renderMenuButton = () => (
		<ButtonMenu
			renderButton={MenuButton}
			renderContent={this.renderActionsMenu}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled: false }}
		/>
	)

	private renderActions = () => (
		<>
			{this.renderSearchButton()}
			{this.renderMenuButton()}
		</>
	)

	private renderTreeNode = (props) => {
		const { index, style, key } = props;
		const {
			treeNodesList,
			expandedNodesMap
		} = this.props;
		const treeNode = treeNodesList[index];
		const realParentIndex = treeNodesList.findIndex((node) => node._id === treeNode.parentId);

		return (
			<TreeNode
				index={index}
				style={style}
				key={key}
				data={treeNode}
				isSearchResult={treeNode.isSearchResult}
				parentIndex={treeNode.parentIndex}
				expanded={expandedNodesMap[treeNode._id]}
				scrollToTop={() => this.scrollToParent(realParentIndex)}
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

	private scrollToParent = (parentIndex) => {
		this.nodeListRef.current.recomputeRowHeights();
		this.nodeListRef.current.forceUpdateGrid();
		this.setState({ scrollToIndex: parentIndex });
	}
}
