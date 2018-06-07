import {Config} from "protractor";

export let config: Config = {
	capabilities: {
		// browserName: "firefox",
		// "moz:firefoxOptions": {
		// 	args : [
		// 		"--headless",
		// 	],
		// },
		browserName: "chrome",
		chromeOptions: {
			args: [
				"--headless",
				// "--disable-gpu",
				// "--deterministic-fetch",
				"--incognito",
				"--start-maximized",
				"--window-size=1920x1080",
			],
		},
	},
	allScriptsTimeout: 20000,
	framework: "mocha",
	mochaOpts: {
		bail: true,
		reporter: "spec",
		slow: 3000,
	},
	seleniumAddress: "http://localhost:4444/wd/hub",
	specs: [ "../**.js" ],
};
