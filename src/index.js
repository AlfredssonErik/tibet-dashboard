const vscode = require('vscode');
const path = require("path");
const models = require('./models');
const projectservice = require('./projectservice');
const webview = require('./webview');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let instance = null;

	const openCommand = vscode.commands.registerCommand('extension.openDashboard', () => {
		showDashboard();
	});

	const addProjectCommand = vscode.commands.registerCommand('dashboard.addProject', () => {
		addNewProject();
	});

	function showDashboard() {
		vscode.window.showInformationMessage("Opening dashboard");
		const projects = projectservice.getProjects(context);

		if (instance) {
			instance.webview.html = webview.getDashboardContent(context, instance, projects);
		} else {
			var panel = vscode.window.createWebviewPanel(
				"dashboard",
				"Dashboard",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					localResourceRoots: [
						vscode.Uri.file(path.join(context.extensionPath, 'assets')),
					],
				}
			);

			panel.webview.html = webview.getDashboardContent(context, panel, projects);
			panel.onDidDispose(() => {
				instance = null;
			}, null, context.subscriptions);

			panel.webview.onDidReceiveMessage((e) => {
				let projectId;
				switch (e.type) {
					case 'add-project':
						vscode.commands.executeCommand("dashboard.addProject");
						break;
					case 'remove-project':
						projectId = e.projectId;
						const removed = projectservice.removeProject(context, projectId);
						if (removed) {
							vscode.window.showInformationMessage("Project removed from list");
							showDashboard();
						} else {
							vscode.window.showWarningMessage("Project could not be removed.");
						}
						break;
					case 'select-project':
						projectId = e.projectId;
						let newWindow = e.newWindow;
						let project = projectservice.getProject(context, projectId);
						if (project == null) {
							vscode.window.showWarningMessage("Project not found.");
							break;
						}
						openProject(project, newWindow);
						break;
				}
			});

			instance = panel;
		}
	}

	function addNewProject() {
		let projectName = undefined;
		let projectPath = undefined;
		getUserProjectInput().then(name => {
			projectName = name;
			getPathFromInput().then(path => {
				projectPath = path;
				vscode.window.showInformationMessage(`Project path: ${projectPath}`);
				let project = new models.Project(projectName, projectPath);
				projectservice.addProject(context, project);
				showDashboard();
			})
		}).catch(err => {
			vscode.window.showErrorMessage(err)
		});
	}

	function openProject(project, newWindow) {
		const uri = vscode.Uri.file(project.path)
		vscode.commands.executeCommand("vscode.openFolder", uri, newWindow);
	}

	function getUserProjectInput() {
		return new Promise(function (resolve, reject) {
			// Name
			var projectName = vscode.window.showInputBox({
				value: undefined,
				valueSelection: undefined,
				placeHolder: 'Project Name',
				ignoreFocusOut: true,
				validateInput: (val) => val ? '' : 'A Project Name must be provided.',
			});

			if (!projectName) {
				reject()
			} else {
				resolve(projectName)
			}
		});
	}

	function getPathFromInput() {
		return new Promise(function (resolve, reject) {
			var defaultUri = null;
			// Path
			vscode.window.showOpenDialog({
				defaultUri,
				openLabel: 'Select Folder as Project',
				canSelectFolders: true,
				canSelectFiles: false,
				canSelectMany: false,
			}).then(folderUri => {
				if (folderUri) {
					resolve(folderUri[0].fsPath.trim())
				} else {
					reject();
				}
			});
		});
	}

	context.subscriptions.push(openCommand);
	context.subscriptions.push(addProjectCommand);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
