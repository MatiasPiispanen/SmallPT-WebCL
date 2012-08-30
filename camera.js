/**
 * @author Matias Piispanen
 */

function Camera() {
	// User defined values
	this.orig = vec3.create();
	this.target = vec3.create();
	
	// Calculated values
	this.dir = vec3.create();
	this.x = vec3.create();
	this.y = vec3.create();
}

Camera.prototype.getBuffer = function() {
	var buffer = new Float32Array(15);

	buffer[0] = this.orig[0];
	buffer[1] = this.orig[1];
	buffer[2] = this.orig[2];

	buffer[3] = this.target[0];
	buffer[4] = this.target[1];
	buffer[5] = this.target[2];

	buffer[6] = this.dir[0];
	buffer[7] = this.dir[1];
	buffer[8] = this.dir[2];

	buffer[9] = this.x[0];
	buffer[10] = this.x[1];
	buffer[11] = this.x[2];

	buffer[12] = this.y[0];
	buffer[13] = this.y[1];
	buffer[14] = this.y[2];

	return buffer;
}
