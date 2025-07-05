// ===== DESKTOP DRAG START =====
document.querySelectorAll('.draggable').forEach(elem => {
  elem.addEventListener('dragstart', e => {
    e.dataTransfer.setData('type', e.target.getAttribute('data-type'));
  });
});

// ===== TOUCH SUPPORT FOR MOBILE =====
document.querySelectorAll('.draggable').forEach(elem => {
  elem.addEventListener('touchstart', e => {
    const type = elem.getAttribute('data-type');
    elem.classList.add('dragging');
    elem.setAttribute('data-dragging', type);
  });

  elem.addEventListener('touchend', e => {
    elem.classList.remove('dragging');
  });
});

// ===== HANDLE DROP TARGET =====
const builder = document.querySelector('.form-builder');

// Allow dropping on desktop
builder.addEventListener('dragover', e => e.preventDefault());

builder.addEventListener('drop', e => {
  e.preventDefault();
  const type = e.dataTransfer.getData('type');
  if (type) handleElementDrop(type);
});

// Touch support
builder.addEventListener('touchmove', e => {
  e.preventDefault();
});

builder.addEventListener('touchend', e => {
  const draggingElem = document.querySelector('.draggable.dragging');
  if (draggingElem) {
    const type = draggingElem.getAttribute('data-dragging');
    handleElementDrop(type);
    draggingElem.classList.remove('dragging');
  }
});

// ===== ELEMENT CREATION LOGIC =====
function handleElementDrop(type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'form-builder-element';

  switch (type) {
    case 'big-heading':
      const h1 = document.createElement('h1');
      h1.textContent = 'Big Heading';
      h1.style.color = 'black';
      h1.contentEditable = 'true';
      h1.setAttribute("spellcheck", "false");
      wrapper.appendChild(h1);
      break;

    case 'small-heading':
      const h3 = document.createElement('h3');
      h3.textContent = 'Small Heading';
      h3.style.color = 'black';
      h3.contentEditable = 'true';
      h3.setAttribute("spellcheck", "false");
      wrapper.appendChild(h3);
      break;

    case 'paragraph':
      const p = document.createElement('p');
      p.textContent = 'This is a paragraph of text.';
      p.style.color = 'black';
      p.contentEditable = 'true';
      p.setAttribute("spellcheck", "false");
      wrapper.appendChild(p);
      break;

    case 'text-input':
      const inputLabel = document.createElement('label');
      inputLabel.textContent = 'Text Input: ';
      inputLabel.style.color = 'black';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter text';
      input.style.color = 'black';
      input.setAttribute("spellcheck", "false");
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
      textarea.setAttribute("spellcheck", "false");
      wrapper.appendChild(taLabel);
      wrapper.appendChild(textarea);
      break;

    case 'select-option':
      const selLabel = document.createElement('label');
      selLabel.textContent = 'Choose Option: ';
      selLabel.style.color = 'black';
      selLabel.contentEditable = 'true';
      selLabel.setAttribute('spellcheck', 'false');

      const select = document.createElement('select');
      ['Option 1', 'Option 2', 'Option 3'].forEach(optText => {
        const option = document.createElement('option');
        option.textContent = optText;
        option.style.color = 'black';
        select.appendChild(option);
      });

      wrapper.appendChild(selLabel);
      wrapper.appendChild(select);
      break;

    case 'radio-group':
      const radioLabel = document.createElement('label');
      radioLabel.textContent = 'Choose One: ';
      radioLabel.style.color = 'black';
      radioLabel.contentEditable = 'true';
      radioLabel.setAttribute('spellcheck', 'false');
      wrapper.appendChild(radioLabel);

      ['Radio 1', 'Radio 2', 'Radio 3'].forEach((optText, index) => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `radioGroup${Date.now()}`;
        radio.id = `${optText}-${index}`;

        const label = document.createElement('label');
        label.setAttribute('for', radio.id);
        label.textContent = optText;
        label.style.color = 'black';
        label.contentEditable = 'true';
        label.setAttribute('spellcheck', 'false');

        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(radio);
        wrapper.appendChild(label);
      });
      break;

    case 'checkbox-group':
      const checkLabel = document.createElement('label');
      checkLabel.textContent = 'Select Multiple: ';
      checkLabel.style.color = 'black';
      checkLabel.contentEditable = 'true';
      checkLabel.setAttribute('spellcheck', 'false');
      wrapper.appendChild(checkLabel);

      ['Check 1', 'Check 2', 'Check 3'].forEach((optText, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${optText}-${index}`;

        const label = document.createElement('label');
        label.setAttribute('for', checkbox.id);
        label.textContent = optText;
        label.style.color = 'black';
        label.contentEditable = 'true';
        label.setAttribute('spellcheck', 'false');

        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
      });
      break;
  }

  builder.appendChild(wrapper);
}

// ===== PDF Export =====
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
  const target = document.querySelector('.form-builder');
  const downloadBtn = document.getElementById('downloadPdfBtn');

  downloadBtn.style.display = 'none';

  const inputs = target.querySelectorAll('input[type="text"], textarea, select');
  const replacements = [];

  inputs.forEach(elem => {
    const span = document.createElement('div');
    span.textContent = elem.value || elem.placeholder || '[empty]';
    span.style.color = 'black';
    span.style.border = '1px solid #ccc';
    span.style.padding = '4px';
    span.style.minHeight = '20px';
    span.style.fontSize = '14px';
    span.style.marginTop = '4px';
    span.style.fontFamily = 'Arial, sans-serif';
    span.style.whiteSpace = 'pre-wrap';
    span.className = 'text-replacement';

    elem.style.display = 'none';
    elem.parentNode.insertBefore(span, elem.nextSibling);
    replacements.push({ original: elem, clone: span });
  });

  html2canvas(target, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');

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
});


