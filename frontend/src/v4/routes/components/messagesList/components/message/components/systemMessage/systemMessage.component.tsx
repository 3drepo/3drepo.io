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

import React from 'react';

import SystemInfoIcon from '@material-ui/icons/InfoOutlined';

import { DATE_TIME_FORMAT } from '../../../../../../../services/formatting/formatDate';
import { DateTime } from '../../../../../dateTime/dateTime.component';
import { Avatar, CommentWrapper, Container, MarkdownComment } from './systemMessage.styles';

interface IProps {
	created: number;
	comment: string;
	teamspace: string;
	propertyName: string;
}

const Comment: React.FunctionComponent<{teamspace, propertyName}> = ({teamspace, children , propertyName}) => {
	if (propertyName === 'issue_referenced') {
		return (<MarkdownComment teamspace={teamspace}>{children}</MarkdownComment>);
	}
	return (<>{children}</>);
};

export const SystemMessage = ({ created, propertyName, comment, teamspace }: IProps) => {
	return (
		<Container>
			<Avatar>
				<SystemInfoIcon />
			</Avatar>
			<CommentWrapper>
				<Comment propertyName={propertyName} teamspace={teamspace}>{comment}</Comment> •
				<DateTime value={created} format={DATE_TIME_FORMAT} />
			</CommentWrapper>
		</Container>
	);
};
