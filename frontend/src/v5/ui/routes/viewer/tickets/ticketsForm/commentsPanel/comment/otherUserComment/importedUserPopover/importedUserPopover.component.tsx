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
import { AvatarWrapper, PopoverContainer, Heading, Data } from '@components/shared/popoverCircles/userPopoverCircle/userPopover/userPopover.styles';
import { UserCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.styles';
import { FormattedMessage } from 'react-intl';
import { Info, ExternalLabel } from './importedUserPopover.styles';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { IUser } from '@/v5/store/users/users.redux';

interface IImportedUserPopover {
	author: string;
	originalAuthor: string;
	importedAt: Date;
	user: IUser;
	className?: string;
}
export const ImportedUserPopover = ({ className, user, author, originalAuthor, importedAt }: IImportedUserPopover) => (
	<HoverPopover anchor={() => <UserCircle user={user} className={className} />}>
		<PopoverContainer>
			<AvatarWrapper>
				<UserCircle user={user} />
			</AvatarWrapper>
			<Data>
				<Heading>
					{originalAuthor} <ExternalLabel />
				</Heading>
				<Info>
					<FormattedMessage id="importedUserPopover.author" defaultMessage="Imported by:" />
					&nbsp;{author}
				</Info>
				<Info>
					<FormattedMessage id="importedUserPopover.time" defaultMessage="Imported on:" />
					&nbsp;{formatDateTime(importedAt)}
				</Info>
			</Data>
		</PopoverContainer>
	</HoverPopover>
);
