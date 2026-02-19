export function setupMap(a, mapTileScale) {
	var b = a.genData;
	var d = -(mapTileScale * 2);
	var e = -(mapTileScale * 2);
	var f = 0;
	var h = b.height;
	var g;
	a.tilePerCol = h;
	a.width = (b.width - 4) * mapTileScale;
	a.height = (b.height - 4) * mapTileScale;
	a.scoreToWin = a.gameMode.score;
	var l = b.data.data || b.data;
	for (var m = 0; m < b.width; m++) {
		for (var k = 0; k < b.height; k++) {
			var p = (b.width * k + m) << 2;
			var p = l[p] + " " + l[p + 1] + " " + l[p + 2];
			var n = {
				index: f,
				scale: mapTileScale,
				x: 0,
				y: 0,
				wall: false,
				spriteIndex: 0,
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				topLeft: 0,
				topRight: 0,
				bottomLeft: 0,
				bottomRight: 0,
				neighbours: 0,
				hasCollision: false,
				hardPoint: false,
				objTeam: "e",
				edgeTile: false,
			};
			n.x = d + mapTileScale * m;
			n.y = e + mapTileScale * k;
			if (m == 0 && k == 0) {
				p = "0 0 0";
			}
			if (p == "0 0 0") {
				n.wall = true;
				n.hasCollision = true;
				g = a.tiles[f - h];
				if (g != undefined) {
					if (g.wall) {
						n.left = 1;
						n.neighbours += 1;
					}
					g.right = 1;
					g.neighbours += 1;
				}
				g = a.tiles[f - h - 1];
				if (g != undefined && g.wall) {
					g.spriteIndex = 0;
				}
				g = a.tiles[f - h - 1];
				if (g != undefined && g.wall) {
					n.topLeft = 1;
					g.bottomRight = 1;
				}
				g = a.tiles[f - h + 1];
				if (g != undefined) {
					g.topRight = 1;
					if (g.wall) {
						n.bottomLeft = 1;
					}
				}
				g = a.tiles[f - 1];
				if (g != undefined) {
					if (g.wall) {
						n.top = 1;
						n.neighbours += 1;
					}
					g.bottom = 1;
					g.neighbours += 1;
				}
				if (m <= 0 || k <= 0 || m >= b.width - 1 || k >= b.height - 1) {
					n.left = 1;
					n.right = 1;
					n.top = 1;
					n.bottom = 1;
					n.neighbours = 4;
					n.edgeTile = true;
				}
				if (n.spriteIndex == 0 && randomInt(0, 2) == 0) {
					n.spriteIndex = randomInt(1, 2);
				}
			} else {
				g = randomInt(0, 10);
				n.spriteIndex = 0;
				if (g <= 0) {
					n.spriteIndex = 1;
				}
				n.wall = false;
				g = a.tiles[f - h];
				if (g != undefined && g.wall) {
					n.left = 1;
					n.neighbours += 1;
				}
				g = a.tiles[f - 1];
				if (g != undefined && g.wall) {
					n.top = 1;
					n.neighbours += 1;
				}
				g = a.tiles[f - h - 1];
				if (g != undefined && g.wall) {
					n.topLeft = 1;
				}
				if (p == "0 255 0") {
					n.spriteIndex = 2;
				} else if (p == "255 255 0") {
					if (a.gameMode.name == "Hardpoint" || a.gameMode.name == "Zone War") {
						n.hardPoint = true;
						if (a.gameMode.name == "Zone War") {
							n.objTeam = m < b.width / 2 ? "red" : "blue";
						}
					} else {
						n.spriteIndex = 1;
					}
				}
			}
			a.tiles.push(n);
			f++;
		}
	}
	// tmpY = tmpShad = null;
	for (b = 0; b < a.tiles.length; ++b) {
		if (a.tiles[b].edgeTile) {
			a.tiles[b].hasCollision = false;
		} else if (!a.tiles[b].wall && a.tiles[b].hardPoint) {
			/*
			if (
				canPlaceFlag(a.tiles[b - h], true) &&
				canPlaceFlag(a.tiles[b - 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + 40,
					y: a.tiles[b].y + 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
			if (
				canPlaceFlag(a.tiles[b + h], true) &&
				canPlaceFlag(a.tiles[b - 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + mapTileScale - 30 - 40,
					y: a.tiles[b].y + 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
			if (
				canPlaceFlag(a.tiles[b + h], true) &&
				canPlaceFlag(a.tiles[b + 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + mapTileScale - 30 - 40,
					y: a.tiles[b].y + mapTileScale - 30 - 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
			if (
				canPlaceFlag(a.tiles[b - h], true) &&
				canPlaceFlag(a.tiles[b + 1], false)
			) {
				gameObjects.push({
					type: "flag",
					team: a.tiles[b].objTeam,
					x: a.tiles[b].x + 40,
					y: a.tiles[b].y + mapTileScale - 30 - 40,
					w: 70,
					h: 152,
					ai: randomInt(0, 2),
					ac: 0,
				});
			}
            */
		}
	}
}
function canPlaceFlag(a, b) {
	if (b) {
		return a != undefined && !a.wall && !a.hardPoint;
	} else {
		return a != undefined && !a.hardPoint;
	}
}
export function wallCol(a, gameMap, gameObjects) {
	if (!a.dead) {
		var b = null;
		for (var d = (a.nameYOffset = 0); d < gameMap.tiles.length; ++d) {
			if (gameMap.tiles[d].wall && gameMap.tiles[d].hasCollision) {
				b = gameMap.tiles[d];
				if (
					a.x + a.width / 2 >= b.x &&
					a.x - a.width / 2 <= b.x + b.scale &&
					a.y >= b.y &&
					a.y <= b.y + b.scale
				) {
					if (a.oldX <= b.x) {
						a.x = b.x - a.width / 2 - 2;
					} else if (a.oldX - a.width / 2 >= b.x + b.scale) {
						a.x = b.x + b.scale + a.width / 2 + 2;
					}
					if (a.oldY <= b.y) {
						a.y = b.y - 2;
					} else if (a.oldY >= b.y + b.scale) {
						a.y = b.y + b.scale + 2;
					}
				}
				if (
					!b.hardPoint &&
					a.x > b.x &&
					a.x < b.x + b.scale &&
					a.y - a.jumpY - a.height * 0.85 > b.y - b.scale / 2 &&
					a.y - a.jumpY - a.height * 0.85 <= b.y
				) {
					a.nameYOffset = Math.round(
						a.y - a.jumpY - a.height * 0.85 - (b.y - b.scale / 2),
					);
				}
			}
		}
		for (d = 0; d < gameObjects.length; ++d) {
			if (gameObjects[d].type == "clutter" && gameObjects[d].active) {
				b = gameObjects[d];
				if (
					b.hc &&
					//canSee(b.x - startX, b.y - startY, b.w, b.h) &&
					a.x + a.width / 2 >= b.x &&
					a.x - a.width / 2 <= b.x + b.w &&
					a.y >= b.y - b.h * b.tp &&
					a.y <= b.y
				) {
					if (a.oldX + a.width / 2 <= b.x) {
						a.x = b.x - a.width / 2 - 1;
					} else if (a.oldX - a.width / 2 >= b.x + b.w) {
						a.x = b.x + b.w + a.width / 2 + 1;
					}
					if (a.oldY >= b.y) {
						a.y = b.y + 1;
					} else if (a.oldY <= b.y - b.h * b.tp) {
						a.y = b.y - b.h * b.tp - 1;
					}
				}
			}
		}
		b = null;
	}
}
export function getCurrentWeapon(player) {
	if (
		player.weapons != undefined &&
		player.weapons[player.currentWeapon] != undefined
	) {
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
