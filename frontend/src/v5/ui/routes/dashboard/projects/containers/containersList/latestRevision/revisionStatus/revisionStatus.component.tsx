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

import React from 'react';
import { Trans } from '@lingui/react';
import { ErrorTooltip } from '@controls/errorTooltip';
import { i18n } from '@lingui/core';
import { TextOverflow } from '@controls/textOverflow';
import { UploadStatuses } from '@/v5/store/containers/containers.types';
import { Name, ProcessingStatus, QueuedStatus } from './revisionStatus.styles';

export interface IRevisionStatus {
	name: string;
	status: UploadStatuses;
	error?: {
		date: Date | null;
		message: string;
	}
}

export const RevisionStatus = ({ status, error, name }: IRevisionStatus): JSX.Element => {
	if (status === UploadStatuses.QUEUED) {
		return (
			<QueuedStatus>
				<Trans id="containers.list.item.latestRevision.status.queued" message="Queued" />
			</QueuedStatus>
		);
	}

	if (
		status === UploadStatuses.PROCESSING
		|| status === UploadStatuses.GENERATING_BUNDLES
		|| status === UploadStatuses.QUEUED_FOR_UNITY
	) {
		return (
			<ProcessingStatus>
				<Trans id="containers.list.item.latestRevision.status.processing" message="Processing" />
			</ProcessingStatus>
		);
	}

	if (status === UploadStatuses.FAILED && error) {
		return (
			<>
				<Name>
					{name}
				</Name>
				<ErrorTooltip>
					{error.date ? (
						<Trans
							id="containers.list.item.latestRevision.status.error.tooltipMessageWithDate"
							message="The latest upload on <0>{date}</0> at <0>{time}</0> has failed due to <0>{message}</0>."
							values={{
								date: i18n.date(error.date),
								time: i18n.date(error.date, {
									hour: 'numeric',
									minute: 'numeric',
								}),
								message: error.message,
							}}
							components={[
								<b />,
							]}
						/>
					) : (
						<Trans
							id="containers.list.item.latestRevision.status.error.tooltipMessageWithoutDate"
							message="The latest upload has failed due to <0>{message}</0>."
							values={{
								message: error.message,
							}}
							components={[
								<b />,
							]}
						/>
					)}
				</ErrorTooltip>
			</>
		);
	}

	return (
		<TextOverflow>
			<Name>
				{name}
			</Name>
		</TextOverflow>
	);
};
