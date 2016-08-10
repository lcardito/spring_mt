if (document.domain == "127.0.0.1") {
	$.fx.off = true;
	$.support.transition = false;
	$('head').append('<style id="addedCSS" type="text/css">* { transition: none !important; }</style>');
}
var _mask = {
	options: {
		animationDuration: 175,
		animationEasing: mina.easein //mina.bounce
	},
	s: null,
	svgSupport: false,
	maskShown: false,
	maskSetupRun: false,
	currentColour: 0,
	currentAnimatedElement: 0,
	backToOriginal: false,
	colours: ['#F7A84A', '#E25D46', '#DAA3CA', '#B0A3D0', '#5DAEDD', '#6CC6D8', '#6AB862', '#FFD633'],

	initial_ani_setup: function () {
		this.svgSupport = !!(window.SVGSVGElement);
		if (!this.svgSupport) {
			$('#spinner-fallback-image').show();
			$("#animated_spectrum_spinner").remove();
		} else {
			$('#spinner-fallback-image').remove();
			this.s = Snap("#animated_spectrum_spinner");
		}
	},
	animateMask: function (mask) {
		if (!mask.maskShown || !mask.svgSupport || mask.s == null) {
		 	return;
		}

		var offset = (mask.currentAnimatedElement + mask.currentColour) % mask.colours.length;
		var colourToChangeTo = mask.backToOriginal ? mask.colours[offset] : mask.colours[mask.currentColour];
		var elementToAnimate = mask.s.select('#path' + offset);

		elementToAnimate.animate({
			fill: colourToChangeTo
		}, mask.options.animationDuration, mask.options.animationEasing, function () {
			mask.animateMask(mask)
		});

		mask.currentAnimatedElement = (mask.currentAnimatedElement + 1) % mask.colours.length;
		if (mask.currentAnimatedElement == 0) {
			mask.backToOriginal = !mask.backToOriginal;
			if (mask.backToOriginal) {
				mask.currentColour = (mask.currentColour + 1) % mask.colours.length;
			}
		}
	},

	showMask: function (enabled) {
		if (!this.maskSetupRun) {
			this.initial_ani_setup();
		}
		var spinnerContainer = $("#spinner-container");
		if (enabled) {
			if (!spinnerContainer.is(":visible")) {
				spinnerContainer.fadeIn();
			}
		} else {
			if (spinnerContainer.is(":visible")) {
				spinnerContainer.fadeOut();
			}
		}
		//Stop double animations
		if (!this.maskShown) {
			this.maskShown = enabled;
			this.animateMask(this);
		}
		this.maskShown = enabled;
	}
}

function showMask(enabled, text) {
	if (enabled === undefined) {
		enabled = true;
	}
	if (text === undefined || text === null) {
		if (typeof (enabled) === typeof ("string")) { //You see what I did there? :)
			text = enabled;
			enabled = true;
		} else if (enabled) {
			text = "Just handling your request now. . .";
		}
	}
	_mask.showMask(enabled);
	$("#spinner-message").text(text);
}