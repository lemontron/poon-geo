// Unwraps a Feature, or lets through a Polygon or MultiPolygon
export const stripFeature = (obj) => {
	if (obj.type === 'Feature') return obj.geometry;
	if (obj.type === 'MultiPolygon' || obj.type === 'Polygon') return obj;
	throw new Error(`Unsupported feature type ${obj.type}`);
};

export const combineFeatures = (features) => {
	// console.log('Input:', features);
	const polygons = features
	.map(stripFeature)
	.map(repairWinding)
	.reduce((acc, geometry) => {
		if (geometry.type === 'Polygon') {
			acc.push(geometry.coordinates);
		} else if (geometry.type === 'MultiPolygon') {
			acc.push(...geometry.coordinates);
		} else {
			throw new Error(`Unsupported geometry type: ${geometry.type}`);
		}
		return acc;
	}, []);
	return {'type': 'MultiPolygon', 'coordinates': polygons};
};

const ringArea = (ring) => {
	let sum = 0;
	for (let i = 0; i < ring.length - 1; i++) {
		const [x1, y1] = ring[i];
		const [x2, y2] = ring[i + 1];
		sum += (x1 * y2) - (x2 * y1);
	}
	return sum / 2;
};

const isCounterClockwise = (ring) => ringArea(ring) > 0;

export const repairWinding = (geometry) => {
	const correct = (rings) => rings.map((r, i) => (isCounterClockwise(r) === (i !== 0) ? r.slice().reverse() : r));
	if (geometry.type === 'Polygon') return {...geometry, 'coordinates': correct(geometry.coordinates)};
	if (geometry.type === 'MultiPolygon') return {...geometry, 'coordinates': geometry.coordinates.map(correct)};
	throw new Error(`Unsupported geometry type: ${geometry.type}`);
};