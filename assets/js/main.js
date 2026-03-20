var App = (function($) {
	"use strict";

	// ============================================
	// Statement Lines Reveal
	// ============================================
	var StatementLines = (function() {
		function splitLines($el) {
			// Store original text on first call
			if (!$el.data("original-text")) {
				$el.data("original-text", $el.text().trim());
			}
			var words = $el.data("original-text").split(/\s+/);
			$el.empty();
			var $measure = $("<span>").css({
				visibility: "hidden",
				position: "absolute",
				whiteSpace: "nowrap"
			}).appendTo($el);
			var maxWidth = $el.width();
			var lines = [];
			var currentLine = "";

			words.forEach(function(word) {
				var testLine = currentLine ? currentLine + " " + word : word;
				$measure.text(testLine);
				if ($measure.width() > maxWidth && currentLine) {
					lines.push(currentLine);
					currentLine = word;
				} else {
					currentLine = testLine;
				}
			});
			if (currentLine) lines.push(currentLine);
			$measure.remove();

			$el.empty();
			lines.forEach(function(line) {
				$el.append(
					'<span class="line">' +
					'<span class="line__default">' + line + " </span>" +
					'<span class="line__mask"><span class="line__mask-content">' + line + " </span></span>" +
					"</span>"
				);
			});

			$el.find(".line").each(function() {
				var $def = $(this).find(".line__default");
				$(this).find(".line__mask-content").width($def.width());
				$(this).find(".line__mask").height($def.height());
			});
		}

		function onScroll($texts) {
			var wh = $(window).height();
			$texts.each(function() {
				var $el = $(this);
				var rect = this.getBoundingClientRect();
				// start: element enters bottom of viewport; end: element center reaches viewport center
				var start = wh;
				var end = wh * 0.2;
				var progress = (start - rect.top) / (start - end);
				progress = Math.max(0, Math.min(1, progress));

				var $lines = $el.find(".line__mask");
				var count = $lines.length;
				$lines.each(function(i) {
					// Each line gets its own slice of the total progress
					var lineStart = i / count;
					var lineEnd = (i + 1) / count;
					var lineProgress = (progress - lineStart) / (lineEnd - lineStart);
					lineProgress = Math.max(0, Math.min(1, lineProgress));
					this.style.width = (lineProgress * 100) + "%";
				});
			});
		}

		function init() {
			var $texts = $(".block-statement__text");
			if (!$texts.length) return;

			$texts.each(function() {
				splitLines($(this));
			});

			$(window).on("resize", function() {
				$texts.each(function() {
					splitLines($(this));
				});
			});

			$(window).on("scroll", function() {
				onScroll($texts);
			});
			onScroll($texts);
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Video Lightbox
	// ============================================
	var VideoLightbox = (function() {
		var $lightbox, $content;

		function open(videoUrl) {
			var html;
			if (videoUrl.indexOf("youtube") !== -1 || videoUrl.indexOf("vimeo") !== -1) {
				html = '<iframe src="' + videoUrl +
					'?autoplay=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
			} else {
				html = '<video controls autoplay><source src="' + videoUrl + '" type="video/mp4"></video>';
			}
			$content.html(html);
			$lightbox.addClass('video-lightbox--open');
			PageScroll.lock();
			$(document).on("mousewheel.vlb DOMMouseScroll.vlb touchmove.vlb", function(e) {
				e.preventDefault();
			});
		}

		function close() {
			$lightbox.removeClass('video-lightbox--open');
			PageScroll.unlock();
			setTimeout(function() {
				$content.html("");
			}, 300);
			$(document).off("mousewheel.vlb DOMMouseScroll.vlb touchmove.vlb");
		}

		function init() {
			$lightbox = $(".video-lightbox");
			if (!$lightbox.length) return;

			$content = $(".video-lightbox__content");

			$(document).on("click", "[data-video]", function(e) {
				e.preventDefault();
				e.stopPropagation();
				open($(this).attr("data-video"));
			});

			$(".video-lightbox__close").on("click", close);

			$lightbox.on("click", function(e) {
				if ($(e.target).closest(".video-lightbox__content").length === 0) {
					close();
				}
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// FAQ Accordion
	// ============================================
	var FAQAccordion = (function() {
		function init() {
			var $items = $(".block-faq__item");
			if (!$items.length) return;

			$(".block-faq__question").on("click", function() {
				var $item = $(this).closest(".block-faq__item");
				var isOpen = $item.hasClass("block-faq__item--open");

				$items.filter(".block-faq__item--open").removeClass("block-faq__item--open").find(
					".block-faq__answer").stop().slideUp(300);

				if (!isOpen) {
					$item.addClass("block-faq__item--open");
					$item.find(".block-faq__answer").stop().slideDown(300);
				}
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Smooth Scroll
	// ============================================
	var SmoothScroll = (function() {
		function init() {
			$('a[href^="#"]').on("click", function(e) {
				var href = $(this).attr("href");
				if (href === "#") return;
				var $target = $(href);
				if ($target.length) {
					e.preventDefault();
					$("html, body").animate({
						scrollTop: $target.offset().top
					}, 400);
				}
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Filter Tabs
	// ============================================
	var FilterTabs = (function() {
		function init() {
			$(".filter-tabs").each(function() {
				var $tabs = $(this).find(".filter-tabs__tab");

				$tabs.on("click", function() {
					$tabs.removeClass("filter-tabs__tab--active").attr("aria-selected", "false");
					$(this).addClass("filter-tabs__tab--active").attr("aria-selected", "true");
				});
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Show More (SEO Text)
	// ============================================
	var ShowMore = (function() {
		function init() {
			$(".block-seo-text__toggle").on("click", function() {
				var $btn = $(this);
				var $hidden = $btn.siblings(".block-seo-text__hidden");
				var $icon = $btn.find("img");
				var expanding = $btn.toggleClass("is-active").hasClass("is-active");

				$hidden.stop().slideToggle(300);

				var textNode = this.firstChild;
				if (textNode && textNode.nodeType === Node.TEXT_NODE) {
					textNode.textContent = expanding ? "Show Less " : "Show More ";
				}
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Toggle Switch
	// ============================================
	var ToggleSwitch = (function() {
		function init() {
			$(".filter-bar__toggle").on("click", function() {
				var $switch = $(this).find(".filter-bar__switch");
				$switch.toggleClass("filter-bar__switch--active");
				var isActive = $switch.hasClass("filter-bar__switch--active");
				$switch.attr("aria-checked", isActive ? "true" : "false");
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Dropdown
	// ============================================
	var Dropdown = (function() {
		function init() {
			var $dropdowns = $(".dropdown");
			if (!$dropdowns.length) return;

			$(".dropdown__toggle").on("click", function(e) {
				e.stopPropagation();
				var $dropdown = $(this).closest(".dropdown");
				var $menu = $dropdown.find(".dropdown__menu");
				var isOpen = $(this).hasClass("is-active");

				$dropdowns.not($dropdown).find(".dropdown__toggle").removeClass("is-active");
				$dropdowns.not($dropdown).find(".dropdown__menu").stop().slideUp(200);

				$(this).toggleClass("is-active", !isOpen);
				$menu.stop().slideToggle(200);
			});

			$(".dropdown__item").on("click", function() {
				var $dropdown = $(this).closest(".dropdown");
				var $toggle = $dropdown.find(".dropdown__toggle");
				var $menu = $dropdown.find(".dropdown__menu");

				$dropdown.find(".dropdown__item").removeClass("is-selected");
				$(this).addClass("is-selected");

				$toggle.find(".dropdown__title").text($(this).text());

				$toggle.removeClass("is-active");
				$menu.stop().slideUp(200);
			});

			$(document).on("click", function() {
				$(".dropdown__toggle").removeClass("is-active");
				$(".dropdown__menu").stop().slideUp(200);
			});

			$(".dropdown__menu").on("click", function(e) {
				e.stopPropagation();
			});
		}

		return {
			init: init
		};
	})();



	// ============================================
	// Nav Menu (Shop Flyout — L1 + L2)
	// ============================================
	var NavMenu = (function() {
		var $menu, $mask, $body, $l1, $l2, $shopToggle, $submenuToggle;
		var hoverTimer;

		function isMobile() {
			return window.innerWidth < 1024;
		}

		function updateTop() {
			var bottom = $(".header")[0].getBoundingClientRect().bottom;
			$menu[0].style.setProperty("--nav-menu-top", bottom + "px");
		}

		function open() {
			HeaderDropdown.close();

			updateTop();
			$(".header").addClass("is-menu-open");
			$menu.addClass("is-open");
			$mask.addClass("is-open");
			$l1.addClass("is-active");
			$shopToggle.addClass("is-open").attr("aria-expanded", "true");
			PageScroll.lock();
		}

		function close() {
			clearTimeout(hoverTimer);
			$l2.removeClass("is-open");
			$l1.removeClass("is-active has-l2");
			$submenuToggle.removeClass("is-active");
			$shopToggle.removeClass("is-open").attr("aria-expanded", "false");
			$menu.removeClass("is-open");
			$mask.removeClass("is-open");
			$(".header").removeClass("is-menu-open");
			PageScroll.unlock();
		}

		function openL2() {
			$l2.addClass("is-open");
			if (!isMobile()) $l1.addClass("has-l2");
			$submenuToggle.addClass("is-active");
		}

		function closeL2() {
			$l2.removeClass("is-open");
			$l1.removeClass("has-l2");
			$submenuToggle.removeClass("is-active");
		}

		function init() {
			$menu = $("#nav-menu");
			if (!$menu.length) return;

			$body = $("body");
			$mask = $(".nav-menu__mask");
			$l1 = $menu.find(".nav-menu__panel--l1");
			$l2 = $menu.find(".nav-menu__panel--l2");
			$shopToggle = $("[data-shop-toggle]");
			$submenuToggle = $("[data-submenu-toggle]");

			// ---- Mobile: click ----
			$shopToggle.on("click", function(e) {
				e.preventDefault();
				if (!isMobile()) return;
				$l1.hasClass("is-active") ? close() : open();
			});

			// ---- Desktop: hover with timer ----
			$shopToggle.filter(".desktop-only").on("mouseenter", function() {
				clearTimeout(hoverTimer);
				if (!$l1.hasClass("is-active")) open();
			});
			$shopToggle.filter(".desktop-only").on("mouseleave", function() {
				hoverTimer = setTimeout(close, 250);
			});

			$menu.find(".nav-menu__body").on("mouseenter", function() {
				if (isMobile()) return;
				clearTimeout(hoverTimer);
			});
			$menu.find(".nav-menu__body").on("mouseleave", function() {
				if (isMobile()) return;
				hoverTimer = setTimeout(close, 250);
			});

			// ---- L2 toggle (click, both PC & mobile) ----
			$submenuToggle.on("click", function(e) {
				e.stopPropagation();
				$l2.hasClass("is-open") ? closeL2() : openL2();
			});

			$("[data-menu-back]").on("click", function(e) {
				e.stopPropagation();
				closeL2();
			});

			$menu.find(".nav-menu__panel--l2").on("click", function(e) {
				e.stopPropagation();
			});

			$menu.find(".nav-menu__close").on("click", close);
			$mask.on("click", close);
		}

		return {
			init: init,
			close: close,
			isOpen: function() {
				return $l1 && $l1.hasClass("is-active");
			}
		};
	})();

	// ============================================
	// Header Dropdown (hover on PC, with mask)
	// ============================================
	var HeaderDropdown = (function() {
		var $menu;

		function closeDropdown() {
			$(".header__dropdown.is-open").removeClass("is-open");
			$("[data-sub-toggle].is-open").removeClass("is-open");
			// Only remove mask if mega menu isn't open
			if (!NavMenu.isOpen()) {
				$menu.removeClass("is-open");
			}
		}

		function init() {
			$menu = $("#nav-menu");

			$("[data-sub-toggle]").on("mouseenter", function() {
				if (window.innerWidth < 1024) return;
				if (NavMenu.isOpen()) NavMenu.close();

				closeDropdown();
				$(this).addClass("is-open");
				$(this).find(".header__dropdown").addClass("is-open");
				$menu.addClass("is-open"); // show mask
			});

			$("[data-sub-toggle]").on("mouseleave", function() {
				if (window.innerWidth < 1024) return;
				closeDropdown();
			});
		}

		return {
			init: init,
			close: closeDropdown
		};
	})();

	// ============================================
	// Lenis Smooth Scroll
	// ============================================
	var LenisScroll = (function() {
		var lenis;

		function init() {
			if (typeof Lenis === "undefined") return;

			lenis = new Lenis({
				duration: 0.8,
				easing: function(t) {
					return Math.min(1, 1.001 - Math.pow(2, -10 * t));
				},
				touchMultiplier: 2
			});

			function raf(time) {
				lenis.raf(time);
				requestAnimationFrame(raf);
			}
			requestAnimationFrame(raf);
		}

		function stop() {
			if (lenis) lenis.stop();
		}

		function start() {
			if (lenis) lenis.start();
		}

		return {
			init: init,
			stop: stop,
			start: start
		};
	})();

	// ============================================
	// Page Scroll
	// ============================================
	var PageScroll = (function() {
		let $body = $('body');

		let scrollPosition = [0, 0];
		let previousOverflow = '';
		let isLocked = false;

		function getScroll() {
			return [
				window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
				window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
			];
		}

		function lock() {
			if (isLocked) return;

			const initWidth = $body.outerWidth();
			const initHeight = $body.outerHeight();

			scrollPosition = getScroll();
			previousOverflow = $body.css('overflow');

			document.body.classList.add('scroll-locked');

			$body.css('overflow', 'clip visible');

			window.scrollTo(scrollPosition[0], scrollPosition[1]);

			const marginR = $body.outerWidth() - initWidth;
			const marginB = $body.outerHeight() - initHeight;

			$body.css({
				'margin-right': marginR,
				'margin-bottom': marginB
			});

			if (typeof LenisScroll !== 'undefined') {
				LenisScroll.stop();
			}

			isLocked = true;
		}

		function unlock() {
			if (!isLocked) return;

			$body.css('overflow', previousOverflow);

			window.scrollTo(scrollPosition[0], scrollPosition[1]);

			$body.css({
				'margin-right': 0,
				'margin-bottom': 0
			});

			document.body.classList.remove('scroll-locked');

			if (typeof LenisScroll !== 'undefined') {
				LenisScroll.start();
			}

			isLocked = false;
		}

		return {
			lock,
			unlock
		};
	})();


	// ============================================
	// Experts Tabs (mobile)
	// ============================================
	var ExpertsTabs = (function() {
		function init() {
			var $section = $(".block-experts");
			if (!$section.length) return;

			$section.on("click", ".block-experts__thumb", function() {
				var idx = $(this).data("expert");
				var $items = $section.find(".listings--testimonials .item");
				var $thumbs = $section.find(".block-experts__thumb");
				var $portrait = $section.find(".block-experts__portrait img");

				$thumbs.removeClass("is-active");
				$(this).addClass("is-active");

				$items.removeClass("is-active");
				$items.eq(idx).addClass("is-active");

				var src = $items.eq(idx).find(".card__avatar img").attr("src");
				if ($portrait.length && src) $portrait.attr("src", src);
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Wowo — Scroll-triggered animations + CountUp
	// ============================================
	var Wowo = (function() {
		function wowo() {
			var wTop = $(window).scrollTop(),
				wHeight = $(window).height(),
				wBottom = wTop + wHeight;

			$(".wowo:not(.animated)").each(function() {
				var me = $(this),
					meTop = me.offset().top,
					meHeight = me.innerHeight(),
					meBottom = meTop + meHeight,
					limitTop = wTop - meHeight,
					limitBottom = wBottom + meHeight;

				if (meTop > limitTop && meBottom < limitBottom) {
					me.addClass("animated");
				}
			});

			$(".countUp-num:not(.active)").each(function() {
				var me = $(this),
					meTop = me.offset().top,
					meHeight = me.innerHeight(),
					meBottom = meTop + meHeight,
					limitTop = wTop - meHeight,
					limitBottom = wBottom + meHeight;

				if (meTop > limitTop && meBottom < limitBottom) {
					me.addClass("active");

					var text = $(this).text().trim();
					var match = text.match(/^(\D*)?([\d,.]+)(\D*)?$/);

					if (match) {
						var prefix = match[1] || "";
						var numString = match[2].replace(/,/g, "");
						var suffix = match[3] || "";
						var num = parseFloat(numString);

						numString = String(numString);
						var decimalPlaces = numString.includes(".") ? numString.split(".")[1].length : 0;

						var demo = new countUp.CountUp(this, num, {
							duration: 4,
							decimalPlaces: decimalPlaces,
							prefix: prefix,
							suffix: suffix,
							useGrouping: false
						});

						if (!demo.error) {
							demo.start();
						} else {
							console.error(demo.error);
						}
					}
				}
			});
		}

		var ticking = false;

		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(function() {
					wowo();
					ticking = false;
				});
				ticking = true;
			}
		}

		function init() {
			if (!$(".wowo").length && !$(".countUp-num").length) return;
			wowo();
			$(window).on("scroll", onScroll);
		}

		return {
			init: init
		};
	})();

	// ============================================
	// PDP Console (slick gallery + accordion + pricing + lightbox)
	// ============================================
	var PdpConsole = (function() {
		var $gallery, $thumbs, $lightbox, $lightboxCarousel;

		function initGallery() {
			$gallery = $(".block-pdp-console__gallery .carousel");
			$thumbs = $(".block-pdp-console__thumbs .carousel");
			if (!$gallery.length || !$thumbs.length) return;

			// Main gallery
			$gallery.slick({
				infinite: true,
				slidesToShow: 1,
				slidesToScroll: 1,
				speed: 400,
				fade: true,
				arrows: false,
				dots: false,
				draggable: true,
				asNavFor: ".block-pdp-console__thumbs .carousel"
			});

			// Thumbs nav
			$thumbs.slick({
				infinite: false,
				slidesToShow: 6,
				slidesToScroll: 1,
				speed: 300,
				arrows: true,
				dots: false,
				focusOnSelect: true,
				asNavFor: ".block-pdp-console__gallery .carousel",
				prevArrow: $(".block-pdp-console__thumbs .slick-arrow-prev"),
				nextArrow: $(".block-pdp-console__thumbs .slick-arrow-next"),
				responsive: [{
					breakpoint: 1024,
					settings: {
						slidesToShow: 5
					}
				}, {
					breakpoint: 768,
					settings: {
						slidesToShow: 4
					}
				}]
			});

			// Click main image → open lightbox
			$gallery.on("click", ".slick-slide", function() {
				var idx = $(this).data("slick-index");
				openLightbox(idx);
			});
		}

		function openLightbox(startIndex) {
			$lightbox = $("#pdp-lightbox");
			if (!$lightbox.length) return;

			$lightboxCarousel = $lightbox.find(".pdp-lightbox__carousel");

			// Destroy previous slick if exists
			if ($lightboxCarousel.hasClass("slick-initialized")) {
				$lightboxCarousel.slick("unslick");
			}

			// Build slides from gallery images
			var html = "";
			$gallery.find(".slick-slide:not(.slick-cloned) img").each(function() {
				html += '<div class="item"><img src="' + $(this).attr("src") + '" alt="' + ($(this).attr("alt") ||
					"") + '" /></div>';
			});
			$lightboxCarousel.html(html);

			var total = $lightboxCarousel.find(".item").length;

			$lightboxCarousel.slick({
				infinite: true,
				slidesToShow: 1,
				slidesToScroll: 1,
				speed: 400,
				arrows: true,
				dots: false,
				draggable: true,
				initialSlide: startIndex || 0
			});

			$lightboxCarousel.on("afterChange", function(e, slick, currentSlide) {
				$lightbox.find(".pdp-lightbox__current").text(currentSlide + 1);
			});

			$lightbox.find(".pdp-lightbox__total").text(total);
			$lightbox.find(".pdp-lightbox__current").text((startIndex || 0) + 1);
			$lightbox.fadeIn(300);

			// Lock scroll
			$(document).on("mousewheel.pdplb DOMMouseScroll.pdplb touchmove.pdplb", function(e) {
				e.preventDefault();
			});
		}

		function closeLightbox() {
			$lightbox = $("#pdp-lightbox");
			$lightbox.fadeOut(300);
			$(document).off("mousewheel.pdplb DOMMouseScroll.pdplb touchmove.pdplb");
		}

		function init() {
			var $section = $(".block-pdp-console");
			if (!$section.length) return;

			initGallery();

			// Lightbox close
			$(document).on("click", ".pdp-lightbox__close", closeLightbox);
			$(document).on("click", ".pdp-lightbox__overlay", closeLightbox);
			$(document).on("keydown", function(e) {
				if (e.key === "Escape") closeLightbox();
			});

			// Accordion
			$section.on("click", ".block-pdp-console__accordion-trigger", function() {
				var $item = $(this).closest(".block-pdp-console__accordion-item");
				var isOpen = $item.hasClass("block-pdp-console__accordion-item--open");

				// Close all
				$section.find(".block-pdp-console__accordion-item--open")
					.removeClass("block-pdp-console__accordion-item--open")
					.find(".block-pdp-console__accordion-body").stop().slideUp(300);
				$section.find(".block-pdp-console__accordion-trigger").attr("aria-expanded", "false");

				// Open clicked (if wasn't open)
				if (!isOpen) {
					$item.addClass("block-pdp-console__accordion-item--open");
					$item.find(".block-pdp-console__accordion-body").stop().slideDown(300);
					$item.find(".block-pdp-console__accordion-trigger").attr("aria-expanded", "true");
				}
			});

			// Pricing option selection
			$section.on("click", ".block-pdp-console__price-option", function() {
				var $opt = $(this);
				if ($opt.hasClass("is-selected")) return;

				$section.find(".block-pdp-console__price-option").removeClass("is-selected");
				$opt.addClass("is-selected");

				// Update sticky CTA if visible
				var label = $opt.data("label");
				var price = $opt.data("price");
				if (label) {
					$("#sticky-cta").find(".sticky-cta__select-label").text(label);
					$("#sticky-cta").find(".sticky-cta__price").text("$" + price);
				}
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Sticky CTA
	// ============================================
	var StickyCta = (function() {
		var $sticky, $actions, $select;

		function onScroll() {
			if (!$actions.length) return;
			var actionsBottom = $actions[0].getBoundingClientRect().bottom;
			if (actionsBottom < 0) {
				$sticky.addClass("is-visible");
			} else {
				$sticky.removeClass("is-visible");
			}
		}

		function init() {
			$sticky = $("#sticky-cta");
			if (!$sticky.length) return;

			$actions = $("#pdp-actions");
			$select = $sticky.find(".sticky-cta__select");

			// Scroll visibility
			$(window).on("scroll", onScroll);
			onScroll();

			// Select dropdown toggle
			$sticky.on("click", ".sticky-cta__select-toggle", function(e) {
				e.stopPropagation();
				var isOpen = $select.hasClass("is-open");
				$select.toggleClass("is-open", !isOpen);
				$select.find(".sticky-cta__select-menu").stop().slideToggle(200);
				$(this).attr("aria-expanded", !isOpen);
			});

			// Select option
			$sticky.on("click", ".sticky-cta__select-option", function() {
				var $opt = $(this);
				$select.find(".sticky-cta__select-option").removeClass("is-selected");
				$opt.addClass("is-selected");

				$select.find(".sticky-cta__select-label").text($opt.data("label"));
				$select.find(".sticky-cta__select-sub").text($opt.data("sub"));
				$sticky.find(".sticky-cta__price").text("$" + $opt.data("price"));

				$select.removeClass("is-open");
				$select.find(".sticky-cta__select-menu").stop().slideUp(200);
				$select.find(".sticky-cta__select-toggle").attr("aria-expanded", "false");
			});

			// Close on outside click
			$(document).on("click", function() {
				if ($select.hasClass("is-open")) {
					$select.removeClass("is-open");
					$select.find(".sticky-cta__select-menu").stop().slideUp(200);
					$select.find(".sticky-cta__select-toggle").attr("aria-expanded", "false");
				}
			});

			$select.on("click", function(e) {
				e.stopPropagation();
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Carousel Factory
	// ============================================
	var CarouselFactory = (function() {
		var defaults = {
			infinite: true,
			pauseOnHover: false,
			pauseOnFocus: false,
			focusOnSelect: false,
			draggable: true,
			slidesToShow: 1,
			slidesToScroll: 1,
			autoplay: true,
			speed: 500,
			arrows: false,
			dots: false
		};

		function build($module, $carousel, config) {
			var opts = $.extend({}, defaults, config.options || {});
			opts.autoplaySpeed = parseInt($carousel.data('time'), 10) || 5000;

			if (opts.arrows && !opts.prevArrow) {
				opts.prevArrow = $module.find('.slick-arrow-prev');
				opts.nextArrow = $module.find('.slick-arrow-next');
			}

			if (config.dots) {
				opts.dots = true;
				opts.appendDots = $module.find(config.dots);
			}

			return opts;
		}

		function simple(config) {
			$(config.selector).each(function() {
				var $module = $(this);
				var $carousel = $module.find('.carousel');
				if (!$carousel.length || $carousel.hasClass('slick-initialized')) return;
				$carousel.slick(build($module, $carousel, config));
			});
		}

		function asNavFor(config) {
			$(config.selector).each(function() {
				var $module = $(this);
				var $nav = $module.find(config.nav.selector);
				var $main = $module.find(config.main.selector);
				if (!$nav.length || !$main.length) return;
				if ($nav.hasClass('slick-initialized') || $main.hasClass('slick-initialized')) return;

				var navOpts = build($module, $nav, config.nav);
				var mainOpts = build($module, $main, config.main);
				navOpts.asNavFor = $main;
				mainOpts.asNavFor = $nav;

				$nav.slick(navOpts);
				$main.slick(mainOpts);
			});
		}

		function resize(config) {
			$(config.selector).each(function() {
				var $module = $(this);
				var $carousel = $module.find('.carousel');
				if (!$carousel.length) return;

				function toggle() {
					var match = $(window).width() <= config.breakpoint;
					if (match && !$carousel.hasClass('slick-initialized')) {
						$carousel.slick(build($module, $carousel, config));
					} else if (!match && $carousel.hasClass('slick-initialized')) {
						$carousel.slick('unslick');
					}
				}

				toggle();
				$(window).on('resize', toggle);
			});
		}

		function initAll() {
			// ---- Simple ----
			simple({
				selector: '.promo-bar',
				options: {
					speed: 300,
					fade: false,
					autoplay: false
				}
			});

			simple({
				selector: '.block-hero',
				dots: '.block-hero__dots',
				options: {
					speed: 600,
					fade: true
				}
			});

			simple({
				selector: '.block-community',
				options: {
					slidesToShow: 4,
					arrows: true,
					responsive: [{
							breakpoint: 1024,
							settings: {
								slidesToShow: 3
							}
						},
						{
							breakpoint: 768,
							settings: {
								slidesToShow: 1
							}
						}
					]
				}
			});

			simple({
				selector: '.block-product-review',
				dots: '.block-product-review__dots',
				options: {
					slidesToShow: 3,
					responsive: [{
							breakpoint: 1024,
							settings: {
								slidesToShow: 2
							}
						},
						{
							breakpoint: 768,
							settings: {
								slidesToShow: 1
							}
						}
					]
				}
			});

			simple({
				selector: '.block-benefits',
				options: {
					slidesToShow: 6,
					arrows: true,
					responsive: [{
							breakpoint: 1280,
							settings: {
								slidesToShow: 5
							}
						},
						{
							breakpoint: 1024,
							settings: {
								slidesToShow: 3
							}
						},
						{
							breakpoint: 768,
							settings: {
								slidesToShow: 1
							}
						}
					]
				}
			});

			simple({
				selector: '.block-dosage',
				options: {
					slidesToShow: 2,
					arrows: true,
					responsive: [{
						breakpoint: 1024,
						settings: {
							slidesToShow: 1
						}
					}]
				}
			});

			simple({
				selector: '.block-ambassador',
				options: {
					fade: true,
					speed: 600,
					arrows: true
				}
			});

			simple({
				selector: '.block-product-carousel',
				options: {
					slidesToShow: 4,
					arrows: true,
					responsive: [{
							breakpoint: 1024,
							settings: {
								slidesToShow: 3
							}
						},
						{
							breakpoint: 768,
							settings: {
								slidesToShow: 2
							}
						}
					]
				}
			});

			simple({
				selector: '.block-blog-carousel',
				options: {
					slidesToShow: 3,
					responsive: [{
							breakpoint: 1024,
							settings: {
								slidesToShow: 2
							}
						},
						{
							breakpoint: 768,
							settings: {
								slidesToShow: 1
							}
						}
					]
				}
			});

			// ---- AsNavFor ----
			asNavFor({
				selector: '.block-timeline',
				nav: {
					selector: '.block-timeline__tabs .carousel',
					options: {
						infinite: false,
						variableWidth: true,
						focusOnSelect: true,
						draggable: false
					}
				},
				main: {
					selector: '.block-timeline__content .carousel',
					options: {
						speed: 600
					}
				}
			});

			// ---- Resize ----
			resize({
				selector: '.block-ingredients',
				breakpoint: 767,
				dots: '.block-ingredients__dots',
				options: {
					rows: 3,
					slidesPerRow: 1
				}
			});
		}

		return {
			initAll: initAll
		};
	})();

	// ============================================
	// Scroll Height (--sh on <html>)
	// ============================================
	var ScrollHeight = (function() {
		var ticking = false;

		function update() {
			document.documentElement.style.setProperty("--sh", window.pageYOffset + "px");
		}

		function onScroll() {
			if (!ticking) {
				requestAnimationFrame(function() {
					update();
					ticking = false;
				});
				ticking = true;
			}
		}

		function init() {
			update();
			$(window).on("scroll", onScroll);
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Init
	// ============================================
	function init() {
		LenisScroll.init();
		VideoLightbox.init();
		FAQAccordion.init();
		SmoothScroll.init();
		FilterTabs.init();
		ShowMore.init();
		ToggleSwitch.init();
		Dropdown.init();
		NavMenu.init();
		HeaderDropdown.init();

		CarouselFactory.initAll();

		ExpertsTabs.init();
		PdpConsole.init();
		StickyCta.init();
		// ScrollHeight.init();
		StatementLines.init();
		Wowo.init();
		if (typeof Marquee3k !== "undefined") Marquee3k.init();
	}

	return {
		init: init
	};
})(jQuery);

$(function() {
	App.init();
});