import styled, { css } from 'styled-components';
import { SmallIconButton } from '../../../smallIconButon/smallIconButton.component';

import { Grid, Input } from '@material-ui/core';


export const RangeInput = styled(Input)``;

export const MultipleInput = styled(Input)`
  display: block;
  width: 90%;
`;

export const RangeInputs = styled(Grid)`
  display: flex;
  margin-top: 12px;

  ${RangeInput} {
		width: 50%;
	}

	${/* sc-selector */ RangeInput}:nth-child(2n) {
		margin-left: 12px;
	}

	${/* sc-selector */ RangeInput}:nth-child(2n + 1) {
		margin-right: 12px;
	}
`;

export const MultipleInputsContainer = styled(Grid)`
  display: flex;
  margin-top: 12px;
  position: relative;
`;

export const MultipleInputs = styled(Grid)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
`;

export const AddButton = styled.div`
  position: absolute;
  right: 0;
  top: -20px;
`;

export const NewMultipleInputWrapper = styled.div`
  position: relative;
  margin-bottom: 12px;
`;

export const RemoveButton = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;