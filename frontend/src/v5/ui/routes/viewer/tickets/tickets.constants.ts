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

export enum TicketsCardViews {
	List = 'list',
	Details = 'details',
	New = 'new',
}

export enum BaseProperties {
	TITLE = 'title',
	DESCRIPTION = 'Description',
	OWNER = 'Owner',
	CREATED_AT = 'Created at',
	UPDATED_AT = 'Updated at',
}

export enum IssueProperties {
	DUE_DATE = 'Due Date',
	STATUS = 'Status',
	PRIORITY = 'Priority',
	ASSIGNEES = 'Assignees',
}

export enum AdditionalProperties {
	DEFAULT_VIEW = 'Default View',
	PIN = 'Pin',
}

export enum SafetibaseProperties {
	TREATMENT_STATUS = 'Treatment Status',
	LEVEL_OF_RISK = 'Level of Risk',
	TREATED_LEVEL_OF_RISK = 'Treated Level of Risk',
}

export enum SequencingProperties {
	START_TIME = 'Start Time',
	END_TIME = 'End Time',
}

export const SEQUENCING_START_TIME = `modules.sequencing.${SequencingProperties.START_TIME}`;
export const SEQUENCING_END_TIME = `modules.sequencing.${SequencingProperties.END_TIME}`;