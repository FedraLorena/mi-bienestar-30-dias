// Guía local en español y tramos verificados de las demostraciones del NHS.
(() => {
 const movements = {
  "base": [
    [
      "Poné los pies al ancho de las caderas, con las puntas hacia adelante. Repartí el peso en las dos plantas.",
      "Aflojá apenas las rodillas, alineadas con los dedos. Soltá hombros, brazos y dedos.",
      "Quedate centrada, con las rodillas suaves. Si te moviste, volvé a repartir el peso entre los dos pies."
    ],
    [
      "Sentate en una silla firme; apoyá los dos pies enteros, al ancho de las caderas.",
      "Dejá las rodillas cerca de un ángulo recto y las manos sobre los muslos. Soltá los hombros.",
      "Volvé a un apoyo parejo en el asiento y mantené ambos pies en el piso."
    ]
  ],
  "aire": [
    [
      "Con ambos pies firmes y las rodillas apenas flexionadas, juntá las manos frente al pecho, sin tocarlas.",
      "Separá las manos a los lados, con las palmas enfrentadas y los codos suaves. El peso queda en el centro.",
      "Acercá las manos por el mismo camino. Aflojá los hombros antes de repetir."
    ],
    [
      "Apoyá ambos pies y juntá las manos delante del pecho.",
      "Abrilas en un arco corto con los codos bajos, sin cambiar el apoyo en la silla.",
      "Acercá las manos al centro y dejá que los hombros descansen."
    ]
  ],
  "alzar": [
    [
      "Plantá los pies, aflojá las rodillas y dejá las manos cerca de los muslos.",
      "Elevá ambas manos con las palmas hacia abajo hasta una altura cómoda, como máximo los hombros. El peso queda repartido.",
      "Bajá despacio por el mismo camino, sin dejar caer las manos ni bloquear los codos."
    ],
    [
      "Con pies planos y rodillas flexionadas, empezá con las manos sobre los muslos.",
      "Levantá ambas manos frente al cuerpo sin encoger los hombros ni inclinarte.",
      "Bajalas a los muslos y recuperá el apoyo parejo."
    ]
  ],
  "lados": [
    [
      "Con los pies al ancho de caderas y las rodillas suaves, apoyá el mismo peso en ambas plantas.",
      "Llevá la pelvis apenas hacia un lado sin inclinar el tronco ni levantar los pies. La rodilla sigue la dirección de los dedos.",
      "Volvé al centro antes de repetir hacia el otro lado. No hace falta cargar todo el peso en una pierna."
    ],
    [
      "Sentate con ambos pies bien apoyados y las manos sobre los muslos.",
      "Presioná suavemente un pie contra el piso; las caderas quedan en la silla y el torso no se inclina.",
      "Aflojá la presión, volvé al apoyo parejo y repetí con el otro pie."
    ]
  ],
  "bola": [
    [
      "Con pies firmes y rodillas suaves, formá una pelota imaginaria a un lado: una palma arriba y otra abajo, enfrentadas.",
      "Pasá las manos redondeadas por el centro, cerca del cuerpo. Mantené el peso repartido y los codos flexibles.",
      "Formá la pelota del otro lado con las alturas invertidas. Para volver, recorré el camino inverso por el centro."
    ],
    [
      "Con los pies plantados, formá la pelota imaginaria al lado del torso.",
      "Llevá la pelota por el centro sin inclinarte ni despegar la pelvis del asiento.",
      "Intercambiá las alturas al llegar al otro lado. Volvé por el centro con el mismo gesto corto."
    ]
  ],
  "nube": [
    [
      "Con los pies quietos y las rodillas suaves, poné una mano a la altura del pecho y la otra a la altura de la cintura.",
      "Deslizá ambas manos frente al cuerpo. Al pasar por el centro, bajá la mano alta y subí la otra.",
      "Terminá del otro lado con las alturas invertidas. Volvé por el centro sin girar las rodillas ni trasladar todo el peso."
    ],
    [
      "Apoyá ambos pies. Una mano queda frente al pecho, la otra frente a la cintura.",
      "Deslizá las manos en un recorrido corto e intercambiá alturas al pasar por el centro.",
      "Terminá del otro lado y regresá sin moverte del asiento."
    ]
  ],
  "paso": [
    [
      "Ponete al alcance de una mesada fija, con ambos pies apoyados y rodillas suaves. Apoyá una mano si necesitás estabilidad.",
      "Dejá el peso en la pierna de apoyo. Tocá el piso a poca distancia con la punta del otro pie; mantené el tronco erguido.",
      "Volvé con ese pie al ancho de caderas. Repartí el peso y alterná solo si te sentís estable."
    ],
    [
      "Sentate firme, con las manos sobre los muslos y los dos pies apoyados.",
      "Deslizá un pie unos centímetros hacia afuera, sin levantarlo ni trasladar el peso del asiento.",
      "Deslizalo al centro, volvé a apoyar la planta y alterná."
    ]
  ],
  "frente": [
    [
      "La vista es de perfil. Poné los pies paralelos, rodillas suaves y manos cerca del pecho con las palmas hacia adelante.",
      "Extendé ambas manos hacia adelante sin inclinar el tronco ni trabar los codos. El peso no avanza.",
      "Flexioná los codos y traé las manos de vuelta al pecho."
    ],
    [
      "La vista es de perfil. Apoyá ambos pies y acercá las manos al pecho.",
      "Empujá el aire con ambas palmas, a una altura cómoda, sin moverte del asiento.",
      "Regresá las manos al pecho y relajá los hombros."
    ]
  ],
  "ola": [
    [
      "Parate con los pies firmes, rodillas suaves y manos cerca de los muslos.",
      "Dibujá un arco pequeño hacia arriba y al costado con una mano. La otra queda baja y el peso permanece parejo.",
      "Bajá la mano hacia el centro. Hacé el mismo arco con la otra, sin levantar el hombro."
    ],
    [
      "Apoyá los pies y empezá con las manos en el regazo.",
      "Dibujá un arco más corto con una mano sin inclinarte; la otra queda en el muslo.",
      "Volvé al regazo y alterná las manos."
    ]
  ],
  "diagonal": [
    [
      "Con pies quietos, rodillas suaves y peso parejo, acercá ambas manos al centro del pecho.",
      "Abrí una mano en diagonal, sin girar los pies ni llevar el codo al límite. La otra mano queda cerca del pecho.",
      "Volvé al centro y repetí hacia la otra diagonal."
    ],
    [
      "Con ambos pies apoyados, acercá las manos al centro del pecho.",
      "Abrí una mano en una diagonal corta, manteniendo la espalda estable.",
      "Volvé al centro y alterná."
    ]
  ],
  "abanico": [
    [
      "Poné las manos cerca de la cintura, con pies firmes y rodillas suaves.",
      "Deslizá una mano hacia el costado a la altura de la cintura, con la palma relajada. Dejá el peso parejo y la cabeza cómoda.",
      "Traé la mano de vuelta al centro antes de abrir la otra."
    ],
    [
      "Con ambos pies apoyados, acercá una mano a la cintura.",
      "Abrí esa mano a un costado con un gesto corto; dejá la otra sobre el muslo.",
      "Regresá la mano al regazo y alterná sin girar el tronco."
    ]
  ],
  "cierre": [
    [
      "Volvé al centro con ambos pies apoyados, rodillas suaves y manos cerca de la cintura.",
      "Dejá que las manos bajen lentamente a los lados. Igualá el apoyo en los pies.",
      "Quedate un momento con los hombros sueltos y la respiración tranquila."
    ],
    [
      "Con ambos pies apoyados, acercá las manos al regazo.",
      "Bajá las manos despacio hasta los muslos sin inclinarte.",
      "Dejá las palmas apoyadas y quedate un momento respirando con naturalidad."
    ]
  ]
};
 const videos = {
  "alzar": [
    {
      "id": 1194661483,
      "token": "8b2771cc85",
      "range": "0:00 a 0:40"
    },
    {
      "id": 1194661321,
      "token": "fe6a0bf578",
      "range": "0:00 a 1:00"
    }
  ],
  "nube": [
    {
      "id": 1194661505,
      "token": "5c434ae7c4",
      "range": "1:30 a 1:55"
    },
    {
      "id": 1194661344,
      "token": "6dfcbda3f4",
      "range": "2:05 a 2:40"
    }
  ]
};
 const source = 'https://www.torbayandsouthdevon.nhs.uk/services/pain-service/reconnect2life/improving-health-and-fitness/tai-chi/tai-chi-shibashi-qigong/';
 function demonstration(id,seated) {
  const video = videos[id]?.[Number(seated)];
  if (!video) return null;
  return {
   range:video.range,
   url:'https://player.vimeo.com/video/'+video.id+'?h='+video.token+'&dnt=1',
   note:id==='nube' ? 'Secuencia equivalente de Shibashi. El video incluye giros. Para esta práctica, seguí el recorrido corto de la guía escrita.' : 'Observá cómo suben y bajan ambas manos. Seguí la amplitud cómoda de la guía escrita.'
  };
 }
 globalThis.BIEN_TAI_GUIDE = {
  frames:(id,seated)=>movements[id][Number(seated)].map(text=>({text})),
  demonstration,source
 };
})();
