class Project {
	constructor(name, path) {
		this.id = generateRandomId(name);
		this.name = name;
		this.path = path;
	}
}

function generateRandomId(name) {
	const str = name.replace(/\W/ig, "").toLowerCase().substring(0, 24);
	return str + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

module.exports = {
	Project
}