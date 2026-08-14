const networkInput = document.getElementById('networkInput');
const prefixInput = document.getElementById('prefixInput');
const requirementsInput = document.getElementById('requirementsInput');
const applyVlsm = document.getElementById('applyVlsm');
const resetBtn = document.getElementById('resetBtn');
const infoNetwork = document.getElementById('info-network');
const infoBaseMask = document.getElementById('info-base-mask');
const infoTotal = document.getElementById('info-total');
const vlsmTableBody = document.getElementById('vlsmTableBody');

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
  if (prefix === 0) return '0.0.0.0';
  return numberToIp((0xffffffff << (32 - prefix)) >>> 0);
}

function nextPowerOfTwo(value) {
  if (value <= 1) return 1;
  let power = 1;
  while (power < value) {
    power *= 2;
  }
  return power;
}

function parseRequirements(rawValue) {
  const values = rawValue
    .split(/[\s,]+/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);

  if (values.length === 0) {
    throw new Error('Debes introducir al menos una necesidad de hosts.');
  }

  return values;
}

function maskForHosts(hosts) {
  const requiredSize = nextPowerOfTwo(hosts + 2);
  return 32 - Math.log2(requiredSize);
}

function buildVlsmPlan(network, prefix, requirements) {
  const networkNumber = ipToNumber(network);
  const totalAddresses = 2 ** (32 - prefix);
  const sorted = requirements
    .map((hosts, index) => ({
      id: index + 1,
      requiredHosts: hosts,
      blockSize: nextPowerOfTwo(hosts + 2),
      availableHosts: nextPowerOfTwo(hosts + 2) - 2,
      prefix: maskForHosts(hosts),
    }))
    .sort((a, b) => b.blockSize - a.blockSize || a.id - b.id);

  const totalRequired = sorted.reduce((sum, item) => sum + item.blockSize, 0);
  if (totalRequired > totalAddresses) {
    throw new Error('La suma de los bloques necesarios excede el tamaño de la red base.');
  }

  let currentAddress = networkNumber;
  const subnets = sorted.map((item) => {
    const subnetStart = currentAddress;
    const subnetEnd = subnetStart + item.blockSize - 1;
    const subnet = {
      label: `Subred ${item.id}`,
      requiredHosts: item.requiredHosts,
      prefix: item.prefix,
      networkAddress: numberToIp(subnetStart),
      broadcastAddress: numberToIp(subnetEnd),
      firstHost: numberToIp(subnetStart + 1),
      lastHost: numberToIp(subnetEnd - 1),
      usableHosts: item.availableHosts,
      range: `${numberToIp(subnetStart + 1)} - ${numberToIp(subnetEnd - 1)}`,
    };
    currentAddress = subnetEnd + 1;
    return subnet;
  });

  return {
    baseNetwork: network,
    basePrefix: prefix,
    baseMask: prefixToMask(prefix),
    totalAddresses,
    totalUsableHosts: subnets.reduce((sum, item) => sum + item.usableHosts, 0),
    subnets,
  };
}

function renderVlsmTable(plan) {
  if (!vlsmTableBody) return;

  vlsmTableBody.innerHTML = '';
  plan.subnets.forEach((subnet) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${subnet.label}</td>
      <td>${subnet.requiredHosts} hosts</td>
      <td>/${subnet.prefix}</td>
      <td>${subnet.networkAddress}</td>
      <td>${subnet.broadcastAddress}</td>
      <td>${subnet.range}</td>
      <td>${subnet.usableHosts}</td>
    `;
    vlsmTableBody.appendChild(row);
  });
}

function renderSummary(plan) {
  infoNetwork.textContent = plan.baseNetwork;
  infoBaseMask.textContent = `/${plan.basePrefix}`;
  infoTotal.textContent = `${plan.totalUsableHosts} hosts útiles`;
}

function applyVlsmCalculation() {
  try {
    const network = networkInput.value.trim();
    const prefix = Number(prefixInput.value);
    const requirements = parseRequirements(requirementsInput.value);

    if (!/^((25[0-5]|2[0-4]\d|[01]?\d?\d)(\.|$)){4}$/.test(network)) {
      throw new Error('Introduce una dirección IP de red válida, por ejemplo 192.168.10.0.');
    }

    if (!(prefix >= 1 && prefix <= 30)) {
      throw new Error('Introduce una máscara CIDR válida entre /1 y /30.');
    }

    const plan = buildVlsmPlan(network, prefix, requirements);
    renderSummary(plan);
    renderVlsmTable(plan);
  } catch (error) {
    alert(error.message);
  }
}

applyVlsm.addEventListener('click', applyVlsmCalculation);
resetBtn.addEventListener('click', () => {
  networkInput.value = '192.168.10.0';
  prefixInput.value = '24';
  requirementsInput.value = '50, 30, 10, 2';
  vlsmTableBody.innerHTML = '';
  infoNetwork.textContent = '192.168.10.0';
  infoBaseMask.textContent = '/24';
  infoTotal.textContent = '-';
});

applyVlsmCalculation();
