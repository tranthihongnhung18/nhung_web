window.base = window.base || {};
var wDWs = window.innerWidth;
BaseGlobal.swiperData('swiper-data'); // uu tien goi truoc
BaseGlobal.resizeImageAuto('.image_thumb');
BaseGlobal.lazyloadImage(theme.settings.lazyload);

var is_renderd = 0

function renderLayout(){
	if(is_renderd) return 
	is_renderd = 1

	window.onscroll = function() {scrollFunction()};
	function scrollFunction() {
		if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
			document.querySelector('.backtop').classList.add('show');
		} else {
			document.querySelector('.backtop').classList.remove('show');
		}
	}

	document.querySelector('.backtop').addEventListener("click", function(){
		BaseGlobal.scrollTo(0, 300);
	});
	
	document.querySelector('.search-event').addEventListener("click", function(){
		this.classList.add('current');
	});
	document.querySelector('.close-search').addEventListener("click", function(){
		document.querySelector('.search-event').classList.remove('current');
	});
	
	var notifier = new BaseGlobal.Notify();

	BaseGlobal.navMenuScrollId('prevNav', 'nextNav', 'ul.item_big');
	BaseGlobal.menuHandler('.icon-down');
	document.querySelectorAll('.add_to_cart').forEach(function(element) {
		element.addEventListener('click', BaseGlobal.addToCartFly);
	});
	document.querySelectorAll('.add_to_cart_fast').forEach(function(element) {
		element.addEventListener('click', BaseGlobal.addToCartFast);
	});

	if (wDWs < 991) {
		var openFilter = document.querySelectorAll('.open-filters'),
			categoryNav = document.querySelectorAll('.category-action');
		openFilter.forEach(function(el){
			el.addEventListener('click', function () {
				this.classList.toggle('fade-in');
				document.querySelector('.filter-sidebar').classList.toggle('fade-in');
				BaseGlobal.activeDeactive('show');
			});
		});

		categoryNav.forEach(function(el){
			el.addEventListener('click', function () {
				document.querySelector('.navigation-head').classList.add('fade-in');
				BaseGlobal.activeDeactive('show');
			});
		});
		document.querySelector('.button-search-header').addEventListener('click', function (e) {
			e.target.closest('form').classList.toggle('fade-in');
		})

	}
	if(wDWs < 767){
		function toggleCurrentClass(event) {
			var target = event.target;
			if (target.classList.contains('title-footer')) {
				target.classList.toggle('current');
				var ulElement = target.nextElementSibling;
				if (ulElement && ulElement.classList.contains('list-menu')) {
					ulElement.classList.toggle('current');
				}
			}
		}

		var titleFooterElements = document.querySelectorAll('.title-footer');

		titleFooterElements.forEach(function (element) {
			element.addEventListener('click', toggleCurrentClass);
		});
	}

	//mailchimp
	function newsletterSubmitted(event) {
		event.preventDefault();

		const _form = this.querySelector("form");
		const _action = _form.getAttribute("action");
		const _email = _form.querySelector("input[type=email]").value;

		document.mailChimpResponse = function(response, email) {
			mailChimpResponseted(response, _email)
			delete document.mailChimpResponse;
			_form.querySelector("input[type=email]").value = '';
		};

		this._script = document.createElement("script");
		this._script.type = "text/javascript";
		this._script.src = _action + "&c=document.mailChimpResponse&EMAIL=" + _email;

		document.getElementsByTagName("head")[0].appendChild(this._script);
	}

	var newsletter = document.querySelector("#formchimp")
	newsletter.addEventListener("submit", newsletterSubmitted);

	function mailChimpResponseted(resp, _email) {
		var mailchimpSuccess = document.querySelector('.mailchimp-success');
		var mailchimpError = document.querySelector('.mailchimp-error');
		if (resp.result === 'success') {
			if (resp.msg == 'Thank you for subscribing!') {
				mailchimpSuccess.innerHTML = 'Cảm ơn bạn đã đăng ký!';
			} else {
				mailchimpSuccess.innerHTML = '' + resp.msg;
			}
			mailchimpSuccess.style.display = 'block';
			mailchimpSuccess.style.transitionDuration = '900ms';
			mailchimpError.style.display = 'none';
			setTimeout(function () {
				mailchimpSuccess.style.display = 'none';
			}, 4000);
		} else if (resp.result === 'error') {
			const mail = _email;
			if (resp.msg == 'Please enter a value') {
				mailchimpError.innerHTML = 'Vui lòng nhập email';
			} else if (resp.msg == 'An email address must contain a single @') {
				mailchimpError.innerHTML = 'Địa chỉ email phải chứa ký tự @';
			} else if (resp.msg == 'This email cannot be added to this list. Please enter a different email address.') {
				mailchimpError.innerHTML = 'Email này không thể được thêm vào danh sách này. Vui lòng nhập một địa chỉ email khác.';
			} else if (resp.msg.includes('is an invalid email address and cannot be imported')){
				mailchimpError.innerHTML = 'Phần tên miền của địa chỉ email không hợp lệ';
			} else if (resp.msg.includes('The domain portion of the email address is invalid')) {
				mailchimpError.innerHTML = 'Phần tên miền của địa chỉ email không hợp lệ';
			} else if (resp.msg.includes('The username portion of the email address is empty')) {
				mailchimpError.innerHTML = 'Phần tên người dùng của địa chỉ email trống';
			} else if (resp.msg == 'Thank you for subscribing!') {
				mailchimpError.innerHTML = 'Cảm ơn bạn đã đăng ký!';
				setTimeout(function () {
					mailchimpError.style.display = 'none';
				}, 4000);
			} else {
				mailchimpError.innerHTML = '' + resp.msg;
			}
			mailchimpError.style.display = 'block';
			mailchimpError.style.transitionDuration = '900ms';

			setTimeout(function () {
				mailchimpError.style.display = 'none';
			}, 4000);
		}
	}

}
document.addEventListener("DOMContentLoaded", function() {
	window.addEventListener("mousemove", renderLayout, { once: true });
	window.addEventListener("touchstart", renderLayout, { once: true });
});