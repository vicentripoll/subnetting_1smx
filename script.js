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

function formatBinaryWithDots(binary) {
  return binary.match(/.{1,8}/g).join('.');
}

function createBinaryLineElement(binary, originalPrefix, newPrefix, label, decimal) {
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
    const bitClass = idx < originalPrefix ? 'network' : idx < newPrefix ? 'subnet' : 'host';
    bitSpan.className = `binary-bit ${bitClass}`;
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

function createBinaryRow(binary, originalPrefix, newPrefix) {
  const row = document.createElement('div');
  row.className = 'binary-row';

  binary.split('').forEach((bit, idx) => {
    const bitSpan = document.createElement('span');
    const bitClass = idx < originalPrefix ? 'network' : idx < newPrefix ? 'subnet' : 'host';
    bitSpan.className = `binary-bit ${bitClass}`;
    bitSpan.textContent = bit;
    row.appendChild(bitSpan);

    if (idx % 8 === 7 && idx !== binary.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'binary-separator';
      separator.textContent = '.';
      row.appendChild(separator);
    }
  });

  return row;
}

function createOperationRow(label, binary, originalPrefix, newPrefix) {
  const wrapper = document.createElement('div');
  wrapper.className = 'operation-row';

  const labelDiv = document.createElement('div');
  labelDiv.className = 'operation-label';
  labelDiv.textContent = label;
  wrapper.appendChild(labelDiv);

  wrapper.appendChild(createBinaryRow(binary, originalPrefix, newPrefix));
  return wrapper;
}

function createOperationBlock(ipBinary, maskBinary, resultBinary, originalPrefix, newPrefix) {
  const wrapper = document.createElement('div');
  wrapper.className = 'operation-block';

  wrapper.appendChild(createOperationRow('IP:      ', ipBinary, originalPrefix, newPrefix));
  wrapper.appendChild(createOperationRow('Máscara: ', maskBinary, originalPrefix, newPrefix));
  const divider = document.createElement('div');
  divider.className = 'operation-divider';
  divider.textContent = '--------------------------------------------------';
  wrapper.appendChild(divider);

  wrapper.appendChild(createOperationRow('Red/Broadcast:     ', resultBinary, originalPrefix, newPrefix));
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
    requestedSubnets: subnets,
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

  const networkLegend = document.querySelector('.mask-legend-item.network');
  const subnetLegend = document.querySelector('.mask-legend-item.subnet');
  const hostLegend = document.querySelector('.mask-legend-item.host');
  const hostBits = 32 - newPrefix;

  if (networkLegend) {
    networkLegend.textContent = `Red (${originalPrefix} bits)`;
  }
  if (subnetLegend) {
    subnetLegend.textContent = `Subred (${subnetBits} bits)`;
  }
  if (hostLegend) {
    hostLegend.textContent = `Hosts (${hostBits} bits)`;
  }
}

function renderSubnetTable(info) {
  if (!subnetTableBody) return;
  subnetTableBody.innerHTML = '';
  selectedRow = null;

  info.subnets.forEach(subnet => {
    const row = document.createElement('tr');
    const hostBits = 32 - subnet.prefix;
    const usableHostsFormula = `2^${hostBits} - 2 = ${subnet.usableHosts}`;
    const cells = [
      { key: 'subnet', value: `${subnet.networkAddress}/${subnet.prefix}` },
      { key: 'network', value: subnet.networkAddress },
      { key: 'broadcast', value: subnet.broadcastAddress },
      { key: 'range', value: subnet.rangeHosts },
      { key: 'hostsCalc', value: usableHostsFormula },
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
    hostsCalc: 'Cálculo hosts útiles',
  };

  const explanations = [];
  const title = `${fieldLabels[field] || 'Explicación'} de Subred ${subnet.index}`;

  if (field === 'subnet') {
    explanations.push(`Subred ${subnet.index} = ${subnet.networkAddress}/${subnet.prefix}`);
    explanations.push(`La máscara de subred es /${subnet.prefix} = ${prefixToMask(subnet.prefix)}.`);
    explanations.push(`Cada subred tiene ${subnetInfo.addressesPerSubnet} direcciones totales.`);
  } else if (field === 'network') {
    explanations.push({ type: 'text', text: `La dirección de red es la primera dirección de una subred y se obtiene poniendo todos los bits de host a ‘0’ y haciendo la operación ‘AND’ con la máscara.` });
    const selectedSubnetBits = (subnet.index - 1).toString(2).padStart(subnetInfo.subnetBits, '0');
    explanations.push({ type: 'text', text: `Para esta subred el valor de los bits de subred es ${selectedSubnetBits}.` });
    explanations.push({ type: 'binary', label: 'IP', binary: ipToBinary(subnet.networkAddress), originalPrefix: subnetInfo.originalPrefix, newPrefix: subnet.prefix, decimal: subnet.networkAddress });
    explanations.push({ type: 'binary', label: 'Máscara', binary: ipToBinary(prefixToMask(subnet.prefix)), originalPrefix: subnetInfo.originalPrefix, newPrefix: subnet.prefix, decimal: prefixToMask(subnet.prefix) });
    explanations.push({ type: 'binary', label: 'Red', binary: ipToBinary(subnet.networkAddress), originalPrefix: subnetInfo.originalPrefix, newPrefix: subnet.prefix, decimal: subnet.networkAddress });
    explanations.push({
      type: 'operation',
      ipBinary: ipToBinary(subnet.networkAddress),
      maskBinary: ipToBinary(prefixToMask(subnet.prefix)),
      resultBinary: ipToBinary(subnet.networkAddress),
      originalPrefix: subnetInfo.originalPrefix,
      newPrefix: subnet.prefix,
    });
  } else if (field === 'broadcast') {
    explanations.push({ type: 'text', text: `El broadcast se obtiene a partir de la dirección de red de la subred poniendo todos los bits de host a '1'.` });
    const selectedSubnetBits = (subnet.index - 1).toString(2).padStart(subnetInfo.subnetBits, '0');
    explanations.push({ type: 'text', text: `Para esta subred el valor de los bits de subred es ${selectedSubnetBits}.` });
    explanations.push({ type: 'binary', label: 'Broadcast con bits de host = 1', binary: ipToBinary(subnet.broadcastAddress), originalPrefix: subnetInfo.originalPrefix, newPrefix: subnet.prefix, decimal: subnet.broadcastAddress });
    explanations.push({ type: 'binary', label: 'Máscara', binary: ipToBinary(prefixToMask(subnet.prefix)), originalPrefix: subnetInfo.originalPrefix, newPrefix: subnet.prefix, decimal: prefixToMask(subnet.prefix) });
    explanations.push({ type: 'binary', label: 'Broadcast', binary: ipToBinary(subnet.broadcastAddress), originalPrefix: subnetInfo.originalPrefix, newPrefix: subnet.prefix, decimal: subnet.broadcastAddress });
    explanations.push({
      type: 'operation',
      ipBinary: ipToBinary(subnet.networkAddress),
      maskBinary: ipToBinary(prefixToMask(subnet.prefix)),
      resultBinary: ipToBinary(subnet.broadcastAddress),
      originalPrefix: subnetInfo.originalPrefix,
      newPrefix: subnet.prefix,
    });
  } else if (field === 'range') {
    explanations.push(`Primer host = dirección de red + 1 = ${subnet.networkAddress} + 1`);
    explanations.push(`Último host = broadcast - 1 = ${subnet.broadcastAddress} - 1`);
    explanations.push(`Rango hosts = ${subnet.firstHost} - ${subnet.lastHost}`);
  } else if (field === 'usableHosts') {
    explanations.push(`Hosts útiles = direcciones por subred - 2`);
    explanations.push(`= ${subnetInfo.addressesPerSubnet} - 2`);
    explanations.push(`= ${subnet.usableHosts}`);
  } else if (field === 'hostsCalc') {
    const hostBits = 32 - subnet.prefix;
    explanations.push(`Hosts útiles = 2^n - 2, donde n = bits de host de la subred.`);
    explanations.push(`n = 32 - ${subnet.prefix} = ${hostBits}`);
    explanations.push(`Hosts útiles = 2^${hostBits} - 2 = ${subnet.usableHosts}`);
  }

  cellExplanationTitle.textContent = title;
  cellExplanationList.innerHTML = '';
  explanations.forEach(step => {
    const item = document.createElement('li');

    if (typeof step === 'string' || step.type === 'text') {
      item.textContent = typeof step === 'string' ? step : step.text;
    } else if (step.type === 'binary') {
      item.appendChild(createBinaryLineElement(step.binary, step.originalPrefix, step.newPrefix, step.label, step.decimal));
    } else if (step.type === 'operation') {
      item.appendChild(createOperationBlock(step.ipBinary, step.maskBinary, step.resultBinary, step.originalPrefix, step.newPrefix));
    }

    cellExplanationList.appendChild(item);
  });
  cellExplanationCard.hidden = false;
}

function updateMaskExplanation(originalPrefix, subnetBits, newPrefix, requestedSubnets) {
  const maskExplanation = document.getElementById('maskExplanation');
  if (!maskExplanation) return;

  const possibleSubnets = 2 ** subnetBits;
  maskExplanation.innerHTML = `Máscara resultante /${newPrefix} = ${prefixToMask(newPrefix)}. ${originalPrefix} bits para la red, ${subnetBits} bits para las subredes y ${32 - newPrefix} bits para los hosts.<br><strong>Cómo se calcula:</strong> necesitamos ${requestedSubnets} subredes, por eso buscamos el menor n tal que ${requestedSubnets} ≤ 2^n. <br> n = ${subnetBits}, porque 2^${subnetBits} = ${possibleSubnets}.`;
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

  const { originalPrefix, requestedSubnets, subnetBits, newPrefix } = subnetInfo;
  renderMaskBits(originalPrefix, subnetBits, newPrefix);
  updateMaskExplanation(originalPrefix, subnetBits, newPrefix, requestedSubnets);
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
