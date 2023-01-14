window.onload = startPreloadChain;

const whiteStonesArr = ['white-stone1', 'white-stone2'];
const blackStonesArr = ['black-stone1', 'black-stone2'];
const bagsArr = ['bag-white'];

let stonesData = null;


function startPreloadChain() {
	console.log('startPreloadChain');

	//+++DEBUG
	// const mainLayer = document.querySelector('.main-layer');
	// mainLayer.style.display = 'none';
	//---DEBUG

	preloadStones(whiteStonesArr.concat(blackStonesArr).concat(bagsArr), onStonesPreloaded);

	//+++DEBUG
	// loadStonesData();
	//---DEBUG
}

function preloadStones(sources, callback) {
	const images = [];
	let loadedImagesCounter = 0;
	for (let i = 0; i < sources.length; i++) {
		const srcName = sources[i];
		images[srcName] = new Image();
		images[srcName].onload = () => {
			if (++loadedImagesCounter >= sources.length)
				callback(images);
		}
		images[srcName].src = 'img/stones/' + srcName + '.png';
	}
}

function onStonesPreloaded() {
	console.log('onStonesPreloaded');
	loadStonesData();
}

function loadStonesData() {
	console.log('loadStonesData');

	fetch('js/stonesData.json')
		.then(response => response.json())
		.then(result => {
			stonesData = result;
			return init();
		})
		.catch(error => {
			console.log(error);
		})
}

function init() {
	console.log(":::INIT:::");
	const loadLayer = document.querySelector('.loading-layer');
	loadLayer.style.display = 'none';
	const mainLayer = document.querySelector('.main-layer');
	mainLayer.style.display = 'flex';

	resizeWindow();
	initControls();
}

function initControls() {
	const dirStonesImg = "img/stones/";
	const fileType = ".png";
	const timeoutNext = .53;
	const timeoutSec = 0.3;
	const animationOn = "displayOn 1s ease-out";
	const animationOff = "displayOff " + timeoutNext + "s ease-out";
	//запись кнопок и элементов для взаимодействия с ними
	//--------------Layers--------------
	const mainLayer = document.querySelector(".main-layer");
	const stoneWhiteLayer = document.querySelector(".stone-layer_white");
	const stoneBlackLayer = document.querySelector(".stone-layer_black");
	const resultLayer = document.querySelector(".result-layer");
	const infoLayer = document.querySelector(".info-layer");

	//--------------Buttons-------------
	const mainBtn = document.querySelector('.main-layer__btn');
	const whiteStoneBtn = document.querySelector('.stone-layer__btn_white');
	const blackStoneBtn = document.querySelector('.stone-layer__btn_black');
	const questionBtn = document.querySelector('.btn__question');
	const infoBtn = document.querySelector('.info-layer__btn');

	//--------------Bags----------------
	const whiteStoneBag = document.querySelector('.bag_white');
	const blackStoneBag = document.querySelector('.bag_black');

	//-------------Stones----------------
	const whiteStone = document.querySelector('.stone_white');
	const blackStone = document.querySelector('.stone_black');

	//-------------StonesImg----------------
	const blackStoneImg = document.querySelectorAll(".black-stone_img");
	const whiteStoneImg = document.querySelectorAll(".white-stone_img");

	//-------------Info------------------
	const info = document.querySelector('.info');
	let activePage = mainLayer;

	let stone = "";

	function arrayRandElement(arr) {
		const rand = Math.floor(Math.random() * arr.length);
		return arr[rand];
	}

	function ommanipadmehum() {
		console.log("ཨོཾ་མ་ཎི་པ་དྨེ་ཧཱུྃ།\n".repeat(108));
	}

	//document.addEventListener('click',e => console.log(e.target));

	//Buttons push
	mainBtn.addEventListener('mousedown', () => {
		mainLayer.style.setProperty("animation", animationOff);
		activePage = stoneWhiteLayer;
		setTimeout(() => {
			mainLayer.style.setProperty('display', 'none');
			stoneWhiteLayer.style.setProperty('display', 'flex');
			stoneWhiteLayer.style.setProperty("animation", animationOn);
		}, timeoutNext * 1000);
	});

	whiteStoneBtn.addEventListener('mousedown', () => {
		stoneWhiteLayer.style.setProperty("animation", animationOff);
		activePage = stoneBlackLayer;
		setTimeout(() => {
			stoneWhiteLayer.style.setProperty('display', 'none');
			stoneBlackLayer.style.setProperty('display', 'flex');
			stoneBlackLayer.style.setProperty("animation", animationOn);
		}, timeoutNext * 1000);
	});

	blackStoneBtn.addEventListener('mousedown', () => {
		stoneBlackLayer.style.setProperty("animation", animationOff);
		fillText(stone);
		activePage = resultLayer;
		setTimeout(() => {
			stoneBlackLayer.style.setProperty('display', 'none');
			resultLayer.style.setProperty('display', 'block');
			resultLayer.style.setProperty("animation", animationOn);
		}, timeoutNext * 1000);
	});

	questionBtn.addEventListener('mousedown', () => {
		resultLayer.style.setProperty("animation", animationOff);
		activePage = mainLayer;

		whiteStone.style.setProperty("transform", "scale(0.6) translateY(20rem)");
		whiteStone.style.setProperty("opacity", "0");
		whiteStoneBag.style.setProperty("animation", "heardBeat 2s ease-in-out infinite");
		whiteStoneBag.style.setProperty("pointer-events", "auto");
		whiteStoneBtn.style.setProperty("visibility", "hidden");

		blackStone.style.setProperty("transform", "scale(0.6) translateY(20rem)");
		blackStone.style.setProperty("opacity", "0");
		blackStoneBag.style.setProperty("animation", "heardBeat 2s ease-in-out infinite");
		blackStoneBag.style.setProperty("pointer-events", "auto");
		blackStoneBtn.style.setProperty("visibility", "hidden");

		stone = "";

		setTimeout(() => {
			resultLayer.style.setProperty('display', 'none');
			mainLayer.style.setProperty('display', 'flex');
			mainLayer.style.setProperty("animation", animationOn);
		}, timeoutNext * 1000);
	});

	info.addEventListener('mousedown', () => {
		activePage.style.setProperty("animation", animationOff);
		setTimeout(() => {
			activePage.style.setProperty('display', 'none');
			infoLayer.style.setProperty('display', 'flex');
			infoLayer.style.setProperty("animation", animationOn);
		}, timeoutNext * 1000);
	});

	infoBtn.addEventListener('mousedown', () => {
		infoLayer.style.setProperty("animation", animationOff);
		setTimeout(() => {
			infoLayer.style.setProperty('display', 'none');
			activePage.style.setProperty('display', activePage == resultLayer ? 'block' : 'flex');
			activePage.style.setProperty("animation", animationOn);
		}, timeoutNext * 1000);
	});


	//Bags push & random stones

	whiteStoneBag.addEventListener('mousedown', () => {
		whiteStoneBag.style.setProperty("animation", "none 2s ease-in-out infinite");
		whiteStoneBag.style.setProperty("pointer-events", "none");

		let whiteSt = arrayRandElement(whiteStonesArr);
		stone += "w" + whiteSt[whiteSt.length - 1];

		whiteSt = dirStonesImg + whiteSt + fileType;
		whiteStoneImg[0].src = whiteSt;
		whiteStoneImg[1].src = whiteSt;

		setTimeout(() => {
			whiteStone.style.setProperty("transform", "scale(1) translateY(0)");
			whiteStone.style.setProperty("opacity", "1");
			whiteStoneBtn.style.setProperty("visibility", "visible");
		}, timeoutSec * 1000);
		//ommanipadmehum();
	});

	blackStoneBag.addEventListener('mousedown', () => {
		blackStoneBag.style.setProperty("animation", "none 2s ease-in-out infinite")
		blackStoneBag.style.setProperty("pointer-events", "none");

		let blackSt = arrayRandElement(blackStonesArr);
		stone += "_b" + blackSt[11];
		stone += blackSt[blackSt.length - 1] == 'e' ? 'r' : '';

		blackSt = dirStonesImg + blackSt + fileType;
		blackStoneImg[0].src = blackSt;
		blackStoneImg[1].src = blackSt;

		//console.log(blackSt + "; " + stone);

		setTimeout(() => {
			blackStone.style.setProperty("transform", "scale(1) translateY(0)");
			blackStone.style.setProperty("opacity", "1");

			blackStoneBtn.style.setProperty("visibility", "visible");
		}, timeoutSec * 1000);

		//ommanipadmehum();
	});

	//Native scroling
	document.body.addEventListener("touchmove", function (event) {
		event.preventDefault();
		event.stopPropagation();
	}, false);

}

function fillText(stone) {
	const id = stonesData.stones[stone];

	const name = document.querySelector(".tittle__result_name");
	const img = document.querySelector(".tittle__result_img");
	const inter = document.querySelector(".paragraph_inter");

	const tab = "&nbsp;&nbsp;&nbsp;&nbsp"

	name.innerHTML = "<span>Камень</span>: " + stonesData.articles[id].name;
	img.innerHTML = "<span>Образ</span>: " + stonesData.articles[id].img;
	inter.innerHTML = tab + "<span>Интерпретация</span>: " + stonesData.articles[id].inter;
}

function resizeWindow() {
	let vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);

	// Мы прослушиваем событие resize
	window.addEventListener('resize', () => {
		//console.log("resize");
		// Выполняем тот же скрипт, что и раньше
		let vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	});
}