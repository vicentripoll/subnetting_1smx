const exercises = [
  {
    id: 1,
    title: 'Ejercicio 1: VLSM básico',
    descriptionTemplate:
      'Se dispone de la red **{network}/{prefix}** y necesitas crear subredes para **{requirements}** hosts. Ordena las subredes por tamaño y asigna la máscara CIDR más eficiente a cada una.',
    network: '192.168.10.0',
    prefix: 24,
    requirements: [50, 30, 10, 2],
    hint: 'La subred más grande debe recibir la máscara más corta posible. En general, 50 hosts necesitan /26, 30 necesitan /27, 10 necesitan /28 y 2 necesitan /30.',
  },
  {
    id: 2,
    title: 'Ejercicio 2: VLSM intermedio',
    descriptionTemplate:
      'Se dispone de la red **{network}/{prefix}** y quieres atender los siguientes requisitos: **{requirements}** hosts. Calcula la máscara CIDR adecuada para cada una sin desperdiciar direcciones.',
    network: '172.16.0.0',
    prefix: 16,
    requirements: [100, 50, 25, 12, 2],
    hint: 'Recuerda que 100 hosts necesitan /25, 50 necesitan /26, 25 necesitan /27, 12 necesitan /28 y 2 necesitan /30.',
  },
  {
    id: 3,
    title: 'Ejercicio 3: VLSM avanzado',
    descriptionTemplate:
      'Se dispone de la red **{network}/{prefix}** y necesitas crear subredes para **{requirements}** hosts. Debes asignar una máscara CIDR distinta a cada demanda para optimizar el espacio disponible.',
    network: '10.0.0.0',
    prefix: 20,
    requirements: [200, 80, 30, 15, 2],
    hint: 'La regla práctica es: 200 hosts -> /24, 80 -> /25, 30 -> /27, 15 -> /28, 2 -> /30. Piensa en bloques de 256, 128, 32, 16 y 4 direcciones.',
  },
];

let currentExerciseIndex = 0;
let completedExercises = new Set();
let hintShown = false;
let lastValidationState = {};

const networkInput = document.getElementById('networkInput');
const prefixInput = document.getElementById('prefixInput');
const requirementsInput = document.getElementById('requirementsInput');
const maskAnswersInput = document.getElementById('maskAnswersInput');
const verifyExercise = document.getElementById('verifyExercise');
const showHint = document.getElementById('showHint');
const nextExercise = document.getElementById('nextExercise');
const restartExercises = document.getElementById('restartExercises');
const goToMain = document.getElementById('goToMain');
const feedbackMessage = document.getElementById('feedbackMessage');
const hintCard = document.getElementById('hintCard');
const hintContent = document.getElementById('hintContent');
const successCard = document.getElementById('successCard');
const finalCard = document.getElementById('finalCard');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const infoSection = document.getElementById('infoSection');
const tableSection = document.getElementById('tableSection');
const subnetTableBody = document.getElementById('subnetTableBody');

function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function numberToIp(value) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join('.');
}

function nextPowerOfTwo(value) {
  let power = 1;
  while (power < value) {
    power *= 2;
  }
  return power;
}

function maskForHosts(hosts) {
  const blockSize = nextPowerOfTwo(hosts + 2);
  return 32 - Math.log2(blockSize);
}

function getCurrentExercise() {
  return exercises[currentExerciseIndex];
}

function saveProgress() {
  const data = {
    currentIndex: currentExerciseIndex,
    completed: Array.from(completedExercises),
  };
  localStorage.setItem('vlsmExerciseProgress', JSON.stringify(data));
}

function loadProgress() {
  const saved = localStorage.getItem('vlsmExerciseProgress');
  if (saved) {
    const data = JSON.parse(saved);
    currentExerciseIndex = data.currentIndex || 0;
    completedExercises = new Set(data.completed || []);
  }
}

function updateProgressBar() {
  const completed = completedExercises.size;
  const total = exercises.length;
  const percentage = (completed / total) * 100;
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `Ejercicio ${Math.min(completed + 1, total)}/${total}`;
}

function clearValidationStyles() {
  networkInput.classList.remove('valid', 'invalid');
  prefixInput.classList.remove('valid', 'invalid');
  requirementsInput.classList.remove('valid', 'invalid');
  maskAnswersInput.classList.remove('valid', 'invalid');
}

function applyValidationStyle(input, isCorrect) {
  if (isCorrect) {
    input.classList.add('valid');
    input.classList.remove('invalid');
  } else {
    input.classList.add('invalid');
    input.classList.remove('valid');
  }
}

function showFeedback(message, type) {
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback-${type}`;
  feedbackMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function parseRequirements(raw) {
  return raw
    .split(/[\s,]+/)
    .map((value) => Number(value.trim()))
    .filter((num) => Number.isFinite(num) && num > 0);
}

function normalizeMaskList(raw) {
  return raw
    .split(/[\s,]+/)
    .map((value) => Number(String(value).replace(/[^\d]/g, '')))
    .filter((num) => Number.isFinite(num) && num > 0);
}

function buildVlsmTableData(network, prefix, requirements) {
  const networkNumber = ipToNumber(network);
  const sorted = [...requirements]
    .map((hosts, index) => ({
      id: index + 1,
      requiredHosts: hosts,
      blockSize: nextPowerOfTwo(hosts + 2),
      prefix: maskForHosts(hosts),
    }))
    .sort((a, b) => b.blockSize - a.blockSize || a.id - b.id);

  let currentAddress = networkNumber;
  return sorted.map((item) => {
    const subnetStart = currentAddress;
    const subnetEnd = subnetStart + item.blockSize - 1;
    const subnet = {
      index: item.id,
      requiredHosts: item.requiredHosts,
      prefix: item.prefix,
      networkAddress: numberToIp(subnetStart),
      broadcastAddress: numberToIp(subnetEnd),
      range: `${numberToIp(subnetStart + 1)} - ${numberToIp(subnetEnd - 1)}`,
      usableHosts: item.blockSize - 2,
    };
    currentAddress = subnetEnd + 1;
    return subnet;
  });
}

function loadExercise() {
  if (currentExerciseIndex >= exercises.length) {
    showFinalCard();
    return;
  }

  hintShown = false;
  lastValidationState = {};
  const exercise = getCurrentExercise();
  const requirementText = exercise.requirements.join(', ');

  document.getElementById('exerciseBadge').textContent = `Ejercicio ${exercise.id}/${exercises.length}`;
  document.getElementById('exerciseTitle').textContent = exercise.title;
  document.getElementById('exerciseDescription').innerHTML = exercise.descriptionTemplate
    .replace('{network}', exercise.network)
    .replace('{prefix}', exercise.prefix)
    .replace('{requirements}', requirementText);

  networkInput.value = '';
  prefixInput.value = '';
  requirementsInput.value = '';
  maskAnswersInput.value = '';
  feedbackMessage.textContent = '';
  feedbackMessage.className = 'feedback-hidden';
  clearValidationStyles();

  hintCard.classList.add('hidden');
  successCard.classList.add('hidden');
  infoSection.classList.add('hidden');
  tableSection.classList.add('hidden');

  showHint.disabled = true;
  showHint.style.opacity = '0.5';
  showHint.style.cursor = 'not-allowed';

  updateProgressBar();
  networkInput.focus();
}

function verifyAnswer() {
  const exercise = getCurrentExercise();
  const inputNetwork = networkInput.value.trim();
  const inputPrefix = Number(prefixInput.value);
  const inputRequirements = parseRequirements(requirementsInput.value);
  const inputMasks = normalizeMaskList(maskAnswersInput.value);

  clearValidationStyles();

  const expectedMasks = exercise.requirements.map((req) => maskForHosts(req));
  const isNetworkCorrect = inputNetwork === exercise.network;
  const isPrefixCorrect = inputPrefix === exercise.prefix;
  const isRequirementsCorrect = JSON.stringify(inputRequirements) === JSON.stringify(exercise.requirements);
  const isMasksCorrect = JSON.stringify(inputMasks) === JSON.stringify(expectedMasks);

  lastValidationState = {
    network: { correct: isNetworkCorrect, expected: exercise.network, actual: inputNetwork },
    prefix: { correct: isPrefixCorrect, expected: exercise.prefix, actual: inputPrefix },
    requirements: { correct: isRequirementsCorrect, expected: exercise.requirements, actual: inputRequirements },
    masks: { correct: isMasksCorrect, expected: expectedMasks, actual: inputMasks },
  };

  applyValidationStyle(networkInput, isNetworkCorrect);
  applyValidationStyle(prefixInput, isPrefixCorrect);
  applyValidationStyle(requirementsInput, isRequirementsCorrect);
  applyValidationStyle(maskAnswersInput, isMasksCorrect);

  const correctCount = [isNetworkCorrect, isPrefixCorrect, isRequirementsCorrect, isMasksCorrect].filter(Boolean).length;
  if (correctCount >= 3) {
    showHint.disabled = false;
    showHint.style.opacity = '1';
    showHint.style.cursor = 'pointer';
  } else {
    showHint.disabled = true;
    showHint.style.opacity = '0.5';
    showHint.style.cursor = 'not-allowed';
  }

  const allCorrect = isNetworkCorrect && isPrefixCorrect && isRequirementsCorrect && isMasksCorrect;

  if (allCorrect) {
    showFeedback('✅ ¡Todas las respuestas son correctas!', 'success');
    markExerciseComplete();
    setTimeout(() => {
      showSuccess(exercise);
    }, 500);
  } else {
    showFeedback('❌ Algunas respuestas son incorrectas. Revisa los campos marcados en rojo.', 'error');
  }
}

function markExerciseComplete() {
  completedExercises.add(currentExerciseIndex);
  saveProgress();
}

function showHintCard() {
  const exercise = getCurrentExercise();
  let hintText = exercise.hint + '<br><br>';
  const errors = [];

  if (!lastValidationState.network?.correct) {
    errors.push(`<strong>Red base:</strong> debería ser ${exercise.network}`);
  }
  if (!lastValidationState.prefix?.correct) {
    errors.push(`<strong>Máscara base:</strong> debería ser /${exercise.prefix}`);
  }
  if (!lastValidationState.requirements?.correct) {
    errors.push(`<strong>Necesidades:</strong> deberían ser ${exercise.requirements.join(', ')}`);
  }
  if (!lastValidationState.masks?.correct) {
    const expected = exercise.requirements.map((req) => maskForHosts(req));
    const formatted = expected.join(', ');
    errors.push(`<strong>Máscaras:</strong> deberían ser ${formatted}.`);
  }

  if (errors.length > 0) {
    hintText += '<strong>Revisa estos apartados:</strong><br>';
    hintText += errors.join('<br>');
  } else {
    hintText += '¡Todo está bien!';
  }

  hintContent.innerHTML = hintText;
  hintCard.classList.remove('hidden');
  hintShown = true;
  hintCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showSuccess(exercise) {
  const data = buildVlsmTableData(exercise.network, exercise.prefix, exercise.requirements);
  document.getElementById('info-type').textContent = 'VLSM';
  document.getElementById('info-mask').textContent = `/${exercise.prefix}`;
  document.getElementById('info-subnets').textContent = exercise.requirements.length;
  document.getElementById('info-hosts').textContent = data.reduce((sum, item) => sum + item.usableHosts, 0);
  infoSection.classList.remove('hidden');

  subnetTableBody.innerHTML = '';
  data.forEach((subnet) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${subnet.index}</td>
      <td>${subnet.requiredHosts}</td>
      <td>/${subnet.prefix}</td>
      <td>${subnet.networkAddress}</td>
      <td>${subnet.broadcastAddress}</td>
      <td>${subnet.range}</td>
      <td>${subnet.usableHosts}</td>
    `;
    subnetTableBody.appendChild(row);
  });
  tableSection.classList.remove('hidden');

  document.getElementById('successMessage').innerHTML = `
    ¡Excelente! La asignación VLSM es correcta.<br><br>
    <strong>Resumen:</strong><br>
    • Máscaras: <strong>${exercise.requirements.map((req) => '/' + maskForHosts(req)).join(', ')}</strong><br>
    • Subredes: <strong>${exercise.requirements.length}</strong><br>
    • Hosts útiles totales: <strong>${data.reduce((sum, item) => sum + item.usableHosts, 0)}</strong>
  `;
  successCard.classList.remove('hidden');

  setTimeout(() => {
    successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function showFinalCard() {
  finalCard.classList.remove('hidden');
  feedbackMessage.classList.add('hidden');
  document.querySelector('.button-group').style.display = 'none';
  document.querySelector('.form-grid').style.display = 'none';
}

verifyExercise.addEventListener('click', verifyAnswer);
showHint.addEventListener('click', showHintCard);

nextExercise.addEventListener('click', () => {
  currentExerciseIndex += 1;
  saveProgress();
  loadExercise();
});

restartExercises.addEventListener('click', () => {
  currentExerciseIndex = 0;
  completedExercises.clear();
  localStorage.removeItem('vlsmExerciseProgress');
  location.reload();
});

goToMain.addEventListener('click', () => {
  window.location.href = 'index.html';
});

loadProgress();
loadExercise();
