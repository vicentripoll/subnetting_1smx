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
const maskBitsContainer = document.getElementById('maskBits');

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

  const requiredBits = Math.ceil(Math.log2(subnets));
  if (prefix + requiredBits > 30) {
    alert('El número de subredes es demasiado alto para la máscara indicada. Usa una máscara menor o menos subredes.');
    return false;
  }

  return true;
}

function buildSteps(network, prefix, subnets) {
  const subnetBits = Math.ceil(Math.log2(subnets));
  const newPrefix = prefix + subnetBits;
  const addressesPerSubnet = 2 ** (32 - newPrefix);
  const newMaskText = prefixToMask(newPrefix);
  const originalMaskText = prefixToMask(prefix);
  const subnetCount = 2 ** subnetBits;
  const firstSubnetStart = ipToNumber(network);
  const subnetsList = [];

  for (let i = 0; i < subnets; i += 1) {
    const subnetStart = firstSubnetStart + addressesPerSubnet * i;
    subnetsList.push(`${numberToIp(subnetStart)}/${newPrefix}`);
  }

  return [
    {
      title: '1. Validar los datos de entrada',
      description: 'Comprobamos la dirección de red, la máscara y el número de subredes antes de iniciar los cálculos.',
      details: {
        'IP de red': network,
        'Máscara CIDR original': `/${prefix}`,
        'Máscara decimal original': originalMaskText,
        'Subredes solicitadas': `${subnets}`,
      },
      maskInfo: {
        originalPrefix: prefix,
        subnetBits,
        newPrefix,
      },
    },
    {
      title: '2. Calcular cuántos bits de subred necesitamos',
      description: 'Determinar los bits necesarios para obtener al menos el número de subredes pedidas: usamos n bits donde 2^n debe ser igual o superior al número de subredes.',
      details: {
        'Subredes pedidas': `${subnets}`,
        'Cálculo': `2^n >= ${subnets}`,
        'Bits necesarios': `${subnetBits}`,
        'Subredes posibles con esos bits': `${subnetCount}`,
      },
    },
    {
      title: '3. Calcular la nueva máscara de subred',
      description: 'A la máscara original le añadimos los bits de subred calculados. La nueva máscara se aplica a todas las subredes FLSM.',
      details: {
        'Máscara original': `/${prefix}`,
        'Bits adicionales': `${subnetBits}`,
        'Nueva máscara CIDR': `/${newPrefix}`,
        'Nueva máscara decimal': newMaskText,
      },
    },
    {
      title: '4. Obtener las subredes resultantes',
      description: 'Dividimos la red original en subredes iguales. Cada subred tiene el mismo tamaño y la misma máscara.',
      details: subnetsList.reduce((acc, subnet, index) => {
        acc[`Subred ${index + 1}`] = subnet;
        return acc;
      }, {
        'Direcciones por subred': `${addressesPerSubnet}`,
      }),
    },
    {
      title: '5. Calcular la dirección de red y broadcast de la primera subred',
      description: 'La primera subred empieza en la IP de red original. El broadcast es la última dirección de ese bloque de la subred.',
      details: {
        'Dirección de red de la subred 1': subnetsList[0],
        'Dirección de broadcast': numberToIp(firstSubnetStart + addressesPerSubnet - 1),
        'Cálculo broadcast': `Primera IP + ${addressesPerSubnet} - 1`,
      },
    },
    {
      title: '6. Calcular el rango de hosts de la primera subred',
      description: 'Los hosts válidos son las direcciones entre la dirección de red y la dirección de broadcast, sin incluirlas.',
      details: {
        'Primer host': numberToIp(firstSubnetStart + 1),
        'Último host': numberToIp(firstSubnetStart + addressesPerSubnet - 2),
        'Rango de hosts': `${numberToIp(firstSubnetStart + 1)} - ${numberToIp(firstSubnetStart + addressesPerSubnet - 2)}`,
        'Hosts útiles': `${addressesPerSubnet - 2}`,
      },
    },
    {
      title: '7. Resumen final',
      description: 'Resumen del ejercicio con la máscara aplicada, las subredes generadas y los valores de la primera subred.',
      details: {
        'Resultado final': `${subnets} subredes con /${newPrefix}`,
        'Subred 1': subnetsList[0],
        'Broadcast 1': numberToIp(firstSubnetStart + addressesPerSubnet - 1),
        'Rango host 1': `${numberToIp(firstSubnetStart + 1)} - ${numberToIp(firstSubnetStart + addressesPerSubnet - 2)}`,
      },
    },
  ];
}

function renderMaskBits(originalPrefix, subnetBits, newPrefix) {
  if (!maskBitsContainer) return;

  maskBitsContainer.innerHTML = '';
  const totalBits = 32;

  for (let i = 0; i < totalBits; i += 1) {
    let type = 'host';
    if (i < originalPrefix) {
      type = 'network';
    } else if (i < newPrefix) {
      type = 'subnet';
    }

    const bitValue = i < newPrefix ? '1' : '0';
    const bitSpan = document.createElement('span');
    bitSpan.className = `mask-bit ${type}`;
    bitSpan.textContent = bitValue;
    bitSpan.title = `${type === 'network' ? 'Red' : type === 'subnet' ? 'Subred' : 'Hosts'} bit ${i + 1}`;
    maskBitsContainer.appendChild(bitSpan);
  }
}

function updateMaskExplanation(originalPrefix, subnetBits, newPrefix) {
  const maskExplanation = document.getElementById('maskExplanation');
  if (!maskExplanation) return;

  maskExplanation.textContent = `Máscara resultante /${newPrefix} = ${prefixToMask(newPrefix)}. ${originalPrefix} bits de red, ${subnetBits} bits de subred, ${32 - newPrefix} bits de host.`;
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

  const { originalPrefix, subnetBits, newPrefix } = steps[0].maskInfo;
  renderMaskBits(originalPrefix, subnetBits, newPrefix);
  updateMaskExplanation(originalPrefix, subnetBits, newPrefix);
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
