// Common js
import appState from '../util/appState';
import { gsap } from "gsap";

// Shared vars
let $window = $(window),
    $document = $(document),
    $body = $('body'),
    body = document.querySelector('body'),
    ticking = false,
    activeIndex = 0,
    wordCount,
    itemH,
    itemHalfHeight,
    halfway,
    scrollingSection,
    scrollingLeft,
    scrollingLeftPos,
    scrollingRight,
    scrollingLists,
    inScrollingSection = false,
    transitionElements = [],
    resizeTimer;

const common = {
  // JavaScript to be fired on all pages
  init() {
    // Transition elements to enable/disable on resize
    transitionElements = [];

    // Init Functions
    common.stickyNotes();
    common.scrollingText();
    common.introScreen();

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
      common.setScrollingSizes();

      // Functions to run on resize end
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Re-enable transitions
        _enableTransitions();
      }, 250);
    }
    $(window).resize(_resize);
  },

  introScreen() {
    const introSection = document.getElementById('intro-section');
    const enterButton = document.getElementById('enter');

    enterButton.addEventListener('click', enterSite);

    function enterSite() {
      // Temporary
      inScrollingSection = true;
      introSection.classList.add('hidden');
    }
  },

  stickyNotes() {
    // Sticky NOtes
    const expandableStickyNotes = document.querySelectorAll('.sticky-note.expandable');

    expandableStickyNotes.forEach(function(stickyNote) {
      let expandButton = stickyNote.querySelector('.expand-sticky');
      expandButton.addEventListener('click', function() {
        stickyNote.classList.toggle('-expanded');
      });
    });
  },

  // Scrolling Functionality
  scrollingText() {
    // Set some vars
    scrollingSection = document.getElementById('scrolling-section');
    scrollingLeft = scrollingSection.querySelector('.left');
    scrollingRight = scrollingSection.querySelector('.right');
    scrollingLists = scrollingSection.querySelectorAll('ul');
    wordCount = scrollingSection.querySelectorAll('li').length / 2;
    const items = scrollingSection.querySelectorAll('li');

    // Cache used sizes
    common.setScrollingSizes();

    // Adjust the font-settings for each item based on distance from center
    function updateFontParams() {
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
    }
    updateFontParams();

    function update() {
      activeIndex = Math.floor(scrollingLeft.scrollTop / itemH);
      scrollingLeftPos = scrollingLeft.scrollTop;

      // Update scrolling position of right-hand side
      scrollingRight.style.transform = "translate3d(0, " + scrollingLeftPos + "px, 0)";

      // Change Background and text colors
      let activeItem = scrollingSection.querySelector('[data-index="' + activeIndex + '"]');
      if (activeItem.hasAttribute('data-color')) {
        let newColor = activeItem.getAttribute('data-color');
        let oldColor = body.getAttribute('data-color');
        let newBackground = activeItem.getAttribute('data-background');
        let oldBackground = body.getAttribute('data-background');

        // Skip if it's the same as current colors
        if (newColor !== oldColor && newBackground !== oldBackground) {
          scrollingSection.setAttribute('data-color', newColor);
          scrollingSection.setAttribute('data-background', newBackground);
        }

      }

      updateFontParams();
      ticking = false;
    };

    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    function onScroll() {
      if (!inScrollingSection) {
        return;
      }
      requestTick();
    };

    // Run the stuff on scroll!
    scrollingLeft.addEventListener('scroll', onScroll);

    // Add active class after scrolling stops
    function updateActiveItems() {
      // remove active class
      let oldItems = scrollingSection.querySelectorAll('li.-active');
      if (oldItems) {
        oldItems.forEach(function(item) {
          item.classList.remove('-active');
        });
      }

      scrollingLists.forEach(function(element) {
        let newItem = element.querySelector('[data-index="' + activeIndex + '"]');
        newItem.classList.add('-active');
      });
    }
    // Setup isScrolling variable
    let isScrolling;

    scrollingLeft.addEventListener('scroll', function ( event ) {
      window.clearTimeout( isScrolling );
      // Set a timeout to run after scrolling ends
      isScrolling = setTimeout(function() {
        updateActiveItems();
      }, 150);
    }, false);
  },

  // Update sizing vars for scrolling functionality
  setScrollingSizes() {
    itemH = scrollingLeft.querySelector('li').offsetHeight;
    itemHalfHeight = itemH / 2;
    halfway = window.innerHeight / 2;
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
