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
import { FormattedMessage } from 'react-intl';
import { UploadStatus } from '@/v5/store/containers/containers.types';
import { ErrorTooltip } from '@controls/errorTooltip';
import { TextOverflow } from '@controls/textOverflow';
import { formatDate } from '@/v5/services/intl';
import { Name, ProcessingStatus, QueuedStatus } from './revisionStatus.styles';

export interface IRevisionStatus {
	name: React.ReactElement | string;
	status: UploadStatus;
	error?: {
		timestamp: Date | null;
		message: string;
	}
}

export const RevisionStatus = ({ status, error, name }: IRevisionStatus): JSX.Element => {
	if (status === UploadStatus.QUEUED) {
		return (
			<QueuedStatus>
				<FormattedMessage id="containers.list.item.latestRevision.status.queued" defaultMessage="Queued" />
			</QueuedStatus>
		);
	}

	if (
		status === UploadStatus.PROCESSING
		|| status === UploadStatus.GENERATING_BUNDLES
		|| status === UploadStatus.QUEUED_FOR_UNITY
	) {
		return (
			<ProcessingStatus>
				<FormattedMessage id="containers.list.item.latestRevision.status.processing" defaultMessage="Processing" />
			</ProcessingStatus>
		);
	}

	if (status === UploadStatus.FAILED && error) {
		return (
			<>
				<Name>
					{name}
				</Name>
				<ErrorTooltip>
					{error.timestamp ? (
						<FormattedMessage
							id="containers.list.item.latestRevision.status.error.tooltipMessageWithDate"
							defaultMessage="The latest upload on <b>{date}</b> at <b>{time}</b> has failed due to <b>{message}</b>."
							values={{
								date: formatDate(error.timestamp),
								time: formatDate(error.timestamp, {
									hour: 'numeric',
									minute: 'numeric',
								}),
								message: error.message,
								b: (val:string) => <b>{val}</b>,
							}}
						/>
					) : (
						<FormattedMessage
							id="containers.list.item.latestRevision.status.error.tooltipMessageWithoutDate"
							defaultMessage="The latest upload has failed due to <b>{message}</b>."
							values={{
								message: error.message,
								b: (val:string) => <b>{val}</b>,
							}}
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
