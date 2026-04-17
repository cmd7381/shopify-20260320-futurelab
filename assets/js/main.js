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
				var start = wh * 0.7;
				var end = wh * 0.3;
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
	// Shared mask helper — only remove when nothing needs it
	// ============================================
	function isMaskNeeded() {
		return $(".nav-menu.is-open").length > 0
			|| $(".header__dropdown.is-open").length > 0
			|| $(".sticky-cta__select.is-open").length > 0
			|| $(".lightbox.is-open").length > 0;
	}

	function releaseMask() {
		if (!isMaskNeeded()) {
			$("#nav-mask").removeClass("is-open");
		}
	}

	// ============================================
	// Lightbox mask: sync nav-menu__mask with any .lightbox.is-open
	// ============================================
	(function() {
		var $mask = $("#nav-mask");
		if (!$mask.length) return;

		$(".lightbox").each(function() {
			new MutationObserver(function(mutations) {
				var anyOpen = $(".lightbox.is-open").length > 0;
				if (anyOpen) {
					$mask.css("z-index", 399).addClass("is-open");
				} else {
					releaseMask();
					setTimeout(function() { $mask.css("z-index", ""); }, 300);
				}
			}).observe(this, { attributes: true, attributeFilter: ["class"] });
		});
	})();

	// ============================================
	// Video Lightbox
	// ============================================
	var VideoLightbox = (function() {
		var $lightbox, $content;

		function open(videoUrl) {
			var html;
			var ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
			if (ytMatch) {
				html = '<iframe src="https://www.youtube.com/embed/' + ytMatch[1] +
					'?autoplay=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
			} else if (videoUrl.indexOf("vimeo") !== -1) {
				html = '<iframe src="' + videoUrl +
					'?autoplay=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
			} else {
				html = '<video controls autoplay><source src="' + videoUrl + '" type="video/mp4"></video>';
			}
			$content.html(html);
			$lightbox.addClass('is-open');
			PageScroll.lock();
			$(document).on("mousewheel.vlb DOMMouseScroll.vlb touchmove.vlb", function(e) {
				e.preventDefault();
			});
		}

		function close() {
			$lightbox.removeClass('is-open');
			PageScroll.unlock();
			setTimeout(function() {
				$content.html("");
			}, 300);
			$(document).off("mousewheel.vlb DOMMouseScroll.vlb touchmove.vlb");
		}

		function init() {
			$lightbox = $(".video-lightbox");
			if (!$lightbox.length) return;

			$content = $lightbox.find(".lightbox__content");

			$(document).on("click", "[data-video]", function(e) {
				e.preventDefault();
				e.stopPropagation();
				open($(this).attr("data-video"));
			});

			$lightbox.find(".lightbox__close").on("click", close);

			$lightbox.on("click", function(e) {
				if ($(e.target).closest(".lightbox__content").length === 0) {
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
		function measure() {
			$(".block-seo-text__visible").each(function() {
				var el = this;
				var text = el.querySelector(".text");
				if (!text) return;
				el.style.setProperty("--max-height", text.scrollHeight + "px");
			});
		}

		function init() {
			measure();

			var resizeTimer;
			$(window).on("resize", function() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(measure, 150);
			});

			$(".block-seo-text__toggle").on("click", function() {
				var $btn = $(this);
				var $visible = $btn.siblings(".block-seo-text__visible");
				var expanding = $btn.toggleClass("is-active").hasClass("is-active");

				$visible.toggleClass("is-active", expanding);

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
	// Page Header Show More (inline toggle after ellipsis)
	// ============================================
	var PageHeaderShowMore = (function() {
		function check() {
			$(".page-header__description").each(function() {
				var el = this;
				el.style.setProperty("--max-height", el.scrollHeight + "px");
				var truncated = el.scrollHeight > el.clientHeight + 2;
				el.classList.toggle("is-truncated", truncated);
				var $wrap = $(el).find(".page-header__toggle-wrap");
				if (truncated && !$wrap.length) {
					$(el).append(
						'<span class="page-header__toggle-wrap">' +
						'<span class="page-header__toggle-ellipsis">\u2026\u00a0\u00a0</span>' +
						'<a href="#" class="page-header__toggle">Show more</a>' +
						'</span>'
					);
				} else if (!truncated && $wrap.length) {
					$wrap.remove();
				}
			});
		}

		function init() {
			check();

			var resizeTimer;
			$(window).on("resize", function() {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(check, 150);
			});

			$(document).on("click", ".page-header__toggle", function(e) {
				e.preventDefault();
				var $desc = $(this).closest(".page-header__description");
				var expanding = !$desc.hasClass("is-active");
				$desc.toggleClass("is-active", expanding);
				this.textContent = expanding ? "Show less" : "Show more";
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
			$(document).on("click", ".dropdown__toggle", function(e) {
				e.stopPropagation();
				var $dropdown = $(this).closest(".dropdown");
				var $menu = $dropdown.find(".dropdown__menu");
				var isOpen = $(this).hasClass("is-active");

				$(".dropdown").not($dropdown).find(".dropdown__toggle").removeClass("is-active");
				$(".dropdown").not($dropdown).find(".dropdown__menu").stop().slideUp(200);

				$(this).toggleClass("is-active", !isOpen);
				$menu.stop().slideToggle(200);
			});

			$(document).on("click", ".dropdown__item", function() {
				var $dropdown = $(this).closest(".dropdown");
				var $toggle = $dropdown.find(".dropdown__toggle");
				var $menu = $dropdown.find(".dropdown__menu");

				$dropdown.find(".dropdown__item").removeClass("is-selected");
				$(this).addClass("is-selected");

				$toggle.find(".dropdown__title").text($(this).text());

				$toggle.removeClass("is-active");
				$menu.stop().slideUp(200);
			});

			$(document).on("click", function(e) {
				if (!$(e.target).closest(".dropdown").length) {
					$(".dropdown__toggle").removeClass("is-active");
					$(".dropdown__menu").stop().slideUp(200);
				}
			});
		}

		return {
			init: init
		};
	})();

	// ============================================
	// Copy Link
	// ============================================
	var CopyLink = (function() {
		function init() {
			$(".copy-btn").on("click", function() {
				var $btn = $(this);
				navigator.clipboard.writeText(window.location.href).then(function() {
					var $text = $btn.contents().filter(function() {
						return this.nodeType === 3 && $.trim(this.nodeValue).length > 0;
					}).last();
					var original = $text.text();
					$text.replaceWith(" Copied!");
					setTimeout(function() {
						$btn.contents().filter(function() {
							return this.nodeType === 3 && $.trim(this.nodeValue).length > 0;
						}).last().replaceWith(original);
					}, 2000);
				});
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
		var $menu, $mask, $body, $l1, $shopToggle, $submenuToggle;
		var hoverTimer;

		function isMobile() {
			return window.innerWidth < 1024;
		}

		function updateTop() {
			var bottom = $(".custom-header")[0].getBoundingClientRect().bottom;
			$menu[0].style.setProperty("--nav-menu-top", bottom + "px");
		}

		function open() {
			HeaderDropdown.close();

			updateTop();
			$(".custom-header").addClass("is-menu-open");
			$mask.addClass("is-open");
			$menu.addClass("is-open");
			$shopToggle.addClass("is-open").attr("aria-expanded", "true");
			PageScroll.lock();
		}

		function close() {
			clearTimeout(hoverTimer);
			// Disable L2 transition before closing so it doesn't animate out
			var $l2Panels = $menu.find(".nav-menu__panel--l2");
			$l2Panels.css("transition", "none");
			$l2Panels.removeClass("is-open");
			$l1.removeClass("has-l2");
			$submenuToggle.removeClass("is-active");

			$shopToggle.removeClass("is-open").attr("aria-expanded", "false");
			$menu.removeClass("is-open");
			releaseMask();
			$(".custom-header").removeClass("is-menu-open");
			PageScroll.unlock();
			// Restore L2 transition after menu is hidden
			setTimeout(function() {
				$l2Panels.css("transition", "");
			}, 350);
		}

		function openL2($target) {
			$menu.find(".nav-menu__panel--l2").removeClass("is-open");
			$submenuToggle.removeClass("is-active");
			$target.addClass("is-open");
			$target.closest("[data-submenu-toggle]").addClass("is-active");
			if (!isMobile()) $l1.addClass("has-l2");
		}

		function closeL2() {
			$menu.find(".nav-menu__panel--l2").removeClass("is-open");
			$l1.removeClass("has-l2");
			$submenuToggle.removeClass("is-active");
		}

		function init() {
			$menu = $("#nav-menu");
			if (!$menu.length) return;

			$body = $("body");
			$mask = $("#nav-mask");
			$l1 = $menu.find(".nav-menu__panel--l1");
			$shopToggle = $("[data-shop-toggle]");
			$submenuToggle = $("[data-submenu-toggle]").attr("tabindex", "0");

			// ---- Mobile: click ----
			$shopToggle.on("click", function(e) {
				e.preventDefault();
				if (!isMobile()) return;
				$menu.hasClass("is-open") ? close() : open();
			});

			// ---- Desktop: hover ----
			var $hoverZone = $shopToggle.filter(".desktop-only").add($menu.find(".nav-menu__panel--l1"));
			$hoverZone.on("mouseenter", function() {
				if (isMobile()) return;
				clearTimeout(hoverTimer);
				if (!$menu.hasClass("is-open")) open();
			});
			$hoverZone.on("mouseleave", function() {
				if (isMobile()) return;
				hoverTimer = setTimeout(close, 150);
			});

			// ---- L2 toggle: desktop hover, mobile click ----
			$submenuToggle.on("click", function(e) {
				e.stopPropagation();
				if (!isMobile()) return;
				var $myL2 = $(this).find(".nav-menu__panel--l2");
				$myL2.hasClass("is-open") ? closeL2() : openL2($myL2);
			});
			$submenuToggle.on("mouseenter", function() {
				if (isMobile()) return;
				clearTimeout(hoverTimer);
				var $myL2 = $(this).find(".nav-menu__panel--l2");
				if (!$myL2.hasClass("is-open")) openL2($myL2);
			});
			$submenuToggle.on("focusin", function() {
				if (isMobile()) return;
				clearTimeout(hoverTimer);
				var $myL2 = $(this).find(".nav-menu__panel--l2");
				if (!$myL2.hasClass("is-open")) openL2($myL2);
			});
			$submenuToggle.on("focusout", function(e) {
				if (isMobile()) return;
				setTimeout(function() {
					if (!$(document.activeElement).closest("[data-submenu-toggle]").length) closeL2();
				}, 0);
			});
			$submenuToggle.on("mouseleave", function() {
				if (isMobile()) return;
				hoverTimer = setTimeout(closeL2, 250);
			});

			$("[data-menu-back]").on("click", function(e) {
				e.stopPropagation();
				closeL2();
			});

			$menu.find(".nav-menu__panel--l2").on("click", function(e) {
				e.stopPropagation();
			});
			$menu.find(".nav-menu__panel--l2").on("mouseenter", function() {
				if (isMobile()) return;
				clearTimeout(hoverTimer);
			});
			$menu.find(".nav-menu__panel--l2").on("mouseleave", function() {
				if (isMobile()) return;
				hoverTimer = setTimeout(closeL2, 250);
			});

			$menu.find(".nav-menu__close").on("click", close);
			$mask.on("click", close);

			// ---- Keyboard: Tab opens menu and navigates inside ----
			var skipNextFocus = false;

			$shopToggle.on("focus", function() {
				if (isMobile() || skipNextFocus) {
					skipNextFocus = false;
					return;
				}
				clearTimeout(hoverTimer);
				if (!$menu.hasClass("is-open")) open();
			});

			// Tab on shop toggle → jump into menu
			$shopToggle.on("keydown", function(e) {
				if (isMobile()) return;
				if (e.key === "Tab" && !e.shiftKey && $menu.hasClass("is-open")) {
					e.preventDefault();
					var $first = $menu.find(".nav-menu__body a:visible, .nav-menu__body button:visible").first();
					if ($first.length) $first.focus();
				}
			});

			// Tab within menu: navigate through items
			$menu.on("keydown", function(e) {
				if (e.key !== "Tab" || !$menu.hasClass("is-open")) return;
				var $focusable = $menu.find("a:visible, button:visible");
				if (!$focusable.length) return;

				var first = $focusable.first()[0];
				var last = $focusable.last()[0];

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					skipNextFocus = true;
					close();
					$shopToggle.filter(":visible").first().focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					skipNextFocus = true;
					close();
					// Find next focusable header item after Shop
					var $trigger = $shopToggle.filter(":visible").first();
					var $header = $(".custom-header");
					var $allNav = $header.find(".header__nav-item, .header__cta, .header__icon").not("[data-shop-toggle]").filter(":visible");
					var $nextItem = $allNav.first();
					if ($nextItem.is("a, button")) {
						$nextItem.focus();
					} else {
						$nextItem.find("a, button").first().focus();
					}
				}
			});

			// Escape closes menu
			$(document).on("keydown", function(e) {
				if (e.key === "Escape" && $l1 && $menu.hasClass("is-open")) {
					skipNextFocus = true;
					close();
					$shopToggle.filter(":visible").first().focus();
				}
			});

			// Update --nav-menu-top on resize
			$(window).on("resize", function() {
				if ($menu.hasClass("is-open")) updateTop();
			});
		}

		return {
			init: init,
			close: close,
			isOpen: function() {
				return $l1 && $menu.hasClass("is-open");
			}
		};
	})();

	// ============================================
	// Header Dropdown (hover on PC, with mask)
	// ============================================
	var HeaderDropdown = (function() {
		var $mask;

		function closeDropdown() {
			$(".header__dropdown.is-open").removeClass("is-open");
			$("[data-sub-toggle].is-open").removeClass("is-open");
			releaseMask();
			if (!NavMenu.isOpen()) {
				PageScroll.unlock();
			}
		}

		function init() {
			$mask = $("#nav-mask");

			$("[data-sub-toggle]").on("mouseenter", function() {
				if (window.innerWidth < 1024) return;
				if (NavMenu.isOpen()) NavMenu.close();

				closeDropdown();
				$(this).addClass("is-open");
				$(this).find(".header__dropdown").addClass("is-open");
				$mask.addClass("is-open");
				PageScroll.lock();
			});

			$("[data-sub-toggle]").on("mouseleave", function() {
				if (window.innerWidth < 1024) return;
				closeDropdown();
			});

			// ---- Keyboard: Tab/focus opens dropdown ----
			$("[data-sub-toggle]").on("focusin", function() {
				if (window.innerWidth < 1024) return;
				if (NavMenu.isOpen()) NavMenu.close();
				closeDropdown();
				$(this).addClass("is-open");
				$(this).find(".header__dropdown").addClass("is-open");
				$mask.addClass("is-open");
				PageScroll.lock();
			});

			$("[data-sub-toggle]").on("focusout", function(e) {
				if (window.innerWidth < 1024) return;
				var $toggle = $(this);
				setTimeout(function() {
					if (!$toggle.find(":focus").length) {
						closeDropdown();
					}
				}, 0);
			});
		}

		return {
			init: init,
			close: closeDropdown
		};
	})();

	// ============================================
	// Cart Drawer: refresh slick when dialog opens
	// ============================================
	(function() {
		var dialog = document.querySelector('.cart-drawer__dialog');
		if (!dialog) return;
		$(dialog).find('.cart-items-component').attr('data-lenis-prevent', '');
		new MutationObserver(function() {
			if (dialog.open) {
				$(dialog).find('.slick-initialized').slick('setPosition');
			}
		}).observe(dialog, { attributes: true, attributeFilter: ['open'] });

		// Subscribe toggle
		$(dialog).on("click", ".cart-drawer__subscribe-toggle", function(e) {
			e.stopPropagation();
			var $subscribe = $(this).closest(".cart-drawer__subscribe");
			$subscribe.toggleClass("is-open");
			$subscribe.find(".cart-drawer__subscribe-body").slideToggle(300);
		});

		// Close subscribe on click outside
		$(dialog).on("click", function(e) {
			var $subscribe = $(".cart-drawer__subscribe.is-open");
			if ($subscribe.length && !$(e.target).closest(".cart-drawer__subscribe").length) {
				$subscribe.removeClass("is-open");
				$subscribe.find(".cart-drawer__subscribe-body").slideUp(300);
			}
		});
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

			// Clone both carousels so slidesToShow:6 has enough for infinite
			var $gItems = $gallery.children(".item");
			var $tItems = $thumbs.children(".item");
			$gItems.clone().appendTo($gallery);
			$gItems.clone().appendTo($gallery);
			$tItems.clone().appendTo($thumbs);
			$tItems.clone().appendTo($thumbs);

			// Main gallery
			$gallery.slick({
				infinite: true,
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
				fade: true,
				asNavFor: ".block-pdp-console__thumbs .carousel"
			});

			// Thumbs nav
			$thumbs.slick({
				infinite: true,
				slidesToShow: 6,
				slidesToScroll: 1,
				asNavFor: ".block-pdp-console__gallery .carousel",
				dots: false,
				focusOnSelect: true,
				prevArrow: $(".block-pdp-console__thumbs .slick-arrow-prev"),
				nextArrow: $(".block-pdp-console__thumbs .slick-arrow-next")
			});

			// Click main image → open lightbox
			var realSlideCount = $gItems.length;
			$gallery.on("click", ".slick-slide", function() {
				var idx = $(this).data("slick-index") % realSlideCount;
				if (idx < 0) idx += realSlideCount;
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

			// Build slides from gallery images (dedupe JS-cloned items)
			var html = "";
			var seen = {};
			$gallery.find(".slick-slide:not(.slick-cloned) img").each(function() {
				var src = $(this).attr("src");
				if (seen[src]) return;
				seen[src] = true;
				html += '<div class="item"><img src="' + src + '" alt="' + ($(this).attr("alt") || "") + '" /></div>';
			});
			$lightboxCarousel.html(html);

			var total = $lightboxCarousel.find(".item").length;

			// Show lightbox first so slick can calculate dimensions
			$lightbox.addClass("is-open");

			setTimeout(function() {
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
			}, 50);

			// Lock scroll
			PageScroll.lock();
			$(document).on("mousewheel.pdplb DOMMouseScroll.pdplb touchmove.pdplb", function(e) {
				e.preventDefault();
			});
		}

		function closeLightbox() {
			$lightbox = $("#pdp-lightbox");
			$lightbox.removeClass("is-open");
			PageScroll.unlock();
			$(document).off("mousewheel.pdplb DOMMouseScroll.pdplb touchmove.pdplb");
		}

		function init() {
			var $section = $(".block-pdp-console");
			if (!$section.length) return;

			initGallery();

			// Lightbox close
			$(document).on("click", ".pdp-lightbox .lightbox__close", closeLightbox);
			$(document).on("click", ".pdp-lightbox", function(e) {
				if ($(e.target).closest(".lightbox__box").length === 0) closeLightbox();
			});
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

			// Open first accordion item on init (no animation)
			var $firstItem = $section.find(".block-pdp-console__accordion-item").first();
			$firstItem.addClass("block-pdp-console__accordion-item--open");
			$firstItem.find(".block-pdp-console__accordion-body").show();
			$firstItem.find(".block-pdp-console__accordion-trigger").attr("aria-expanded", "true");

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
			var $toggle = $select.find(".sticky-cta__select-toggle");
			var $menu = $select.find(".sticky-cta__select-menu");
			var $mask = $("#nav-mask");

			// Scroll visibility
			$(window).on("scroll", onScroll);
			onScroll();

			// Toggle dropdown
			$toggle.on("click", function() {
				var opening = !$select.hasClass("is-open");
				$select.toggleClass("is-open");
				if (opening) {
					$mask.addClass("is-open");
					$("body").addClass("no-scroll");
				} else {
					releaseMask();
					$("body").removeClass("no-scroll");
				}
			});

			// Select option
			$menu.on("click", ".sticky-cta__select-option", function() {
				var $opt = $(this);
				$menu.find(".sticky-cta__select-option").removeClass("is-selected");
				$opt.addClass("is-selected");
				$select.find(".sticky-cta__select-label").text($opt.data("label"));
				$select.find(".sticky-cta__select-sub").text($opt.data("sub"));
				$sticky.find(".sticky-cta__price").text("$" + $opt.data("price"));
				$select.removeClass("is-open");
				releaseMask();
				$("body").removeClass("no-scroll");
			});

			// Close on mask / outside click
			$(document).on("click", function(e) {
				if (!$select.hasClass("is-open")) return;
				if ($(e.target).closest(".sticky-cta__select").length) return;
				$select.removeClass("is-open");
				releaseMask();
				$("body").removeClass("no-scroll");
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
				$carousel.addClass('carousel--ready');
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
				$nav.addClass('carousel--ready');
				$main.addClass('carousel--ready');
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
					$carousel.addClass('carousel--ready');
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
					fade: true,
					autoplay: true,
					autoplaySpeed: 3000
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
					autoplay: false,
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

			simple({
				selector: '.cart-drawer__upsell',
				dots: '.cart-drawer__upsell-dots',
				options: {
					autoplay: false,
					slidesToShow: 1
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
						draggable: false,
						responsive: [
							{
								breakpoint: 768,
								settings: {
									infinite: true,
									draggable: true
								}
							}
						]
					}
				},
				main: {
					selector: '.block-timeline__content .carousel',
					options: {
						speed: 600,
						infinite: false,
						responsive: [
							{
								breakpoint: 768,
								settings: {
									infinite: true
								}
							}
						]
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
	// PDP Rating Scroll
	// ============================================
	var PdpRatingScroll = (function() {
		function init() {
			var $rating = $(".block-pdp-console__rating");
			if (!$rating.length) return;

			$rating.on("click", function() {
				var $target = $("#judgeme_product_reviews");
				if (!$target.length) return;

				var headerHeight = parseFloat(getComputedStyle($(".nav-menu")[0]).getPropertyValue('--nav-menu-top')) || 0;
				$("html, body").animate({
					scrollTop: $target.offset().top - headerHeight
				}, 600);
			});
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
		PageHeaderShowMore.init();
		ToggleSwitch.init();
		Dropdown.init();
		NavMenu.init();
		HeaderDropdown.init();

		CarouselFactory.initAll();

		CopyLink.init();
		ExpertsTabs.init();
		PdpConsole.init();
		PdpRatingScroll.init();
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