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

import api from './';

/**
 * start presentation
 * @param teamspace
 */
export const startPresentation = (teamspace, model) => {
	return api.post(`${teamspace}/${model}/presentation/start`);
};

/**
 * stream presentation
 * @param teamspace
 */
export const streamPresentation = (teamspace, model, id, viewpoint) => {
	return api.put(`${teamspace}/${model}/presentation/${id}/stream`, viewpoint);
};

/**
 * end presentation
 * @param teamspace
 */
export const endPresentation = (teamspace, model, id) => {
	return api.post(`${teamspace}/${model}/presentation/${id}/end`);
};

/**
 * exists presentation
 * @param teamspace
 */
export const existsPresentation = (teamspace, model, id) => {
	return api.get(`${teamspace}/${model}/presentation/${id}/exists`);
};
