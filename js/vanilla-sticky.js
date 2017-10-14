/*
 * Plugin Name: Vanilla-JS Sticky
 * Version: 0.5.0
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

    /* Call sticky for each element */
    for (var i = 0, len = elements.length; i < len; i++) {
        new vanilla_sticky(elements[i], opts);
    }
}

function vanilla_sticky(el, opts) {
    /*jshint validthis: true */

    'use strict';

    opts = opts || {};

    /* Options */
    var useParentTop = opts.useParentTop || false,
        tryNativeSticky = opts.tryNativeSticky || false,
        zIndexParent = opts.zIndexParent || 2,
        elOffsetTop = opts.elOffsetTop || 0;

    /* Attribute names */
    var bodyAttribute = 'data-has-vanilla-sticky',
        attributeMain = 'data-vanilla-sticky',
        attributeTop = 'data-sticky-top',
        attributeBottom = 'data-sticky-bottom';

    /* References */
    var self = this,
        elReference = opts.elReference || el.parentNode,
        elParentTop,
        elPosition,
        elParentPosition,
        elReferencePosition,
        elStatus = -1;

    /* Global vars to help compression */
    var $body = document.body,
        $window = window,
        propertyPosition = 'position';

    function init() {

        /* Try to use sticky */
        if (tryNativeSticky && positionStickySupported()) {
            el.style[propertyPosition] = 'sticky';
            el.style.top = 0;
            return;
        }

        set_cssrules();

        /* Prevent double launch */
        if (el.getAttribute(attributeMain) == '1') {
            update_positions();
            set_sticky_element();
            return;
        }
        el.setAttribute(attributeMain, '1');

        /* Setup */
        self.set_elements();
        self.set_events();
    }

    function set_cssrules(opts) {

        /* One launch per page */
        if ($body.getAttribute(bodyAttribute) == '1') {
            return;
        }
        $body.setAttribute(bodyAttribute, 1);

        /* Inject styles */
        var cssRules,
            nodeCSS = document.createElement('style');

        cssRules = '[' + attributeMain + '="1"]{' + propertyPosition + ':absolute;top:0;}';
        cssRules += '[' + attributeTop + '="1"]{' + propertyPosition + ':fixed;bottom:auto;}';
        cssRules += '[' + attributeBottom + '="1"]{' + propertyPosition + ':absolute;bottom:0;}';

        nodeCSS.innerHTML = cssRules;
        $body.appendChild(nodeCSS);
    }

    self.set_elements = function() {
        /* Parent element should be relative if needed */
        if (useParentTop && el.parentNode != elReference) {
            el.parentNode.style[propertyPosition] = 'relative';
            el.parentNode.style.zIndex = zIndexParent;
        }
        else {
            /* Reference element should be relative */
            elReference.style[propertyPosition] = 'relative';
            elReference.style.zIndex = zIndexParent;
        }
    };

    self.set_events = function() {
        /* Initial check */
        update_positions();
        set_sticky_element();

        /* When scrolling, set sticky status */
        $window.addEventListener('scroll', set_sticky_element, 1);

        /* When page is loaded, update positions */
        $window.addEventListener('load', update_and_sticky, 1);

        /* When resizing, update positions */
        $window.addEventListener('resize', deb__update_and_sticky, 1);
    };

    self.unset_events = function() {
        $window.removeEventListener('scroll', set_sticky_element);
        $window.removeEventListener('load', update_and_sticky);
        $window.removeEventListener('resize', deb__update_and_sticky);
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
        var offsetTop = getBodyScrollTop() + elOffsetTop;

        /* Scroll level */
        var startScroll = elParentTop,
            endScroll = elReferencePosition.bottom - elPosition.height;

        /* Scroll status */
        var scrollBeforeElement = (offsetTop < startScroll),
            scrollOverElement = (offsetTop >= startScroll && offsetTop < endScroll),
            scrollAfterElement = (offsetTop >= endScroll);

        /* scroll before top of the element or parent smaller than container : no sticky */
        if ((scrollBeforeElement && elStatus !== 0) || (elReferencePosition.height < elPosition.height)) {
            el.setAttribute(attributeTop, 0);
            el.setAttribute(attributeBottom, 0);
            el.style.top = 0;
            elStatus = 0;
            return;
        }

        /* scroll over element : sticky top */
        if (scrollOverElement && elStatus !== 1) {
            el.setAttribute(attributeTop, 1);
            el.setAttribute(attributeBottom, 0);
            el.style.top = elOffsetTop + 'px';
            elStatus = 1;
            return;
        }

        /* scroll after bottom of the parent : sticky bottom */
        if (scrollAfterElement && elStatus !== 2) {
            el.setAttribute(attributeTop, 0);
            el.setAttribute(attributeBottom, 1);
            el.style.top = "auto";
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
        return $window.pageYOffset || document.documentElement.scrollTop || $body.scrollTop || 0;
    }

    function getBodyScrollLeft() {
        return $window.pageXOffset || document.documentElement.scrollLeft || $body.scrollLeft || 0;
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

    /* Support */
    /* http://trialstravails.blogspot.fr/2016/06/detecting-css-position-sticky-support.html */
    function positionStickySupported() {
        var el = document.createElement('a'),
            mStyle = el.style;
        mStyle.cssText = propertyPosition + ":sticky;" + propertyPosition + ":-webkit-sticky;" + propertyPosition + ":-ms-sticky;";
        return mStyle[propertyPosition].indexOf('sticky') !== -1;
    }

    /* Init */

    init();
}
