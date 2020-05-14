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

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/Input';
import { Form } from 'formik';

import { COLOR } from '../../../../styles';
// tslint:disable-next-line:max-line-length
import { IssuePopover } from '../../../components/messagesList/components/message/components/markdownMessage/issueReference/issuePopover/issuePopover.component';
import {
	UserPopover
} from '../../../components/messagesList/components/message/components/userPopover/userPopover.component';

export const Container = styled.div`
	position: relative;
	background-color: ${COLOR.WHITE};
	width: 100%;
	min-height: inherit;
`;

export const StyledForm = styled(Form)`
	min-height: inherit;
`;

export const Title = styled.div`
	font-size: 14px;
	color: ${COLOR.BLACK_20};
`;

export const TextFieldWrapper = styled.div`
	.rta {
		position: relative;
		font-size: 18px;
		width: 100%;
		height: 100%;
	}

	.rta__autocomplete {
		position: absolute;
		z-index: 2;
		display: block;
		margin-top: 1em;
		max-width: 380px;
	}

	.rta__autocomplete--top {
		margin-top: 0;
		margin-bottom: 1em;
	}

	.rta__list {
		margin: 0;
		padding: 0;
		background: ${COLOR.WHITE};
		border: 1px solid ${COLOR.BLACK_30};
		border-radius: 3px;
		box-shadow: 0 0 5px rgba(27, 31, 35, 0.1);
		list-style: none;
	}

	.rta__entity {
		width: 100%;
		outline: none;
	}

	.rta__entity:hover {
		cursor: pointer;
	}

	.rta__item:not(:last-child) {
		border-bottom: 1px solid ${COLOR.BLACK_30};
	}

	.rta__entity--selected {
		text-decoration: none;
		background: ${COLOR.BLACK_12};
	}
`;

export const StyledTextField = styled(TextField)`
	font-size: 14px;

	&& {
		textarea {
			padding: 10px 16px;
			box-sizing: border-box;
		}
	}
`;

export const StyledTextFieldContainer = styled(Grid)`
	flex: 1;
`;

export const Actions = styled.div`
	min-height: inherit;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 16px;
`;

export const ActionsGroup = styled.div`
	display: flex;
`;

export const FileUploadContainer = styled.div``;

export const FileUploadInvoker = styled.input.attrs({
	type: 'file',
	accept: 'image/*'
})`
	position:fixed;
	top: -200%;
`;

export const LoaderContainer = styled.div`
	display: flex;
	position: absolute;
	width: 100%;
	height: 100%;
	justify-content: center;
	overflow: hidden;
	top: 0;
	left: 0;
`;

export const RemoveButtonWrapper = styled.div`
	position: absolute;
	right: 0;
	top: ${(props: any) => props.screenshot ? 0 : '-8px'};
` as any;

export const UserSuggestion = styled(UserPopover)`
`;

export const IssueSuggestion = styled(IssuePopover)`
`;
