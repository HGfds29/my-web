let bgImages = [];
let currentBgIndex = 0;
let bgContainer = document.getElementById('bg-container');
let petContainer = document.getElementById('pet');
let petImg = document.getElementById('pet-img');
let speechBubble = document.getElementById('speech');
let allImages = [];
let currentPetIndex = 0;
let isDragging = false;
let offsetX, offsetY;
let inventory = [];
let inventoryPanel = document.getElementById('inventory-panel');
let inventoryGrid = document.getElementById('inventory-grid');
let petFunds = 10000000;
let isBankrupt = false;
let isInsuranceActive = false;
let isRaidActive = false;
let fallingItems = [];
let eatTimer = null;
let lastEatenItem = null;
let canSpit = false;

function resolvePath(relativePath) {
	try {
		let parts = relativePath.split('/');
		let encodedParts = parts.map(encodeURIComponent);
		let encodedPath = encodedParts.join('/');
		let baseUrl = window.location.href;
		if (!baseUrl.endsWith('/')) {
			baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
		}
		return baseUrl + encodedPath;
	} catch (e) {
		console.error('路径解析失败:', relativePath, e);
		return relativePath;
	}
}

function initBackground() {
	bgImages.forEach(path => {
		let img = document.createElement('img');
		img.src = path;
		bgContainer.appendChild(img);
	});
	let images = bgContainer.querySelectorAll('img');
	if (images.length > 0) {
		images[0].classList.add('active');
		setInterval(() => {
			images[currentBgIndex].classList.remove('active');
			currentBgIndex = (currentBgIndex + 1) % images.length;
			images[currentBgIndex].classList.add('active');
		}, 5000);
	}
}

function initPet() {
	currentPetIndex = Math.floor(Math.random() * allImages.length);
	petImg.src = allImages[currentPetIndex];
	
	petContainer.style.left = (window.innerWidth / 2 - 100) + 'px';
	petContainer.style.top = (window.innerHeight / 2 - 100) + 'px';
}

function togglePet() {
	if (isBankrupt) {
		showSpeech('破产了...换不了造型了');
		return;
	}
	currentPetIndex = (currentPetIndex + 1) % allImages.length;
	petImg.src = allImages[currentPetIndex];
	showSpeech('换个姿势~');
}

function changeBg() {
	let images = bgContainer.querySelectorAll('img');
	if (images.length > 0) {
		images[currentBgIndex].classList.remove('active');
		currentBgIndex = (currentBgIndex + 1) % images.length;
		images[currentBgIndex].classList.add('active');
	}
}

function showAbout() {
	showSpeech('三角洲行动·蝶网页桌宠～点击宠物可以切换形象哦~');
}

let speechTimer;
function showSpeech(text) {
	speechBubble.textContent = text;
	speechBubble.classList.add('show');
	clearTimeout(speechTimer);
	speechTimer = setTimeout(() => {
		speechBubble.classList.remove('show');
	}, 2000);
}

petContainer.addEventListener('mousedown', function(e) {
	isDragging = true;
	offsetX = e.clientX - petContainer.offsetLeft;
	offsetY = e.clientY - petContainer.offsetTop;
	e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
	if (!isDragging) return;
	let x = e.clientX - offsetX;
	let y = e.clientY - offsetY;
	x = Math.max(0, Math.min(x, window.innerWidth - petContainer.offsetWidth));
	y = Math.max(0, Math.min(y, window.innerHeight - petContainer.offsetHeight));
	petContainer.style.left = x + 'px';
	petContainer.style.top = y + 'px';
});

document.addEventListener('mouseup', function() {
	isDragging = false;
});

petContainer.addEventListener('click', function(e) {
	if (!isDragging) {
		if (canSpit && lastEatenItem) {
			spitItem();
		} else {
			let messages = [
				'你好呀~',
				'今天也要元气满满！',
				'摸摸头~',
				'我是蝶，请多指教！',
				'嘿嘿~',
				'想吃好吃的吗？',
				'加油加油！'
			];
			let msg = messages[Math.floor(Math.random() * messages.length)];
			showSpeech(msg);
		}
	}
});

setInterval(() => {
	if (!isDragging && Math.random() < 0.3) {
		let messages = [
			'...',
			'好无聊呀~',
			'想出去玩吗？',
			'zZzz...',
			'哼歌中...'
		];
		let msg = messages[Math.floor(Math.random() * messages.length)];
		showSpeech(msg);
	}
}, 8000);

const ALERT_IMG = resolvePath('assets 蝶/鸢梦徊-滴滴滴滴滴滴滴滴滴滴滴滴滴滴滴滴滴滴滴滴...-20260707_224344_1.jpg');
const SCARED_IMG = resolvePath('assets 蝶/亿亿亿喵-鼠鼠蝶的日常_打不过就吱哇乱叫抱头鼠窜_...-20260707_223421_2.jpg');
const NORMAL_IMG = resolvePath('assets 蝶/麻薯饭堂-就这么窝囊地被捡走_三角洲行动_三角...-20260707_223250_1.jpg');
const BROKEN_IMG = resolvePath('assets 蝶/亿亿亿喵-鼠鼠蝶的日常_打不过就吱哇乱叫抱头鼠窜_...-20260707_223421_4.jpg');
const SPIT_IMG = resolvePath('assets 蝶/麻薯饭堂-就这么窝囊地被捡走_三角洲行动_三角...-20260707_223250_2.jpg');

function updateFundsDisplay() {
	let el = document.getElementById('pet-funds-amount');
	let panel = document.getElementById('pet-funds');
	let insBtn = document.getElementById('insurance-btn');
	let raidBtn = document.getElementById('raid-btn');
	if (petFunds <= 0) {
		el.textContent = '¥ 0';
		panel.classList.add('danger');
		insBtn.classList.add('disabled');
		raidBtn.classList.add('disabled');
	} else {
		el.textContent = '¥ ' + formatValue(petFunds);
		panel.classList.remove('danger');
		insBtn.classList.remove('disabled');
		if (petFunds >= 5000000) {
			raidBtn.classList.add('disabled');
		} else {
			raidBtn.classList.remove('disabled');
		}
	}
}

const GU_BILUO_IMAGES = [
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_1.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_2.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_3.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_4.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_5.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_6.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_7.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_8.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_9.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_10.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_11.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_12.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_13.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_14.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_15.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_16.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_17.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_18.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_19.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_20.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_21.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_22.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_23.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_24.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_25.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_26.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_27.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_28.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_29.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_30.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_31.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_32.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_33.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_34.jpg',
	'assets 蝶/顾笔落-三角洲工艺藏品素材(上)_三角洲素材_...-20260707_224116_35.jpg'
].map(resolvePath);

function triggerInsurance() {
	if (isBankrupt) {
		showSpeech('已经破产了...开不了保险了');
		return;
	}
	if (isInsuranceActive) {
		showSpeech('保险正在进行中...');
		return;
	}
	if (isRaidActive) {
		showSpeech('正在跑刀，等会儿再开保险');
		return;
	}
	isInsuranceActive = true;

	petFunds -= 1000000;
	updateFundsDisplay();
	showSpeech('开启保险 -¥1.0M');

	if (petFunds <= 0) {
		petFunds = 0;
		updateFundsDisplay();
		setTimeout(() => {
			isBankrupt = true;
			petImg.src = BROKEN_IMG;
			showSpeech('你的宠物破产了');
			isInsuranceActive = false;
		}, 1000);
		return;
	}

	let alertImg = document.createElement('img');
	alertImg.src = ALERT_IMG;
	alertImg.className = 'alert-image';
	
	let maxX = window.innerWidth - 150;
	let maxY = window.innerHeight - 150;
	let randomX = Math.random() * maxX;
	let randomY = Math.random() * maxY;
	
	alertImg.style.left = randomX + 'px';
	alertImg.style.top = randomY + 'px';
	document.body.appendChild(alertImg);

	let angle = Math.random() * Math.PI * 2;
	let distance = 220;
	let petX = randomX + 75 - 100 + Math.cos(angle) * distance;
	let petY = randomY + 75 - 100 + Math.sin(angle) * distance;
	
	petX = Math.max(0, Math.min(petX, window.innerWidth - 200));
	petY = Math.max(0, Math.min(petY, window.innerHeight - 200));

	petContainer.style.transition = 'all 0.8s ease';
	petContainer.style.left = petX + 'px';
	petContainer.style.top = petY + 'px';

	setTimeout(() => {
		alertImg.style.opacity = '0';
		setTimeout(() => {
			alertImg.remove();
		}, 500);
		
		petImg.src = SCARED_IMG;
		showSpeech('啊——！');
		
		petContainer.style.transition = 'transform 0.1s ease';
	}, 800);

	setTimeout(() => {
		petImg.src = NORMAL_IMG;
		showSpeech('呼呼...吓死了');
		startFallingItems();
		isInsuranceActive = false;
	}, 2500);
}

function triggerRaid() {
	if (isRaidActive) {
		showSpeech('正在跑刀中...');
		return;
	}
	if (isInsuranceActive) {
		showSpeech('保险进行中，等会儿再跑刀');
		return;
	}
	if (petFunds >= 5000000) {
		showSpeech('资产太多，不够穷！要<5M才能跑刀');
		return;
	}
	if (isBankrupt) {
		showSpeech('都破产了还跑什么刀...');
		return;
	}

	isRaidActive = true;
	document.getElementById('raid-btn').classList.add('disabled');
	showSpeech('出发跑刀！');

	let waitTime = 3000 + Math.random() * 3000;
	let boxCount = 3 + Math.floor(Math.random() * 8);

	setTimeout(() => {
		showSpeech('搜到' + boxCount + '个保险！');
		openRaidBox(0, boxCount);
	}, waitTime);
}

function openRaidBox(index, total) {
	if (index >= total) {
		showSpeech('跑刀完成！');
		isRaidActive = false;
		document.getElementById('raid-btn').classList.remove('disabled');
		return;
	}

	showSpeech('开保险 ' + (index + 1) + '/' + total);

	let alertImg = document.createElement('img');
	alertImg.src = ALERT_IMG;
	alertImg.className = 'alert-image';

	let maxX = window.innerWidth - 150;
	let maxY = window.innerHeight - 150;
	let randomX = Math.random() * maxX;
	let randomY = Math.random() * maxY;

	alertImg.style.left = randomX + 'px';
	alertImg.style.top = randomY + 'px';
	document.body.appendChild(alertImg);

	let angle = Math.random() * Math.PI * 2;
	let distance = 220;
	let petX = randomX + 75 - 100 + Math.cos(angle) * distance;
	let petY = randomY + 75 - 100 + Math.sin(angle) * distance;

	petX = Math.max(0, Math.min(petX, window.innerWidth - 200));
	petY = Math.max(0, Math.min(petY, window.innerHeight - 200));

	petContainer.style.transition = 'all 0.8s ease';
	petContainer.style.left = petX + 'px';
	petContainer.style.top = petY + 'px';

	setTimeout(() => {
		alertImg.style.opacity = '0';
		setTimeout(() => {
			if (alertImg.parentNode) alertImg.remove();
		}, 500);

		petImg.src = SCARED_IMG;
		showSpeech('啊——！');
		petContainer.style.transition = 'transform 0.1s ease';
	}, 800);

	setTimeout(() => {
		petImg.src = NORMAL_IMG;
		showSpeech('呼呼...第' + (index + 1) + '个搞定');
		startFallingItems();

		setTimeout(() => {
			openRaidBox(index + 1, total);
		}, 1500);
	}, 2500);
}

function startFallingItems() {
	let petLeft = petContainer.offsetLeft;
	let petTop = petContainer.offsetTop;
	let petWidth = 200;
	let petHeight = 200;

	let itemWidth = 80;
	let itemHeight = 80;

	let randomX = petLeft + petWidth / 2 - itemWidth / 2;
	randomX = Math.max(0, Math.min(randomX, window.innerWidth - itemWidth));

	let randomImg = GU_BILUO_IMAGES[Math.floor(Math.random() * GU_BILUO_IMAGES.length)];

	let img = document.createElement('img');
	img.src = randomImg;
	img.className = 'falling-item';
	img.style.left = randomX + 'px';
	img.style.top = '-100px';
	img.style.opacity = '0';
	img.dataset.imgSrc = randomImg;
	let collected = false;
	img.onclick = function() {
		if (collected) return;
		collected = true;
		addToInventory(randomImg);
		collectAnimation(img);
		removeFallingItem(img);
	};
	document.body.appendChild(img);

	let targetY = petTop + petHeight + 10;
	targetY = Math.min(targetY, window.innerHeight - itemHeight - 20);

	requestAnimationFrame(() => {
		img.style.transition = 'all 1.5s ease-in';
		img.style.top = targetY + 'px';
		img.style.opacity = '1';
		img.style.transform = 'rotate(' + (Math.random() * 30 - 15) + 'deg)';
	});

	fallingItems.push({ el: img, src: randomImg, collected: false });
	resetEatTimer();
}

function removeFallingItem(img) {
	fallingItems = fallingItems.filter(f => f.el !== img);
	if (fallingItems.length === 0 && eatTimer) {
		clearTimeout(eatTimer);
		eatTimer = null;
	}
}

function resetEatTimer() {
	if (eatTimer) clearTimeout(eatTimer);
	eatTimer = setTimeout(() => {
		eatUnclaimedItems();
	}, 5000);
}

function eatUnclaimedItems() {
	let remaining = fallingItems.filter(f => !f.collected && document.body.contains(f.el));
	if (remaining.length === 0) return;

	let firstItem = remaining[0];
	let itemX = parseFloat(firstItem.el.style.left);
	let itemY = parseFloat(firstItem.el.style.top);
	let itemW = 80;

	let savedPetTransition = petContainer.style.transition;
	let savedPetLeft = petContainer.offsetLeft;
	let savedPetTop = petContainer.offsetTop;

	showSpeech('饿死了...偷吃一个！');
	petContainer.style.transition = 'left 1.2s ease, top 1.2s ease';
	petContainer.style.left = (itemX + itemW / 2 - 100) + 'px';
	petContainer.style.top = (itemY - 20) + 'px';

	setTimeout(() => {
		firstItem.collected = true;
		let eatVal = getItemValue(firstItem.src);
		petFunds += eatVal;
		updateFundsDisplay();
		lastEatenItem = firstItem.src;
		canSpit = true;
		firstItem.el.style.transition = 'all 0.4s ease';
		firstItem.el.style.transform = 'scale(0.2)';
		firstItem.el.style.opacity = '0';
		setTimeout(() => {
			if (firstItem.el.parentNode) firstItem.el.remove();
		}, 400);
		removeFallingItem(firstItem.el);
		showSpeech('好吃！+' + formatValue(eatVal));

		setTimeout(() => {
			petContainer.style.transition = 'left 1s ease, top 1s ease';
			petContainer.style.left = savedPetLeft + 'px';
			petContainer.style.top = savedPetTop + 'px';
			setTimeout(() => {
				petContainer.style.transition = savedPetTransition;
			}, 1000);
		}, 800);
	}, 1300);
}

function spitItem() {
	canSpit = false;
	let src = lastEatenItem;
	let val = getItemValue(src);

	petImg.src = SPIT_IMG;
	showSpeech('呸！不好吃！');

	let petLeft = petContainer.offsetLeft;
	let petTop = petContainer.offsetTop;
	let petWidth = 200;
	let petHeight = 200;
	let itemWidth = 80;
	let itemHeight = 80;

	let dropX = petLeft + petWidth / 2 - itemWidth / 2;
	dropX = Math.max(0, Math.min(dropX, window.innerWidth - itemWidth));

	let img = document.createElement('img');
	img.src = src;
	img.className = 'falling-item';
	img.style.left = dropX + 'px';
	img.style.top = (petTop + petHeight / 2 - itemHeight / 2) + 'px';
	img.style.opacity = '0';
	img.style.transform = 'scale(0.3)';
	img.style.transition = 'all 0.6s ease';
	let collected = false;
	img.onclick = function() {
		if (collected) return;
		collected = true;
		addToInventory(src);
		collectAnimation(img);
	};
	document.body.appendChild(img);

	petFunds -= val;
	if (petFunds < 0) petFunds = 0;
	updateFundsDisplay();

	requestAnimationFrame(() => {
		img.style.opacity = '1';
		img.style.transform = 'rotate(' + (Math.random() * 30 - 15) + 'deg)';
		img.style.top = (petTop + petHeight + 10) + 'px';
	});

	setTimeout(() => {
		petImg.src = isBankrupt ? BROKEN_IMG : NORMAL_IMG;
		showSpeech('哼！还给你！');
		lastEatenItem = null;
	}, 800);
}

function getItemValue(imgSrc) {
	let hash = 0;
	for (let i = 0; i < imgSrc.length; i++) {
		hash = ((hash << 5) - hash) + imgSrc.charCodeAt(i);
		hash |= 0;
	}
	return ((Math.abs(hash) % 9990) + 10) * 1000;
}

function formatValue(val) {
	if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
	if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
	return val.toString();
}

function addToInventory(imgSrc) {
	if (!inventory.includes(imgSrc)) {
		inventory.push(imgSrc);
		renderInventory();
		let val = getItemValue(imgSrc);
		showSpeech('获得新物品！价值 ¥' + formatValue(val));
	}
}

function collectAnimation(img) {
	img.style.transition = 'all 0.5s ease';
	img.style.transform = 'scale(1.3)';
	img.style.opacity = '0';
	setTimeout(() => {
		img.remove();
	}, 500);
}

function toggleInventory() {
	inventoryPanel.classList.toggle('show');
}

function renderInventory() {
	let totalValue = 0;
	if (inventory.length === 0) {
		inventoryGrid.innerHTML = '<div class="inventory-empty">仓库空空的~</div>';
		document.getElementById('inventory-total-value').textContent = '¥ 0';
		return;
	}
	inventoryGrid.innerHTML = '';
	inventory.forEach((src, index) => {
		let val = getItemValue(src);
		totalValue += val;
		let item = document.createElement('div');
		item.className = 'inventory-item';
		item.title = '点击喂给宠物';
		let img = document.createElement('img');
		img.src = src;
		item.appendChild(img);
		let valLabel = document.createElement('div');
		valLabel.className = 'inventory-item-value';
		valLabel.textContent = '¥' + formatValue(val);
		item.appendChild(valLabel);
		item.onclick = function() {
			feedPet(index);
		};
		inventoryGrid.appendChild(item);
	});
	document.getElementById('inventory-total-value').textContent = '¥ ' + formatValue(totalValue);
}

function feedPet(index) {
	let src = inventory[index];
	let val = getItemValue(src);

	let itemRect = inventoryGrid.children[index].getBoundingClientRect();
	let petRect = petContainer.getBoundingClientRect();

	let flyImg = document.createElement('img');
	flyImg.src = src;
	flyImg.style.position = 'fixed';
	flyImg.style.left = itemRect.left + 'px';
	flyImg.style.top = itemRect.top + 'px';
	flyImg.style.width = '60px';
	flyImg.style.height = '60px';
	flyImg.style.objectFit = 'contain';
	flyImg.style.zIndex = '999';
	flyImg.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.6, 1)';
	flyImg.style.pointerEvents = 'none';
	document.body.appendChild(flyImg);

	inventory.splice(index, 1);
	renderInventory();

	requestAnimationFrame(() => {
		flyImg.style.left = (petRect.left + petRect.width / 2 - 30) + 'px';
		flyImg.style.top = (petRect.top + petRect.height / 2 - 30) + 'px';
		flyImg.style.transform = 'scale(0.3) rotate(360deg)';
		flyImg.style.opacity = '0';
	});

	showSpeech('开饭啦~');

	setTimeout(() => {
		if (flyImg.parentNode) flyImg.remove();
		petImg.style.transform = 'scale(1.15)';
		petFunds += val;
		if (isBankrupt && petFunds > 0) {
			isBankrupt = false;
			petImg.src = NORMAL_IMG;
		}
		lastEatenItem = src;
		canSpit = true;
		updateFundsDisplay();
		showSpeech('真好吃！+¥' + formatValue(val));
		setTimeout(() => {
			petImg.style.transform = '';
		}, 300);
	}, 800);
}

try {
	let data = window.PET_IMAGE_CONFIG;
	for (let item of data) {
		if (item.load) {
			bgImages = item.load.map(path => resolvePath(path));
		}
		if (item.pet) {
			allImages = item.pet.filter(p => !p.includes('在这里') && !p.includes('可以添加') && !p.includes('多个'))
							   .map(path => resolvePath(path));
		}
	}
	if (bgImages.length > 0) {
		initBackground();
		if (allImages.length === 0) {
			allImages = [...bgImages];
		}
	}
	if (allImages.length > 0) {
		initPet();
	}
	updateFundsDisplay();
} catch (error) {
	console.error('加载配置失败:', error);
}