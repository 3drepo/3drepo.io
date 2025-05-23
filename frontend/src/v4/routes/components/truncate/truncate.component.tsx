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

import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { memo, ReactNode } from 'react';
import TruncateBase from 'react-truncate';

import { Container } from './truncate.styles';

interface IProps {
	className?: string;
	children: string | ReactNode;
	lines: number;
	ellipsis?: string | ReactNode;
	trimWhitespace?: boolean;
	width?: number;
	onTruncate?: () => void;
}

export const Truncate = memo(({ children, className, ...props }: IProps) => (
	<Container className={className}>
		<Tooltip title={children}>
			<Box>
				<TruncateBase {...props}>{children}</TruncateBase>
			</Box>
		</Tooltip>
	</Container>
));
