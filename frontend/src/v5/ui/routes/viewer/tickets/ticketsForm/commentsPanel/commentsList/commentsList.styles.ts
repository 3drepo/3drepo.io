/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { TableVirtuoso } from 'react-virtuoso';
import styled from 'styled-components';
import { CommentBox } from '../commentBox/commentBox.component';
import { isFirefox } from '@/v4/styles';

export const Comments = styled.div`
	height: 100%;
	/* height: calc(100% - 120px); */
	min-height: 400px;
	/* display: grid;
	grid-template-rows: 1fr; */

`;

export const CreateCommentBox = styled(CommentBox)`
	border: solid 0 ${({ theme }) => theme.palette.secondary.lightest};
	border-top-width: 1px;

	/* bottom: 0;
    position: absolute;
	width: 100%; */
`;


export const CommentsContainer = styled.div`
	height: 100%;
	display: grid;
	grid-template-rows: 1fr;
`;

export const VirtualisedList = styled(TableVirtuoso as any).attrs({
	style: { overflowY: 'scroll' },
})`
	box-sizing: border-box;
	overflow-x: hidden;
`;

export const EmptyCommentsBox = styled.div`
	padding: 15px;
`;

export const Table = styled.div`
	display: flex;
	justify-content: center;
`;

export const TableBody = styled.div`
	width: 100%;
	padding-left: 14px;

	${isFirefox('padding-right: 14px;')}
`;

export const TableRow = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

export const FillerRow = styled.div<{ height: number }>`
	height: ${({ height }) => height}px;
`;
