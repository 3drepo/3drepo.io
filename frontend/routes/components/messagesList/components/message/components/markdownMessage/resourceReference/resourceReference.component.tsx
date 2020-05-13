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

import { Link } from './resourceReference.styles';

export const ResourceReference = ({ id, text, activeIssue }) => {
	const { resources } = activeIssue;

	const resourceData = resources.find((resource) => resource._id === id);

	if (!resourceData) {
		return text;
	}

	const { name, link } = resourceData;

	return (
		<Link href={link} target="_blank" rel="noopener">
			{name}
		</Link>
	);
};
