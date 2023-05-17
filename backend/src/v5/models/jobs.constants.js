/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const JobsConstants = {};

JobsConstants.DEFAULT_OWNER_JOB = 'Admin';

JobsConstants.DEFAULT_JOBS = [
    { _id: 'Admin', color: '#75140C' },
    { _id: 'Architect', color: '#D32C1F' },
    { _id: 'Asset Manager', color: '#B160E4' },
    { _id: 'Client', color: '#7356F6' },
    { _id: 'Main Contractor', color: '#0099FF' },
    { _id: 'MEP Engineer', color: '#65C978' },
    { _id: 'Project Manager', color: '#A87F3D' },
    { _id: 'Quantity Surveyor', color: '#EF7F31' },
    { _id: 'Structural Engineer', color: '#B6BCC1' },
    { _id: 'Supplier', color: '#697683' },
];

module.exports = JobsConstants;