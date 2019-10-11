// in radianti on a 2D plane (x,z)
export function calcAngleBetweenTwoPoints (p1, p2) {
    return Math.atan2(p2.x - p1.x, p2.z - p1.z)/* * 180 / Math.PI */;
}