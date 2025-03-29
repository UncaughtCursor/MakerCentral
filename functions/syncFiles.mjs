import copy from 'recursive-copy';

console.log('Running functions sync script...');
console.log('Current working directory:', process.cwd());

// Copy data to cloud functions folder
await copy('../data', 'src/data', {
	overwrite: true,
});

console.log('Done!\n');
