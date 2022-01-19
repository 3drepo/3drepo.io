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

import React, { useState } from 'react';

import { InputAdornment } from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { formatMessage } from '@/v5/services/intl';
import {
	LinkLabel,
	LinkBar,
	CopyToClipboardIcon,
	CopyToClipboardIconContainer,
	CopyToClipboardTooltip,
	CopiedToClipboardTooltip,
	Tick,
} from './shareTextField.styles';

type IShareTextField = {
	label: string,
	text: string,
};

const IS_COPYING_DURATION_MS = 3000;

export const ShareTextField = ({ label, text }: IShareTextField) => {
	let isCopiedTimer;
	const [isCopying, setIsCopying] = useState(true);

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
		<>
			<LinkLabel>
				{label}
			</LinkLabel>
			<CopyToClipboard
				onCopy={handleCopyToClipboard}
				text={text}
			>
				<LinkBar
					value={text}
					InputProps={{
						readOnly: true,
						endAdornment: (
							<InputAdornment position="end">
								{isCopying
									? (
										<CopyToClipboardTooltip
											title={formatMessage({
												id: 'shareTextField.copyToClipboard',
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
												id: 'shareTextField.copied',
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
		</>
	);
};
