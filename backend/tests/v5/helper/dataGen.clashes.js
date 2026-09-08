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

const { times } = require('lodash');

const { src } = require('./path');
const DataGen = require('./dataGen');
const { generateTicket } = require('./dataGen.tickets');

const {
	CLASH_TYPES,
	SELF_INTERSECTIONS_CHECK_OPTIONS,
	triggerOptions,
	clashObjectIdTypes,
	clashRunStatus,
} = require(`${src}/models/clashes.constants`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

const generateClashPlan = (model1, model2, ticketInfo) => {
	let tickets;
	if (ticketInfo?.federation && ticketInfo.template && ticketInfo.creator) {
		const { federation, template, creator, valuesAtCreation: valuesAtCreationOverride } = ticketInfo;
		const ticket = generateTicket(template, false, federation);
		const valuesAtCreation = valuesAtCreationOverride ?? Object.keys(ticket.properties)
			.map((key) => ({ property: key, value: ticket.properties[key] }));
		tickets = {
			federation: federation._id, template: template._id, valuesAtCreation, creator,
		};
	}
	return deleteIfUndefined({
		_id: DataGen.generateUUIDString(),
		name: DataGen.generateRandomString(),
		type: CLASH_TYPES.HARD,
		tolerance: 0.01,
		selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0],
		trigger: [triggerOptions.MANUAL, triggerOptions.NEW_REVISION],
		selectionA: [{ container: model1 }],
		selectionB: [{ container: model2 }],
		tickets,
	});
};

const generateClashRunPlan = (plan) => plan && deleteIfUndefined({
	_id: plan._id,
	type: plan.type,
	tolerance: plan.tolerance,
	selfIntersectionsCheck: plan.selfIntersectionsCheck,
	selectionA: plan.selectionA,
	selectionB: plan.selectionB,
});

const generateClashes = (plan, number = 20) => {
	const bbox = JSON.stringify({ min: [0, 0, 0], max: [1, 1, 1] });
	const objectId = (container) => [
		container,
		clashObjectIdTypes.INTERNAL,
		DataGen.generateRandomString(),
		bbox,
	].join('::');

	return times(number, () => ({
		a: objectId(plan.selectionA[0].container),
		b: objectId(plan.selectionB[0].container),
		positions: [times(2, () => times(3, () => DataGen.generateRandomNumber()))],
		fingerprint: DataGen.generateRandomNumber(),
	}));
};

const generateClashRun = (plan, clashResults, overrides = {}) => deleteIfUndefined({
	_id: DataGen.generateUUIDString(),
	triggeredBy: DataGen.generateRandomString(),
	triggeredAt: Date.now(),
	plan: generateClashRunPlan(plan),
	...(clashResults ? {
		updatedAt: Date.now(),
		status: clashRunStatus.COMPLETED,
		results: {
			stats: {
				new: clashResults.new.length,
				active: clashResults.active.length,
				resolved: clashResults.resolved.length,
			},
		},
		clashResults,
	} : { status: clashRunStatus.PLANNED }),
	...overrides,
});

module.exports = {
	generateClashPlan,
	generateClashes,
	generateClashRun,
};
