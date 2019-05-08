"use strict";
module.exports.DEFAULT_PLUGIN_STRUCTURE = {
	"plugin": "home",
	"friends": [
		"login"
	],
	"functions": [
		"register-request",
		"register-verify",
		"password-forgot",
		"password-change",
		"pricing",
		"sign-up",
		"contact",
		"payment",
		"billing"
	],
	"children": [{
		"plugin": "account",
		"url": ":account",
		"children": [{
			"plugin": "model",
			"url": "/:model/:revision",
			"params": {
				"revision": {
					value: null,
					squash: true
				},
				"noSet":{
					value: false
				}
			},
			"children":[{
				"plugin": "issue",
				"url": "/issues/:issue"
			},{
				"plugin": "risk",
				"url": "/risks/:risk"
			}],
			"friends": [
				"panel",
				"filter",
				"tree",
				"viewpoints",
				"issues",
				"risks",
				"clip",
				"docs",
				"utils",
				"groups",
				"measure",
				"right-panel",
				"building",
				"revisions"
			]
		}]
	}]
};
