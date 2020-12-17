// Common js
import appState from '../util/appState';

// Shared vars
let $window = $(window),
    $document = $(document),
    $body = $('body'),
    body = document.querySelector('body'),
    isTouchDevice,
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

    // Is it a touch device?
    isTouchDevice = common.isTouchDevice();
    $body.toggleClass('touch-device', isTouchDevice);

    // Init Functions
    common.stickyNotes();
    common.scrollingText();
    common.introScreen();
    common.partyPoppers();
    common.voting();
    common.customCursor();

    // Check if visitor can vote
    canVote = common.getUrlParameter('c');
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
    const cursor = document.getElementById('cursor');

    enterButton.addEventListener('click', enterSite);

    function enterSite() {
      cursor.innerHTML = '';
      cursor.classList.remove('button-cursor');
      cursor.classList.add('-hide');

      body.classList.add('entered');
      inScrollingSection = true;
      introSection.classList.add('hidden');
      setTimeout(function() {
        cursor.innerHTML = '<svg class="hand-cursor" aria-hidden="true" role="presentation"><use xlink:href="#hand-cursor"/></svg><svg class="arrow-cursor" aria-hidden="true" role="presentation"><use xlink:href="#icon-arrow"/></svg>';
        cursor.classList.remove('-hide');
        introSection.remove();
      }, 1000);
    }
  },

  stickyNotes() {
    // Sticky NOtes
    const expandableStickyNotes = document.querySelectorAll('.sticky-note.expandable');

    expandableStickyNotes.forEach(function(stickyNote) {
      stickyNote.addEventListener('click', function() {
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

  voting() {
    const votingActivate = document.querySelector('.activate-vote');
    const votingSection = document.getElementById('voting-section');
    const userName = document.getElementById('user-name');
    let name = common.getUrlParameter('n');

    if (name !== false) {
      name = atob(name);
      userName.innerHTML = ' ' + name + ',';
    }

    votingActivate.addEventListener('click', function() {
      votingSection.style.display = 'block';
      body.classList.add('show-voting-section');
      body.classList.remove('entered');
    });

    document.addEventListener('submit', function (event) {
      event.preventDefault();
      showThankYou();
      // fetch('vote.php', {
      //   method: 'POST',
      //   body: new FormData(event.target),
      // }).then(function (response) {
      //   if (response.ok) {
      //     return response.json();
      //   }
      //   return Promise.reject(response);
      // }).then(function (data) {
      //   if (data.success) {
      //     // everything went great!
      //     showThankYou();
      //     alert(`${data.message} Thanks, ${data.name}!`);
      //   } else {
      //     // oh no!
      //     alert(`Oops! ${data.message}`);
      //   }
      // }).catch(function (error) {
      //   console.log(error);
      // });
    });

    function showThankYou() {
      votingSection.classList.add('show-thank-you');
      votingSection.scrollTop = 0;
    }
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
          let fontWeight = (offset * 0.8) + 475;
          if (fontWeight > 800) {
            fontWeight = 800;
          }
          item.style.fontVariationSettings = '"wdth" ' + fontWidth;
          item.style.fontWeight = fontWeight;
        }
      });
    }

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
      ticking = false;
    };

    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    function onScroll() {
      requestTick();
    };

    // Run the stuff on scroll!
    scrollingLeft.addEventListener('scroll', onScroll);
    // Trigger a scroll to ensure initial alignment
    scrollingLeft.scrollTo(0, 50);

    // Navigation
    scrollingSection.addEventListener('click', function(event) {
      // return if clicking on sticky note
      let $target = $(event.target);
      if ($target.is('.sticky-not') || $target.parents('.sticky-note').length) {
        return;
      }
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
      let oldIndex = oldItems[0].getAttribute('data-index');

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

  isTouchDevice() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function(query) {
        return window.matchMedia(query).matches;
    }

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
  },

  // Get URL Params
  getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? false : decodeURIComponent(results[1].replace(/\+/g, ' '));
  },

  customCursor() {
    let cursor, init, mouseX, mouseY, positionElement, setMouseDown, setMouseUp, timer;
    cursor = document.getElementById('cursor');

    if (isTouchDevice) {
      return;
    }

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

      let hoveredEl = document.elementFromPoint(mouse.x, mouse.y),
          $hoveredEl = $(hoveredEl);

      if ($hoveredEl.is('.js-button-cursor') || $hoveredEl.parents('.js-button-cursor').length) {
        if (!cursor.matches('.button-cursor')) {
          cursor.classList.add('button-cursor');
          cursor.innerHTML = '<svg class="eyes-gleaming" aria-hidden="true" role="presentation"><use xlink:href="#icon-eyes-gleaming"/></svg><svg class="eyes-open" aria-hidden="true" role="presentation"><use xlink:href="#icon-eyes-open"/></svg>';
        }
      } else {
        cursor.classList.remove('button-cursor');
        cursor.innerHTML = '<svg class="hand-cursor" aria-hidden="true" role="presentation"><use xlink:href="#hand-cursor"/></svg><svg class="arrow-cursor" aria-hidden="true" role="presentation"><use xlink:href="#icon-arrow"/></svg>';
      }

      if (mouse.y < halfway) {
        cursor.classList.add('reverse');
      } else {
        cursor.classList.remove('reverse');
      }

      cursor.style.top = mouse.y + 'px';
      return cursor.style.left = mouse.x + 'px';
    };

    setMouseDown = event => {
      body.classList.add('-mousedown');
    };

    setMouseUp = event => {
      body.classList.remove('-mousedown');
    }

    timer = false;

    window.onmousemove = init = event => {
      var _event;
      _event = event;
      return timer = setTimeout(() => {
        return positionElement(_event);
      }, 1);
    };

    window.onmousedown = init = event => {
      var _event;
      _event = event;
      return timer = setTimeout(() => {
        return setMouseDown(_event);
      }, 1);
    };

    window.onmouseup = init = event => {
      var _event;
      _event = event;
      return timer = setTimeout(() => {
        return setMouseUp(_event);
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
