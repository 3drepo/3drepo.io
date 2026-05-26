/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { times } from 'lodash';
import * as faker from 'faker';

const appendIsViewer = (key, viewers, nonViewers) => [
	...viewers.map((v) => ({ [key]: v, isViewer: true })),
	...nonViewers.map((v) => ({ [key]: v, isViewer: false })),
];

export const prepareMockUsers = (viewersCount = 2, nonViewersCount = 2) => {
	const viewerUsers = times(viewersCount, () => faker.random.word());
	const nonViewerUsers = times(nonViewersCount, () => faker.random.word());
	const modelUsers = appendIsViewer('user', viewerUsers, nonViewerUsers);

	return {
		modelUsers,
		viewerUsers,
		nonViewerUsers
	};
}

export const prepareMockJobs = (viewersCount = 2, nonViewersCount = 2) => {
	const viewerJobs = times(viewersCount, () => faker.random.word());
	const nonViewerJobs = times(nonViewersCount, () => faker.random.word());
	const modelJobs = appendIsViewer('_id', viewerJobs, nonViewerJobs);

	return {
		modelJobs,
		viewerJobs,
		nonViewerJobs
	};
}