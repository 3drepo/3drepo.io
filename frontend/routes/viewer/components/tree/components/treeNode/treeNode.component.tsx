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
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ShowIcon from '@material-ui/icons/Visibility';
import IsolateIcon from '@material-ui/icons/VisibilityOutlined';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';

import { Container, Name, NameWrapper, Actions, StyledCollapseButton } from './treeNode.styles';
import {
	TREE_ITEM_FEDERATION_TYPE,
	TREE_ITEM_MODEL_TYPE,
	TREE_ITEM_OBJECT_TYPE
} from '../../../../../../constants/tree';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';

interface IProps {
	id: string;
	name: string;
	level: number;
	parentIndex?: number;
	visible?: boolean;
	selected?: boolean;
	highlighted?: boolean;
	collapsed?: boolean;
	hasChildren?: boolean;
	isModel?: boolean;
	isFederation?: boolean;
}

const CollapseButton = ({ Icon, onClick, collapsed, hasChildren, type }) => (
	<StyledCollapseButton
		onClick={onClick}
		collapsed={collapsed}
		hasChildren={hasChildren}
		type={type}>
		<Icon size="small" />
	</StyledCollapseButton>
);

export class TreeNode extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		visible: false,
		selected: false,
		highlighted: false,
		collapsed: false,
		hasChildren: false,
		isFederation: false,
		isModel: false
	};

	get type() {
		if (this.props.isFederation) {
			return TREE_ITEM_FEDERATION_TYPE;
		} else if (this.props.isModel) {
			return TREE_ITEM_MODEL_TYPE;
		}
		return TREE_ITEM_OBJECT_TYPE;
	}

	public expandNode = () => {
		console.log('open')
	}

	public collapseNode = () => {
		if (this.props.hasChildren) {
			console.log('close')
		}
		return;
	}

	public renderCollapseButton = renderWhenTrue(() => {
		const { collapsed, hasChildren } = this.props;
		return (
			<CollapseButton
				type={this.type}
				collapsed={collapsed}
				hasChildren={hasChildren}
				Icon={collapsed && hasChildren ? AddIcon : RemoveIcon}
				onClick={collapsed && hasChildren ? this.expandNode : this.collapseNode}
			/>
		);
	});

	public renderModelActions = renderWhenTrue(() => (
		<Actions>
			<SmallIconButton
				Icon={OpenInNewIcon}
				tooltip="Open model in new tab"
			/>
		</Actions>
	));

	public renderHighlightedObjectActions = renderWhenTrue(() => (
		<Actions>
			<SmallIconButton
				Icon={UpIcon}
				tooltip="Go to top"
			/>
			<SmallIconButton
				Icon={IsolateIcon}
				tooltip="Isolate"
			/>
			<SmallIconButton
				Icon={ShowIcon}
				tooltip="Show/Hide"
			/>
		</Actions>
	));

	public get isExpandedModelInFederation() {
		return this.type === TREE_ITEM_MODEL_TYPE && this.props.level === 2 && !this.props.collapsed;
	}

	public get isHightlightedObject() {
		return this.type === TREE_ITEM_OBJECT_TYPE && this.props.highlighted;
	}

	public render() {
		const { name, highlighted, collapsed, hasChildren, selected, isFederation, level } = this.props;

		return (
			<Container
				type={this.type}
				collapsable={hasChildren}
				selected={selected}
				highlighted={highlighted}
				collapsed={collapsed}
				level={level}
			>
				<NameWrapper>
					{this.renderCollapseButton(!isFederation)}
					<Name type={this.type}>{name}</Name>
				</NameWrapper>
				{this.renderModelActions(this.isExpandedModelInFederation)}
				{this.renderHighlightedObjectActions(this.isHightlightedObject)}
			</Container>
		);
	}
}
