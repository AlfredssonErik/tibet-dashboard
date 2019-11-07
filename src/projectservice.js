function getProjects(context) {
	const projects = getProjectsFromGlobalState(context);
	return projects;
}

function addProject(context, project) {
	const projects = getProjectsFromGlobalState(context);
	projects.push(project);
	saveProjectsInState(context, projects);
}

function getProjectsFromGlobalState(context) {
	return context.globalState.get('projects');
}

function saveProjectsInState(context, projects) {
	return context.globalState.update("projects", projects);
}

function getProject(context, projectId) {
	if (projectId == null) return null;
	const projects = getProjectsFromGlobalState(context);
	let project = projects.find(p => p.id === projectId);
	return project;
}

function removeProject(context, projectId) {
	if (projectId == null) return false;
	const projects = getProjectsFromGlobalState(context);
	let index = projects.findIndex(p => p.id === projectId);
	if (index !== -1) {
		projects.splice(index, 1);
		return true;
	} else {
		return false;
	}
}

module.exports = {
	getProjects,
	addProject,
	removeProject,
	getProject
}
