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

import React, { useState } from 'react';

import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { InputAdornment } from '@material-ui/core';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { viewerShareLink } from '@/v5/services/routing/routing';
import { IContainer } from '@/v5/store/containers/containers.types';
import { useParams } from 'react-router-dom';
import {
	UrlContainer,
	Container,
	LinkLabel,
	MailToButton,
	Tick,
	CopyToClipboardTooltip,
	CopyToClipboardIcon,
	CopyToClipboardIconContainer,
	CopiedToClipboardTooltip,
} from './shareModal.styles';

const IS_COPYING_DURATION_MS = 3000;
const MODAL_TITLE = formatMessage({
	id: 'ShareModal.title',
	defaultMessage: 'Share Container URL',
});

type IShareModal = {
	openState: boolean;
	container: IContainer;
	onClickClose: () => void;
};

export const ShareModal = ({ openState, container, onClickClose }: IShareModal): JSX.Element => {
	const [isCopying, setIsCopying] = useState(true);
	const containerName = container.name;
	const { teamspace } = useParams();
	const containerLink = viewerShareLink(teamspace, container._id);
	let isCopiedTimer;

	const handleCopyToClipboard = () => {
		if (!isCopying) {
			return;
		}
		setIsCopying(false);
		clearTimeout(isCopiedTimer);
		isCopiedTimer = setTimeout(() => {
			setIsCopying(true);
		}, IS_COPYING_DURATION_MS);
	};

	return (
		<FormModal
			open={openState}
			onClickClose={onClickClose}
			title={MODAL_TITLE}
			showButtons={false}
		>
			<Container>
				<LinkLabel>
					<FormattedMessage
						id="shareModal.linkLabel"
						defaultMessage="Link"
					/>
				</LinkLabel>
				<CopyToClipboard
					onCopy={handleCopyToClipboard}
					text={containerLink}
				>
					<UrlContainer
						value={containerLink}
						InputProps={{
							readOnly: true,
							endAdornment: (
								<InputAdornment position="end">
									{isCopying
										? (
											<CopyToClipboardTooltip
												title={formatMessage({
													id: 'shareModal.copyToClipboard',
													defaultMessage: 'Copy to clipboard',
												})}
											>
												<CopyToClipboardIconContainer>
													<CopyToClipboardIcon />
												</CopyToClipboardIconContainer>
											</CopyToClipboardTooltip>
										) : (
											<CopiedToClipboardTooltip
												title={formatMessage({
													id: 'shareModal.copied',
													defaultMessage: 'Copied to clipboard',
												})}
												open
											>
												<CopyToClipboardIconContainer>
													<Tick />
												</CopyToClipboardIconContainer>
											</CopiedToClipboardTooltip>
										)}
								</InputAdornment>
							),
						}}
					/>
				</CopyToClipboard>
				<MailToButton href={`mailto:?subject=3D Repo container - ${containerName}&body=${containerLink}`}>
					<FormattedMessage
						id="shareModal.mailTo"
						defaultMessage="Send by email"
					/>
				</MailToButton>
			</Container>
		</FormModal>
	);
};
