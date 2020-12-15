// Common js
import appState from '../util/appState';
import { gsap } from "gsap";

// Shared vars
let $window = $(window),
    $body = $('body'),
    scrollTop,
    ticking = false,
    lastScrollTop = 0,
    scrollDelta = 0,
    upScroll = false,
    downScroll = false,
    activeIndex = 0,
    inScrollingSection = false,
    scrollingSectionHeight,
    $document = $(document),
    transitionElements = [],
    resizeTimer,
    wordCount,
    scrollingSection,
    scrollingText;

const common = {
  // JavaScript to be fired on all pages
  init() {
    // Transition elements to enable/disable on resize
    transitionElements = [];

    // Sticky NOtes
    let expandableStickyNotes = document.querySelectorAll('.sticky-note.expandable');

    expandableStickyNotes.forEach(function(stickyNote) {
      let expandButton = stickyNote.querySelector('.expand-sticky');
      expandButton.addEventListener('click', function() {
        stickyNote.classList.toggle('-expanded');
      });
    });

    // Scrolling Functionality
    scrollingSection = document.getElementById('scrolling-section');
    const scrollingLeft = scrollingSection.querySelector('.left');
    const scrollingRight = scrollingSection.querySelector('.right');
    scrollingText = scrollingSection.querySelectorAll('ul');
    scrollingSectionHeight = scrollingText[0].offsetHeight;

    const items = scrollingSection.querySelectorAll('li');
    // recalc these on resize!
    let halfway = window.innerHeight / 2;
    let itemHalfHeight = items[0].offsetHeight / 2;

    wordCount = scrollingSection.querySelectorAll('li').length / 2;

    var lastScrollY = 0;
    var ticking = false;

    var update = function() {
      // remove active class
      $('#scrolling-section li.-active').removeClass('-active');

      // Update scrolling position of right-hand side
      $("#scrolling-section .right").css({
        "transform": "translate3d(0, " + $('#scrolling-section .left').scrollTop() + "px, 0)"
      });

      // Adjust the font-settings for each item based on distance from center
      items.forEach(function(item) {
        let rect = item.getBoundingClientRect();
        let win = item.ownerDocument.defaultView
        let offset = Math.abs(Math.floor(rect.top + win.pageYOffset - halfway + itemHalfHeight));

        if (offset < halfway + itemHalfHeight) {
          let fontWidth = offset + 320;
          item.style.fontVariationSettings = '"wdth" ' + fontWidth;
          item.style.fontWeight = offset + 475;
        }
      });
      ticking = false;
    };

    var requestTick = function() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    var onScroll = function() {
      lastScrollY = scrollingLeft.scrollY;
      requestTick();
    };

    // Add Active Classes
    scrollingLeft.addEventListener('scroll', onScroll);

    // Setup isScrolling variable
    let isScrolling;

    // Updating active classes after scrolling stops
    scrollingLeft.addEventListener('scroll', function ( event ) {

      window.clearTimeout( isScrolling );

      // Set a timeout to run after scrolling ends
      isScrolling = setTimeout(function() {
        // Run the callback
        common.updateScrolling();
      }, 250);
    }, false);

    // Init Functions
    _initIntroScreen();

    function _initIntroScreen() {
      const introSection = document.getElementById('intro-section');
      const enterButton = document.getElementById('enter');

      enterButton.addEventListener('click', enterSite);

      function enterSite() {
        // Temporary
        inScrollingSection = true;
        introSection.classList.add('hidden');
      }
    }

    // Disabling transitions on certain elements on resize
    function _disableTransitions() {
      $.each(transitionElements, function() {
        $(this).css('transition', 'none');
      });
    }

    function _enableTransitions() {
      $.each(transitionElements, function() {
        $(this).attr('style', '');
      });
    }

    function _resize() {
      // Disable transitions when resizing
      _disableTransitions();

      // Functions to run on resize end
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Re-enable transitions
        _enableTransitions();
      }, 250);
    }
    $(window).resize(_resize);

  },

  toggleListener(listener, add) {
    if (add) {
      scrollingSection.addEventListener('wheel', listener);
    } else {
      scrollingSection.removeEventListener('wheel', listener);
    }
  },

  updateScrolling() {
    let sectionH = $('#scrolling-section .left li').first().outerHeight();
    let activeIndex = Math.floor($("#scrolling-section .left").scrollTop() / sectionH);

    scrollingText.forEach(function(element) {
      let newItem = element.querySelector('[data-index="' + activeIndex + '"]');
      newItem.classList.add('-active');

      if (newItem.hasAttribute('data-color')) {
        let color = newItem.getAttribute('data-color');
        let background = newItem.getAttribute('data-background');

        scrollingSection.setAttribute('data-color', color);
        scrollingSection.setAttribute('data-background', background);
      }
    });
  },

  // Todo: eyes track mouse
  // https://codepen.io/laviperchik/pen/mjVpGN
  eyesTrackingMouse() {
    var root = document.documentElement;

    document.addEventListener('mousemove', evt => {
      let x = evt.clientX / innerWidth;
      let y = evt.clientY / innerHeight;

      root.style.setProperty('--mouse-x', x);
      root.style.setProperty('--mouse-y', y);
    });
  },

  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },
};

export default common;
