import {EPSILON} from './consts';

export default class Ray {

  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
 
  getFaceIntersectionDistance(face) {
		let distance = this.getTriangleIntersectionDistance(face.a, face.b, face.c);
    if (!distance) {
      distance = this.getTriangleIntersectionDistance(face.a, face.c, face.d);
    }
    return distance;
  }

  getFaceIntersectionPoint(face) {
    let distance = this.getFaceIntersectionDistance();
    if (distance) {
      return this.direction.clone().muls(distance).add(this.origin);
    }
  }

  intersectsFace(face) {
		return !!this.getFaceIntersectionDistance;
  }

  // Möller–Trumbore intersection algorithm
  getTriangleIntersectionDistance(v1, v2, v3) {
    let direction = this.direction;
    let e1 = v2.clone().sub(v1);
    let e2 = v3.clone().sub(v1);

    let P = direction.clone().cross(e2);
    let det = e1.dot(P);

    if (det > -EPSILON && det < EPSILON) {
      return null;
    }

    let inv_det = 1 / det;
    let T = this.origin.clone().sub(v1);
    let u = T.dot(P) * inv_det;
    if (u < 0 || u > 1) {
      return null;
    }

    let Q = T.clone().cross(e1);
    let v = direction.dot(Q) * inv_det
    if (v < 0 || u + v  > 1) {
      return null;
    }

    let t = e2.dot(Q) * inv_det;
    if (t > EPSILON) {
      return t;
    }

    return null;
  }  

};
