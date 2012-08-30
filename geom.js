/**
 * @author Matias Piispanen
 */

var epsilon = 0.01;
var float_pi = 3.14159265358979323846;

var Refl = {"DIFF" : 0, "SPEC" : 1, "REFR" : 2 };

function Ray() {
	this.o = vec3.create();
	this.d = vec3.create();
}

function rinit(r, a, b) {
	vec3.set(a, r.o);
	vec3.set(b, r.d);
}

function rassign(a, b) {
	vec3.set(b.o, a.o);
	vec3.set(b.d, a.d);
}

function Sphere(r, a, b, c, ref) {
	this.rad;
	
	this.p = vec3.create();
	this.e = vec3.create();
	this.c = vec3.create();
	
	this.refl;
	
	if(r && a && b && c) {
		this.rad = r;
		
		vec3.set(a, this.p);
		vec3.set(b, this.e);
		vec3.set(c, this.c);
		
		this.refl = ref;
	}
}
