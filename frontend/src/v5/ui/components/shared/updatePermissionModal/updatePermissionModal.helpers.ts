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

const SUPPRESS_PERMISSION_MODAL = 'suppressPermissionModal';
export const isPermissionModalSuppressed = () => JSON.parse(sessionStorage.getItem(SUPPRESS_PERMISSION_MODAL) || 'false');
export const setPermissionModalSuppressed = (suppress: boolean) => sessionStorage.setItem(SUPPRESS_PERMISSION_MODAL, JSON.stringify(suppress));
