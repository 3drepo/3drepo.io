function Component()
{
	if (installer.isInstaller()){
		component.loaded.connect(this, Component.prototype.installerLoaded);
	
	}
}

Component.prototype.installerLoaded = function () {
    if(installer.addWizardPage(component, "HostRedirectWidget",  QInstaller.InstallationFinished))
	{
		var widget = gui.pageWidgetByObjectName("DynamicHostRedirectWidget");
		if(widget != null)
		{
			widget.openHostFileButton.clicked.connect(this, Component.prototype.openHostFile);
		}
	}
    if(installer.addWizardPage(component, "AlterConfigFileWidget",  QInstaller.InstallationFinished))
	{
		var widget = gui.pageWidgetByObjectName("DynamicAlterConfigFileWidget");
		if(widget != null)
		{
			widget.launchConfigButton.clicked.connect(this, Component.prototype.openConfigFile);
			var configFile = installer.value("TargetDir") + "\\config\\prod\\config.js";
			widget.descLabel.text += configFile.replace("/", "\\"); 
		}
	}
    
	installer.addWizardPage(component, "runMongoWidget", QInstaller.InstallationFinished );
    
	if(installer.addWizardPage(component, "LaunchDependenciesForm", QInstaller.InstallationFinished ))
	{
		var widget = gui.pageWidgetByObjectName("DynamicLaunchDependenciesForm");
		if(widget != null)
		{
			widget.installMongoButton.clicked.connect(this, Component.prototype.launchMongoInstall);
			widget.installNodeButton.clicked.connect(this, Component.prototype.launchNodeInstall);
		}
	}

}

Component.prototype.openHostFile = function()
{
	//Open host file with notepad
	var hostFile = "C:\\Windows\\System32\\Drivers\\etc\\hosts";
	installer.execute("notepad.exe", hostFile);
}

Component.prototype.openConfigFile = function()
{
	//Open config file with notepad
	var configFile = installer.value("TargetDir") + "\\config\\prod\\config.js";
	installer.execute("notepad.exe", configFile.replace("/", "\\"));
}

Component.prototype.launchMongoInstall = function()
{
    //Open link to mongo db installation page
	QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - MongoDB.url");
}

Component.prototype.launchNodeInstall = function()
{
    //Open link to node js installation page
	QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - NodeJS.url");
}

Component.prototype.createOperations = function()
{
    component.createOperations();
}

