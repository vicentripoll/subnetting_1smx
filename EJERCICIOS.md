# 📚 Ejercicios de Subnetting - Guía Práctica

Bienvenido a la colección de ejercicios de subnetting. Esta guía te proporcionará ejercicios paso a paso para practicar con la aplicación web.

## 🎯 Cómo usar esta guía

1. **Lee el enunciado** del ejercicio
2. **Intenta resolverlo manualmente** usando papel y lápiz
3. **Verifica tu respuesta** usando la aplicación web
4. **Explora los pasos** haciendo clic en las celdas de la tabla para ver el cálculo detallado

---

## Ejercicio 1: Subnetting básico (FLSM)

### 📝 Enunciado
Se dispone de la red `192.168.10.0/24` y se necesitan crear **4 subredes** iguales.

### 🔍 Datos de entrada
- **Red**: `192.168.10.0`
- **Máscara CIDR**: `/24`
- **Número de subredes**: `4`

### 💭 Pasos para resolver

**Paso 1: Calcular bits de subred**
- Necesitamos 4 subredes: 2^n ≥ 4
- n = 2 bits de subred (porque 2^2 = 4)

**Paso 2: Nueva máscara**
- Máscara original: /24
- Bits de subred: +2
- Nueva máscara: /26

**Paso 3: Número de direcciones por subred**
- Bits de host = 32 - 26 = 6
- Direcciones por subred = 2^6 = 64
- Hosts útiles = 64 - 2 = 62

### ✅ Solución esperada

| Subred | Dirección de red | Broadcast | Primer host | Último host | Hosts útiles |
|--------|------------------|-----------|-------------|-------------|--------------|
| 1      | 192.168.10.0     | 192.168.10.63    | 192.168.10.1  | 192.168.10.62  | 62 |
| 2      | 192.168.10.64    | 192.168.10.127   | 192.168.10.65 | 192.168.10.126 | 62 |
| 3      | 192.168.10.128   | 192.168.10.191   | 192.168.10.129| 192.168.10.190 | 62 |
| 4      | 192.168.10.192   | 192.168.10.255   | 192.168.10.193| 192.168.10.254 | 62 |

### 🧪 Cómo verificar
1. Abre la aplicación web
2. Introduce los valores del ejercicio
3. Haz clic en **"Actualizar ejercicio"**
4. Compara tu solución con la tabla de la aplicación

---

## Ejercicio 2: Red más pequeña

### 📝 Enunciado
Se dispone de la red `172.16.0.0/16` y se necesitan crear **8 subredes** iguales.

### 🔍 Datos de entrada
- **Red**: `172.16.0.0`
- **Máscara CIDR**: `/16`
- **Número de subredes**: `8`

### 💭 Pasos para resolver

**Paso 1: Calcular bits de subred**
- 2^n ≥ 8
- n = 3 bits (porque 2^3 = 8)

**Paso 2: Nueva máscara**
- /16 + 3 = /19

**Paso 3: Direcciones por subred**
- Bits de host = 32 - 19 = 13
- Direcciones = 2^13 = 8192
- Hosts útiles = 8190

### ✅ Primera subred esperada
- **Dirección de red**: `172.16.0.0/19`
- **Broadcast**: `172.16.31.255`
- **Rango hosts**: `172.16.0.1 - 172.16.31.254`

---

## Ejercicio 3: Red muy pequeña

### 📝 Enunciado
Se dispone de la red `10.0.0.0/8` y se necesitan crear **2 subredes**.

### 🔍 Datos de entrada
- **Red**: `10.0.0.0`
- **Máscara CIDR**: `/8`
- **Número de subredes**: `2`

### 💭 Pasos para resolver

**Paso 1: Calcular bits de subred**
- 2^n ≥ 2
- n = 1 bit (porque 2^1 = 2)

**Paso 2: Nueva máscara**
- /8 + 1 = /9

**Paso 3: Direcciones por subred**
- Bits de host = 32 - 9 = 23
- Direcciones = 2^23 = 8,388,608
- Hosts útiles = 8,388,606

---

## Ejercicio 4: Red clase C con muchas subredes

### 📝 Enunciado
Se dispone de la red `192.168.50.0/24` y se necesitan crear **16 subredes** iguales.

### 🔍 Datos de entrada
- **Red**: `192.168.50.0`
- **Máscara CIDR**: `/24`
- **Número de subredes**: `16`

### 💭 Pasos para resolver

**Paso 1: Calcular bits de subred**
- 2^n ≥ 16
- n = 4 bits (porque 2^4 = 16)

**Paso 2: Nueva máscara**
- /24 + 4 = /28

**Paso 3: Direcciones por subred**
- Bits de host = 32 - 28 = 4
- Direcciones = 2^4 = 16
- Hosts útiles = 14

### ✅ Primera subred esperada
- **Dirección de red**: `192.168.50.0/28`
- **Broadcast**: `192.168.50.15`
- **Rango hosts**: `192.168.50.1 - 192.168.50.14`

---

## Ejercicio 5: Subnetting más complejo

### 📝 Enunciado
Se dispone de la red `172.20.0.0/18` y se necesitan crear **32 subredes** iguales.

### 🔍 Datos de entrada
- **Red**: `172.20.0.0`
- **Máscara CIDR**: `/18`
- **Número de subredes**: `32`

### 💭 Pasos para resolver

**Paso 1: Calcular bits de subred**
- 2^n ≥ 32
- n = 5 bits (porque 2^5 = 32)

**Paso 2: Nueva máscara**
- /18 + 5 = /23

**Paso 3: Direcciones por subred**
- Bits de host = 32 - 23 = 9
- Direcciones = 2^9 = 512
- Hosts útiles = 510

---

## 📊 Conceptos clave a recordar

### Fórmula de subnetting FLSM
```
Bits de subred = ⌈log₂(número de subredes)⌉
Nueva máscara = máscara original + bits de subred
Hosts por subred = 2^(32 - nueva máscara) - 2
```

### Cálculo de direcciones especiales
- **Dirección de red**: Primer dirección de la subred (bits de host = 0)
- **Broadcast**: Última dirección de la subred (bits de host = 1)
- **Primer host útil**: Dirección de red + 1
- **Último host útil**: Broadcast - 1

### Tabla de referencia rápida

| Máscara | Hosts útiles | Salto |
|---------|-------------|-------|
| /30     | 2           | 4     |
| /29     | 6           | 8     |
| /28     | 14          | 16    |
| /27     | 30          | 32    |
| /26     | 62          | 64    |
| /25     | 126         | 128   |
| /24     | 254         | 256   |

---

## 🎓 Recomendaciones de estudio

1. **Comienza con ejercicios simples** (como el ejercicio 1)
2. **Practica el cálculo manual** antes de verificar en la aplicación
3. **Entiende la representación binaria** de las máscaras
4. **Visualiza los bits** usando la herramienta de máscara binaria
5. **Haz clic en las celdas** de la tabla para ver el desglose del cálculo

---

## 📝 Notas de implementación

- La aplicación utiliza **FLSM** (Fixed Length Subnet Mask)
- Todas las subredes tienen el **mismo tamaño**
- Puedes modificar los valores y explorar diferentes escenarios
- Haz clic en cualquier celda de la tabla para ver su cálculo detallado paso a paso

¡Buena suerte con tu estudio de subnetting! 🚀
