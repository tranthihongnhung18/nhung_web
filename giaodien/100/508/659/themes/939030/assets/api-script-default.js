function floatToString(t, r) {
	var e = t.toFixed(r).toString();
	if (e.match(/^\.\d+/)) {
		e = "0" + e;
	}
	return e;
}

function attributeToString(t) {
	if (typeof t !== "string") {
		t = t + "";
		if (t === "undefined") {
			t = "";
		}
	}
	t = t.trim();
	return t;
}

"undefined" == typeof Bizweb && (Bizweb = {});
Bizweb.mediaDomainName = "//bizweb.dktcdn.net/";

Bizweb.money_format = "${{amount}}";

Bizweb.onError = function(XMLHttpRequest, textStatus) {
	var data = JSON.parse(XMLHttpRequest.responseText);
	if (data.message) {
		console.log(data.message + "(" + data.status + "): " + data.description);
	} else {
		console.log("Error: " + Bizweb.fullMessagesFromErrors(data).join("; ") + ".");
	}
};

Bizweb.fullMessagesFromErrors = function(errors) {
	var messages = [];
	for (var key in errors) {
		if (errors.hasOwnProperty(key)) {
			for (var i = 0; i < errors[key].length; i++) {
				messages.push(key + " " + errors[key][i]);
			}
		}
	}
	return messages;
};

Bizweb.onCartUpdate = function(cart) {
	console.log("There are now " + cart.item_count + " items in the cart.");
};

Bizweb.onCartShippingRatesUpdate = function(shippingRates, address) {
	var addressString = "";
	if (address.zip) {
		addressString += address.zip + ", ";
	}
	if (address.province) {
		addressString += address.province + ", ";
	}
	addressString += address.country;

	console.log(
		"There are " + shippingRates.length + " shipping rates available for " +
		addressString + ", starting at " + Bizweb.formatMoney(shippingRates[0].price) + "."
	);
};

Bizweb.onItemAdded = function(item) {
	console.log(item.title + " was added to your shopping cart.");
};

Bizweb.onProduct = function(product) {
	console.log("Received everything we ever wanted to know about " + product.title);
};

function getDefault(value, defaultValue) {
	return typeof value !== "undefined" ? value : defaultValue;
}

function formatMoney(amount, options) {
	options = options || {};
	var decimal = getDefault(options.decimal, 2);
	var thousandSeparator = getDefault(options.thousandSeparator, ",");
	var decimalSeparator = getDefault(options.decimalSeparator, ".");
	var moneyFormat = options.moneyFormat || "${{amount}}";

	if (isNaN(amount) || amount === null) return 0;

	amount = amount.toFixed(decimal);

	var amountParts = amount.split(".");
	var integer = amountParts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousandSeparator);
	var decimalPart = amountParts[1] ? decimalSeparator + amountParts[1] : "";

	var result = integer + decimalPart;

	return moneyFormat.replace("${{amount}}", result);
}

function getDefault(value, defaultValue) {
	return typeof value !== "undefined" ? value : defaultValue;
}

Bizweb.resizeImage = function(imageUrl, imageSize) {
	try {
		if (imageSize === "original") {
			return imageUrl;
		}

		var thumbDomain = Bizweb.mediaDomainName + "thumb/" + imageSize + "/";
		return imageUrl.replace(Bizweb.mediaDomainName, thumbDomain).split('?')[0];
	} catch (error) {
		return imageUrl;
	}
};

Bizweb.addItem = function(variantId, quantity, callback) {
	quantity = quantity || 1;
	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "quantity=" + quantity + "&VariantId=" + variantId,
	};

	fetch("/cart/add.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onItemAdded(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.addItemFromForm = function(formId, callback) {
	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams(new FormData(document.getElementById(formId))),
	};

	fetch("/cart/add.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onItemAdded(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.getCart = function(callback) {
	fetch("/cart.js")
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onCartUpdate(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.pollForCartShippingRatesForDestination = function(destination, callback, errorCallback) {
	errorCallback = errorCallback || Bizweb.onError;

	var pollFunction = function() {
		fetch("/cart/async_shipping_rates", {
			method: "GET",
			headers: {
				"Accept": "application/json",
			},
		})
			.then((response) => {
			if (response.status === 200) {
				return response.json();
			} else {
				setTimeout(pollFunction, 500);
				throw new Error("Non-200 status code");
			}
		})
			.then((data) => {
			if (typeof callback === "function") {
				callback(data.shipping_rates, destination);
			} else {
				Bizweb.onCartShippingRatesUpdate(data.shipping_rates, destination);
			}
		})
			.catch(errorCallback);
	};

	return pollFunction;
};

Bizweb.getCartShippingRatesForDestination = function(shippingAddress, callback, errorCallback) {
	errorCallback = errorCallback || Bizweb.onError;
	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: Bizweb.param({ shipping_address: shippingAddress }),
	};

	fetch("/cart/prepare_shipping_rates", options)
		.then((response) => response.json())
		.then(Bizweb.pollForCartShippingRatesForDestination(shippingAddress, callback, errorCallback))
		.catch(errorCallback);
};

Bizweb.getProduct = function(productId, callback) {
	fetch(`/products/${productId}.js`, {
		method: "GET",
		headers: {
			"Accept": "application/json",
		},
	})
		.then((response) => response.json())
		.then((product) => {
		if (typeof callback === "function") {
			callback(product);
		} else {
			Bizweb.onProduct(product);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.changeItem = function(variantId, quantity, callback) {
	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "quantity=" + quantity + "&variantId=" + variantId,
	};

	fetch("/cart/change.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onCartUpdate(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.removeItem = function(variantId, callback) {
	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "quantity=0&variantId=" + variantId,
	};

	fetch("/cart/change.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onCartUpdate(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.clear = function(callback) {
	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "",
	};

	fetch("/cart/clear.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onCartUpdate(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.updateCartFromForm = function(formId, callback) {
	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams(new FormData(document.getElementById(formId))),
	};

	fetch("/cart/update.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onCartUpdate(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.updateCartAttributes = function(attributes, callback) {
	var data = "";
	if (Array.isArray(attributes)) {
		attributes.forEach(function(attribute) {
			var key = attributeToString(attribute.key);
			if (key !== "") {
				data += "attributes[" + key + "]=" + attributeToString(attribute.value) + "&";
			}
		});
	} else if (typeof attributes === "object" && attributes !== null) {
		for (var key in attributes) {
			data += "attributes[" + attributeToString(key) + "]=" + attributeToString(attributes[key]) + "&";
		}
	}

	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: data,
	};

	fetch("/cart/update.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onCartUpdate(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.updateCartNote = function(note, callback) {
	var data = "note=" + attributeToString(note);

	var options = {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: data,
	};

	fetch("/cart/update.js", options)
		.then((response) => response.json())
		.then((data) => {
		if (typeof callback === "function") {
			callback(data);
		} else {
			Bizweb.onCartUpdate(data);
		}
	})
		.catch((error) => {
		Bizweb.onError(error);
	});
};

Bizweb.param = function(params) {
	var result = [];
	var append = function(key, value) {
		value = jQuery.isFunction(value) ? value() : value;
		result[result.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
	};

	if (jQuery.isArray(params) || params.jquery) {
		jQuery.each(params, function() {
			append(this.name, this.value);
		});
	} else {
		for (var key in params) {
			Bizweb.buildParams(key, params[key], append);
		}
	}

	return result.join("&").replace(/%20/g, "+");
};

Bizweb.buildParams = function(key, value, callback) {
  if (Array.isArray(value) && value.length) {
    value.forEach(function(item, index) {
      if (rbracket.test(key)) {
        callback(key, item);
      } else {
        var newKey = key + "[" + (typeof item === "object" || Array.isArray(item) ? index : "") + "]";
        Bizweb.buildParams(newKey, item, callback);
      }
    });
  } else if (value !== null && typeof value === "object") {
    if (Bizweb.isEmptyObject(value)) {
      callback(key, "");
    } else {
      for (var subKey in value) {
        var newKey = key + "[" + subKey + "]";
        Bizweb.buildParams(newKey, value[subKey], callback);
      }
    }
  } else {
    callback(key, value);
  }
};

Bizweb.isEmptyObject = function(object) {
  for (var key in object) {
    return false;
  }
  return true;
};