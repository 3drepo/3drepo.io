/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

interface IProps {
	label: string;
	Icon: React.ComponentType;
	color?: string;
	action?: (event) => void;
	disabled?: boolean;
}

export const TooltipButton = (props: IProps) => {
	const { label, action = null, Icon, color = 'inherit', disabled = false } = props;
	const iconProps = { color, fontSize: 'small' } as any;

	return (
		<Tooltip title={label} disableFocusListener={disabled}>
			<IconButton aria-label={label} onClick={action}>
				<Icon {...iconProps} />
			</IconButton>
		</Tooltip>
	);
};
