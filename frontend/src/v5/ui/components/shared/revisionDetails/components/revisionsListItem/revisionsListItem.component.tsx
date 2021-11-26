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
import { i18n } from '@lingui/core';
import { useParams } from 'react-router';

import { RevisionsListItemText } from '@components/shared/revisionDetails/components/revisionsListItemText';
import { RevisionsListItemDate } from '@components/shared/revisionDetails/components/revisionsListItemDate';
import { RevisionsListItemAuthor } from '@components/shared/revisionDetails/components/revisionsListItemAuthor';
import { RevisionsListItemCode } from '@components/shared/revisionDetails/components/revisionsListItemCode';
import { RevisionsListItemButton } from '@components/shared/revisionDetails/components/revisionsListItemButton';
import { IRevision } from '@/v5/store/revisions/revisions.types';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers/revisionsActions.dispatchers';
import { Display } from '@/v5/ui/themes/media';
import { Container } from './revisionsListItem.styles';

type IRevisionsListItem = {
	revision: IRevision;
	active?: boolean;
	containerId: string;
};

export const RevisionsListItem = ({ revision, containerId, active = false }: IRevisionsListItem): JSX.Element => {
	const { teamspace, project } = useParams();
	const { timestamp, desc, author, tag, void: voidStatus } = revision;

	const toggleVoidStatus = (e: React.SyntheticEvent) => {
		e.stopPropagation();
		RevisionsActionsDispatchers.setVoidStatus(teamspace, project, containerId, tag || revision._id, !voidStatus);
	};

	return (
		<Container>
			<RevisionsListItemDate width={130} tabletWidth={94} active={active}>
				{i18n.date(timestamp)}
			</RevisionsListItemDate>
			<RevisionsListItemAuthor authorName={author} active={active} width={228} tabletWidth={155} />
			<RevisionsListItemCode
				tabletWidth={150}
				onClick={() => {}}
			>
				{tag}
			</RevisionsListItemCode>
			<RevisionsListItemText
				hideWhenSmallerThan={Display.Tablet}
				active={active}
			>
				{desc}
			</RevisionsListItemText>
			<RevisionsListItemButton onClick={toggleVoidStatus} status={voidStatus} />
		</Container>
	);
};
