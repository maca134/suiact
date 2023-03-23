// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const jetpack = require('fs-jetpack');

(async () => {
	const packageJson = await jetpack.readAsync('./package.json', 'json');

	// Remove devDependencies from package.json
	delete packageJson.devDependencies;

	// Remove scripts from package.json
	delete packageJson.scripts;

	await jetpack.writeAsync('./dist/package.json', packageJson, { atomic: true });

	await jetpack.copyAsync('./package-lock.json', './dist/package-lock.json');
	await jetpack.copyAsync('./README.md', './dist/README.md');
	await jetpack.copyAsync('./LICENSE', './dist/LICENSE');
})();

