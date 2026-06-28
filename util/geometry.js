// Converts Polygons to MultiPolygons
import { Canvas } from './canvas.js';

export const normalizeToMultiPolygon = (coordinates) => {
	if (coordinates.length === 1) return [coordinates[0]];
	return coordinates;
};

export class MultiPolygon {
	constructor(coordinates, accuracy = 0.0001) {
		this.polygons = normalizeToMultiPolygon(coordinates);
		this.accuracy = accuracy; // Pixels per degree

		this.bounds = this.getBounds();

		const heightDeg = this.bounds.maxY - this.bounds.minY; // Height in degrees
		const widthDeg = this.bounds.maxX - this.bounds.minX; // Width in degrees

		const canvasWidth = Math.ceil(widthDeg / this.accuracy);
		const canvasHeight = Math.ceil(heightDeg / this.accuracy);

		this.canvas = new Canvas(canvasWidth, canvasHeight);
	}

	convertToCanvasSpace(x, y) {
		const xDeg = (x - this.bounds.minX) / this.accuracy;
		const yDeg = (y - this.bounds.minY) / this.accuracy;
		return [Math.floor(xDeg), Math.floor(yDeg)];
	}

	convertToCoordinateSpace(x, y) {
		const xDeg = x * this.accuracy + this.bounds.minX;
		const yDeg = y * this.accuracy + this.bounds.minY;
		return [xDeg, yDeg];
	}

	getBounds() {
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const polygon of this.polygons) {
			for (const ring of polygon) {
				for (const [x, y] of ring) {
					if (x < minX) minX = x;
					if (y < minY) minY = y;
					if (x > maxX) maxX = x;
					if (y > maxY) maxY = y;
				}
			}
		}
		return {minX, minY, maxX, maxY};
	}

	// triangulate() {
	// 	const triangles = [];
	// 	for (const polygon of this.polygons) {
	// 		if (polygon.length < 3) continue; // Not enough points to form a triangle
	// 		for (let i = 1; i < polygon.length - 1; i++) {
	// 			triangles.push([polygon[0], polygon[i], polygon[i + 1]]);
	// 		}
	// 	}
	// 	return triangles;
	// }

	draw() {
		this.polygons.forEach((polygon) => {
			polygon.forEach((ring) => {
				const points = ring.map(([x, y]) => this.convertToCanvasSpace(x, y));
				this.canvas.fillPolygon(points);
			});
		});
	}
}