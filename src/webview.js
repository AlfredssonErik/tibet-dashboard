const vscode = require('vscode');
const path = require("path");

function getDashboardContent(context, webviewPanel, projects) {
	const stylesPath = getMediaResource(context, webviewPanel, 'styles.css');

	return `
	<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta
				http-equiv="Content-Security-Policy"
				content="default-src 'none'; script-src ${webviewPanel.webview.cspSource} 'unsafe-inline'; style-src ${webviewPanel.webview.cspSource} 'unsafe-inline';"
			/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Dashboard</title>
			<link rel="stylesheet" type="text/css" href="${stylesPath}">
		</head>
		<body>
			<h1>My projects</h1>
			<div class="project-grid">
				${projects.length ?
			projects.map(project => getProject(project)).join('\n') : ''}
				<div class="grid-item grid-item--small">
					<div class="project add-project" data-action="add-project">
					</div>
				</div>
			</div>
		</body>
		<script>
        (function() {
				const vscode = acquireVsCodeApi();
				${getScript()}
			})();
		</script>
	</html>`;
}

function getProject(project) {
	return `<div class="grid-item">
	<div class="project" data-id="${project.id}">
		<span class="project__remove" data-action="remove-project">Remove</span>
		<h2 class="project__title">${project.name}</h2>
		<p class="project__path">${project.path}</p>
	</div>
</div>`;
}


function getScript() {
	return `
	function onAddProjectClicked(e) {
		if (!e.target)
			return;
		var projectDiv = e.target.closest('.add-project');
		if (!projectDiv)
			return;
		vscode.postMessage({
			type: 'add-project'
		});
	}

	function onClickProject(e, project) {
		var projectId = project.getAttribute("data-id");
		if (projectId == null) return;

		var action = e.target.getAttribute('data-action');
		if (action === 'remove-project') {
			vscode.postMessage({
				type: 'remove-project',
				projectId
			});
			return;
		}

		var newWindow = !!e.ctrlKey;
		vscode.postMessage({
			type: 'select-project',
			projectId,
			newWindow,
		});
	}

	document.addEventListener('click', function(e) {
		if (!e.target) return;
		var project = e.target.closest('.project');
		if (project) {
			onClickProject(e, project);
			return;
		}   
	});

	document
		.querySelectorAll('[data-action="add-project"]')
		.forEach(element => 
			element.addEventListener("click", onAddProjectClicked)
		);
	`;
}

function getMediaResource(context, webviewPanel, name) {
	let resource = vscode.Uri.file(path.join(context.extensionPath, 'assets', name));
	resource = webviewPanel.webview.asWebviewUri(resource);

	return resource;
}

module.exports = {
	getDashboardContent
}
