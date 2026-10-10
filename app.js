// ==============================================================================
// ASISTENTE DE GEOGRAFÍA INTERACTIVA (3º ESO) - CÓDIGO FUENTE COMPLETO (app.js)
// Arquitectura Modular Multimapa (España, Europa y Mapamundi)
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. VARIABLES DE ESTADO GLOBAL DE LA APLICACIÓN
// ------------------------------------------------------------------------------
let mapaActivo = "espana";           // "espana" | "europa" | "mundo"
let temaActivo = "politico";         // "politico" | "fisico"
let capaActiva = "provincias";       // "provincias" | "comunidades"
let filtroFisicoActivo = "todos";    // "todos" | "rios" | "relieve" | "mares"
let modoJuego = "explorar";          // "explorar" | "cuestionario"

const TOTAL_PREGUNTAS_RONDA = 10;   
let numeroPreguntaActual = 0;      
let provinciaObjetivo = "";          
let mazoPreguntasPendientes = [];    
let intentosUsados = 0;              
let bloqueoInteraccion = false;      

let aciertosPrimera = 0;             
let aciertosSegunda = 0;             

// ------------------------------------------------------------------------------
// 2. CATÁLOGOS DE DATOS Y DICCIONARIOS GEOGRÁFICOS
// ------------------------------------------------------------------------------

// Catálogo España
const provinciaCatalogo = [
  "Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla",
  "Huesca", "Teruel", "Zaragoza", "Asturias", "Baleares", "Las Palmas", "Santa Cruz de Tenerife",
  "Cantabria", "Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo",
  "Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora",
  "Barcelona", "Girona", "Lleida", "Tarragona", "Alicante", "Castellón", "Valencia",
  "Badajoz", "Cáceres", "A Coruña", "Lugo", "Ourense", "Pontevedra",
  "Madrid", "Murcia", "Navarra", "Álava", "Bizkaia", "Gipuzkoa", "La Rioja",
  "Ceuta", "Melilla"
];

const riosCatalogo = [
  "Miño", "Duero", "Tajo", "Guadiana", "Guadalquivir", "Ebro", "Júcar", "Segura"
];

const relieveCatalogo = [
  "Cordillera Cantábrica", "Pirineos", "Sistema Ibérico",
  "Sistema Central", "Sierra Morena", "Cordilleras Béticas"
];

const islasCatalogo = [
  "Mallorca", "Menorca", "Ibiza", "Formentera",
  "Tenerife", "Gran Canaria", "Lanzarote", "Fuerteventura", "La Palma", "La Gomera", "El Hierro"
];

const diccionarioIslas = {
  "Mallorca": "Baleares", "Menorca": "Baleares", "Ibiza": "Baleares", "Formentera": "Baleares",
  "Tenerife": "Santa Cruz de Tenerife", "La Palma": "Santa Cruz de Tenerife", 
  "La Gomera": "Santa Cruz de Tenerife", "El Hierro": "Santa Cruz de Tenerife",
  "Gran Canaria": "Las Palmas", "Fuerteventura": "Las Palmas", "Lanzarote": "Las Palmas"
};

const mapaComunidades = {
  "Andalucía": { color: "#c6f6d5", provincias: ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"] },
  "Aragón": { color: "#fefcbf", provincias: ["Huesca", "Teruel", "Zaragoza"] },
  "Asturias": { color: "#bee3f8", provincias: ["Asturias"] },
  "Baleares": { color: "#e9d8fd", provincias: ["Baleares", "Mallorca", "Menorca", "Ibiza", "Formentera"] },
  "Canarias": { color: "#feebc8", provincias: ["Las Palmas", "Santa Cruz de Tenerife", "Tenerife", "Gran Canaria", "Lanzarote", "Fuerteventura", "La Palma", "La Gomera", "El Hierro"] },
  "Cantabria": { color: "#e2e8f0", provincias: ["Cantabria"] },
  "Castilla-La Mancha": { color: "#fed7d7", provincias: ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"] },
  "Castilla y León": { color: "#feebc8", provincias: ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"] },
  "Cataluña": { color: "#b2f5ea", provincias: ["Barcelona", "Girona", "Lleida", "Tarragona"] },
  "Comunitat Valenciana": { color: "#c6f6d5", provincias: ["Alicante", "Castellón", "Valencia"] },
  "Extremadura": { color: "#e9d8fd", provincias: ["Badajoz", "Cáceres"] },
  "Galicia": { color: "#bee3f8", provincias: ["A Coruña", "Lugo", "Ourense", "Pontevedra"] },
  "Madrid": { color: "#feb2b2", provincias: ["Madrid"] },
  "Murcia": { color: "#fefcbf", provincias: ["Murcia"] },
  "Navarra": { color: "#e2e8f0", provincias: ["Navarra"] },
  "País Vasco": { color: "#b2f5ea", provincias: ["Álava", "Bizkaia", "Gipuzkoa"] },
  "La Rioja": { color: "#fed7d7", provincias: ["La Rioja"] },
  "Ceuta y Melilla": { color: "#e2e8f0", provincias: ["Ceuta", "Melilla"] }
};

const diccionarioInversoComunidades = {};
Object.keys(mapaComunidades).forEach(nombreCA => {
  mapaComunidades[nombreCA].provincias.forEach(prov => {
    diccionarioInversoComunidades[prov] = nombreCA;
  });
});
// Asegurar mapeo directo de las islas hacia su CA a través del diccionario de islas
for (let isla in diccionarioIslas) {
  let provPadre = diccionarioIslas[isla];
  if (diccionarioInversoComunidades[provPadre]) {
    diccionarioInversoComunidades[isla] = diccionarioInversoComunidades[provPadre];
  }
}

// Catálogo Europa
const europaRios = [
  "Loira", "Támesis", "Po", "Rin", "Elba", "Vístula", "Danubio", "Volga"
];

const europaRelieve = [
  "Pirineos", "Alpes", "Apeninos", "Montes Escandinavos", "Balcanes", "Cárpatos", "Cáucaso", "Urales",
  "Gran Llanura Europea", "Anatolia", "Depresión del Caspio"
];

const europaMaresCostas = [
  "Océano Glacial Ártico", "Océano Atlántico", "Mar Mediterráneo", "Mar Báltico", "Mar del Norte",
  "Mar Cantábrico", "Mar Tirreno", "Mar Adriático", "Mar Jónico", "Mar Egeo", "Mar Negro", "Mar Caspio",
  "Estrecho de Gibraltar", "Islandia", "Irlanda", "Gran Bretaña", "Islas Baleares", "Córcega",
  "Cerdeña", "Sicilia", "Chipre", "Península Ibérica", "Península Itálica", "Península Balcánica",
  "Crimea", "Jutlandia", "Escandinavia"
];

// Catálogo Mapamundi
const mapamundiContinentesMares = [
  "África", "América", "Antártida", "Asia", "Europa", "Oceanía",
  "Atlántico", "Glacial Ártico", "Glacial Antártico", "Índico", "Pacífico", "Mediterráneo"
];

const mapamundiIslas = [
  "Groenlandia", "Australia", "Nueva Zelanda", "Japón", "Madagascar", "Tierra del Fuego"
];

const mapamundiRelieve = [
  "Montañas Rocosas", "Atlas", "Himalaya", "Andes", "Rift Valley"
];

const mapamundiRios = [
  "Misisipi", "Nilo", "Congo", "Amazonas", "Níger", "Río Amarillo"
];

const mapamundiOtros = [
  "Desierto del Sahara", "Siberia"
];

// ------------------------------------------------------------------------------
// 3. CAPTURA DINÁMICA DE ELEMENTOS DEL DOM
// ------------------------------------------------------------------------------
function getDOM() {
  return {
    textoReto: document.getElementById("texto-reto") || document.querySelector(".texto-reto"),
    marcadorPuntos: document.getElementById("marcador-puntos") || document.getElementById("puntuacion"),
    marcadorInferior: document.getElementById("marcador-inferior") || document.getElementById("contador-aciertos") || document.querySelector(".marcador-inferior"),
    indicadorPregunta: document.getElementById("indicador-pregunta") || document.getElementById("contador-preguntas"),
    
    // Botones de Selector de Mapa
    btnMapaEspana: document.getElementById("btn-mapa-espana"),
    btnMapaEuropa: document.getElementById("btn-mapa-europa"),
    btnMapaMundo: document.getElementById("btn-mapa-mundo"),
    
    // Botones de Tema y Modo
    btnTemaPolitico: document.getElementById("btn-tema-politico"),
    btnTemaFisico: document.getElementById("btn-tema-fisico"),
    btnModoExplorar: document.getElementById("btn-modo-explorar"),
    btnModoCuestionario: document.getElementById("btn-modo-cuestionario"),
    
    // Capas de España
    btnCapaComunidades: document.getElementById("btn-capa-comunidades"),
    btnCapaProvincias: document.getElementById("btn-capa-provincias"),
    
    // Filtros Físicos
    btnFisicoTodos: document.getElementById("btn-fisico-todos"),
    btnFisicoRios: document.getElementById("btn-fisico-rios"),
    btnFisicoRelieve: document.getElementById("btn-fisico-relieve"),
    btnFisicoMares: document.getElementById("btn-fisico-mares"),
    
    // Grupos de Controles
    grupoCapasPoliticas: document.getElementById("grupo-capas-politicas"),
    grupoCapasFisicas: document.getElementById("grupo-capas-fisicas"),
    
    // Lienzos SVG
    mapaEspanaSVG: document.getElementById("mapa-svg") || document.getElementById("mapa-espana-svg"),
    mapaEuropaSVG: document.getElementById("mapa-europa-svg"),
    mapaMundoSVG: document.getElementById("mapa-mundo-svg"),
    
    capaProvincias: document.getElementById("capa-provincias"),
    capaFisico: document.getElementById("capa-fisico"),
    capaRios: document.getElementById("capa-rios"),
    capaRelieve: document.getElementById("capa-relieve"),
    contenedorMapa: document.getElementById("contenedor-visor-mapa")
  };
}

// ------------------------------------------------------------------------------
// 4. CONMUTACIÓN DE MAPAS (ESPAÑA / EUROPA / MAPAMUNDI)
// ------------------------------------------------------------------------------
function seleccionarMapa(nuevoMapa) {
  mapaActivo = nuevoMapa; // "espana" | "europa" | "mundo"
  const dom = getDOM();

  // Estado activo en los botones de selección
  if (dom.btnMapaEspana) dom.btnMapaEspana.classList.toggle("activo", mapaActivo === "espana");
  if (dom.btnMapaEuropa) dom.btnMapaEuropa.classList.toggle("activo", mapaActivo === "europa");
  if (dom.btnMapaMundo) dom.btnMapaMundo.classList.toggle("activo", mapaActivo === "mundo");

  // Mostrar / Ocultar SVGs
  if (dom.mapaEspanaSVG) dom.mapaEspanaSVG.style.display = (mapaActivo === "espana") ? "block" : "none";
  if (dom.mapaEuropaSVG) dom.mapaEuropaSVG.style.display = (mapaActivo === "europa") ? "block" : "none";
  if (dom.mapaMundoSVG) dom.mapaMundoSVG.style.display = (mapaActivo === "mundo") ? "block" : "none";

  if (mapaActivo === "espana") {
    if (dom.grupoCapasPoliticas) dom.grupoCapasPoliticas.style.display = (temaActivo === "politico") ? "flex" : "none";
    cambiarTemaGlobal(temaActivo || "politico");
  } else {
    // Europa y Mapamundi son principalmente físicos/geográficos en este módulo
    if (dom.grupoCapasPoliticas) dom.grupoCapasPoliticas.style.display = "none";
    if (dom.grupoCapasFisicas) dom.grupoCapasFisicas.style.display = "flex";

    if (dom.textoReto) {
      let nombreMapaText = (mapaActivo === "europa") ? "Europa Físico" : "Mapamundi";
      dom.textoReto.textContent = "🌍 MAPA: " + nombreMapaText + ". Selecciona el modo Explorar o Cuestionario.";
      dom.textoReto.className = "";
    }

    inicializarMapaSIG();
    iniciarNuevoCuestionario();
  }
}

// ------------------------------------------------------------------------------
// 5. FUNCIONES DE LIMPIEZA Y PINTADO VISUAL DEL MAPA
// ------------------------------------------------------------------------------
function limpiarColoresMapa() {
  // 1. Limpiar capas políticas GeoJSON
  if (capaGeoJsonActual) {
    capaGeoJsonActual.eachLayer(layer => {
      layer.options.isAcierto = false;
      if (layer && typeof layer.setStyle === 'function') {
        capaGeoJsonActual.resetStyle(layer);
      }
    });
  }

  // 2. Limpiar capas físicas de España (Seguro para markers y líneas)
  for (let nombre in capasFisicasPorNombre) {
    let layer = capasFisicasPorNombre[nombre];
    if (layer && typeof layer.setStyle === 'function') {
      if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        layer.setStyle({ color: '#2b6cb0', weight: 5, opacity: 0.85 });
      } else {
        layer.setStyle({ fillColor: '#b7791f', color: '#78350f', fillOpacity: 0.65, weight: 1.5 });
      }
    }
  }

  // 3. Limpiar capas físicas de Europa (Protegido por si son L.marker)
  for (let nombre in capasEuropaFisicasPorNombre) {
    let layer = capasEuropaFisicasPorNombre[nombre];
    if (layer && typeof layer.setStyle === 'function') {
      layer.setStyle({ color: '#2b6cb0', weight: 4 });
    }
  }

  // 4. Limpiar capas físicas del Mapamundi (Protegido por si son L.marker)
  for (let nombre in capasMundoFisicasPorNombre) {
    let layer = capasMundoFisicasPorNombre[nombre];
    if (layer && typeof layer.setStyle === 'function') {
      layer.setStyle({ color: '#2b6cb0', weight: 4 });
    }
  }
}

// ------------------------------------------------------------------------------
// 6. CONTROL DE TEMAS Y FILTROS (ACTUALIZADO PARA MOTOR SIG LEAFLET)
// ------------------------------------------------------------------------------
function cambiarTemaGlobal(nuevoTema) {
  temaActivo = nuevoTema; // "politico" | "fisico"
  const dom = getDOM();

  if (mapaActivo !== "espana") return;

  if (temaActivo === "politico") {
    if (dom.btnTemaPolitico) dom.btnTemaPolitico.classList.add("activo");
    if (dom.btnTemaFisico) dom.btnTemaFisico.classList.remove("activo");

    if (dom.grupoCapasPoliticas) dom.grupoCapasPoliticas.style.display = "flex";
    if (dom.grupoCapasFisicas) dom.grupoCapasFisicas.style.display = "none";

    if (dom.textoReto) {
      dom.textoReto.textContent = "🗺️ TEMA: España Político. Selecciona el modo Explorar o Cuestionario.";
      dom.textoReto.className = "";
    }

  } else if (temaActivo === "fisico") {
    if (dom.btnTemaFisico) dom.btnTemaFisico.classList.add("activo");
    if (dom.btnTemaPolitico) dom.btnTemaPolitico.classList.remove("activo");

    if (dom.textoReto) {
      dom.textoReto.textContent = "🏔️ TEMA: España Físico. Selecciona el modo Explorar o Cuestionario.";
      dom.textoReto.className = "";
    }
  }

  bloqueoInteraccion = false;
  intentosUsados = 0;
  
  // LLAMADA CRUCIAL AL MOTOR SIG: Destruye el mapa anterior y carga el nuevo (Político o Físico)
  inicializarMapaSIG();
}

function aplicarFiltroFisico(filtro) {
  filtroFisicoActivo = filtro; // "todos" | "rios" | "relieve"
  const dom = getDOM();

  // Actualiza los estados visuales activos de los botones físicos
  if (dom.btnFisicoTodos) dom.btnFisicoTodos.classList.toggle("activo", filtro === "todos");
  if (dom.btnFisicoRios) dom.btnFisicoRios.classList.toggle("activo", filtro === "rios");
  if (dom.btnFisicoRelieve) dom.btnFisicoRelieve.classList.toggle("activo", filtro === "relieve");
  if (dom.btnFisicoMares) dom.btnFisicoMares.classList.toggle("activo", filtro === "mares");

  // Si nos encontramos visualmente en el mapa de España Físico, redibuja al instante aplicando el filtro
  if (mapaActivo === "espana" && temaActivo === "fisico") {
    cargarCapasFisicasEspana();
  } else {
    iniciarNuevoCuestionario();
  }
}

function aplicarFiltroFisico(filtro) {
  filtroFisicoActivo = filtro;
  const dom = getDOM();

  if (dom.btnFisicoTodos) dom.btnFisicoTodos.classList.toggle("activo", filtro === "todos");
  if (dom.btnFisicoRios) dom.btnFisicoRios.classList.toggle("activo", filtro === "rios");
  if (dom.btnFisicoRelieve) dom.btnFisicoRelieve.classList.toggle("activo", filtro === "relieve");
  if (dom.btnFisicoMares) dom.btnFisicoMares.classList.toggle("activo", filtro === "mares");

  iniciarNuevoCuestionario();
}

// ------------------------------------------------------------------------------
// 7. GESTIÓN DEL MODO DE JUEGO Y OCULTAMIENTO DE RÓTULOS
// ------------------------------------------------------------------------------
function cambiarModoJuego(nuevoModo) {
  modoJuego = nuevoModo; // "explorar" | "cuestionario"
  const dom = getDOM();

  if (modoJuego === "explorar") {
    if (dom.btnModoExplorar) dom.btnModoExplorar.classList.add("activo");
    if (dom.btnModoCuestionario) dom.btnModoCuestionario.classList.remove("activo");

    // RETIRA LA CLASE DE OCULTAMIENTO: los nombres se ven en Explorar
    if (dom.contenedorMapa) dom.contenedorMapa.classList.remove("modo-cuestionario-activo");
    document.body.classList.remove("modo-cuestionario-activo");

    bloqueoInteraccion = false;
    limpiarColoresMapa();
    if (dom.textoReto) {
      dom.textoReto.textContent = "🔍 MODO EXPLORAR: Toca cualquier elemento en el mapa para descubrir su nombre.";
      dom.textoReto.className = "";
    }
  } else if (modoJuego === "cuestionario") {
    if (dom.btnModoCuestionario) dom.btnModoCuestionario.classList.add("activo");
    if (dom.btnModoExplorar) dom.btnModoExplorar.classList.remove("activo");

    // APLICA LA CLASE DE OCULTAMIENTO: los nombres se ocultan en Examen
    if (dom.contenedorMapa) dom.contenedorMapa.classList.add("modo-cuestionario-activo");
    document.body.classList.add("modo-cuestionario-activo");

    aciertosPrimera = 0;
    aciertosSegunda = 0;
    actualizarMarcadorEnPantalla();
    iniciarNuevoCuestionario();
  }
}

function normalizarTextoGeografico(texto) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD") // Separa las tildes de las letras
    .replace(/[\u0300-\u036f]/g, "") // Elimina las tildes
    .trim();
}

// ------------------------------------------------------------------------------
// 8. GENERADOR DE CUESTIONARIO ADAPTATIVO POR MAPA
// ------------------------------------------------------------------------------
function iniciarNuevoCuestionario() {
  let catalogoBase = [];

  if (mapaActivo === "espana") {
    if (temaActivo === "politico") {
      if (capaActiva === "comunidades") {
        // Obtenemos las claves (nombres) de las comunidades
        catalogoBase = Object.keys(mapaComunidades);
      } else {
        // Usamos el catálogo de provincias (que son strings)
        catalogoBase = [...provinciaCatalogo];
      }
    } else {
      // 🌟 SOLUCIÓN ESPAÑA FÍSICO: Extraemos puramente los nombres (strings) del mapa físico actual
      catalogoBase = Object.keys(capasFisicasPorNombre);
    }
  } else if (mapaActivo === "europa") {
    if (filtroFisicoActivo === "rios") catalogoBase = [...europaRios];
    else if (filtroFisicoActivo === "relieve") catalogoBase = [...europaRelieve];
    else if (filtroFisicoActivo === "mares") catalogoBase = [...europaMaresCostas];
    else catalogoBase = [...europaRios, ...europaRelieve, ...europaMaresCostas];
  } else if (mapaActivo === "mundo") {
    if (filtroFisicoActivo === "rios") {
      catalogoBase = [...mapamundiRios];
    } else if (filtroFisicoActivo === "relieve") {
      catalogoBase = [...mapamundiRelieve, ...mapamundiOtros];
    } else if (filtroFisicoActivo === "mares") {
      catalogoBase = [...mapamundiContinentesMares, ...mapamundiIslas];
    } else {
      catalogoBase = [
        ...mapamundiContinentesMares,
        ...mapamundiIslas,
        ...mapamundiRelieve,
        ...mapamundiRios,
        ...mapamundiOtros
      ];
    }
  }

  // Barajamos y cortamos la ronda asegurando que sean cadenas de texto puras
  const mazoBarajado = [...catalogoBase].sort(() => Math.random() - 0.5);
  mazoPreguntasPendientes = mazoBarajado.slice(0, TOTAL_PREGUNTAS_RONDA);

  intentosUsados = 0;
  numeroPreguntaActual = 0;
  aciertosPrimera = 0;
  aciertosSegunda = 0;
  bloqueoInterinteraction = false; // (o bloqueoInteraccion segun tu variable original)

  actualizarMarcadorEnPantalla();

  if (modoJuego === "cuestionario") {
    prepararSiguientePregunta();
  }
}

function prepararSiguientePregunta() {
  limpiarColoresMapa();

  bloqueoInteraccion = false;
  intentosUsados = 0;

  if (!mazoPreguntasPendientes || mazoPreguntasPendientes.length === 0) {
    finalizarSesionCuestionario();
    return;
  }

  numeroPreguntaActual++;
  provinciaObjetivo = mazoPreguntasPendientes.pop(); // Extraemos el elemento del mazo

  actualizarMarcadorEnPantalla();

  const dom = getDOM();
  if (dom.textoReto) {
    let prefijoMapa = (mapaActivo === "europa") ? "🇪🇺 EUROPA" : ((mapaActivo === "mundo") ? "🌍 MAPAMUNDI" : "🇪🇸 ESPAÑA");
    
    // Determinamos el texto descriptivo según el mapa y el tema activo
    let tipoPreguntaTexto = "la provincia";
    
    if (mapaActivo === "espana") {
      if (temaActivo === "politico") {
        if (capaActiva === "comunidades") {
          tipoPreguntaTexto = "la Comunidad Autónoma";
        } else {
          tipoPreguntaTexto = "la provincia";
        }
      } else {
        // Tema físico en España: distinguimos si es río o relieve basándonos en si está en el diccionario de ríos o usando un emoji adecuado
        tipoPreguntaTexto = "el elemento físico (río o relieve)";
      }
    } else {
      tipoPreguntaTexto = "el elemento geográfico";
    }
    
    dom.textoReto.textContent = "🎯 " + prefijoMapa + " (" + numeroPreguntaActual + "/" + TOTAL_PREGUNTAS_RONDA + "): Localiza " + tipoPreguntaTexto + ": " + provinciaObjetivo;
    dom.textoReto.className = "";
  }
}

function procesarRespuestaAlumno(elementoPulsado) {
  const dom = getDOM();

  // 1. MODO EXPLORAR
  if (modoJuego === "explorar") {
    if (dom.textoReto) {
      let mensajeExploracion = "📍 Has seleccionado: " + elementoPulsado;
      
      if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades") {
        let comunidadAsociada = diccionarioInversoComunidades[elementoPulsado] || diccionarioInversoComunidades[diccionarioIslas[elementoPulsado]];
        if (comunidadAsociada) {
          mensajeExploracion = "📍 Comunidad Autónoma: <strong>" + comunidadAsociada + "</strong> (Zona: " + elementoPulsado + ")";
          
          limpiarColoresMapa();
          if (mapaComunidades[comunidadAsociada]) {
            mapaComunidades[comunidadAsociada].provincias.forEach(p => {
              let el = document.getElementById(p);
              if (el) {
                el.style.setProperty("fill", "#63b3ed", "important");
                el.style.setProperty("stroke", "#2b6cb0", "important");
              }
            });
          }
        }
      }
      dom.textoReto.innerHTML = mensajeExploracion;
    }
    return;
  }

  if (bloqueoInteraccion) return;

  // 2. MODO CUESTIONARIO: Evaluación de acierto
  let esAcierto = false;

  if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades") {
    let comunidadDelPulsado = diccionarioInversoComunidades[elementoPulsado] || diccionarioInversoComunidades[diccionarioIslas[elementoPulsado]];
    esAcierto = (comunidadDelPulsado === provinciaObjetivo);
  } else {
    esAcierto = (elementoPulsado === provinciaObjetivo) || (diccionarioIslas[elementoPulsado] === provinciaObjetivo);
  }

  const elementoGrafico = document.getElementById(elementoPulsado);

  // A) CASO ACIERTO
  if (esAcierto) {
    let elementosAIluminar = [];

    if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades" && mapaComunidades[provinciaObjetivo]) {
      mapaComunidades[provinciaObjetivo].provincias.forEach(p => {
        let el = document.getElementById(p);
        if (el) elementosAIluminar.push(el);
      });
    } else {
      let provInsular = diccionarioIslas[provinciaObjetivo] || provinciaObjetivo;
      for (let isla in diccionarioIslas) {
        if (diccionarioIslas[isla] === provInsular) {
          let el = document.getElementById(isla);
          if (el) elementosAIluminar.push(el);
        }
      }
    }

    if (elementoGrafico && !elementosAIluminar.includes(elementoGrafico)) {
      elementosAIluminar.push(elementoGrafico);
    }

    elementosAIluminar.forEach(el => {
      if (el) {
        el.classList.add("estado-acierto");
        el.style.setProperty("fill", "#48bb78", "important");
        el.style.setProperty("stroke", "#22543d", "important");
      }
    });

    if (intentosUsados === 0) {
      aciertosPrimera++;
      if (dom.textoReto) dom.textoReto.textContent = "🌟 ¡Excelente! Has acertado a la primera: " + provinciaObjetivo;
    } else {
      aciertosSegunda++;
      if (dom.textoReto) dom.textoReto.textContent = "👏 ¡Bien hecho! Has localizado " + provinciaObjetivo + " en tu segundo intento.";
    }

    if (dom.textoReto) dom.textoReto.className = "texto-acierto";
    bloqueoInteraccion = true;
    actualizarMarcadorEnPantalla();
    setTimeout(prepararSiguientePregunta, 1500);

  // B) CASO PRIMER ERROR (NARANJA)
  } else if (intentosUsados === 0) {
    intentosUsados = 1;
    if (elementoGrafico) {
      elementoGrafico.classList.add("estado-advertencia");
      elementoGrafico.style.setProperty("fill", "#ed8936", "important");
      elementoGrafico.style.setProperty("stroke", "#7b341e", "important");
    }

    if (dom.textoReto) {
      let nombrePulsadoLegible = diccionarioInversoComunidades[elementoPulsado] || elementoPulsado;
      dom.textoReto.textContent = "💡 PISTA: Has pulsado en " + nombrePulsadoLegible + ", pero el objetivo es localizar la Comunidad Autónoma: " + provinciaObjetivo + ".";
      dom.textoReto.className = "texto-pista";
    }

  // C) CASO SEGUNDO ERROR (ROJO + REVELAR VERDE Y AVANZAR)
  } else if (intentosUsados === 1) {
    intentosUsados = 2;
    if (elementoGrafico) {
      elementoGrafico.classList.add("estado-error");
      elementoGrafico.style.setProperty("fill", "#e53e3e", "important");
      elementoGrafico.style.setProperty("stroke", "#742a2a", "important");
    }

    let elementosARevelar = [];
    if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades" && mapaComunidades[provinciaObjetivo]) {
      mapaComunidades[provinciaObjetivo].provincias.forEach(p => {
        let el = document.getElementById(p);
        if (el) elementosARevelar.push(el);
      });
    }

    elementosARevelar.forEach(el => {
      if (el) {
        el.classList.add("estado-acierto");
        el.style.setProperty("fill", "#38a169", "important");
        el.style.setProperty("stroke", "#1c4532", "important");
      }
    });

    if (dom.textoReto) {
      dom.textoReto.textContent = "❌ Agotaste los 2 intentos. La Comunidad correcta era " + provinciaObjetivo + ".";
      dom.textoReto.className = "texto-error";
    }

    bloqueoInteraccion = true;
    actualizarMarcadorEnPantalla();
    // AQUÍ ESTABA EL BLOQUEO: Al agotar los 2 intentos pasará a la siguiente pregunta tras 2.2 segundos de forma idéntica al resto de mapas
    setTimeout(prepararSiguientePregunta, 2200);
  }
}

function finalizarSesionCuestionario() {
  bloqueoInteraccion = true;
  const dom = getDOM();
  let puntosTotales = (aciertosPrimera * 1) + (aciertosSegunda * 0.5);
  let porcentaje = Math.round((puntosTotales / TOTAL_PREGUNTAS_RONDA) * 100);

  let mensajeValoracion = "";
  if (porcentaje >= 90) mensajeValoracion = "🏆 ¡Sobresaliente! Dominas este mapa a la perfección.";
  else if (porcentaje >= 70) mensajeValoracion = "👏 ¡Muy bien! Tienes un gran conocimiento geográfico.";
  else if (porcentaje >= 50) mensajeValoracion = "👍 ¡Aprobado! Buen trabajo, sigue practicando.";
  else mensajeValoracion = "💪 ¡Ánimo! Repasa en el modo Explorar y vuelve a intentarlo.";

  if (dom.textoReto) {
    dom.textoReto.innerHTML = 
      "<strong>" + mensajeValoracion + "</strong><br>" +
      "Puntuación final: <strong>" + puntosTotales + " / " + TOTAL_PREGUNTAS_RONDA + " pts</strong> (" + porcentaje + "%) " +
      "<button id='btn-reiniciar-partida' onclick='iniciarNuevoCuestionario()' style='margin-left:12px; padding:6px 14px; background:#2b6cb0; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;'>🔄 Jugar otra ronda</button>";
    dom.textoReto.className = "texto-acierto";
  }

  actualizarMarcadorEnPantalla();
}

// ------------------------------------------------------------------------------
// 9. CEREBRO DE EVALUACIÓN Y PISTAS CONTEXTUALES
// ------------------------------------------------------------------------------
function obtenerPistaInteligente(elementoPulsado, elementoBuscado) {
  let tipoPulsado = "un elemento";
  let tipoBuscado = "un elemento";

  if (riosCatalogo.includes(elementoPulsado) || europaRios.includes(elementoPulsado) || mapamundiRios.includes(elementoPulsado)) tipoPulsado = "un río";
  else if (relieveCatalogo.includes(elementoPulsado) || europaRelieve.includes(elementoPulsado) || mapamundiRelieve.includes(elementoPulsado)) tipoPulsado = "un relieve/montaña";
  else if (islasCatalogo.includes(elementoPulsado) || europaMaresCostas.includes(elementoPulsado)) tipoPulsado = "una isla/mar/península";
  else if (provinciaCatalogo.includes(elementoPulsado)) tipoPulsado = "una provincia";
  else if (mapamundiContinentes.includes(elementoPulsado)) tipoPulsado = "un continente";

  if (riosCatalogo.includes(elementoBuscado) || europaRios.includes(elementoBuscado) || mapamundiRios.includes(elementoBuscado)) tipoBuscado = "un río";
  else if (relieveCatalogo.includes(elementoBuscado) || europaRelieve.includes(elementoBuscado) || mapamundiRelieve.includes(elementoBuscado)) tipoBuscado = "un relieve/montaña";
  else if (islasCatalogo.includes(elementoBuscado) || europaMaresCostas.includes(elementoBuscado)) tipoBuscado = "una isla/mar/península";
  else if (provinciaCatalogo.includes(elementoBuscado)) tipoBuscado = "una provincia";
  else if (mapamundiContinentes.includes(elementoBuscado)) tipoBuscado = "un continente";

  if (tipoPulsado !== tipoBuscado) {
    return "💡 PISTA: Has tocado " + elementoPulsado + " (" + tipoPulsado + "), pero estás buscando " + tipoBuscado + ": " + elementoBuscado + ".";
  } else {
    return "💡 PISTA: Has tocado " + elementoPulsado + ", que es " + tipoPulsado + " correcto, pero no es la ubicación de " + elementoBuscado + ".";
  }
}

function procesarRespuestaAlumno(elementoPulsado) {
  const dom = getDOM();

  // 1. MODO EXPLORAR
  if (modoJuego === "explorar") {
    if (dom.textoReto) {
      let mensajeExploracion = "📍 Has seleccionado: " + elementoPulsado;
      
      if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades") {
        let comunidadAsociada = diccionarioInversoComunidades[elementoPulsado] || diccionarioInversoComunidades[diccionarioIslas[elementoPulsado]];
        if (comunidadAsociada) {
          mensajeExploracion = "📍 Comunidad Autónoma: <strong>" + comunidadAsociada + "</strong> (Zona: " + elementoPulsado + ")";
          
          limpiarColoresMapa();
          if (mapaComunidades[comunidadAsociada]) {
            mapaComunidades[comunidadAsociada].provincias.forEach(p => {
              let layerProv = capasPorNombre[p];
              if (layerProv) {
                layerProv.setStyle({ fillColor: "#63b3ed", color: "#2b6cb0", fillOpacity: 0.85 });
              }
            });
          }
        }
      }
      dom.textoReto.innerHTML = mensajeExploracion;
    }
    return;
  }

  if (bloqueoInteraccion) return;

  // 2. MODO CUESTIONARIO: Evaluación de acierto
  let esAcierto = false;

  if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades") {
    let comunidadDelPulsado = diccionarioInversoComunidades[elementoPulsado] || diccionarioInversoComunidades[diccionarioIslas[elementoPulsado]];
    esAcierto = (comunidadDelPulsado === provinciaObjetivo);
  } else {
    esAcierto = (elementoPulsado === provinciaObjetivo) || (diccionarioIslas[elementoPulsado] === provinciaObjetivo);
  }

  const layerPulsado = capasPorNombre[elementoPulsado];

  // A) CASO ACIERTO
  if (esAcierto) {
    let elementosAIluminar = [];

    if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades" && mapaComunidades[provinciaObjetivo]) {
      mapaComunidades[provinciaObjetivo].provincias.forEach(p => {
        elementosAIluminar.push(p);
      });
    } else {
      let provInsular = diccionarioIslas[provinciaObjetivo] || provinciaObjetivo;
      for (let isla in diccionarioIslas) {
        if (diccionarioIslas[isla] === provInsular) {
          elementosAIluminar.push(isla);
        }
      }
      elementosAIluminar.push(provinciaObjetivo);
    }

    elementosAIluminar.forEach(nombre => {
      let l = capasPorNombre[nombre];
      if (l) {
        l.options.isAcierto = true;
        l.setStyle({ fillColor: "#48bb78", color: "#22543d", weight: 2, fillOpacity: 0.9 }); // Verde acierto
      }
    });

    if (intentosUsados === 0) {
      aciertosPrimera++;
      if (dom.textoReto) dom.textoReto.textContent = "🌟 ¡Excelente! Has acertado a la primera: " + provinciaObjetivo;
    } else {
      aciertosSegunda++;
      if (dom.textoReto) dom.textoReto.textContent = "👏 ¡Bien hecho! Has localizado " + provinciaObjetivo + " en tu segundo intento.";
    }

    if (dom.textoReto) dom.textoReto.className = "texto-acierto";
    bloqueoInteraccion = true;
    actualizarMarcadorEnPantalla();
    setTimeout(prepararSiguientePregunta, 1500);

  // B) CASO PRIMER ERROR (NARANJA - PISTA)
  } else if (intentosUsados === 0) {
    intentosUsados = 1;
    if (layerPulsado) {
      layerPulsado.setStyle({ fillColor: "#ed8936", color: "#7b341e", weight: 2, fillOpacity: 0.9 }); // Naranja advertencia
    }

    if (dom.textoReto) {
      let nombrePulsadoLegible = diccionarioInversoComunidades[elementoPulsado] || elementoPulsado;
      dom.textoReto.textContent = "💡 PISTA: Has pulsado en " + nombrePulsadoLegible + ", pero el objetivo es localizar: " + provinciaObjetivo + ".";
      dom.textoReto.className = "texto-pista";
    }

  // C) CASO SEGUNDO ERROR (ROJO + REVELAR VERDE)
  } else if (intentosUsados === 1) {
    intentosUsados = 2;
    if (layerPulsado) {
      layerPulsado.setStyle({ fillColor: "#e53e3e", color: "#742a2a", weight: 2, fillOpacity: 0.9 }); // Rojo error
    }

    // Revelar la respuesta correcta en verde
    let elementosARevelar = [];
    if (mapaActivo === "espana" && temaActivo === "politico" && capaActiva === "comunidades" && mapaComunidades[provinciaObjetivo]) {
      mapaComunidades[provinciaObjetivo].provincias.forEach(p => {
        elementosARevelar.push(p);
      });
    } else {
      elementosARevelar.push(provinciaObjetivo);
    }

    elementosARevelar.forEach(nombre => {
      let l = capasPorNombre[nombre];
      if (l) {
        l.options.isAcierto = true;
        l.setStyle({ fillColor: "#38a169", color: "#1c4532", weight: 2, fillOpacity: 0.9 });
      }
    });

    if (dom.textoReto) {
      dom.textoReto.textContent = "❌ Agotaste los 2 intentos. La respuesta correcta era: " + provinciaObjetivo + ".";
      dom.textoReto.className = "texto-error";
    }

    bloqueoInteraccion = true;
    actualizarMarcadorEnPantalla();
    setTimeout(prepararSiguientePregunta, 2200);
  }
}

// ------------------------------------------------------------------------------
// 10. DETECTOR MULTICANAL Y MARCADOR
// ------------------------------------------------------------------------------
function actualizarMarcadorEnPantalla() {
  let totalAciertos = aciertosPrimera + aciertosSegunda;
  let puntosTotales = (aciertosPrimera * 1) + (aciertosSegunda * 0.5);
  let numPreguntaDisplay = (numeroPreguntaActual > 0) ? numeroPreguntaActual : 1;

  // 1. ACTUALIZA EL NÚMERO DE ACIERTOS DENTRO DE <strong id="val-aciertos">
  const elValAciertos = document.getElementById("val-aciertos");
  if (elValAciertos) {
    elValAciertos.textContent = totalAciertos;
  }

  // 2. ACTUALIZA LOS PUNTOS DENTRO DE <strong id="val-puntos">
  const elValPuntos = document.getElementById("val-puntos");
  if (elValPuntos) {
    elValPuntos.textContent = puntosTotales;
  }

  // 3. ACTUALIZA EL NÚMERO DE PREGUNTA SI TIENES <strong id="val-pregunta"> O SIMILAR
  const elValPregunta = document.getElementById("val-pregunta") || document.getElementById("indicador-pregunta");
  if (elValPregunta) {
    elValPregunta.textContent = numPreguntaDisplay;
  }
}

// ------------------------------------------------------------------------------
// 11. FUNCIONES AUXILIARES DE PINTADO Y RESTAURACIÓN POLÍTICA
// ------------------------------------------------------------------------------

function restaurarMapaProvincias() {
  // Restaura el aspecto estándar de todas las provincias en el SVG de España
  const provincias = document.querySelectorAll("#capa-provincias path, #capa-provincias rect");
  provincias.forEach(el => {
    el.style.removeProperty("fill");
    el.style.removeProperty("stroke");
    el.style.removeProperty("stroke-width");
    el.classList.remove("estado-acierto", "estado-advertencia", "estado-error");
  });
}

function pintarMapaPorComunidades() {
  // Limpia primero y aplica un color o estilo diferenciado por comunidad si se desea
  restaurarMapaProvincias();
  
  // Opcional: si quieres que las fronteras de comunidad resalten visualmente
  const contenedor = document.getElementById("contenedor-visor-mapa") || document.getElementById("escenario-mapa");
  if (contenedor) {
    contenedor.classList.add("modo-comunidades");
  }
}

// ==============================================================================
// 4. SISTEMA DE MAPA SIG (LEAFLET) - GESTIÓN DE MAPAS Y CARGA GEOJSON
// ==============================================================================

// Declaración única global de variables SIG (Asegúrate de que no se repitan arriba)
if (typeof mapaSIG === 'undefined') {
  var mapaSIG = null;
  var capaGeoJsonActual = null;
  var capasPorNombre = {};
}

function inicializarMapaSIG() {
  const contenedorMapa = document.getElementById("mapa-sig");
  if (!contenedorMapa) return;

  // Definir coordenadas y zoom según el mapa activo
  let centroLatLon = [40.4168, -3.7038]; // Coordenadas de España
  let nivelZoom = 6;                    // Zoom detallado para España

  if (mapaActivo === "europa") {
    centroLatLon = [51.00, 10.00];     // Centro geográfico de Europa
    nivelZoom = 3.5;                      // Zoom general para ver todo el continente
  } else if (mapaActivo === "mundo") {
    centroLatLon = [20.00, 0.00];       // Centro global del Mapamundi
    nivelZoom = 2;                      // Zoom mundial
  }

  // Si el mapa ya existe, re-centramos y actualizamos tamaño en lugar de destruirlo
  if (mapaSIG) {
    mapaSIG.setView(centroLatLon, nivelZoom);
    mapaSIG.invalidateSize();
  } else {
    // Si no existe, lo creamos por primera vez
    mapaSIG = L.map('mapa-sig', {
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: true, // Permitir zoom con la rueda del ratón para mayor comodidad
      doubleClickZoom: false
    }).setView(centroLatLon, nivelZoom);
    }

  // CORRECCIÓN DE LA URL DE TILELAYER (adiós al error de {png})
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  }).addTo(mapaSIG);

  cargarCapasSegunEstado();
  // Forzar un refresco de dimensiones de Leaflet tras el redibujado
  setTimeout(() => {
    if (mapaSIG) {
      mapaSIG.invalidateSize();
      mapaSIG.setView(centroLatLon, nivelZoom);
    }
  }, 150);
}

// ==============================================================================
// 12. GESTIÓN DEL MAPA FÍSICO DE ESPAÑA (Líneas de Ríos y Polígonos de Relieve)
// ==============================================================================

// Almacén temporal para las entidades físicas de Leaflet
let capasFisicasPorNombre = {};
let grupoCapasFisicasLeaflet = null;
let grupoCapasEuropaLeaflet = null;        
let capasEuropaFisicasPorNombre = {};
let grupoCapasMundoLeaflet = null;
let capasMundoFisicasPorNombre = {};

function cargarCapasFisicasEspana() {
  if (!mapaSIG) return;

  if (grupoCapasFisicasLeaflet) {
    mapaSIG.removeLayer(grupoCapasFisicasLeaflet);
    grupoCapasFisicasLeaflet = null;
    capasFisicasPorNombre = {};
  }

  grupoCapasFisicasLeaflet = L.layerGroup().addTo(mapaSIG);

  const espanaFisicaPuntos = {
    // --- RÍOS DE ESPAÑA (Catálogo Completo) ---
    "Miño": [42.30, -8.00],
    "Eo": [43.50, -7.03],
    "Navia": [43.54, -6.72],
    "Nalón": [43.56, -6.04],
    "Nervión": [43.26, -2.93],
    "Bidasoa": [43.33, -1.78],
    "Ter": [42.00, 2.82],
    "Llobregat": [41.32, 2.13],
    "Ebro": [41.65, -0.88],
    "Turia": [39.46, -0.33],
    "Júcar": [39.30, -0.32],
    "Segura": [38.08, -0.68],
    "Almanzora": [37.32, -1.82],
    "Guadalhorce": [36.67, -4.45],
    "Guadalete": [36.60, -6.23],
    "Guadalquivir": [37.38, -5.98],
    "Tinto": [37.22, -6.92],
    "Odiel": [37.26, -6.95],
    "Guadiana": [38.88, -6.97],
    "Tajo": [39.85, -4.02],
    "Duero": [41.50, -4.72],

    // --- RELIEVE / CORDILLERAS ---
    "Cordillera Cantábrica": [43.10, -5.00],
    "Pirineos": [42.60, 0.80],
    "Sistema Ibérico": [40.80, -2.00],
    "Sistema Central": [40.50, -4.50],
    "Sierra Morena": [38.30, -4.20],
    "Cordilleras Béticas": [37.50, -3.20]
  };

  for (let nombreElemento in espanaFisicaPuntos) {
    let esRio = nombreElemento.match(/Miño|Eo|Navia|Nalón|Nervión|Bidasoa|Ter|Llobregat|Ebro|Turia|Júcar|Segura|Almanzora|Guadalhorce|Guadalete|Guadalquivir|Tinto|Odiel|Guadiana|Tajo|Duero/);
    
    let clasePin = esRio ? "pin-educativo pin-rio" : "pin-educativo pin-relieve";
    let iconoSimbolo = esRio ? "💧" : "⛰️";

    let customIcon = L.divIcon({
      className: clasePin,
      html: `<span>${iconoSimbolo}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    let marker = L.marker(espanaFisicaPuntos[nombreElemento], { icon: customIcon });
    
    marker.on('click', () => {
      procesarRespuestaAlumno(nombreElemento);
    });

    grupoCapasFisicasLeaflet.addLayer(marker);
    capasFisicasPorNombre[nombreElemento] = marker;
  }

  iniciarNuevoCuestionario();
}

function cargarCapasEuropaFisicas() {
  if (!mapaSIG) return;

  if (grupoCapasEuropaLeaflet) {
    mapaSIG.removeLayer(grupoCapasEuropaLeaflet);
    grupoCapasEuropaLeaflet = null;
    capasEuropaFisicasPorNombre = {};
  }

  grupoCapasEuropaLeaflet = L.layerGroup().addTo(mapaSIG);

  // Coordenadas puntuales exactas (Latitud, Longitud) para cada elemento de Europa
  const europaPuntos = {
    // --- RÍOS ---
    "Loira": [47.28, -2.20],
    "Támesis": [51.50, -0.12],
    "Po": [45.00, 12.00],
    "Rin": [50.00, 8.20],
    "Elba": [53.50, 9.90],
    "Vístula": [53.00, 18.60],
    "Danubio": [45.20, 29.50],
    "Volga": [46.00, 48.00],

    // --- RELIEVE ---
    "Alpes": [46.50, 8.00],
    "Pirineos": [42.70, 0.80],
    "Apeninos": [42.50, 13.00],
    "Montes Escandinavos": [63.00, 13.00],
    "Balcanes": [43.00, 24.00],
    "Cárpatos": [49.00, 20.00],
    "Cáucaso": [43.00, 42.00],
    "Urales": [60.00, 59.00],
    "Gran Llanura Europea": [52.00, 20.00],
    "Anatolia": [39.00, 32.00],
    "Depresión del Caspio": [45.00, 47.00],

    // --- ISLAS Y PENÍNSULAS ---
    "Islandia": [64.96, -19.02],
    "Irlanda": [53.41, -8.24],
    "Gran Bretaña": [53.50, -2.00],
    "Islas Baleares": [39.30, 2.98],
    "Córcega": [42.15, 9.00],
    "Cerdeña": [40.12, 9.01],
    "Sicilia": [37.59, 14.01],
    "Chipre": [35.12, 33.42],
    "Península Ibérica": [40.00, -4.00],
    "Península Itálica": [42.50, 12.50],
    "Península Balcánica": [42.00, 22.00],
    "Crimea": [45.30, 34.30],
    "Jutlandia": [56.00, 9.50],
    "Escandinavia": [62.00, 15.00],

    // --- MARES Y OCÉANOS ---
    "Océano Glacial Ártico": [78.00, 20.00],
    "Océano Atlántico": [45.00, -25.00],
    "Mar Mediterráneo": [38.00, 15.00],
    "Mar Báltico": [57.00, 20.00],
    "Mar del Norte": [56.00, 3.00],
    "Mar Cantábrico": [43.80, -4.50],
    "Mar Tirreno": [40.00, 11.50],
    "Mar Adriático": [42.50, 15.50],
    "Mar Jónico": [38.00, 19.50],
    "Mar Egeo": [38.50, 24.50],
    "Mar Negro": [43.50, 34.00],
    "Mar Caspio": [41.00, 50.00],
    "Estrecho de Gibraltar": [36.10, -5.35]
  };

  for (let nombreElemento in europaPuntos) {
    let coords = europaPuntos[nombreElemento];
    let clasePin = "pin-educativo pin-relieve";
    let iconoSimbolo = "⛰️";

    if (nombreElemento.match(/Loira|Támesis|Po|Rin|Elba|Vístula|Danubio|Volga/)) {
      clasePin = "pin-educativo pin-rio";
      iconoSimbolo = "💧";
    } else if (nombreElemento.match(/Mar|Océano|Estrecho/)) {
      clasePin = "pin-educativo pin-mar";
      iconoSimbolo = "🌊";
    } else if (nombreElemento.match(/Islandia|Irlanda|Gran Bretaña|Baleares|Córcega|Cerdeña|Sicilia|Chipre/)) {
      clasePin = "pin-educativo pin-isla";
      iconoSimbolo = "🏝️";
    }

    let customIcon = L.divIcon({
      className: clasePin,
      html: `<span>${iconoSimbolo}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    let marker = L.marker(coords, { icon: customIcon });

    marker.on('click', () => procesarRespuestaAlumno(nombreElemento));
    grupoCapasEuropaLeaflet.addLayer(marker);
    capasEuropaFisicasPorNombre[nombreElemento] = marker;
  }

  iniciarNuevoCuestionario();
}

function cargarCapasMundoFisicas() {
  if (!mapaSIG) return;

  if (grupoCapasMundoLeaflet) {
    mapaSIG.removeLayer(grupoCapasMundoLeaflet);
    grupoCapasMundoLeaflet = null;
    capasMundoFisicasPorNombre = {};
  }

  grupoCapasMundoLeaflet = L.layerGroup().addTo(mapaSIG);

  // Coordenadas puntuales exactas para los elementos del Mapamundi
  const mundoPuntos = {
    // --- CONTINENTES ---
    "África": [4.00, 21.00],
    "América": [15.00, -90.00],
    "Antártida": [-80.00, 0.00],
    "Asia": [34.00, 100.00],
    "Europa": [50.00, 15.00],
    "Oceanía": [-25.00, 135.00],
    
    // --- OCÉANOS Y MARES ---
    "Atlántico": [25.00, -40.00],
    "Glacial Ártico": [82.00, 0.00],
    "Glacial Antártico": [-68.00, 0.00],
    "Índico": [-20.00, 80.00],
    "Pacífico": [0.00, -160.00],
    "Mediterráneo": [38.00, 17.00],

    // --- ISLAS ---
    "Groenlandia": [72.00, -40.00],
    "Australia": [-25.00, 133.00],
    "Nueva Zelanda": [-41.00, 174.00],
    "Japón": [36.00, 138.00],
    "Madagascar": [-20.00, 47.00],
    "Tierra del Fuego": [-54.00, -68.00],

    // --- RELIEVE ---
    "Montañas Rocosas": [45.00, -112.00],
    "Atlas": [32.00, -5.00],
    "Himalaya": [28.00, 85.00],
    "Andes": [-20.00, -68.00],
    "Rift Valley": [-2.00, 36.00],

    // --- RÍOS ---
    "Misisipi": [35.00, -90.00],
    "Nilo": [15.00, 32.00],
    "Congo": [-2.00, 22.00],
    "Amazonas": [-3.00, -60.00],
    "Níger": [14.00, 2.00],
    "Río Amarillo": [36.00, 103.00],

    // --- OTROS ---
    "Desierto del Sahara": [23.00, 13.00],
    "Siberia": [60.00, 100.00]
  };

  for (let nombreElemento in mundoPuntos) {
    let coords = mundoPuntos[nombreElemento];
    let clasePin = "pin-educativo pin-relieve";
    let iconoSimbolo = "🌍";

    if (nombreElemento.match(/Misisipi|Nilo|Congo|Amazonas|Níger|Río Amarillo/)) {
      clasePin = "pin-educativo pin-rio";
      iconoSimbolo = "💧";
    } else if (nombreElemento.match(/Atlántico|Ártico|Antártico|Índico|Pacífico|Mediterráneo/)) {
      clasePin = "pin-educativo pin-mar";
      iconoSimbolo = "🌊";
    } else if (nombreElemento.match(/Groenlandia|Australia|Nueva Zelanda|Japón|Madagascar|Tierra del Fuego/)) {
      clasePin = "pin-educativo pin-isla";
      iconoSimbolo = "🏝️";
    }

    let customIcon = L.divIcon({
      className: clasePin,
      html: `<span>${iconoSimbolo}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    let marker = L.marker(coords, { icon: customIcon });

    marker.on('click', () => procesarRespuestaAlumno(nombreElemento));
    grupoCapasMundoLeaflet.addLayer(marker);
    capasMundoFisicasPorNombre[nombreElemento] = marker;
  }

  iniciarNuevoCuestionario();
}

function cargarCapasSegunEstado() {
  if (!mapaSIG) return;

  // 1. PURGA TOTAL: Eliminamos cualquier rastro de capas anteriores de cualquier mapa
  if (capaGeoJsonActual) {
    mapaSIG.removeLayer(capaGeoJsonActual);
    capaGeoJsonActual = null;
    capasPorNombre = {};
  }
  if (grupoCapasFisicasLeaflet) {
    mapaSIG.removeLayer(grupoCapasFisicasLeaflet);
    grupoCapasFisicasLeaflet = null;
    capasFisicasPorNombre = {};
  }
  if (grupoCapasEuropaLeaflet) {
    mapaSIG.removeLayer(grupoCapasEuropaLeaflet);
    grupoCapasEuropaLeaflet = null;
    capasEuropaFisicasPorNombre = {};
  }
  if (grupoCapasMundoLeaflet) {
    mapaSIG.removeLayer(grupoCapasMundoLeaflet);
    grupoCapasMundoLeaflet = null;
    capasMundoFisicasPorNombre = {};
  }

  // 2. ENRUTAMIENTO SEGÚN EL MAPA Y TEMA ACTIVO
  if (mapaActivo === "espana") {
    if (temaActivo === "fisico") {
      cargarCapasFisicasEspana(); // Carga exclusiva de España Físico
      return;
    } else {
      // España Político (Provincias o Comunidades)
      let urlGeoJson = (capaActiva === "comunidades") ? "comunidades-espana.geojson" : "provincias-espana.geojson";
      
      fetch(urlGeoJson)
        .then(response => {
          if (!response.ok) throw new Error("No se pudo cargar el archivo: " + urlGeoJson);
          return response.json();
        })
        .then(data => {
          capaGeoJsonActual = L.geoJSON(data, {
            style: { fillColor: "#f8fafc", weight: 1.2, color: "#475569", fillOpacity: 0.85 },
            onEachFeature: function(feature, layer) {
              let nombreElemento = feature.properties.nombre || feature.properties.NAME || feature.properties.provincia || feature.properties.name;
              if (nombreElemento) {
                capasPorNombre[nombreElemento] = layer;
              }
              layer.on({
                click: function() {
                  if (nombreElemento) procesarRespuestaAlumno(nombreElemento);
                }
              });
            }
          }).addTo(mapaSIG);

          iniciarNuevoCuestionario();
        })
        .catch(error => console.warn("Error cargando GeoJSON político de España:", error));
      return;
    }
  } 
  
  else if (mapaActivo === "europa") {
    cargarCapasEuropaFisicas(); // Carga exclusiva de elementos de Europa
    return;
  } 
  
  else if (mapaActivo === "mundo") {
    cargarCapasMundoFisicas(); // Carga exclusiva de elementos del Mapamundi
    return;
  }
}

function limpiarColoresMapa() {
  // Limpiar capas políticas GeoJSON
  if (capaGeoJsonActual) {
    capaGeoJsonActual.eachLayer(layer => {
      layer.options.isAcierto = false;
      capaGeoJsonActual.resetStyle(layer);
    });
  }
  // Limpiar capas físicas
  for (let nombre in capasFisicasPorNombre) {
    let layer = capasFisicasPorNombre[nombre];
    if (layer) {
      if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        layer.setStyle({ color: '#2b6cb0', weight: 5, opacity: 0.85 });
      } else {
        layer.setStyle({ fillColor: '#b7791f', color: '#78350f', fillOpacity: 0.65, weight: 1.5 });
      }
    }
  }
}

function pintarElementoLeaflet(nombre, colorHex, colorBorde) {
  let layer = obtenerLayerGrafico(nombre);

  if (layer) {
    layer.options.isAcierto = true;
    
    // Si es un marcador puntual (L.Marker), cambiamos el color de fondo de su icono HTML
    if (layer instanceof L.Marker) {
      let iconHtml = `<span style="background-color: ${colorHex}; color: white; display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; border-radius: 50%;">${layer.getElement()?.querySelector('span')?.textContent || '📍'}</span>`;
      layer.setIcon(L.divIcon({
        className: 'pin-educativo',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      }));
    } else if (typeof layer.setStyle === 'function') {
      // Si es un polígono o línea vectorial clásica
      layer.setStyle({
        fillColor: colorHex,
        color: colorBorde,
        weight: 3,
        fillOpacity: 0.85
      });
    }
  }
}

function obtenerLayerGrafico(nombre) {
  return capasPorNombre[nombre] || 
         capasFisicasPorNombre[nombre] || 
         capasEuropaFisicasPorNombre[nombre] || 
         capasMundoFisicasPorNombre[nombre];
}

function inicializarApp() {
  const dom = getDOM();

  // Listeners de Selector de Mapa
  if (dom.btnMapaEspana) dom.btnMapaEspana.addEventListener("click", () => seleccionarMapa("espana"));
  if (dom.btnMapaEuropa) dom.btnMapaEuropa.addEventListener("click", () => seleccionarMapa("europa"));
  if (dom.btnMapaMundo) dom.btnMapaMundo.addEventListener("click", () => seleccionarMapa("mundo"));

  // Listeners de Tema y Modo
  if (dom.btnTemaPolitico) dom.btnTemaPolitico.addEventListener("click", () => cambiarTemaGlobal("politico"));
  if (dom.btnTemaFisico) dom.btnTemaFisico.addEventListener("click", () => cambiarTemaGlobal("fisico"));

  if (dom.btnModoExplorar) dom.btnModoExplorar.addEventListener("click", () => cambiarModoJuego("explorar"));
  if (dom.btnModoCuestionario) dom.btnModoCuestionario.addEventListener("click", () => cambiarModoJuego("cuestionario"));

  // Listeners Capas España
  if (dom.btnCapaComunidades) dom.btnCapaComunidades.addEventListener("click", function() {
    capaActiva = "comunidades";
    if (dom.btnCapaComunidades) dom.btnCapaComunidades.classList.add("activo");
    if (dom.btnCapaProvincias) dom.btnCapaProvincias.classList.remove("activo");
    inicializarMapaSIG();
  });

  if (dom.btnCapaProvincias) dom.btnCapaProvincias.addEventListener("click", function() {
    capaActiva = "provincias";
    if (dom.btnCapaProvincias) dom.btnCapaProvincias.classList.add("activo");
    if (dom.btnCapaComunidades) dom.btnCapaComunidades.classList.remove("activo");
    inicializarMapaSIG();
  });

  // Arrancamos el visor SIG de Leaflet por primera vez
  inicializarMapaSIG();
}

// CONTROL DE CARGA ASÍNCRONA
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarApp);
} else {
  inicializarApp();
}