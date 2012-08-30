/**
 * @author Matias Piispanen
 */

var WALL_RAD = 10000;

function Scene(spheres) {
	this.spheres = [];
	if(spheres == undefined) {
		this.spheres[0] = new Sphere(WALL_RAD, [WALL_RAD + 1.0, 40.8, 81.6], [0.0, 0.0, 0.0], [0.75, 0.25, 0.25], Refl.DIFF);
		this.spheres[1] = new Sphere(WALL_RAD, [-WALL_RAD + 99.0, 40.8, 81.6], [0.0, 0.0, 0.0], [0.25, 0.25, 0.25], Refl.DIFF);
		this.spheres[2] = new Sphere(WALL_RAD, [50.0, 40.8, WALL_RAD], [0.0, 0.0, 0.0], [0.75, 0.75, 0.75], Refl.DIFF);
		this.spheres[3] = new Sphere(WALL_RAD, [50.0, 40.8, -WALL_RAD + 270.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], Refl.DIFF);
		this.spheres[4] = new Sphere(WALL_RAD, [50.0, WALL_RAD, 81.6], [0.0, 0.0, 0.0], [0.75, 0.75, 0.75], Refl.DIFF);
		this.spheres[5] = new Sphere(WALL_RAD, [50.0, -WALL_RAD + 81.6, 81.6], [0.0, 0.0, 0.0], [0.75, 0.75, 0.75], Refl.DIFF);
		this.spheres[6] = new Sphere(16.5, [27.0, 16.5, 47.0], [0.0, 0.0, 0.0], [0.9, 0.9, 0.9], Refl.SPEC);
		this.spheres[7] = new Sphere(16.5, [73.0, 16.5, 78.0], [0.0, 0.0, 0.0], [0.9, 0.9, 0.9], Refl.REFR);
		this.spheres[8] = new Sphere(7.0, [50.0, 81.6 - 15.0, 81.6], [12.0, 12.0, 12.0], [0.0, 0.0, 0.0], Refl.DIFF);
	}
}

Scene.prototype.getSpheres = function() {
	return this.spheres;
}

Scene.prototype.getSphereCount = function() {
	return this.spheres.length;
}

Scene.prototype.getBuffer = function() {
	var buffer = new Float32Array(this.spheres.length*11);
	
	for(var i = 0; i < this.spheres.length; i++) {
		buffer[i*11] = this.spheres[i].rad;
		buffer[i*11+1] = this.spheres[i].p[0];
		buffer[i*11+2] = this.spheres[i].p[1];
		buffer[i*11+3] = this.spheres[i].p[2];
		buffer[i*11+4] = this.spheres[i].e[0];
		buffer[i*11+5] = this.spheres[i].e[1];
		buffer[i*11+6] = this.spheres[i].e[2];
		buffer[i*11+7] = this.spheres[i].c[0];
		buffer[i*11+8] = this.spheres[i].c[1];
		buffer[i*11+9] = this.spheres[i].c[2];
		buffer[i*11+10] = this.spheres[i].refl;
	}

	return buffer;
}
