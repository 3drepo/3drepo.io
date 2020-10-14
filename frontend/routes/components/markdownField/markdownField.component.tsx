/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import linkify from 'markdown-linkify';
import React from 'react';
// tslint:disable-next-line:max-line-length
import { MarkdownMessage } from '../messagesList/components/message/components/markdownMessage/markdownMessage.component';

interface IProps {
	children?: React.ReactChild;
	className?: string;
}

export const MarkdownField: React.FunctionComponent<IProps> = ({ className, children }) => (
	<MarkdownMessage className={className}>{linkify(children)}</MarkdownMessage>
);
