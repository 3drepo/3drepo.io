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

import { LinearProgress } from '@material-ui/core';
import * as React from 'react';
import { LabelButton } from '../../viewerGui/components/labelButton/labelButton.styles';
import {
	FieldsRow,
	StyledFormControl
} from '../../viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { FieldLabel } from '../textField/textField.styles';
import AttachResourcesDialog from './attachResourcesDialog/attachResourcesDialog.container';
import { ActionContainer, DocumentIcon,
	IconButton, LinkIcon, PhotoIcon, RemoveIcon,
	ResourcesContainer, ResourceItemContainer, ResourceItemRightColumn, ResourceLabel,
	ResourceLink, UploadSizeLabel } from './resources.styles';

interface IResource {
	_id: string;
	name: string;
	link: string;
	type: string;
	size: number;
}

interface IProps {
	canEdit: boolean;
	resources: IResource[];
	onRemoveResource: (IResource) => void;
	onSaveFiles: (files) => void;
	onSaveLinks: (links) => void;
	showDialog: (config: any) => void;
	toLeft?: boolean;
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

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'pcx'];

const ResourceIcon = ({type}) =>
	(type === 'http') ?
		(<LinkIcon />) :
	(imageExtensions.indexOf(type) >= 0) ?
		(<PhotoIcon />) :
		(<DocumentIcon />)
;

const ResourceAvailable = ({link, type, name, size, onClickRemove, canEdit}) => (
	<ResourceItemContainer>
		<ResourceIcon type={type} />
		<ResourceLink href={link} target="_blank" rel="noopener">
			{name}
		</ResourceLink>
		<ResourceItemRightColumn>
			{size}
			<ActionContainer>
			{canEdit && <RemoveButton onClick={onClickRemove} />}
			</ActionContainer>
		</ResourceItemRightColumn>
	</ResourceItemContainer>
);

const ResourceUploading = ({type, name, size,  progress }) => (
	<>
		<LinearProgress variant="determinate" value={progress} />
		<ResourceItemContainer>
			<ResourceIcon type={type} />
			<ResourceLabel>{name}</ResourceLabel>
			<UploadSizeLabel>{size}</UploadSizeLabel>
		</ResourceItemContainer>
	</>
);

const ResourceItem = (resource) =>
	!resource.uploading ?
		(<ResourceAvailable {...resource} />) :
		(<ResourceUploading {...resource} />)
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
		const { resources = [], canEdit, toLeft } = this.props;

		return (
			<ResourcesContainer>
				<FieldLabel>Resources</FieldLabel>
				{resources.map((r) => (
					<ResourceItem
						key={r._id}
						{...r}
						canEdit={canEdit}
						onClickRemove={this.onClickRemove(r)}
					/>
				))}
				<FieldsRow container justify="space-between" flex={0.5}>
					{!toLeft && <StyledFormControl />}
					<StyledFormControl>
						<span>
							<LabelButton disabled={!canEdit} onClick={this.onClickAttach}>Attach resource</LabelButton>
						</span>
					</StyledFormControl>
				</FieldsRow>
			</ResourcesContainer>
		);
	}
}
