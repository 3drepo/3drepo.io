/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { desanitiseMessage } from '@/v5/store/tickets/comments/ticketComments.helpers';
import ReactMarkdown from 'react-markdown';
import { CommentMessage } from '../basicComment/basicComment.styles';
import { OverflowContainer } from './commentMarkDown.styles';

const ImageMarkdown = ({ src }) => (<>![image]({src})</>);
const CodeMarkdown = ({ value }) => (<code>{desanitiseMessage(value)}</code>);

const RENDERERS = {
	paragraph: CommentMessage,
	image: ImageMarkdown,
	code: CodeMarkdown,
};

type CommentMarkDownProps = {
	children?: any,
	className?: string,
};
export const CommentMarkDown = ({ children, ...props }: CommentMarkDownProps) => (
	<OverflowContainer>
		<ReactMarkdown renderers={RENDERERS} escapeHtml={false} {...props}>
				{children}
		</ReactMarkdown>
	</OverflowContainer>
);
