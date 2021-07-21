/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import IconButton from '@material-ui/core/IconButton';
import SelectSimilarIcon from '@material-ui/icons/Adjust';
import CopyIcon from '@material-ui/icons/FileCopy';
import styled from 'styled-components';

import { COLOR } from '../../../../../../styles';
import { LinkableField } from '../../../../../components/linkableField/linkableField.component';

export const Actions = styled.div`
	display: flex;
	visibility: hidden;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 4px 0;

	&:nth-child(2n) {
		background-color: ${COLOR.BLACK_6};
	}

	&:hover {
		${Actions} {
			visibility: visible;
		}
	}
`;

export const MetaKey = styled.div`
	width: 50%;
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
`;

export const MetaKeyText = styled.div`
	color: ${COLOR.BLACK_60};
	font-size: 14px;
	padding-right: 10px;
	word-break: break-word;
`;

export const MetaValue = styled(LinkableField)`
	width: 50%;
	color: ${COLOR.BLACK_87};
	font-size: 14px;
	padding-right: 10px;
	word-break: break-word;
`;

export const StarIconWrapper = styled.div`
	width: 20px;
	margin-left: 5px;
	margin-right: 2px;
	margin-top: -2px;
` as any;

export const StyledIconButton = styled(IconButton)`
	&& {
		padding: 6px;
	}
`;

export const StyledCopyIcon = styled(CopyIcon).attrs({
	fontSize: 'small',
})`
	&& {
		color: ${COLOR.PRIMARY_DARK};
	}
`;

export const StyledSelectSimilarIcon = styled(SelectSimilarIcon).attrs({
	fontSize: 'small',
})`
	&& {
		color: ${COLOR.PRIMARY_DARK};
	}
`;
