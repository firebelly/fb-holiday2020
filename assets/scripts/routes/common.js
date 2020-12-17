// Common js
import appState from '../util/appState';

// Shared vars
let $window = $(window),
    $document = $(document),
    $body = $('body'),
    body = document.querySelector('body'),
    ticking = false,
    canVote = false,
    isScrolling,
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
    common.partyPoppers();
    common.customCursor();

    // Get URL Params
    function getUrlParameter(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? false : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // Check if visitor can vote
    canVote = getUrlParameter('p');
    if (canVote !== false) {
      body.classList.add('can-vote');
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
      body.classList.add('entered');
      inScrollingSection = true;
      introSection.classList.add('hidden');
      setTimeout(function() {
        introSection.remove();
      }, 1100);
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

  partyPoppers() {
    // Party Poppers
    const min = 3;
    const max = 6;
    let partyPoppers = document.querySelectorAll('.party-popper');
    partyPoppers.forEach(function(partyPopper) {
      let icons = [];
      let iconData = partyPopper.querySelectorAll('[data-icon]');

      iconData.forEach(function(icon, index) {
        let count = Math.floor(Math.random() * max) + min;
        icons.push(icon.getAttribute('data-icon'));

        for (var i = count - 1; i >= 0; i--) {
          partyPopper.innerHTML += '<svg class="icon icon-' + icons[index] + '" aria-hidden="true" role="presentation"><use xlink:href="#icon-' + icons[index] + '"/></svg>';
        }
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
      updateActiveItems();

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

      // window.clearTimeout( isScrolling );
      // // Set a timeout to run after scrolling ends
      // isScrolling = setTimeout(function() {
      // }, 66);
      ticking = false;
    };
    update();

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

    // Navigation
    scrollingSection.addEventListener('click', function(event) {
      if (event.clientY < halfway && activeIndex !== 0) {
        scrollingLeft.scrollTop -= itemH;
      } else if (event.clientY > halfway && activeIndex !== wordCount - 1) {
        scrollingLeft.scrollTop += itemH;
      }
    });

    // Add active class after scrolling stops
    function updateActiveItems() {
      activeIndex = Math.floor(scrollingLeft.scrollTop / itemH);

      // remove active class
      let oldItems = scrollingSection.querySelectorAll('li.-active');
      if (oldItems.length) {
        oldItems.forEach(function(item) {
          item.classList.remove('-active');
        });
      }

      scrollingLists.forEach(function(element) {
        let newItem = element.querySelector('[data-index="' + activeIndex + '"]');
        newItem.classList.add('-active');
      });
    }
  },

  // Update sizing vars for scrolling functionality
  setScrollingSizes() {
    itemH = scrollingLeft.querySelector('li').offsetHeight;
    itemHalfHeight = itemH / 2;
    halfway = window.innerHeight / 2;
  },

  customCursor() {
    let follower, init, mouseX, mouseY, positionElement, timer;
    follower = document.getElementById('follower');

    mouseX = event => {
      return event.clientX;
    };

    mouseY = event => {
      return event.clientY;
    };

    positionElement = event => {
      var mouse;
      mouse = {
        x: mouseX(event),
        y: mouseY(event) };

      if (mouse.y > halfway) {
        follower.classList.add('reverse');
      } else {
        follower.classList.remove('reverse');
      }

      follower.style.top = mouse.y + 'px';
      return follower.style.left = mouse.x + 'px';
    };

    timer = false;

    window.onmousemove = init = event => {
      var _event;
      _event = event;
      return timer = setTimeout(() => {
        return positionElement(_event);
      }, 1);
    };
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
