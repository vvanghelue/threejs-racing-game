window.createElement = (html, onCreated) => {
	let element = new DOMParser().parseFromString(html, "text/html").body.firstChild

	if (onCreated) {
		onCreated(element)
	}

	return element
}