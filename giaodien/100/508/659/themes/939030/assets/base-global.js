(function () {
	"undefined" == typeof BaseGlobal && (BaseGlobal = {});
	BaseGlobal.Notify = function() {};
	BaseGlobal.lazyloadImage = function(element) {
		const lazyImages = document.querySelectorAll(element);
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const lazyElement = entry.target;
					if (lazyElement.tagName.toLowerCase() === 'img') {
						lazyElement.src = lazyElement.getAttribute('data-src');
						lazyElement.classList.add('loaded');
					} else {
						lazyElement.style.backgroundImage = `url(${lazyElement.getAttribute('data-src')})`;
					}
					observer.unobserve(lazyElement);
				}
			});
		});

		lazyImages.forEach(function(image) {
			observer.observe(image);
		});
	};


	BaseGlobal.resizeImageAuto = function(className) {
		const onResizeFunction = () => {
			this.resizeImage(className);
		};
		window.addEventListener("resize", onResizeFunction);
		onResizeFunction();
	};

	BaseGlobal.resizeImage = function(className) {
		const queryThumb = document.querySelectorAll(className);
		if (queryThumb) {
			queryThumb.forEach(function(thumb) {
				thumb.style.height = thumb.offsetWidth + "px";
			});
		}
	};

	BaseGlobal.convertVietNam = function(str){
		str= str.toLowerCase();
		str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
		str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
		str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
		str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
		str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
		str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
		str= str.replace(/đ/g,"d"); 
		str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,"-");
		str= str.replace(/-+-/g,"-");
		str= str.replace(/^\-+|\-+$/g,""); 
		return str; 
	}

	BaseGlobal.activeDeactive =  function(event) {
		const contentElement = document.querySelector('body');
		let layerOpacity = '<div onclick="BaseGlobal.activeDeactive();" class="active-deactive" style="width: 100%;height:100%;background:rgba(0,0,0,.8);position:fixed;top:0px !important;left:0px;z-index:7777;"></div>';
		let activeAvailable = document.querySelector('.active-deactive');
		let baseModal = document.querySelector('.base-modal');
		event != null && activeAvailable == null ? contentElement.insertAdjacentHTML('beforeend', layerOpacity) : contentElement.querySelector('.active-deactive').remove();
		event != null  && activeAvailable == null ? contentElement.classList.add('fade-in') : "";
		if(event == null) {
			const fadeIn = document.querySelectorAll('.fade-in');
			fadeIn.forEach(function (fade) {fade.classList.remove('fade-in')});
			baseModal != null ? baseModal.remove() : "";
		}
	}

	BaseGlobal.baseModal = function(maxWidth, classname, style, data) {
		const bodyQuery = document.querySelector('body');
		let formModal = '<div class="base-modal '+classname+'" style="max-width:'+maxWidth+'; width:100%; position:fixed;background: #fff;top:20%!important;left:50%;z-index:9999;transform:translateX(-50%);"><div class="content-modal '+style+'">'+data+'</div></div>';
		data != null ? bodyQuery.insertAdjacentHTML('beforeend', formModal) : "";
		data != null ? BaseGlobal.activeDeactive('show') : "";
	}

	BaseGlobal.menuHandler = function(element) {
		function toggleMenu(event) {
			event.preventDefault();
			const parentListItem = this.parentElement;
			parentListItem.classList.toggle('current');
		}
		const iconElements = document.querySelectorAll(element);
		iconElements.forEach(function (iconElement) {
			iconElement.addEventListener('click', toggleMenu);
		});
	};


	BaseGlobal.navMenuScrollId = function(idPrev, idNext, element) {
		const prevButton = document.getElementById(idPrev);
		const nextButton = document.getElementById(idNext);
		const contentElement = document.querySelector(element);
		let margin_left = 0;
		const animateMargin = (amount) => {
			margin_left = Math.min(0, Math.max(getMaxMargin(), margin_left + amount));
			contentElement.style.marginLeft = `${margin_left}px`;
		};

		const getMaxMargin = () =>
		contentElement.parentElement.offsetWidth - contentElement.scrollWidth;
		if (prevButton != null && nextButton != null) {
			prevButton.addEventListener('click', function(e) {
				e.preventDefault();
				animateMargin(190);
			});

			nextButton.addEventListener('click', function(e) {
				e.preventDefault();
				animateMargin(-190);
			});
		}
	};

	BaseGlobal.scrollTo = function(element, duration) {
		var e = document.documentElement;
		if (e.scrollTop === 0) {
			var t = e.scrollTop;
			++e.scrollTop;
			e = t + 1 === e.scrollTop-- ? e : document.body;
		}
		BaseGlobal.scrollToC(e, e.scrollTop, element, duration);
	}
	BaseGlobal.scrollToC = function(element, from, to, duration) {
		if (duration <= 0) return;
		if (typeof from === "object") from = from.offsetTop;
		if (typeof to === "object") to = to.offsetTop;

		BaseGlobal.scrollToX(element, from, to, 0, 1 / duration, 20, BaseGlobal.easeOutCuaic);
	} 

	BaseGlobal.scrollToX = function(element, xFrom, xTo, t01, speed, step, motion) {
		if (t01 < 0 || t01 > 1 || speed <= 0) {
			element.scrollTop = xTo;
			return;
		}
		element.scrollTop = xFrom - (xFrom - xTo) * motion(t01);
		t01 += speed * step;
		setTimeout(function() {
			BaseGlobal.scrollToX(element, xFrom, xTo, t01, speed, step, motion);
		}, step);
	}

	BaseGlobal.easeOutCuaic = function(t) {
		t--;
		return t * t * t + 1;
	}

	BaseGlobal.swiperData = function(element) {
		var swiperContainers = document.getElementsByClassName(element);
		Array.prototype.forEach.call(swiperContainers, function(swiperContainer) {
			var dataLG = swiperContainer.getAttribute('data-lg'),
				dataXL = swiperContainer.getAttribute('data-xl'),
				dataXXL = swiperContainer.getAttribute('data-xxl'),
				dataMD = swiperContainer.getAttribute('data-md'),
				dataXS = swiperContainer.getAttribute('data-xs'),
				dataX = swiperContainer.getAttribute('data-x'),
				dataSpace = swiperContainer.getAttribute('data-space'),
				dataLoop = swiperContainer.getAttribute('data-loop'),
				dataDrag = swiperContainer.getAttribute('data-drag'),
				dataSpaceX = swiperContainer.getAttribute('data-spacex'),
				dataLazy = swiperContainer.getAttribute('data-lazy'),
				dataH = swiperContainer.getAttribute('data-height'),
				pagination = swiperContainer.getAttribute('data-pagination'),
				autoplayDelay = swiperContainer.getAttribute('data-autoplay'),
				slidesPerViewLG = dataLG != null ? parseFloat(dataLG) : parseFloat(dataMD),
				slidesPerViewXL = dataXL != null ? parseFloat(dataXL) : parseFloat(dataLG),
				slidesPerViewXXL = dataXXL != null ? parseFloat(dataXXL) : parseFloat(dataXL),
				slidesPerViewMD = dataMD != null ? parseFloat(dataMD): parseFloat(dataXS),
				slidesPerViewXS = dataXS != null ? parseFloat(dataXS) : 2,
				slidesPerViewX = dataX != null ? parseFloat(dataX) : 2,
				slidesLoop = dataLoop != null ? dataLoop : false,
				slidesDrag = dataDrag != null ? 1 : 0,
				autoplayOption = false;

			if(autoplayDelay !== null) {
				var autoplayOption = {
					delay: parseFloat(autoplayDelay)
				}
			}
			var breakpoints = {
				300: {
					touchRatio: 1,
					spaceBetween: dataSpaceX != null ? dataSpaceX : 10,
					slidesPerView:slidesPerViewX
				},
				500: {
					touchRatio: 1,
					spaceBetween: dataSpaceX != null ? dataSpaceX : 10,
					slidesPerView:slidesPerViewXS != null ? slidesPerViewXS : 2
				},
				768: {
					touchRatio: 1,
					spaceBetween: 10,
					slidesPerView:slidesPerViewMD != null ? slidesPerViewMD : 3
				},
				992: {
					spaceBetween: 10,
					touchRatio: 1,
					slidesPerView:slidesPerViewLG != null ? slidesPerViewLG : 3
				},
				1200: {
					spaceBetween: dataSpace != null ? dataSpace : 15,
					slidesPerView:slidesPerViewXL != null ? slidesPerViewXL : slidesPerViewLG
				},
				1401: {
					spaceBetween: dataSpace != null ? dataSpace : 15,
					slidesPerView:slidesPerViewXXL != null ? slidesPerViewXXL : slidesPerViewXL
				}

			};

			var swiper = new Swiper(swiperContainer, {
				slidesPerView: slidesPerViewXXL != null ? slidesPerViewXXL : slidesPerViewXL,
				spaceBetween: dataSpace != null ? dataSpace : 10,
				loop: slidesLoop,
				grabCursor: true,
				roundLengths: true,
				allowTouchMove: true,
				nested: true,
				lazy: dataLazy != null ? true : false,
				slideToClickedSlide: false,
				autoHeight: dataH != null ? true : false,
				navigation: {
					nextEl: swiperContainer.parentElement.querySelector('.swiper-button-next'),
					prevEl: swiperContainer.parentElement.querySelector('.swiper-button-prev')
				},
				touchRatio: slidesDrag,
				autoplay:autoplayOption,
				breakpoints: breakpoints,
				pagination: {
					el:  pagination === null ? false : swiperContainer.parentElement.querySelector('.swiper-pagination'),
					clickable: true,
				},
			});
		});
	}


	BaseGlobal.tabLibrary = function(titleTab, contentTab){
		const tabLinks = document.querySelectorAll(titleTab);
		const tabPanels = document.querySelectorAll(contentTab);
		function showTab(tabId) {
			tabPanels.forEach((panel) => {
				panel.style.display = 'none';
			});
			const selectedPanel = document.querySelector(`[data-tab="${tabId}"]`);
			if (selectedPanel) {
				selectedPanel.style.display = 'block';
			}
		}

		function tabClickHandler(event) {
			const clickedTab = event.target;
			const tabId = clickedTab.getAttribute('data-tab');
			showTab(tabId);
		}
		if (tabLinks.length === 0 || tabPanels.length === 0) {
			return;
		}
		tabLinks.forEach((link) => {
			link.addEventListener('click', tabClickHandler);
		});
		showTab(tabLinks[0].getAttribute('data-tab'));
	}

	BaseGlobal.addToCartFly = function(e) {
		if (typeof e !== 'undefined') e.preventDefault();
		const form = this.closest('form');
		const variantId = form.querySelector(`[name="variantId"]`).value;
		fetch('/cart/add.js', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(new FormData(form))
		})
			.then((response) => {
			if (!response.ok) {
				throw new Error('Error adding item to cart');
			}
			CartBase.pushEventAdd(variantId, true);
			BaseGlobal.removeQuickViewForm();
			BaseGlobal.activeDeactive('show');
		})
			.catch((error) => {
			console.error('Error:', error.message);
		});
	}
	BaseGlobal.addToCartFast = function(e) {
		if (typeof e !== 'undefined') e.preventDefault();
		const form = this.closest('form');
		const variantId = form.querySelector(`[name="variantId"]`).value;
		fetch('/cart/add.js', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(new FormData(form))
		})
			.then((response) => {
			if (!response.ok) {
				throw new Error('Error adding item to cart');
			}
			CartBase.pushEventAdd(variantId, false);
			BaseGlobal.removeQuickViewForm();
			window.location.href = '/checkout';
		})
			.catch((error) => {
			console.error('Error:', error.message);
		});
	}

	BaseGlobal.Notify.prototype.show = function (message, duration, type) {
		var notification = document.createElement('div');
		notification.className = 'notifyed';
		notification.classList.add(type);
		notification.innerHTML = message;
		document.body.appendChild(notification);
		setTimeout(function () {
			document.body.removeChild(notification);
		}, duration);
	};
	var notifier = new BaseGlobal.Notify();

	BaseGlobal.removeQuickViewForm = function() {
		var quickViewForms = document.querySelectorAll('.quickview-form');
		if (quickViewForms.length > 0) {
			quickViewForms.forEach(function(quickViewForm) {
				quickViewForm.parentNode.removeChild(quickViewForm);
			});
			BaseGlobal.activeDeactive('');
		}
	}



})();