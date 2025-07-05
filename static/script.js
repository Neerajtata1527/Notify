// ===== SELECTORS =====
const builder = document.querySelector('.form-builder');

// ===== DRAG & TOUCH SUPPORT =====
let lastTouchMove = 0;

document.querySelectorAll('.draggable').forEach(elem => {
  // Desktop drag start
  elem.addEventListener('dragstart', e => {
    e.dataTransfer.setData('type', e.target.getAttribute('data-type'));
  });

  // Mobile touch start
  elem.addEventListener('touchstart', e => {
    const type = elem.getAttribute('data-type');
    elem.classList.add('dragging');
    elem.setAttribute('data-dragging', type);
  });

  // Mobile touch move with throttling
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

  // Mobile touch end resets
  elem.addEventListener('touchend', () => {
    elem.style.position = '';
    elem.style.zIndex = '';
    elem.style.left = '';
    elem.style.top = '';
  });
});

// ===== DESKTOP DROP SUPPORT =====
builder.addEventListener('dragover', e => e.preventDefault());
builder.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  if (type) handleElementDrop(type);
});

// ===== MOBILE DROP SUPPORT =====
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

// ===== HANDLE ELEMENT DROP =====
function handleElementDrop(type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-builder-element';

  const makeEditable = el => {
    el.style.color = 'black';
    el.contentEditable = 'true';
    el.setAttribute("spellcheck", "false");
    return el;
  };

  let elementToAppend = null;

  switch (type) {
    case 'big-heading':
      elementToAppend = makeEditable(document.createElement('h1'));
      elementToAppend.textContent = 'Big Heading';
      wrapper.appendChild(elementToAppend);
      break;

    case 'small-heading':
      elementToAppend = makeEditable(document.createElement('h3'));
      elementToAppend.textContent = 'Small Heading';
      wrapper.appendChild(elementToAppend);
      break;

    case 'paragraph':
      elementToAppend = makeEditable(document.createElement('p'));
      elementToAppend.textContent = 'This is a paragraph of text.';
      wrapper.appendChild(elementToAppend);
      break;

    case 'text-input':
      const inputLabel = document.createElement('label');
      inputLabel.textContent = 'Text Input: ';
      inputLabel.style.color = 'black';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter text';
      input.style.color = 'black';
      wrapper.appendChild(inputLabel);
      wrapper.appendChild(input);
      break;

    case 'text-area':
      const taLabel = document.createElement('label');
      taLabel.textContent = 'Text Area: ';
      taLabel.style.color = 'black';
      const textarea = document.createElement('textarea');
      textarea.rows = 4;
      textarea.cols = 30;
      textarea.placeholder = 'Enter details';
      textarea.style.color = 'black';
      wrapper.appendChild(taLabel);
      wrapper.appendChild(textarea);
      break;

    case 'select-option':
      const selLabel = makeEditable(document.createElement('label'));
      selLabel.textContent = 'Choose Option: ';
      const select = document.createElement('select');
      ['Option 1', 'Option 2', 'Option 3'].forEach(text => {
        const opt = document.createElement('option');
        opt.textContent = text;
        opt.style.color = 'black';
        select.appendChild(opt);
      });
      wrapper.appendChild(selLabel);
      wrapper.appendChild(select);
      break;

    case 'radio-group':
      const radioLabel = makeEditable(document.createElement('label'));
      radioLabel.textContent = 'Choose One: ';
      wrapper.appendChild(radioLabel);
      ['Radio 1', 'Radio 2', 'Radio 3'].forEach((text, i) => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `radio-${Date.now()}`;
        radio.id = `radio-${i}`;
        const label = makeEditable(document.createElement('label'));
        label.setAttribute('for', radio.id);
        label.textContent = text;
        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(radio);
        wrapper.appendChild(label);
      });
      break;

    case 'checkbox-group':
      const checkLabel = makeEditable(document.createElement('label'));
      checkLabel.textContent = 'Select Multiple: ';
      wrapper.appendChild(checkLabel);
      ['Check 1', 'Check 2', 'Check 3'].forEach((text, i) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `check-${i}`;
        const label = makeEditable(document.createElement('label'));
        label.setAttribute('for', checkbox.id);
        label.textContent = text;
        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
      });
      break;
  }

  requestAnimationFrame(() => builder.appendChild(wrapper)); // smoother rendering
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






