var captitle = 'Thêm vào giỏ<span>Thêm trước thanh toán sau</span>';
document.addEventListener('DOMContentLoaded', function() {
	setTimeout(function() {
		SwatchGrid();
	}, 1000);
});

function onQuickView(element) {
	var dataUrl = element.getAttribute('data-handle');
	fetch('/collections/all/products/' + dataUrl + '?view=quickview')
		.then(response => response.text())
		.then(data => {
		BaseGlobal.baseModal('960px', 'quickview-form', '', data);
		SwatchGrid();
		if(window.BPR) {
			return window.BPR.initDomEls(), window.BPR.loadBadges();
		}
	})
		.catch(error => {
		console.error('Lỗi trong quá trình tải dữ liệu:', error);
	});
}


function SwatchGrid() {
	document.querySelectorAll('.detail-grid').forEach(function(grid) {
		var Formqv = grid;
		var dataid = Formqv.getAttribute('data-id-product');
		var dataurl = Formqv.getAttribute('data-url');


		var FormCallback = function(variant, selector) {
			if (variant) {
				var formel = Formqv.querySelector('#' + selector.domIdPrefix).closest('form');
				if (variant) {
					for (var i = 0, length = variant.options.length; i < length; i++) {
						var optionValue = variant.options[i];
						var radioButtonGroup = formel.querySelector('.swatch-q[data-option-index-e="' + i + '"]');
						var radioButtons = radioButtonGroup.querySelectorAll('[type="radio"]');
						var radioButton = Array.from(radioButtons).find(function (radio) {
							return radio.value === optionValue;
						});

						if (radioButton) {
							radioButton.checked = true;
						}
					}
				}
			}

			var addToCart = Formqv.querySelector('.btn_buy.addcart');
			var btnNow = Formqv.querySelector('.btn-buy-now');
			var btntragop = Formqv.querySelector('.btn-tragop');
			var former = Formqv.querySelector('.action-cart');
			var saleLabel = Formqv.querySelector('.product-image');
			var productPrice = Formqv.querySelector('.price');
			var comparePrice = Formqv.querySelector('.compare-price');
			var addNowText = 'Mua ngay';
			var addOneText = 'Thêm vào giỏ hàng';
			if (variant.inventory_management == "bizweb") {
				if (variant.inventory_quantity != 0) {
					Formqv.querySelector('.box-variant input[name=variantId]').setAttribute('data-qty', variant.inventory_quantity);
				} else if (variant.inventory_quantity == '') {
					if (variant.inventory_policy == "continue") {
						Formqv.querySelector('.box-variant input[name=variantId]').setAttribute('data-qty', 1000000);
					} else {
						Formqv.querySelector('.box-variant input[name=variantId]').setAttribute('data-qty', 0);
					}
				}
			} else {
				Formqv.querySelector('.box-variant input[name=variantId]').setAttribute('data-qty', 1000000);
			}
			if (variant && variant.available) {

				saleLabel.classList.remove('sale');
				former.classList.remove('d-none');
				btnNow.removeAttribute('disabled');
				btnNow.classList.remove('d-none');
				addToCart.innerHTML = addOneText;
				addToCart.removeAttribute('disabled');
				btntragop.classList.remove('d-none');
				addToCart.innerHTML = captitle;
				if (variant.price === 0) {
					productPrice.innerHTML = 'Liên hệ';
					comparePrice.style.display = 'none';
					former.classList.add('d-none');
				} else {
					former.classList.remove('d-none');
					productPrice.innerHTML = Bizweb.formatMoney(variant.price, theme.settings.moneyFormat);
					addToCart.innerHTML = addOneText;
					addToCart.innerHTML = captitle;
					if (variant.compare_at_price > variant.price) {
						comparePrice.innerHTML = Bizweb.formatMoney(variant.compare_at_price, theme.settings.moneyFormat);
						comparePrice.style.display = 'inline-block';
						var discount = Math.ceil((variant.compare_at_price - variant.price) / variant.compare_at_price * 100);
						if (discount > 99) {
							var pt = 99;
						} else {
							var pt = discount;
						}
						saleLabel.classList.add('sale');
						saleLabel.setAttribute('data-sale', 'Giảm ' + pt + '%');
					} else {
						comparePrice.style.display = 'none';
					}
				}
			} else {
				saleLabel.classList.remove('sale');
				btnNow.setAttribute('disabled', 'disabled');
				btnNow.classList.add('d-none');
				addToCart.innerHTML = 'Hết hàng';
				addToCart.setAttribute('disabled', 'disabled');
				former.classList.add('d-none');
				btntragop.classList.add('d-none');
				if (variant) {
					if (variant.price !== 0) {
						former.classList.remove('d-none');
						btnNow.setAttribute('disabled', 'disabled');
						btnNow.classList.add('d-none');
						productPrice.innerHTML = Bizweb.formatMoney(variant.price, theme.settings.moneyFormat);

						if (variant.compare_at_price > variant.price) {
							comparePrice.innerHTML = Bizweb.formatMoney(variant.compare_at_price, theme.settings.moneyFormat);
							comparePrice.style.display = 'inline-block';
							var discount = Math.ceil((variant.compare_at_price - variant.price) / variant.compare_at_price * 100);
							if (discount > 99) {
								var pt = 99;
							} else {
								var pt = discount;
							}
							saleLabel.classList.add('sale');
							saleLabel.setAttribute('data-sale', 'Giảm ' + pt + '%');
						} else {
							comparePrice.style.display = 'none';
						}
					} else {
						productPrice.innerHTML = 'Liên hệ';
						comparePrice.style.display = 'none';
						former.classList.add('d-none');
					}
				} else {
					productPrice.innerHTML = 'Liên hệ';
					comparePrice.style.display = 'none';
					former.classList.add('d-none');
				}
			}
			getQueryResult(variant.id);

		};

		function getQueryResult(id) {
			var select = document.getElementById('product-grid-selectors-' + dataid);
			var selectedOption = select.querySelector('option[value="' + id + '"]');

			Formqv.querySelector('input[name=variantId]').value = id;

			var imgVariant = selectedOption.getAttribute('data-image');

			var swiper = new Swiper(Formqv.querySelector('.swiper-container'), {
				pagination: {
					el: Formqv.querySelector('.swiper-pagination'),
					clickable: true,
				},
			});

			var slideToIndex = -1;

			Formqv.querySelectorAll('.product-image .swiper-slide').forEach(function(el, index){
				var imgThis = el.querySelector('img').getAttribute('src'); 
				if(imgVariant.split("?")[0] == imgThis.split("?")[0]) {
					var pst = el.dataset.hash;
					slideToIndex = pst;
				}
			});
			if (slideToIndex !== -1) {
				swiper.slideTo(slideToIndex, 1000, false);
			}
			swiper.on('slideChange', function() {
				swiper.pagination.render();
				swiper.pagination.update();
			});
		}


		async function GetApiProduct(url) {
			const response = await fetch(url);
			var productJson = await response.json();
			if (response) {}
			callBackProduct(productJson);
		}
			GetApiProduct('/products'+dataurl+ '.json');
			function callBackProduct(productJson) {
				new Bizweb.OptionSelectors('product-grid-selectors-' + dataid, {
					product: productJson,
					onVariantSelected: FormCallback, 
					enableHistoryState: true
				});  
			}


		function handleRadioChange(event) {
			var target = event.target;
			var optionIndex = target.closest('.swatch-q').getAttribute('data-option-index-e');
			var optionValue = target.value;

			var form = target.closest('form');
			var optionSelectors = Formqv.querySelectorAll('.single-option-selector');
			var targetOptionSelector = optionSelectors[optionIndex];

			targetOptionSelector.value = optionValue;
			targetOptionSelector.dispatchEvent(new Event('change'));
		}

		function handleRadioChange(event) {
			var target = event.target;
			var optionIndex = target.closest('.swatch-q').getAttribute('data-option-index-e');
			var optionValue = target.value;

			var form = target.closest('form');
			var optionSelectors = Formqv.querySelectorAll('.single-option-selector');
			var targetOptionSelector = optionSelectors[optionIndex];

			targetOptionSelector.value = optionValue;
			targetOptionSelector.dispatchEvent(new Event('change'));
		}

		var swatchRadios = document.querySelectorAll('.swatch-q input[type="radio"]');
		swatchRadios.forEach(function (radio) {
			radio.addEventListener('change', handleRadioChange);
		});

		Formqv.querySelectorAll('.add_to_cart').forEach(function(element) {
			element.addEventListener('click', BaseGlobal.addToCartFly);
		});
		Formqv.querySelectorAll('.btn-buy-now').forEach(function(element) {
			element.addEventListener('click', BaseGlobal.addToCartFast);
		});


	});
}