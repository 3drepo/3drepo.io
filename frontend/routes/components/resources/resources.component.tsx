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
import { LabelButton } from '../../viewer/components/labelButton/labelButton.styles';
import { AttachResourcesDialog } from './attachResourcesDialog/attachResourcesDialog.component';
import { LinearProgress } from '@material-ui/core';

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
	onSaveFiles: (files) => void;
	onSaveLinks: (links) => void;
	showDialog: (config: any) => void;
}

interface IState {
	value: any;
}

export const RemoveButton = (props) => (
	<IconButton
		{...props}
		aria-label="Toggle menu"
		aria-haspopup="true"
	>
		<RemoveIcon />
	</IconButton>
);

const ResourceAvailable = ({_id, link, type, name, size, onClickRemove}) => (
	<div>
		{type} |
		<a href={link} target="_blank" rel="noopener" >{name}</a> |
		{size} |
		<RemoveButton onClick={onClickRemove}/>
	</div>
);

const ResourceUploading = ({type, name, size,  progress }) => (
	<div >
		<LinearProgress variant="determinate" value={progress} />
		{type} |
		{name} |
		{size}
	</div>
);

const ResourceItem = (resource) =>
	!resource.uploading ?
		(<ResourceAvailable {...resource}/>) :
		(<ResourceUploading {...resource}/>)
;

export class Resources extends React.PureComponent<IProps, IState> {
	public onClickRemove = (r) => (e) => {
		this.props.onRemoveResource(r);
	}

	public onClickAttach = () => {
		const {onSaveFiles, onSaveLinks} = this.props;
		this.props.showDialog({
				title: 'Attach Resources',
				template: AttachResourcesDialog,
				data: {
					onSaveFiles,
					onSaveLinks
				}
		});
	}

	public render() {
		const resources = this.props.resources || [];

		return (
			<span>
				{resources.map((r) => (<ResourceItem key={r._id} {...r} onClickRemove={this.onClickRemove(r)}/>))}
				<LabelButton onClick={this.onClickAttach}>Attach resource</LabelButton>
			</span>
		);
	}
}
