import {Config} from 'protractor';

export let config: Config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [ '../**.js' ],
  framework: "mocha",
  mochaOpts: {
    reporter: "spec",
    slow: 3000
  },
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: [
        "--headless", 
        "--disable-gpu", 
        "--window-size=1920x1080",
        '--user-agent="Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'
      ]

    }
  },
};