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

import Tooltip from '@material-ui/core/Tooltip';
import React, { memo } from 'react';
import TruncateBase from 'react-truncate';

import { Container } from './truncate.styles';

interface IProps {
	className?: string;
	children: string | React.ReactNode;
	lines: number | boolean;
	ellipsis?: string | React.ReactNode;
	trimWhitespace?: boolean;
	width?: number;
	onTruncate?: () => void;
}

export const Truncate = memo((props: IProps) => {
	const { children, ...truncateProps } = props;

	return (
		<Container className={props.className}>
			<Tooltip title={children}>
				<TruncateBase {...truncateProps}>{children}</TruncateBase>
			</Tooltip>
		</Container>
	);
});
