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

import { formatMessage } from '@/v5/services/intl';
import { Tooltip, MenuList } from '@mui/material';
import EllipsisIcon from '@assets/icons/outlined/ellipsis-outlined.svg';
import { ActionMenu } from '@controls/actionMenu';
import { EllipsisButton } from './ellipsisMenu.styles';

import type { JSX } from "react";

export interface IEllipsisMenu {
	selected?: boolean;
	children: any;
	className?: string;
	disabled?: boolean;
}

export const EllipsisMenu = ({ selected, children, className, disabled }: IEllipsisMenu): JSX.Element => {
	if (disabled) {
		return (
			<EllipsisButton variant={selected ? 'secondary' : 'primary'} disabled>
				<EllipsisIcon />
			</EllipsisButton>
		);
	}

	return (
		<ActionMenu
			TriggerButton={(
				<Tooltip title={formatMessage({ id: 'ellipsisMenu.tooltip', defaultMessage: 'More options' })}>
					<div>
						<EllipsisButton variant={selected ? 'secondary' : 'primary'}>
							<EllipsisIcon />
						</EllipsisButton>
					</div>
				</Tooltip>
			)}
			className={className}
		>
			<MenuList>
				{children}
			</MenuList>
		</ActionMenu>
	);
};
