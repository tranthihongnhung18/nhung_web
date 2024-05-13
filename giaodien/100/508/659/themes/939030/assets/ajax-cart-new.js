(function () {
	"undefined" == typeof CartBase && (CartBase = {});

	CartBase.variantIdJustAdded = null;
	CartBase.lineItems = [];

	CartBase.fetchCustom = async function (url, options) {
		const response = await fetch(url, options).then(function (res) {
			return res.json();
		});
		return response;
	};

	CartBase.replacerTemplate = function (tpl, data) {
		if (!data) return "";
		const result = tpl.replace(
			/{{(\w*)}}/g, // or /{(\w*)}/g for "{this} instead of %this%"
			function (m, key) {
				return data.hasOwnProperty(key) ? data[key] : "";
			}
		);
		return result;
	};

	CartBase.parseHtml = function (strHtml) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(strHtml, "text/html");
		return doc.body.childNodes[0];
	};

	CartBase.getCart = async function () {
		const response = await this.fetchCustom("/cart.js");
		this.cartUpdateCallback(response);
	};

	CartBase.changeItem = async function (line, quantity) {
		const response = await this.fetchCustom("/cart/change.js", {
			method: "POST",
			headers: new Headers({
				Accept: "application/json",
				"Content-Type": "application/json",
			}),
			body: JSON.stringify({ quantity, line }),
		});
		if (response) {
			this.getCart();
		} else {
			console.log("Network response was not ok");
		}
	};

	CartBase.updateStorage = function () {
		const checkoutButtons = document.querySelectorAll(".cart__btn-proceed-checkout");
		const cartContainerCal = document.querySelector(".cart-container");
		const inputsChecked = Array.from(cartContainerCal.querySelectorAll(`input[type="checkbox"]:checked`));
		let totalPrice = 0;
		if (inputsChecked.length > 0) {
			const storageItemsChecked = inputsChecked.map(function (inputChecked) {
				totalPrice += Number(inputChecked.getAttribute("data-price"));
				return {
					id: Number(inputChecked.getAttribute("data-id")),
					quantity: Number(inputChecked.getAttribute("data-quantity")),
					price: Number(inputChecked.getAttribute("data-price")),
					variant_id: Number(inputChecked.getAttribute("data-variant-id")),
				};
			});
			window.localStorage.setItem("line_items_checked", JSON.stringify(storageItemsChecked));
			for (const button of checkoutButtons) {
				button.disabled = false;
			}
		} else {
			window.localStorage.setItem("line_items_checked", JSON.stringify([]));
			for (const button of checkoutButtons) {
				button.disabled = true;
			}
		}

		const inputsUnchecked = Array.from(cartContainerCal.querySelectorAll(`input[type="checkbox"]:not(:checked)`));
		if (inputsUnchecked.length > 0) {
			const storageItemsUnchecked = inputsUnchecked.map(function (inputUnchecked) {
				return {
					id: Number(inputUnchecked.getAttribute("data-id")),
					quantity: Number(inputUnchecked.getAttribute("data-quantity")),
					price: Number(inputUnchecked.getAttribute("data-price")),
					variant_id: Number(inputUnchecked.getAttribute("data-variant-id")),
				};
			});
			window.localStorage.setItem("line_items_unchecked", JSON.stringify(storageItemsUnchecked));
		} else {
			window.localStorage.setItem("line_items_unchecked", JSON.stringify([]));
		}

		const totalPriceFormat = totalPrice > 0 ? Bizweb.formatMoney(totalPrice, theme.settings.moneyFormat) : "";
		const totalPriceElems = document.querySelectorAll(".total-price");
		totalPriceElems.forEach((element) => {
			element.innerHTML = totalPriceFormat != '' ? totalPriceFormat : 0;
		});
	};

	CartBase.addEventCheckbox = function () {
		const that = this;
		const checkboxsCart = document.querySelectorAll(`.cart_product input[type="checkbox"]`);
		if (checkboxsCart.length > 0) {
			for (const checkbox of checkboxsCart) {
				checkbox.addEventListener("change", function (event) {
					const id = checkbox.getAttribute("data-id");
					const quantity = checkbox.getAttribute("data-quantity");
					const price = checkbox.getAttribute("data-price");
					const variantId = checkbox.getAttribute("data-variant-id");
					const cartContainers = document.querySelectorAll(".cart-container");

					for (const cartContainer of cartContainers) {
						cartContainer.querySelector(
							`input[type="checkbox"][data-id="${id}"][data-quantity="${quantity}"][data-price="${price}"][data-variant-id="${variantId}"]`
						).checked = event.target.checked;
					}

					that.updateStorage();
				});
			}
		}
	};

	CartBase.renderCartItem = function (item, line) {
		const itemTemplate = document.getElementById("cartItems").innerHTML;
		const image =
			  item.image !== null ? Bizweb.resizeImage(item.image, "compact") : "https://bizweb.dktcdn.net/thumb/compact/assets/themes_support/noimage.gif";
		const variantTitle = item.variant_title !== "Default Title" ? item.variant_title : "";

		const lineItem = {
			line: line,
			url: item.url,
			img: image,
			name: item.title,
			properties: item.properties,
			itemAdd: item.quantity + 1,
			itemMinus: item.quantity - 1,
			itemQty: item.quantity,
			linePrice: Bizweb.formatMoney(item.line_price, theme.settings.moneyFormat),
			price: Bizweb.formatMoney(item.price, theme.settings.moneyFormat),
		};

		const lineItemHtml = this.parseHtml(this.replacerTemplate(itemTemplate, lineItem));
		if (!variantTitle) {
			lineItemHtml.querySelector(".variant-title").remove();
		}
		if (theme.settings.checkbox_cart) {
			let isChecked = false;
			if (window.localStorage.getItem("line_items_checked") && item.variant_id !== this.variantIdJustAdded) {
				const lineItemsChecked = JSON.parse(window.localStorage.getItem("line_items_checked"));
				isChecked = lineItemsChecked.some(function (lineItem) {
					return lineItem.id === item.id && lineItem.variant_id === item.variant_id;
				});
			} else {
				isChecked = item.variant_id === this.variantIdJustAdded;
			}
			const input = this.parseHtml(
				`<input type="checkbox" data-id="${item.id}" data-price="${item.line_price}" data-quantity="${item.quantity}" data-variant-id="${
				item.variant_id
				}" ${isChecked ? "checked" : ""} />`
			);
			lineItemHtml.prepend(input);
		}
		return lineItemHtml.outerHTML;
	};

	CartBase.renderCartItems = function () {
		const that = this;
		const cartPageContent = document.getElementById("cart-content");
		const cartModalContent = document.getElementById("cart-modal-content");
		const popupCartDesktop = document.getElementById("popup-cart-desktop");
		const cartHeaderContent = document.querySelector(".cart-header-content");
		const lineItemsRendered = [];
		this.lineItems.forEach((item, index) => {
			const cartItem = that.renderCartItem(item, index + 1);
			lineItemsRendered.push(cartItem);
		});

		if (cartHeaderContent) {
			cartHeaderContent.innerHTML = lineItemsRendered.join("");
		}

		if (popupCartDesktop) {
			cartModalContent.innerHTML = lineItemsRendered.join("");
		}

		if (Bizweb.template.includes("cart")) {
			cartPageContent.innerHTML = lineItemsRendered.join("");
		}

		if (theme.settings.checkbox_cart) {
			this.addEventCheckbox();
		}
	};

	CartBase.cartUpdateCallback = function (cart) {
		if (cart) {
			this.lineItems = cart.items;
			this.renderCartItems();
			const cartCount = document.querySelectorAll(".count_item_pr");
			if (cartCount.length > 0) {
				cartCount.forEach((element) => {
					element.innerHTML = cart.item_count;
				});
			}

			this.updateStorage();
			this.noItem(cart.item_count);
		} else {
			this.noItem(0);
		}
	};

	CartBase.noItem = function (count) {
		var dataEmpty =
			'<div class="cart--empty-message"><svg class="icon"> <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cartEmpty"></use> </svg><p>Không có sản phẩm nào trong giỏ hàng của bạn</p><a class="button-link btn-primary" href="/collections/all">Tiếp tục mua sắm</a></div>';
		let cartPageContainer = document.querySelectorAll(".cart-container");
		if (cartPageContainer && count === 0) {
			cartPageContainer.forEach((element) => {
				element.classList.add("d-none");
				element.parentElement.insertAdjacentHTML("beforeend", dataEmpty);
			});
		} else {
			cartPageContainer.forEach((element) => {
				element.classList.remove("d-none");
			});
			const cartEmptyMessages = document.querySelectorAll(".cart--empty-message");
			if (cartEmptyMessages.length > 0) {
				for (const item of cartEmptyMessages) {
					item.remove();
				}
			}
		}
	};

	CartBase.modalCart = async function (event) {
		const windowWidth = window.innerWidth;
		const popupCartDesktop = document.getElementById("popup-cart-desktop");
		const popupCartMobi = document.getElementById("popup-cart-mobi");
		if (popupCartDesktop && windowWidth >= 1200) {
			event === "show" ? popupCartDesktop.classList.add("fade-in") : popupCartDesktop.classList.remove("fade-in");
		}
		if (popupCartMobi && windowWidth <= 1200) {
			event === "show" ? popupCartMobi.classList.add("fade-in") : popupCartMobi.classList.remove("fade-in");
			if (event === "show") {
				setTimeout(function () {
					popupCartMobi.classList.remove("fade-in");
					const backdrop = document.querySelector(".active-deactive");
					backdrop.click();
				}, 2000);
			}
		}
		await this.getCart(this.cartUpdateCallback);
	};

	CartBase.updateCount = function (button, quantityChange) {
		const line = Number(button.getAttribute("data-line"));
		const qtySelector = button.parentNode.querySelector(".ajaxcart__qty-num");
		const qty = Math.max(parseInt(qtySelector.value) + quantityChange, 0);
		qtySelector.value = Math.max(parseInt(qtySelector.value) + quantityChange, 0);

		this.updateQuantity(line, qty);
	};

	CartBase.changeQuantity = function (input) {
		const line = Number(input.getAttribute("data-line"));
		const qty = parseInt(input.value.replace(/\D/g, ""));

		this.updateQuantity(line, qty);
	};

	CartBase.removeItemCart = function (item) {
		const line = Number(item.getAttribute("data-line"));
		this.updateQuantity(line, 0);
	};

	CartBase.updateQuantity = function (line, qty) {
		const that = this;
		setTimeout(async function () {
			await that.changeItem(line, qty);
		}, 10);
	};

	CartBase.allowOnlyDigits = function (event) {
		const keyCode = event.keyCode || event.which;
		const allowedKeys = [8, 46, 37, 39];

		if ((keyCode >= 48 && keyCode <= 57) || allowedKeys.includes(keyCode)) {
			return true;
		} else {
			event.preventDefault();
			return false;
		}
	};

	CartBase.checkout = async function () {
		if (!theme.settings.checkbox_cart) {
			window.location.href = "/checkout";
			return;
		}
		const lineItemsChecked = JSON.parse(window.localStorage.getItem("line_items_checked"));
		const lineItemsUnchecked = JSON.parse(window.localStorage.getItem("line_items_unchecked"));

		// Update line item not checkout

		const data = { updates: {} };
		if(lineItemsUnchecked) {
			for (const item of lineItemsUnchecked) {
				data.updates[item.variant_id] = 0;
			}
		}
		const response = await this.fetchCustom("/cart/update.js", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (response) {
			window.location.href = "/checkout";
		}
	};

	CartBase.updateCartAfterCheckout = async function () {
		const itemsCartChecked = JSON.parse(window.localStorage.getItem("line_items_checked"));
		const itemsCartUnchecked = JSON.parse(window.localStorage.getItem("line_items_unchecked"));
		window.localStorage.setItem("line_items_checked", JSON.stringify([]));
		const data = { updates: {} };
		if(itemsCartUnchecked) {
			for (const item of itemsCartUnchecked) {
				data.updates[item.variant_id] = item.quantity;
			}
		}
		if(itemsCartChecked) {
			for (const item of itemsCartChecked) {
				data.updates[item.variant_id] = 0;
			}
		}
		await this.fetchCustom("/cart/update.js", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	};

	CartBase.rerenderCartNotCheckout = async function () {
		const itemsCartChecked = JSON.parse(window.localStorage.getItem("line_items_checked"));
		const itemsCartUnchecked = JSON.parse(window.localStorage.getItem("line_items_unchecked"));
		const data = { updates: {} };
		if(itemsCartUnchecked) {
			for (const item of itemsCartUnchecked) {
				data.updates[item.variant_id] = item.quantity;
			}
		}
		if(itemsCartChecked) {
			for (const item of itemsCartChecked) {
				data.updates[item.variant_id] = item.quantity;
			}
		}

		await this.fetchCustom("/cart/update.js", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	};

	CartBase.pushEventAdd = async function (variantId, isPopup) {
		this.variantIdJustAdded = Number(variantId);
		await this.getCart();
		this.variantIdJustAdded = null;
		if (isPopup) {
			this.modalCart("show");
		}

		const popupCartDesktop = document.getElementById("popup-cart-desktop");
		if (popupCartDesktop && popupCartDesktop.classList.contains("fade-in")) {
			const cartBody = popupCartDesktop.querySelector(".cart_body");
			const itemCart = cartBody.querySelector(`input[data-variant-id="${variantId}"]`);
			if (itemCart) {
				itemCart.parentNode.scrollIntoView();
			}
		}
	};

	CartBase.init = async function () {
		if (theme.settings.checkbox_cart) {
			const completeCheckout = window.localStorage.getItem("complete_checkout");
			if (completeCheckout && completeCheckout === "success") {
				window.localStorage.removeItem("complete_checkout");
				await this.updateCartAfterCheckout();
			} else {
				await this.rerenderCartNotCheckout();
			}
		}

		await this.getCart();
	};

	CartBase.init();
})();