import { extractNormalizedCoordinates } from './util.js';

export const getCentroid = (geometry) => {
	if (!geometry) throw new Error('No geometry provided');
	const coords = extractNormalizedCoordinates(geometry).flat(2);
	const [sumLng, sumLat] = coords.reduce(([lng, lat], [x, y]) => [lng + x, lat + y], [0, 0]);
	return {'type': 'Point', 'coordinates': [sumLng / coords.length, sumLat / coords.length]};
};