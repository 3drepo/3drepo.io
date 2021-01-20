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

import styled from 'styled-components';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { COLOR } from '../../../../styles';
import { ContainedButton } from '../../../viewerGui/components/containedButton/containedButton.component';
import { DividerWithText } from '../../dividerWithText/dividerWithText.component';

export const Container = styled.div`
	padding: 16px;
	max-width: 250px;
`;

export const PrimaryButton = styled(Button).attrs({
	variant: 'contained',
	color: 'secondary',
})`
	&& {
		width: 100%;
		margin: 8px 0;

		svg {
			margin-left: -10px;
		}
	}
`;

export const SecondaryButton = styled(PrimaryButton).attrs({
	color: 'primary',
})`
	&& {
		background-color: ${COLOR.SOFT_BLUE};
	}
`;

export const StopButton = styled(PrimaryButton).attrs({
	color: 'inherit',
})`
	&& {
		background-color: ${COLOR.DUSTY_RED};
		color: ${COLOR.WHITE};

		&:hover {
			background-color: ${COLOR.MAROON};
		}
	}
`;

export const StyledTextfield = styled(TextField)`
	&& {
		width: 100%;
		margin-bottom: 16px;

		input {
			color: ${(props) => props.disabled ? COLOR.BLACK_87 : 'inherit' };
		}
	}
`;

export const StyledDivider = styled(Divider)`
	&& {
		margin: 12px -16px;
	}
`;

export const StyledDividerWithText = styled(DividerWithText)`
	&& {
		margin: 12px -16px;
	}
`;

export const Paragraph = styled(Typography).attrs({
	component: 'p',
})`
	&& {
		padding-top: 8px;
		padding-bottom: 8px;
		color: ${COLOR.BLACK_60}
	}
`;

export const Link = styled.a`
	color: ${COLOR.PRIMARY_MAIN};
	text-decoration: underline;
	outline: none;
`;

export const FieldContainer = styled.div`
	display: flex;
	align-items: center;
`;

export const CopyButton = styled(ContainedButton)`
	&& {
		margin-left: 8px;
	}
`;

export const ButtonContainer = styled.div`
	display: flex;
	justify-content: space-between;

	& > *:not(:last-child) {
		margin-right: 10px;
	}
`;
