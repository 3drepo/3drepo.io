/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import IconButtonComponent from '@mui/material/IconButton';
import Description from '@mui/icons-material/Description';
import QuoteIconComponent from '@mui/icons-material/FormatQuote';
import Link from '@mui/icons-material/Link';
import Photo from '@mui/icons-material/Photo';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';
import styled from 'styled-components';

import { AuthAnchor } from '@components/authenticatedResource/authAnchor.component';
import { COLOR } from '../../../styles';

export const RemoveIcon = styled(RemoveCircleOutline)`
	&& {
		font-size: 20px;
	}
`;

export const IconButton = styled(IconButtonComponent)`
	&& {
		width: 28px;
		height: 28px;
		padding: 4px;
	}
`;

export const QuoteIcon = styled(QuoteIconComponent)`
	&& {
		font-size: 20px;
	}
`;

export const ResourcesContainer = styled.div`
	margin-top: 5px;
	margin-bottom: 5px;
`;

export const ResourcesList = styled.div`
	margin-top: 25px;
	margin-bottom: 25px;
`;

export const ActionContainer = styled.span`
	min-width: 28px;
	min-height: 28px;
`;

export const ResourceIconContainer = styled.div``;

export const ResourceItemRightColumn = styled.div`
	display: flex;
	align-items: center;
`;

export const ResourceItemLeftColumn = styled.div`
	display: contents;
`;

export const ResourceItemContainer = styled.div`
	font-size: 14px;
	color: ${COLOR.BLACK_60};
	display: flex;
	align-items: center;
	& ${/* sc-selector */ResourceItemRightColumn},
	& ${/* sc-selector */ResourceItemLeftColumn} > * {
		padding-left: 3px;
		padding-right: 3px;
		padding-top: 1px;
		padding-bottom: 1px;
	}
`;

export const ResourceLink = styled(AuthAnchor)`
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: ${COLOR.BLACK_60};
`;

export const ResourceLabel = styled.div`
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: ${COLOR.BLACK_60};
`;

export const UploadSizeLabel = styled.div`
	padding-right: 28px;
`;

const Icon = (icon) => styled(icon).attrs({
	color: 'primary',
	classes: {
		colorPrimary: 'primary'
	}
})`
	&& {
		&.primary {
			color: ${COLOR.BLACK_54};
		}
	}
`;

export const PhotoIcon = Icon(Photo) as any;

export const LinkIcon = Icon(Link) as any;

export const DocumentIcon = Icon(Description) as any;

export const Size = styled.span``;
