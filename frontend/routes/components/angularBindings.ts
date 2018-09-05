/*
	This directory contains react components conversion to angular context.
	It should be removed if app is fully migrated
*/
import * as React from 'react';
import { react2angular as wrap } from 'react2angular';
import { ReactButton } from './reactButton/reactButton.component';

angular
	.module("3drepo")
	.component("reactButton", wrap(ReactButton));
