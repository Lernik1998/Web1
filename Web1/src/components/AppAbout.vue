<template>
  <section id="sobre-mi" class="kb-about">
    <div class="kb-about__inner">
      <div class="kb-about__media">
        <div class="kb-about__blob" aria-hidden="true"></div>
        <img
          src="/images/psicologa-denia-hero.jpg"
          alt="María B. Kanbouri, psicóloga en su consulta de Dénia"
          class="kb-about__image"
        />
      </div>

      <div class="kb-about__content">
        <p class="kb-about__eyebrow text-secondary">Sobre mí</p>

        <h2 class="kb-about__title text-h2">María B. Kanbouri</h2>
        <p class="kb-about__role text-secondary">
          Psicóloga para adultos y parejas en Dénia
        </p>

        <p class="kb-about__lead text-body">
          Soy María B. Kanbouri, psicóloga general sanitaria (Col. CV14894) y
          directora del centro en Dénia. Acompaño a personas adultas que
          atraviesan ansiedad, depresión, procesos de duelo, experiencias
          traumáticas y otros momentos de malestar emocional que impactan en
          su vida personal, familiar o relacional.
        </p>

        <p class="kb-about__lead text-body">
          Trabajo desde un enfoque cercano, humano y seguro, donde el vínculo
          terapéutico es una pieza central del proceso. Mi manera de
          acompañar se basa en la escucha sin juicio, la presencia y el
          respeto por el ritmo de cada persona, ofreciendo un espacio donde
          poder sostenerse emocionalmente, especialmente en etapas de mayor
          vulnerabilidad.
        </p>

        <a href="/pedir-cita" class="kb-about__cta text-cta">Pedir cita</a>
      </div>
    </div>

    <div class="kb-about__credentials">
      <div class="kb-about__credential-col">
        <h3 class="text-h3">Formación académica</h3>
        <ul class="kb-about__list">
          <li>
            Grado en Psicología, con mención en Psicología de la Salud e
            Intervención en Trastornos Mentales y del Comportamiento —
            Universidad Nacional de Educación a Distancia (UNED)
          </li>
          <li>
            Máster en Psicología General Sanitaria — Universidad
            Internacional de La Rioja (UNIR)
          </li>
          <li>Posgrado en Recursos Humanos</li>
        </ul>
      </div>

      <div class="kb-about__credential-col">
        <h3 class="text-h3">Formación extracurricular</h3>
        <ul class="kb-about__list">
          <li>
            Formación en EMDR Nivel I y II, por la Asociación Española de
            EMDR
          </li>
          <li>
            «El mundo interno en los trastornos alimentarios», Centro
            Psicoterapia &amp; Trauma de Natalia Seijo
          </li>
          <li>
            «El trabajo con defensas en psicoterapia», Centro Psicoterapia
            &amp; Trauma de Natalia Seijo
          </li>
          <li>El proceso MAR, «duelo infantojuvenil»</li>
          <li>
            Introducción al trabajo sistémico con familias, por la Clínica
            Cabal
          </li>
          <li>
            Intervención con Juegos en Psicoterapia Infantojuvenil, por la
            Clínica Cabal
          </li>
          <li>Problemas de sueño en la infancia, por la Clínica Cabal</li>
          <li>
            Abordaje Transdiagnóstico de la Imagen Corporal, por la Clínica
            Cabal
          </li>
          <li>Terapia y asesoramiento con muñecos, por Prisca Formación</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kb-about {
  background: var(--color-paper);
  padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px);
}

.kb-about__inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.1fr);
  align-items: center;
  gap: clamp(32px, 6vw, 80px);
}

/* ---------- Columna de imagen ---------- */
.kb-about__media {
  position: relative;
  justify-self: center;
  width: 100%;
  max-width: 400px;
}

.kb-about__blob {
  position: absolute;
  inset: 0;
  transform: translate(-10px, 10px);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-rose-soft) 0%, var(--color-secondary) 100%);
  opacity: 0.45;
  z-index: 0;
}

.kb-about__image {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  aspect-ratio: 1200 / 930;
  object-fit: cover;
  object-position: center 20%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  background: var(--color-paper-alt);
}

/* ---------- Columna de texto ---------- */
.kb-about__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--color-rose-hover);
  margin-bottom: 18px;
}

.kb-about__title {
  margin-bottom: 8px;
}

.kb-about__role {
  font-weight: 500;
  margin-bottom: 22px;
}

.kb-about__lead {
  max-width: 58ch;
  margin-bottom: 20px;
}

.kb-about__cta {
  display: inline-flex;
  align-items: center;
  margin-top: 6px;
  padding: 14px 30px;
  border-radius: var(--radius-pill);
  background: var(--color-rose);
  color: var(--color-on-rose);
  text-decoration: none;
  box-shadow: var(--shadow-cta);
  transition: background-color var(--dur-base) var(--ease-base),
    transform var(--dur-base) var(--ease-base), box-shadow var(--dur-base) var(--ease-base);
}

.kb-about__cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-about__cta:active {
  transform: translateY(0) scale(0.97);
  box-shadow: var(--shadow-cta);
}

/* ---------- Formación (académica + extracurricular) ---------- */
.kb-about__credentials {
  max-width: var(--content-max-width);
  margin: clamp(48px, 7vw, 72px) auto 0;
  padding-top: clamp(40px, 6vw, 56px);
  border-top: 1px solid var(--color-line);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(32px, 5vw, 64px);
}

.kb-about__credential-col h3 {
  margin-bottom: 18px;
}

.kb-about__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.kb-about__list li {
  position: relative;
  padding-left: 20px;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.55;
  color: var(--color-ink);
}

.kb-about__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-rose);
}

/* ---------- Responsive ---------- */
@media (max-width: 860px) {
  .kb-about__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .kb-about__lead {
    margin-left: auto;
    margin-right: auto;
  }

  .kb-about__media {
    max-width: 280px;
  }

  .kb-about__credentials {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .kb-about__list li {
    text-align: left;
  }
}
</style>