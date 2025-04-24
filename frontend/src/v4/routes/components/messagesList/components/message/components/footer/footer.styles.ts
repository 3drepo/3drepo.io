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

import styled, { css } from 'styled-components';

import IconButtonComponent from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import QuoteIcon from '@mui/icons-material/FormatQuote';
import ReplyIcon from '@mui/icons-material/Reply';

import { COLOR } from '../../../../../../../styles';

export const Container = styled.footer`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-top: 8px;
`;

const commonTextStyle = css`
	&& {
		color: ${COLOR.BLACK_40};
		font-size: 10px;
		font-style: italic;
	}
`;

export const Date = styled(Typography)`
	${commonTextStyle};

	&& {
		margin-left: 0;
	}

	&::before {
		content: '• ';
	}
`;

export const Fullname = styled(Typography)`
	${commonTextStyle};

	&& {
		margin: 0 4px;
	}
`;

export const IconButton = styled(IconButtonComponent)`
	&& {
		padding: 2px;
	}
`;

const commonIconStyles = css`
	&& {
		font-size: 12px;
	}
`;

export const StyledQuoteIcon = styled(QuoteIcon)`
	${commonIconStyles};
`;

export const StyledReplyIcon = styled(ReplyIcon)`
	${commonIconStyles};
`;
