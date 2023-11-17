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

import { SubmitButton as SubmitButtonBase } from '@controls/submitButton';
import { SuccessMessage as SuccessMessageBase } from '@controls/successMessage/successMessage.component';
import { Typography } from '@mui/material';
import styled from 'styled-components';

export const SubmitButton = styled(SubmitButtonBase)`
	width: fit-content;
	margin: 0 auto 0 0;
`;

export const Form = styled.form`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	width: 470px;
`;

export const Section = styled.div`
	width: 100%;
	margin-bottom: 41px;
`;

export const Header = styled(Typography).attrs({
	variant: 'h2',
	color: 'secondary',
})``;

export const ImageInfo = styled(Typography).attrs({
	variant: 'body1',
})`
	color: ${({ theme }) => theme.palette.base.main};
	margin: 8px 0 19px;
`;

export const SuccessMessage = styled(SuccessMessageBase)`
	width: 470px;
`;
