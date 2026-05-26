/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const ClashesConstants = {};

ClashesConstants.CLASH_PLANS_COL = 'clashes.plans';

ClashesConstants.CLASH_PLAN_TYPES = [
	'hard',
	'clearance',
];

ClashesConstants.SELF_INTERSECTIONS_CHECK_OPTIONS = [
	'selectionA',
	'selectionB',
	true,
	false,
];

ClashesConstants.TRIGGER_OPTIONS = [
	'manual',
	'new revision',
];

module.exports = ClashesConstants;
