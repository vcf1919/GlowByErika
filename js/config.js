/*
  CONFIGURACIÓN DE LA WEB DE GLOW BY ERIKA
  ========================================
  Todo lo que cambia a menudo está aquí. No hace falta tocar el HTML.
  Después de editar, guarda el archivo y vuelve a publicar la web.

  · urlBase ........ Dirección pública de la web. Si cambia el dominio, cámbiala aquí
                     y también en las etiquetas og: del <head> de index.html
                     (están juntas, debajo del comentario "URL BASE").
  · telefono ....... Teléfono con prefijo 34, sin espacios ni "+". Se usa en WhatsApp,
                     en el enlace para llamar y en los datos para Google.
  · instagram ...... Enlace al perfil de Instagram.

  · horario ........ Franjas de apertura de cada día, en formato "H:MM".
                     Un día cerrado es una lista vacía: [].
                     Con esto se calcula el "Abierto ahora / Cerrado · abrimos a las…"
                     (siempre con la hora de Madrid) y la tabla de horarios.

  · promos ......... Promociones del mes. Puede haber varias: la primera que esté
                     activa sale en la tarjeta grande y las demás en una línea debajo.
                     En la carta, los servicios en promo muestran el precio de antes
                     tachado. Cada promo tiene:
        mostrar .... true para enseñarla, false para quitarla.
        titulo ..... Título. Lo que va después de la última " y " sale en rosa.
        precio ..... Precio de promo tal cual se muestra, con el símbolo €.
        antes ...... Precio sin promo, que sale tachado (opcional).
        hasta ...... Último día de la promo (AAAA-MM-DD). Al día siguiente se oculta
                     sola y la carta vuelve a su precio normal.
        servicios .. Ids de la carta a los que se aplica el precio de promo.
        texto ...... Frase debajo del título (opcional).

  · servicios ...... La carta. Cada categoría tiene:
        id, categoria (nombre de la pestaña), subtitulo (opcional) e items.
        Cada servicio tiene:
          id ......... identificador interno, sin espacios (no lo cambies si ya existe)
          nombre ..... como se ve en la carta
          duracion ... minutos (número) o null si no se indica
          detalle .... texto pequeño debajo del nombre (opcional)
          precio ..... número (20) o texto ("20–25 €", "desde 27 €", "Consultar")
          mostrar .... true / false para enseñarlo u ocultarlo sin borrarlo

  · reservas ....... Cómo se reserva.
        modo ....... "whatsapp" (versión básica: cada botón abre WhatsApp con el
                     servicio y el precio ya escritos) o "booksy" (versión con citas).
        booksyUrl .. Enlace al perfil de Erika en Booksy. Mientras esté vacío, en modo
                     "booksy" se abre una vista de ejemplo de la agenda dentro de la web.
        Para la presentación también se puede forzar con la dirección:
          ?reservas=whatsapp  o  ?reservas=booksy   (y ?demo=1 muestra un interruptor)

  · resenas ........ Opiniones reales de clientas. Vacío = se muestra la invitación a dejar
                     una opinión. Formato de cada una:
                     { nombre: "Laura G.", texto: "…", servicio: "Uñas" }
  · googleUrl ...... Enlace para dejar una reseña en Google (ficha de Google Business,
                     botón "Pedir reseñas"). Vacío = el botón no sale y se invita a seguir
                     en Instagram.
*/
window.CONFIG = {
  urlBase: "https://glowbyerika.pages.dev/",
  telefono: "34653302332",
  instagram: "https://www.instagram.com/glow.by.erika/",

  horario: {
    lunes:     [["10:00", "14:00"]],
    martes:    [["10:00", "14:00"], ["15:00", "19:00"]],
    miercoles: [["10:00", "14:00"], ["15:00", "19:00"]],
    jueves:    [["10:00", "19:00"]],
    viernes:   [["10:00", "14:00"], ["15:00", "19:00"]],
    sabado:    [],
    domingo:   []
  },

  // Promos de noviembre publicadas en el Instagram de Erika
  promos: [
    {
      mostrar: true,
      titulo: "Ritual Glow",
      precio: "45 €",
      antes: "60 €",
      hasta: "2026-11-30",
      servicios: ["ritual"],
      texto: "Un ritual de 60 minutos pensado para desconectar, relajarte y salir renovada: masajes, ritual facial con mascarilla y presoterapia ocular."
    },
    {
      mostrar: true,
      titulo: "Ácido hialurónico",
      precio: "30 €",
      antes: "35 €",
      hasta: "2026-11-30",
      servicios: ["hialuronico"],
      texto: "Tratamiento facial de hidratación profunda para una piel más luminosa."
    }
  ],

  servicios: [
    { id: "faciales", categoria: "Faciales", subtitulo: "Piel luminosa, limpia y cuidada", items: [
      { id: "higiene",     nombre: "Higiene facial profunda", duracion: 60, detalle: "limpieza, extracción y mascarilla", precio: 30, mostrar: true },
      { id: "vitc",        nombre: "Tratamiento vitamina C",  duracion: 50, detalle: "luminosidad y tono uniforme",      precio: 35, mostrar: true },
      { id: "hialuronico", nombre: "Ácido hialurónico",       duracion: 50, detalle: "hidratación intensa",              precio: 35, mostrar: true },
      { id: "purificante", nombre: "Tratamiento purificante", duracion: 50, detalle: "pieles mixtas y grasas",           precio: 35, mostrar: true },
      { id: "retinol",     nombre: "Retinol",                 duracion: 60, detalle: "renovación y textura",             precio: 40, mostrar: true },
      { id: "colageno",    nombre: "Colágeno",                duracion: 60, detalle: "firmeza y elasticidad",            precio: 40, mostrar: true }
    ]},
    { id: "manos", categoria: "Manos", subtitulo: "Manicura y uñas", items: [
      { id: "semi",         nombre: "Manicura semipermanente", duracion: 45, detalle: "color que dura semanas",    precio: 20, mostrar: true },
      { id: "poly",         nombre: "PolyAcrylGel",            duracion: 90, detalle: "ligeras y resistentes",     precio: 28, mostrar: true },
      { id: "unas-gel",     nombre: "Uñas de gel",             duracion: 90, detalle: "forma y largo a tu gusto",  precio: 28, mostrar: true },
      { id: "relleno-gel",  nombre: "Relleno de gel",          duracion: 75, detalle: "",                          precio: 25, mostrar: true },
      { id: "relleno-poly", nombre: "Relleno de PolyAcrylGel", duracion: 75, detalle: "",                          precio: 25, mostrar: true }
    ]},
    { id: "pies", categoria: "Pies", subtitulo: "Pedicura", items: [
      { id: "pedi",      nombre: "Pedicura completa",  duracion: 60, detalle: "según acabado", precio: "20–25 €", mostrar: true },
      { id: "pedi-unas", nombre: "Pedicura solo uñas", duracion: 40, detalle: "según acabado", precio: "15–20 €", mostrar: true }
    ]},
    { id: "dep-facial", categoria: "Depilación facial", subtitulo: "", items: [
      { id: "cejas",           nombre: "Cejas",           duracion: 15, detalle: "diseño incluido", precio: 6,  mostrar: true },
      { id: "ceja-labio",      nombre: "Ceja y labio",    duracion: 20, detalle: "",                precio: 9,  mostrar: true },
      { id: "facial-completa", nombre: "Facial completa", duracion: 30, detalle: "",                precio: 12, mostrar: true }
    ]},
    { id: "dep-corporal", categoria: "Depilación con cera", subtitulo: "", items: [
      { id: "medias",     nombre: "Medias piernas",    duracion: 30, detalle: "", precio: 12, mostrar: true },
      { id: "piernas",    nombre: "Piernas completas", duracion: 45, detalle: "", precio: 20, mostrar: true },
      { id: "ingles",     nombre: "Ingles normales",   duracion: 15, detalle: "", precio: 8,  mostrar: true },
      { id: "ingles-int", nombre: "Ingles integrales", duracion: 30, detalle: "", precio: 15, mostrar: true },
      { id: "axilas",     nombre: "Axilas",            duracion: 15, detalle: "", precio: 6,  mostrar: true },
      { id: "brazos",     nombre: "Brazos",            duracion: 25, detalle: "", precio: 12, mostrar: true }
    ]},
    { id: "packs", categoria: "Packs", subtitulo: "Para ahorrar un poquito", items: [
      { id: "pack-piernas", nombre: "Piernas completas + ingles", duracion: 60, detalle: "", precio: "desde 27 €", mostrar: true },
      { id: "pack-cuerpo",  nombre: "Pack cuerpo completo",       duracion: 90, detalle: "", precio: 35,           mostrar: true }
    ]},
    { id: "masajes", categoria: "Masajes y rituales", subtitulo: "", items: [
      { id: "ritual",  nombre: "Ritual Glow",       duracion: 60, detalle: "masaje de espalda, cuello, brazos, piernas, pies y craneal, ritual facial con mascarilla y presoterapia ocular", precio: 60, mostrar: true },
      { id: "masaje",  nombre: "Masaje localizado", duracion: 30, detalle: "espalda, cuello o piernas",    precio: 30, mostrar: true },
      { id: "madero",  nombre: "Maderoterapia",     duracion: 60, detalle: "moldea y drena",               precio: 60, mostrar: true }
    ]},
    { id: "maquillaje", categoria: "Maquillaje", subtitulo: "", items: [
      // Sin precio ni duración hasta hablarlo con Erika
      { id: "maquillaje-evento", nombre: "Maquillaje de evento", duracion: null, detalle: "precio según el evento", precio: "Consultar", mostrar: true }
    ]}
  ],

  reservas: {
    modo: "whatsapp",
    booksyUrl: ""
  },

  resenas: [],
  googleUrl: ""
};
