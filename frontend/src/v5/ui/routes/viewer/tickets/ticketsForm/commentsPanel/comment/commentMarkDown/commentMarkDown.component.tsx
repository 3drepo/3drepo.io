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

import ReactMarkdown from 'react-markdown';
import { Children } from 'react';
import { CommentMessage } from '../basicComment/basicComment.styles';
import { QuotedMessage } from '../quotedMessage/quotedMessage.styles';
import { OverflowContainer } from './commentMarkDown.styles';
import { Mention } from '../mention/mention.component';

const MENTION_PATTERN = /(^|[^\w@])@([^\s@]+)/g;

const renderMentions = (value: string) => {
	const content = [];
	let lastIndex = 0;
	let match = MENTION_PATTERN.exec(value);

	while (match) {
		content.push(value.slice(lastIndex, match.index));
		content.push(match[1]);
		content.push(<Mention key={`${match.index}-${match[2]}`} userId={match[2]} />);
		lastIndex = match.index + match[0].length;
		match = MENTION_PATTERN.exec(value);
	}

	content.push(value.slice(lastIndex));
	return content;
};

const renderTextChildren = (children) => Children.toArray(children).map((child) => (
	typeof child === 'string' ? renderMentions(child) : child
));

const COMPONENTS = {
	p: ({ children, ...props }) => (
		<CommentMessage {...props}>
			{renderTextChildren(children)}
		</CommentMessage>
	),
	code: ({ children, ...props }) => (
		<code {...props}>{renderTextChildren(children)}</code>
	),
	img: ({ src }) => `![img](${src})`,
	blockquote: QuotedMessage,
} as any;

type CommentMarkDownProps = {
	children?: any,
	className?: string,
};
export const CommentMarkDown = ({ children, ...props }: CommentMarkDownProps) => (
	<OverflowContainer>
		<ReactMarkdown components={COMPONENTS} {...props}>
			{children}
		</ReactMarkdown>
	</OverflowContainer>
);
