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
import { PureComponent } from 'react';
import { Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RemoveIcon from '@mui/icons-material/Remove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import IsolateIcon from '@mui/icons-material/VisibilityOutlined';

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
	teamspace: string;
	project: string;
	isSearchResult?: boolean;
	visibilityMap: any;
	selectionMap: any;
	rev: any;
	highlighted?: boolean;
	expanded?: boolean;
	selected?: boolean;
	active?: boolean;
	activeNodeIsVisible?: boolean;
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
const VisibleIcon = () => <VisibilityIcon color="secondary" />;
const InvisibleIcon = () => <VisibilityOffIcon color="action" />;

export class TreeNode extends PureComponent<IProps, any> {
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

	get isModelRef() {
		return this.node.type === "ref";
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
		expandable: false,
		childrenNumber: 0
	};

	private renderExpandableButton = renderWhenTrue(() => {
		const { expanded } = this.props;
		return (
			<CollapseButton
				nodeType={this.type}
				expanded={expanded}
				hasChildren={this.node.expandable}
				Icon={!expanded && this.node.expandable ? AddIcon : RemoveIcon}
				onClick={!expanded && this.node.expandable ? this.expandNode : this.collapseNode}
			/>
		);
	});

	private renderOpenModelAction = renderWhenTrue(() => (
		<SmallIconButton
			Icon={OpenInNewIcon}
			tooltip={`Open Container in new tab`}
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
			{this.renderOpenModelAction(this.isModelRef)}
			{this.renderGoTopAction(!this.node.isModel && !this.isModelRoot && !this.isModelRef)}
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
		const { expanded, isSearchResult, style, key, active, hasFederationRoot, activeNodeIsVisible } = this.props;

		return (
			<Tooltip title={this.node.name.trim()} placement="bottom">
				<Container
					style={style}
					key={key}
					nodeType={this.type}
					expandable={this.node.expandable && !this.isModelRoot}
					selected={this.isSelected}
					active={active}
					activeNodeIsVisible={activeNodeIsVisible}
					highlighted={this.isHighlighted}
					expanded={isSearchResult && expanded}
					level={this.level}
					hasFederationRoot={hasFederationRoot}
					onClick={this.handleNodeClick}
					onDoubleClick={this.handleDoubleClick}
					$isContainer={this.level === (hasFederationRoot ? 2 : 1)}
				>
					{this.renderName()}
					{this.renderActions(!this.node.isFederation)}
				</Container>
			</Tooltip>
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

		if (this.node.expandable) {
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
		const { teamspace, project } = this.props;
		const { model } = this.props.settings.subModels.find((subModel) => subModel.name === this.node.name);

		const url = `${window.location.origin}/v5/viewer/${teamspace}/${project}/${model}`;
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
