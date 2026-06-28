let subnetInfo = null;
let selectedRow = null;

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
const subnetTableBody = document.getElementById('subnetTableBody');
const cellExplanationCard = document.getElementById('cellExplanation');
const cellExplanationTitle = document.getElementById('cellExplanationTitle');
const cellExplanationList = document.getElementById('cellExplanationList');

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

function ipToBinary(ip) {
  return ipToNumber(ip).toString(2).padStart(32, '0');
}

function createBinaryLineElement(binary, prefix, label, decimal) {
  const wrapper = document.createElement('div');
  wrapper.className = 'binary-line-container';

  const caption = document.createElement('div');
  caption.className = 'binary-label';
  caption.textContent = `${label} (${decimal})`;
  wrapper.appendChild(caption);

  const line = document.createElement('div');
  line.className = 'binary-line';

  binary.split('').forEach((bit, idx) => {
    const bitSpan = document.createElement('span');
    bitSpan.className = `binary-bit ${idx < prefix ? 'network' : 'host'}`;
    bitSpan.textContent = bit;
    line.appendChild(bitSpan);

    if (idx % 8 === 7 && idx !== binary.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'binary-separator';
      separator.textContent = '.';
      line.appendChild(separator);
    }
  });

  wrapper.appendChild(line);
  return wrapper;
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

function buildSubnetInfo(network, prefix, subnets) {
  const subnetBits = Math.ceil(Math.log2(subnets));
  const newPrefix = prefix + subnetBits;
  const addressesPerSubnet = 2 ** (32 - newPrefix);
  const firstSubnetStart = ipToNumber(network);
  const subnetsList = [];

  for (let i = 0; i < subnets; i += 1) {
    const subnetStart = firstSubnetStart + addressesPerSubnet * i;
    subnetsList.push({
      index: i + 1,
      networkAddress: numberToIp(subnetStart),
      broadcastAddress: numberToIp(subnetStart + addressesPerSubnet - 1),
      firstHost: numberToIp(subnetStart + 1),
      lastHost: numberToIp(subnetStart + addressesPerSubnet - 2),
      rangeHosts: `${numberToIp(subnetStart + 1)} - ${numberToIp(subnetStart + addressesPerSubnet - 2)}`,
      usableHosts: addressesPerSubnet - 2,
      prefix: newPrefix,
    });
  }

  return {
    originalNetwork: network,
    originalPrefix: prefix,
    subnetBits,
    newPrefix,
    addressesPerSubnet,
    newMaskText: prefixToMask(newPrefix),
    originalMaskText: prefixToMask(prefix),
    subnetCount: 2 ** subnetBits,
    firstSubnetStart,
    subnets: subnetsList,
  };
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

    if (i % 8 === 7 && i !== totalBits - 1) {
      const separator = document.createElement('span');
      separator.className = 'mask-separator';
      separator.textContent = '.';
      maskBitsContainer.appendChild(separator);
    }
  }
}

function renderSubnetTable(info) {
  if (!subnetTableBody) return;
  subnetTableBody.innerHTML = '';
  selectedRow = null;

  info.subnets.forEach(subnet => {
    const row = document.createElement('tr');
    const cells = [
      { key: 'subnet', value: `${subnet.networkAddress}/${subnet.prefix}` },
      { key: 'network', value: subnet.networkAddress },
      { key: 'broadcast', value: subnet.broadcastAddress },
      { key: 'range', value: subnet.rangeHosts },
      { key: 'usableHosts', value: subnet.usableHosts },
    ];

    cells.forEach(cellInfo => {
      const cell = document.createElement('td');
      cell.textContent = cellInfo.value;
      cell.dataset.subnetIndex = subnet.index - 1;
      cell.dataset.field = cellInfo.key;
      cell.className = 'clickable-cell';
      row.appendChild(cell);
    });

    subnetTableBody.appendChild(row);
  });

  if (cellExplanationCard) {
    cellExplanationCard.hidden = true;
  }
}

function showCellExplanation(subnetIndex, field) {
  if (!subnetInfo || !cellExplanationCard || !cellExplanationTitle || !cellExplanationList) return;
  const subnet = subnetInfo.subnets[subnetIndex];
  if (!subnet) return;

  const fieldLabels = {
    subnet: 'Subred',
    network: 'Dirección de red',
    broadcast: 'Broadcast',
    range: 'Rango hosts',
    usableHosts: 'Hosts útiles',
  };

  const explanations = [];
  const title = `${fieldLabels[field]} de Subred ${subnet.index}`;

  if (field === 'subnet') {
    explanations.push(`Subred ${subnet.index} = ${subnet.networkAddress}/${subnet.prefix}`);
    explanations.push(`La máscara de subred es /${subnet.prefix} = ${prefixToMask(subnet.prefix)}.`);
    explanations.push(`Cada subred tiene ${subnetInfo.addressesPerSubnet} direcciones totales.`);
  } else if (field === 'network') {
    explanations.push({ type: 'text', text: `La dirección de red se obtiene aplicando AND entre la IP original y la máscara.` });
    explanations.push({ type: 'text', text: `IP original = ${subnetInfo.originalNetwork}` });
    explanations.push({ type: 'text', text: `Máscara = /${subnet.prefix} = ${prefixToMask(subnet.prefix)}` });
    explanations.push({ type: 'binary', label: 'IP original', binary: ipToBinary(subnetInfo.originalNetwork), prefix: subnetInfo.originalPrefix, decimal: subnetInfo.originalNetwork });
    explanations.push({ type: 'binary', label: 'Máscara', binary: ipToBinary(prefixToMask(subnet.prefix)), prefix: subnetInfo.originalPrefix, decimal: prefixToMask(subnet.prefix) });
    explanations.push({ type: 'binary', label: 'Resultado', binary: ipToBinary(subnet.networkAddress), prefix: subnetInfo.originalPrefix, decimal: subnet.networkAddress });
    explanations.push({ type: 'text', text: `Resultado de la AND = ${subnet.networkAddress}` });
  } else if (field === 'broadcast') {
    explanations.push(`Broadcast = dirección de red + ${subnetInfo.addressesPerSubnet} - 1`);
    explanations.push(`= ${subnet.networkAddress} + ${subnetInfo.addressesPerSubnet} - 1`);
    explanations.push(`= ${subnet.broadcastAddress}`);
  } else if (field === 'range') {
    explanations.push(`Primer host = dirección de red + 1 = ${subnet.networkAddress} + 1`);
    explanations.push(`Último host = broadcast - 1 = ${subnet.broadcastAddress} - 1`);
    explanations.push(`Rango hosts = ${subnet.firstHost} - ${subnet.lastHost}`);
  } else if (field === 'usableHosts') {
    explanations.push(`Hosts útiles = direcciones por subred - 2`);
    explanations.push(`= ${subnetInfo.addressesPerSubnet} - 2`);
    explanations.push(`= ${subnet.usableHosts}`);
  }

  cellExplanationTitle.textContent = title;
  cellExplanationList.innerHTML = '';
  explanations.forEach(step => {
    const item = document.createElement('li');

    if (typeof step === 'string' || step.type === 'text') {
      item.textContent = typeof step === 'string' ? step : step.text;
    } else if (step.type === 'binary') {
      item.appendChild(createBinaryLineElement(step.binary, step.prefix, step.label, step.decimal));
    }

    cellExplanationList.appendChild(item);
  });
  cellExplanationCard.hidden = false;
}

function updateMaskExplanation(originalPrefix, subnetBits, newPrefix) {
  const maskExplanation = document.getElementById('maskExplanation');
  if (!maskExplanation) return;

  maskExplanation.textContent = `Máscara resultante /${newPrefix} = ${prefixToMask(newPrefix)}. ${originalPrefix} bits de red, ${subnetBits} bits de subred, ${32 - newPrefix} bits de host.`;
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
  subnetInfo = buildSubnetInfo(network, prefix, subnets);
  renderSubnetTable(subnetInfo);

  const { originalPrefix, subnetBits, newPrefix } = subnetInfo;
  renderMaskBits(originalPrefix, subnetBits, newPrefix);
  updateMaskExplanation(originalPrefix, subnetBits, newPrefix);
}

applyExercise.addEventListener('click', applyExerciseSettings);

if (subnetTableBody) {
  subnetTableBody.addEventListener('click', event => {
    const cell = event.target.closest('td');
    if (!cell) return;
    const subnetIndex = Number(cell.dataset.subnetIndex);
    const field = cell.dataset.field;
    showCellExplanation(subnetIndex, field);

    const row = cell.parentElement;
    if (selectedRow) {
      selectedRow.classList.remove('selected');
    }
    if (row) {
      row.classList.add('selected');
      selectedRow = row;
    }
  });
}

const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', () => {
  networkInput.value = '192.168.10.0';
  prefixInput.value = 24;
  subnetsInput.value = 4;
  applyExerciseSettings();
});

applyExerciseSettings();
