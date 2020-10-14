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

import * as React from 'react';

import { LinearProgress } from '@material-ui/core';
import { isEmpty } from 'lodash';

import { renderWhenTrue } from '../../../helpers/rendering';
import { COMMENT_FIELD_NAME } from '../../viewerGui/components/commentForm/commentForm.constants';
import { ContainedButton } from '../../viewerGui/components/containedButton/containedButton.component';
import { FieldsRow } from '../../viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { EmptyStateInfo } from '../components.styles';
import AttachResourcesDialog from './attachResourcesDialog/attachResourcesDialog.container';
import {
	ActionContainer, DocumentIcon, IconButton, LinkIcon, PhotoIcon, QuoteIcon, RemoveIcon, ResourcesContainer,
	ResourcesList, ResourceItemContainer, ResourceItemRightColumn, ResourceLabel, ResourceLink, UploadSizeLabel,
} from './resources.styles';

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
	formRef?: any;
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

export const QuoteButton = (props) => (
	<IconButton
		{...props}
		aria-label="Quote resource"
	>
		<QuoteIcon />
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

const ResourceAvailable = ({link, type, name, size, onClickRemove, canEdit, onClickQuote}) => {
	return (
		<ResourceItemContainer>
			<ResourceIcon type={type} />
			<ResourceLink href={link} target="_blank" rel="noopener">
				{name}
			</ResourceLink>
			<ResourceItemRightColumn>
				{size}
				<ActionContainer>
					{canEdit &&
					<>
						<RemoveButton onClick={onClickRemove} />
						<QuoteButton onClick={onClickQuote} />
					</>}
				</ActionContainer>
			</ResourceItemRightColumn>
		</ResourceItemContainer>
	);
};

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

	public onClickQuote = (resource) => (e) => {
		const { current: commentForm } = this.props.formRef;

		if (commentForm) {
			const currentFormCommentValue = commentForm.state.values[COMMENT_FIELD_NAME];
			const additionalNewLine = (!currentFormCommentValue || currentFormCommentValue.endsWith(`\n`)) ? '' : `\n`;

			commentForm
				.setFieldValue(COMMENT_FIELD_NAME, `${currentFormCommentValue}${additionalNewLine}#res.${resource._id} \n`);
		}
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

	public renderResources = renderWhenTrue(() => (
		<ResourcesList>
			{this.props.resources.map((r) => (
				<ResourceItem
					key={r._id}
					{...r}
					canEdit={this.props.canEdit}
					onClickRemove={this.onClickRemove(r)}
					onClickQuote={this.onClickQuote(r)}
				/>
			))}
		</ResourcesList>
	));

	public render() {
		const { resources = [], canEdit } = this.props;

		return (
			<ResourcesContainer>
				{this.renderResources(!isEmpty(resources))}
				{isEmpty(resources) && <EmptyStateInfo>No resources have been attached yet</EmptyStateInfo>}
				<FieldsRow container justify="flex-end">
					<ContainedButton onClick={this.onClickAttach} disabled={!canEdit}>
						Add Resource
					</ContainedButton>
				</FieldsRow>
			</ResourcesContainer>
		);
	}
}
