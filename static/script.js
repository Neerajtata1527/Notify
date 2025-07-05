// ===== SELECTORS =====
const builder = document.querySelector('.form-builder');
let lastTouchMove = 0;

// ===== ELEMENT TEMPLATE CACHE =====
const elementTemplates = {
  'big-heading': () => {
    const el = document.createElement('h1');
    el.textContent = 'Big Heading';
    el.style.color = 'black';
    el.contentEditable = 'true';
    el.setAttribute("spellcheck", "false");
    return el;
  },
  'small-heading': () => {
    const el = document.createElement('h3');
    el.textContent = 'Small Heading';
    el.style.color = 'black';
    el.contentEditable = 'true';
    el.setAttribute("spellcheck", "false");
    return el;
  },
  'paragraph': () => {
    const el = document.createElement('p');
    el.textContent = 'This is a paragraph of text.';
    el.style.color = 'black';
    el.contentEditable = 'true';
    el.setAttribute("spellcheck", "false");
    return el;
  },
  'text-input': () => {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = 'Text Input: ';
    label.style.color = 'black';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter text';
    input.style.color = 'black';
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  },
  'text-area': () => {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = 'Text Area: ';
    label.style.color = 'black';
    const textarea = document.createElement('textarea');
    textarea.rows = 4;
    textarea.cols = 30;
    textarea.placeholder = 'Enter details';
    textarea.style.color = 'black';
    wrapper.appendChild(label);
    wrapper.appendChild(textarea);
    return wrapper;
  },
  'select-option': () => {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = 'Choose Option: ';
    label.style.color = 'black';
    label.contentEditable = 'true';
    const select = document.createElement('select');
    ['Option 1', 'Option 2', 'Option 3'].forEach(optText => {
      const opt = document.createElement('option');
      opt.textContent = optText;
      select.appendChild(opt);
    });
    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
  },
  'radio-group': () => {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = 'Choose One: ';
    label.style.color = 'black';
    label.contentEditable = 'true';
    wrapper.appendChild(label);
    const name = `radio-${Date.now()}`;
    ['Radio 1', 'Radio 2', 'Radio 3'].forEach((txt, i) => {
      wrapper.appendChild(document.createElement('br'));
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = name;
      radio.id = `radio-${i}`;
      const radioLabel = document.createElement('label');
      radioLabel.setAttribute('for', radio.id);
      radioLabel.textContent = txt;
      radioLabel.contentEditable = 'true';
      wrapper.appendChild(radio);
      wrapper.appendChild(radioLabel);
    });
    return wrapper;
  },
  'checkbox-group': () => {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = 'Select Multiple: ';
    label.style.color = 'black';
    label.contentEditable = 'true';
    wrapper.appendChild(label);
    ['Check 1', 'Check 2', 'Check 3'].forEach((txt, i) => {
      wrapper.appendChild(document.createElement('br'));
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.id = `check-${i}`;
      const checkLabel = document.createElement('label');
      checkLabel.setAttribute('for', check.id);
      checkLabel.textContent = txt;
      checkLabel.contentEditable = 'true';
      wrapper.appendChild(check);
      wrapper.appendChild(checkLabel);
    });
    return wrapper;
  }
};

// ===== DRAG & TOUCH SUPPORT =====
document.querySelectorAll('.draggable').forEach(elem => {
  elem.addEventListener('dragstart', e => {
    e.dataTransfer.setData('type', e.target.getAttribute('data-type'));
  });

  elem.addEventListener('touchstart', e => {
    const type = elem.getAttribute('data-type');
    elem.classList.add('dragging');
    elem.setAttribute('data-dragging', type);
  });

  elem.addEventListener('touchmove', e => {
    const now = Date.now();
    if (now - lastTouchMove < 30) return;
    lastTouchMove = now;
    const touch = e.touches[0];
    elem.style.position = 'absolute';
    elem.style.zIndex = 9999;
    elem.style.left = `${touch.clientX - 40}px`;
    elem.style.top = `${touch.clientY - 20}px`;
  });

  elem.addEventListener('touchend', () => {
    elem.style.position = '';
    elem.style.zIndex = '';
    elem.style.left = '';
    elem.style.top = '';
  });
});

// ===== DESKTOP & MOBILE DROP =====
builder.addEventListener('dragover', e => e.preventDefault());
builder.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  if (type) handleElementDrop(type);
});

builder.addEventListener('touchend', e => {
  const draggingElem = document.querySelector('.draggable.dragging');
  if (draggingElem) {
    const type = draggingElem.getAttribute('data-dragging');
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    if (builder.contains(dropTarget)) {
      handleElementDrop(type);
    }
    draggingElem.classList.remove('dragging');
    draggingElem.removeAttribute('data-dragging');
  }
});

// ===== FAST DROP HANDLER =====
function handleElementDrop(type) {
  if (!elementTemplates[type]) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'form-builder-element';
  const newElement = elementTemplates[type]();
  wrapper.appendChild(newElement);
  requestAnimationFrame(() => builder.appendChild(wrapper));
}

// ===== EXPORT TO PDF =====
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
  const target = document.querySelector('.form-builder');
  const downloadBtn = document.getElementById('downloadPdfBtn');
  downloadBtn.style.display = 'none';

  const inputs = target.querySelectorAll('input[type="text"], textarea, select');
  const replacements = [];

  inputs.forEach(elem => {
    const span = document.createElement('div');
    span.textContent = elem.value || elem.placeholder || '[empty]';
    span.className = 'text-replacement';
    span.style.cssText = `
      color: black;
      border: 1px solid #ccc;
      padding: 4px;
      font-size: 14px;
      margin-top: 4px;
      font-family: Arial, sans-serif;
      white-space: pre-wrap;
      min-height: 20px;
    `;
    elem.style.display = 'none';
    elem.parentNode.insertBefore(span, elem.nextSibling);
    replacements.push({ original: elem, clone: span });
  });

  setTimeout(() => {
    html2canvas(target, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;

      let position = 0;
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        while (position < imgHeight) {
          pdf.addImage(imgData, 'PNG', 0, position * -1, imgWidth, imgHeight);
          position += pageHeight;
          if (position < imgHeight) pdf.addPage();
        }
      }

      pdf.save('final.pdf');
      replacements.forEach(({ original, clone }) => {
        original.style.display = '';
        clone.remove();
      });
      downloadBtn.style.display = 'inline-block';
    });
  }, 300);
});




