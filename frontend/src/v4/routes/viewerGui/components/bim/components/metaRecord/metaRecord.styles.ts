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

import IconButton from '@mui/material/IconButton';
import SelectSimilarIcon from '@mui/icons-material/Adjust';
import CopyIcon from '@mui/icons-material/FileCopy';
import { Tooltip } from '@mui/material';

import { COLOR } from '@/v4/styles';
import {
	List as ListComponent,
	Title as TitleComponent,
	SectionHeader,
} from '../../../measurements/components/measurementsList/measurementsList.styles';
import {
	MeasurementValue as ValueComponent,
	Actions as ActionsComponent,
} from '../../../measurements/components/measureItem/measureItem.styles';
import { LinkableField } from '../../../../../components/linkableField/linkableField.component';


export const Actions = styled(ActionsComponent)`
	visibility: hidden;
`;

export const List = styled(ListComponent)`
	border-bottom: none;

	${SectionHeader} {
		padding-left: 14px;
		background-color: ${COLOR.BLACK_6};
	}
	
	& & {
		${SectionHeader} {
			padding-left: 24px;
		}
	}

	& & & ${SectionHeader} {
		padding-left: 36px;
	}
`;

export const Title = styled(TitleComponent)`
	width: 30%;
	margin-top: 10px;
	margin-bottom: 10px;
	white-space: break-spaces;
	overflow: initial;
	word-break: break-word;
`;

const SectionHeaderStyles = css`
	border-bottom-color: ${COLOR.BLACK_20};

	${Title} {
		word-break: unset;
	}
`;

export const Header = styled(SectionHeader)`
	${({ section }: { section: boolean }) => section ? SectionHeaderStyles : css`
		border-bottom-color: ${COLOR.BLACK_6};
	`};
	height: auto;
	min-height: 40px;

	&:hover {
		${Actions} {
			visibility: visible;
		}
	}
`;

export const Value = styled(LinkableField)`
	white-space: break-spaces;
	word-break: break-word;
	width: auto;
	text-align: left;
	padding-right: 10px;
	margin-left: 10px;
`;

export const Data = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	align-self: center;
	flex-grow: 1;
	width: 70%;
`;

export const StyledIconButton = styled(IconButton)`
	&& {
		padding: 6px;
	}
`;

export const StarIconWrapper = styled.div`
	width: 20px;
	margin-left: 5px;
	margin-right: 2px;
	margin-top: -2px;
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

export const BimTooltip = styled(Tooltip).attrs({
	PopperProps: {
		sx: {
			left: '-1px !important',
		}
	},
})``;
