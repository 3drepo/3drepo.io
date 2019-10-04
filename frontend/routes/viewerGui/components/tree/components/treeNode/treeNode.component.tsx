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

import AddIcon from '@material-ui/icons/Add';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RemoveIcon from '@material-ui/icons/Remove';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import IsolateIcon from '@material-ui/icons/VisibilityOutlined';
import * as React from 'react';

import {
	SELECTION_STATES,
	TREE_ITEM_FEDERATION_TYPE,
	TREE_ITEM_MODEL_TYPE,
	TREE_ITEM_OBJECT_TYPE,
	VISIBILITY_STATES
} from '../../../../../../constants/tree';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
import { Actions, Container, Name, NameWrapper, ParentOfVisible, StyledExpandableButton } from './treeNode.styles';

interface IProps {
	style: any;
	key: any;
	index: number;
	data: any;
	settings: any;
	isSearchResult?: boolean;
	visibilityMap: any;
	selectionMap: any;
	rev: any;
	highlighted?: boolean;
	expanded?: boolean;
	selected?: boolean;
	active?: boolean;
	hasFederationRoot?: boolean;
	collapseNodes?: (nodesIds: string[]) => void;
	expandNodes?: (id) => void;
	selectNode?: (id) => void;
	setSelectedNodesVisibility?: (id, visibility) => void;
	isolateSelectedNodes: (id) => void;
	onScrollToTop: (index) => void;
	onClick: (id) => void;
	zoomToHighlightedNodes: () => void;
}

interface IState {
	hovered: boolean;
}

const CollapseButton = ({ Icon, onClick, expanded, hasChildren, nodeType }) => (
	<StyledExpandableButton
		onClick={onClick}
		expanded={expanded}
		hasChildren={hasChildren}
		nodeType={nodeType}>
		<Icon size="small" />
	</StyledExpandableButton>
);

const ParentOfVisibleIcon = () => <ParentOfVisible><VisibilityIcon color="inherit" /></ParentOfVisible>;
const VisibleIcon = () => <VisibilityIcon color="primary" />;
const InvisibleIcon = () => <VisibilityOffIcon color="action" />;

export class TreeNode extends React.PureComponent<IProps, IState> {

	get node() {
		return this.props.data;
	}

	get type() {
		if (this.node.isFederation) {
			return TREE_ITEM_FEDERATION_TYPE;
		} else if (this.node.isModel) {
			return TREE_ITEM_MODEL_TYPE;
		}
		return TREE_ITEM_OBJECT_TYPE;
	}

	get level() {
		if (this.props.isSearchResult) {
			return 0;
		}
		return this.node.level;
	}

	get isSelected() {
		return this.props.selectionMap[this.node._id] === SELECTION_STATES.PARENT_OF_UNSELECTED;
	}

	get isHighlighted() {
		return this.props.selectionMap[this.node._id] === SELECTION_STATES.SELECTED;
	}

	get isModelRoot() {
		return !this.props.hasFederationRoot && this.level === 1;
	}

	public static defaultProps = {
		visible: false,
		selected: false,
		highlighted: false,
		expanded: false,
		hasChildren: false,
		childrenNumber: 0
	};
	public state = {
		hovered: false
	};

	private renderExpandableButton = renderWhenTrue(() => {
		const { expanded } = this.props;
		return (
			<CollapseButton
				nodeType={this.type}
				expanded={expanded}
				hasChildren={this.node.hasChildren}
				Icon={!expanded && this.node.hasChildren ? AddIcon : RemoveIcon}
				onClick={!expanded && this.node.hasChildren ? this.expandNode : this.collapseNode}
			/>
		);
	});

	private renderOpenModelAction = renderWhenTrue(() => (
		<SmallIconButton
			Icon={OpenInNewIcon}
			tooltip="Open model in new tab"
			onClick={this.handleOpenModelClick}
		/>
	));

	private renderGoTopAction = renderWhenTrue(() => (
		<SmallIconButton
			Icon={UpIcon}
			tooltip="Go to top"
			onClick={this.goToTop}
		/>
	));

	private renderActions = renderWhenTrue(() => (
		<Actions>
			{this.renderOpenModelAction(this.node.isModel && !this.isModelRoot)}
			{this.renderGoTopAction(!this.node.isModel && !this.isModelRoot)}
			<SmallIconButton
				Icon={IsolateIcon}
				tooltip="Isolate"
				onClick={this.isolateSelectedNodes}
			/>
			<SmallIconButton
				Icon={this.getVisibilityIcon(this.props.visibilityMap[this.node._id])}
				tooltip="Show/Hide"
				onClick={this.toggleShowNode}
			/>
		</Actions>
	));

	public getVisibilityIcon = (visibility) => {
		if (visibility === VISIBILITY_STATES.VISIBLE) {
			return VisibleIcon;
		} else if (visibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
			return ParentOfVisibleIcon;
		}
		return InvisibleIcon;
	}

	public render() {
		const { expanded, isSearchResult, style, key, active, hasFederationRoot } = this.props;

		return (
			<Container
				style={style}
				key={key}
				nodeType={this.type}
				expandable={this.node.hasChildren && !this.isModelRoot}
				selected={this.isSelected}
				active={active}
				highlighted={this.isHighlighted}
				expanded={isSearchResult && expanded}
				level={this.level}
				hasFederationRoot={hasFederationRoot}
				onClick={this.handleNodeClick}
				onDoubleClick={this.handleDoubleClick}
			>
				{this.renderName()}
				{this.renderActions(!this.node.isFederation)}
			</Container>
		);
	}

	private handleDoubleClick = () => {
		if (this.props.visibilityMap[this.node._id] !== VISIBILITY_STATES.INVISIBLE) {
			this.props.zoomToHighlightedNodes();
		}
	}

	private expandNode = (event) => {
		event.stopPropagation();
		this.props.expandNodes([this.node._id]);
	}

	private collapseNode = (event) => {
		event.stopPropagation();

		if (this.node.hasChildren) {
			this.props.collapseNodes([this.node._id]);
		}
		return;
	}

	private isolateSelectedNodes = (event) => {
		event.stopPropagation();
		this.props.isolateSelectedNodes(this.node._id);
	}

	private toggleShowNode = (event) => {
		event.stopPropagation();
		const visibility = this.props.visibilityMap[this.node._id] === VISIBILITY_STATES.INVISIBLE ?
			VISIBILITY_STATES.VISIBLE :  VISIBILITY_STATES.INVISIBLE;
		this.props.setSelectedNodesVisibility(this.node._id, visibility);
	}

	private goToTop = (event) => {
		event.stopPropagation();
		this.props.onScrollToTop(this.props.index);
	}

	private handleOpenModelClick = () => {
		const [teamspace, name] = this.node.name.split(':');
		const { model } = this.props.settings.subModels.find((subModel) => subModel.name === name);
		const url = `${window.location.origin}/viewer/${teamspace}/${model}`;
		const newWindow = window.open() as any;
		newWindow.opener = null;
		newWindow.location = url;
	}

	private handleNodeClick = () => {
		this.props.onClick(this.node._id);
	}

	private renderName = () => (
		<NameWrapper>
			{this.renderExpandableButton(!this.node.isFederation && !this.isModelRoot && !this.props.isSearchResult)}
			<Name nodeType={this.type}>{this.node.name}</Name>
		</NameWrapper>
	)
}
