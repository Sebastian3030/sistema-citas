(function () {
  
  const monthTitleEl = document.getElementById('month-title');
  const daysGrid = document.getElementById('days-grid');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();

  const STORAGE_KEY = 'selectedDates';
  let selectedSet = new Set();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) arr.forEach(d => selectedSet.add(d));
    }
  } catch (e) {
    console.warn('No se pudo leer localStorage:', e);
  }

  function pad(n){ return n<10 ? '0'+n : String(n); }
  function makeKey(y,m,d){ return `${y}-${pad(m)}-${pad(d)}`; }

  function renderCalendar(year, month) {
    monthTitleEl.textContent = `${MONTHS[month]} ${year}`;
    daysGrid.innerHTML = '';

    const first = new Date(year, month, 1).getDay(); 
    const offset = (first + 6) % 7; 

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < offset; i++) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      empty.setAttribute('aria-hidden', 'true');
      daysGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
      btn.textContent = d;
      btn.setAttribute('role', 'gridcell');

      const dateKey = makeKey(year, month + 1, d);
      const isSelected = selectedSet.has(dateKey);
      if (isSelected) btn.classList.add('selected');
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      btn.addEventListener('click', () => toggleDay(btn, dateKey));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleDay(btn, dateKey);
        }
      });

      daysGrid.appendChild(btn);
    }

    const totalCells = offset + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      empty.setAttribute('aria-hidden', 'true');
      daysGrid.appendChild(empty);
    }
  }

  function toggleDay(btn, key) {
    if (selectedSet.has(key)) {
      selectedSet.delete(key);
      btn.classList.remove('selected');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      selectedSet.add(key);
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
    }
    saveSelections();
  }

  function saveSelections() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedSet)));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  }

  prevBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(currentYear, currentMonth);
  });
  nextBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(currentYear, currentMonth);
  });


  renderCalendar(currentYear, currentMonth);


  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('assign-form');
    const inputs = Array.from(form.querySelectorAll('input.user-input'));
    const btn = document.getElementById('assign-btn');


    const originalText = btn.innerHTML;

    inputs.forEach((input, idx) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!input.checkValidity()) {
            input.reportValidity();
            input.classList.add('invalid');
            input.focus();
            return;
          } else {
            input.classList.remove('invalid');
          }
          const next = inputs[idx + 1];
          if (next) next.focus();
          else { btn.focus(); btn.click(); }
        }
      });
      input.addEventListener('input', () => {
        if (input.checkValidity()) input.classList.remove('invalid');
      });
    });

    
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      
      if (!form.checkValidity()) {
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.reportValidity();
          firstInvalid.classList.add('invalid');
          firstInvalid.focus();
        }
        return;
      }

      btn.disabled = true;
      btn.classList.remove('assigned');
      btn.innerHTML = 'Agendando cita...';


      setTimeout(() => {
        
        btn.classList.add('assigned');
        btn.innerHTML = 'Cita agendada <i class="fa-solid fa-check" aria-hidden="true"></i>';

        
        const nombres = inputs.map(i => i.value.trim());
        const fechasSeleccionadas = Array.from(selectedSet); 
        console.log('Asignación completada — nombres:', nombres, 'fechas:', fechasSeleccionadas);

        
        setTimeout(() => {
          btn.disabled = false;
          btn.classList.remove('assigned');
          btn.innerHTML = originalText;
        }, 1400);

      }, 900); 
    });
  });

  
  window.__calendar = { renderCalendar, getSelected: () => Array.from(selectedSet) };
})();