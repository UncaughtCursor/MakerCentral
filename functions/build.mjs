import copy from 'recursive-copy';

console.log('Running MakerCentral build script...');

// Copy data to cloud functions folder
await copy('../data', 'src/data', {
	overwrite: true,
});

console.log('Done!\n');
