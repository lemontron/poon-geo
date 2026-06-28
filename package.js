Package.describe({
	name: 'poon-geo',
	version: '1.0.0',
	summary: 'Poon GeoJSON utilities',
});

Package.onUse(api => {
	api.use('ecmascript');
	api.use('modules');
	api.mainModule('index.js');
});
