/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

import { COLOR, FONT_WEIGHT } from '../../styles';
import * as PanelStyles from '../components/panel/panel.styles';

export const Container = styled(Grid)`
	&& {
		height: 100%;
		z-index: 1;
	}

	${PanelStyles.Container} {
		margin-top: 30px;
	}

	${PanelStyles.Content} {
		padding: 20px 20px 10px;
		overflow-y: auto;
		overflow-x: hidden;
	}
`;

export const Headline = styled.h3`
	color: ${COLOR.BLACK_60};
	font-weight: ${FONT_WEIGHT.NORMAL};
	margin-top: 10px;
`;

export const StyledButton: any = styled(Button)`
	&& {
		padding-left: 0;
		padding-right: 0;
	}
`;

export const LoginButtons = styled(Grid)`
	&& {
		padding: 10px 0 25px;
	}
`;

export const UserNotice = styled.span`
	color: ${COLOR.BLACK_60};
	margin: 10px 0;
`;

export const FooterContainer = styled.aside`
	&& {
		display: flex;
		justify-content: space-between;
		padding-top: 10px;
		font-size: 14px;

		${StyledButton} {
			margin-left: 5px;
			color: ${COLOR.BLACK_60};
		}
	}
`;

export const Version = styled(Grid)`
	&&, && ${StyledButton} {
		margin-left: 0;
		color: ${COLOR.BLACK_30};
	}
`;
