# 🌐 Subnetting FLSM - Herramienta Educativa Interactiva

Una aplicación web educativa diseñada para aprender y practicar **subnetting con FLSM** (Fixed Length Subnet Mask) paso a paso. Perfecta para estudiantes de **1SMX** (Sistemas Microinformáticos y en Red) y anyone interesado en redes de computadoras.

![JavaScript](https://img.shields.io/badge/JavaScript-52.4%25-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-27.4%25-E34C26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-20.2%25-1572B6?logo=css3&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Características principales

### 🧮 Calculadora de Redes
- **Cálculo visual paso a paso** de subnetting FLSM
- Introduce una red, máscara CIDR y número de subredes deseadas
- Visualiza todos los cálculos intermedios de forma clara y educativa
- Ideal para entender en profundidad el proceso de subnetting

### 📚 Ejercicios Progresivos
- **Sistema de ejercicios de dificultad creciente**
- Desde redes Clase C hasta Clase A
- Validación automática con retroalimentación inmediata (verde/rojo)
- **Pistas contextuales** después de resolver 3 apartados correctamente
- Cada intento genera valores diferentes para mayor aprendizaje

### 🎓 Interfaz Educativa
- Diseño moderno y responsive
- Navegación intuitiva entre calculadora y ejercicios
- Tabla de subredes con información completa
- Información detallada de cada subred (dirección de red, broadcast, rango de hosts)

---

## 🚀 Acceso rápido

### 📱 Prueba la aplicación
- **Página principal**: Elige entre Calculadora o Ejercicios
- **Calculadora**: Aprende cómo se calcula el subnetting
- **Ejercicios**: Resuelve ejercicios y valida tus respuestas

### 🔗 Archivos principales

```
subnetting_1smx/
├── index.html           # Página de inicio con opción de Calculadora o Ejercicios
├── calculadora.html     # Herramienta de cálculo interactivo
├── exercises.html       # Sistema de ejercicios progresivos
├── script.js            # Lógica de la calculadora FLSM
├── exercises.js         # Lógica del sistema de ejercicios
├── style.css            # Estilos responsivos
├── EJERCICIOS.md        # Guía práctica de ejercicios con soluciones
├── LICENSE              # Licencia MIT
└── assets/              # Directorio de recursos (imágenes, etc.)
```

---

## 🛠️ Tecnologías utilizadas

- **HTML5** - Estructura semántica moderna
- **CSS3** - Diseño responsive y animaciones fluidas
- **JavaScript Vanilla** - Lógica de cálculo sin dependencias externas
- **Sin frameworks pesados** - Aplicación ligera y rápida

---

## 📖 Cómo usar

### Opción 1: Calculadora (Aprender)

1. **Abre `index.html`** en tu navegador
2. **Haz clic** en "Calculadora de Redes"
3. **Introduce los parámetros**:
   - Red de origen (ej: `192.168.10.0`)
   - Máscara CIDR (ej: `/24`)
   - Número de subredes (ej: `4`)
4. **Haz clic** en "Actualizar ejercicio"
5. **Navega por los pasos** usando "Siguiente" y "Anterior"

### Opción 2: Ejercicios Progresivos (Practicar)

1. **Abre `index.html`** en tu navegador
2. **Haz clic** en "Ejercicios Progresivos"
3. **Lee el enunciado** del ejercicio
4. **Calcula y completa**:
   - Bits necesarios
   - Nueva máscara CIDR
   - Hosts disponibles por subred
5. **Haz clic** en "Verificar respuesta"
6. **Recibe retroalimentación** inmediata
7. **Accede a pistas** después de 3 respuestas correctas
8. **Continúa** con los siguientes ejercicios

---

## 📚 Ejemplo práctico

### Enunciado
*Tienes la red `192.168.10.0/24` y necesitas crear **4 subredes** iguales.*

### Solución paso a paso

**1️⃣ Calcular bits de subred:**
- Necesitamos 4 subredes: 2^n ≥ 4
- n = 2 bits (porque 2^2 = 4)

**2️⃣ Nueva máscara de subred:**
- Máscara original: `/24`
- Bits de subred: `+2`
- Nueva máscara: `/26`

**3️⃣ Direcciones y hosts:**
- Bits de host: 32 - 26 = 6
- Direcciones por subred: 2^6 = 64
- Hosts útiles: 64 - 2 = 62

**4️⃣ Resultado - Tabla de subredes:**

| Subred | Dirección de red | Broadcast | Primer host | Último host | Hosts útiles |
|--------|-------------------|-----------|-------------|-------------|--------------|
| 1 | 192.168.10.0 | 192.168.10.63 | 192.168.10.1 | 192.168.10.62 | 62 |
| 2 | 192.168.10.64 | 192.168.10.127 | 192.168.10.65 | 192.168.10.126 | 62 |
| 3 | 192.168.10.128 | 192.168.10.191 | 192.168.10.129 | 192.168.10.190 | 62 |
| 4 | 192.168.10.192 | 192.168.10.255 | 192.168.10.193 | 192.168.10.254 | 62 |

---

## 🔍 Conceptos clave

### FLSM (Fixed Length Subnet Mask)
Técnica que divide una red en **subredes de tamaño igual**. Es la más utilizada en aprendizaje de redes.

**Fórmula:**
```
Bits de subred = ⌈log₂(número de subredes)⌉
Nueva máscara = máscara original + bits de subred
Hosts por subred = 2^(32 - nueva máscara) - 2
```

### Cálculos importantes

**Dirección de red**: Primera dirección de la subred (bits de host = 0)
**Broadcast**: Última dirección de la subred (bits de host = 1)
**Primer host útil**: Dirección de red + 1
**Último host útil**: Broadcast - 1

### Tabla de referencia de máscaras

| Máscara | Hosts útiles | Salto | Clase típica |
|---------|-------------|-------|--------------|
| /30 | 2 | 4 | Enlaces punto a punto |
| /29 | 6 | 8 | Pequeños enlaces |
| /28 | 14 | 16 | Redes pequeñas |
| /27 | 30 | 32 | Redes medianas |
| /26 | 62 | 64 | Redes clase C |
| /25 | 126 | 128 | Redes clase C grandes |
| /24 | 254 | 256 | Red clase C completa |

---

## ✅ Validaciones de entrada

La aplicación valida automáticamente:

- ✓ **IP válida** en formato `XXX.XXX.XXX.XXX`
- ✓ **Máscara CIDR** entre `/1` y `/30`
- ✓ **Número de subredes** como entero positivo
- ✓ **Rango válido** de direcciones IP

---

## 🎯 Niveles de dificultad

La aplicación incluye ejercicios de **5 niveles diferentes**:

**Nivel 1️⃣:** Red `192.168.10.0/24` → 4 subredes (Clase C básico)
**Nivel 2️⃣:** Red `172.16.0.0/16` → 8 subredes (Clase B introductorio)
**Nivel 3️⃣:** Red `10.0.0.0/8` → 2 subredes (Clase A simple)
**Nivel 4️⃣:** Red `192.168.50.0/24` → 16 subredes (Clase C avanzado)
**Nivel 5️⃣:** Red `172.20.0.0/18` → 32 subredes (Subnetting complejo)

---

## 📋 Estructura del proyecto

### Archivos HTML
- `index.html` - Landing page con opciones principales
- `calculadora.html` - Interfaz de la calculadora FLSM
- `exercises.html` - Sistema de ejercicios progresivos

### Archivos JavaScript
- `script.js` - Lógica central de cálculo FLSM (16.8 KB)
- `exercises.js` - Sistema de ejercicios y validación (15.8 KB)

### Archivos de estilo
- `style.css` - Estilos responsivos para toda la aplicación (12.6 KB)

### Documentación
- `EJERCICIOS.md` - Guía práctica completa con 5 ejercicios resueltos
- `README.md` - Este archivo
- `LICENSE` - Licencia MIT

---

## 🎓 Recomendaciones de uso

1. **Comienza simple**: Usa primero la calculadora con ejercicios sencillos
2. **Entiende el concepto**: Lee la guía EJERCICIOS.md para comprender FLSM
3. **Practica manualmente**: Resuelve en papel antes de verificar
4. **Explora variaciones**: Prueba diferentes combinaciones de redes y subredes
5. **Domina los ejercicios**: Resuelve todos los ejercicios progresivos
6. **Reta tu aprendizaje**: Inventa nuevos ejercicios más complejos

---

## 🚀 Próximas mejoras planeadas

- [ ] Implementar **VLSM** (Variable Length Subnet Mask)
- [ ] Ejercicios dinámicos completamente aleatorios
- [ ] Cálculos con subredes de máscaras diferentes
- [ ] Exportación de resultados (PDF/imagen)
- [ ] Modo oscuro/claro
- [ ] Visualización binaria de direcciones IP
- [ ] Explicaciones interactivas paso a paso
- [ ] Historial de ejercicios completados
- [ ] Análisis de rendimiento del usuario

---

## 📚 Recursos educativos

Esta herramienta implementa los conceptos definidos en:
- **RFC 1918** - Direcciones privadas reservadas
- **RFC 4291** - IPv6 (preparado para futuras versiones)
- **Estándares IEEE 802.3** - Redes Ethernet

### Conceptos tratados:
- Notación CIDR (Classless Inter-Domain Routing)
- Subnetting con máscaras de longitud fija
- Cálculo de direcciones de red y broadcast
- Rango de hosts útiles en subredes
- Conversión entre formatos de máscara (binario, decimal, CIDR)

---

## 👨‍💼 Información del proyecto

- **Audiencia**: Estudiantes de 1SMX y profesionales de redes
- **Propósito**: Educativo - Comprensión práctica de subnetting
- **Nivel**: Inicial a intermedio
- **Requisitos**: Navegador web moderno (sin instalación necesaria)

---

## 📄 Licencia

Este proyecto está bajo licencia **MIT**. Puedes usarlo libremente con fines educativos.

```
MIT License - Libre para uso educativo y comercial
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras bugs o tienes sugerencias:

1. **Abre un issue** describiendo el problema
2. **Propón mejoras** con ejemplos específicos
3. **Contribuye código** mediante pull requests

---

## 💬 Soporte y preguntas

**¿Preguntas sobre subnetting?**
- Consulta la guía en `EJERCICIOS.md`
- Prueba la calculadora con diferentes valores
- Verifica tus cálculos manuales con la herramienta

**¿Problemas técnicos?**
- Asegúrate de usar un navegador moderno
- Comprueba que JavaScript está habilitado
- Limpia la caché del navegador si hay problemas

---

## 📊 Estadísticas del proyecto

- **Lenguaje principal**: JavaScript (52.4%)
- **Estilos**: CSS (20.2%)
- **Estructura**: HTML (27.4%)
- **Tamaño total**: ~54 KB
- **Ejercicios incluidos**: 5 niveles progresivos
- **Funciones de cálculo**: +30
- **Rutas de validación**: +20

---

## 🎉 ¡Bienvenido!

Esta herramienta ha sido desarrollada con el objetivo de hacer el aprendizaje de subnetting:

✨ **Interactivo** - Aprende haciendo, no solo leyendo
📚 **Progresivo** - Aumenta la dificultad gradualmente
🎯 **Práctico** - Ejercicios basados en escenarios reales
🧠 **Comprensible** - Explicaciones claras paso a paso
🚀 **Accesible** - Sin instalaciones, solo abre el navegador

---

**¡Esperamos que disfrutes aprendiendo subnetting! Mucho éxito en tu formación. 🤓**

---

**Última actualización:** Julio 2026 | **Versión:** 1.0 | **Estado:** ✅ Funcional y actualizado
