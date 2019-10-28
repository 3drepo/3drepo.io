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

import MoreVert from '@material-ui/icons/MoreVert';
import React, { memo, useCallback, useRef, useState } from 'react';

import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue } from '../../../../helpers/rendering';
import { useOnScreen } from '../../../../hooks';
import { SmallIconButton } from '../../../components/smallIconButon/smallIconButton.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { Actions, ActionsButton, Container, StyledGrid } from './actionsMenu.styles';

interface IAction {
	label: string;
	color: string;
	Icon: any;
	isHidden?: boolean;
	requiredPermissions?: string;
	onClick: () => void;
}

interface IProps {
	className?: string;
	isPending?: boolean;
	federate: boolean;
	actions: any[];
	permissions: any[];
}

const MoreIcon = () => <MoreVert fontSize="small" />;

const renderActions = (actions = [], isPending, permissions = []) => {
	return actions.map(({ label, onClick, Icon, color, isHidden = false, requiredPermissions = '' }: IAction) => {
		const iconProps = { fontSize: 'small' } as any;
		const disabled = isPending && [ROW_ACTIONS.UPLOAD_FILE.label, ROW_ACTIONS.DELETE.label].includes(label);
		if (!disabled) {
			iconProps.color = color;
		}
		const ActionsIconButton = () => (<Icon {...iconProps} />);

		if (!isHidden) {
			return renderWhenTrue((
				<SmallIconButton
					key={label}
					aria-label={label}
					onClick={onClick}
					Icon={ActionsIconButton}
					tooltip={label}
					disabled={disabled}
				/>
			))(hasPermissions(requiredPermissions, permissions));
		}
	});
};

export const ActionsMenu = memo(({federate, isPending, actions = [], permissions = []}: IProps) => {
	const ref = useRef();
	const [forceOpen, setForceOpen] = useState(false);
	const isOnScreen = useOnScreen(ref, '0px', true);

	const forceOpenHandler = useCallback((event) => {
		event.stopPropagation();
		setForceOpen(!forceOpen);
	}, [forceOpen]);

	return (
		<Container ref={ref}>
			<ActionsButton>
				<SmallIconButton
					ariaLabel="Toggle actions menu"
					Icon={MoreIcon}
					onClick={forceOpenHandler}
					disabled={isPending}
				/>
			</ActionsButton>
			<StyledGrid
				container
				wrap="wrap"
				direction="row"
				alignItems="center"
				justify="flex-start"
				theme={{ forceOpen, federate }}
			>
				{isOnScreen && <Actions>{renderActions(actions, isPending, permissions)}</Actions>}
			</StyledGrid>
		</Container>
	);
});
