// Array de ejercicios progresivos de menor a mayor dificultad
const exercises = [
  {
    id: 1,
    title: 'Ejercicio 1: Subnetting Básico (FLSM)',
    description:
      'Se dispone de la red 192.168.10.0/24 y se necesitan crear **4 subredes** iguales. Esto es lo más básico del subnetting: dividir una red en partes iguales.',
    hint: 'Para crear 4 subredes necesitas: 2^n ≥ 4, por lo que n = 2. Esto significa que la nueva máscara será /24 + 2 = /26.',
    network: '192.168.10.0',
    prefix: 24,
    subnets: 4,
    expectedNewPrefix: 26,
  },
  {
    id: 2,
    title: 'Ejercicio 2: Red Clase B',
    description:
      'Se dispone de la red 172.16.0.0/16 y se necesitan crear **8 subredes** iguales. Este ejercicio es un poco más desafiante porque trabajamos con una red Clase B (más grande).',
    hint: 'Para crear 8 subredes: 2^n ≥ 8, por lo que n = 3. Nueva máscara: /16 + 3 = /19.',
    network: '172.16.0.0',
    prefix: 16,
    subnets: 8,
    expectedNewPrefix: 19,
  },
  {
    id: 3,
    title: 'Ejercicio 3: Red Clase A',
    description:
      'Se dispone de la red 10.0.0.0/8 y se necesitan crear **16 subredes** iguales. Este es el más desafiante: trabajas con una red Clase A (la más grande), creando muchas subredes.',
    hint: 'Para crear 16 subredes: 2^n ≥ 16, por lo que n = 4. Nueva máscara: /8 + 4 = /12.',
    network: '10.0.0.0',
    prefix: 8,
    subnets: 16,
    expectedNewPrefix: 12,
  },
];

// Estado de la aplicación
let currentExerciseIndex = 0;
let completedExercises = new Set();
let hintShown = false;

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

  // Actualizar título y descripción
  document.getElementById('exerciseBadge').textContent = `Ejercicio ${exercise.id}/${exercises.length}`;
  document.getElementById('exerciseTitle').textContent = exercise.title;
  document.getElementById('exerciseDescription').innerHTML = exercise.description;

  // Limpiar inputs
  networkInput.value = '';
  prefixInput.value = '';
  subnetsInput.value = '';
  bitsInput.value = '';
  newMaskInput.value = '';
  hostsInput.value = '';
  feedbackMessage.textContent = '';
  feedbackMessage.className = 'feedback-hidden';

  // Ocultar tarjetas
  hintCard.classList.add('hidden');
  successCard.classList.add('hidden');
  infoSection.classList.add('hidden');
  tableSection.classList.add('hidden');

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

  // Validar que los campos no estén vacíos
  if (!inputNetwork || isNaN(inputPrefix) || isNaN(inputSubnets) || 
      isNaN(inputBits) || isNaN(inputNewMask) || isNaN(inputHosts)) {
    showFeedback('❌ Incorrecto', 'error');
    return;
  }

  // Calcular valores esperados
  const expectedBits = Math.ceil(Math.log2(inputSubnets));
  const expectedNewMask = inputPrefix + expectedBits;
  const expectedHostBits = 32 - expectedNewMask;
  const expectedHosts = Math.pow(2, expectedHostBits) - 2;

  // Validar todas las respuestas
  const isNetworkCorrect = inputNetwork === exercise.network;
  const isPrefixCorrect = inputPrefix === exercise.prefix;
  const isSubnetsCorrect = inputSubnets === exercise.subnets;
  const isBitsCorrect = inputBits === expectedBits;
  const isNewMaskCorrect = inputNewMask === expectedNewMask;
  const isHostsCorrect = inputHosts === expectedHosts;

  const allCorrect = isNetworkCorrect && isPrefixCorrect && isSubnetsCorrect && 
                     isBitsCorrect && isNewMaskCorrect && isHostsCorrect;

  if (allCorrect) {
    showFeedback('✅ Correcto', 'success');
    markExerciseComplete();
    showSuccess(exercise);
  } else {
    showFeedback('❌ Incorrecto', 'error');
  }
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
  hintContent.innerHTML = exercise.hint;
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
  const expectedBits = Math.ceil(Math.log2(exercise.subnets));
  const newPrefix = exercise.expectedNewPrefix;
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

  for (let i = 0; i < exercise.subnets; i++) {
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
