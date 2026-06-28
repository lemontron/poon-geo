const kRad = Math.PI / 180;
export const ruler = (geometry) => {
	const [lng, lat] = geometry.coordinates;
	const kx = Math.cos(lat * kRad) * 111.321;
	const dx = (lng - lng) * kx;
	const dy = (lat - lat) * 111.139;
	return Math.sqrt((dx * dx) + (dy * dy));
};
