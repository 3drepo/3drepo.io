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
import { ReactElement, forwardRef, Ref } from 'react';
import linkify from 'markdown-linkify';

import { MarkdownMessage } from '../messagesList/components/message/components/markdownMessage/markdownMessage.component';

interface IProps {
	children?: ReactElement<any> | number | string;
	className?: string;
}

export const MarkdownField = forwardRef(
	({ className, children }: IProps, ref: Ref<HTMLSpanElement>) => (
		<span ref={ref}>
			<MarkdownMessage className={className}>{linkify(children)}</MarkdownMessage>
		</span>
	)
);
