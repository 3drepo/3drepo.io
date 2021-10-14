/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React from 'react';
import { RevisionsListItemText } from '@components/shared/revisionDetails/components/revisionsListItemText';
import { RevisionsListItemAuthor } from '@components/shared/revisionDetails/components/revisionsListItemAuthor';
import { RevisionsListItemCode } from '@components/shared/revisionDetails/components/revisionsListItemCode';
import { RevisionsListItemButton } from '@components/shared/revisionDetails/components/revisionsListItemButton';
import { IRevisions } from '@/v5/store/containers/containers.types';
import { Container } from './revisionsListItem.styles';

type IRevisionsListItem = {
	revision: IRevisions;
	selected?: boolean;
};

export const RevisionsListItem = ({ revision, selected = false }: IRevisionsListItem): JSX.Element => (
	<Container>
		<RevisionsListItemText meta width={130} selected={selected}>{revision.timestamp}</RevisionsListItemText>
		<RevisionsListItemAuthor author={revision.author} selected={selected} width={228} />
		<RevisionsListItemCode width={330} onClick={() => {}}>{revision.tag}</RevisionsListItemCode>
		<RevisionsListItemText selected={selected}>{revision.desc}</RevisionsListItemText>
		<RevisionsListItemButton status={revision.void} />
	</Container>
);
