/*
 * Plugin Name: Vanilla-JS Sticky
 * Version: 0.1.1
 * Plugin URL: https://github.com/Darklg/JavaScriptUtilities
 * JavaScriptUtilities Vanilla-JS may be freely distributed under the MIT license.
 */

/*
 * new vanilla_sticky_launch(document.querySelectorAll('.sticky-element'));
 */

/* ----------------------------------------------------------
  Launch multiple elements
---------------------------------------------------------- */

function vanilla_sticky_launch(elements) {
    'use strict';
    /* Inject styles */
    var cssRules = '[data-sticky-top="1"] {position: fixed!important;top: 0!important;bottom: auto!important;}' + '[data-sticky-bottom="1"] {position: absolute!important;top: auto!important;bottom: 0!important;}',
        nodeCSS = document.createElement('style');
    nodeCSS.innerHTML = cssRules;
    document.body.appendChild(nodeCSS);
    /* Call sticky for each element */
    for (var i = 0, len = elements.length; i < len; i++) {
        new vanilla_sticky(elements[i]);
    }
}

function vanilla_sticky(el) {
    'use strict';

    var elPosition,
        elParentPosition,
        elStatus = -1;

    function init() {
        /* Prevent double launch */
        if (el.getAttribute('vanilla-sticky') == '1') {
            update_positions(el);
            set_sticky_element(el);
            return;
        }
        el.setAttribute('vanilla-sticky', '1');

        set_elements();
        set_events();
    }

    function set_elements() {
        el.style.position = 'absolute';
        el.style.top = 0;
        el.parentNode.style.position = 'relative';
    }

    function set_events() {
        /* Initial check */
        update_positions(el);
        set_sticky_element(el);
        /* When scrolling, set sticky status */
        window.addEventListener('scroll', function() {
            set_sticky_element(el);
        });
        /* When page is loaded, update positions */
        window.addEventListener('load', function() {
            update_positions(el);
            set_sticky_element(el);
        });
        /* When resizing, update positions */
        window.addEventListener('resize', function() {
            update_positions(el);
            set_sticky_element(el);
        });
    }

    /* Update element positions */
    function update_positions(el) {
        elPosition = getElementOffset(el);
        elParentPosition = getElementOffset(el.parentNode);
    }

    /* Set sticky status on element */
    function set_sticky_element(el) {
        /* Scroll level */
        var startScroll = elParentPosition.top,
            endScroll = elParentPosition.bottom - elPosition.height;

        /* Scroll status */
        var scrollBeforeElement = (window.pageYOffset < startScroll),
            scrollOverElement = (window.pageYOffset >= startScroll && window.pageYOffset < endScroll),
            scrollAfterElement = (window.pageYOffset >= endScroll);

        /* scroll before top of the element : no sticky */
        if (scrollBeforeElement && elStatus !== 0) {
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

    /* Element Offset */
    function getElementOffset(el) {
        var getBodyScrollTop = function() {
            return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        };

        var getBodyScrollLeft = function() {
            return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        };

        var clientRect = el.getBoundingClientRect(),
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
