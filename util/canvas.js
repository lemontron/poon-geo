// let fs;
//
// if (process.env.NODE_ENV === 'server') fs = await import('fs');

export class Canvas {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.stride = Math.ceil(width / 8);
		this.pixels = Buffer.alloc(this.stride * height);
	}

	setPixel(x, y, on) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
		const byteIndex = y * this.stride + (x >> 3);
		const mask = 0x80 >> (x & 7);
		if (on) {
			this.pixels[byteIndex] |= mask;
		} else {
			this.pixels[byteIndex] &= ~mask;
		}
	}

	debug(filePath) {
		const header = `P4\n${this.width} ${this.height}\n`;
		const buffer = Buffer.concat([Buffer.from(header), this.pixels]);
		fs.writeFileSync(filePath, buffer);
	}

	fillTriangle(x1, y1, x2, y2, x3, y3) {
		const pts = [{x: x1, y: y1}, {x: x2, y: y2}, {x: x3, y: y3}].sort((a, b) => a.y - b.y);
		const [p0, p1, p2] = pts;

		const interpX = (y, pa, pb) => {
			if (pb.y === pa.y) return pa.x;
			return pa.x + ((pb.x - pa.x) * (y - pa.y)) / (pb.y - pa.y);
		};

		const scan = (y, xa, xb, on) => {
			xa = Math.ceil(xa);
			xb = Math.floor(xb);
			for (let x = xa; x <= xb; x++) this.setPixel(x, y, on);
		};

		const yStart = Math.ceil(p0.y), yEnd = Math.floor(p2.y);
		for (let y = yStart; y <= yEnd; y++) {
			if (y < 0 || y >= this.height) continue;

			let xa, xb;
			if (y < p1.y) { // Upper part of the triangle (p0 -> p1)
				xa = interpX(y, p0, p2);
				xb = interpX(y, p0, p1);
			} else { // Lower part (p1 -> p2)
				xa = interpX(y, p0, p2);
				xb = interpX(y, p1, p2);
			}

			if (xa > xb) [xa, xb] = [xb, xa]; // ensure xa <= xb
			scan(y, xa, xb, true);
		}
	}

	/**
	 * Draw a filled polygon. `points` must be an array like [[x,y], ...].
	 * The polygon is automatically closed if the last point ≠ first point.
	 * Uses an even‑odd scan‑line fill (O(n·h) where h = height).
	 */
	fillPolygon(points) {
		this.points = points;
		if (!Array.isArray(points) || points.length < 3) return;

		// Clone points and close polygon if not already closed
		const pts = points.map(p => [p[0], p[1]]);
		if (pts[0][0] !== pts[pts.length - 1][0] ||
			pts[0][1] !== pts[pts.length - 1][1]) {
			pts.push([pts[0][0], pts[0][1]]);
		}

		// Determine vertical bounds
		let minY = Math.ceil(Math.min(...pts.map(p => p[1])));
		let maxY = Math.floor(Math.max(...pts.map(p => p[1])));

		for (let y = minY; y <= maxY; y++) {
			if (y < 0 || y >= this.height) continue;

			// Collect x-intersections with scanline y
			const nodes = [];
			for (let i = 0; i < pts.length - 1; i++) {
				const [x1, y1] = pts[i];
				const [x2, y2] = pts[i + 1];
				if ((y1 < y && y2 >= y) || (y2 < y && y1 >= y)) {
					// Linear interpolation to find intersection
					const x = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
					nodes.push(x);
				}
			}

			nodes.sort((a, b) => a - b);

			// Fill between node pairs
			for (let j = 0; j < nodes.length; j += 2) {
				const xa = Math.ceil(nodes[j]);
				const xb = Math.floor(nodes[j + 1]);
				for (let x = xa; x <= xb; x++) {
					if (x < 0 || x >= this.width) continue;
					this.setPixel(x, y, true);
				}
			}
		}
	}

	trace(accuracy = 5) {
		// draw a rough polygon around the whole polygon using the furthest point
		const centerX = Math.floor(this.width / 2);
		const centerY = Math.floor(this.height / 2);
		const furthestPoint = this.points.reduce((max, p) => {
			const dist = Math.abs(Math.sqrt(
				Math.pow(p[0] - centerY, 2) + Math.pow(p[1] - centerX, 2),
			));
			return dist > max.dist ? {point: p, dist} : max;
		}, {point: null, dist: -Infinity});

		const radius = Math.ceil(furthestPoint.dist);

		for (let angle = 0; angle < 360; angle += accuracy) {
			const rad = angle * (Math.PI / 180);
			const x = Math.round(centerX + radius * Math.cos(rad));
			const y = Math.round(centerY + radius * Math.sin(rad));
			this.setPixel(x, y, true);
		}
	}
}