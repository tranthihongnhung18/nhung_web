var notifier = new BaseGlobal.Notify();
if(theme.settings.useWish) {
	const favoriteLinks = document.querySelectorAll('.favorite-link');
	favoriteLinks.forEach(link => {
		link.addEventListener('click', toggleFavorite);
	});

	function toggleFavorite(event) {
		event.preventDefault();
		const productUrl = event.target.closest('a').getAttribute('data-url');
		const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
		const index = favorites.indexOf(productUrl);

		if(index === -1) {
			favorites.push(productUrl);
			notifier.show(theme.settings.addWishTrue, 3000, 'success');
		}else {
			favorites.splice(index, 1);
			notifier.show(theme.settings.addWishFalse, 3000, 'warrning');
		} 
		localStorage.setItem('favorites', JSON.stringify(favorites));
		updateUI();
	}

	function updateUI() {
		const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
		const favoriteLinks = document.querySelectorAll('.favorite-link');
		favoriteLinks.forEach(link => {
			const productUrl = link.getAttribute('data-url');
			if (favorites.includes(productUrl)) {
				link.innerHTML = '<svg class="icon"> <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#wishlistactive"></use> </svg>';
				link.setAttribute('title', 'Bỏ yêu thích');

			} else {
				link.innerHTML = '<svg class="icon"> <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#wishlist"></use> </svg>';
				link.setAttribute('title', 'Thêm vào yêu thích');
			}
		});
		const numberOfFavorites = favorites.length;
		const wishCount = document.querySelector('.wishlistCount');
		wishCount != null ? wishCount.innerHTML = numberOfFavorites : "";

	}
	if(window.location.pathname.includes(theme.settings.urlpage_yeuthich)) {

		async function renderWishlist(wishlistPage) {
			const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
			var wishlistPage = document.querySelector('.page-wishlist');
			wishlistPage != null ? wishlistPage.innerHTML = '' : "";
			if(favorites.length > 0) {
				for (const productUrl of favorites) {
					try {
						const response = await fetch(`${productUrl}?view=wish`);
						if (response.ok) {
							const productView = await response.text();
							wishlistPage.insertAdjacentHTML('beforeend', productView);
						} else {
							console.error('Không thể tải nội dung sản phẩm yêu thích.');
						}
					} catch (error) {
						console.error('Lỗi khi tải nội dung sản phẩm yêu thích:', error);
					}
				}
				BaseGlobal.resizeImageAuto('.image_thumb');
				BaseGlobal.lazyloadImage(theme.settings.lazyload);
				document.querySelectorAll('.add_to_cart').forEach(function(element) {
					element.addEventListener('click', BaseGlobal.addToCartFly);
				});
			} else {
				wishlistPage.innerHTML = '<div class="col-12 col-lg-12 text-center"><div class="alert alert-warning alert-dismissible margin-top-15 section" role="alert">Chưa có sản phẩm yêu thích nào, Hãy thêm vào nhé !</div></div>';
			}
		}

		const wishlistPage = document.querySelector('.wishlist-page');
		renderWishlist(wishlistPage);
		document.addEventListener('click', function (event) {
			const target = event.target.closest('a');
			if (target && target.classList && target.classList.contains('favorite-link')) {
				event.preventDefault();
				const productUrl = target.getAttribute('data-url');
				const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
				const index = favorites.indexOf(productUrl);
				index === -1 ?  favorites.push(productUrl) : favorites.splice(index, 1);

				localStorage.setItem('favorites', JSON.stringify(favorites));
				renderWishlist(wishlistPage);
				updateUI();

			}
		});

	}

	updateUI();
}