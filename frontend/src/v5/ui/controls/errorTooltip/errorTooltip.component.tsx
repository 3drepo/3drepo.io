/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { ReactNode, type JSX } from 'react';
import ErrorCircleIcon from '@assets/icons/filled/error_circle-filled.svg';
import { Container, Tooltip, IconWrapper } from './errorTooltip.styles';

interface IErrorTooltip {
	className?: string;
	children: ReactNode;
}

export const ErrorTooltip = ({ className, children }: IErrorTooltip): JSX.Element => (
	<Container className={className}>
		<Tooltip
			placement="right-start"
			title={children}
		>
			<IconWrapper>
				<ErrorCircleIcon />
			</IconWrapper>
		</Tooltip>
	</Container>
);
