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
import styled from 'styled-components';
import { CommentBox } from '../commentBox/commentBox.component';
import { isFirefox } from '@/v4/styles';
import { VirtualList } from '@controls/virtualList/virtualList.component';

export const Comments = styled.div`
	overflow-y: auto;
`;

export const CreateCommentBox = styled(CommentBox)`
	border: solid 0 ${({ theme }) => theme.palette.secondary.lightest};
	border-top-width: 1px;
`;

export const CommentsContainer = styled.div`
	height: 100%;
	display: grid;
	grid-template-rows: 1fr;
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

export const CommentsVirtualList = styled(VirtualList)`
	width: 100%;
	// padding-left: 14px;
	// ${isFirefox('padding-right: 14px;')}
`;
