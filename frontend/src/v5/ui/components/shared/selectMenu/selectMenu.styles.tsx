/**
 *  Copyright (C) 2022 3D Repo Ltd
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
 
import { Select } from '@mui/material';
import styled from 'styled-components';

export const StyledSelectMenu = styled(({ className, ...props }) => (
	<Select {...props} classes={{ popover: className }} />
))`
	& .MuiPopover-root {
		backdrop-filter: blur(0);
		background: transparent;
		box-shadow: 
			0 5px 5px -3px rgb(0 0 0 / 20%), 
			0 8px 10px 1px rgb(0 0 0 / 14%), 
			0 3px 14px 2px rgb(0 0 0 / 12%);
	}
`;
