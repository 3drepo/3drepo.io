/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { Tooltip } from '@mui/material';
import { useContext } from 'react';
import { ToolbarSelectContext } from '../toolbarSelectContext';
import { IconContainer, RefContainer } from './toolbarSelectItem.styles';

type ToolbarSelectItemProps = {
	value: any;
	title?: string;
	Icon: any;
	selected?: boolean;
	className?: string;
	onClick?: () => void;
	disabled?: boolean,
};
export const ToolbarSelectItem = ({ value, title = '', Icon, onClick, ...props }: ToolbarSelectItemProps) => {
	const { onChange, setExpanded } = useContext(ToolbarSelectContext);

	const handleClick = () => {
		onChange({ value, Icon });
		setExpanded(false);
		onClick?.();
	};

	return (
		<IconContainer onClick={handleClick} {...props}>
			<Tooltip placement='right' title={title}>
				<RefContainer>
					<Icon />
				</RefContainer>
			</Tooltip>
		</IconContainer>
	);
};
