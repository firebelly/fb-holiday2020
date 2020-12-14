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

    // Scrolling Functionality
    scrollingSection = document.getElementById('scrolling-section');
    scrollingText = scrollingSection.querySelectorAll('ul');
    scrollingSectionHeight = scrollingText[0].offsetHeight;
    wordCount = scrollingSection.querySelectorAll('li').length / 2;

    common.toggleListener(common.updateScrolling, true);

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

  updateScrolling(event) {
    common.toggleListener(common.updateScrolling, false);
    // if (!event.cancelable) {
    //   common.toggleListener(common.updateScrolling, true);
    //   return;
    // }
    scrollingSectionHeight = scrollingText[0].offsetHeight;
    if (event.deltaY > 0) {
      // scrolling down
      if (activeIndex === wordCount - 1) {
        common.toggleListener(common.updateScrolling, true);
        return;
      }
      activeIndex++;
      scrollDelta -= scrollingSectionHeight / wordCount;
    } else {
      // scrolling up
      if (activeIndex === 0) {
        common.toggleListener(common.updateScrolling, true);
        return;
      }
      activeIndex--;
      scrollDelta += scrollingSectionHeight / wordCount;
    }

    // Set font styles for adjacent items
    // THIS IS SUCKING RESOURCES — MAKE IT BETTER!
    let items = scrollingSection.querySelectorAll('li');
    items.forEach(function(item) {
      let itemIndex = item.getAttribute('data-index');
      let difference = Math.abs(activeIndex - itemIndex);

      if (difference === 0) {
        gsap.to(item, {
          fontVariationSettings: "'wdth' " + 320,
          fontWeight: "475",
          duration: 0.25
        });
      } else if (difference === 1) {
        gsap.to(item, {
          fontVariationSettings: "'wdth' " + 490,
          fontWeight: "475",
          duration: 0.25
        });
      } else if (difference === 2) {
        gsap.to(item, {
          fontVariationSettings: "'wdth' " + 620,
          fontWeight: "575",
          duration: 0.25
        });
      } else if (difference === 3 ) {
        gsap.to(item, {
          fontVariationSettings: "'wdth' " + 620,
          fontWeight: "690",
          duration: 0.25
        });
      } else if (difference === 4 ) {
        gsap.to(item, {
          fontVariationSettings: "'wdth' " + 800,
          fontWeight: "800",
          duration: 0.25
        });
      } else {
        item.setAttribute('style', '');
      }
    });

    scrollingText.forEach(function(element) {
      let change = scrollDelta;
      if (element.classList.contains('right')) {
        change = change * -1;
      }

      let oldItem = element.querySelector('.-active');
      let newItem = element.querySelector('[data-index="' + activeIndex + '"]');
      oldItem.classList.remove('-active');

      if (newItem.hasAttribute('data-color')) {
        let color = newItem.getAttribute('data-color');
        let background = newItem.getAttribute('data-background');

        scrollingSection.setAttribute('data-color', color);
        scrollingSection.setAttribute('data-background', background);
      }

      gsap.to(element, {
        translateY: change,
        translateX: 0,
        translateZ: 0,
        duration: 0.25,
        onComplete: function() {
          newItem.classList.add('-active');
          common.toggleListener(common.updateScrolling, true);
        }
      });
      // element.style.transform = 'translate3d(0, ' + change + 'px, 0)';
    });

  },

  finalize() {
    // JavaScript to be fired on all pages, after page specific JS is fired
  },
};

export default common;
