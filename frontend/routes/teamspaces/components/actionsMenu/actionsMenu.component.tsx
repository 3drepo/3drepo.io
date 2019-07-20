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
import React, { useState } from 'react';
import { SmallIconButton } from './../../../components/smallIconButon/smallIconButton.component';

import { ActionsButton, Container, StyledGrid } from './actionsMenu.styles';

interface IProps {
	className?: string;
	disabled: boolean;
	federate: boolean;
	children: any;
}

const MoreIcon = () => <MoreVert fontSize="small" />;

export function ActionsMenu(props: IProps) {
	const [open, setOpen] = useState(false);
	const [toggleForceOpen, setToggleForceOpen] = useState(false);
	const opened = open || toggleForceOpen;

	const toggleForceOpenHandler = () => setToggleForceOpen(!toggleForceOpen);
	const closeHandler = () => setOpen(false);
	const openHandler = () => setOpen(true);

	return (
		<Container onMouseLeave={closeHandler}>
			<ActionsButton onMouseEnter={openHandler}>
				<SmallIconButton
					aria-label={'Toggle actions menu'}
					Icon={MoreIcon}
					onClick={toggleForceOpenHandler}
					disabled={props.disabled}
					tooltip={'Toggle actions menu'}
				/>
			</ActionsButton>
			<StyledGrid
				container
				wrap="wrap"
				direction="row"
				alignItems="center"
				justify="flex-start"
				opened={opened}
				federate={props.federate}
			>
				{props.children}
			</StyledGrid>
		</Container>
	);
}