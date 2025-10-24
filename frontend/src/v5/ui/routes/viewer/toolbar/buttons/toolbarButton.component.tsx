/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { Tooltip, TooltipProps } from '@mui/material';
import { Container } from './toolbarButton.styles';

type ToolbarButtonProps = {
	hidden?: boolean;
	disabled?: boolean;
	selected?: boolean;
	onClick?: () => void;
	Icon: any;
	title: string;
	tooltipProps?: Omit<TooltipProps, 'title' | 'children'>;
};
export const ToolbarButton = ({ Icon, title, tooltipProps, ...props }: ToolbarButtonProps) => (
	<Tooltip {...tooltipProps} placement="top" title={title}>
		<Container {...props}>
			<Icon />
		</Container>
	</Tooltip>
);
