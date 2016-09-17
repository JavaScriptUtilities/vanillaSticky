/*
 * Plugin Name: Vanilla-JS Sticky
 * Version: 0.3.1
 * Plugin URL: https://github.com/Darklg/JavaScriptUtilities
 * JavaScriptUtilities Vanilla-JS may be freely distributed under the MIT license.
 */

/*
 * new vanilla_sticky_launch(document.querySelectorAll('.sticky-element'));
 */

/* ----------------------------------------------------------
  Launch multiple elements
---------------------------------------------------------- */

function vanilla_sticky_launch(elements, opts) {
    'use strict';

    opts = opts || {};

    vanilla_sticky_cssrules(opts);

    /* Call sticky for each element */
    for (var i = 0, len = elements.length; i < len; i++) {
        new vanilla_sticky(elements[i], opts);
    }
}

function vanilla_sticky_cssrules(opts) {
    'use strict';

    opts = opts || {};

    /* Inject styles */
    var cssRules,
        nodeCSS = document.createElement('style');

    cssRules = '[data-sticky-top="1"] {position: fixed!important;top: 0!important;bottom: auto!important;}';
    cssRules += '[data-sticky-bottom="1"] {position: absolute!important;top: auto!important;bottom: 0!important;}';

    nodeCSS.innerHTML = cssRules;
    document.body.appendChild(nodeCSS);
}

function vanilla_sticky(el, opts) {
    /*jshint validthis: true */

    'use strict';

    opts = opts || {};

    var elReference = opts.elReference || el.parentNode,
        useParentTop = opts.useParentTop || false,
        zIndexParent = opts.zIndexParent || 2,
        self = this,
        elParentTop,
        elPosition,
        elParentPosition,
        elReferencePosition,
        elStatus = -1;

    function init() {
        /* Prevent double launch */
        if (el.getAttribute('vanilla-sticky') == '1') {
            update_positions();
            set_sticky_element();
            return;
        }
        el.setAttribute('vanilla-sticky', '1');

        /* Setup */
        self.set_elements();
        self.set_events();
    }

    self.set_elements = function() {
        el.style.position = 'absolute';
        el.style.top = 0;
        elReference.style.position = 'relative';
        elReference.style.zIndex = zIndexParent;
        if (useParentTop && el.parentNode != elReference) {
            el.parentNode.style.position = 'relative';
            el.parentNode.style.zIndex = zIndexParent;
        }
    };

    self.set_events = function() {
        /* Initial check */
        update_positions();
        set_sticky_element();

        /* When scrolling, set sticky status */
        window.addEventListener('scroll', set_sticky_element, 1);

        /* When page is loaded, update positions */
        window.addEventListener('load', update_and_sticky, 1);

        /* When resizing, update positions */
        window.addEventListener('resize', deb__update_and_sticky, 1);
    };

    self.unset_events = function() {
        window.removeEventListener('scroll', set_sticky_element);
        window.removeEventListener('load', update_and_sticky);
        window.removeEventListener('resize', deb__update_and_sticky);
    };

    function update_and_sticky() {
        update_positions();
        set_sticky_element();
    }

    var deb__update_and_sticky = debounce(update_and_sticky, 250);

    /* Update element positions */
    function update_positions() {
        elPosition = getElementOffset(el);
        elReferencePosition = getElementOffset(elReference);
        elParentTop = elReferencePosition.top;
        if (useParentTop && el.parentNode != elReference) {
            elParentPosition = getElementOffset(el.parentNode);
            elParentTop = elParentPosition.top;
        }
    }

    /* Set sticky status on element */
    function set_sticky_element() {
        var offsetTop = getBodyScrollTop();

        /* Scroll level */
        var startScroll = elParentTop,
            endScroll = elReferencePosition.bottom - elPosition.height;

        /* Scroll status */
        var scrollBeforeElement = (offsetTop < startScroll),
            scrollOverElement = (offsetTop >= startScroll && offsetTop < endScroll),
            scrollAfterElement = (offsetTop >= endScroll);

        /* scroll before top of the element or parent smaller than container : no sticky */
        if ((scrollBeforeElement && elStatus !== 0) || (elReferencePosition.height < elPosition.height)) {
            el.setAttribute('data-sticky-top', 0);
            el.setAttribute('data-sticky-bottom', 0);
            elStatus = 0;
            return;
        }

        /* scroll over element : sticky top */
        if (scrollOverElement && elStatus !== 1) {
            el.setAttribute('data-sticky-top', 1);
            el.setAttribute('data-sticky-bottom', 0);
            elStatus = 1;
            return;
        }

        /* scroll after bottom of the parent : sticky bottom */
        if (scrollAfterElement && elStatus !== 2) {
            el.setAttribute('data-sticky-top', 0);
            el.setAttribute('data-sticky-bottom', 1);
            elStatus = 2;
            return;
        }

    }

    /* ----------------------------------------------------------
      Utils
    ---------------------------------------------------------- */

    /* Debounce */
    /* https://davidwalsh.name/javascript-debounce-function */
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /* Position */

    function getBodyScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function getBodyScrollLeft() {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    }

    /* Element Offset */
    function getElementOffset(item) {

        var clientRect = item.getBoundingClientRect(),
            top = clientRect.top + getBodyScrollTop(),
            left = clientRect.left + getBodyScrollLeft(),
            right = clientRect.width + left,
            bottom = clientRect.height + top,
            width = right - left,
            height = bottom - top;

        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            width: width,
            height: height
        };
    }

    init();
}
