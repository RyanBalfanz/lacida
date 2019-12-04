export function handleFile(file) {      
	const reader = new FileReader();

	return new Promise((resolve, reject) => {
		reader.onload = handleOnload;
		reader.onerror = handleOnerror;
		reader.readAsText(file);

		function handleOnload() {
			resolve(reader.result);
		}

		function handleOnerror() {
			reader.abort();
			reject(new DOMException("Problem parsing input file."));
		}
	});
}