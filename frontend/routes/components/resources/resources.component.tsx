/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { RemoveIcon, IconButton } from './resources.styles';

interface IResource {
	_id: string;
	name: string;
	link: string;
	type: string;
	size: number;
}

interface IProps {
	resources: IResource[];
	onRemoveResource: (IResource) => void;
}

interface IState {
	value: any;
}

const RemoveButton = (props) => (
	<IconButton
		{...props}
		aria-label="Toggle menu"
		aria-haspopup="true"
	>
		<RemoveIcon />
	</IconButton>
);

const ResourceItem = ({_id, link, type, name, size, onClickRemove}) => (
	<div key={_id}>{type} |
				<a href={link} target="_blank" rel="noopener" >{name}</a> |
				{size} |
				<RemoveButton onClick={onClickRemove}/></div>
);

export class Resources extends React.PureComponent<IProps, IState> {
	public removeResource = (r) => (e) => {
		this.props.onRemoveResource(r);
	}

	public render() {
		return this.props.resources.map((r) => (<ResourceItem key={r._id} {...r} onClickRemove={this.removeResource(r)}/>));
	}
}
