export interface TeamMember {
  slug: string
  name: string
  role: string
  collegiate: string
  image: string
  imageScale?: number
  imagePosition?: string
  bio: string[]
  formacionAcademica: string[]
  formacionExtra: string[]
}

export const team: TeamMember[] = [
  {
    slug: 'maria-b-kanbouri',
    name: 'María B. Kanbouri',
    role: 'Psicóloga General Sanitaria · Directora del centro',
    collegiate: 'Col. CV14894',
    image: '/images/maria-kanbouri.jpg',
    bio: [
      'Acompaño a personas adultas que atraviesan ansiedad, depresión, procesos de duelo, experiencias traumáticas y otros momentos de malestar emocional que impactan en su vida personal, familiar o relacional.',
      'Trabajo desde un enfoque cercano, humano y seguro, donde el vínculo terapéutico es una pieza central del proceso. Mi manera de acompañar se basa en la escucha sin juicio, la presencia y el respeto por el ritmo de cada persona, ofreciendo un espacio donde poder sostenerse emocionalmente, especialmente en etapas de mayor vulnerabilidad.',
    ],
    formacionAcademica: [
      'Grado en Psicología, con mención en Psicología de la Salud e Intervención en Trastornos Mentales y del Comportamiento, por la Universidad Nacional de Educación a Distancia (UNED).',
      'Máster en Psicología General Sanitaria, por la Universidad Internacional de La Rioja (UNIR).',
      'Posgrado en Recursos Humanos.',
    ],
    formacionExtra: [
      'Formación en EMDR Nivel I y II, por la Asociación Española de EMDR.',
      '«El mundo interno en los trastornos alimentarios», Centro Psicoterapia & Trauma de Natalia Seijo.',
      '«El trabajo con defensas en psicoterapia», Centro Psicoterapia & Trauma de Natalia Seijo.',
      'El proceso MAR, «duelo infantojuvenil».',
      'Introducción al trabajo sistémico con familias, por la Clínica Cabal.',
      'Intervención con Juegos en Psicoterapia Infantojuvenil, por la Clínica Cabal.',
      'Problemas de sueño en la infancia, por la Clínica Cabal.',
      'Abordaje Transdiagnóstico de la Imagen Corporal, por la Clínica Cabal.',
      'Terapia y asesoramiento con muñecos, por Prisca Formación.',
    ],
  },
  {
    slug: 'beatriz-donet',
    name: 'Beatriz Donet',
    role: 'Psicóloga General Sanitaria',
    collegiate: 'Col. nº19380',
    image: '/images/beatirz-donet.jpg',
    bio: [
      'Acompaño a adolescentes, adultos y parejas que atraviesan dificultades emocionales, conflictos en sus relaciones o momentos vitales difíciles, ofreciendo un espacio donde puedan sentirse escuchados, comprendidos y acompañados.',
      'Trabajo desde una mirada integrativa y sistémica, entendiendo que muchas veces el malestar emocional no aparece de forma aislada, sino dentro de las experiencias personales, familiares y relacionales de cada persona. En terapia acompaño procesos relacionados con ansiedad, autoestima, gestión emocional, conflictos de pareja, inseguridad, dificultades en las relaciones o situaciones de cambio vital.',
    ],
    formacionAcademica: [
      'Grado en Psicología con mención en Psicología de la Salud, intervención en trastornos mentales y del comportamiento por la Universidad Nacional de Educación a Distancia (UNED).',
      'Máster en Psicología General Sanitaria por la Universidad Internacional de Valencia (VIU).',
    ],
    formacionExtra: [
      'Prevención y control del estrés.',
      'Profesionales sanitarios ante la detección de la violencia de género.',
      'Infancia y adolescencia en transformación: intervención socioeducativa en entornos formales y no formales.',
      'Prevención de riesgos laborales.',
      'Formación de la Comisión de Igualdad.',
    ],
  },
  {
    slug: 'ester-pinedo-gil',
    name: 'Ester Pinedo Gil',
    role: 'Psicóloga General Sanitaria',
    collegiate: 'Col. CV15103',
    image: '/images/ester-pinedo.png',
    imageScale: 1.4,
    imagePosition: 'center 30%',
    bio: [
      'Acompaño a niños a partir de 6 años y adolescentes que atraviesan dificultades emocionales, conductuales o familiares, ofreciendo un espacio cercano y seguro donde puedan sentirse comprendidos y acompañados.',
      'Trabajo desde una mirada integrativa y sistémica, ayudando tanto a los menores como a sus familias a entender mejor lo que están viviendo, sus emociones y las distintas etapas del desarrollo. En terapia acompaño dificultades relacionadas con la gestión emocional, ansiedad, autoestima, inseguridad, relaciones sociales o conflictos familiares, adaptando siempre el proceso a las necesidades de cada niño, adolescente y familia.',
      'Mi objetivo es que tanto los menores como sus padres puedan sentirse escuchados, comprendidos y acompañados durante todo el proceso terapéutico.',
    ],
    formacionAcademica: [
      'Grado en Psicología con mención en Psicología de la Salud, intervención en trastornos mentales y del comportamiento por la Universidad Nacional de Educación a Distancia (UNED).',
      'Máster en Psicología General Sanitaria por la Universidad Internacional de Valencia (VIU).',
    ],
    formacionExtra: [
      'Entrevista familiar en terapia infantojuvenil.',
      'Máster no oficial en Metaprogramación Cognitiva.',
      'Curso de adolescencia: estrategias para la resiliencia y el autoconcepto.',
      'Curso de habilidades comunicativas y liderazgo.',
    ],
  },
]
