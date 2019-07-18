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

import React, { useState } from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import { COLOR } from '../../../../styles';
import { SmallIconButton } from '../../../components/smallIconButon/smallIconButton.component';

import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { StarIcon } from '../../../components/starIcon/starIcon.component';
import { RowMenu } from '../rowMenu/rowMenu.component';

import {
	Container,
	Content,
	Header,
	Name,
	NameWrapper,
	PropertiesColumn,
	Property,
	Timestamp
} from './modelGridItem.styles';
import { ROW_ACTIONS } from '../../teamspaces.contants';

interface IProps {
	className?: string;
	name: string;
	model: string;
	permissions: any[];
	projectName: string;
	status: string;
	timestamp: string;
	federate: boolean;
	onSettingsClick: () => void;
	onPermissionsClick: () => void;
	onDeleteClick: () => void;
	onModelUpload: () => void;
	onRevisionsClick: () => void;
	onDownloadClick: () => void;
	onEditClick: () => void;
}

const MoreIcon = () => (<MoreVert fontSize="small" />);

export function ModelGridItem({
	name, className, federate = false, permissions, timestamp,
	onSettingsClick,
	onPermissionsClick,
	onDeleteClick,
	onModelUpload,
	onRevisionsClick,
	onDownloadClick,
	onEditClick
}: IProps) {
	const renderActions = (actions) => {
		return actions ? actions.map((actionItem, index) => {
			const {label, action, Icon, color, isHidden = false, requiredPermissions = ''} = actionItem;
			const iconProps = {color, fontSize: 'small'} as any;
			const ActionsIconButton = () => (<Icon {...iconProps} />);

			if (!isHidden) {
				return renderWhenTrue((
					<SmallIconButton
						aria-label={label}
						onClick={action}
						Icon={ActionsIconButton}
						tooltip={'Hello'}
					/>
				))(hasPermissions(requiredPermissions, permissions));
			}
		}) : null;
	};

	const toggleActionsMenuOpen = () => {
		this.setState({actionsMenuOpen: !this.state.actionsMenuOpen});
	};

	const sharedActions = [{
		...ROW_ACTIONS.SETTINGS,
		action: onSettingsClick
	}, {
		...ROW_ACTIONS.PERMISSIONS,
		action: onPermissionsClick
	}, {
		...ROW_ACTIONS.DELETE,
		action: onDeleteClick
	}];

	const modelActions = [{
		...ROW_ACTIONS.UPLOAD_FILE,
		action: onModelUpload
	}, {
		...ROW_ACTIONS.REVISIONS,
		action: onRevisionsClick
	}, {
		...ROW_ACTIONS.DOWNLOAD,
		action: onDownloadClick,
		isHidden: !Boolean(timestamp)
	}, ...sharedActions];

	const hovered = false;
	const isPending = false;
	const actionsMenuOpen = false;

	const federationActions = [{
		...ROW_ACTIONS.EDIT,
		action: onEditClick
	}, ...sharedActions];

	const rowActions = federate ? federationActions : modelActions;

	return (
		<Container className={className} federate={federate}>
			<Header>
				<NameWrapper>
					<StarIcon active={Number(federate)} activeColor={COLOR.SUNGLOW}	onClick={() => {console.log('star click')}} />
					<Name>{name}</Name>
				</NameWrapper>
				{/* TODOL RowMenu */}
				{/* <RowMenu
						open={hovered}
						disabled={isPending}
						forceOpen={actionsMenuOpen}
						toggleForceOpen={toggleActionsMenuOpen}
					>
						{renderActions(rowActions)}
				</RowMenu> */}
			</Header>
			<Content>
				<PropertiesColumn>
					<Property>MC1</Property> {/* TODO: Model code */}
					<Property>SC1</Property> {/* TODO: Suitability code */}
				</PropertiesColumn>
				<Timestamp>30/09/2019 16:30</Timestamp> {/* TODO: Last updated */}
			</Content>
		</Container>
	);
}
