//@ts-nocheck
import * as zip from "@zip.js/zip.js";
import { io, Socket } from "socket.io-client";
import * as utils from "./utils.ts";

const {
  getCurrentWeapon,
  getAngleDifference,
  jsonByteCount,
  byteCount,
  getDistance,
  getAngle,
  shadeColor,
  randomFloat,
  randomInt,
  linearInterpolate
} = utils;

var playerName;
var playerClassIndex;
var playerType;
var healthBarWidth;
var playerNameInput = document.getElementById("playerNameInput");
var classInput = document.getElementById("classSelect");
var socket: Socket | undefined;
var reason;
var animLoopHandle;
var mobile = false;
var room;
var currentFPS = 0;
var fillCounter = 0;
var currentLikeButton = "";
var delta = 0;
var horizontalDT = 0;
var verticalDT = 0;
var roomNum = 0;
var currentTime;
var oldTime = Date.now();
var FRAME_STEP = 1000 / 60;
var count = -1;
var clientPrediction = true;
var inputNumber = 0;
var clientSpeed = 12;
var temp = 1;
var thisInput = [];
var keyd = 1;
var tabbed = 0;
var timeSinceLastUpdate = 0;
var timeOfLastUpdate = 0;
var port;
var region;

window.settingShowNames = settingShowNames;

window.settingShowParticles = settingShowParticles;

window.settingShowTrippy = settingShowTrippy;

window.settingShowSprays = settingShowSprays;

window.settingProfanity = settingProfanity;

window.settingShowFade = settingShowFade;

window.settingShowShadows = settingShowShadows;

window.settingShowGlows = settingShowGlows;

window.settingShowBTrails = settingShowBTrails;

window.settingShowChat = settingShowChat;

window.settingHideUI = settingHideUI;

window.settingShowPingFps = settingShowPingFps;

window.settingShowLeader = settingShowLeader;

window.settingSelectChat = settingSelectChat;

window.changeMenuTab = changeMenuTab;

window.showUI = showUI;

window.hideUI = hideUI;

// zip.workerScriptsPath = "../js/lib/";
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
	mobile = true;
	hideMenuUI();
	hideUI(true);
	alert("tried to open google play");
	// openGooglePlay(false);
}
var previousClass = 0;
var previousHat = 0;
var previousShirt = 0;
var previousSpray = 0;
var startingGame = false;
var changingLobby = false;
var inMainMenu = true;
var loggedIn = false;
function startGame(a) {
	if (!startingGame && !changingLobby) {
		startingGame = true;
		playerName = playerNameInput.value
			.replace(/(<([^>]+)>)/gi, "")
			.substring(0, 25);
		enterGame(a);
		if (inMainMenu) {
			$("#loadingWrapper").fadeIn(0, () => {});
			document.getElementById("loadText").innerHTML = "CONNECTING";
		}
	}
}
var devTest = false;
function enterGame(a) {
	startSoundTrack(2);
	playerClassIndex = currentClassID;
	playerType = a;
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	document.getElementById("startMenuWrapper").style.display = "none";
	if (!room) {
		socket.emit("create");
	}
	socket.emit("respawn");
	hideMenuUI();
	animateOverlay = true;
	updateGameLoop();
}
function validNick() {
	return /^\w*$/.exec(playerNameInput.value) !== null;
}
var createClanButton = document.getElementById("createClanButton");
var joinClanButton = document.getElementById("joinClanButton");
var clanNameInput = document.getElementById("clanNameInput");
var clanKeyInput = document.getElementById("clanKeyInput");
var clanDBMessage = document.getElementById("clanDBMessage");
var clanStats = document.getElementById("clanStats");
var clanSignUp = document.getElementById("clanSignUp");
var clanHeader = document.getElementById("clanHeader");
var clanAdminPanel = document.getElementById("clanAdminPanel");
var clanInviteInput = document.getElementById("clanInviteInput");
var inviteClanButton = document.getElementById("inviteClanButton");
var kickClanButton = document.getElementById("kickClanButton");
var leaveClanButton = document.getElementById("leaveClanButton");
var clanChatInput = document.getElementById("clanChatInput");
var setChatClanButton = document.getElementById("setChatClanButton");
var clanInvMessage = document.getElementById("clanInvMessage");
var clanChtMessage = document.getElementById("clanChtMessage");
var clanChatLink = document.getElementById("clanChatLink");
var loginWrapper = document.getElementById("loginWrapper");
var loggedInWrapper = document.getElementById("loggedInWrapper");
var loginButton = document.getElementById("loginButton");
var registerButton = document.getElementById("registerButton");
var logoutButton = document.getElementById("logoutButton");
var loginMessage = document.getElementById("loginMessage");
var recoverButton = document.getElementById("recoverButton");
var userNameInput = document.getElementById("usernameInput");
var userEmailInput = document.getElementById("emailInput");
var userPassInput = document.getElementById("passwordInput");
var loginUserNm = "";
var loginUserPs = "";
var settingsMenu = document.getElementById("settingsButton");
var settings = document.getElementById("settings");
var howToMenu = document.getElementById("instructionButton");
var howTo = document.getElementById("instructions");
var leaderboardButton = document.getElementById("leaderButton");
var btn = document.getElementById("startButton");
var btnMod = document.getElementById("texturePackButton");
var modURL = document.getElementById("textureModInput");
var lobbyInput = document.getElementById("lobbyKey");
var lobbyPass = document.getElementById("lobbyPass");
var lobbyMessage = document.getElementById("lobbyMessage");
var lobbyButton = document.getElementById("joinLobbyButton");
var createServerButton = document.getElementById("createServerButton");
var serverCreateMessage = document.getElementById("serverCreateMessage");
var serverKeyTxt = document.getElementById("serverKeyTxt");
var loginTimeOut = null;
function startLogin() {
	if (socket) {
		socket.emit("dbLogin", {
			userName: userNameInput.value,
			userPass: userPassInput.value,
		});
		loginUserNm = userNameInput.value;
		loginUserPs = userPassInput.value;
		loginMessage.style.display = "block";
		loginMessage.innerHTML = "Please Wait...";
	}
}
var customMap = null;
function getFile() {
	document.getElementById("upfile").click();
}
function selectedCMap(a) {
	var b = a.value.split("\\");
	document.getElementById("customMapButton").innerHTML = b[b.length - 1];
	if (a.files && a.files[0]) {
		b = new FileReader();
		b.onload = function (a) {
			var b = document.createElement("img");
			b.onload = function (a) {
				a = document.createElement("canvas");
				a.width = b.width;
				a.height = b.height;
				a.getContext("2d").drawImage(b, 0, 0, b.width, b.height);
				customMap = {
					width: b.width,
					height: b.height,
					data: a.getContext("2d").getImageData(0, 0, b.width, b.height).data,
				};
			};
			b.src = a.target.result;
		};
		b.readAsDataURL(a.files[0]);
	}
}
function clearCustomMap() {
	customMap = null;
	document.getElementById("customMapButton").innerHTML = "Select Map";
}
window.onload = function () {
	if (mobile) {
		document.getElementById("loadText").innerHTML =
			"MOBILE VERSION COMING SOON";
	} else {
		document.documentElement.style.overflow = "hidden";
		document.body.scroll = "no";
		document.getElementById("gameAreaWrapper").style.opacity = 1;
		drawMenuBackground();
		settingsMenu.onclick = function () {
			if (settings.style.maxHeight == "200px") {
				settings.style.maxHeight = "0px";
			} else {
				settings.style.maxHeight = "200px";
				howTo.style.maxHeight = "0px";
			}
		};
		howToMenu.onclick = function () {
			if (howTo.style.maxHeight == "200px") {
				howTo.style.maxHeight = "0px";
			} else {
				howTo.style.maxHeight = "200px";
				settings.style.maxHeight = "0px";
			}
		};
		leaderboardButton.onclick = function () {
			window.open("/leaderboards.html", "_blank");
		};
		$.get("/getIP", function (a) {
			port = a.port;
			if (!socket) {
				socket = io("http://" + (devTest ? "localhost" : a.ip) + ":" + a.port, {
					reconnection: true,
					transports: ["websocket"],
					forceNew: false,
				});
				setupSocket(socket);
			}
			socket.once("connect", function () {
				var a = getCookie("logKey");
				var d = getCookie("userName");
				if (a && a != "" && d && d != "") {
					socket.emit("dbLogin", {
						lgKey: a,
						userName: d,
						userPass: false,
					});
					loginMessage.style.display = "block";
					loginMessage.innerHTML = "Logging in...";
				} else {
					loadSavedClass();
				}
				btn.onclick = function () {
					startGame("player");
				};
				playerNameInput.addEventListener("keypress", function (a) {
					if ((a.which || a.keyCode) === 13) {
						startGame("player");
					}
				});
				btnMod.onclick = function () {
					loadModPack(modURL.value, false);
				};
				registerButton.onclick = function () {
					socket.emit("dbReg", {
						userName: userNameInput.value,
						userEmail: userEmailInput.value,
						userPass: userPassInput.value,
					});
					loginUserNm = userNameInput.value;
					loginUserPs = userPassInput.value;
					loginMessage.style.display = "block";
					loginMessage.innerHTML = "Registering...";
				};
				loginButton.onclick = function () {
					startLogin();
				};
				logoutButton.onclick = function () {
					loggedInWrapper.style.display = "none";
					loginWrapper.style.display = "block";
					loginMessage.innerHTML = "";
					loggedIn = false;
					resetHatList();
					resetShirtList();
					d = a = "";
					setCookie("logKey", "");
					setCookie("userName", "");
					socket.emit("dbLogout");
				};
				recoverButton.onclick = function () {
					socket.emit("dbRecov", {
						userMail: userEmailInput.value,
					});
					loginMessage.style.display = "block";
					loginMessage.innerHTML = "Please Wait...";
				};
				createClanButton.onclick = function () {
					socket.emit("dbClanCreate", {
						clanName: clanNameInput.value,
					});
					clanDBMessage.style.display = "block";
					clanDBMessage.innerHTML = "Please Wait...";
				};
				joinClanButton.onclick = function () {
					socket.emit("dbClanJoin", {
						clanKey: clanKeyInput.value,
					});
					clanDBMessage.style.display = "block";
					clanDBMessage.innerHTML = "Please Wait...";
				};
				inviteClanButton.onclick = function () {
					socket.emit("dbClanInvite", {
						userName: clanInviteInput.value,
					});
					clanInvMessage.style.display = "block";
					clanInvMessage.innerHTML = "Please Wait...";
				};
				kickClanButton.onclick = function () {
					socket.emit("dbClanKick", {
						userName: clanInviteInput.value,
					});
					clanInvMessage.style.display = "block";
					clanInvMessage.innerHTML = "Please Wait...";
				};
				leaveClanButton.onclick = function () {
					socket.emit("dbClanLeave");
				};
				setChatClanButton.onclick = function () {
					socket.emit("dbClanChatURL", {
						chUrl: clanChatInput.value,
					});
					clanChtMessage.style.display = "inline-block";
					clanChtMessage.innerHTML = "Please Wait...";
				};
				createServerButton.onclick = function () {
					var a = document.getElementById("serverPlayers").value;
					var b = document.getElementById("serverHealthMult").value;
					var d = document.getElementById("serverSpeedMult").value;
					var g = document.getElementById("serverPass").value;
					var l = document.getElementById("clanWarEnabled").checked;
					var m = [];
					for (var k = 0; k < 9; ++k) {
						if (document.getElementById("serverMode" + k).checked) {
							m.push(k);
						}
					}
					socket.emit("cSrv", {
						srvPlayers: a,
						srvHealthMult: b,
						srvSpeedMult: d,
						srvPass: g,
						srvMap: customMap,
						srvClnWr: l,
						srvModes: m,
					});
				};
				lobbyButton.onclick = function () {
					if (!changingLobby) {
						if (lobbyInput.value.split("/")[0].trim()) {
							lobbyMessage.style.display = "block";
							lobbyMessage.innerHTML = "Please wait...";
							changingLobby = true;
							var b = io.connect(
								"http://" + lobbyInput.value.split("/")[0] + ":" + port,
								{
									reconnection: true,
									forceNew: true,
								},
							);
							b.once("connect", function () {
								b.emit("create", {
									room: lobbyInput.value.split("/")[1],
									servPass: lobbyPass.value,
									lgKey: a,
									userName: d,
								});
								b.once("lobbyRes", function (a, d) {
									lobbyMessage.innerHTML = a.resp || a;
									if (d) {
										socket.removeListener("disconnect");
										socket.once("disconnect", function () {
											socket.close();
											changingLobby = false;
											socket = b;
											setupSocket(socket);
										});
										socket.disconnect();
									} else {
										changingLobby = false;
										b.disconnect();
										b.close();
									}
								});
							});
							b.on("connect_error", function (a) {
								lobbyMessage.innerHTML = "No Server Found.";
								changingLobby = false;
								b.close();
							});
						} else {
							lobbyMessage.style.display = "block";
							lobbyMessage.innerHTML = "Please enter a valid IP";
						}
					}
				};
			});
		});
		hideUI(true);
		$(".noRightClick").bind("contextmenu", function (a) {
			return false;
		});
		resize();
		$("#loadingWrapper").fadeOut(200, function () {});
	}
};
function openGooglePlay(a) {
	window.open(
		"https://web.archive.org/web/20211107033142/https://play.google.com/store/apps/details?id=tbs.vertix.io",
		a ? "_blank" : "_self",
	);
}
var accStatKills = document.getElementById("accStatKills");
console.log("test");
var accStatDeaths = document.getElementById("accStatDeaths");
var accStatLikes = document.getElementById("accStatLikes");
var accStatKD = document.getElementById("accStatKD");
var accStatRank = document.getElementById("accStatRank");
var accStatView = document.getElementById("accStatView");
var accStatRankProg = document.getElementById("rankProgress");
var accStatWorldRank = document.getElementById("accStatWorldRank");
var clanStats = document.getElementById("clanStats");
var clanSignUp = document.getElementById("clanSignUp");
var clanHeader = document.getElementById("clanHeader");
var leaveClanButton = document.getElementById("leaveClanButton");
var clanAdminPanel = document.getElementById("clanAdminPanel");
var profileButton = document.getElementById("profileButton");
var newUsernameInput = document.getElementById("newUsernameInput");
var youtubeChannelInput = document.getElementById("youtubeChannelInput");
var saveAccountData = document.getElementById("saveAccountData");
var editProfileMessage = document.getElementById("editProfileMessage");
function updateAccountPage(a) {
	player.account = a;
	accStatRank.innerHTML = "<b>Rank:  </b>" + a.rank;
	accStatRankProg.style.width = a.rankPercent + "%";
	accStatKills.innerHTML = "<b>Kills:  </b>" + a.kills;
	accStatDeaths.innerHTML = "<b>Deaths:  </b>" + a.deaths;
	accStatKD.innerHTML = "<b>KD:  </b>" + a.kd;
	accStatWorldRank.innerHTML = "<b>World Rank:  </b>" + a.worldRank;
	accStatLikes.innerHTML = "<b>Likes:  </b>" + a.likes;
	profileButton.onclick = function () {
		showUserStatPage(player.account.user_name);
	};
	newUsernameInput.value = player.account.user_name;
	youtubeChannelInput.value = player.account.channel;
	saveAccountData.onclick = function () {
		socket.emit("dbEditUser", {
			userName: newUsernameInput.value,
			userChannel: youtubeChannelInput.value,
		});
		editProfileMessage.innerHTML = "Please Wait...";
	};
	clanAdminPanel.style.display = "none";
	leaveClanButton.style.display = "none";
	if (a.clan != "") {
		clanSignUp.style.display = "none";
		clanStats.style.display = "block";
		leaveClanButton.style.display = "inline-block";
		leaveClanButton.innerHTML = "LEAVE CLAN";
		clanHeader.innerHTML = "[" + a.clan + "] CLAN:";
		if (a.clan_owner == "1") {
			clanAdminPanel.style.display = "block";
			leaveClanButton.innerHTML = "DELETE CLAN";
		}
	} else {
		clanSignUp.style.display = "block";
		clanStats.style.display = "none";
		clanHeader.innerHTML = "Clans";
	}
}
var clanStatRank = document.getElementById("clanStatRank");
var clanStatFounder = document.getElementById("clanStatFounder");
var clanStatMembers = document.getElementById("clanStatMembers");
var clanStatKD = document.getElementById("clanStatKD");
function updateClanPage(a) {
	clanStatRank.innerHTML = "<b>Rank:  </b>" + a.level;
	clanStatKD.innerHTML = "<b>Avg KD:  </b>" + a.kd;
	clanStatFounder.innerHTML = "<b>Founder:  </b>" + a.founder;
	clanStatMembers.innerHTML = "<b>Roster:</b>" + a.members;
	a = a.chatURL;
	if (a != "") {
		if (!a.match(/^https?:\/\//i)) {
			a = "http://" + a;
		}
		clanChatLink.innerHTML =
			"<a target='_blank' href='" + a + "'>Clan Chat</a>";
	}
}
function showUserStatPage(a) {
	window.open("/profile.html?" + a, "_blank");
}
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;
var gameWidth = 0;
var gameHeight = 0;
var mouseX = 0;
var mouseY = 0;
var maxScreenWidth = 1920;
var originalScreenWidth = maxScreenWidth;
var maxScreenHeight = 1080;
var originalScreenHeight = maxScreenHeight;
var viewMult = 1;
var uiScale = 1;
calculateUIScale();
var gameStart = false;
var gameOver = false;
var gameOverFade = false;
var disconnected = false;
var kicked = false;
var killTxt = "";
var continuity = false;
var startPingTime = 0;
var textSizeMult = 0.55;
var bigTextSize = (maxScreenHeight / 7.7) * textSizeMult;
var medTextSize = bigTextSize * 0.85;
var textGap = bigTextSize * 1.2;
var bigTextY = maxScreenHeight / 4.3;
var startX = 0;
var startY = 0;
var gameMode = null;
var playerConfig = {
	border: 6,
	textColor: "#efefef",
	textBorder: "#3a3a3a",
	textBorderSize: 3,
	defaultSize: 30,
};
var player = {
	firstReceive: true,
	dead: true,
	deltaX: 0,
	deltaY: 0,
	weapons: [],
};
var target = {
	f: 0,
	d: 0,
	dOffset: 0,
};
var gameObjects = [];
window.gameObjects = gameObjects;
var bullets = [];
var gameMap = null;
window.getGameMap = () => gameMap;
var mapTileScale = 0;
var leaderboard = [];
var keys = {
	u: 0,
	d: 0,
	l: 0,
	r: 0,
	lm: 0,
	s: 0,
	rl: 0,
};
var mathABS = Math.abs;
var mathRound = Math.round;
var mathFloor = Math.floor;
var mathSQRT = Math.sqrt;
var mathPOW = Math.pow;
var mathMIN = Math.min;
var mathCOS = Math.cos;
var mathSIN = Math.sin;
var mathPI = Math.PI;
var mathMax = Math.max;
var mathATAN2 = Math.atan2;
var reenviar = true;
var directionLock = false;
var directions = [];
var zipFileCloser;
var c = document.getElementById("cvs");
c.width = screenWidth;
c.height = screenHeight;
c.addEventListener("mousemove", gameInput, false);
c.addEventListener("mousedown", mouseDown, false);
c.addEventListener("drag", mouseDown, false);
c.addEventListener("click", focusGame, false);
c.addEventListener("mouseup", mouseUp, false);
var lastAngle = 0;
var lastDist = 0;
var targetChanged = true;
function focusGame(a) {
	c.focus();
}
let lastTarget;
function gameInput(a) {
	a.preventDefault();
	a.stopPropagation();
	var b = 0;
	if (getCurrentWeapon(player) != undefined) {
		b = getCurrentWeapon(player).yOffset;
	}
	mouseX = a.clientX;
	mouseY = a.clientY;
	lastAngle = target.f;
	lastDist = target.d;
	target.d = mathSQRT(
		mathPOW(mouseY - (screenHeight / 2 - b / 2), 2) +
			mathPOW(mouseX - screenWidth / 2, 2),
	);
	target.d *= mathMIN(
		maxScreenWidth / screenWidth,
		maxScreenHeight / screenHeight,
	);
	target.f = mathATAN2(
		screenHeight / 2 - b / 2 - mouseY,
		screenWidth / 2 - mouseX,
	);
	target.f = target.f.round(2);
	target.d = target.d.round(2);
	target.dOffset = (target.d / 4).round(1);
	if (lastAngle != target.f || lastDist != target.d) {
		targetChanged = true;
	}
	lastTarget = target.f;
}
function mouseDown(a) {
	a.preventDefault();
	a.stopPropagation();
	keys.lm = 1;
}
function mouseUp(a) {
	a.preventDefault();
	a.stopPropagation();
	keys.lm = 0;
}
if (c.addEventListener) {
	c.addEventListener("mousewheel", gameScroll, false);
	c.addEventListener("DOMMouseScroll", gameScroll, false);
} else {
	c.attachEvent("onmousewheel", gameScroll);
}
var userScroll = 0;
function gameScroll(a) {
	a = window.event || a;
	a.preventDefault();
	a.stopPropagation();
	userScroll = Math.max(-1, Math.min(1, a.wheelDelta || -a.detail)) * -1;
}
var keyMap = [];
var showingScoreBoard = false;
var keyToChange = null;
var keyChangeElement = null;
var keyCodeMap = {
	8: "backspace",
	9: "tab",
	13: "enter",
	16: "shift",
	17: "ctrl",
	18: "alt",
	19: "pausebreak",
	20: "capslock",
	27: "escape",
	32: "space",
	33: "pageup",
	34: "pagedown",
	35: "end",
	36: "home",
	37: "left",
	38: "up",
	39: "right",
	40: "down",
	43: "+",
	44: "printscreen",
	45: "insert",
	46: "delete",
	112: "f1",
	113: "f2",
	114: "f3",
	115: "f4",
	116: "f5",
	117: "f6",
	118: "f7",
	119: "f8",
	120: "f9",
	121: "f10",
	122: "f11",
	123: "f12",
	144: "numlock",
	145: "scrolllock",
};
var keysList = null;
function inputReset(a) {
	keysList = {
		upKey: 87,
		downKey: 83,
		leftKey: 65,
		rightKey: 68,
		reloadKey: 82,
		jumpKey: 32,
		sprayKey: 70,
		leaderboardKey: 16,
		chatToggleKey: 13,
		incWeapKey: 69,
		decWeapKey: 81,
	};
	updateKeysUI();
	if (a) {
		setCookie("customControls", JSON.stringify(keysList));
	}
}
inputReset(false);
var previousKeyElementContent = null;
function inputChange(a, b) {
	if (keyToChange != null && keyChangeElement != null) {
		keyChangeElement.innerHTML = previousKeyElementContent;
	}
	previousKeyElementContent = a.innerHTML;
	a.innerHTML = "Press any Key";
	keyChangeElement = a;
	keyToChange = b;
}
function getKeyName(a) {
	var b;
	b = keyCodeMap[a];
	if (b == undefined || !b.trim()) {
		b = String.fromCharCode(a);
	}
	return (b = b.charAt(0).toUpperCase() + b.slice(1));
}
function saveKeysToCookie() {
	setCookie("customControls", JSON.stringify(keysList));
}
if (getCookie("customControls") != "") {
	try {
		keysList = JSON.parse(getCookie("customControls"));
	} catch (a) {}
	if (keysList != undefined) {
		updateKeysUI();
	}
}
function updateKeysUI() {
	document.getElementById("upKeyCh").innerHTML = getKeyName(keysList.upKey);
	document.getElementById("downKeyCh").innerHTML = getKeyName(keysList.downKey);
	document.getElementById("leftKeyCh").innerHTML = getKeyName(keysList.leftKey);
	document.getElementById("rightKeyCh").innerHTML = getKeyName(
		keysList.rightKey,
	);
	document.getElementById("reloadKeyCh").innerHTML = getKeyName(
		keysList.reloadKey,
	);
	document.getElementById("jumpKeyCh").innerHTML = getKeyName(keysList.jumpKey);
	document.getElementById("sprayKeyCh").innerHTML = getKeyName(
		keysList.sprayKey,
	);
	document.getElementById("leaderboardKeyCh").innerHTML = getKeyName(
		keysList.leaderboardKey,
	);
	document.getElementById("chatToggleKeyCh").innerHTML = getKeyName(
		keysList.chatToggleKey,
	);
	document.getElementById("incWeapKeyCh").innerHTML = getKeyName(
		keysList.incWeapKey,
	);
	document.getElementById("decWeapKeyCh").innerHTML = getKeyName(
		keysList.decWeapKey,
	);
}
window.addEventListener("keydown", keyDown, false);
function keyDown(a) {
	a = a || event;
	if (keyToChange != null) {
		var b = keyCodeMap[a.keyCode];
		if (b == undefined || !b.trim()) {
			b = String.fromCharCode(a.keyCode);
		}
		if (b.trim()) {
			keyChangeElement.innerHTML = b.charAt(0).toUpperCase() + b.slice(1);
			keysList[keyToChange] = a.keyCode;
		} else {
			keyChangeElement.innerHTML = previousKeyElementContent;
		}
		keyChangeElement = keyToChange = null;
		saveKeysToCookie();
	} else if (c == document.activeElement) {
		a.preventDefault();
		keyMap[a.keyCode] = a.type == "keydown";
		if (a.keyCode == 27 && gameStart) {
			showESCMenu();
		}
		if (keyMap[keysList.upKey] && !keys.u) {
			keys.u = 1;
			keys.d = 0;
			keyMap[keysList.downKey] = false;
		}
		if (keyMap[keysList.downKey] && !keys.d) {
			keys.d = 1;
			keys.u = 0;
			keyMap[keysList.upKey] = false;
		}
		if (keyMap[keysList.leftKey] && !keys.l) {
			keys.l = 1;
			keys.r = 0;
			keyMap[keysList.rightKey] = false;
		}
		if (keyMap[keysList.rightKey] && !keys.r) {
			keys.r = 1;
			keys.l = 0;
			keyMap[keysList.leftKey] = false;
		}
		if (keyMap[keysList.jumpKey] && !keys.s) {
			keys.s = 1;
		}
		if (keyMap[keysList.reloadKey] && !keys.rl) {
			keys.rl = 1;
		}
		if (a.keyCode == keysList.chatToggleKey) {
			document.getElementById("chatInput").focus();
		}
		if (
			!!keyMap[keysList.leaderboardKey] &&
			!!gameStart &&
			!showingScoreBoard &&
			!player.dead &&
			!gameOver
		) {
			showingScoreBoard = true;
			showStatTable(getUsersList(), null, null, true, true, true);
		}
	}
}
c.addEventListener("keyup", keyUp, false);
function keyUp(a) {
	a = a || event;
	a.preventDefault();
	keyMap[a.keyCode] = a.type == "keydown";
	if (a.keyCode == keysList.upKey) {
		keys.u = 0;
	}
	if (a.keyCode == keysList.downKey) {
		keys.d = 0;
	}
	if (a.keyCode == keysList.leftKey) {
		keys.l = 0;
	}
	if (a.keyCode == keysList.rightKey) {
		keys.r = 0;
	}
	if (a.keyCode == keysList.jumpKey) {
		keys.s = 0;
	}
	if (a.keyCode == keysList.reloadKey) {
		keys.rl = 0;
	}
	if (a.keyCode == keysList.incWeapKey) {
		playerSwapWeapon(findUserByIndex(player.index), 1);
	}
	if (a.keyCode == keysList.decWeapKey) {
		playerSwapWeapon(findUserByIndex(player.index), -1);
	}
	if (a.keyCode == keysList.sprayKey) {
		sendSpray();
	}
	if (
		a.keyCode == keysList.leaderboardKey &&
		!!showingScoreBoard &&
		!player.dead &&
		!gameOver &&
		!gameOver
	) {
		hideStatTable();
	}
}
function ChatManager() {
	this.commands = {};
	var a = document.getElementById("chatInput");
	a.addEventListener("keypress", this.sendChat.bind(this));
	a.addEventListener("keyup", function (b) {
		a = document.getElementById("chatInput");
		b = b.which || b.keyCode;
		if (b === 27) {
			a.value = "";
			c.focus();
		}
	});
}
var chatTypeIndex = 0;
var chatTypes = ["ALL", "TEAM"];
var currentChatType = chatTypes[0];
ChatManager.prototype.sendChat = function (a) {
	var b = document.getElementById("chatInput");
	a = a.which || a.keyCode;
	if (a === 13) {
		a = b.value.replace(/(<([^>]+)>)/gi, "");
		if (a !== "") {
			socket.emit("cht", a.substring(0, 50), currentChatType);
			this.addChatLine(
				player.name,
				(currentChatType == "TEAM" ? "(TEAM) " : "") + a,
				true,
				player.team,
			);
			b.value = "";
			c.focus();
		}
	}
};
function toggleTeamChat() {
	chatTypeIndex++;
	if (chatTypeIndex >= chatTypes.length) {
		chatTypeIndex = 0;
	}
	currentChatType = chatTypes[chatTypeIndex];
	document.getElementById("chatType").innerHTML = currentChatType;
	c.focus();
}
var profanityList =
	"cunt whore shit fuck faggot nigger nigga dick vagina minge cock rape cum sex tits gay dumb penis clit pussy meatcurtain jizz prune douche wanker jerk".split(
		" ",
	);
var tmpString = "";
function checkProfanityString(a) {
	if (showProfanity) {
		for (var b = 0; b < profanityList.length; ++b) {
			if (a.indexOf(profanityList[b]) > -1) {
				tmpString = "";
				for (var d = 0; d < profanityList[b].length; ++d) {
					tmpString += "*";
				}
				a = a.replace(new RegExp(profanityList[b], "g"), tmpString);
			}
		}
	}
	return a;
}
var chatLineCounter = 0;
ChatManager.prototype.addChatLine = function (a, b, d, e) {
	if (!mobile) {
		b = checkProfanityString(b);
		var f = document.createElement("li");
		var h = "me";
		if (d || e == "system" || e == "notif") {
			if (e == "system") {
				h = "system";
			} else if (e == "notif") {
				h = "notif";
			}
		} else {
			h = player.team == e ? "blue" : "red";
		}
		chatLineCounter++;
		f.className = h;
		e = false;
		if (h == "system" || h == "notif") {
			f.innerHTML = "<span>" + b + "</span>";
		} else {
			e = true;
			f.innerHTML =
				"<span>" +
				(d ? "YOU" : a) +
				': </span><label id="chatLine' +
				chatLineCounter +
				'"></label>';
		}
		this.appendMessage(f);
		if (e) {
			if ("innerText" in document.createElement("span")) {
				document.getElementById("chatLine" + chatLineCounter).innerText = b;
			} else {
				document.getElementById("chatLine" + chatLineCounter).textContext = b;
			}
		}
	}
};
ChatManager.prototype.appendMessage = function (a) {
	if (!mobile) {
		for (
			var b = document.getElementById("chatbox"),
				d = document.getElementById("chatList");
			b.clientHeight > 260;
		) {
			d.removeChild(d.childNodes[0]);
		}
		d.appendChild(a);
	}
};
var chat = new ChatManager();
var tmpChatUser = null;
function messageFromServer(a) {
	try {
		tmpChatUser = findUserByIndex(a[0]);
		if (tmpChatUser != null) {
			if (tmpChatUser.index === player.index) return;
			chat.addChatLine(
				tmpChatUser.name,
				a[1],
				tmpChatUser.index == player.index,
				tmpChatUser.team,
			);
		} else if (a[0] == -1) {
			chat.addChatLine("", a[1], false, "system");
		} else {
			chat.addChatLine("", a[1], false, "notif");
		}
	} catch (b) {
		console.log(b);
	}
}
var context = c.getContext("2d");
var osCanvas = document.createElement("canvas");
var graph = context;
var mapCanvas = document.getElementById("mapc");
var mapContext = mapCanvas.getContext("2d");
mapCanvas.width = 200;
mapCanvas.height = 200;
mapContext.imageSmoothingEnabled = false;
mapContext.webkitImageSmoothingEnabled = false;
mapContext.mozImageSmoothingEnabled = false;
function setCookie(a, b) {
	if (typeof Storage !== "undefined") {
		localStorage.setItem(a, b);
	}
}
function getCookie(a) {
	if (
		typeof Storage !== "undefined" &&
		((a = localStorage.getItem(a)), a != null)
	) {
		return a;
	} else {
		return "";
	}
}
if (getCookie("showNames") != "false") {
	if (!document.getElementById("showNames").checked) {
		document.getElementById("showNames").click();
	}
}
var showNames = document.getElementById("showNames").checked;
function settingShowNames(a) {
	showNames = a.checked;
	setCookie("showNames", showNames ? "true" : "false");
}
if (getCookie("showParticles") != "false") {
	if (!document.getElementById("showParticles").checked) {
		document.getElementById("showParticles").click();
	}
}
var showParticles = document.getElementById("showParticles").checked;
function settingShowParticles(a) {
	showParticles = a.checked;
	setCookie("showParticles", showParticles ? "true" : "false");
}
if (getCookie("showTrippy") == "true") {
	if (!document.getElementById("showTrippy").checked) {
		document.getElementById("showTrippy").click();
	}
} else if (document.getElementById("showTrippy").checked) {
	document.getElementById("showTrippy").click();
}
var showTrippy = document.getElementById("showTrippy").checked;
function settingShowTrippy(a) {
	showTrippy = a.checked;
	setCookie("showTrippy", showTrippy ? "true" : "false");
}
if (getCookie("showSprays") != "false") {
	if (!document.getElementById("showSprays").checked) {
		document.getElementById("showSprays").click();
	}
}
var showSprays = document.getElementById("showSprays").checked;
function settingShowSprays(a) {
	showSprays = a.checked;
	setCookie("showSprays", showSprays ? "true" : "false");
}
if (
	getCookie("showProfanity") != "false" &&
	document.getElementById("showProfanity").checked
) {
	document.getElementById("showProfanity").click();
}
var showProfanity = document.getElementById("showProfanity").checked;
function settingProfanity(a) {
	showProfanity = a.checked;
	setCookie("showProfanity", showProfanity ? "true" : "false");
}
if (getCookie("showFade") != "false") {
	if (!document.getElementById("showFade").checked) {
		document.getElementById("showFade").click();
	}
}
var showUIFade = document.getElementById("showFade").checked;
function settingShowFade(a) {
	showUIFade = a.checked;
	setCookie("showFade", showUIFade ? "true" : "false");
}
if (getCookie("showShadows") != "false") {
	if (!document.getElementById("showShadows").checked) {
		document.getElementById("showShadows").click();
	}
}
var showShadows = document.getElementById("showShadows").checked;
function settingShowShadows(a) {
	showShadows = a.checked;
	setCookie("showShadows", showShadows ? "true" : "false");
}
if (getCookie("showGlows") != "false") {
	if (!document.getElementById("showGlows").checked) {
		document.getElementById("showGlows").click();
	}
}
var showGlows = document.getElementById("showGlows").checked;
function settingShowGlows(a) {
	showGlows = a.checked;
	setCookie("showGlows", showGlows ? "true" : "false");
}
if (getCookie("showBTrails") != "false") {
	if (!document.getElementById("showBTrails").checked) {
		document.getElementById("showBTrails").click();
	}
}
var showBTrails = document.getElementById("showBTrails").checked;
function settingShowBTrails(a) {
	showBTrails = a.checked;
	setCookie("showBTrails", showBTrails ? "true" : "false");
}
if (getCookie("showChat") != "false") {
	if (!document.getElementById("showChat").checked) {
		document.getElementById("showChat").click();
	}
}
var showChat = document.getElementById("showChat").checked;
function settingShowChat(a) {
	showChat = a.checked;
	if (showChat) {
		if (gameStart) {
			document.getElementById("chatbox").style.display = "block";
		}
	} else {
		document.getElementById("chatbox").style.display = "none";
	}
	setCookie("showChat", showChat ? "true" : "false");
}
if (getCookie("hideUI") != "false") {
	if (!document.getElementById("hideUI").checked) {
		document.getElementById("hideUI").click();
	}
}
var showUIALL = document.getElementById("hideUI").checked;
function settingHideUI(a) {
	showUIALL = a.checked;
	setCookie("hideUI", showUIALL ? "true" : "false");
}
if (getCookie("showPINGFPS") != "false") {
	if (!document.getElementById("showPingFps").checked) {
		document.getElementById("showPingFps").click();
	}
}
var showPINGFPS = document.getElementById("showPingFps").checked;
function settingShowPingFps(a) {
	showPINGFPS = a.checked;
	if (!showPINGFPS) {
		document.getElementById("conStatContainer").style.display = "none";
	}
	setCookie("showPINGFPS", showPINGFPS ? "true" : "false");
}
if (getCookie("showLeader") != "false") {
	if (!document.getElementById("showLeader").checked) {
		document.getElementById("showLeader").click();
	}
}
var showLeader = document.getElementById("showLeader").checked;
function settingShowLeader(a) {
	showLeader = a.checked;
	if (showLeader) {
		if (gameStart) {
			document.getElementById("status").style.display = "block";
		}
	} else {
		document.getElementById("status").style.display = "none";
	}
	setCookie("showLeader", showLeader ? "true" : "false");
}
if (getCookie("selectChat") == "true") {
	if (!document.getElementById("selectChat").checked) {
		document.getElementById("selectChat").click();
	}
}
var selectChat = document.getElementById("selectChat").checked;
settingSelectChat(document.getElementById("selectChat"));
function settingSelectChat(a) {
	selectChat = a.checked;
	setCookie("selectChat", selectChat ? "true" : "false");
	if (selectChat) {
		document.getElementById("chatList").style.pointerEvents = "auto";
	} else {
		document.getElementById("chatList").style.pointerEvents = "none";
	}
}
var targetFPS = 30;
if (getCookie("targetFPS") != "") {
	targetFPS = getCookie("targetFPS");
	try {
		targetFPS *= 1;
	} catch (a) {
		targetFPS = 30;
	}
	var fpsSelect = document.getElementById("fpsSelect");
	fpsSelect.value = targetFPS;
}
function pickedFps(a) {
	targetFPS = a.options[a.selectedIndex].value;
	try {
		targetFPS *= 1;
	} catch (b) {
		targetFPS = 30;
	}
	setCookie("targetFPS", targetFPS);
}
function changeMenuTab(a, b) {
	var d;
	var e;
	var f;
	e = document.getElementsByClassName("tabcontent");
	for (d = 0; d < e.length; d++) {
		e[d].style.display = "none";
	}
	f = document.getElementsByClassName("tablinks");
	for (d = 0; d < e.length; d++) {
		f[d].className = f[d].className.replace(" active", "");
	}
	document.getElementById(b).style.display = "block";
	a.currentTarget.className += " active";
}
console.log(changeMenuTab);
function kickPlayer(a) {
	if (!disconnected) {
		hideStatTable();
		hideUI(true);
		hideMenuUI();
		document.getElementById("startMenuWrapper").style.display = "none";
		gameOver = disconnected = true;
		if (reason == undefined) {
			reason = a;
		}
		kicked = true;
		socket.close();
		updateGameLoop();
		stopAllSounds();
	}
}
var classSelector = document.getElementById("classSelector");
var spraySelector = document.getElementById("spraySelector");
var hatSelector = document.getElementById("hatSelector");
var lobbySelector = document.getElementById("lobbySelector");
var camoSelector = document.getElementById("camoSelector");
var shirtSelector = document.getElementById("shirtSelector");
var lobbyCSelector = document.getElementById("lobbyCSelector");
var charSelectorCont = document.getElementById("charSelectorCont");
var lobbySelectorCont = document.getElementById("lobbySelectorCont");
function showLobbySelector() {
	charSelectorCont.style.display = "none";
	lobbySelectorCont.style.display = "none";
	classSelector.style.display = "none";
	lobbyCSelector.style.display = "none";
	camoSelector.style.display = "none";
	shirtSelector.style.display = "none";
	lobbySelector.style.display = "block";
}
window.showLobbySelector = showLobbySelector;
function hideLobbySelector() {
	charSelectorCont.style.display = "block";
	lobbySelectorCont.style.display = "block";
	lobbySelector.style.display = "none";
}
window.hideLobbySelector = hideLobbySelector;
function showLobbyCSelector() {
	charSelectorCont.style.display = "none";
	lobbySelectorCont.style.display = "none";
	classSelector.style.display = "none";
	lobbySelector.style.display = "none";
	camoSelector.style.display = "none";
	shirtSelector.style.display = "none";
	lobbyCSelector.style.display = "block";
}
window.showLobbyCSelector = showLobbyCSelector;
function hideLobbyCSelector() {
	charSelectorCont.style.display = "block";
	lobbySelectorCont.style.display = "block";
	lobbyCSelector.style.display = "none";
}
window.hideLobbyCSelector = hideLobbyCSelector;
var timeOutCheck = null;
var tmpPingTimer = null;
var pingText = document.getElementById("pingText");
var fpsText = document.getElementById("fpsText");
var pingStart = 0;
function receivePing() {
	var a = Date.now() - pingStart;
	pingText.innerHTML = "PING " + a;
}
var pingInterval = null;
function setupSocket(a: Socket) {
	a.onAny((event, ...args) => {
		if (["pong1"].includes(event)) return;
		console.info("%c <= ", "background:#FF6A19;color:#000", event, args);
	});
	a.onAnyOutgoing((event, ...args) => {
		if (["ping1", "0", "4"].includes(event)) return;
		console.info("%c => ", "background:#7F7;color:#000", event, args);
	});
	a.on("pong1", receivePing);
	if (pingInterval != null) {
		clearInterval(pingInterval);
	}
	pingInterval = setInterval(function () {
		pingStart = Date.now();
		a.emit("ping1");
	}, 2000);
	a.on("yourRoom", function (a, d) {
		room = a;
		serverKeyTxt.innerHTML = d;
	});
	a.on("connect_failed", function () {
		kickPlayer("Connection failed. Please check your internet connection.");
	});
	a.on("disconnect", function (a) {
		kickPlayer("Disconnected. Your connection timed out.");
		console.log(a);
	});
	a.on("error", function (a) {
		console.log("PLEASE NOTIFY THE DEVELOPER OF THE FOLLOWING ERROR");
		console.log("ERROR: " + a);
	});
	a.on("welcome", function (b, d) {
		player.id = b.id;
		player.room = b.room;
		room = player.room;
		player.name = playerName;
		player.classIndex = playerClassIndex;
		b.name = player.name;
		b.classIndex = playerClassIndex;
		a.emit("gotit", b, d, Date.now(), false);
		player.dead = true;
		if (d) {
			deactiveAllAnimTexts();
			gameStart = false;
			hideUI(false);
			document.getElementById("startMenuWrapper").style.display = "block";
		}
		if (gameOver) {
			document.getElementById("gameStatWrapper").style.display = "none";
		}
		gameOverFade = gameOver = false;
		targetChanged = true;
		if (mobile) {
			hideMenuUI();
			hideUI(true);
			document.getElementById("startMenuWrapper").style.display = "none";
		}
		resize();
	});
	a.on("cSrvRes", function (a, d) {
		if (d) {
			serverKeyTxt.innerHTML = a;
			serverCreateMessage.innerHTML = "Success. Created server with IP: " + a;
		} else {
			serverCreateMessage.innerHTML = a;
		}
	});
	a.on("regRes", function (a, d) {
		if (!d) {
			loginMessage.style.display = "block";
		}
		loginMessage.innerHTML = a;
	});
	a.on("logRes", function (a, d) {
		if (d) {
			loginMessage.style.display = "none";
			loginMessage.innerHTML = "";
			loginWrapper.style.display = "none";
			loggedInWrapper.style.display = "block";
			document.getElementById("playerNameInput").value = a.text;
			tmpLogKey = a.logKey;
			tmpUserName = a.text;
			setCookie("logKey", a.logKey);
			setCookie("userName", a.text);
			loggedIn = true;
			player.loggedIn = true;
			var b = findUserByIndex(player.index);
			if (b) {
				b.loggedIn = true;
			}
		} else {
			loginMessage.style.display = "block";
			loginMessage.innerHTML = a;
		}
		loadSavedClass();
	});
	a.on("recovRes", function (b, d) {
		loginMessage.style.display = "block";
		loginMessage.innerHTML = b;
		if (d) {
			document.getElementById("recoverForm").style.display = "block";
			var e = document.getElementById("chngPassKey");
			var f = document.getElementById("chngPassPass");
			document.getElementById("chngPassButton").onclick = function () {
				loginMessage.style.display = "block";
				loginMessage.innerHTML = "Please Wait...";
				a.emit("dbCngPass", {
					passKey: e.value,
					newPass: f.value,
				});
				a.on("cngPassRes", function (a, b) {
					loginMessage.style.display = "block";
					loginMessage.innerHTML = a;
					if (b) {
						document.getElementById("recoverForm").style.display = "none";
					}
				});
			};
		}
	});
	a.on("dbClanCreateR", function (a, d) {
		if (d) {
			clanSignUp.style.display = "none";
			clanStats.style.display = "block";
			clanHeader.innerHTML = "[" + a + "] Clan:";
			clanAdminPanel.style.display = "block";
			leaveClanButton.style.display = "inline-block";
			leaveClanButton.innerHTML = "DELETE CLAN";
		} else {
			clanDBMessage.style.display = "block";
			clanDBMessage.innerHTML = a;
		}
	});
	a.on("dbClanJoinR", function (a, d) {
		if (d) {
			clanSignUp.style.display = "none";
			clanStats.style.display = "block";
			clanHeader.innerHTML = "[" + a + "] Clan:";
			player.account.clan = a;
			var b = findUserByIndex(player.index);
			if (b) {
				b.account.clan = a;
			}
			leaveClanButton.style.display = "inline-block";
			leaveClanButton.innerHTML = "Leave Clan";
		} else {
			clanDBMessage.style.display = "block";
			clanDBMessage.innerHTML = a;
		}
	});
	a.on("dbClanInvR", function (a, d) {
		clanInvMessage.style.display = "block";
		clanInvMessage.innerHTML = a;
	});
	a.on("dbKickInvR", function (a, d) {
		clanInvMessage.style.display = "block";
		clanInvMessage.innerHTML = a;
	});
	a.on("dbClanLevR", function (a, d) {
		if (d) {
			clanSignUp.style.display = "block";
			clanStats.style.display = "none";
			clanHeader.innerHTML = "Clans";
			clanDBMessage.style.display = "block";
			clanDBMessage.innerHTML = a;
			leaveClanButton.style.display = "none";
		}
	});
	a.on("dbChatR", function (a, d) {
		clanChtMessage.style.display = "inline-block";
		clanChtMessage.innerHTML = a.text;
		if (d) {
			if (!a.newURL.match(/^https?:\/\//i)) {
				a.newURL = "http://" + a.newURL;
			}
			clanChatLink.innerHTML =
				"<a target='_blank' href='" + a.newURL + "'>Clan Chat</a>";
		}
	});
	a.on("dbChangeUserR", function (a, d) {
		if (d) {
			setCookie("userName", a);
			player.account.user_name = a;
			editProfileMessage.innerHTML = "Success. Account Updated.";
		} else {
			editProfileMessage.innerHTML = a;
		}
	});
	a.on("dbClanStats", function (a) {
		updateClanPage(a);
	});
	a.on("updAccStat", function (a) {
		updateAccountPage(a);
	});
	a.on("gameSetup", function (a, d, e) {
		a = JSON.parse(a);
		if (d) {
			gameMap = a.mapData;
			gameMap.tiles = [];
			gameWidth = gameMap.width;
			gameHeight = gameMap.height;
			mapTileScale = a.tileScale;
			gameObjects = a.usersInRoom;
			for (d = 0; d < gameObjects.length; ++d) {
				gameObjects[d].type = "player";
			}
			gameMode = gameMap.gameMode;
			if (a.you.team == "blue") {
				document.getElementById("gameModeText").innerHTML = gameMode.desc2;
			} else {
				document.getElementById("gameModeText").innerHTML = gameMode.desc1;
			}
			currentLikeButton = "";
			var b = null;
			for (d = 0; d < gameMap.clutter.length; ++d) {
				b = gameMap.clutter[d];
				b.type = "clutter";
				gameObjects.push(b);
			}
			setupMap(gameMap);
			cachedMiniMap = null;
			deactivateSprays();
			for (d = 0; d < 100; ++d) {
				bullets.push(new Projectile());
			}
		}
		if (e) {
			gameStart = true;
			showUI();
			document.getElementById("cvs").focus();
		}
		keys.lm = 0;
		maxScreenHeight = a.maxScreenHeight * a.viewMult;
		maxScreenWidth = a.maxScreenWidth * a.viewMult;
		viewMult = a.viewMult;
		a.you.type = "player";
		player = a.you;
		e = findUserByIndex(a.you.index);
		if (e != null) {
			gameObjects[gameObjects.indexOf(e)] = a.you;
		} else {
			gameObjects.push(a.you);
		}
		updateWeaponUI(player, true);
		if (inMainMenu) {
			$("#loadingWrapper").fadeOut(0, function () {});
			inMainMenu = false;
		}
		startingGame = false;
		resize();
	});
	a.on("lb", updateLeaderboard);
	a.on("ts", updateTeamScores);
	a.on("rsd", receiveServerData);
	a.on("upd", updateUserValue);
	a.on("vt", updateVoteStats);
	a.on("add", addUser);
	a.on("updHt", updateHatList);
	a.on("updShrt", updateShirtList);
	a.on("updCmo", updateCamosList);
	a.on("updSprs", updateSpraysList);
	a.on("crtSpr", createSpray);
	a.on("rem", removeUser);
	a.on("cht", messageFromServer);
	a.on("kick", function (a) {
		kickPlayer(a);
	});
	a.on("1", function (a) {
		var b = findUserByIndex(a.gID);
		var e = mathABS(a.amount);
		if (
			(a.dID != player.index || a.gID == player.index) &&
			a.amount <= 0 &&
			a.gID == player.index &&
			e != 0
		) {
			screenShake(e / 2, a.dir);
		}
		if (
			a.dID != null &&
			a.dID == player.index &&
			b != null &&
			e > 0 &&
			b.onScreen
		) {
			if (a.amount < 0) {
				startMovingAnimText(
					e + "",
					b.x - b.width / 2,
					b.y - b.height,
					"#d95151",
					e / 10,
				);
			} else {
				startMovingAnimText(
					e + "",
					b.x - b.width / 2,
					b.y - b.height,
					"#5ed951",
					e / 10,
				);
			}
		}
		if (a.bi != null) {
			e = findServerBullet(a.bi);
			if (e != undefined && e.owner.index != player.index) {
				if (b.onScreen && a.amount < 0) {
					particleCone(
						12,
						b.x,
						b.y - b.height / 2 - b.jumpY,
						e.dir + mathPI,
						mathPI / randomInt(5, 7),
						0.5,
						16,
						0,
						true,
					);
					createLiquid(b.x, b.y, e.dir, 4);
				}
				e.active = false;
			}
		}
		if (b != null) {
			b.health = a.h;
			if (b.index == player.index) {
				updatePlayerInfo(b);
				updateUiStats(b);
			}
		}
	});
	a.on("2", someoneShot);
	a.on("jum", otherJump);
	a.on("ex", createExplosion);
	a.on("r", function (a) {
		var b = findUserByIndex(player.index);
		if (b != null) {
			/*
      if (b.weapons[a].ammo == b.weapons[a].maxAmmo) {
        showNotification("Ammo Full");
      }
      */
			b.weapons[a].reloadTime = 0;
			b.weapons[a].ammo = b.weapons[a].maxAmmo;
			setCooldownAnimation(a, b.weapons[a].reloadTime, false);
			updateUiStats(b);
		}
	});
	a.on("3", function (a) {
		var b = findUserByIndex(a.gID);
		var e = findUserByIndex(a.dID);
		b.dead = true;
		if (a.kB && a.gID != player.index) {
			if (a.dID == player.index) {
				startBigAnimText(
					"BOSS SLAIN",
					a.sS + " POINTS",
					2000,
					true,
					"#ffffff",
					"#5151d9",
					true,
					1.25,
				);
			} else {
				showNotification(e.name + " slayed the boss");
			}
		} else if (a.dID == player.index && a.gID != player.index) {
			playSound("kill1", e.x, e.y);
			var f = "";
			if (b.team != e.team) {
				a.sS = "+" + a.sS;
				f =
					a.kd <= 1 || a.kd == undefined
						? "Enemy Killed"
						: a.kd == 2
							? "Double Kill"
							: a.kd == 3
								? "Triple Kill"
								: a.kd == 4
									? "Multi Kill"
									: a.kd == 5
										? "Ultra Kill"
										: a.kd == 6
											? "No Way!"
											: a.kd == 7
												? "Stop!"
												: "Godlike!";
			} else {
				f = "Team Kill";
				a.sS = "no";
			}
			if (a.ast) {
				f = "Kill Assist";
			}
			startBigAnimText(
				f,
				a.sS + " POINTS",
				2000,
				true,
				"#ffffff",
				"#5151d9",
				true,
				1.25,
			);
		}
		if (a.gID == player.index) {
			hideStatTable();
			gameStart = false;
			hideUI(false);
			player.dead = true;
			try {
				googletag.pubads().refresh();
			} catch (h) {}
			window.setTimeout(function () {
				if (!gameOver) {
					document.getElementById("startMenuWrapper").style.display = "block";
					document.getElementById("linkBox").style.display = "block";
				}
			}, 1300);
			playSound("death1", player.x, player.y);
			startSoundTrack(1);
		}
	});
	a.on("4", function (a, d, e) {
		if (e == 0) {
			if (gameMap != null && a.active != undefined) {
				gameMap.pickups[d].active = a.active;
			}
		} else {
			for (e = 0; e < gameObjects.length; ++e) {
				if (gameObjects[e].type == "clutter" && gameObjects[e].indx == d) {
					if (a.active != undefined) {
						gameObjects[e].active = a.active;
					}
					if (a.x != undefined) {
						gameObjects[e].x = a.x;
					}
					if (a.y != undefined) {
						gameObjects[e].y = a.y;
					}
				}
			}
		}
	});
	a.on("tprt", function (a) {
		var b = findUserByIndex(a.indx);
		if (b != undefined) {
			b.x = a.newX;
			b.y = a.newY;
			createSmokePuff(b.x, b.y, 5, false, 1);
			if (a.indx == player.index) {
				player.x = a.newX;
				player.y = a.newY;
				startBigAnimText(
					"ZONE ENTERED",
					"+" + a.scor + " POINTS",
					2000,
					true,
					"#ffffff",
					"#5151d9",
					true,
					1.3,
				);
			} else {
				createSmokePuff(a.oldX, a.oldY, 5, false, 1);
				showNotification(b.name + " scored");
			}
		}
	});
	a.on("5", function (a) {
		showNotification(a);
	});
	a.on("6", function (a, d, e) {
		if (!player.dead) {
			startBigAnimText(a, d, 2000, true, "#ffffff", "#5151d9", true, e);
		}
	});
	a.on("7", function (a, d, e, f) {
		try {
			gameOver = true;
			document.getElementById("startMenuWrapper").style.display = "none";
			showStatTable(d, e, a, false, f, true);
			startSoundTrack(1);
		} catch (h) {
			console.log(h);
		}
		try {
			googletag.pubads().refresh();
		} catch (h) {}
	});
	a.on("8", function (a) {
		document.getElementById("nextGameTimer").innerHTML =
			a + ": UNTIL NEXT ROUND";
	});
}
function likePlayerStat(a) {
	socket.emit("like", a);
}
function updateVoteStats(a) {
	document.getElementById("votesText" + a.i).innerHTML = a.n + ": " + a.v;
}
function showESCMenu() {
	deactiveAllAnimTexts();
	gameStart = false;
	hideUI(false);
	document.getElementById("startMenuWrapper").style.display = "block";
}
var buttonCount = 0;
function showStatTable(a, b, d, e, f, h) {
	buttonCount = 0;
	if (h) {
		hideUI(false);
		if (e) {
			nextGameTimer.innerHTML = "GAME STATS";
			document.getElementById("winningTeamText").innerHTML = "";
			document.getElementById("voteModeContainer").innerHTML = "";
		} else {
			d = player.team == d || player.id == d;
			if (!f) {
				if (d) {
					startBigAnimText(
						"Victory",
						"Well Played!",
						2500,
						true,
						"#5151d9",
						"#ffffff",
						false,
						2,
					);
					document.getElementById("winningTeamText").innerHTML = "VICTORY";
					document.getElementById("winningTeamText").style.color = "#5151d9";
				} else if (player.team != "") {
					startBigAnimText(
						"Defeat",
						"Bad Luck!",
						2500,
						true,
						"#d95151",
						"#ffffff",
						false,
						2,
					);
					document.getElementById("winningTeamText").innerHTML = "DEFEAT";
					document.getElementById("winningTeamText").style.color = "#d95151";
				}
			}
			if (b != null) {
				document.getElementById("voteModeContainer").innerHTML = "";
				for (var g = 0; g < b.length; ++g) {
					d = document.createElement("button");
					d.className = "modeVoteButton";
					d.setAttribute("id", "votesText" + g);
					d.innerHTML = b[g].name + ": " + b[g].votes;
					document.getElementById("voteModeContainer").appendChild(d);
					d.onclick = (function (a, d) {
						return function () {
							c.focus();
							socket.emit("modeVote", a.indx);
							for (var e = 0; e < b.length; ++e) {
								if (
									d == e &&
									document.getElementById("votesText" + e).className ==
										"modeVoteButton"
								) {
									document.getElementById("votesText" + e).className =
										"modeVoteButtonA";
								} else {
									document.getElementById("votesText" + e).className =
										"modeVoteButton";
								}
							}
						};
					})(b[g], g);
				}
			}
		}
	}
	try {
		document.getElementById("gameStatBoard").innerHTML = "";
		addRowToStatTable(
			[
				{
					text: "NAME",
					className: "headerL",
					color: "#fff",
				},
				{
					text: "SCORE",
					className: "headerC",
					color: "#fff",
				},
				{
					text: "KILLS",
					className: "headerC",
					color: "#fff",
				},
				{
					text: "DEATHS",
					className: "headerC",
					color: "#fff",
				},
				{
					text: "DAMAGE",
					className: "headerC",
					color: "#fff",
				},
				{
					text: gameMode.code == "zmtch" ? "GOALS" : "HEALING",
					className: "headerC",
					color: "#fff",
				},
				{
					text: "REWARD",
					className: "headerC",
					color: "#fff",
				},
				{
					text: "",
					className: "headerC",
					color: "#fff",
				},
			],
			true,
		);
		for (g = 0; g < a.length; ++g) {
			if (a[g].team != "") {
				addRowToStatTable(
					[
						{
							text: a[g].name,
							className: "contL",
							canClick: a[g].loggedIn,
							color:
								a[g].index == player.index
									? "#fff"
									: a[g].team != player.team
										? "#d95151"
										: "#5151d9",
							id: null,
							userInfo: findUserByIndex(a[g].index),
						},
						{
							text: a[g].score || 0,
							className: "contC",
							color: "#fff",
							id: null,
						},
						{
							text: a[g].kills || 0,
							className: "contC",
							color: "#fff",
							id: null,
						},
						{
							text: a[g].deaths || 0,
							className: "contC",
							color: "#fff",
							id: null,
						},
						{
							text: a[g].totalDamage || 0,
							className: "contC",
							color: "#fff",
							id: null,
						},
						{
							text:
								gameMode.code == "zmtch"
									? a[g].totalGoals || 0
									: a[g].totalHealing || 0,
							className: "contC",
							color: "#fff",
							id: null,
						},
						{
							text: a[g].lastItem != null ? a[g].lastItem.name : "No Reward",
							className: "rewardText",
							color:
								a[g].lastItem != null
									? getItemRarityColor(a[g].lastItem.chance)
									: "#fff",
							id: null,
							hoverInfo: a[g].lastItem,
						},
						{
							text: a[g].likes || 0,
							className: "contC",
							color: "#fff",
							pos: a[g].index,
							id: "likeStat" + a[g].index,
							uID: a[g].id,
						},
					],
					false,
				);
			}
		}
		if (h) {
			if (f) {
				overlayAlpha = overlayMaxAlpha;
				animateOverlay = false;
				gameOverFade = true;
				deactiveAllAnimTexts();
				document.getElementById("gameStatWrapper").style.display = "block";
			} else {
				hideStatTable();
				hideUI(false);
				animateOverlay = true;
				window.setTimeout(function () {
					gameOverFade = true;
				}, 2500);
				window.setTimeout(function () {
					document.getElementById("gameStatWrapper").style.display = "block";
				}, 4500);
			}
		}
	} catch (l) {}
}
function hideStatTable() {
	showUI();
	overlayAlpha = 0;
	showingScoreBoard = false;
	animateOverlay = true;
	drawOverlay(graph, false, true);
	document.getElementById("gameStatWrapper").style.display = "none";
	document.getElementById("linkBox").style.display = "none";
}
function addRowToStatTable(a, b) {
	var d = document.getElementById("gameStatBoard");
	var e = document.createElement("tr");
	for (var f = 0; f < a.length; ++f) {
		var h = document.createElement("td");
		if (b || f != a.length - 1) {
			l = document.createTextNode(a[f].text);
			h.appendChild(l);
			h.className = a[f].className;
			h.style.color = a[f].color;
			if (a[f].hoverInfo != undefined) {
				var g = document.createElement("div");
				g.className = "hoverTooltip";
				l = "";
				l =
					a[f].hoverInfo.type == "hat"
						? "<image class='itemDisplayImage' src='.././images/hats/" +
							a[f].hoverInfo.id +
							"/d.png'></image><div style='color:" +
							a[f].color +
							"; font-size:16px; margin-top:5px;'>" +
							a[f].hoverInfo.name +
							"</div><div style='color:#ffd100; font-size:12px; margin-top:0px;'>droprate " +
							a[f].hoverInfo.chance +
							"%</div>" +
							(a[f].hoverInfo.duplicate
								? "<div style='font-size:8px; color:#e04141; margin-top:1px;'><i>Duplicate</i></div>"
								: "<div style='font-size:8px; color:#d8d8d8; margin-top:1px;'><i>wearable</i></div>") +
							"<div style='font-size:12px; margin-top:5px;'>" +
							a[f].hoverInfo.desc +
							"</div>" +
							(a[f].hoverInfo.creator == "EatMyApples"
								? ""
								: "<div style='font-size:8px; color:#d8d8d8; margin-top:5px;'><i>Artist: " +
									a[f].hoverInfo.creator +
									"</i></div>")
						: a[f].hoverInfo.type == "shirt"
							? "<image class='shirtDisplayImage' src='.././images/shirts/" +
								a[f].hoverInfo.id +
								"/d.png'></image><div style='color:" +
								a[f].color +
								"; font-size:16px; margin-top:5px;'>" +
								a[f].hoverInfo.name +
								"</div><div style='color:#ffd100; font-size:12px; margin-top:0px;'>droprate " +
								a[f].hoverInfo.chance +
								"%</div>" +
								(a[f].hoverInfo.duplicate
									? "<div style='font-size:8px; color:#e04141; margin-top:1px;'><i>Duplicate</i></div>"
									: "<div style='font-size:8px; color:#d8d8d8; margin-top:1px;'><i>shirt</i></div>") +
								"<div style='font-size:12px; margin-top:5px;'>" +
								a[f].hoverInfo.desc +
								"</div>"
							: "<image class='camoDisplayImage' src='.././images/camos/" +
								(a[f].hoverInfo.id + 1) +
								".png'></image><div style='color:" +
								a[f].color +
								"; font-size:16px; margin-top:5px;'>" +
								a[f].hoverInfo.name +
								"</div><div style='color:#ffd100; font-size:12px; margin-top:0px;'>droprate " +
								a[f].hoverInfo.chance +
								"%</div>" +
								(a[f].hoverInfo.duplicate
									? "<div style='font-size:8px; color:#e04141; margin-top:1px;'><i>Duplicate</i></div>"
									: "<div style='font-size:8px; color:#d8d8d8; margin-top:1px;'><i>weapon camo</i></div>") +
								"<div style='font-size:12px; margin-top:5px;'>" +
								a[f].hoverInfo.weaponName +
								"</div>";
				g.innerHTML = l;
				h.appendChild(g);
			}
			if (h.className == "contL" && a[f].canClick) {
				h.userTarget = a[f].text;
				h.addEventListener("click", function (a) {
					showUserStatPage(a.target.userTarget);
				});
			}
		} else {
			var g = document.createElement("button");
			var l = document.createTextNode(" NICE");
			g.appendChild(l);
			g.setAttribute("type", "button");
			var m = a[f];
			g.tmpCont = m;
			g.onclick = function () {
				c.focus();
				likePlayerStat(m.pos);
				for (var a = 0; a < buttonCount; ++a) {
					document
						.getElementById("gameStatLikeButton" + a)
						.setAttribute("class", "gameStatLikeButton");
				}
				if (currentLikeButton != this.tmpCont.uID) {
					currentLikeButton = this.tmpCont.uID;
					this.setAttribute("class", "gameStatLikeButtonA");
				} else {
					currentLikeButton = "";
				}
			};
			g.setAttribute("id", "gameStatLikeButton" + buttonCount);
			buttonCount++;
			if (m.uID == currentLikeButton) {
				g.setAttribute("class", "gameStatLikeButtonA");
			} else {
				g.setAttribute("class", "gameStatLikeButton");
			}
			g.style.display = m.pos == player.index ? "none" : "block";
			e.appendChild(g);
			l = document.createElement("div");
			l.innerHTML = a[f].text;
			if (a[f].id != null) {
				l.setAttribute("id", a[f].id);
			}
			h.appendChild(l);
			h.className = a[f].className;
			h.style.color = a[f].color;
		}
		e.appendChild(h);
	}
	d.appendChild(e);
}
function addUser(a) {
	a = JSON.parse(a);
	if (a.index != player.index) {
		a.type = "player";
		var b = findUserByIndex(a.index);
		if (b == null) {
			gameObjects.push(a);
		} else {
			gameObjects[gameObjects.indexOf(b)] = a;
		}
	}
}
function removeUser(a) {
	if (a != player.index) {
		tmpUser = findUserByIndex(a);
		if (tmpUser != null) {
			gameObjects.splice(gameObjects.indexOf(tmpUser), 1);
		}
	}
}
function updateUiStats(a) {
	document.getElementById("scoreValue").innerHTML = a.score;
	if (a.weapons.length > 0) {
		document.getElementById("ammoValue").innerHTML = getCurrentWeapon(a).ammo;
	}
	document.getElementById("healthValue").innerHTML = a.health;
	if (a.health <= 10) {
		document.getElementById("healthValue").style.color = "#e06363";
	} else {
		document.getElementById("healthValue").style.color = "#fff";
	}
}
function getItemRarityColor(a) {
	if (a <= 1) {
		return "#ff8000";
	} else if (a <= 6) {
		return "#a335ee";
	} else if (a <= 18) {
		return "#0070dd";
	} else if (a <= 45) {
		return "#1eff00";
	} else {
		return "#9d9d9d";
	}
}
let tmpUser;
function updateUserValue(a) {
	var b = false;
	tmpUser = findUserByIndex(a.i);
	if (tmpUser != null) {
		if (a.s != undefined) {
			tmpUser.score = a.s;
			b = true;
		}
		if (a.sp != undefined) {
			tmpUser.spawnProtection = a.sp;
		}
		if (a.wi != undefined && a.i != player.index) {
			playerEquipWeapon(tmpUser, a.wi);
		}
		if (a.l != undefined) {
			tmpUser.likes = a.l;
			b = true;
		}
		if (a.dea != undefined) {
			tmpUser.deaths = a.dea;
			b = true;
		}
		if (a.kil != undefined) {
			tmpUser.kills = a.kil;
			b = true;
		}
		if (a.dmg != undefined) {
			tmpUser.totalDamage = a.dmg;
			b = true;
		}
		if (a.hea != undefined) {
			tmpUser.totalHealing = a.hea;
			b = true;
		}
		if (tmpUser.index == player.index) {
			updatePlayerInfo(tmpUser);
			updateUiStats(tmpUser);
		}
		if (b) {
			if (gameOver) {
				if (a.l != undefined) {
					a = document.createTextNode(tmpUser.likes);
					document.getElementById("likeStat" + tmpUser.index).innerHTML = "";
					document.getElementById("likeStat" + tmpUser.index).appendChild(a);
				}
			} else {
				showStatTable(getUsersList(), null, null, true, true, false);
			}
		}
	} else {
		fetchUserWithIndex(a.i);
	}
}
function fetchUserWithIndex(a) {
	socket.emit("ftc", a);
}
function canPlaceFlag(a, b) {
	if (b) {
		return a != undefined && !a.wall && !a.hardPoint;
	} else {
		return a != undefined && !a.hardPoint;
	}
}
function setupMap(a) {
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
		}
	}
}
var tmpNowTime = 0;
function receiveServerData(a) {
	tmpNowTime = Date.now();
	timeSinceLastUpdate = tmpNowTime - timeOfLastUpdate;
	timeOfLastUpdate = tmpNowTime;
	var b;
	if (!gameOver) {
		for (var d = 0; d < gameObjects.length; ++d) {
			if (gameObjects[d].type == "player") {
				gameObjects[d].onScreen = false;
			}
		}
		for (d = 0; d < a.length; ) {
			b = a[0 + d];
			tmpUser = findUserByIndex(a[1 + d]);
			if (a[1 + d] == player.index && tmpUser != null) {
				if (b > 2) {
					tmpUser.x = a[2 + d];
				}
				if (b > 3) {
					tmpUser.y = a[3 + d];
				}
				if (b > 4) {
					tmpUser.angle = a[4 + d];
				}
				if (b > 5) {
					tmpUser.isn = a[5 + d];
				}
				tmpUser.onScreen = true;
			} else if (tmpUser != null) {
				if (b > 2) {
					tmpUser.xSpeed = mathABS(tmpUser.x - a[2 + d]);
					tmpUser.x = a[2 + d];
				}
				if (b > 3) {
					tmpUser.ySpeed = mathABS(tmpUser.y - a[3 + d]);
					tmpUser.y = a[3 + d];
				}
				if (b > 4) {
					tmpUser.angle = a[4 + d];
				}
				if (getCurrentWeapon(tmpUser) != undefined) {
					var e = mathRound((tmpUser.angle % 360) / 90) * 90;
					if (e == 0 || e == 360) {
						getCurrentWeapon(tmpUser).front = true;
					} else if (e == 180) {
						getCurrentWeapon(tmpUser).front = false;
					} else {
						getCurrentWeapon(tmpUser).front = true;
					}
				}
				//TODO: nameYOffset for other players
				//if (b > 5) {
				//  tmpUser.nameYOffset = a[5 + d];
				//}
				tmpUser.onScreen = true;
			} else {
				fetchUserWithIndex(a[1 + d]);
			}
			d += b;
		}
	}
	for (d = 0; d < gameObjects.length; d++) {
		if (gameObjects[d].index == player.index) {
			if (gameObjects[d].dead || gameOver || thisInput.length > 80) {
				thisInput.length = 0;
			}
			var f = 0;
			if (!gameObjects[d].dead) {
				while (f < thisInput.length) {
					if (thisInput[f].isn <= gameObjects[d].isn) {
						thisInput.splice(f, 1);
					} else {
						a = thisInput[f].hdt;
						b = thisInput[f].vdt;
						//e = mathSQRT(
						//  thisInput[f].hdt * thisInput[f].hdt +
						//  thisInput[f].vdt * thisInput[f].vdt
						//);
						//if (e != 0) {
						//  a /= e;
						//  b /= e;
						//}
						//TODO: double check if this is a real fix
						gameObjects[d].oldX = gameObjects[d].x;
						gameObjects[d].oldY = gameObjects[d].y;
						gameObjects[d].x += a * gameObjects[d].speed * thisInput[f].delta;
						gameObjects[d].y += b * gameObjects[d].speed * thisInput[f].delta;
						wallCol(gameObjects[d], gameMap, gameObjects);
						f++;
					}
				}
				gameObjects[d].x = mathRound(gameObjects[d].x);
				gameObjects[d].y = mathRound(gameObjects[d].y);
				updatePlayerInfo(gameObjects[d]);
			}
		}
	}
}
function updatePlayerInfo(a) {
	player.x = a.x;
	player.y = a.y;
	player.dead = a.dead;
	if (player.score < a.score) {
		playSound("score", player.x, player.y);
	}
	player.score = a.score;
	player.health = a.health;
}
var currentHat = document.getElementById("currentHat");
var hatList = document.getElementById("hatList");
var hatHeader = document.getElementById("hatHeader");
function updateHatList(a, b) {
	var d = "SELECT HAT: (" + b.length + "/" + a + ")";
	hatHeader.innerHTML = d;
	var d =
		"<div class='hatSelectItem' id='hatItem-1' onclick='changeHat(-1);'>Default</div>";
	for (var e = 0; e < b.length; ++e) {
		d +=
			"<div class='hatSelectItem' id='hatItem" +
			b[e].id +
			"' style='color:" +
			getItemRarityColor(b[e].chance) +
			";' onclick='changeHat(" +
			b[e].id +
			");'>" +
			b[e].name +
			" x" +
			(parseInt(b[e].count) + 1) +
			"<div class='hoverTooltip'><image class='itemDisplayImage' src='.././images/hats/" +
			b[e].id +
			"/d.png'></image><div style='color:" +
			getItemRarityColor(b[e].chance) +
			"; font-size:16px; margin-top:5px;'>" +
			b[e].name +
			"</div><div style='color:#ffd100; font-size:12px; margin-top:0px;'>droprate " +
			b[e].chance +
			"%</div><div style='font-size:8px; color:#d8d8d8; margin-top:1px;'><i>wearable</i></div><div style='font-size:12px; margin-top:5px;'>" +
			b[e].desc +
			"</div>" +
			(b[e].creator == "EatMyApples"
				? ""
				: "<div style='font-size:8px; color:#d8d8d8; margin-top:5px;'><i>Artist: " +
					b[e].creator +
					"</i></div>") +
			"</div></div>";
	}
	hatList.innerHTML = d;
}
function resetHatList() {
	hatHeader.innerHTML = "SELECT HAT";
	hatList.innerHTML =
		"<div class='hatSelectItem' id='hatItem-1' onclick='changeHat(-1);'>Default</div>";
	changeHat(-1);
}
function showHatselector() {
	charSelectorCont.style.display = "none";
	lobbySelectorCont.style.display = "none";
	camoSelector.style.display = "none";
	shirtSelector.style.display = "none";
	classSelector.style.display = "none";
	lobbySelector.style.display = "none";
	lobbyCSelector.style.display = "none";
	spraySelector.style.display = "none";
	hatSelector.style.display = "block";
}
function changeHat(a) {
	if (socket != undefined) {
		socket.emit("cHat", a);
		setCookie("previousHat", a);
		currentHat.innerHTML = document.getElementById("hatItem" + a).innerHTML;
		currentHat.style.color = document.getElementById("hatItem" + a).style.color;
		charSelectorCont.style.display = "block";
		lobbySelectorCont.style.display = "block";
		classSelector.style.display = "none";
		camoSelector.style.display = "none";
		shirtSelector.style.display = "none";
		hatSelector.style.display = "none";
		lobbySelector.style.display = "none";
		lobbyCSelector.style.display = "none";
	}
}
var currentShirt = document.getElementById("currentShirt");
var shirtList = document.getElementById("shirtList");
var shirtHeader = document.getElementById("shirtHeader");
function updateShirtList(a, b) {
	var d = "SELECT SHIRT: (" + b.length + "/" + a + ")";
	shirtHeader.innerHTML = d;
	var d =
		"<div class='hatSelectItem' id='shirtItem-1' onclick='changeShirt(-1);'>Default</div>";
	for (var e = 0; e < b.length; ++e) {
		d +=
			"<div class='hatSelectItem' id='shirtItem" +
			b[e].id +
			"' style='color:" +
			getItemRarityColor(b[e].chance) +
			";' onclick='changeShirt(" +
			b[e].id +
			");'>" +
			b[e].name +
			" x" +
			(parseInt(b[e].count) + 1) +
			"<div class='hoverTooltip'><image class='shirtDisplayImage' src='.././images/shirts/" +
			b[e].id +
			"/d.png'></image><div style='color:" +
			getItemRarityColor(b[e].chance) +
			"; font-size:16px; margin-top:5px;'>" +
			b[e].name +
			"</div><div style='color:#ffd100; font-size:12px; margin-top:0px;'>droprate " +
			b[e].chance +
			"%</div><div style='font-size:8px; color:#d8d8d8; margin-top:1px;'><i>shirt</i></div><div style='font-size:12px; margin-top:5px;'>" +
			b[e].desc +
			"</div></div></div>";
	}
	shirtList.innerHTML = d;
}
function resetShirtList() {
	shirtHeader.innerHTML = "SELECT SHIRT";
	shirtList.innerHTML =
		"<div class='hatSelectItem' id='shirtItem-1' onclick='changeShirt(-1);'>Default</div>";
	changeShirt(-1);
}
function showShirtselector() {
	charSelectorCont.style.display = "none";
	lobbySelectorCont.style.display = "none";
	camoSelector.style.display = "none";
	classSelector.style.display = "none";
	lobbySelector.style.display = "none";
	lobbyCSelector.style.display = "none";
	spraySelector.style.display = "none";
	hatSelector.style.display = "none";
	shirtSelector.style.display = "block";
}
function changeShirt(a) {
	if (socket != undefined) {
		socket.emit("cShirt", a);
		setCookie("previousShirt", a);
		currentShirt.innerHTML = document.getElementById("shirtItem" + a).innerHTML;
		currentShirt.style.color = document.getElementById(
			"shirtItem" + a,
		).style.color;
		charSelectorCont.style.display = "block";
		lobbySelectorCont.style.display = "block";
		classSelector.style.display = "none";
		camoSelector.style.display = "none";
		shirtSelector.style.display = "none";
		hatSelector.style.display = "none";
		lobbySelector.style.display = "none";
		lobbyCSelector.style.display = "none";
	}
}
var currentSpray = document.getElementById("currentSpray");
var sprayList = document.getElementById("sprayList");
function updateSpraysList(a) {
	var b = "";
	for (var d = 0; d < a.length; ++d) {
		b +=
			"<div class='hatSelectItem' id='sprayItem" +
			(d + 1) +
			"' onclick='changeSpray(" +
			(d + 1) +
			"," +
			a[d].id +
			");'>" +
			a[d].name +
			"<div id='sprayHoverImage" +
			(d + 1) +
			"' class='hoverTooltip' style='width:90px;height:90px;'></div></div>";
	}
	sprayList.innerHTML = b;
	if (getCookie("previousSpray") != "") {
		previousSpray = getCookie("previousSpray");
		try {
			changeSpray(previousSpray, a[parseInt(previousSpray) - 1].id);
		} catch (e) {
			changeSpray(1, a[1].id);
		}
	} else {
		changeSpray(1, a[1].id);
	}
}
window.updateSpraysList = updateSpraysList;
function showSprayselector() {
	charSelectorCont.style.display = "none";
	lobbySelectorCont.style.display = "none";
	classSelector.style.display = "none";
	lobbySelector.style.display = "none";
	lobbyCSelector.style.display = "none";
	camoSelector.style.display = "none";
	shirtSelector.style.display = "none";
	hatSelector.style.display = "none";
	spraySelector.style.display = "block";
}
window.showSprayselector = showSprayselector;
function changeSpray(a, b) {
	if (socket != undefined) {
		socket.emit("cSpray", a);
		setCookie("previousSpray", a);
		currentSpray.innerHTML = document.getElementById("sprayItem" + a).innerHTML;
		currentSpray.style.color = document.getElementById(
			"sprayItem" + a,
		).style.color;
		document.getElementById("sprayHoverImage" + a).innerHTML =
			"<image class='sprayDisplayImage' src='.././images/sprays/" +
			b +
			".png'></image>";
		charSelectorCont.style.display = "block";
		lobbySelectorCont.style.display = "block";
		classSelector.style.display = "none";
		camoSelector.style.display = "none";
		shirtSelector.style.display = "none";
		hatSelector.style.display = "none";
		spraySelector.style.display = "none";
		lobbySelector.style.display = "none";
		lobbyCSelector.style.display = "none";
	}
}
window.changeSpray = changeSpray;
function findUserByIndex(a) {
	for (var b = 0; b < gameObjects.length; ++b) {
		if (gameObjects[b].index === a) {
			return gameObjects[b];
		}
	}
	return null;
}
var tmpUsers = [];
function getUsersList() {
	for (var a = (tmpUsers.length = 0); a < gameObjects.length; ++a) {
		if (gameObjects[a].type == "player") {
			tmpUsers.push(gameObjects[a]);
		}
	}
	tmpUsers.sort(sortUsersByScore);
	return tmpUsers;
}
function sortUsersByScore(a, b) {
	if (b.score == a.score) {
		if (a.id < b.id) {
			return -1;
		} else if (a.id > b.id) {
			return 1;
		} else {
			return 0;
		}
	} else if (a.score > b.score) {
		return -1;
	} else if (a.score < b.score) {
		return 1;
	} else {
		return 0;
	}
}
function sortUsersByPosition(a, b) {
	if (a.y < b.y) {
		return -1;
	} else if (a.y > b.y) {
		return 1;
	} else {
		return 0;
	}
}
var tmpPlayer = null;
function updateLeaderboard(a) {
	try {
		var b = '<span class="title">LEADERBOARD</span>';
		var d = 1;
		for (var e = 0; e < a.length; ++e) {
			tmpPlayer = findUserByIndex(a[0 + e]);
			if (tmpPlayer != null) {
				b += "<br />";
				if (tmpPlayer.index == player.index) {
					b +=
						'<span class="me">' +
						d +
						". " +
						player.name +
						(player.account.clan != ""
							? " [" + player.account.clan + "]"
							: "") +
						"</span>";
				} else if (tmpPlayer.name != "") {
					b +=
						'<span class="' +
						(tmpPlayer.team != player.team ? "red" : "blue") +
						'">' +
						d +
						". " +
						tmpPlayer.name +
						"</span>" +
						(tmpPlayer.account.clan != ""
							? "<span class='me'> [" + tmpPlayer.account.clan + "]</span>"
							: "");
				}
				d++;
			}
		}
		document.getElementById("status").innerHTML = b;
	} catch (f) {}
}
function updateTeamScores(a, b) {
	var d = document.getElementById("redProgress");
	var e = document.getElementById("blueText");
	var f = document.getElementById("blueProgress");
	var h = document.getElementById("redProgCont");
	if (gameMode != undefined) {
		try {
			if (gameMode.teams) {
				e.innerHTML = "A";
				h.style.display = "";
				if (player.team == "red") {
					d.setAttribute("style", "display:block;width:" + b + "%");
					d.style.width = b + "%";
					f.setAttribute("style", "display:block;width:" + a + "%");
					f.style.width = a + "%";
				} else {
					d.setAttribute("style", "display:block;width:" + a + "%");
					d.style.width = a + "%";
					f.setAttribute("style", "display:block;width:" + b + "%");
					f.style.width = b + "%";
				}
			} else {
				b = mathRound((player.score / a) * 100);
				f.setAttribute("style", "display:block;width:" + b + "%");
				f.style.width = b + "%";
				e.innerHTML = "YOU";
				h.style.display = "none";
			}
		} catch (g) {
			console.log(g);
		}
	}
}
function showUI() {
	if (showUIALL) {
		document.getElementById("status").style.display = "block";
		document.getElementById("statContainer2").style.display = "block";
		document.getElementById("actionBar").style.display = "block";
		document.getElementById("statContainer").style.display = "block";
		document.getElementById("score").style.display = "block";
		if (showPINGFPS) {
			document.getElementById("conStatContainer").style.display = "block";
		}
		if (!showLeader) {
			document.getElementById("status").style.display = "none";
		}
	}
	if (showChat) {
		document.getElementById("chatbox").style.display = "block";
	}
}
function hideMenuUI() {
	document.getElementById("namesBox").style.display = "none";
	document.getElementById("linkBox").style.display = "none";
}
function hideUI(a) {
	document.getElementById("status").style.display = "none";
	document.getElementById("statContainer2").style.display = "none";
	document.getElementById("actionBar").style.display = "none";
	document.getElementById("conStatContainer").style.display = "none";
	document.getElementById("score").style.display = "none";
	document.getElementById("statContainer").style.display = "none";
	if (a) {
		document.getElementById("chatbox").style.display = "none";
	}
}
// $(window).focus(function () {
//   if (socket != undefined) {
//     socket.emit("5", 1);
//   }
//   tabbed = 0;
// });
// $(window).blur(function () {
//   if (socket != undefined) {
//     socket.emit("5", 0);
//   }
//   tabbed = 1;
// });
var sendData = null;
var fpsUpdateUICounter = 0;
function updateGameLoop() {
	delta = currentTime - oldTime;
	fpsUpdateUICounter--;
	if (fpsUpdateUICounter <= 0) {
		currentFPS = mathRound(1000 / delta);
		fpsText.innerHTML = "FPS " + currentFPS;
		fpsUpdateUICounter = targetFPS;
	}
	oldTime = currentTime;
	horizontalDT = verticalDT = 0;
	count++;
	var a = 0;
	if (keys.u == 1) {
		verticalDT = -1;
		temp = 0;
	}
	if (keys.d == 1) {
		verticalDT = 1;
		temp = 0;
	}
	if (keys.r == 1) {
		horizontalDT = 1;
		temp = 0;
	}
	if (keys.l == 1) {
		horizontalDT = -1;
		temp = 0;
	} else {
		keyd = 0;
	}
	if (keys.s == 1) {
		a = 1;
		temp = 0;
	}
	var b = horizontalDT;
	var d = verticalDT;
	//var e = mathSQRT(horizontalDT * horizontalDT + verticalDT * verticalDT);
	//if (e != 0) {
	//  b /= e;
	//  d /= e;
	//}
	if (clientPrediction) {
		for (let e = 0; e < gameObjects.length; e++) {
			if (gameObjects[e].type == "player") {
				if (gameObjects[e].index == player.index) {
					gameObjects[e].oldX = gameObjects[e].x;
					gameObjects[e].oldY = gameObjects[e].y;
					if (!gameObjects[e].dead && !gameOver) {
						gameObjects[e].x += b * gameObjects[e].speed * delta;
						gameObjects[e].y += d * gameObjects[e].speed * delta;
					}
					wallCol(gameObjects[e], gameMap, gameObjects);
					gameObjects[e].x = mathRound(gameObjects[e].x);
					gameObjects[e].y = mathRound(gameObjects[e].y);
					gameObjects[e].angle =
						((target.f + mathPI * 2) % (mathPI * 2)) * (180 / mathPI) + 90;
					if (getCurrentWeapon(gameObjects[e]) != undefined) {
						var f = mathRound((gameObjects[e].angle % 360) / 90) * 90;
						if (f == 0 || f == 360) {
							getCurrentWeapon(gameObjects[e]).front = true;
						} else if (f == 180) {
							getCurrentWeapon(gameObjects[e]).front = false;
						} else {
							getCurrentWeapon(gameObjects[e]).front = true;
						}
					}
					if (gameObjects[e].jumpCountdown > 0) {
						gameObjects[e].jumpCountdown -= delta;
					}
					if (keys.s == 1 && gameObjects[e].jumpCountdown <= 0 && !gameOver) {
						playerJump(gameObjects[e]);
					}
				}
				if (gameObjects[e].jumpY != 0) {
					gameObjects[e].jumpDelta -= gameObjects[e].gravityStrength * delta;
					gameObjects[e].jumpY += gameObjects[e].jumpDelta * delta;
					if (gameObjects[e].jumpY > 0) {
						gameObjects[e].animIndex = 1;
					} else {
						gameObjects[e].jumpY = 0;
						gameObjects[e].jumpDelta = 0;
						gameObjects[e].jumpCountdown = 250;
					}
					gameObjects[e].jumpY = mathRound(gameObjects[e].jumpY);
				}
				if (gameObjects[e].index == player.index && !gameOver) {
					sendData = {
						hdt: b,
						vdt: d,
						ts: currentTime,
						isn: inputNumber,
						s: a,
					};
					inputNumber++;
					sendData.delta = delta;
					thisInput.push(sendData);
					socket.emit("4", sendData);
					if (userScroll != 0 && !gameOver) {
						playerSwapWeapon(gameObjects[e], userScroll);
						userScroll = 0;
					}
					if (keys.rl == 1 && !gameOver) {
						playerReload(gameObjects[e], true);
					}
					if (keys.lm == 1 && !gameOver && player.weapons.length > 0) {
						keyd = 0;
						if (
							currentTime - getCurrentWeapon(gameObjects[e]).lastShot >=
							getCurrentWeapon(gameObjects[e]).fireRate
						) {
							shootBullet(gameObjects[e]);
						}
					}
				}
				if (gameOver) {
					gameObjects[e].animIndex = 0;
				} else {
					f = mathABS(b) + mathABS(d);
					if (gameObjects[e].index != player.index) {
						f = mathABS(gameObjects[e].xSpeed) + mathABS(gameObjects[e].ySpeed);
					}
					if (f > 0) {
						gameObjects[e].frameCountdown -= delta / 4;
						if (gameObjects[e].frameCountdown <= 0) {
							gameObjects[e].animIndex++;
							if (
								gameObjects[e].jumpY == 0 &&
								gameObjects[e].onScreen &&
								!gameObjects[e].dead
							) {
								stillDustParticle(gameObjects[e].x, gameObjects[e].y, false);
							}
							if (gameObjects[e].animIndex >= 3) {
								gameObjects[e].animIndex = 1;
							} else if (
								gameObjects[e].animIndex == 2 &&
								gameObjects[e].jumpY <= 0
							) {
								playSound("step1", gameObjects[e].x, gameObjects[e].y);
							}
							gameObjects[e].frameCountdown = 40;
						}
					} else if (gameObjects[e].animIndex != 0) {
						gameObjects[e].animIndex = 0;
					}
					if (gameObjects[e].jumpY > 0) {
						gameObjects[e].animIndex = 1;
					}
				}
			}
		}
	}
	gameObjects.sort(sortUsersByPosition);
	if (!kicked) {
		if (gameOver) {
			doGame(delta);
			if (gameOverFade && showUIFade) {
				drawOverlay(graph, true, false);
			}
		} else if (player.dead && !inMainMenu) {
			doGame(delta);
			drawOverlay(graph, true, false);
		} else if (gameStart) {
			doGame(delta);
			drawOverlay(graph, false, true);
			if (!mobile && targetChanged) {
				targetChanged = false;
				socket.emit("0", target.f);
			}
		} else if (!kicked) {
			drawMenuBackground();
			drawOverlay(graph, false, false);
		}
	}
	if (disconnected || kicked) {
		drawOverlay(graph, false, false);
		a = kicked
			? reason !== ""
				? renderShadedAnimText(reason, viewMult * 48, "#ffffff", 6, "")
				: renderShadedAnimText(
						"You were kicked",
						viewMult * 48,
						"#ffffff",
						6,
						"",
					)
			: renderShadedAnimText("Disconnected", viewMult * 48, "#ffffff", 6, "");
		if (a != undefined) {
			graph.drawImage(
				a,
				maxScreenWidth / 2 - a.width / 2,
				maxScreenHeight / 2 - a.height / 2,
				a.width,
				a.height,
			);
		}
	}
	if (showTrippy) {
		context.globalAlpha = 0.25;
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
					canSee(b.x - startX, b.y - startY, b.w, b.h) &&
					a.x + a.width / 2 >= b.x &&
					a.x - a.width / 2 <= b.x + b.w &&
					a.y >= b.y - b.h * b.tp &&
					a.y <= b.y
				) {
					if (a.oldX + player.width / 2 <= b.x) {
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
function otherJump(a) {
	var b = findUserByIndex(a);
	if (b != undefined && b != null && player.index != a) {
		playerJump(b);
	}
}
function playerJump(a) {
	if (a.jumpY <= 0) {
		playSound("jump1", a.x, a.y);
		a.jumpDelta = a.jumpStrength;
		a.jumpY = a.jumpDelta;
	}
}
var overlayMaxAlpha = 0.5;
var overlayAlpha = overlayMaxAlpha;
var overlayFadeUp = 0.01;
var overlayFadeDown = 0.04;
var animateOverlay = true;
function drawOverlay(a, b, d) {
	if (animateOverlay) {
		if (b) {
			overlayAlpha += overlayFadeUp;
			if (overlayAlpha >= overlayMaxAlpha) {
				overlayAlpha = overlayMaxAlpha;
			}
		} else if (d) {
			overlayAlpha -= overlayFadeDown;
			if (overlayAlpha <= 0) {
				overlayAlpha = 0;
			}
		} else {
			overlayAlpha = overlayMaxAlpha;
		}
	}
	if (overlayAlpha > 0) {
		a.fillStyle = "#2e3031";
		a.globalAlpha = overlayAlpha;
		a.fillRect(0, 0, maxScreenWidth, maxScreenHeight);
		a.globalAlpha = 1;
	}
}
var drawMiniMapFPS = 4;
var drawMiniMapCounter = 0;
function doGame(a) {
	updateScreenShake(a);
	if (target != null) {
		startX =
			player.x -
			maxScreenWidth / 2 +
			-screenSkX +
			target.dOffset * mathCOS(target.f + mathPI);
		startY =
			player.y -
			20 -
			maxScreenHeight / 2 +
			-screenSkY +
			target.dOffset * mathSIN(target.f + mathPI);
		if (fillCounter > 1 && socket) {
			socket.emit("kil");
		}
	}
	drawBackground();
	drawMap(0);
	drawMap(1);
	drawSprays();
	updateParticles(a, 0);
	drawGameObjects(a);
	updateBullets(a);
	updateParticles(a, 1);
	drawMap(2);
	drawPlayerNames();
	drawEdgeShader();
	drawGameLights(a);
	updateAnimTexts(a);
	updateNotifications(a);
	drawUI();
	drawMiniMapCounter--;
	if (drawMiniMapCounter <= 0 && gameStart) {
		fillCounter = 0;
		drawMiniMapCounter = drawMiniMapFPS;
		drawMiniMap();
	}
}
window.addEventListener("resize", resize);
function resize() {
	screenWidth = mathRound(window.innerWidth);
	screenHeight = mathRound(window.innerHeight);
	calculateUIScale();
	var a = Math.max(
		screenWidth / maxScreenWidth,
		screenHeight / maxScreenHeight,
	);
	c.width = screenWidth;
	c.height = screenHeight;
	graph.setTransform(
		a,
		0,
		0,
		a,
		(screenWidth - maxScreenWidth * a) / 2,
		(screenHeight - maxScreenHeight * a) / 2,
	);
	document.getElementById("startMenuWrapper").style.transform =
		"perspective(1px) translate(-50%, -50%) scale(" + uiScale + ")";
	document.getElementById("gameStatWrapper").style.transform =
		"perspective(1px) translate(-50%, -50%) scale(" + uiScale + ")";
	graph.imageSmoothingEnabled = false;
	graph.webkitImageSmoothingEnabled = false;
	graph.mozImageSmoothingEnabled = false;
	drawMenuBackground();
}
resize();
var grd = null;
function drawEdgeShader() {
	try {
		if (grd == null) {
			grd = graph.createRadialGradient(
				player.x - startX,
				player.y - startY,
				0,
				player.x - startX,
				player.y - startY,
				maxScreenWidth / 2,
			);
			grd.addColorStop(0, "rgba(0,0,0,0.0)");
			grd.addColorStop(1, "rgba(0,0,0,0.4");
		}
		graph.fillStyle = grd;
		graph.fillRect(0, 0, maxScreenWidth, maxScreenHeight);
	} catch (a) {}
}
var tmpObject = null;
var tmpBulletGlowWidth = 0;
var tmpBulletGlowHeight = 0;
var lightX = 0;
var lightY = 0;
var glowIntensity = 0.2;
var flashGlows = [];
var glowIndex = 0;
for (var i = 0; i < 30; ++i) {
	flashGlows.push(new FlashGlow());
}
function FlashGlow() {
	this.initScale = this.scale = this.y = this.x = 0;
	this.active = false;
	this.maxDuration = this.duration = 0;
	this.update = function (a) {
		if (this.active && this.maxDuration > 0) {
			this.duration += a;
			this.tmpScale = 1 - this.duration / this.maxDuration;
			this.tmpScale = this.tmpScale < 0 ? 0 : this.tmpScale;
			this.scale = this.initScale * this.tmpScale;
			if (this.scale < 1) {
				this.active = false;
			}
			if (this.duration >= this.maxDuration) {
				this.active = false;
			}
		}
	};
	this.draw = function () {
		if (this.active) {
			graph.drawImage(
				lightSprite,
				this.x - startX - this.scale / 2,
				this.y - startY - this.scale / 2,
				this.scale,
				this.scale,
			);
		}
	};
}
var tmpGlow = null;
function createFlash(a, b, d) {
	glowIndex++;
	if (glowIndex >= flashGlows.length) {
		glowIndex = 0;
	}
	tmpGlow = flashGlows[glowIndex];
	tmpGlow.x = a;
	tmpGlow.y = b;
	tmpGlow.scale = 0;
	tmpGlow.initScale = d * 220;
	tmpGlow.duration = 0;
	tmpGlow.maxDuration = 180;
	tmpGlow.active = true;
}
function drawGameLights(a) {
	if (lightSprite != null) {
		graph.globalCompositeOperation = "lighter";
		graph.globalAlpha = 0.2;
		for (var b = 0; b < bullets.length; b++) {
			tmpObject = bullets[b];
			if (showGlows && tmpObject.spriteIndex != 2 && tmpObject.active) {
				tmpBulletGlowWidth =
					tmpObject.glowWidth || mathMIN(200, tmpObject.width * 14);
				tmpBulletGlowHeight = tmpObject.glowHeight || tmpObject.height * 2.5;
				lightX = tmpObject.x - startX;
				lightY = tmpObject.y - startY;
				if (canSee(lightX, lightY, tmpBulletGlowWidth, tmpBulletGlowHeight)) {
					graph.save();
					graph.translate(lightX, lightY);
					drawSprite(
						graph,
						lightSprite,
						-(tmpBulletGlowWidth / 2),
						-(tmpBulletGlowHeight / 2) + tmpObject.height / 2,
						tmpBulletGlowWidth,
						tmpBulletGlowHeight,
						tmpObject.dir - mathPI / 2,
						false,
						0,
						0,
						0,
					);
					graph.restore();
				}
			}
		}
		if (showGlows) {
			graph.globalAlpha = 0.2;
			b = 0;
			for (; b < flashGlows.length; ++b) {
				tmpObject = flashGlows[b];
				tmpObject.update(a);
				tmpObject.draw();
			}
		}
		graph.globalCompositeOperation = "source-over";
	}
}
var mapScale = mapCanvas.width;
var pingScale = mapScale / 80;
mapContext.lineWidth = pingScale / 2;
var pingFade = 0.085;
var pingGrow = 0.4;
var cachedMiniMap = null;
function getCachedMiniMap() {
	fillCounter++;
	if (
		cachedMiniMap == null &&
		gameMap != undefined &&
		gameMap.tiles.length > 0
	) {
		var a = document.createElement("canvas");
		var b = a.getContext("2d");
		a.width = mapScale;
		a.height = mapScale;
		b.fillStyle = "#fff";
		for (var d = 0; d < gameMap.tiles.length; ++d) {
			if (gameMap.tiles[d].wall) {
				b.fillRect(
					(gameMap.tiles[d].x / gameWidth) * mapScale,
					(gameMap.tiles[d].y / gameHeight) * mapScale,
					((mapTileScale * 1.08) / gameWidth) * mapScale,
					((mapTileScale * 1.08) / gameWidth) * mapScale,
				);
			}
		}
		var b = document.createElement("canvas");
		var e = b.getContext("2d");
		b.width = mapScale;
		b.height = mapScale;
		e.globalAlpha = 0.1;
		e.drawImage(a, 0, 0);
		e.globalAlpha = 1;
		for (d = 0; d < gameMap.tiles.length; ++d) {
			if (gameMap.tiles[d].hardPoint) {
				e.fillStyle =
					gameMap.tiles[d].objTeam == player.team ? "#5151d9" : "#d95151";
				e.fillRect(
					(gameMap.tiles[d].x / gameWidth) * mapScale,
					(gameMap.tiles[d].y / gameHeight) * mapScale,
					((mapTileScale * 1.08) / gameWidth) * mapScale,
					((mapTileScale * 1.08) / gameWidth) * mapScale,
				);
			}
		}
		cachedMiniMap = b;
	}
	return cachedMiniMap;
}
function drawMiniMap() {
	mapCanvas.width = mapCanvas.width;
	var a = getCachedMiniMap();
	if (a != null) {
		mapContext.drawImage(a, 0, 0, mapScale, mapScale);
	}
	mapContext.globalAlpha = 1;
	for (a = 0; a < gameObjects.length; ++a) {
		if (
			gameObjects[a].type == "player" &&
			gameObjects[a].onScreen &&
			(gameObjects[a].index == player.index ||
				gameObjects[a].team == player.team ||
				gameObjects[a].isBoss)
		) {
			mapContext.fillStyle =
				gameObjects[a].index == player.index
					? "#fff"
					: gameObjects[a].isBoss
						? "#db4fcd"
						: "#5151d9";
			mapContext.beginPath();
			mapContext.arc(
				(gameObjects[a].x / gameWidth) * mapScale,
				(gameObjects[a].y / gameHeight) * mapScale,
				pingScale,
				0,
				mathPI * 2,
				true,
			);
			mapContext.closePath();
			mapContext.fill();
		}
	}
	if (gameMap != null) {
		mapContext.globalAlpha = 1;
		a = 0;
		for (; a < gameMap.pickups.length; ++a) {
			if (gameMap.pickups[a].active) {
				if (gameMap.pickups[a].type == "lootcrate") {
					mapContext.fillStyle = "#ffd100";
				} else if (gameMap.pickups[a].type == "healthpack") {
					mapContext.fillStyle = "#5ed951";
				}
				mapContext.beginPath();
				mapContext.arc(
					(gameMap.pickups[a].x / gameWidth) * mapScale,
					(gameMap.pickups[a].y / gameHeight) * mapScale,
					pingScale,
					0,
					mathPI * 2,
					true,
				);
				mapContext.closePath();
				mapContext.fill();
			}
		}
	}
}
function calculateUIScale() {
	uiScale =
		((screenHeight + screenWidth) /
			(originalScreenWidth + originalScreenHeight)) *
		1.25;
}
function drawMenuBackground() {}
function IsImageOk(a) {
	if (a.complete && a.naturalWidth !== 0) {
		return true;
	} else {
		return false;
	}
}
function drawUI() {}
var screenSkX = 0;
var screenShackeScale = 0;
var screenSkY = 0;
var screenSkRed = 0.5;
var screenSkDir = 0;
function screenShake(a, b) {
	if (screenShackeScale < a) {
		screenShackeScale = a;
		screenSkDir = b;
	}
}
function updateScreenShake(a) {
	if (screenShackeScale > 0) {
		screenSkX = screenShackeScale * mathCOS(screenSkDir);
		screenSkY = screenShackeScale * mathSIN(screenSkDir);
		screenShackeScale *= screenSkRed;
		if (screenShackeScale <= 0.1) {
			screenShackeScale = 0;
		}
	}
}
var userSprays = [];
var tmpSpray = (tmpPlayer = null);
var cachedSprays = [];
function createSpray(a, b, d) {
	tmpPlayer = findUserByIndex(a);
	if (tmpPlayer != null) {
		tmpSpray = null;
		for (var e = 0; e < userSprays.length; ++e) {
			if (userSprays[e].owner == a) {
				tmpSpray = userSprays[e];
				break;
			}
		}
		if (tmpSpray == null) {
			var f = new Image();
			f.owner = a;
			f.active = false;
			f.xPos = 0;
			f.yPos = 0;
			f.onload = function () {
				cacheSpray(f);
			};
			userSprays.push(f);
			tmpSpray = f;
		}
		tmpSpray.active = true;
		tmpSpray.scale = tmpPlayer.spray.info.scale;
		tmpSpray.alpha = tmpPlayer.spray.info.alpha;
		tmpSpray.resolution = tmpPlayer.spray.info.resolution;
		tmpSpray.xPos = b - tmpSpray.scale / 2;
		tmpSpray.yPos = d - tmpSpray.scale / 2;
		if (tmpSpray.src != tmpPlayer.spray.src) {
			tmpSpray.src = tmpPlayer.spray.src;
		}
	}
}
function sendSpray() {
	socket.emit("crtSpr");
}
function deactivateSprays() {
	for (var a = 0; a < userSprays.length; ++a) {
		userSprays[a].active = false;
	}
}
var tmpIndex = 0;
function cacheSpray(a) {
	tmpIndex = "" + a.src;
	tmpSpray = cachedSprays[tmpIndex];
	if (tmpSpray == undefined && a.width != 0) {
		var b = document.createElement("canvas");
		var d = b.getContext("2d");
		b.width = a.resolution;
		b.height = a.resolution;
		d.drawImage(a, 0, 0, a.resolution, a.resolution);
		var d = document.createElement("canvas");
		var e = d.getContext("2d");
		d.width = a.scale;
		d.height = a.scale;
		e.imageSmoothingEnabled = false;
		e.webkitImageSmoothingEnabled = false;
		e.mozImageSmoothingEnabled = false;
		e.globalAlpha = a.alpha;
		e.drawImage(b, 0, 0, a.scale, a.scale);
		tmpSpray = d;
		cachedSprays[tmpIndex] = tmpSpray;
	}
}
function drawSprays() {
	if (showSprays) {
		for (var a = 0; a < userSprays.length; ++a) {
			if (userSprays[a].active) {
				tmpSpray = cachedSprays["" + userSprays[a].src];
				if (tmpSpray != undefined) {
					graph.drawImage(
						tmpSpray,
						userSprays[a].xPos - startX,
						userSprays[a].yPos - startY,
					);
				}
			}
		}
	}
}
var tmpList = [];
var soundList = [
	{
		loc: "weapons/smg",
		id: "shot0",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/revolver",
		id: "shot1",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/sniper",
		id: "shot2",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/toygun",
		id: "shot3",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/shotgun",
		id: "shot4",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/grenades",
		id: "shot5",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/rockets",
		id: "shot6",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/pistol",
		id: "shot7",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/minigun",
		id: "shot8",
		sound: null,
		loop: false,
	},
	{
		loc: "weapons/flamethrower",
		id: "shot9",
		sound: null,
		loop: false,
	},
	{
		loc: "characters/footstep1",
		id: "step1",
		sound: null,
		loop: false,
	},
	{
		loc: "characters/jump1",
		id: "jump1",
		sound: null,
		loop: false,
	},
	{
		loc: "characters/death1",
		id: "death1",
		sound: null,
		loop: false,
	},
	{
		loc: "characters/kill1",
		id: "kill1",
		sound: null,
		loop: false,
	},
	{
		loc: "special/explosion",
		id: "explosion",
		sound: null,
		loop: false,
	},
	{
		loc: "special/score",
		id: "score",
		sound: null,
		loop: false,
	},
	{
		loc: "tracks/track1",
		id: "track1",
		sound: null,
		loop: true,
		onload: function () {
			tmpList.track1.sound.play();
			if (!player.dead || startingGame) {
				tmpList.track1.sound.mute();
			} else {
				currentTrack = 1;
			}
		},
	},
	{
		loc: "tracks/track2",
		id: "track2",
		sound: null,
		loop: true,
		onload: function () {
			tmpList.track2.sound.play();
			if (player.dead || !gameStart || gameOver) {
				tmpList.track2.sound.mute();
			} else {
				currentTrack = 2;
			}
		},
	},
];
var tmpSound = null;
var tmpFormat = null;
var doSounds = false;
function loadSounds(a) {
	if (!doSounds) {
		return false;
	}
	tmpList = [];
	for (var b = 0; b < soundList.length; ++b) {
		tmpSound = localStorage.getItem(a + soundList[b].loc + "data");
		tmpFormat = localStorage.getItem(a + soundList[b].loc + "format");
		loadSound(tmpSound, soundList[b], tmpFormat);
	}
}
function loadSound(a, b, d) {
	if (tmpList[b.id] != undefined && tmpList[b.id].sound != null) {
		tmpList[b.id].sound.stop();
	}
	tmpList[b.id] = b;
	tmpList[b.id].sound = new Howl({
		urls: [a],
		format: [d],
		loop: b.loop,
		onload: b.onload || function () {},
	});
}
var currentTrack = 0;
function startSoundTrack(a) {
	if (!doSounds || tmpList.track1 == undefined || tmpList.track2 == undefined) {
		return false;
	}
	try {
		if (a == 1) {
			if (currentTrack != a) {
				currentTrack = a;
				tmpList.track1.sound.fade(0, 1, 1000);
			}
			tmpList.track2.sound.mute();
		} else {
			if (currentTrack != a) {
				currentTrack = a;
				tmpList.track2.sound.fade(0, 1, 1000);
			}
			tmpList.track1.sound.mute();
		}
	} catch (b) {
		console.log(b);
	}
}
var maxHearDist = 1500;
var tmpDist = 0;
function playSound(a, b, d) {
	if (!kicked && doSounds) {
		try {
			tmpDist = getDistance(player.x, player.y, b, d);
			if (tmpDist <= maxHearDist) {
				tmpSound = tmpList[a];
				if (tmpSound != undefined) {
					tmpSound = tmpSound.sound;
					tmpSound.volume(mathRound((1 - tmpDist / maxHearDist) * 10) / 10);
					tmpSound.play();
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
}
function stopAllSounds() {
	if (!doSounds) {
		return false;
	}
	for (var a = 0; a < soundList.length; ++a) {
		tmpList[soundList[a].id].sound.stop();
	}
}
var spritesLoaded = false;
var spriteIndex = 0;
var tmpPicture = null;
function getSprite(a) {
	var b = new Image();
	b.index = spriteIndex;
	b.flipped = false;
	b.isLoaded = false;
	b.onload = function () {
		b.isLoaded = true;
		b.onload = null;
	};
	b.onerror = function () {
		b.isLoaded = false;
		console.log("File not Found: " + a + ".png");
	};
	try {
		tmpPicture = localStorage.getItem(a + ".png");
		b.src = tmpPicture;
		b.crossOrigin = "anonymous";
	} catch (d) {
		console.log(d);
	}
	spriteIndex++;
	return b;
}
function flipSprite(a, b) {
	try {
		var d = document.createElement("canvas");
		var e = d.getContext("2d");
		d.width = a.width;
		d.height = a.height;
		e.imageSmoothingEnabled = false;
		e.webkitImageSmoothingEnabled = false;
		e.mozImageSmoothingEnabled = false;
		if (b) {
			e.scale(-1, 1);
			e.drawImage(a, -d.width, 0, d.width, d.height);
		} else {
			e.scale(1, -1);
			e.drawImage(a, 0, -d.height, d.width, d.height);
		}
		d.index = a.index;
		d.flipped = true;
		d.isLoaded = true;
		return d;
	} catch (f) {}
	return false;
}
function Projectile() {
	this.speed =
		this.width =
		this.height =
		this.jumpY =
		this.yOffset =
		this.dir =
		this.cEndY =
		this.cEndX =
		this.startY =
		this.y =
		this.startX =
		this.x =
			0;
	this.active = false;
	this.weaponIndex = this.spriteIndex = this.pierceCount = 0;
	this.glowHeight = this.glowWidth = null;
	this.speed = this.trailWidth = this.trailMaxLength = this.trailAlpha = 0;
	this.owner = null;
	this.dmg = 0;
	this.lastHit = "";
	this.serverIndex = null;
	this.skipMove = true;
	this.startTime = 0;
	this.maxLifeTime = null;
	this.explodeOnDeath = false;
	this.updateAccuracy = 3;
	this.bounce = false;
	var a = 0;
	var b = 0;
	var d = 0;
	var e = 0;
	this.update = function (f) {
		if (this.active) {
			e = currentTime - this.startTime;
			if (this.skipMove) {
				e = 0;
				this.startTime = currentTime;
			}
			for (var g = 0; g < this.updateAccuracy; ++g) {
				var h = this.speed * f;
				if (this.active) {
					a = (h * mathCOS(this.dir)) / this.updateAccuracy;
					b = (h * mathSIN(this.dir)) / this.updateAccuracy;
					if (this.active && !this.skipMove && this.speed > 0) {
						this.x += a;
						this.y += b;
						if (
							getDistance(this.startX, this.startY, this.x, this.y) >=
							this.trailMaxLength
						) {
							this.startX += a;
							this.startY += b;
						}
					}
					this.cEndX =
						this.x +
						((h + this.height) * mathCOS(this.dir)) / this.updateAccuracy;
					this.cEndY =
						this.y +
						((h + this.height) * mathSIN(this.dir)) / this.updateAccuracy;
					for (h = 0; h < gameObjects.length; ++h) {
						k = gameObjects[h];
						if (
							this.active &&
							k.type == "clutter" &&
							k.active &&
							k.hc &&
							this.canSeeObject(k, k.h) &&
							k.h * k.tp >= this.yOffset &&
							this.lineInRect(k.x, k.y - k.h, k.w, k.h - this.yOffset, true)
						) {
							if (this.bounce) {
								this.bounceDir(
									this.cEndY <= k.y - k.h || this.cEndY >= k.y - this.yOffset,
								);
							} else {
								this.active = false;
								this.hitSomething(false, 2);
							}
						}
					}
					if (this.active) {
						var k;
						for (var h = 0; h < gameMap.tiles.length; ++h) {
							if (this.active) {
								k = gameMap.tiles[h];
								if (k.wall && k.hasCollision && this.canSeeObject(k, k.scale)) {
									if (k.bottom) {
										if (this.lineInRect(k.x, k.y, k.scale, k.scale, true)) {
											this.active = false;
										}
									} else if (
										this.lineInRect(
											k.x,
											k.y,
											k.scale,
											k.scale - this.owner.height - this.jumpY,
											true,
										)
									) {
										this.active = false;
									}
									if (!this.active) {
										if (this.bounce) {
											this.bounceDir(
												!(this.cEndX <= k.x) && !(this.cEndX >= k.x + k.scale),
											);
										} else {
											this.hitSomething(
												!(this.cEndX <= k.x) && !(this.cEndX >= k.x + k.scale),
												2,
											);
										}
									}
								}
							}
						}
					}
					if (this.active && this.owner.index == player.index) {
						for (
							h = 0;
							h < gameObjects.length &&
							((k = gameObjects[h]),
							k.index == this.owner.index ||
								!(this.lastHit.indexOf("," + k.index + ",") < 0) ||
								k.team == this.owner.team ||
								k.type != "player" ||
								!k.onScreen ||
								k.dead ||
								(this.lineInRect(
									k.x - k.width / 2,
									k.y - k.height - k.jumpY,
									k.width,
									k.height,
									this.pierceCount <= 1,
								) &&
									k.spawnProtection <= 0 &&
									(this.explodeOnDeath
										? (this.active = false)
										: this.dmg > 0 &&
											((this.lastHit += k.index + ","),
											this.spriteIndex != 2 &&
												(particleCone(
													12,
													k.x,
													k.y - k.height / 2 - k.jumpY,
													this.dir + mathPI,
													mathPI / randomInt(5, 7),
													0.5,
													16,
													0,
													true,
												),
												createLiquid(k.x, k.y, this.dir, 4)),
											this.pierceCount > 0 && this.pierceCount--,
											this.pierceCount <= 0 && (this.active = false))),
								this.active));
							++h
						);
					}
					if (this.maxLifeTime != null && e >= this.maxLifeTime) {
						this.active = false;
					}
				}
			}
			if (this.spriteIndex == 1) {
				d -= f;
				if (d <= 0) {
					stillDustParticle(this.x, this.y, true);
					d = 20;
				}
			}
		} else if (!this.active && this.trailAlpha > 0) {
			this.trailAlpha -= f * 0.001;
			if (this.trailAlpha <= 0) {
				this.trailAlpha = 0;
			}
		}
		this.skipMove = false;
	};
	this.activate = function () {
		this.skipMove = true;
		this.lastHit = ",";
		this.active = true;
		playSound("shot" + this.weaponIndex, this.x, this.y);
	};
	var f = 0;
	var h = 0;
	this.canSeeObject = function (a, b) {
		f = mathABS(this.cEndX - a.x);
		h = mathABS(this.cEndY - a.y);
		return f <= (b + this.height) * 2 && h <= (b + this.height) * 2;
	};
	this.deactivate = function () {
		this.active = false;
	};
	this.hitSomething = function (a, b) {
		if (this.spriteIndex != 2) {
			particleCone(
				10,
				this.cEndX,
				this.cEndY,
				this.dir + mathPI,
				mathPI / randomInt(5, 7),
				0.5,
				16,
				b,
				a,
			);
		}
	};
	this.bounceDir = function (a) {
		this.dir = a ? mathPI * 2 - this.dir : mathPI - this.dir;
		this.active = true;
		this.speed *= 0.65;
		this.x = this.cEndX;
		this.y = this.cEndY;
	};
	this.lineInRect = function (a, b, d, e, f) {
		var g = this.x;
		var h = this.y;
		var k = g;
		var l = this.cEndX;
		if (k > l) {
			k = this.cEndX;
			l = g;
		}
		if (l > a + d) {
			l = a + d;
		}
		if (k < a) {
			k = a;
		}
		if (k > l) {
			return false;
		}
		var m = h;
		var p = this.cEndY;
		var q = this.cEndX - g;
		if (mathABS(q) > 1e-7) {
			p = (this.cEndY - h) / q;
			g = h - p * g;
			m = p * k + g;
			p = p * l + g;
		}
		if (m > p) {
			k = p;
			p = m;
			m = k;
		}
		if (p > b + e) {
			p = b + e;
		}
		if (m < b) {
			m = b;
		}
		if (m > p) {
			return false;
		}
		if (f) {
			this.adjustOnCollision(a, b, d, e);
		}
		return true;
	};
	this.dotInRect = function (a, b, d, e, f, h) {
		return a >= d && a <= d + f && b >= e && b <= e + h;
	};
	this.adjustOnCollision = function (a, b, d, e) {
		for (var f = 100, h = this.cEndX, g = this.cEndY; f > 0; ) {
			f--;
			if (this.dotInRect(h, g, a, b, d, e)) {
				f = 0;
			} else {
				h += mathCOS(this.dir + mathPI) * 2;
				g += mathSIN(this.dir + mathPI) * 2;
			}
		}
		for (f = 100; f > 0; ) {
			f--;
			if (this.dotInRect(h, g, a, b, d, e)) {
				h += mathCOS(this.dir + mathPI) * 2;
				g += mathSIN(this.dir + mathPI) * 2;
			} else {
				f = 0;
			}
		}
		this.cEndX = h;
		this.cEndY = g;
		this.x = this.cEndX;
		this.y = this.cEndY;
	};
}
var bulletIndex = 0;
function getNextBullet() {
	bulletIndex++;
	if (bulletIndex >= bullets.length) {
		bulletIndex = 0;
	}
	return bullets[bulletIndex];
}
function playerSwapWeapon(a, b) {
	if (a != null && !a.dead) {
		a.currentWeapon += b;
		if (a.currentWeapon < 0) {
			a.currentWeapon = a.weapons.length - 1;
		}
		if (a.currentWeapon >= a.weapons.length) {
			a.currentWeapon = 0;
		}
		playerEquipWeapon(a, a.currentWeapon);
		updateWeaponUI(a, false);
		socket.emit("sw", a.currentWeapon);
	}
}
function playerEquipWeapon(a, b) {
	a.currentWeapon = b;
}
var actionBar = document.getElementById("actionBar");
var tmpDiv = null;
function updateWeaponUI(a, b) {
	if (weaponSpriteSheet[0] == undefined || a.weapons == undefined) {
		return false;
	}
	if (b) {
		actionBar.innerHTML = "";
	}
	if (actionBar.innerHTML == "") {
		for (var d = 0; d < a.weapons.length; ++d) {
			var e = document.createElement("div");
			e.id = "actionContainer" + d;
			e.className =
				d == a.currentWeapon ? "actionContainerActive" : "actionContainer";
			tmpDiv = weaponSpriteSheet[a.weapons[d].weaponIndex].icon;
			if (tmpDiv != undefined) {
				tmpDiv.className = "actionItem";
				var f = document.createElement("div");
				f.id = "actionCooldown" + d;
				f.className = "actionCooldown";
				e.appendChild(f);
				e.appendChild(tmpDiv);
				actionBar.appendChild(e);
			}
		}
	} else {
		for (d = 0; d < a.weapons.length; ++d) {
			tmpDiv = document.getElementById("actionContainer" + d);
			tmpDiv.className =
				d == a.currentWeapon ? "actionContainerActive" : "actionContainer";
		}
	}
	updateUiStats(a);
}
function setCooldownAnimation(a, b, d) {
	tmpDiv = document.getElementById("actionCooldown" + a);
	if (d) {
		tmpDiv.style.height = "100%";
		$("#actionCooldown" + a).animate(
			{
				height: "0%",
			},
			b,
		);
	} else {
		tmpDiv.style.height = "0%";
	}
}
function shootNextBullet(a, b) {
	var d = getNextBullet();
	if (d != undefined) {
		d.serverIndex = a.si;
		d.x = a.x - 1;
		d.startX = a.x;
		d.y = a.y;
		d.startY = a.y;
		d.dir = a.d;
		d.speed = getCurrentWeapon(b).bSpeed;
		d.updateAccuracy = getCurrentWeapon(b).cAcc;
		d.width = getCurrentWeapon(b).bWidth;
		d.height = getCurrentWeapon(b).bHeight;
		var e = getCurrentWeapon(b).bRandScale;
		if (e != null) {
			e = randomFloat(e[0], e[1]);
			d.width *= e;
			d.height *= e;
			d.speed *=
				1 + getCurrentWeapon(b).spread[getCurrentWeapon(b).spreadIndex];
		}
		d.trailWidth = d.width * 0.7;
		d.trailMaxLength = mathRound(d.height * 5);
		d.trailAlpha = getCurrentWeapon(b).bTrail;
		d.weaponIndex = getCurrentWeapon(b).weaponIndex;
		d.spriteIndex = getCurrentWeapon(b).bSprite;
		d.yOffset = getCurrentWeapon(b).yOffset;
		d.jumpY = b.jumpY;
		d.owner = b;
		d.dmg = getCurrentWeapon(b).dmg;
		d.bounce = getCurrentWeapon(b).bounce;
		d.startTime = currentTime;
		d.maxLifeTime = getCurrentWeapon(b).maxLife;
		if (b.index == player.index && getCurrentWeapon(b).distBased) {
			d.maxLifeTime = target.d / d.speed;
		}
		d.glowWidth = getCurrentWeapon(b).glowWidth;
		d.glowHeight = getCurrentWeapon(b).glowHeight;
		d.explodeOnDeath = getCurrentWeapon(b).explodeOnDeath;
		d.pierceCount = getCurrentWeapon(b).pierce;
		d.activate();
	}
	d = null;
}
function shootBullet(a) {
	if (
		!a.dead &&
		getCurrentWeapon(a) != undefined &&
		a.spawnProtection == 0 &&
		getCurrentWeapon(a).weaponIndex >= 0 &&
		getCurrentWeapon(a).reloadTime <= 0 &&
		getCurrentWeapon(a).ammo > 0
	) {
		screenShake(getCurrentWeapon(a).shake, target.f);
		for (var b = 0; b < getCurrentWeapon(a).bulletsPerShot; ++b) {
			getCurrentWeapon(a).spreadIndex++;
			if (
				getCurrentWeapon(a).spreadIndex >= getCurrentWeapon(a).spread.length
			) {
				getCurrentWeapon(a).spreadIndex = 0;
			}
			var d = getCurrentWeapon(a).spread[getCurrentWeapon(a).spreadIndex];
			var d = (target.f + mathPI + d).round(2);
			var e = getCurrentWeapon(a).holdDist + getCurrentWeapon(a).bDist;
			var f = mathRound(a.x + e * mathCOS(d));
			var e = mathRound(
				a.y - getCurrentWeapon(a).yOffset - a.jumpY + e * mathSIN(d),
			);
			shootNextBullet(
				{
					x: f,
					y: e,
					d: d,
					si: -1,
				},
				a,
			);
		}
		socket.emit("1", a.x, a.y, a.jumpY, target.f, target.d, currentTime);
		getCurrentWeapon(a).lastShot = currentTime;
		getCurrentWeapon(a).ammo--;
		if (getCurrentWeapon(a).ammo <= 0) {
			playerReload(a, true);
		}
		updateUiStats(a);
	}
}
function playerReload(a, b) {
	if (
		getCurrentWeapon(a).reloadTime <= 0 &&
		getCurrentWeapon(a).ammo != getCurrentWeapon(a).maxAmmo
	) {
		getCurrentWeapon(a).reloadTime = getCurrentWeapon(a).reloadSpeed;
		getCurrentWeapon(a).spreadIndex = 0;
		showNotification("Reloading");
		if (b) {
			socket.emit("r");
		}
		setCooldownAnimation(a.currentWeapon, getCurrentWeapon(a).reloadTime, true);
	}
}
function findServerBullet(a) {
	for (var b = 0; b < bullets.length; ++b) {
		if (bullets[b].serverIndex == a) {
			return bullets[b];
		}
	}
}
function someoneShot(a) {
	if (a.i != player.index) {
		tmpPlayer = findUserByIndex(a.i);
		if (tmpPlayer != null) {
			shootNextBullet(a, tmpPlayer);
		}
	}
}
var trailGrad = null;
function updateBullets(a) {
	var b;
	var d;
	graph.globalAlpha = 1;
	var e;
	var f;
	var h = null;
	for (var g = 0; g < bullets.length; g++) {
		h = bullets[g];
		h.update(a);
		if (h.active) {
			b = h.x - startX;
			d = h.y - startY;
			if (canSee(b, d, h.height, h.height)) {
				graph.save();
				graph.translate(b, d);
				if (h.spriteIndex == 2) {
					graph.globalCompositeOperation = "lighter";
					graph.globalAlpha = 0.3;
					drawSprite(
						graph,
						bulletSprites[h.spriteIndex],
						-(h.glowWidth / 2),
						-(h.glowHeight / 2) + h.height / 2,
						h.glowWidth,
						h.glowHeight,
						h.dir - mathPI / 2,
						false,
						0,
						0,
						0,
					);
				} else {
					drawSprite(
						graph,
						bulletSprites[h.spriteIndex],
						-(h.width / 2),
						0,
						h.width,
						h.height + 8,
						h.dir - mathPI / 2,
						false,
						0,
						0,
						0,
					);
				}
				graph.restore();
			}
		}
		if (showBTrails && h.trailAlpha > 0) {
			graph.save();
			b = mathRound(h.startX - startX);
			d = mathRound(h.startY - startY);
			e = mathRound(h.x - startX);
			f = mathRound(h.y - startY);
			trailGrad = graph.createLinearGradient(b, d, e, f);
			trailGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
			trailGrad.addColorStop(1, "rgba(255, 255, 255, " + h.trailAlpha + ")");
			graph.strokeStyle = trailGrad;
			graph.lineWidth = h.trailWidth;
			graph.beginPath();
			graph.moveTo(b, d);
			graph.lineTo(e, f);
			graph.closePath();
			graph.stroke();
			graph.restore();
		}
	}
	h = null;
}
var weaponNames =
	"smg revolver sniper toygun shotgun grenades rockets pistol minigun flamethrower".split(
		" ",
	);
var characterClasses = [
	{
		classN: "Triggerman",
		weaponIndexes: [0, 5],
		pWeapon: "Machine Gun",
		sWeapon: "Grenade Launcher",
		folderName: "triggerman",
		hasDown: false,
	},
	{
		classN: "Detective",
		weaponIndexes: [1, 5],
		pWeapon: "Desert Eagle",
		sWeapon: "Grenade Launcher",
		folderName: "detective",
		hasDown: false,
	},
	{
		classN: "Hunter",
		weaponIndexes: [2, 7],
		pWeapon: "Sniper",
		sWeapon: "Machine Pistol",
		folderName: "hunter",
		hasDown: true,
	},
	{
		classN: "Run 'N Gun",
		weaponIndexes: [3],
		pWeapon: "Toy Blaster",
		sWeapon: "None",
		folderName: "billy",
		hasDown: false,
	},
	{
		classN: "Vince",
		weaponIndexes: [4, 5],
		pWeapon: "Shotgun",
		sWeapon: "Grenade Launcher",
		folderName: "vinc",
		hasDown: true,
	},
	{
		classN: "Rocketeer",
		name: "General Weiss",
		weaponIndexes: [6],
		pWeapon: "Rocket Launcher",
		sWeapon: "None",
		folderName: "rocketeer",
		hasDown: false,
	},
	{
		classN: "Spray N' Pray",
		weaponIndexes: [8],
		pWeapon: "Minigun",
		sWeapon: "None",
		folderName: "mbob",
		hasDown: true,
	},
	{
		classN: "Arsonist",
		weaponIndexes: [9],
		pWeapon: "Flamethrower",
		sWeapon: "None",
		folderName: "pyro",
		hasDown: true,
	},
	{
		classN: "Duck",
		weaponIndexes: [9],
		pWeapon: "Jump",
		sWeapon: "None",
		folderName: "boss2",
		hasDown: true,
	},
	{
		classN: "Nademan",
		weaponIndexes: [5],
		pWeapon: "Nade Launcher",
		sWeapon: "None",
		folderName: "demo",
		hasDown: false,
	},
];
var specialClasses = [
	{
		pWeapon: "???",
		sWeapon: "???",
		folderName: "boss1",
		hasDown: false,
	},
	{
		pWeapon: "???",
		sWeapon: "???",
		folderName: "boss2",
		hasDown: false,
	},
];
var currentClassID = 0;
var currentClass = document.getElementById("currentClass");
var classList = document.getElementById("classList");
var characterWepnDisplay = document.getElementById("charWpn");
var characterWepnDisplay2 = document.getElementById("charWpn2");
function createClassList() {
	var a = "";
	for (var b = 0; b < characterClasses.length; ++b) {
		a +=
			"<div class='hatSelectItem' id='classItem" +
			b +
			"' onclick='pickedCharacter(" +
			b +
			");'>" +
			characterClasses[b].classN +
			"</div>";
	}
	classList.innerHTML = a;
}
createClassList();
function showClassselector() {
	charSelectorCont.style.display = "none";
	lobbySelectorCont.style.display = "none";
	classSelector.style.display = "block";
}
window.showClassselector = showClassselector;
function loadSavedClass() {
	if (getCookie("previousClass") != "") {
		previousClass = getCookie("previousClass");
		pickedCharacter(previousClass);
	} else {
		pickedCharacter(0);
	}
}
function pickedCharacter(a) {
	currentClassID = a;
	currentClass.innerHTML = document.getElementById("classItem" + a).innerHTML;
	currentClass.style.color = document.getElementById(
		"classItem" + a,
	).style.color;
	characterWepnDisplay.innerHTML =
		"<b>Primary:</b><div class='hatSelectItem' style='display:inline-block'>" +
		characterClasses[a].pWeapon +
		"</div>";
	characterWepnDisplay2.innerHTML =
		"<b>Secondary:</b><div class='hatSelectItem' style='display:inline-block'>" +
		characterClasses[a].sWeapon +
		"</div>";
	setCookie("previousClass", a);
	if (loggedIn) {
		for (var b = 0; b < characterClasses[a].weaponIndexes.length; ++b) {
			var d = getCookie("wpnSkn" + characterClasses[a].weaponIndexes[b]);
			if (d != "") {
				changeCamo(characterClasses[a].weaponIndexes[b], parseInt(d), false);
			}
		}
		if (getCookie("previousHat") != "") {
			previousHat = getCookie("previousHat");
			changeHat(previousHat);
		}
		if (getCookie("previousShirt") != "") {
			previousShirt = getCookie("previousShirt");
			changeShirt(previousShirt);
		}
	}
	charSelectorCont.style.display = "block";
	lobbySelectorCont.style.display = "block";
	classSelector.style.display = "none";
	lobbySelector.style.display = "none";
	lobbyCSelector.style.display = "none";
	hatSelector.style.display = "none";
	spraySelector.style.display = "none";
	camoSelector.style.display = "none";
	shirtSelector.style.display = "none";
}
window.pickedCharacter = pickedCharacter;
var camoDataList = null;
var maxCamos = 0;
var camoList = document.getElementById("camoList");
function showWeaponSelector(a) {
	charSelectorCont.style.display = "none";
	lobbySelectorCont.style.display = "none";
	classSelector.style.display = "none";
	camoSelector.style.display = "block";
	a = characterClasses[currentClassID].weaponIndexes[a];
	var b =
		"<div class='hatSelectItem' onclick='changeCamo(" +
		a +
		",0,true);'>Default</div>";
	if (loggedIn && camoDataList != null && camoDataList[a] != undefined) {
		var d;
		for (var e = 0; e < camoDataList[a].length; ++e) {
			d = camoDataList[a][e];
			b +=
				"<div class='hatSelectItem' style='color:" +
				getItemRarityColor(d.chance) +
				"' onclick='changeCamo(" +
				a +
				"," +
				d.id +
				",true);'>" +
				d.name +
				" x" +
				(parseInt(d.count) + 1) +
				"</div>";
		}
		document.getElementById("camoHeaderAmount").innerHTML =
			"SELECT CAMO (" +
			(camoDataList[a].length + 1) +
			"/" +
			(maxCamos + 1) +
			")";
	} else {
		document.getElementById("camoHeaderAmount").innerHTML = "SELECT CAMO";
	}
	camoList.innerHTML = b;
}
window.showWeaponSelector = showWeaponSelector;
function getCamoURL(a) {
	return ".././images/camos/" + (a + 1) + ".png";
}
function changeCamo(a, b, d) {
	if (socket != undefined) {
		socket.emit("cCamo", {
			weaponID: a,
			camoID: b,
		});
		if (d) {
			setCookie("wpnSkn" + a, b);
			charSelectorCont.style.display = "block";
			lobbySelectorCont.style.display = "block";
			camoSelector.style.display = "none";
			shirtSelector.style.display = "none";
			classSelector.style.display = "none";
			hatSelector.style.display = "none";
			lobbySelector.style.display = "none";
			lobbyCSelector.style.display = "none";
		}
	}
}
window.changeCamo = changeCamo;
function updateCamosList(a, b) {
	camoDataList = b;
	maxCamos = a;
}
window.updateCamosList = updateCamosList;
var animLength = 3;
var tmpSprite = null;
var tmpIndex = 0;
var classSpriteSheets = [];
function loadPlayerSprites(a) {
	classSpriteSheets = [];
	loadPlayerSpriteArray(a, characterClasses);
	loadPlayerSpriteArray(a, specialClasses);
	resize();
}
function loadPlayerSpriteArray(a, b) {
	for (var d = 0; d < b.length; ++d) {
		var e = [];
		var f = [];
		var h = [];
		var g = [];
		e.push(getSprite(a + "characters/" + b[d].folderName + "/up"));
		f.push(getSprite(a + "characters/" + b[d].folderName + "/down"));
		h.push(getSprite(a + "characters/" + b[d].folderName + "/left"));
		g.push(getSprite(a + "characters/" + b[d].folderName + "/left"));
		for (var l = 0; l < animLength; ++l) {
			tmpIndex = l;
			e.push(
				getSprite(a + "characters/" + b[d].folderName + "/up" + (tmpIndex + 1)),
			);
			tmpSprite = b[d].hasDown
				? getSprite(
						a + "characters/" + b[d].folderName + "/down" + (tmpIndex + 1),
					)
				: getSprite(
						a + "characters/" + b[d].folderName + "/up" + (tmpIndex + 1),
					);
			f.push(tmpSprite);
			if (tmpIndex >= 2) {
				tmpIndex = 0;
			}
			h.push(
				getSprite(
					a + "characters/" + b[d].folderName + "/left" + (tmpIndex + 1),
				),
			);
			g.push(
				getSprite(
					a + "characters/" + b[d].folderName + "/left" + (tmpIndex + 1),
				),
			);
		}
		var l = getSprite(a + "characters/" + b[d].folderName + "/arm");
		var m = getSprite(a + "characters/" + b[d].folderName + "/hd");
		var k = getSprite(a + "characters/" + b[d].folderName + "/hu");
		var p = getSprite(a + "characters/" + b[d].folderName + "/hl");
		var n = getSprite(a + "characters/" + b[d].folderName + "/hl");
		classSpriteSheets.push({
			upSprites: e,
			downSprites: f,
			leftSprites: h,
			rightSprites: g,
			arm: l,
			hD: m,
			hU: k,
			hL: p,
			hR: n,
		});
	}
}
var flagSprites = [];
var clutterSprites = [];
var cachedWalls = [];
var floorSprites = [];
var cachedFloors = [];
var sideWalkSprite = null;
var lightSprite = null;
var ambientSprites = [];
var wallSpritesSeg = [];
var particleSprites = [];
var weaponSpriteSheet = [];
var bulletSprites = [];
var cachedShadows = [];
var cachedWeaponSprites = [];
var wallSprite = null;
var darkFillerSprite = null;
var healthPackSprite = null;
var lootCrateSprite = null;
var weaponWidth = 27;
var weaponHeight = 54;
function loadDefaultSprites(a) {
	cachedShadows = [];
	flagSprites = [];
	clutterSprites = [];
	cachedWalls = [];
	cachedFloors = [];
	floorSprites = [];
	ambientSprites = [];
	wallSpritesSeg = [];
	particleSprites = [];
	bulletSprites = [];
	cachedWeaponSprites = [];
	flagSprites.push(getSprite(a + "flags/flagb1"));
	flagSprites.push(getSprite(a + "flags/flagb2"));
	flagSprites.push(getSprite(a + "flags/flagb3"));
	flagSprites.push(getSprite(a + "flags/flagr1"));
	flagSprites.push(getSprite(a + "flags/flagr2"));
	flagSprites.push(getSprite(a + "flags/flagr3"));
	clutterSprites.push(getSprite(a + "clutter/crate1"));
	clutterSprites.push(getSprite(a + "clutter/barrel1"));
	clutterSprites.push(getSprite(a + "clutter/barrel2"));
	clutterSprites.push(getSprite(a + "clutter/bottle1"));
	clutterSprites.push(getSprite(a + "clutter/spike1"));
	wallSprite = getSprite(a + "wall1");
	ambientSprites.push(getSprite(a + "ambient1"));
	darkFillerSprite = getSprite(a + "darkfiller");
	lightSprite = getSprite(a + "lighting");
	floorSprites.push(getSprite(a + "ground1"));
	floorSprites.push(getSprite(a + "ground2"));
	floorSprites.push(getSprite(a + "ground3"));
	sideWalkSprite = getSprite(a + "sidewalk1");
	wallSpritesSeg.push(getSprite(a + "wallSegment1"));
	wallSpritesSeg.push(getSprite(a + "wallSegment2"));
	wallSpritesSeg.push(getSprite(a + "wallSegment3"));
	particleSprites.push(getSprite(a + "particles/blood/blood"));
	particleSprites.push(getSprite(a + "particles/oil/oil"));
	particleSprites.push(getSprite(a + "particles/wall"));
	particleSprites.push(getSprite(a + "particles/hole"));
	particleSprites.push(getSprite(a + "particles/blood/splatter1"));
	particleSprites.push(getSprite(a + "particles/blood/splatter2"));
	particleSprites.push(getSprite(a + "particles/explosion"));
	healthPackSprite = getSprite(a + "healthpack");
	lootCrateSprite = getSprite(a + "lootCrate1");
	weaponSpriteSheet = [];
	for (var b = 0; b < weaponNames.length; ++b) {
		var d;
		var e;
		var f;
		var h;
		var g;
		d = getSprite(a + "weapons/" + weaponNames[b] + "/up");
		e = getSprite(a + "weapons/" + weaponNames[b] + "/up");
		f = getSprite(a + "weapons/" + weaponNames[b] + "/left");
		h = getSprite(a + "weapons/" + weaponNames[b] + "/left");
		g = getSprite(a + "weapons/" + weaponNames[b] + "/icon");
		weaponSpriteSheet.push({
			upSprite: d,
			downSprite: e,
			leftSprite: f,
			rightSprite: h,
			icon: g,
		});
	}
	bulletSprites.push(getSprite(a + "weapons/bullet"));
	bulletSprites.push(getSprite(a + "weapons/grenade"));
	bulletSprites.push(getSprite(a + "weapons/flame"));
	resize();
}
var mainTitleText = document.getElementById("mainTitleText");
function updateMenuInfo(a) {
	mainTitleText.innerHTML = a;
}
function isURL(a) {
	return a.indexOf(".") > 0;
}
var linkedMod = location.hash.replace("#", "");
loadModPack(linkedMod, linkedMod == "");
var loadingTexturePack = false;
var modInfo = document.getElementById("modInfo");
function setModInfoText(a) {
	if (modInfo != undefined) {
		modInfo.innerHTML = a;
	}
}
var fileFormat = "";
window.loadModPack = loadModPack;
function loadModPack(a, b) {
	try {
		if (!loadingTexturePack) {
			function d() {
				this.numFiles;
				this.progress;
				this.reader;
				this.init = function (a, b) {
					this.numFiles = b;
					this.progress = 0;
					this.reader = a;
				};
				this.close = function () {
					if (this.reader) {
						this.progress++;
						if (this.numFiles === this.progress) {
							spriteIndex = 0;
							loadPlayerSprites("sprites/");
							loadDefaultSprites("sprites/");
							loadSounds("sounds/");
							this.reader.close();
							this.reader = undefined;
							loadingTexturePack = false;
						}
					} else {
						console.log("reader not valid");
					}
				};
			}
			function e(a) {
				this.typeName = a;
				var b = this;
				this.process = function (a) {
					try {
						if (b.typeName.indexOf("modinfo") > -1) {
							setModInfoText(a);
						} else if (b.typeName.indexOf("cssmod") > -1) {
							var d = document.createElement("style");
							d.type = "text/css";
							d.innerHTML = a;
							document.getElementsByTagName("head")[0].appendChild(d);
						} else if (b.typeName.indexOf("gameinfo") > -1) {
							var e = a.replace(/(\r\n|\n|\r)/gm, "");
							var f = JSON.parse(e);
							updateMenuInfo(f.name);
						} else if (b.typeName.indexOf("charinfo") > -1) {
							var h = a.replace(/(\r\n|\n|\r)/gm, "").split("|");
							characterClasses = [];
							for (a = 0; a < h.length; ++a) {
								characterClasses.push(JSON.parse(h[a]));
							}
							createClassList();
							pickedCharacter(currentClassID);
						}
					} catch (t) {
						console.log("Script Read Error: " + t);
					}
					zipFileCloser.close();
				};
			}
			function f(a, b) {
				this.filename = a;
				this.soundAsDataURL = this.tmpLocation = "";
				this.format = b;
				var d = this;
				this.process = function (a) {
					if ((this.soundAsDataURL = URL.createObjectURL(a))) {
						try {
							this.tmpLocation = d.filename;
							localStorage.setItem(
								this.tmpLocation + "data",
								this.soundAsDataURL,
							);
							localStorage.setItem(this.tmpLocation + "format", d.format);
						} catch (r) {
							console.log("Storage failed: " + r);
						}
						zipFileCloser.close();
					} else {
						console.log("failed to generate url: " + d.filename);
					}
				};
			}
			function h(a) {
				this.filename = a;
				this.imgAsDataURL = this.tmpLocation = "";
				var b = this;
				this.process = function (a) {
					if ((this.imgAsDataURL = URL.createObjectURL(a))) {
						try {
							this.tmpLocation = b.filename;
							localStorage.setItem(this.tmpLocation, this.imgAsDataURL);
						} catch (n) {
							console.log("Storage failed: " + n);
						}
						zipFileCloser.close();
					} else {
						console.log("failed to generate url: " + b.filename);
					}
				};
			}
			var g = "";
			if (b) {
				doSounds = false;
				g = "/res.zip";
			} else {
				if (a == "") {
					setModInfoText("Please enter a mod Key/URL");
					return false;
				}
				loadingTexturePack = doSounds = true;
				if (isURL(a)) {
					g = a;
					if (!g.match(/^https?:\/\//i)) {
						g = "http://" + g;
					}
				} else {
					g = "https://dl.dropboxusercontent.com/s/" + a + "/vertixmod.zip";
				}
			}
			if (!b) {
				setModInfoText("Loading...");
			}
			zipFileCloser ||= new d();
			var l = "";
			const reader = new zip.ZipReader(new zip.HttpReader(g));
			reader.getEntries().then((entries) => {
				let b = entries;
				if (b.length) {
					zipFileCloser.init(reader, b.length);
					for (var d = 0; d < b.length; d++) {
						var g = b[d];
						if (g.directory) {
							zipFileCloser.close();
						} else {
							g.filename = g.filename.replace("vertixmod/", "");
							fileFormat =
								g.filename.split(".")[g.filename.split(".").length - 1];
							l = g.filename.split("/")[0];
							if (l == "scripts") {
								let processor = new e(g.filename);
								g.getData(new zip.TextWriter())
									.then((a) => {
										processor.process(a);
									})
									.catch((t) => {
										console.log("Script Read Error: " + t);
									});
							} else if (l == "sprites") {
								let processor = new h(g.filename);
								g.getData(new zip.BlobWriter("image/png"))
									.then((a) => {
										processor.process(a);
									})
									.catch((n) => {
										console.log("Image Load Error: " + n);
									});
							} else if (l == "sounds") {
								let processor = new f(
									g.filename.replace("." + fileFormat, ""),
									fileFormat,
								);
								g.getData(new zip.BlobWriter("audio/" + fileFormat))
									.then((a) => {
										processor.process(a);
									})
									.catch((r) => {
										console.log("Sound Load Error: " + r);
									});
							} else {
								loadingTexturePack = false;
								setModInfoText("Mod could not be loaded");
							}
						}
					}
				}
			});
		}
	} catch (m) {
		console.log(m);
		loadingTexturePack = false;
		setModInfoText("Mod could not be loaded");
	}
}
let tmpSpriteCollection;
function getPlayerSprite(a, b, d) {
	tmpSpriteCollection = classSpriteSheets[a];
	if (tmpSpriteCollection == undefined) {
		return null;
	}
	if (b == 90) {
		tmpSprite = tmpSpriteCollection.leftSprites[d];
	} else if (b == 180) {
		tmpSprite = tmpSpriteCollection.upSprites[d];
	} else if (b == 270) {
		if (
			!tmpSpriteCollection.rightSprites[d].flipped &&
			tmpSpriteCollection.rightSprites[d].isLoaded
		) {
			tmpSpriteCollection.rightSprites[d] = flipSprite(
				tmpSpriteCollection.rightSprites[d],
				true,
			);
		}
		tmpSprite = tmpSpriteCollection.rightSprites[d];
	} else {
		tmpSprite = tmpSpriteCollection.downSprites[d];
	}
	return tmpSprite;
}
var cachedHats = [];
var tmpAcc = null;
function getHatSprite(a, b) {
	tmpAcc = a.account;
	if (tmpAcc != undefined) {
		if (tmpAcc.hat != null) {
			tmpSprite = cachedHats[tmpAcc.hat.id];
			if (tmpSprite == undefined) {
				var d = {
					lS: null,
					uS: null,
					rS: null,
					dS: null,
					imgToLoad: 0,
				};
				if (tmpAcc.hat.left) {
					d.imgToLoad++;
					d.lS = new Image();
					d.lS.index = spriteIndex;
					spriteIndex++;
					d.lS.src = ".././images/hats/" + tmpAcc.hat.id + "/l.png";
					d.lS.onload = function () {
						d.imgToLoad--;
						d.lS.isLoaded = true;
						d.lS.onload = null;
					};
					d.imgToLoad++;
					d.rS = new Image();
					d.rS.index = spriteIndex;
					spriteIndex++;
					d.rS.src = ".././images/hats/" + tmpAcc.hat.id + "/l.png";
					d.rS.onload = function () {
						d.rS = flipSprite(d.rS, true);
						d.imgToLoad--;
						d.rS.isLoaded = true;
						d.rS.onload = null;
					};
				}
				if (tmpAcc.hat.up) {
					d.imgToLoad++;
					d.uS = new Image();
					d.uS.index = spriteIndex;
					spriteIndex++;
					d.uS.src = ".././images/hats/" + tmpAcc.hat.id + "/u.png";
					d.uS.onload = function () {
						d.imgToLoad--;
						d.uS.isLoaded = true;
						d.uS.onload = null;
					};
				}
				d.imgToLoad++;
				d.dS = new Image();
				d.dS.index = spriteIndex;
				spriteIndex++;
				d.dS.src = ".././images/hats/" + tmpAcc.hat.id + "/d.png";
				d.dS.onload = function () {
					d.imgToLoad--;
					d.dS.isLoaded = true;
					d.dS.onload = null;
				};
				cachedHats[tmpAcc.hat.id] = d;
			} else if (tmpSprite.imgToLoad <= 0) {
				if (tmpAcc.hat.left && b == 90) {
					return tmpSprite.lS;
				} else if (tmpAcc.hat.up && b == 180) {
					return tmpSprite.uS;
				} else if (tmpAcc.hat.left && b == 270) {
					return tmpSprite.rS;
				} else {
					return tmpSprite.dS;
				}
			}
		} else {
			tmpSpriteCollection = classSpriteSheets[a.classIndex];
			if (tmpSpriteCollection == undefined) {
				return null;
			}
			if (b == 90) {
				tmpSprite = tmpSpriteCollection.hL;
			} else if (b == 180) {
				tmpSprite = tmpSpriteCollection.hU;
			} else if (b == 270) {
				if (
					!tmpSpriteCollection.hR.flipped &&
					tmpSpriteCollection.hR.isLoaded
				) {
					tmpSpriteCollection.hR = flipSprite(tmpSpriteCollection.hR, true);
				}
				tmpSprite = tmpSpriteCollection.hR;
			} else {
				tmpSprite = tmpSpriteCollection.hD;
			}
			return tmpSprite;
		}
	}
	return null;
}
var cachedShirts = [];
function getShirtSprite(a, b) {
	tmpAcc = a.account;
	if (tmpAcc != undefined && tmpAcc.shirt != null && a.classIndex != 8) {
		tmpSprite = cachedShirts[tmpAcc.shirt.id];
		if (tmpSprite == undefined) {
			var d = {
				lS: null,
				uS: null,
				rS: null,
				dS: null,
				imgToLoad: 0,
			};
			if (tmpAcc.shirt.left) {
				d.imgToLoad++;
				d.lS = new Image();
				d.lS.index = spriteIndex;
				spriteIndex++;
				d.lS.src = ".././images/shirts/" + tmpAcc.shirt.id + "/l.png";
				d.lS.onload = function () {
					d.imgToLoad--;
					d.lS.isLoaded = true;
					d.lS.onload = null;
				};
				d.imgToLoad++;
				d.rS = new Image();
				d.rS.index = spriteIndex;
				spriteIndex++;
				d.rS.src = ".././images/shirts/" + tmpAcc.shirt.id + "/l.png";
				d.rS.onload = function () {
					d.rS = flipSprite(d.rS, true);
					d.imgToLoad--;
					d.rS.isLoaded = true;
					d.rS.onload = null;
				};
			}
			if (tmpAcc.shirt.up) {
				d.imgToLoad++;
				d.uS = new Image();
				d.uS.index = spriteIndex;
				spriteIndex++;
				d.uS.src = ".././images/shirts/" + tmpAcc.shirt.id + "/u.png";
				d.uS.onload = function () {
					d.imgToLoad--;
					d.uS.isLoaded = true;
					d.uS.onload = null;
				};
			}
			d.imgToLoad++;
			d.dS = new Image();
			d.dS.index = spriteIndex;
			spriteIndex++;
			d.dS.src = ".././images/shirts/" + tmpAcc.shirt.id + "/d.png";
			d.dS.onload = function () {
				d.imgToLoad--;
				d.dS.isLoaded = true;
				d.dS.onload = null;
			};
			cachedShirts[tmpAcc.shirt.id] = d;
		} else if (tmpSprite.imgToLoad <= 0) {
			if (tmpAcc.shirt.left && b == 90) {
				return tmpSprite.lS;
			} else if (tmpAcc.shirt.up && b == 180) {
				return tmpSprite.uS;
			} else if (tmpAcc.shirt.left && b == 270) {
				return tmpSprite.rS;
			} else {
				return tmpSprite.dS;
			}
		}
	}
	return null;
}
tmpSprite = null;
tmpIndex = "";
function getWeaponSprite(a, b, d) {
	tmpIndex = a + "" + b + "" + d;
	tmpSprite = cachedWeaponSprites[tmpIndex];
	if (tmpSprite == undefined) {
		var e = null;
		var e = weaponSpriteSheet[a];
		if (e != undefined && e != null) {
			if (d == 90) {
				e = e.leftSprite;
			} else if (d == 180) {
				e = e.upSprite;
			} else if (d == 270) {
				if (!e.rightSprite.flipped && e.rightSprite.isLoaded) {
					e.rightSprite = flipSprite(e.rightSprite, true);
				}
				e = e.rightSprite;
			} else {
				e = e.downSprite;
			}
			d = document.createElement("canvas");
			a = d.getContext("2d");
			a.imageSmoothingEnabled = false;
			a.webkitImageSmoothingEnabled = false;
			a.mozImageSmoothingEnabled = false;
			d.width = e.width;
			d.height = e.height;
			a.drawImage(e, 0, 0, d.width, d.height);
			tmpSprite = d;
			cachedWeaponSprites[tmpIndex] = tmpSprite;
			if (b >= 0) {
				d = new Image();
				d.wpnImg = tmpSprite;
				d.flip = e.flipped;
				d.tmpInx = tmpIndex;
				d.onload = function () {
					var a = document.createElement("canvas");
					var b = a.getContext("2d");
					b.imageSmoothingEnabled = false;
					b.webkitImageSmoothingEnabled = false;
					b.mozImageSmoothingEnabled = false;
					a.width = this.width;
					a.height = this.height;
					this.onload = null;
					b.drawImage(this.wpnImg, 0, 0, this.width, this.height);
					b.globalCompositeOperation = "source-atop";
					b.globalAlpha = 0.75;
					b.drawImage(
						this.flip ? flipSprite(this, true) : this,
						0,
						0,
						this.width,
						this.height,
					);
					cachedWeaponSprites[this.tmpInx] = a;
				};
				d.src = getCamoURL(b);
			}
		}
	}
	return tmpSprite;
}
var playerCanvas = document.createElement("canvas");
var playerContext = playerCanvas.getContext("2d");
var initPlayerCanv = false;
function drawGameObjects(a) {
	if (!initPlayerCanv) {
		playerCanvas.width = mathRound(300);
		playerCanvas.height = mathRound(500);
		playerContext.imageSmoothingEnabled = false;
		playerContext.webkitImageSmoothingEnabled = false;
		playerContext.mozImageSmoothingEnabled = false;
		initPlayerCanv = true;
	}
	var b = null;
	var d = null;
	var e = null;
	var f = null;
	var h;
	var g;
	for (var l = 0; l < gameObjects.length; l++) {
		b = gameObjects[l];
		if (b.type == "player") {
			if (!b.dead && (b.index == player.index || b.onScreen)) {
				if (b.jumpY == undefined) {
					b.jumpY = 0;
				}
				playerContext.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
				playerContext.save();
				playerContext.globalAlpha = 0.9;
				playerContext.translate(
					playerCanvas.width / 2,
					playerCanvas.height / 2,
				);
				var m = (mathPI / 180) * b.angle;
				var k = mathRound((b.angle % 360) / 90) * 90;
				h = b.x - startX;
				g = b.y - b.jumpY - startY;
				if (b.animIndex == 1) {
					g -= 3;
				}
				if (b.weapons.length > 0) {
					e = getWeaponSprite(
						getCurrentWeapon(b).weaponIndex,
						getCurrentWeapon(b).camo,
						k,
					);
					f = classSpriteSheets[b.classIndex];
					if (f != undefined) {
						f = f.arm;
					}
					if (!getCurrentWeapon(b).front && e != undefined) {
						playerContext.save();
						playerContext.translate(0, -getCurrentWeapon(b).yOffset);
						playerContext.rotate(m);
						playerContext.translate(0, getCurrentWeapon(b).holdDist);
						drawSprite(
							playerContext,
							e,
							-(getCurrentWeapon(b).width / 2),
							0,
							getCurrentWeapon(b).width,
							getCurrentWeapon(b).length,
							0,
							false,
							0,
							0,
							0,
						);
						playerContext.translate(0, -getCurrentWeapon(b).holdDist + 6);
						if (f != undefined && f != null) {
							playerContext.translate(3, -10);
							drawSprite(playerContext, f, 0, 0, 8, 32, 0, false, 0, 0, 0);
							playerContext.translate(-16, -8);
							drawSprite(playerContext, f, 0, 0, 8, 32, 0, false, 0, 0, 0);
							playerContext.restore();
						}
					}
				}
				playerContext.globalAlpha = 1;
				d = getPlayerSprite(b.classIndex, k, b.animIndex + 1);
				if (d != null) {
					drawSprite(
						playerContext,
						d,
						-(b.width / 2),
						-(b.height * 0.318),
						b.width,
						b.height * 0.318,
						0,
						true,
						b.jumpY * 1.5,
						0.5,
						0,
					);
				}
				d = getPlayerSprite(b.classIndex, k, 0);
				if (d != null) {
					drawSprite(
						playerContext,
						d,
						-(b.width / 2),
						-b.height,
						b.width,
						b.height * 0.6819999999999999,
						0,
						true,
						b.jumpY * 1.5 + b.height * 0.477,
						0.5,
						0,
					);
				}
				d = getShirtSprite(b, k);
				if (d != null) {
					playerContext.globalAlpha = 0.9;
					drawSprite(
						playerContext,
						d,
						-(b.width / 2),
						-b.height,
						b.width,
						b.height * 0.6819999999999999,
						0,
						true,
						b.jumpY * 1.5 + b.height * 0.477,
						0.5,
						0,
					);
					playerContext.globalAlpha = 1;
				}
				var p = b.width * 0.833;
				var d = getHatSprite(b, k);
				if (d != null) {
					drawSprite(
						playerContext,
						d,
						-(p / 2),
						-(b.height + p * 0.045),
						//-(b.height + p * 0.095),
						p,
						p,
						0,
						false,
						0,
						0.5,
						0,
					);
				}
				if (b.weapons.length > 0) {
					playerContext.globalAlpha = 0.9;
					if (getCurrentWeapon(b).front && e != undefined) {
						playerContext.save();
						playerContext.translate(0, -getCurrentWeapon(b).yOffset);
						playerContext.rotate(m);
						playerContext.translate(0, getCurrentWeapon(b).holdDist);
						drawSprite(
							playerContext,
							e,
							-(getCurrentWeapon(b).width / 2),
							0,
							getCurrentWeapon(b).width,
							getCurrentWeapon(b).length,
							0,
							false,
							0,
							0,
							0,
						);
						playerContext.translate(0, -getCurrentWeapon(b).holdDist + 10);
						if (f != undefined && f != null) {
							if (k == 270) {
								playerContext.restore();
								playerContext.save();
								playerContext.translate(-4, -getCurrentWeapon(b).yOffset + 8);
								playerContext.rotate(m);
								drawSprite(playerContext, f, 0, 0, 8, 32, 0, false, 0, 0, 0);
							} else if (k == 90) {
								playerContext.restore();
								playerContext.save();
								playerContext.translate(0, -getCurrentWeapon(b).yOffset);
								playerContext.rotate(m);
								drawSprite(playerContext, f, 0, 0, 8, 32, 0, false, 0, 0, 0);
							} else {
								playerContext.translate(10, -13);
								playerContext.rotate(0.7);
								drawSprite(playerContext, f, 0, 0, 8, 32, 0, false, 0, 0, 0);
								playerContext.rotate(-0.7);
								playerContext.translate(-28, -1);
								playerContext.rotate(-0.25);
								drawSprite(playerContext, f, 0, 0, 8, 32, 0, false, 0, 0, 0);
								playerContext.rotate(0.25);
							}
							playerContext.restore();
						}
					}
				}
				if (b.spawnProtection > 0) {
					playerContext.globalCompositeOperation = "source-atop";
					playerContext.fillStyle =
						b.team != player.team
							? "rgba(255,179,179,0.5)"
							: "rgba(179,231,255,0.5)";
					playerContext.fillRect(
						-playerCanvas.width / 2,
						-playerCanvas.height / 2,
						playerCanvas.width,
						playerCanvas.height,
					);
					playerContext.globalCompositeOperation = "source-over";
				}
				if (b.hitFlash != undefined && b.hitFlash > 0) {
					playerContext.globalCompositeOperation = "source-atop";
					playerContext.fillStyle = "rgba(255, 255, 255, " + b.hitFlash + ")";
					playerContext.fillRect(
						-playerCanvas.width / 2,
						-playerCanvas.height / 2,
						playerCanvas.width,
						playerCanvas.height,
					);
					playerContext.globalCompositeOperation = "source-over";
					b.hitFlash -= a * 0.01;
					if (b.hitFlash < 0) {
						b.hitFlash = 0;
					}
				}
				drawSprite(
					graph,
					playerCanvas,
					h - playerCanvas.width / 2,
					g - playerCanvas.height / 2,
					playerCanvas.width,
					playerCanvas.height,
					0,
					false,
					0,
					0,
					0,
				);
				playerContext.restore();
			}
		} else if (b.type == "flag") {
			b.ac--;
			if (b.ac <= 0) {
				b.ac = 5;
				b.ai++;
				if (b.ai > 2) {
					b.ai = 0;
				}
			}
			drawSprite(
				graph,
				flagSprites[b.ai + (b.team == player.team ? 0 : 3)],
				b.x - b.w / 2 - startX,
				b.y - b.h - startY,
				b.w,
				b.h,
				0,
				true,
				0,
				0.5,
				0,
			);
		} else if (
			b.type == "clutter" &&
			b.active &&
			canSee(b.x - startX, b.y - startY, b.w, b.h)
		) {
			drawSprite(
				graph,
				clutterSprites[b.i],
				b.x - startX,
				b.y - b.h - startY,
				b.w,
				b.h,
				0,
				b.s,
				0,
				0.5,
				0,
			);
		}
	}
	graph.globalAlpha = 1;
	b = null;
	d = null;
	e = null;
	f = null;
}
function drawPlayerNames() {
	var a = null;
	var b;
	var d;
	var e;
	var f;
	var h = null;
	var g;
	let shapeX, shapeY;
	graph.lineWidth = playerConfig.textBorderSize;
	graph.fillStyle = playerConfig.textColor;
	graph.miterLimit = 1;
	graph.lineJoin = "round";
	graph.globalAlpha = 1;
	for (var l = 0; l < gameObjects.length; l++) {
		tmpObject = gameObjects[l];
		if (
			tmpObject.type == "player" &&
			!tmpObject.dead &&
			(tmpObject.index == player.index || !!tmpObject.onScreen)
		) {
			d = tmpObject.height / 3.2;
			e = mathMIN(200, (tmpObject.maxHealth / 100) * 100);
			shapeX = tmpObject.x - startX;
			shapeY = tmpObject.y - tmpObject.jumpY - tmpObject.nameYOffset - startY;
			if (tmpObject.account != undefined && tmpObject.account.hat != null) {
				shapeY -= tmpObject.account.hat.nameY;
			}
			b = tmpObject.name;
			f = tmpObject.loggedIn ? tmpObject.account.rank : "";
			h = graph.measureText(b);
			g = tmpObject.team != player.team ? "#d95151" : "#5151d9";
			if (showNames) {
				a = renderShadedAnimText(b, d * textSizeMult, "#ffffff", 5, "");
				if (a != undefined) {
					graph.drawImage(
						a,
						shapeX - a.width / 2,
						shapeY - tmpObject.height * 1.4 - a.height / 2,
						a.width,
						a.height,
					);
				}
				if (f != "") {
					b = renderShadedAnimText(f, d * 1.6 * textSizeMult, "#ffffff", 6, "");
					if (b != undefined) {
						graph.drawImage(
							b,
							shapeX - a.width / 2 - b.width - textSizeMult * 5,
							shapeY - tmpObject.height * 1.4 - (b.height - a.height / 2),
							b.width,
							b.height,
						);
					}
				}
				if (tmpObject.account?.clan != "") {
					b = renderShadedAnimText(
						" [" + tmpObject.account?.clan + "]",
						d * textSizeMult,
						g,
						5,
						"",
					);
					if (b != undefined) {
						graph.drawImage(
							b,
							shapeX + a.width / 2,
							shapeY - tmpObject.height * 1.4 - a.height / 2,
							b.width,
							a.height,
						);
					}
				}
			}
			graph.fillStyle = g;
			graph.fillRect(
				shapeX - (e / 2) * (tmpObject.health / tmpObject.maxHealth),
				shapeY - tmpObject.height * 1.16,
				(tmpObject.health / tmpObject.maxHealth) * e,
				10,
			);
		}
	}
	h = null;
	a = null;
}
function drawBackground() {
	drawSprite(
		graph,
		darkFillerSprite,
		0,
		0,
		maxScreenWidth,
		maxScreenHeight,
		0,
		false,
		0,
		0,
		0,
	);
}
function getCachedWall(a) {
	var b =
		a.left +
		"" +
		a.right +
		"" +
		a.top +
		"" +
		a.bottom +
		"" +
		a.topLeft +
		"" +
		a.topRight +
		"" +
		a.bottomLeft +
		"" +
		a.bottomRight +
		"" +
		a.edgeTile +
		"" +
		a.hasCollision;
	var d = cachedWalls[b];
	if (d == undefined && wallSprite != undefined && wallSprite.isLoaded) {
		var d = document.createElement("canvas");
		var e = d.getContext("2d");
		e.imageSmoothingEnabled = false;
		e.webkitImageSmoothingEnabled = false;
		e.mozImageSmoothingEnabled = false;
		d.width = a.scale;
		d.height = a.scale;
		e.drawImage(wallSprite, 0, 0, a.scale, a.scale);
		drawSprite(
			e,
			darkFillerSprite,
			12,
			12,
			a.scale - 24,
			a.scale - 24,
			0,
			false,
			0,
			0,
			0,
		);
		if (a.left == 1) {
			drawSprite(
				e,
				darkFillerSprite,
				0,
				12,
				12,
				a.scale - 24,
				0,
				false,
				0,
				0,
				0,
			);
		}
		if (a.right == 1) {
			drawSprite(
				e,
				darkFillerSprite,
				a.scale - 12,
				12,
				12,
				a.scale - 24,
				0,
				false,
				0,
				0,
				0,
			);
		}
		if (a.top == 1) {
			drawSprite(
				e,
				darkFillerSprite,
				12,
				0,
				a.scale - 24,
				12,
				0,
				false,
				0,
				0,
				0,
			);
		}
		if (a.bottom == 1) {
			drawSprite(
				e,
				darkFillerSprite,
				12,
				a.scale - 12,
				a.scale - 24,
				12,
				0,
				false,
				0,
				0,
				0,
			);
		}
		if (!a.hasCollision || (a.topLeft == 1 && a.top == 1 && a.left == 1)) {
			drawSprite(e, darkFillerSprite, 0, 0, 12, 12, 0, false, 0, 0, 0);
		}
		if (!a.hasCollision || (a.topRight == 1 && a.top == 1 && a.right == 1)) {
			drawSprite(
				e,
				darkFillerSprite,
				a.scale - 12,
				0,
				12,
				12,
				0,
				false,
				0,
				0,
				0,
			);
		}
		if (
			!a.hasCollision ||
			(a.bottomLeft == 1 && a.bottom == 1 && a.left == 1)
		) {
			drawSprite(
				e,
				darkFillerSprite,
				0,
				a.scale - 12,
				12,
				12,
				0,
				false,
				0,
				0,
				0,
			);
		}
		if (
			!a.hasCollision ||
			(a.bottomRight == 1 && a.bottom == 1 && a.right == 1)
		) {
			drawSprite(
				e,
				darkFillerSprite,
				a.scale - 12,
				a.scale - 12,
				12,
				12,
				0,
				false,
				0,
				0,
				0,
			);
		}
		cachedWalls[b] = d;
	}
	return d;
}
var tilesPerFloorTile = 8;
function getCachedFloor(a) {
	var b =
		a.spriteIndex +
		"" +
		a.left +
		"" +
		a.right +
		"" +
		a.top +
		"" +
		a.bottom +
		"" +
		a.topLeft +
		"" +
		a.topRight;
	var d = cachedFloors[b];
	if (d == undefined && sideWalkSprite != null && sideWalkSprite.isLoaded) {
		var d = document.createElement("canvas");
		var e = d.getContext("2d");
		e.imageSmoothingEnabled = false;
		e.webkitImageSmoothingEnabled = false;
		e.mozImageSmoothingEnabled = false;
		d.width = a.scale;
		d.height = a.scale * (a.bottom ? 0.51 : 1);
		e.drawImage(floorSprites[a.spriteIndex], 0, 0, a.scale, a.scale);
		var f = a.scale / tilesPerFloorTile;
		if (a.topLeft == 1) {
			renderSideWalks(e, 1, f, 0, 0, 0, 0, 0);
		}
		if (a.topRight == 1) {
			renderSideWalks(e, 1, f, mathPI, a.scale - f, 0, 0, 0);
		}
		if (a.left == 1) {
			if (a.top == 1) {
				renderSideWalks(e, 2, f, null, 0, 0, 0, f);
				renderSideWalks(e, tilesPerFloorTile - 2, f, 0, 0, f * 2, 0, f);
			} else {
				renderSideWalks(e, tilesPerFloorTile, f, 0, 0, 0, 0, f);
			}
		}
		if (a.right == 1) {
			if (a.top == 1) {
				renderSideWalks(e, 2, f, null, a.scale - f, 2, 0, f);
				renderSideWalks(
					e,
					tilesPerFloorTile - 2,
					f,
					mathPI,
					a.scale - f,
					f * 2,
					0,
					f,
				);
			} else {
				renderSideWalks(e, tilesPerFloorTile, f, mathPI, a.scale - f, 0, 0, f);
			}
		}
		if (a.top == 1) {
			renderSideWalks(e, tilesPerFloorTile, f, mathPI / 2, 0, 0, f, 0);
		}
		if (a.bottom == 1) {
			renderSideWalks(e, tilesPerFloorTile, f, 0, 0, a.scale - f, f, 0);
		}
		cachedFloors[b] = d;
	}
	return d;
}
function renderSideWalks(a, b, d, e, f, h, g, l) {
	for (var m = 0; m < b; ++m) {
		a.drawImage(sideWalkSprite, f, h, d, d);
		if (e != null) {
			a.save();
			a.translate(f + d / 2, h + d / 2);
			a.rotate(e);
			a.drawImage(ambientSprites[0], -(d / 2), -(d / 2), d, d);
			a.restore();
		}
		f += g;
		h += l;
	}
}
var tmpTlSprite = null;
function drawMap(a) {
	var b;
	if (gameMap != null) {
		for (var d = 0; d < gameMap.tiles.length; ++d) {
			b = gameMap.tiles[d];
			if (a == 0) {
				if (
					!b.wall &&
					canSee(b.x - startX, b.y - startY, mapTileScale, mapTileScale)
				) {
					tmpTlSprite = getCachedFloor(b);
					if (tmpTlSprite != undefined) {
						drawSprite(
							graph,
							tmpTlSprite,
							b.x - startX,
							b.y - startY,
							tmpTlSprite.width,
							tmpTlSprite.height,
							0,
							false,
							0,
							0,
							0,
						);
					}
				}
			} else if (a == 1) {
				if (
					b.wall &&
					!b.bottom &&
					canSee(
						b.x - startX,
						b.y - startY + mapTileScale * 0.5,
						mapTileScale,
						mapTileScale * 0.75,
					)
				) {
					drawSprite(
						graph,
						wallSpritesSeg[b.spriteIndex],
						b.x - startX,
						b.y + mathRound(mapTileScale / 2) - startY,
						mapTileScale,
						mapTileScale / 2,
						0,
						true,
						-(b.scale / 2),
						0.5,
						b.scale,
					);
				}
			} else if (
				a == 2 &&
				b.wall &&
				canSee(
					b.x - startX,
					b.y - startY - mapTileScale * 0.5,
					mapTileScale,
					mapTileScale,
				)
			) {
				tmpTlSprite = getCachedWall(b);
				if (tmpTlSprite != undefined) {
					drawSprite(
						graph,
						tmpTlSprite,
						b.x - startX,
						mathRound(b.y - mapTileScale / 2 - startY),
						mapTileScale,
						mapTileScale,
						0,
						false,
						0,
						0,
						0,
					);
				}
			}
		}
		if (a == 0) {
			for (d = 0; d < gameMap.pickups.length; ++d) {
				b = gameMap.pickups[d];
				if (b.active && canSee(b.x - startX, b.y - startY, 0, 0)) {
					if (b.type == "healthpack") {
						drawSprite(
							graph,
							healthPackSprite,
							b.x - b.scale / 2 - startX,
							b.y - b.scale / 2 - startY,
							b.scale,
							b.scale,
							0,
							true,
							0,
							0.5,
							0,
						);
					} else {
						drawSprite(
							graph,
							lootCrateSprite,
							b.x - b.scale / 2 - startX,
							b.y - b.scale / 2 - startY,
							b.scale,
							b.scale,
							0,
							true,
							0,
							0.5,
							0,
						);
					}
				}
			}
		}
	}
}
var tmpShadow = null;
function drawSprite(a, b, d, e, f, h, g, l, m, k, p) {
	if (b != null && b != undefined && b.width > 0) {
		d = mathFloor(d);
		e = mathFloor(e);
		f = mathFloor(f);
		h = mathFloor(h);
		m = mathFloor(m);
		a.rotate(g);
		a.drawImage(b, d, e, f, h);
		if (l && showShadows) {
			a.globalAlpha = 1;
			a.translate(0, m);
			tmpShadow = getCachedShadow(b, f, h + p, k);
			if (tmpShadow != null && tmpShadow != undefined) {
				a.drawImage(tmpShadow, d, e + h);
			}
			a.rotate(-g);
			a.translate(0, -m);
		}
	}
}
var shadowIntensity = 0.16;
function getCachedShadow(a, b, d, e) {
	var f = cachedShadows[a.index];
	if (f == undefined && b != 0 && a != undefined && a.isLoaded) {
		var f = document.createElement("canvas");
		var h = f.getContext("2d");
		h.imageSmoothingEnabled = false;
		h.webkitImageSmoothingEnabled = false;
		h.mozImageSmoothingEnabled = false;
		f.width = b;
		f.height = d;
		h.globalAlpha = e == 0.5 ? shadowIntensity : shadowIntensity * 0.75;
		h.scale(1, -e);
		h.transform(1, 0, 0, 1, 0, 0);
		h.drawImage(a, 0, -d, b, d);
		b = h.getImageData(0, 0, f.width, f.height);
		d = b.data;
		e = 0;
		for (var g = d.length; e < g; e += 4) {
			d[e] = 0;
			d[e + 1] = 0;
			d[e + 2] = 0;
			d[e + 3] = d[e + 3];
		}
		h.putImageData(b, 0, 0);
		cachedShadows[a.index] = f;
	}
	return f;
}
function canSee(a, b, d, e) {
	return a + d > 0 && b + e > 0 && a < maxScreenWidth && b < maxScreenHeight;
}
var notificationsSize = textSizeMult * 80;
var notificationsGap = notificationsSize * 1.6;
var notifications = [];
for (var i = 0; i < 3; ++i) {
	notifications.push(new AnimText());
}
var notificationIndex = 0;
function showNotification(a) {
	a = a.toUpperCase();
	notificationIndex++;
	if (notificationIndex >= notifications.length) {
		notificationIndex = 0;
	}
	notifications[notificationIndex].text = a;
	notifications[notificationIndex].alpha = 1;
	notifications[notificationIndex].x = maxScreenWidth / 2;
	notifications[notificationIndex].fadeSpeed = 0.003;
	notifications[notificationIndex].fadeDelay = 800;
	notifications[notificationIndex].fontSize = notificationsSize * viewMult;
	notifications[notificationIndex].scale = 1;
	notifications[notificationIndex].scaleSpeed = 0.005;
	notifications[notificationIndex].minScale = 1;
	notifications[notificationIndex].maxScale = 1.5;
	notifications[notificationIndex].cachedImage = renderShadedAnimText(
		a,
		notificationsSize * viewMult,
		"#ffffff",
		7,
		"Italic ",
	);
	notifications[notificationIndex].active = true;
	positionNotifications();
}
var activeNotifications = 0;
function positionNotifications() {
	for (var a = (activeNotifications = 0); a < notifications.length; ++a) {
		if (notifications[a].active) {
			activeNotifications++;
		}
	}
	if (activeNotifications > 0) {
		notifications.sort(sortByAlpha);
		var b = 0;
		var d =
			maxScreenHeight -
			notifications.length * notificationsGap * viewMult -
			100;
		for (var a = 0; a < notifications.length; ++a) {
			if (notifications[a].active) {
				notifications[a].y = d + notificationsGap * viewMult * b;
				b++;
			}
		}
	}
}
function sortByAlpha(a, b) {
	if (a.alpha < b.alpha) {
		return 1;
	} else if (b.alpha < a.alpha) {
		return -1;
	} else {
		return 0;
	}
}
function updateNotifications(a) {
	graph.fillStyle = "#fff";
	for (var b = 0; b < notifications.length; ++b) {
		if (notifications[b].active) {
			notifications[b].update(a);
			notifications[b].draw();
		}
	}
	graph.globalAlpha = 1;
}
var animTexts = [];
for (var i = 0; i < 20; i++) {
	animTexts.push(new AnimText());
}
var shadowOffset = 6;
var tmpDrawText = null;
function AnimText() {
	this.text = "";
	this.scaleSpeed =
		this.minScale =
		this.maxScale =
		this.fontSize =
		this.scale =
		this.ySpeed =
		this.xSpeed =
		this.y =
		this.x =
			0;
	this.active = false;
	this.alpha = 1;
	this.fadeSpeed = 0;
	this.useStart = false;
	this.moveDelay = this.fadeDelay = 0;
	this.removable = false;
	this.textType = "";
	this.color = "#fff";
	this.cachedImage = null;
	this.update = function (a) {
		if (this.active) {
			this.scale += this.scaleSpeed * a;
			if (this.scaleSpeed > 0) {
				if (this.scale >= this.maxScale) {
					this.scale = this.maxScale;
					this.scaleSpeed *= -1;
				}
			} else if (this.scale < this.minScale) {
				this.scale = this.minScale;
				this.scaleSpeed = 0;
			}
			if (this.moveDelay > 0) {
				this.moveDelay -= a;
			} else {
				this.x += this.xSpeed * a;
				this.y += this.ySpeed * a;
			}
			if (this.fadeDelay > 0) {
				this.fadeDelay -= a;
			} else {
				this.alpha -= this.fadeSpeed * a;
				if (this.alpha <= 0) {
					this.alpha = 0;
					this.active = false;
				}
			}
		}
	};
	this.draw = function () {
		if (this.active) {
			graph.globalAlpha = this.alpha;
			if (this.useStart) {
				if (this.cachedImage != undefined) {
					graph.drawImage(
						this.cachedImage,
						this.x - startX - (this.cachedImage.width / 2) * this.scale,
						this.y - startY - (this.cachedImage.height / 2) * this.scale,
						this.cachedImage.width * this.scale,
						this.cachedImage.height * this.scale,
					);
				}
			} else if (this.cachedImage != undefined) {
				graph.drawImage(
					this.cachedImage,
					this.x - (this.cachedImage.width / 2) * this.scale,
					this.y - (this.cachedImage.height / 2) * this.scale,
					this.cachedImage.width * this.scale,
					this.cachedImage.height * this.scale,
				);
			}
		}
	};
}
function updateAnimTexts(a) {
	graph.lineJoin = "round";
	graph.textAlign = "center";
	graph.textBaseline = "middle";
	for (var b = 0; b < animTexts.length; b++) {
		animTexts[b].update(a);
		if (animTexts[b].active) {
			animTexts[b].draw();
		}
	}
	graph.globalAlpha = 1;
}
function getReadyAnimText() {
	for (var a = 0; a < animTexts.length; ++a) {
		if (!animTexts[a].active) {
			return animTexts[a];
		}
	}
	return null;
}
function startAnimText(a, b, d, e, f, h, g, l, m, k, p, n, r, u, v, t, w) {
	var q = getReadyAnimText();
	if (q != null) {
		q.text = a.toUpperCase();
		q.x = b;
		q.y = d;
		q.xSpeed = e;
		q.ySpeed = f;
		q.fadeSpeed = h;
		q.fontSize = g * viewMult;
		q.scale = 1;
		q.maxScale = 1.6;
		q.minScale = 1;
		q.alpha = 1;
		q.scaleSpeed = l;
		q.useStart = m;
		q.fadeDelay = k;
		q.removable = p;
		q.moveDelay = n;
		q.alpha = u;
		q.color = v;
		q.textType = t;
		q.cachedImage = renderShadedAnimText(q.text, q.fontSize, q.color, w, r);
		q.active = true;
	}
}
function startBigAnimText(a, b, d, e, f, h, g, l) {
	if (deactiveAnimTexts("big")) {
		if (a.length > 0) {
			startAnimText(
				a,
				maxScreenWidth / 2,
				bigTextY,
				0,
				-0.1,
				0.0025,
				bigTextSize * l,
				e ? 0.005 : 0,
				false,
				d,
				g,
				d,
				"Italic ",
				1,
				f,
				"big",
				8,
			);
		}
		if (b.length > 0) {
			startAnimText(
				b,
				maxScreenWidth / 2,
				bigTextY + textGap * viewMult * l,
				0,
				-0.04,
				0.0025,
				(medTextSize / 2) * l,
				e ? 0.003 : 0,
				false,
				d,
				g,
				d,
				"Italic ",
				1,
				h,
				"big",
				8,
			);
		}
	}
}
function startMovingAnimText(a, b, d, e, f) {
	b += randomInt(-25, 25);
	d += randomInt(-20, 5);
	startAnimText(
		a,
		b,
		d,
		0,
		-0.15,
		0.0025,
		maxScreenHeight / 26 + f,
		0.005,
		true,
		350,
		false,
		0,
		"",
		1,
		e,
		"moving",
		5,
	);
}
function deactiveAnimTexts(a) {
	for (var b = 0; b < animTexts.length; ++b) {
		if (animTexts[b].active) {
			if (animTexts[b].removable) {
				animTexts[b].active = false;
			} else if (animTexts[b].textType == a) {
				return false;
			}
		}
	}
	return true;
}
function deactiveAllAnimTexts() {
	for (var a = 0; a < animTexts.length; ++a) {
		animTexts[a].active = false;
	}
}
var cachedTextRenders = [];
var cachedText = (tmpIndex = null);
function renderShadedAnimText(a, b, d, e, f) {
	tmpIndex = a + "" + b + "" + d + "" + f;
	cachedText = cachedTextRenders[tmpIndex];
	if (cachedText == undefined) {
		var h = document.createElement("canvas");
		var g = h.getContext("2d");
		g.imageSmoothingEnabled = false;
		g.webkitImageSmoothingEnabled = false;
		g.mozImageSmoothingEnabled = false;
		g.textAlign = "center";
		g.font = f + b + "px mainFont";
		h.width = g.measureText(a).width * 1.08;
		h.height = b * 1.8 + e;
		g.fillStyle = shadeColor(d, -18);
		g.font = f + b + "px mainFont";
		g.textBaseline = "middle";
		g.textAlign = "center";
		for (var l = 1; l < e; ++l) {
			g.fillText(a, h.width / 2, h.height / 2 + l);
		}
		g.fillStyle = d;
		g.font = f + b + "px mainFont";
		g.textBaseline = "middle";
		g.textAlign = "center";
		g.fillText(a, h.width / 2, h.height / 2);
		cachedText = h;
		cachedTextRenders[tmpIndex] = cachedText;
	}
	return cachedText;
}
var cachedParticles = [];
var particleIndex = 0;
for (var i = 0; i < 700; ++i) {
	cachedParticles.push(new Particle());
}
function updateParticles(a, b) {
	for (var d = 0; d < cachedParticles.length; ++d) {
		if (
			(showParticles || cachedParticles[d].forceShow) &&
			cachedParticles[d].active &&
			canSee(
				cachedParticles[d].x - startX,
				cachedParticles[d].y - startY,
				cachedParticles[d].scale,
				cachedParticles[d].scale,
			)
		) {
			if (b == cachedParticles[d].layer) {
				cachedParticles[d].update(a);
				cachedParticles[d].draw();
			}
		} else {
			cachedParticles[d].active = false;
		}
	}
	graph.globalAlpha = 1;
}
function Particle() {
	this.rotation =
		this.initScale =
		this.scale =
		this.dir =
		this.initSpeed =
		this.speed =
		this.y =
		this.x =
			0;
	this.active = false;
	this.layer = this.spriteIndex = 0;
	this.alpha = 1;
	this.fadeSpeed = 0;
	this.forceShow = this.checkCollisions = false;
	this.tmpScale = this.maxDuration = this.duration = 0;
	this.update = function (a) {
		if (this.active) {
			if (this.maxDuration > 0) {
				this.duration += a;
				this.tmpScale = 1 - this.duration / this.maxDuration;
				this.tmpScale = this.tmpScale < 0 ? 0 : this.tmpScale;
				this.scale = this.initScale * this.tmpScale;
				if (this.scale < 1) {
					this.active = false;
				}
				this.speed = this.initSpeed * this.tmpScale;
				if (this.speed <= 0.01) {
					this.speed = 0;
				} else {
					this.x += this.speed * a * mathCOS(this.dir);
					this.y += this.speed * a * mathSIN(this.dir);
				}
				if (this.duration >= this.maxDuration) {
					this.active = false;
				}
			}
			if (this.alpha > 0) {
				this.alpha -= this.fadeSpeed * a;
			}
			if (this.alpha <= 0) {
				this.alpha = 0;
				this.active = false;
			}
			if (this.checkCollisions) {
				this.checkInWall();
			}
		}
	};
	this.draw = function () {
		if (
			this.active &&
			particleSprites[this.spriteIndex] != null &&
			IsImageOk(particleSprites[this.spriteIndex])
		) {
			graph.globalAlpha = this.alpha;
			if (this.rotation != 0) {
				graph.save();
				graph.translate(this.x - startX, this.y - startY);
				graph.rotate(this.rotation);
				graph.drawImage(
					particleSprites[this.spriteIndex],
					-(this.scale / 2),
					-(this.scale / 2),
					this.scale,
					this.scale,
				);
				graph.restore();
			} else {
				graph.drawImage(
					particleSprites[this.spriteIndex],
					this.x - startX - this.scale / 2,
					this.y - startY - this.scale / 2,
					this.scale,
					this.scale,
				);
			}
		}
	};
	this.checkInWall = function () {
		for (var a = 0; a < gameMap.tiles.length; ++a) {
			if (gameMap.tiles[a].wall && gameMap.tiles[a].hasCollision) {
				var tmpTl = gameMap.tiles[a];
				if (
					this.x >= tmpTl.x &&
					this.x <= tmpTl.x + tmpTl.scale &&
					this.y > tmpTl.y &&
					this.y < tmpTl.y + tmpTl.scale - player.height
				) {
					this.active = false;
				}
			}
		}
	};
}
function getReadyParticle() {
	particleIndex++;
	if (particleIndex >= cachedParticles.length) {
		particleIndex = 0;
	}
	return cachedParticles[particleIndex];
}
var tmpParticle = null;
function particleCone(a, b, d, e, f, h, g, l, m) {
	if (showParticles) {
		for (var k = 0; k < a; ++k) {
			tmpParticle = getReadyParticle();
			tmpParticle.forceShow = false;
			tmpParticle.checkCollisions = false;
			tmpParticle.x = b;
			tmpParticle.y = d;
			tmpParticle.rotation = 0;
			tmpParticle.alpha = 1;
			tmpParticle.speed = 0;
			tmpParticle.fadeSpeed = 0;
			tmpParticle.initSpeed = 0;
			tmpParticle.initScale = randomFloat(3, 9);
			tmpParticle.spriteIndex = 0;
			tmpParticle.maxDuration = -1;
			tmpParticle.duration = 0;
			if (k == 0 && l == 2 && m) {
				tmpParticle.spriteIndex = 3;
				tmpParticle.layer = 0;
			} else {
				tmpParticle.dir = e + randomFloat(-f, f);
				tmpParticle.initScale = g * randomFloat(1.5, 1.8);
				tmpParticle.initSpeed = h * randomFloat(0.3, 1.3);
				tmpParticle.maxDuration = randomFloat(0.8, 1.1) * 360;
				tmpParticle.spriteIndex = l;
				tmpParticle.layer = randomInt(0, 1);
			}
			tmpParticle.scale = tmpParticle.initScale;
			tmpParticle.active = true;
		}
	}
}
var liquidSpread = 35;
function createLiquid(a, b, d, e) {
	tmpParticle = getReadyParticle();
	tmpParticle.x = a + randomFloat(-liquidSpread, liquidSpread);
	tmpParticle.y = b + randomFloat(-liquidSpread, liquidSpread);
	tmpParticle.initSpeed = 0;
	tmpParticle.maxDuration = -1;
	tmpParticle.duration = 0;
	tmpParticle.initScale = randomFloat(60, 150);
	tmpParticle.scale = tmpParticle.initScale;
	tmpParticle.rotation = randomInt(0, 5);
	tmpParticle.alpha = randomFloat(0.3, 0.5);
	tmpParticle.fadeSpeed = 0.00002;
	tmpParticle.checkCollisions = false;
	tmpParticle.spriteIndex = randomInt(e, e + 1);
	tmpParticle.layer = 0;
	tmpParticle.forceShow = false;
	tmpParticle.active = true;
}
var tmpDist = 0;
var maxShakeDist = 2000;
var maxExplosionDuration = 400;
var maxShake = 9;
var tmpShake = 0;
var tmpDir = 0;
function createExplosion(a, b, d) {
	tmpDist = getDistance(a, b, player.x, player.y);
	if (tmpDist <= maxShakeDist) {
		tmpDir = getAngle(a, player.x, b, player.y);
		screenShake(d * maxShake * (1 - tmpDist / maxShakeDist), tmpDir);
	}
	playSound("explosion", a, b);
	createSmokePuff(a, b, d, true, 1);
}
function createSmokePuff(a, b, d, e, f) {
	createFlash(a, b, d);
	for (var h = 0; h < 30; ++h) {
		tmpParticle = getReadyParticle();
		tmpParticle.dir =
			mathRound(randomFloat(-mathPI, mathPI) / (mathPI / 3)) * (mathPI / 3);
		tmpParticle.forceShow = true;
		tmpParticle.spriteIndex = 2;
		tmpParticle.checkCollisions = true;
		tmpParticle.alpha = 1;
		tmpParticle.fadeSpeed = 0;
		tmpParticle.initSpeed = 0;
		tmpParticle.maxDuration = -1;
		tmpParticle.duration = 0;
		tmpParticle.layer = 1;
		tmpParticle.rotation = 0;
		if (h == 0 && e) {
			tmpParticle.x = a;
			tmpParticle.y = b;
			tmpParticle.initScale = randomFloat(50, 60) * d;
			tmpParticle.rotation = randomInt(0, 5);
			tmpParticle.speed = 0;
			tmpParticle.fadeSpeed = 0.0002;
			tmpParticle.checkCollisions = false;
			tmpParticle.spriteIndex = 6;
			tmpParticle.layer = 0;
		} else if (h <= 10) {
			tmpDist = h * d;
			tmpParticle.x = a + tmpDist * mathCOS(tmpParticle.dir);
			tmpParticle.y = b + tmpDist * mathSIN(tmpParticle.dir);
			tmpParticle.initScale = randomFloat(30, 33) * d;
			tmpParticle.initSpeed = (3 / tmpParticle.initScale) * d * f;
			tmpParticle.maxDuration = maxExplosionDuration * 0.8;
		} else {
			tmpDist = randomFloat(0, 10) * d;
			tmpParticle.x = a + tmpDist * mathCOS(tmpParticle.dir);
			tmpParticle.y = b + tmpDist * mathSIN(tmpParticle.dir);
			var g = randomFloat(0.7, 1.4);
			tmpParticle.initScale = d * 11 * g;
			tmpParticle.initSpeed = (((12 / tmpParticle.initScale) * d) / g) * f;
			tmpParticle.maxDuration = maxExplosionDuration * g;
		}
		tmpParticle.scale = tmpParticle.initScale;
		tmpParticle.active = true;
	}
}
function stillDustParticle(a, b, d) {
	tmpParticle = getReadyParticle();
	tmpParticle.x = a + randomInt(-10, 10);
	tmpParticle.y = b;
	tmpParticle.initScale = randomFloat(18, 25);
	tmpParticle.initSpeed = 0.05;
	tmpParticle.maxDuration = 600;
	tmpParticle.duration = 0;
	tmpParticle.dir = randomFloat(0, mathPI * 2);
	tmpParticle.rotation = 0;
	tmpParticle.spriteIndex = 2;
	tmpParticle.layer = d ? 1 : 0;
	tmpParticle.alpha = 1;
	tmpParticle.fadeSpeed = 0;
	tmpParticle.checkCollisions = false;
	tmpParticle.forceShow = d;
	tmpParticle.active = true;
}
var then = Date.now();
window.requestAnimFrame = (function () {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (a, b) {
			window.setTimeout(a, 1000 / targetFPS);
		}
	);
})();
let elapsed;
function callUpdate() {
	requestAnimFrame(callUpdate);
	currentTime = Date.now();
	elapsed = currentTime - then;
	if (elapsed > 1000 / targetFPS) {
		then = currentTime - (elapsed % (1000 / targetFPS));
		updateGameLoop();
	}
}
callUpdate();
