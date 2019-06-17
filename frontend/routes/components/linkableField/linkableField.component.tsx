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

import * as React from 'react';

interface IProps {
	children: string;
	className?: string;
}

// tslint:disable-next-line:max-line-length
const urlRegex = /(http|https):\/\/\S+/ig;

const anchorUrl = (url, key) => {
	return (<a key={key} href={url} target="_blank" rel="noopener">{url}</a>);
};

export class LinkableField extends React.PureComponent<IProps, null> {
	public linkedText = (): React.ReactNode => {
		let match = urlRegex.exec(this.props.children);
		let lastIndex = 0;
		const res = [];

		while (match) {
			if (lastIndex !== match.index) {
				res.push(this.props.children.substring(lastIndex, match.index));
			}

			res.push(anchorUrl(match[0], match.index));
			lastIndex = match.index + match[0].length;
			match = urlRegex.exec(this.props.children);
		}

		if (lastIndex === 0) {
			return this.props.children;
		}

		res.push(this.props.children.substring(lastIndex, this.props.children.length));

		return res;
	}

	public render() {
		return (
			<span  className={this.props.className}>
				{this.linkedText()}
			</span>
		);
	}
}
