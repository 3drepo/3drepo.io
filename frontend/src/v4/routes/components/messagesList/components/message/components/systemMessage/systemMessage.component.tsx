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
import { FunctionComponent } from 'react';
import SystemInfoIcon from '@mui/icons-material/InfoOutlined';

import { DATE_TIME_FORMAT } from '../../../../../../../services/formatting/formatDate';
import { DateTime } from '../../../../../dateTime/dateTime.component';
import { Avatar, CommentWrapper, Container, MarkdownComment } from './systemMessage.styles';

interface IProps {
	created: number;
	comment: string;
	propertyName: string;
}

const Comment: FunctionComponent<{ propertyName }> = ({ children, propertyName }) => {
	if (propertyName === 'issue_referenced') {
		return (<MarkdownComment>{children}</MarkdownComment>);
	}
	return (<>{children}</>);
};

export const SystemMessage = ({ created, propertyName, comment }: IProps) => {
	return (
		<Container>
			<Avatar>
				<SystemInfoIcon />
			</Avatar>
			<CommentWrapper>
				<Comment propertyName={propertyName}>{comment}</Comment>
				<DateTime value={created} format={DATE_TIME_FORMAT} />
			</CommentWrapper>
		</Container>
	);
};
