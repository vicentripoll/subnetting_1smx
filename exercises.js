// Array de ejercicios progresivos de menor a mayor dificultad
const exercises = [
  {
    id: 1,
    title: 'Ejercicio 1: Subnetting Básico (FLSM)',
    descriptionTemplate:
      'Se dispone de la red 192.168.10.0/24 y se necesitan crear **{subnets} subredes** iguales. Esto es lo más básico del subnetting: dividir una red en partes iguales.',
    hint: 'Para crear subredes necesitas: 2^n ≥ número de subredes. Encuentra el valor de n más pequeño que cumpla esta condición.',
    network: '192.168.10.0',
    prefix: 24,
    possibleSubnets: [2, 4, 8, 16],
    currentSubnets: null, // Se genera aleatoriamente al cargar
  },
  {
    id: 2,
    title: 'Ejercicio 2: Red Clase B',
    descriptionTemplate:
      'Se dispone de la red 172.16.0.0/16 y se necesitan crear **{subnets} subredes** iguales. Este ejercicio es un poco más desafiante porque trabajamos con una red Clase B (más grande).',
    hint: 'Para crear subredes: 2^n ≥ número de subredes. Realiza el cálculo considerando que trabajas con más espacio de direcciones.',
    network: '172.16.0.0',
    prefix: 16,
    possibleSubnets: [4, 8, 16, 32, 64],
    currentSubnets: null,
  },
  {
    id: 3,
    title: 'Ejercicio 3: Red Clase A',
    descriptionTemplate:
      'Se dispone de la red 10.0.0.0/8 y se necesitan crear **{subnets} subredes** iguales. Este es el más desafiante: trabajas con una red Clase A (la más grande), creando muchas subredes.',
    hint: 'Para crear subredes: 2^n ≥ número de subredes. Ten en cuenta que trabajas con el espacio de direcciones más grande.',
    network: '10.0.0.0',
    prefix: 8,
    possibleSubnets: [8, 16, 32, 64, 128, 256],
    currentSubnets: null,
  },
];

// Estado de la aplicación
let currentExerciseIndex = 0;
let completedExercises = new Set();
let hintShown = false;
let lastValidationState = {};

// Elementos del DOM
const networkInput = document.getElementById('networkInput');
const prefixInput = document.getElementById('prefixInput');
const subnetsInput = document.getElementById('subnetsInput');
const bitsInput = document.getElementById('bitsInput');
const newMaskInput = document.getElementById('newMaskInput');
const hostsInput = document.getElementById('hostsInput');
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

// Cargar progreso guardado
function loadProgress() {
  const saved = localStorage.getItem('exerciseProgress');
  if (saved) {
    const data = JSON.parse(saved);
    currentExerciseIndex = data.currentIndex || 0;
    completedExercises = new Set(data.completed || []);
  }
}

// Generar número aleatorio de subredes para un ejercicio
function generateRandomSubnets(exercise) {
  const randomIndex = Math.floor(Math.random() * exercise.possibleSubnets.length);
  return exercise.possibleSubnets[randomIndex];
}

// Guardar progreso
function saveProgress() {
  const data = {
    currentIndex: currentExerciseIndex,
    completed: Array.from(completedExercises),
  };
  localStorage.setItem('exerciseProgress', JSON.stringify(data));
}

// Obtener ejercicio actual
function getCurrentExercise() {
  return exercises[currentExerciseIndex];
}

// Cargar ejercicio en la UI
function loadExercise() {
  if (currentExerciseIndex >= exercises.length) {
    showFinalCard();
    return;
  }

  const exercise = getCurrentExercise();
  hintShown = false;
  lastValidationState = {}; // Limpiar estado de validación anterior

  // Generar número aleatorio de subredes
  exercise.currentSubnets = generateRandomSubnets(exercise);

  // Generar descripción con el número de subredes aleatorio
  const description = exercise.descriptionTemplate.replace('{subnets}', exercise.currentSubnets);

  // Actualizar título y descripción
  document.getElementById('exerciseBadge').textContent = `Ejercicio ${exercise.id}/${exercises.length}`;
  document.getElementById('exerciseTitle').textContent = exercise.title;
  document.getElementById('exerciseDescription').innerHTML = description;

  // Limpiar inputs
  networkInput.value = '';
  prefixInput.value = '';
  subnetsInput.value = '';
  bitsInput.value = '';
  newMaskInput.value = '';
  hostsInput.value = '';
  feedbackMessage.textContent = '';
  feedbackMessage.className = 'feedback-hidden';

  // Limpiar estilos de validación
  clearValidationStyles();

  // Ocultar tarjetas
  hintCard.classList.add('hidden');
  successCard.classList.add('hidden');
  infoSection.classList.add('hidden');
  tableSection.classList.add('hidden');

  // Deshabilitar botón de pista al cargar ejercicio
  showHint.disabled = true;
  showHint.style.opacity = '0.5';
  showHint.style.cursor = 'not-allowed';

  // Actualizar progreso
  updateProgressBar();

  // Enfoque en el primer input
  networkInput.focus();
}

// Actualizar barra de progreso
function updateProgressBar() {
  const total = exercises.length;
  const completed = completedExercises.size;
  const percentage = (completed / total) * 100;

  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `Ejercicio ${completed + 1}/${total}`;
}

// Validar respuesta
function verifyAnswer() {
  const exercise = getCurrentExercise();
  const inputNetwork = networkInput.value.trim();
  const inputPrefix = parseInt(prefixInput.value);
  const inputSubnets = parseInt(subnetsInput.value);
  const inputBits = parseInt(bitsInput.value);
  const inputNewMask = parseInt(newMaskInput.value);
  const inputHosts = parseInt(hostsInput.value);

  // Limpiar estilos previos
  clearValidationStyles();

  // Calcular valores esperados BASÁNDOSE EN EL EJERCICIO (no en inputs del usuario)
  const expectedBits = Math.ceil(Math.log2(exercise.currentSubnets));
  const expectedNewMask = exercise.prefix + expectedBits;
  const expectedHostBits = 32 - expectedNewMask;
  const expectedHosts = Math.pow(2, expectedHostBits) - 2;

  // Validar campo por campo
  const isNetworkCorrect = inputNetwork === exercise.network;
  const isPrefixCorrect = inputPrefix === exercise.prefix;
  const isSubnetsCorrect = inputSubnets === exercise.currentSubnets;
  const isBitsCorrect = inputBits === expectedBits;
  const isNewMaskCorrect = inputNewMask === expectedNewMask;
  const isHostsCorrect = inputHosts === expectedHosts;

  // Contar campos correctos
  let correctCount = 0;
  if (isNetworkCorrect) correctCount++;
  if (isPrefixCorrect) correctCount++;
  if (isSubnetsCorrect) correctCount++;
  if (isBitsCorrect) correctCount++;
  if (isNewMaskCorrect) correctCount++;
  if (isHostsCorrect) correctCount++;

  // Guardar estado de validación para la pista
  lastValidationState = {
    network: { correct: isNetworkCorrect, expected: exercise.network, actual: inputNetwork },
    prefix: { correct: isPrefixCorrect, expected: exercise.prefix, actual: inputPrefix },
    subnets: { correct: isSubnetsCorrect, expected: exercise.currentSubnets, actual: inputSubnets },
    bits: { correct: isBitsCorrect, expected: expectedBits, actual: inputBits },
    newMask: { correct: isNewMaskCorrect, expected: expectedNewMask, actual: inputNewMask },
    hosts: { correct: isHostsCorrect, expected: expectedHosts, actual: inputHosts },
  };

  // Aplicar estilos de validación
  applyValidationStyle(networkInput, isNetworkCorrect);
  applyValidationStyle(prefixInput, isPrefixCorrect);
  applyValidationStyle(subnetsInput, isSubnetsCorrect);
  applyValidationStyle(bitsInput, isBitsCorrect);
  applyValidationStyle(newMaskInput, isNewMaskCorrect);
  applyValidationStyle(hostsInput, isHostsCorrect);

  // Habilitar/deshabilitar botón de pista basándose en campos correctos
  if (correctCount >= 3) {
    showHint.disabled = false;
    showHint.style.opacity = '1';
    showHint.style.cursor = 'pointer';
  } else {
    showHint.disabled = true;
    showHint.style.opacity = '0.5';
    showHint.style.cursor = 'not-allowed';
  }

  const allCorrect = isNetworkCorrect && isPrefixCorrect && isSubnetsCorrect && 
                     isBitsCorrect && isNewMaskCorrect && isHostsCorrect;

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

// Aplicar estilos de validación a un input
function applyValidationStyle(input, isCorrect) {
  if (isCorrect) {
    input.classList.add('valid');
    input.classList.remove('invalid');
  } else {
    input.classList.add('invalid');
    input.classList.remove('valid');
  }
}

// Limpiar estilos de validación
function clearValidationStyles() {
  networkInput.classList.remove('valid', 'invalid');
  prefixInput.classList.remove('valid', 'invalid');
  subnetsInput.classList.remove('valid', 'invalid');
  bitsInput.classList.remove('valid', 'invalid');
  newMaskInput.classList.remove('valid', 'invalid');
  hostsInput.classList.remove('valid', 'invalid');
}

// Mostrar retroalimentación
function showFeedback(message, type) {
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback-${type}`;

  // Hacer scroll a la retroalimentación
  feedbackMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Mostrar pista
function showHintCard() {
  const exercise = getCurrentExercise();
  let hintText = exercise.hint + '<br><br>';

  // Agregar información sobre campos incorrectos
  const errors = [];

  if (!lastValidationState.network?.correct) {
    errors.push(`<strong>Red de origen:</strong> Debería ser ${lastValidationState.network?.expected || exercise.network}`);
  }
  if (!lastValidationState.prefix?.correct) {
    errors.push(`<strong>Máscara CIDR original:</strong> Debería ser /${lastValidationState.prefix?.expected || exercise.prefix}`);
  }
  if (!lastValidationState.subnets?.correct) {
    errors.push(`<strong>Número de subredes:</strong> Debería ser ${lastValidationState.subnets?.expected || exercise.currentSubnets}`);
  }
  if (!lastValidationState.bits?.correct) {
    const correctBits = Math.ceil(Math.log2(exercise.currentSubnets));
    errors.push(`<strong>Bits necesarios:</strong> Debería ser ${correctBits} (porque 2^${correctBits} = ${Math.pow(2, correctBits)})`);
  }
  if (!lastValidationState.newMask?.correct) {
    const correctBits = Math.ceil(Math.log2(exercise.currentSubnets));
    const correctMask = exercise.prefix + correctBits;
    errors.push(`<strong>Nueva máscara:</strong> Debería ser /${correctMask} (${exercise.prefix} + ${correctBits} bits de subred)`);
  }
  if (!lastValidationState.hosts?.correct) {
    const correctBits = Math.ceil(Math.log2(exercise.currentSubnets));
    const correctMask = exercise.prefix + correctBits;
    const hostBits = 32 - correctMask;
    const correctHosts = Math.pow(2, hostBits) - 2;
    errors.push(`<strong>Hosts disponibles:</strong> Debería ser ${correctHosts} (2^${hostBits} - 2)`);
  }

  if (errors.length > 0) {
    hintText += '<strong>Campos que necesitas corregir:</strong><br>';
    hintText += errors.join('<br>');
  } else {
    hintText += '¡Todos tus valores son correctos!';
  }

  hintContent.innerHTML = hintText;
  hintCard.classList.remove('hidden');
  hintShown = true;
  hintCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Marcar ejercicio como completado
function markExerciseComplete() {
  completedExercises.add(currentExerciseIndex);
  saveProgress();
}

// Mostrar pantalla de éxito
function showSuccess(exercise) {
  // Calcular información de la red
  const expectedBits = Math.ceil(Math.log2(exercise.currentSubnets));
  const newPrefix = exercise.prefix + expectedBits;
  const hostBits = 32 - newPrefix;
  const addressesPerSubnet = Math.pow(2, hostBits);
  const usefulHosts = addressesPerSubnet - 2;

  // Mostrar información
  document.getElementById('info-type').textContent = 'FLSM';
  document.getElementById('info-mask').textContent = `/${newPrefix}`;
  document.getElementById('info-addresses').textContent = addressesPerSubnet;
  document.getElementById('info-hosts').textContent = usefulHosts;
  infoSection.classList.remove('hidden');

  // Generar tabla de subredes
  generateSubnetTable(exercise, newPrefix);
  tableSection.classList.remove('hidden');

  // Mostrar tarjeta de éxito
  document.getElementById('successMessage').innerHTML = `
    ¡Excelente! Tus cálculos son correctos.<br><br>
    <strong>Resumen:</strong><br>
    • Bits necesarios: <strong>${expectedBits}</strong><br>
    • Nueva máscara: <strong>/${newPrefix}</strong><br>
    • Hosts útiles: <strong>${usefulHosts}</strong> por subred
  `;
  successCard.classList.remove('hidden');

  // Scroll a la tarjeta de éxito
  setTimeout(() => {
    successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

// Generar tabla de subredes
function generateSubnetTable(exercise, newPrefix) {
  const tableBody = document.getElementById('subnetTableBody');
  tableBody.innerHTML = '';

  const networkNum = ipToNumber(exercise.network);
  const hostBits = 32 - newPrefix;
  const addressesPerSubnet = Math.pow(2, hostBits);

  for (let i = 0; i < exercise.currentSubnets; i++) {
    const subnetAddr = networkNum + i * addressesPerSubnet;
    const broadcastAddr = subnetAddr + addressesPerSubnet - 1;
    const firstHost = subnetAddr + 1;
    const lastHost = broadcastAddr - 1;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${numberToIp(subnetAddr)}</td>
      <td>${numberToIp(broadcastAddr)}</td>
      <td>${numberToIp(firstHost)} - ${numberToIp(lastHost)}</td>
      <td>${addressesPerSubnet - 2}</td>
    `;
    tableBody.appendChild(row);
  }
}

// Mostrar pantalla final
function showFinalCard() {
  finalCard.classList.remove('hidden');
  feedbackMessage.classList.add('hidden');
  document.querySelector('.form-grid').style.display = 'none';
  document.querySelector('.button-group').style.display = 'none';
}

// Eventos
verifyExercise.addEventListener('click', verifyAnswer);
showHint.addEventListener('click', showHintCard);

nextExercise.addEventListener('click', () => {
  currentExerciseIndex++;
  saveProgress();
  loadExercise();
});

restartExercises.addEventListener('click', () => {
  currentExerciseIndex = 0;
  completedExercises.clear();
  localStorage.removeItem('exerciseProgress');
  location.reload();
});

goToMain.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Permitir Enter para verificar
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !successCard.classList.contains('hidden') === false) {
    verifyAnswer();
  }
});

// Funciones auxiliares para conversión de IPs
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

// Inicializar la aplicación
loadProgress();
loadExercise();
