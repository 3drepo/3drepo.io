/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { IntervalRow, SequenceItemContainer, SequencePlayerAllInputs, SequencePlayerContainer, DatePicker, SequenceRow, SequenceTasksListContainer, StepLabel, SliderRow, TaskListLabelTime, TaskListLabel, SequenceTasksListItem, SubTasksItemContainer, TaskSmallDot, Task, TaskItemLabel, SequenceName } from '@/v4/routes/viewerGui/components/sequences/sequences.styles';
import { StyledTextField as SequenceEditableTitle } from '@/v4/routes/viewerGui/components/sequences/components/sequenceForm/sequenceForm.styles';
import { css } from 'styled-components';
import { EditableFieldStyles } from './sharedStyles/selectMenus.overrides';
import { ActionsLine } from '@/v4/routes/components/textField/textField.styles';

const ItemPreviewStyles = css`
	${SequenceItemContainer} {
		& > div {
			flex-wrap: nowrap;

			& > * {
				z-index: 2;
			}
			 
			&::before {
				content: '';
				width: 70px;
				height: 70px;
				border-radius: 5px;
				/* TODO - fix after new palette is released */
				background-color: #f0f5ff;
				position: absolute;
			}

			svg {
				margin: 0 37px 0 22px;
			}

			/* Text next icons (title, subtitle, dates) */
			& > .MuiGrid-root {
				& > :first-child {
					${({ theme }) => theme.typography.h5}
				}

				& > :nth-child(2) {
					${({ theme }) => theme.typography.body1}
				}

				& > :last-child {
					${({ theme }) => theme.typography.caption}
					color: ${({ theme }) => theme.palette.base.main};
					margin-top: 5px;
				}
			}
		}
	}
`;

const SequencePlayerStyles = css`
	/* Title */
	${SequenceEditableTitle} {
		${EditableFieldStyles}
		max-width: 300px;
		padding: 1px;
		margin: 0;
		color: ${({ theme }) => theme.palette.secondary.main};

		.MuiFormControl-root .MuiInputBase-root {
			margin-top: 5px;
			
			.MuiOutlinedInput-notchedOutline {
				min-height: unset;
			}
		}

		span, input {
			${({ theme }) => theme.typography.h3}
			box-sizing: border-box;
			margin-bottom: 0;
		}

		span {
			margin-bottom: 2px;
		}

		input {
			margin-right: 36px;
		}

		${ActionsLine} {
			top: 8px;
		}
	}

	/* Player (upper section) */
	${SequencePlayerContainer} {
		height: 155px;

		${SequencePlayerAllInputs} {
			display: flex;
			flex-direction: row;
			margin-top: 22px;

			& > {
				display: inline-block;
			}

			button {
				margin: 0;
				padding: 0;

				&:hover {
					background-color: transparent;
				}

				svg {
					width: 20px;
					margin-top: -11px;
				}
			}

			${SequenceRow} {
				input {
					color: ${({ theme }) => theme.palette.secondary.main};

					/* Remove arrows to increase/decrease value */
					/* Chrome, Safari, Edge, Opera */
					&::-webkit-outer-spin-button,
					&::-webkit-inner-spin-button {
						-webkit-appearance: none;
						margin: 0;
					}
	
					/* Firefox */
					&[type=number] {
						-moz-appearance: textfield;
						padding: 0 !important;
						width: 35px;
					}
				}

				${StepLabel} {
					${({ theme }) => theme.typography.caption}
					color: ${({ theme }) => theme.palette.base.main};
					position: absolute;
					top: 7px;
					margin-left: 13px;
				}

				${DatePicker} {
					margin: 0 0 12px;
					width: 146px;

					input {
						${({ theme }) => theme.typography.body1}
						padding: 0 6px !important;
					}
				}

				button {
					color: ${({ theme }) => theme.palette.secondary.main};

					&.Mui-disabled {
						color: ${({ theme }) => theme.palette.base.lightest};
					}
				}
			}

			${IntervalRow} {
				width: 156px;

				.MuiSelect-select {
					width: 89px;
					padding-right: 0;
				}
			}
		}

		${SliderRow} {
			button {
				color: ${({ theme }) => theme.palette.primary.main};
				margin: -5px 0 0 0;

				&:hover {
					background-color: transparent;
				}
			}

			.MuiSlider {
				&-thumb {
					width: 12px;
					height: 12px;
				}

				&-rail {
					/* TODO - fix after new palette is released */
					color: #edf0f8;
				}
	
				&-track {
					border: none;
				}
			}
		}

		.MuiSwitch-root {
			margin-right: 6px;
		}

		.MuiFormControlLabel-labelPlacementEnd {
			margin-right: 0;

			&:first-of-type {
				margin-right: 30px;
			}
		}
	}
`;

export const ActivitiesListStyles = css`
	/* Activities label */
	${TaskListLabel} {
		${({ theme }) => theme.typography.body1}
		color: ${({ theme }) => theme.palette.base.main};
		padding: 15px 0;
		text-align: center;


		${TaskListLabelTime} {
			color: ${({ theme }) => theme.palette.secondary.main};
			font-weight: 500;
		}
	}

	/* Activities items */
	${SequenceTasksListItem} {
		margin: 0 15px 15px;
		padding: 15px 15px 4px;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border-radius: 5px;
		color: ${({ theme }) => theme.palette.secondary.main};
		font-size: 12px;
		font-weight: 500;

		${Task} {
			margin-bottom: 11px;
		}

		${TaskItemLabel} {
			margin: 0;
		}

		/* Expand icon */
		button {
			margin: 0 7px 0 0;
			border: solid 1.4px currentColor;
			width: 16px;
			height: 16px;
			box-sizing: border-box;

			svg {
				font-size: 18px;
			}
		}

		${TaskSmallDot} {
			margin: -3px 7px 0 0;
			font-size: 8px;
			height: 22px;
			color: ${({ theme }) => theme.palette.base.main};

			/* Last item (bullet point) */
			~ div {
				color: ${({ theme }) => theme.palette.base.main};
				margin-right: 10px;
				font-weight: 400;
			}
		}
	}
`;

export default css`
	#sequences-card {
		${ItemPreviewStyles}
		${SequencePlayerStyles}
		/* Activities list (lower section) */
		${SequenceTasksListContainer} {
			${ActivitiesListStyles}
			/* TODO - fix after new palette is released */
			background-color: #F7F8FA;
		}
	}
`;
