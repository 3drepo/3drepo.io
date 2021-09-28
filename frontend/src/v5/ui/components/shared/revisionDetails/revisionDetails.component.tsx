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

import { Trans } from '@lingui/react';
import { i18n } from '@lingui/core';
import React from 'react';
import { Tooltip } from '@material-ui/core';
import { RevisionsListHeaderLabel } from '@components/shared/revisionDetails/components/revisionsListHeaderLabel';
import { RevisionsListItemText } from '@components/shared/revisionDetails/components/revisionsListItemText';
import { RevisionsListItemCode } from '@components/shared/revisionDetails/components/revisionsListItemCode';
import { RevisionsListItemAuthor } from '@components/shared/revisionDetails/components/revisionsListItemAuthor';
import { Container, RevisionsListHeaderContainer, RevisionsListItem, RevisionsListItemRow,
	RevisionsListItemButton, Button, RevisionsList } from './revisionDetails.styles';

const revisionMock = {
	date: i18n.date(new Date()),
	author: {
		fullName: 'George Hadfield',
		company: 'Georgehadfield',
		job: 'Client',
	},
	code: 'Title of revision code to go here',
	description: 'This is a description that can be either long or short in length',
	status: 'active',
};

const revisionsMock = [];

for (let i = 0; i < 4; i++) {
	revisionsMock.push(revisionMock);
}

const MockContainerListItem = ({ revision, selected }): JSX.Element => (
	<RevisionsListItemRow>
		<RevisionsListItemText meta width={130} selected={selected}>{revision.date}</RevisionsListItemText>
		<RevisionsListItemAuthor author={revision.author} selected={selected} width={228} />
		<RevisionsListItemCode width={330} onClick={() => {}}>{revision.code}</RevisionsListItemCode>
		<RevisionsListItemText selected={selected}>{revision.description}</RevisionsListItemText>
		<RevisionsListItemButton>
			<Tooltip title="Change to void">
				<Button onClick={() => {}}>
					{revision.status}
				</Button>
			</Tooltip>
		</RevisionsListItemButton>
	</RevisionsListItemRow>
);

export const RevisionDetails = (): JSX.Element => {
	const selected = 0;
	const isSingle = revisionsMock.length === 1;

	return (
		<Container>
			<RevisionsListHeaderContainer>
				<RevisionsListHeaderLabel width={130}><Trans id="revisionDetails.addedOn" message="Added on" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={228}><Trans id="revisionDetails.addedBy" message="Added by" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel width={330}><Trans id="revisionDetails.revisionCode" message="Revision code" /></RevisionsListHeaderLabel>
				<RevisionsListHeaderLabel><Trans id="revisionDetails.description" message="Description" /></RevisionsListHeaderLabel>
			</RevisionsListHeaderContainer>
			<RevisionsList>
				{revisionsMock.map((revision, i) => (
					<RevisionsListItem
						isSingle={isSingle}
						isBeforeSelected={i === selected - 1}
						selected={i === selected}
					>
						<MockContainerListItem revision={revision} selected={i === selected} />
					</RevisionsListItem>
				))}
			</RevisionsList>
		</Container>
	);
};
