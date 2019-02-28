import * as React from 'react';

import { } from './criteriaValueField.styles';
import { ENTER_KEY } from '../../../../../constants/keys';

import Input from '@material-ui/core/Input';
import Hidden from '@material-ui/core/Hidden';

interface IProps {
	name: string;
	value: any[];
	onChange: (event) => void;
	onBlur: (event) => void;
}

interface IState {
}

export class CriteriaValueField extends React.PureComponent<IProps, IState> {
	public componentDidMount() {
		this.setState({
			value: this.props.value,
		});
	}

	public handleValueChange = (event) => {
		console.log('handleValueChange',event.target.value)

		if (this.props.onChange) {
			this.props.onChange({
				target: { value: [event.target.value], name: this.props.name }
			});
		}
		this.setState({ value: event.target.value });
	}

	public render() {
		const { name, onBlur, value } = this.props;
		return (
			<Input
				onBlur={onBlur}
				name={name}
				value={value}
				onChange={this.handleValueChange}
			/>
		);
	}
}
