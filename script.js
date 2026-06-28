let steps = [];
let currentStep = 0;
let selectedType = 'FLSM';

const exerciseTypeSelect = document.getElementById('exerciseType');
const infoType = document.getElementById('info-type');
const infoNetwork = document.getElementById('info-network');
const infoMask = document.getElementById('info-mask');
const infoSubnets = document.getElementById('info-subnets');
const networkInput = document.getElementById('networkInput');
const prefixInput = document.getElementById('prefixInput');
const subnetsInput = document.getElementById('subnetsInput');
const applyExercise = document.getElementById('applyExercise');
const exerciseEnunciado = document.getElementById('exerciseEnunciado');

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

function prefixToMask(prefix) {
  const mask = prefix === 0 ? 0 : 0xffffffff << (32 - prefix);
  return numberToIp(mask >>> 0);
}

function isValidIp(ip) {
  return /^((25[0-5]|2[0-4]\d|[01]?\d?\d)(\.|$)){4}$/.test(ip);
}

function validateInputs(network, prefix, subnets) {
  if (!isValidIp(network)) {
    alert('Introduce una dirección IP de red válida (por ejemplo 192.168.10.0).');
    return false;
  }
  if (!(prefix >= 1 && prefix <= 30)) {
    alert('Introduce una máscara CIDR válida entre 1 y 30.');
    return false;
  }
  if (!(subnets >= 1 && Number.isInteger(subnets))) {
    alert('Introduce un número válido de subredes (entero positivo).');
    return false;
  }
  return true;
}

function buildSteps(network, prefix, subnets) {
  const subnetBits = Math.ceil(Math.log2(subnets));
  const newPrefix = prefix + subnetBits;
  const addressesPerSubnet = 2 ** (32 - newPrefix);
  const maskText = prefixToMask(newPrefix);
  const subnetCount = 2 ** subnetBits;
  const firstSubnetStart = ipToNumber(network);
  const subnetsList = [];

  for (let i = 0; i < subnets; i += 1) {
    const subnetStart = firstSubnetStart + addressesPerSubnet * i;
    subnetsList.push(`${numberToIp(subnetStart)}/${newPrefix}`);
  }

  return [
    {
      title: 'Determinar cuántas subredes necesitamos',
      description: `Queremos crear ${subnets} subredes iguales a partir de la red origen. Para FLSM usamos ${subnetBits} bits de subred porque 2^${subnetBits} = ${subnetCount}.`,
      details: {
        'Número de subredes solicitadas': `${subnets}`,
        'Bits para subredes': `${subnetBits} (porque 2^${subnetBits} = ${subnetCount})`,
      },
    },
    {
      title: 'Calcular la nueva máscara de subred',
      description: `La red original es /${prefix}. Añadimos ${subnetBits} bits para subred y la máscara final es /${newPrefix}.`,
      details: {
        'Máscara CIDR': `/${newPrefix}`,
        'Máscara de red': maskText,
      },
    },
    {
      title: 'Obtener las subredes resultantes',
      description: `Con /${newPrefix} la red se divide en subredes iguales de ${addressesPerSubnet} direcciones cada una.`,
      details: subnetsList.reduce((acc, subnet, index) => {
        acc[`Subred ${index + 1}`] = subnet;
        return acc;
      }, {}),
    },
    {
      title: 'Calcular dirección de red y broadcast de la primera subred',
      description: 'Para la primera subred se calculan la dirección de red y la dirección de broadcast.',
      details: {
        'Dirección de red': subnetsList[0],
        'Broadcast': numberToIp(firstSubnetStart + addressesPerSubnet - 1),
      },
    },
    {
      title: 'Calcular el rango de hosts de la primera subred',
      description: 'Los hosts válidos están entre la dirección de red y la de broadcast, excluyendo ambos extremos.',
      details: {
        'Rango de hosts': `${numberToIp(firstSubnetStart + 1)} - ${numberToIp(firstSubnetStart + addressesPerSubnet - 2)}`,
        'Total hosts': `${addressesPerSubnet - 2} hosts útiles`,
      },
    },
    {
      title: 'Resumen y siguiente paso',
      description: 'Ya tenemos la máscara y las subredes. En próximas versiones añadiremos VLSM y más ejercicios dinámicos.',
      details: {
        'Resultado final': `${subnets} subredes con /${newPrefix}`,
        'Siguiente paso': 'Implementar VLSM y cálculos automáticos de múltiples ejercicios',
      },
    },
  ];
}

function updateExerciseType(type) {
  selectedType = type;
  infoType.textContent = type;

  if (type === 'FLSM') {
    stepDescription.textContent = 'En este ejemplo utilizamos FLSM (Fixed Length Subnet Mask).';
  } else {
    stepDescription.textContent = 'VLSM aún no está implementado. De momento, puedes explorar el proceso FLSM y en próximas versiones se añadirá VLSM.';
  }

  currentStep = 0;
  renderStep(currentStep);
}

function updateSummaryText(network, prefix, subnets) {
  exerciseEnunciado.textContent = `Se dispone de la red ${network}/${prefix} y se deben crear ${subnets} subredes iguales utilizando FLSM.`;
  infoNetwork.textContent = network;
  infoMask.textContent = `/${prefix}`;
  infoSubnets.textContent = subnets;
}

function applyExerciseSettings() {
  const network = networkInput.value.trim();
  const prefix = Number(prefixInput.value);
  const subnets = Number(subnetsInput.value);

  if (!validateInputs(network, prefix, subnets)) {
    return;
  }

  updateSummaryText(network, prefix, subnets);
  steps = buildSteps(network, prefix, subnets);
  currentStep = 0;
  renderStep(currentStep);
}

exerciseTypeSelect.addEventListener('change', event => {
  updateExerciseType(event.target.value);
});

applyExercise.addEventListener('click', applyExerciseSettings);

const stepBadge = document.getElementById('step-badge');
const stepTitle = document.getElementById('step-title');
const stepDescription = document.getElementById('step-description');
const stepsList = document.getElementById('steps');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');

function renderStep(index) {
  const step = steps[index];
  stepBadge.textContent = `Paso ${index + 1} de ${steps.length}`;
  stepTitle.textContent = step.title;
  stepDescription.textContent = step.description;
  stepsList.innerHTML = '';

  for (const [label, value] of Object.entries(step.details)) {
    const item = document.createElement('li');
    item.className = 'step-card';
    item.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
    stepsList.appendChild(item);
  }

  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === steps.length - 1;
}

prevBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderStep(currentStep);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep += 1;
    renderStep(currentStep);
  }
});

resetBtn.addEventListener('click', () => {
  currentStep = 0;
  renderStep(currentStep);
});

applyExerciseSettings();
