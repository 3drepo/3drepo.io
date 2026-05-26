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

import { formatDateTime } from '@/v5/helpers/intl.helper';
import { getUserFullName, getUserLastName } from '@/v4/helpers/user.helpers';
import { VIEWPOINT_ID_REGEX } from '../../../../../../../helpers/comments';
import { COMMENT_FIELD_NAME } from '../../../../../../viewerGui/components/commentForm/commentForm.constants';
import { Container, Date, IconButton, StyledQuoteIcon, StyledReplyIcon, Fullname } from './footer.styles';

interface IProps {
	name: string;
	created: any;
	comment: string;
	formRef?: any;
	commentRef?: any;
	viewpoint: any;
}

export const Footer = ({ name, created, formRef, commentRef, comment, ...props }: IProps) => {

	const handleReplayButtonClick = () => {
		const commentForm = formRef.current;
		const commentTextarea = commentRef.current.textareaRef;
		const currentFormCommentValue = commentForm.values[COMMENT_FIELD_NAME];

		commentForm.setFieldValue(COMMENT_FIELD_NAME, `${currentFormCommentValue}@${getUserLastName(name)} `);
		commentTextarea.focus();
		setTimeout(() => {
			commentTextarea.scrollTop = commentTextarea.scrollHeight;
		});
	};

	const handleQuoteButtonClick = () => {
		const commentForm = formRef.current;
		const commentTextarea = commentRef.current.textareaRef;
		const currentFormCommentValue = commentForm.values[COMMENT_FIELD_NAME];
		const additionalNewLine = (!currentFormCommentValue || currentFormCommentValue.endsWith(`\n`)) ? '' : `  \n`;
		let quoteComment = '';

		if (props.viewpoint?.screenshotPath) {
			const viewpointId = props.viewpoint?.screenshotPath
				.split('/api/')[1].match(VIEWPOINT_ID_REGEX)[0].replace('/viewpoints/', '');
			quoteComment = quoteComment.concat(`> #SS-${viewpointId}`);
		}

		if (comment) {
			quoteComment = quoteComment !== '' ? quoteComment.concat(`\n`) : quoteComment;
			quoteComment = quoteComment.concat(`> ${comment
					.replace(/(?:\r\n|\r|\n)/g, `\n`)
					.replace(/\n/gi, `  \n> `)}`);
		}

		commentForm.setFieldValue(COMMENT_FIELD_NAME, `${currentFormCommentValue}${additionalNewLine}${quoteComment}\n\n`);
		commentTextarea.focus();
		setTimeout(() => {
			commentTextarea.scrollTop = commentTextarea.scrollHeight;
		});
	};

	return (
        <Container>
			<Fullname>{getUserFullName(name)}</Fullname>
			<Date>
				{formatDateTime(created)}
			</Date>
			<IconButton onClick={handleQuoteButtonClick} size="large">
				<StyledQuoteIcon />
			</IconButton>
			<IconButton onClick={handleReplayButtonClick} size="large">
				<StyledReplyIcon />
			</IconButton>
		</Container>
    );
};
