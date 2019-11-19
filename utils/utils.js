// in radianti on a 2D plane (x,z)
// https://gamedev.stackexchange.com/questions/14602/what-are-atan-and-atan2-used-for-in-games
export function calcAngleBetweenTwoPoints(p1, p2) {
    return Math.atan2(p2.x - p1.x, p2.z - p1.z)/* * 180 / Math.PI */;
}

export function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}