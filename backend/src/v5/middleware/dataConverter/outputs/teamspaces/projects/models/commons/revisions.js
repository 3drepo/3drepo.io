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
const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const { respond } = require('../../../../../../../utils/responder');
const { templates } = require('../../../../../../../utils/responseCodes');

const Revision = {};

const serialiseRevision = (rev) => {
	const serialised = {
		...rev,
		_id: UUIDToString(rev._id),
	};

	if (rev.timestamp) {
		serialised.timestamp = rev.timestamp.getTime();
	}

	return serialised;
};

Revision.serialiseRevisionArray = (req, res) => {
	const revs = req.outputData;
	const revisions = revs.map(serialiseRevision);

	respond(req, res, templates.ok, { revisions });
};

Revision.serialiseRevision = (req, res) => {
	const rev = req.outputData;
	const revision = serialiseRevision(rev);

	respond(req, res, templates.ok, revision);
};

module.exports = Revision;
