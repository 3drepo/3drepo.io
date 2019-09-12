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
import { Transformer } from 'react-konva';

interface IProps {
	visible: boolean;
	selectedShapeName: any;
}

export class TransformerComponent extends React.PureComponent <IProps, any> {
	public nodeRef = React.createRef<any>();

	public componentDidMount() {
		this.checkNode();
	}

	public componentDidUpdate() {
		this.checkNode();
	}

	public onTransformStart() {
		console.log('onTransformStart');
	}

	public onTransform() {
		console.log('onTransform');
	}

	public onTransformEnd() {
		console.log('end transform');
	}

	public checkNode() {
		const stage = this.nodeRef.current.getStage();
		const { selectedShapeName } = this.props;

		let selectedNode = stage.findOne('.' + selectedShapeName);
		if (selectedNode === this.nodeRef.current.node()) {
			return;
		}
		if (selectedNode) {
			const type = selectedNode.getType();
			if ( type !== 'Group') {
				selectedNode = selectedNode.findAncestor('Group');
			}
			this.nodeRef.current.attachTo(selectedNode);
		} else {
			this.nodeRef.current.detach();
		}

		this.nodeRef.current.getLayer().batchDraw();
	}

	public render() {
		return (
			<Transformer
				ref={this.nodeRef}
				transformstart={this.onTransformStart}
				transform={this.onTransform}
				transformend={this.onTransformEnd}
				enabledAnchors={[]}
				visible={this.props.visible}
			/>
		);
	}
}
