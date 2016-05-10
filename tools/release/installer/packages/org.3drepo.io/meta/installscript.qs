function Component()
{
   // installer.installationFinished.connect(this, Component.prototype.installationFinishedPageIsShown);
   // installer.finishButtonClicked.connect(this, Component.prototype.installationFinished);
	if (installer.isInstaller()){
		component.loaded.connect(this, Component.prototype.installerLoaded);
	
	}
}

Component.prototype.installerLoaded = function () {
    installer.addWizardPage(component, "HostRedirectWidget",  QInstaller.InstallationFinished);
    installer.addWizardPage(component, "AlterConfigFileWidget",  QInstaller.InstallationFinished);
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

Component.prototype.launchMongoInstall = function()
{
	QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - MongoDB.url");
}

Component.prototype.launchNodeInstall = function()
{
	QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - NodeJS.url");
}

Component.prototype.createOperations = function()
{
    component.createOperations();
}

/*Component.prototype.installationFinishedPageIsShown = function()
{
    try {
        if (installer.isInstaller() && installer.status == QInstaller.Success) {
        }
    } catch(e) {
        console.log(e);
    }
}

Component.prototype.installationFinished = function()
{
    try {
        if (installer.isInstaller() && installer.status == QInstaller.Success) {
            var isMongoCheckBoxChecked = component.userInterface( "LaunchDependenciesForm" ).mongoCheckBox.checked;
            var isNodeCheckBoxChecked = component.userInterface( "LaunchDependenciesForm" ).nodeCheckBox.checked;
            if (isMongoCheckBoxChecked) {
                QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - MongoDB.url");
            }
            if (isNodeCheckBoxChecked) {
                QDesktopServices.openUrl("file:///" + installer.value("TargetDir") + "/Downloads - NodeJS.url");
            }
        }
    } catch(e) {
        console.log(e);
    }
}*/
