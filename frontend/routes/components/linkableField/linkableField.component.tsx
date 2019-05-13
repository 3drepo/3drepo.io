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
	children: any;
	className?: string;
}

// tslint:disable-next-line:max-line-length
const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}(:[0-9]{1,5})?(\/.*)?$/;

const anchorItem = (separator) => (item, key) => {
	if (urlRegex.test(item)) {
		return (<span key={'url' + key}><a  href={item} target="_blank" rel="noopener">{item}</a>{separator}</span>);
	}
	return (<span key={'url' + key}>{item}{separator}</span>);
};

export class LinkableField extends React.PureComponent<IProps, null> {
	public linkedText = (): React.ReactNode => {
		let children: string[] = [];
		const nodes = [];

		if (Array.isArray(this.props.children)) {
			children = this.props.children;
		} else {
			children = [this.props.children];
		}

		return children.map((text) => text.split(' ').map((item, index) => {
			if (item.indexOf('\n') !== -1) {
				return item.split('\n').map(anchorItem('\n'));
			}
			return anchorItem(' ')(item, index);
		}));
	}

	public render() {
		return (
			<span  className={this.props.className}>
				{this.linkedText()}
			</span>
		);
	}
}
