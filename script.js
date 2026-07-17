function updateClock() {
const now = new Date();
const formatted = now.toLocaleString(undefined, {
weekday: 'short',
year: 'numeric',
month: 'numeric',
day: 'numeric',
hour: 'numeric',
minute: '2-digit',
hour12: true
});
document.getElementById('clock').textContent = formatted;
}
updateClock();
setInterval(updateClock, 1000);
// Make the DIV element draggable: (dragElement function remains unchanged above)
  function dragElement(element) {
    if (!element) return;
if (element._dragInitialized) return;
element._dragInitialized = true;
var header = element.querySelector('.windowheader') || element;
if (getComputedStyle(element).position === 'static') element.style.position = 'absolute';
header.style.touchAction = 'none';
header.style.userSelect = 'none';
header.style.cursor = 'grab';
header.addEventListener('pointerdown', function (e) {
if (e.button && e.button !== 0) return;
e.preventDefault();
if (typeof topZIndex === 'number') element.style.zIndex = ++topZIndex;
var cs = getComputedStyle(element);
if (cs.transform && cs.transform !== 'none') {
var rect = element.getBoundingClientRect();
element.style.left = (rect.left + window.scrollX) + 'px';
element.style.top = (rect.top + window.scrollY) + 'px';
element.style.transform = 'none';
}
var rectNow = element.getBoundingClientRect();
var offsetX = e.clientX - rectNow.left;
var offsetY = e.clientY - rectNow.top;
header.style.cursor = 'grabbing';
try { header.setPointerCapture(e.pointerId); } catch (err) {}
function onMove(ev) {
element.style.left = (ev.clientX - offsetX + window.scrollX) + 'px';
element.style.top = (ev.clientY - offsetY + window.scrollY) + 'px';
}
function onUp(ev) {
try { header.releasePointerCapture(e.pointerId); } catch (err) {}
header.style.cursor = 'grab';
document.removeEventListener('pointermove', onMove);
document.removeEventListener('pointerup', onUp);
}
document.addEventListener('pointermove', onMove);
document.addEventListener('pointerup', onUp);
});
}
// Initialize windows and icon behavior
var topZIndex = 100;
var topBar = document.querySelector("#taskbar");

function getPlumaNotes(windowEl) {
  var notes = [];
  if (!windowEl) return notes;
  var noteEls = windowEl.querySelectorAll('.pluma-notes-data .pluma-note');
  noteEls.forEach(function(noteEl) {
    notes.push({
      title: noteEl.dataset.title || 'Nota',
      date: noteEl.dataset.date || '',
      content: noteEl.innerHTML || ''
    });
  });
  return notes;
}

function renderPlumaApp(windowEl) {
    if (!windowEl) return;
    windowEl.style.width = '760px';
    windowEl.style.height = '520px';
    windowEl.style.left = (window.innerWidth / 2 - 380 + window.scrollX) + 'px';
    windowEl.style.top = (window.innerHeight / 2 - 260 + window.scrollY) + 'px';
    var notes = getPlumaNotes(windowEl);
    if (!notes || notes.length === 0) return;
    var buttons = windowEl.querySelector('.pluma-note-buttons');
    var titleEl = windowEl.querySelector('.pluma-current-title');
    var dateEl = windowEl.querySelector('.pluma-current-date');
    var bodyEl = windowEl.querySelector('.pluma-current-body');
    if (!buttons || !titleEl || !dateEl || !bodyEl) return;

    buttons.innerHTML = '';

    function selectNote(index) {
      var note = notes[index];
      if (!note) return;
      titleEl.textContent = note.title;
      dateEl.textContent = note.date;
      bodyEl.innerHTML = note.content;
      Array.from(buttons.children).forEach(function(button, buttonIndex) {
        var active = buttonIndex === index;
        button.style.opacity = active ? '1' : '0.75';
        button.style.fontWeight = active ? '700' : '400';
      });
    }

    notes.forEach(function(note, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = note.title;
      button.style.cssText = 'width:100%; background: rgba(255,255,255,0.14); border: none; color: #ffffff; border-radius: 10px; padding: 8px 10px; text-align: left; cursor: pointer; font-size: 12px;';
      button.addEventListener('click', function() {
        selectNote(index);
      });
      buttons.appendChild(button);
    });

    selectNote(0);
  }

  function initWindow(element) {
   if (!element) return;
    // ensure it's positioned absolute so dragging works
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'absolute';
    }
    // make draggable using existing helper
    try { dragElement(element); } catch (e) { /* dragElement will throw if invalid */ }

    // wire up close button inside this window
    var closeBtn = element.querySelector('.windowclose');
    if (closeBtn && !closeBtn._hasHandler) {
      closeBtn.addEventListener('click', function(e) {
        // close without preserving: remove generated windows, hide predefined ones
        closeWindow(element);
      });
      closeBtn._hasHandler = true;
    }
  }

  function openWindow(element) {
    if (!element) return;
    element.style.display = "block";
    // bring to front
    element.style.zIndex = ++topZIndex;
    if (topBar) topBar.style.zIndex = topZIndex + 1;
  }

  var windowScreen = document.querySelector("#window");
  if (windowScreen) initWindow(windowScreen);

  function closeWindow(element) {
    if (!element) return;
    // If the window was generated dynamically, remove it from DOM (close without saving)
    if (element.dataset && element.dataset.generated === 'true') {
      element.remove();
    } else {
      element.style.display = 'none';
    }
  }

  // legacy page buttons (keep behavior for main window)
  var WindowScreenClose = document.querySelector("#windowclose");
  var WindowScreenOpen = document.querySelector("#windowopen");

  if (WindowScreenClose) {
    WindowScreenClose.addEventListener("click", function() {
      closeWindow(windowScreen);
    });
  }

  if (WindowScreenOpen) {
    WindowScreenOpen.addEventListener("click", function() {
      openWindow(windowScreen);
    });
  }

  // para que los iconos se seleccionen

  var selectedIcon = undefined;

  function selectIcon(element) {
    if (!element) return;
    element.classList.add("selected");
    selectedIcon = element;
  }

  function deselectIcon(element) {
    if (!element) return;
    element.classList.remove("selected");
    if (selectedIcon === element) selectedIcon = undefined;
  }

  // single click = select/deselect only
  function handleIconTap(element) {
    if (!element) return;
    if (element.classList.contains("selected")) {
      deselectIcon(element);
    } else {
      if (selectedIcon) deselectIcon(selectedIcon);
      selectIcon(element);
    }
  }

  // double click = open (create placeholder if needed) and ensure selection
  function handleIconDblClick(element) {
    if (!element) return;
    var targetId = element.dataset ? element.dataset.window : element.getAttribute('data-window');
    var href = element.dataset ? element.dataset.href : element.getAttribute('data-href');

    if (href && !targetId) {
      window.open(href, '_blank');
      return;
    } else if (targetId) {
      var template = document.getElementById(targetId);
      var newId = targetId + '-' + Date.now();
      var newWin = document.createElement('div');
      newWin.className = 'window';
      newWin.id = newId;
      newWin.dataset.generated = 'true';
      newWin.style.display = 'block';

      if (template) {
        newWin.innerHTML = template.innerHTML;
        if (template.style && template.style.width) newWin.style.width = template.style.width;
        if (template.style && template.style.height) newWin.style.height = template.style.height;
      } else {
        newWin.style.width = '360px';
        newWin.style.height = '260px';
        newWin.innerHTML = '<p class="windowclose" draggable="false">X</p>' +
                            '<p class="windowheader" title="Ventana arrastrable"></p>' +
                            '<h1 style="padding: 6px; margin: 8px; background-color: #d29b4893; color: #ffffff; border-radius: 4px; text-align: center;">' + (element.alt || 'App') + '</h1>' +
                            '<div style="padding: 8px; color:#ffffff;"><p>Ventana en blanco (personalízala luego).</p></div>';
      }

      var innerWithId = newWin.querySelectorAll('[id]');
      innerWithId.forEach(function(el) {
        if (!el.id) return;
        el.id = newId + '-' + el.id;
      });

      newWin.style.transform = 'none';
      var origRect = template ? template.getBoundingClientRect() : { left: window.innerWidth/2 - 180, top: window.innerHeight/2 - 130 };
      newWin.style.position = 'absolute';
      newWin.style.left = (origRect.left + 20 + window.scrollX) + 'px';
      newWin.style.top = (origRect.top + 20 + window.scrollY) + 'px';

      document.body.appendChild(newWin);
      initWindow(newWin);
      openWindow(newWin);
      if (targetId === 'pluma-template') {
        renderPlumaApp(newWin);
      }
    } else {
      if (windowScreen) openWindow(windowScreen);
    }

    // ensure the icon is selected after double-click
    if (!element.classList.contains('selected')) {
      if (selectedIcon) deselectIcon(selectedIcon);
      selectIcon(element);
    }
  }

  document.addEventListener("DOMContentLoaded", function() {
    // initialize any existing .window elements so they are draggable and have close handlers
    var windows = document.querySelectorAll('.window');
    windows.forEach(function(w) { initWindow(w); });

    // attach handlers to images and elements inside #desktopApps
    var icons = document.querySelectorAll('#desktopApps img, #desktopApps .icon');
    icons.forEach(function(icon) {
      // ensure base app-icon styling is present
      icon.classList.add('app-icon');
      // attach click and dblclick handlers (avoid duplicating)
      if (!icon._hasClick) {
      icon.addEventListener('click', function(e) {
        if (icon.dataset && icon.dataset.href) {
          window.open(icon.dataset.href, '_blank');
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        handleIconTap(icon);
        if ((icon.dataset && icon.dataset.window) || icon.getAttribute('data-window')) {
          handleIconDblClick(icon);
        }
      });
      icon.addEventListener('dblclick', function(e) {
        handleIconDblClick(icon);
      });
      icon._hasClick = true;
      }
    });
  });

 