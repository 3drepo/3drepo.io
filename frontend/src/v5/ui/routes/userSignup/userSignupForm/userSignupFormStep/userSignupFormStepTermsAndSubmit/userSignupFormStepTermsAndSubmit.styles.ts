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

import styled from 'styled-components';
import { Link as LinkBase } from 'react-router-dom';
import { SubmitButton } from '@controls/submitButton/submitButton.component';
import ErrorIconBase from '@assets/icons/warning_small.svg';
import { FormCheckbox as FormCheckboxBase } from '@controls/formCheckbox/formCheckbox.component';

export const CreateAccountButton = styled(SubmitButton)`
	margin: 20px 0 0;
`;

export const TermsContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	/*TODO - fix when new palette will be implemented*/
	background-color: #edf0f8;
	border-radius: 5px;
	padding: 14px;
	margin-top: 22px;
	box-sizing: border-box;
	
	.grecaptcha-badge {
		visibility: hidden;
	}
`;

export const CheckboxContainer = styled.div`
	width: 100%;
`;

export const CheckboxMessage = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.caption};
`;

export const Link = styled(LinkBase).attrs({
	target: '_blank',
})`
	text-underline-offset: 1.4px;
	
	&& {
		text-decoration: underline;
	}

	&, &:active, &:visited, &:hover {
		color: currentColor;
	}
`;

export const ErrorContainer = styled.div`
	color: ${({ theme }) => theme.palette.error.main};
	${({ theme }) => theme.typography.body1};
	font-weight: 500;
	margin-top: 13px;
	justify-content: flex-start;
	display: flex;
`;

export const ErrorIcon = styled(ErrorIconBase)`
	margin-right: 8px;
	min-width: 18px;
`;

export const ErrorMessage = styled.div`
	margin-left: 8px;
`;

export const CircularProgressContainer = styled.div`
	margin: auto;
	margin-top: 20px;
	height: 35px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const Gap = styled.div`
	height: 10px;
`;

export const FormCheckbox = styled(FormCheckboxBase)`
	svg {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;
