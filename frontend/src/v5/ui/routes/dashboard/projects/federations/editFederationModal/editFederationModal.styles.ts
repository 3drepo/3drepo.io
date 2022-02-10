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

import styled from 'styled-components';
import { FormDialogContent } from '@controls/modal/formModal/formDialog.styles';
import { FormModal as FormModalBase } from '@controls/modal/formModal/formDialog.component';
import { HeaderButtonsGroup } from '@/v5/ui/routes/dashboard/projects/containers/containers.styles';
import BaseIncludeIcon from '@assets/icons/include_element.svg';
import BaseRemoveIcon from '@assets/icons/remove_element.svg';

export const FormModal = styled(FormModalBase)`

	.MuiDialog-paper {
		max-width: fit-content;
	}

	${FormDialogContent} {
		margin: 0;
		padding-bottom: 0;
		max-width: 1289px;
	}

	${HeaderButtonsGroup} {
		display: flex;
		justify-content: flex-end;
		margin-right: 15px;
	}
`;

export const IconContainer = styled.div`
	display: grid;
	min-width: 46px;
`;

export const IncludeIcon = styled(BaseIncludeIcon)`
	&:hover {
		circle {
			fill: ${({ theme }) => theme.palette.primary.dark};
		}
	}

	&:active {
		circle {
			fill: ${({ theme }) => theme.palette.primary.darkest};
		}
	}

	${({ theme, isSelected }) => isSelected && `
		&:hover {
			circle {
				fill: ${theme.palette.primary.lightest};
			}
			path {
				fill: ${theme.palette.primary.dark};
		}

		&:active {
			circle {
				fill: ${theme.palette.primary.darkest};
			}
		}
	`}
`;

export const RemoveIcon = styled(BaseRemoveIcon)`
	&:hover {
		circle {
			fill: ${({ theme }) => theme.palette.error.dark};
		}
	}

	&:active {
		circle {
			fill: ${({ theme }) => theme.palette.error.darkest};
		}
	}
`;
