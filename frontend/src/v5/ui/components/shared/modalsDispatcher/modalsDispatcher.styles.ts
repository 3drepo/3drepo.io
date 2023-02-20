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

import styled from 'styled-components';
import { Dialog, DialogContent, DialogProps, IconButton } from '@mui/material';
import { Typography } from '@controls/typography';
import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { Truncate } from '@/v4/routes/components/truncate/truncate.component';
import { ErrorMessage as ErrorMessageBase } from '@controls/errorMessage/errorMessage.component';
import WarningIconBase from '@assets/icons/outlined/warning-outlined.svg';

export const Modal = styled(Dialog).attrs(({ maxWidth = 'md' }: DialogProps) => ({ maxWidth }))``;

export const CloseButton = styled(IconButton).attrs({
	'aria-label': 'Close modal',
})`
	position: absolute;
	top: 11px;
	right: 11px;
`;

export const ModalContent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 633px;
	padding: 43px 0 25px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
`;

export const Actions = styled.div`
	display: flex;
`;

export const Message = styled(DialogContent)`
	width: 450px;
`;

export const Details = styled(Typography).attrs({
	variant: 'body1',
})`
	margin-top: 5px;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const Status = styled(Typography).attrs({
	variant: 'h5',
	component: 'p',
})`
	text-align: center;
	margin-top: 8px;
	margin-bottom: 0;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const TruncatableTitle = styled(Truncate).attrs({
	lines: 1,
	width: 400,
})``;

export const RetypeCheck = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 22px;
`;

export const Instruction = styled.div`
	${({ theme }) => theme.typography.body1}
	color: ${({ theme }) => theme.palette.base.main};
	text-align: center;
	overflow-wrap: break-word;
	width: auto;
	max-width: 450px;
`;

export const RetypeCheckField = styled(FormTextField)`
	margin-top: 10px;
	width: 296px;
`;

export const ConfirmationPhrase = styled.span`
	font-weight: ${FONT_WEIGHT.BOLDER};
	color: ${({ theme }) => theme.palette.error.main};
`;

export const ErrorMessage = styled(ErrorMessageBase)`
	justify-content: center;
`;

export const WarningIcon = styled(WarningIconBase)`
	color: ${({ theme }) => theme.palette.favourite.main};
`;
