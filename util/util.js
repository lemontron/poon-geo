export const extractNormalizedCoordinates = (geometry) => {
	if (geometry.type === 'Polygon') return [geometry.coordinates];
	if (geometry.type === 'MultiPolygon') return geometry.coordinates;
	throw new Error(`Geometry of type ${geometry.type} is not supported`);
};

