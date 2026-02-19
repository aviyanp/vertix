export function getCurrentWeapon(player) {
	if (player.weapons != undefined && player.weapons[player.currentWeapon] != undefined) {
		return player.weapons[player.currentWeapon];
	} else {
		return null;
	}
}
Number.prototype.round = function (a) {
    return +this.toFixed(a);
};
var PI2 = Math.PI * 2;
export function getAngleDifference(a, b) {
	let anglDif = Math.abs(b - a) % PI2;
	if (anglDif > Math.PI) {
		return PI2 - anglDif;
	} else {
		return anglDif;
	}
}
export function jsonByteCount(a) {
	return byteCount(JSON.stringify(a));
}
export function byteCount(a) {
	return encodeURI(a).split(/%..|./).length - 1;
}
export function getDistance(a, b, d, e) {
	return Math.sqrt(Math.pow(d - a, 2) + Math.pow(e - b, 2));
}
export function getAngle(a, b, d, e) {
	return Math.atan2(e - b, d - a);
}
export function shadeColor(a, b) {
	var d = parseInt(a.substring(1, 3), 16);
	var e = parseInt(a.substring(3, 5), 16);
	var f = parseInt(a.substring(5, 7), 16);
	var d = parseInt((d * (100 + b)) / 100);
	var e = parseInt((e * (100 + b)) / 100);
	var f = parseInt((f * (100 + b)) / 100);
	var d = d < 255 ? d : 255;
	var e = e < 255 ? e : 255;
	var f = f < 255 ? f : 255;
	var d = d.toString(16).length == 1 ? "0" + d.toString(16) : d.toString(16);
	var e = e.toString(16).length == 1 ? "0" + e.toString(16) : e.toString(16);
	var f = f.toString(16).length == 1 ? "0" + f.toString(16) : f.toString(16);
	return "#" + d + e + f;
}
export function randomFloat(a, b, d) {
	return a + Math.random() * (b - a);
}
export function randomInt(a, b, d) {
	return Math.floor(Math.random() * (b - a + 1)) + a;
}
export function linearInterpolate(a, b, d) {
	var e = a - b;
	if (e * e > d * d) {
		return b + d;
	} else {
		return a;
	}
}
