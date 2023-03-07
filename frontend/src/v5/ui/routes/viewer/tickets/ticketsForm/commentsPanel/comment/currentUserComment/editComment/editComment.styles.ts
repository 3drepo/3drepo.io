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

import styled from 'styled-components';
import { FormTextArea } from '@controls/inputs/formInputs.component';
import { CommentContainer } from '../../basicComment/basicComment.styles';
import { MessageInput } from '../../../createCommentBox/createCommentBox.styles';

export const EditCommentContainer = styled(CommentContainer)`
	border-radius: 0;
	border: solid 1px ${({ theme }) => theme.palette.secondary.lightest};
	border-bottom-color: ${({ theme }) => theme.palette.primary.main};
	margin-left: auto;
	width: 380px;
`;

export const EditCommentInput = styled(MessageInput).attrs({
	as: FormTextArea,
	minRows: 1,
})`
	.MuiInputBase-multiline {
		padding: 0;

		& fieldset,
		&:hover fieldset {
			border: none;
		}
	}
		
	.Mui-focused:not(.Mui-disabled) fieldset.MuiOutlinedInput-notchedOutline {
		border: none;
		box-shadow: none;
	}
`;

export const EditCommentButtons = styled.div`
	margin: 4px 5px 0 auto;
	display: flex;
	flex-direction: row;
`;
