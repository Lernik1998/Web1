<template>
  <header class="kb-header" :class="{ 'kb-header--scrolled': isScrolled }">
    <div class="kb-header__bar">
      <router-link to="/" class="kb-brand" @click="closeAll">
        <img src="/images/logo_kanbouri_2023.png" alt="Kanbouri Psicología" class="kb-brand__logo" />
      </router-link>

      <button
        class="kb-burger"
        :class="{ 'is-active': mobileOpen }"
        type="button"
        :aria-expanded="mobileOpen"
        aria-label="Abrir menú de navegación"
        @click="mobileOpen = !mobileOpen"
      >
        <span></span><span></span><span></span>
      </button>

      <div class="kb-nav-scrim" :class="{ 'is-visible': mobileOpen }" @click="closeAll"></div>

      <nav class="kb-nav" :class="{ 'kb-nav--open': mobileOpen }" aria-label="Navegación principal">
        <ul class="kb-nav__list">
          <li class="kb-nav__item">
            <router-link to="/" class="kb-nav__link" @click="closeAll">Inicio</router-link>
          </li>

          <li class="kb-nav__item">
            <router-link to="/sobre-mi" class="kb-nav__link" @click="closeAll">Sobre Mí</router-link>
          </li>

          <li
            class="kb-nav__item kb-nav__item--dropdown"
            @mouseenter="openMenu('terapia')"
            @mouseleave="scheduleClose('terapia')"
          >
            <button
              class="kb-nav__link kb-nav__link--trigger"
              type="button"
              :aria-expanded="activeMenu === 'terapia'"
              @click="toggleMenu('terapia')"
            >
              Terapias
              <ChevronIcon :class="['kb-chevron', { 'is-open': activeMenu === 'terapia' }]" />
            </button>

            <div
              class="kb-dropdown"
              :class="{ 'is-open': activeMenu === 'terapia' }"
              :inert="activeMenu !== 'terapia'"
              @mouseenter="cancelClose"
              @mouseleave="scheduleClose('terapia')"
            >
              <ul class="kb-dropdown__list">
                <li
                  v-for="item in terapiaItems"
                  :key="item.label"
                  class="kb-dropdown__item"
                  :class="{ 'has-submenu': item.children }"
                  @mouseenter="item.children && openSubmenu(item.label)"
                  @mouseleave="item.children && scheduleCloseSubmenu()"
                >
                  <router-link
                    v-if="!item.children"
                    :to="item.href"
                    class="kb-dropdown__link"
                    @click="closeAll"
                  >
                    {{ item.label }}
                  </router-link>

                  <template v-else>
                    <button
                      type="button"
                      class="kb-dropdown__link kb-dropdown__link--trigger"
                      :aria-expanded="activeSubmenu === item.label"
                      @click="toggleSubmenu(item.label)"
                    >
                      {{ item.label }}
                      <ChevronIcon :class="['kb-chevron', 'kb-chevron--nested', { 'is-open': activeSubmenu === item.label }]" />
                    </button>

                    <div
                      class="kb-submenu-wrap"
                      :class="{ 'is-open': activeSubmenu === item.label }"
                      :inert="activeSubmenu !== item.label"
                      @mouseenter="cancelSubClose"
                      @mouseleave="scheduleCloseSubmenu"
                    >
                      <ul class="kb-submenu">
                        <li v-for="sub in item.children" :key="sub.label" class="kb-submenu__item">
                          <router-link :to="sub.href" class="kb-submenu__link" @click="closeAll">{{ sub.label }}</router-link>
                        </li>
                      </ul>
                    </div>
                  </template>
                </li>
              </ul>
            </div>
          </li>

          <li class="kb-nav__item">
            <router-link to="/equipo" class="kb-nav__link" @click="closeAll">Equipo</router-link>
          </li>

          <li class="kb-nav__item">
            <router-link to="/para-psicologos" class="kb-nav__link" @click="closeAll">Para psicólogos</router-link>
          </li>

          <li class="kb-nav__item">
            <router-link to="/blog" class="kb-nav__link" @click="closeAll">Blog</router-link>
          </li>
        </ul>

        <router-link to="/pedir-cita" class="kb-cta kb-glare" @click="closeAll">
          Pedir cita
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineComponent, h } from 'vue'

defineOptions({
  name: 'TheHeader',
})

/**
 * Icono de flecha (trazo fino) dibujado a mano para no depender de
 * librerías de iconos externas.
 */
const ChevronIcon = defineComponent({
  render() {
    return h(
      'svg',
      { viewBox: '0 0 10 6', width: 10, height: 6, fill: 'none', 'aria-hidden': 'true' },
      [
        h('path', {
          d: 'M1 1L5 5L9 1',
          stroke: 'currentColor',
          'stroke-width': 1.4,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
      ]
    )
  },
})

const terapiaItems = [
  { label: 'Psicología infantil', href: '/terapias/infantil' },
  { label: 'Psicología para adolescentes', href: '/terapias/adolescentes' },
  {
    label: 'Psicología para adultos',
    href: '/terapias/adultos',
    children: [
      { label: 'Ansiedad', href: '/terapias/adultos/ansiedad' },
      { label: 'Depresión y estado de ánimo', href: '/terapias/adultos/depresion' },
      { label: 'Autoestima y desarrollo personal', href: '/terapias/adultos/autoestima' },
      { label: 'Duelo y pérdidas', href: '/terapias/adultos/duelo' },
    ],
  },
  { label: 'Psicología para padres y familia', href: '/terapias/padres-familia' },
]

const isScrolled = ref(false)
const mobileOpen = ref(false)
const activeMenu = ref<string | null>(null)
const activeSubmenu = ref<string | null>(null)

// En el menú móvil (acordeón, mismo punto de corte que el CSS) el
// desplegable solo debe abrirse/cerrarse con el toque en el botón. Si
// además reacciona al "hover" (mouseenter/mouseleave de la fila), un
// tap dispara antes el mouseenter que lo abre, y el propio click del
// toggle lo cierra a continuación: el menú parecía no abrirse a la
// primera. Comprobamos el ancho real (no si el dispositivo "tiene
// hover", porque un ratón sobre una ventana estrecha también lo tiene)
// para desactivar el hover exactamente cuando el CSS pasa al acordeón.
const MOBILE_BREAKPOINT = 960
const isDesktopNav = ref(true)

function updateIsDesktopNav() {
  isDesktopNav.value = window.innerWidth > MOBILE_BREAKPOINT
}

let closeTimer: ReturnType<typeof setTimeout> | undefined
let subCloseTimer: ReturnType<typeof setTimeout> | undefined

function openMenu(name: string) {
  if (!isDesktopNav.value) return
  clearTimeout(closeTimer)
  activeMenu.value = name
}

function scheduleClose(name: string) {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    if (activeMenu.value === name) {
      activeMenu.value = null
      activeSubmenu.value = null
    }
  }, 180)
}

function cancelClose() {
  clearTimeout(closeTimer)
}

function toggleMenu(name: string) {
  activeMenu.value = activeMenu.value === name ? null : name
  if (activeMenu.value !== name) activeSubmenu.value = null
}

function openSubmenu(label: string) {
  if (!isDesktopNav.value) return
  clearTimeout(subCloseTimer)
  activeSubmenu.value = label
}

function scheduleCloseSubmenu() {
  clearTimeout(subCloseTimer)
  subCloseTimer = setTimeout(() => {
    activeSubmenu.value = null
  }, 180)
}

function cancelSubClose() {
  clearTimeout(subCloseTimer)
}

function toggleSubmenu(label: string) {
  activeSubmenu.value = activeSubmenu.value === label ? null : label
}

function closeAll() {
  activeMenu.value = null
  activeSubmenu.value = null
  mobileOpen.value = false
}

function handleScroll() {
  // Histéresis: evita que la clase cambie en bucle si el scroll oscila
  // justo alrededor del umbral.
  if (!isScrolled.value && window.scrollY > 24) {
    isScrolled.value = true
  } else if (isScrolled.value && window.scrollY < 8) {
    isScrolled.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeAll()
}

onMounted(() => {
  updateIsDesktopNav()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', updateIsDesktopNav)
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updateIsDesktopNav)
})
</script>

<style scoped>
.kb-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  font-family: var(--font-body);
  color: var(--color-ink);
  background: var(--color-paper);
  transition: box-shadow var(--dur-slow) var(--ease-base);
}

.kb-header--scrolled {
  box-shadow: 0 1px 0 var(--color-line), var(--shadow-popover);
}

.kb-header__bar {
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px clamp(20px, 4vw, 48px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* Marca */
.kb-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-ink);
  white-space: nowrap;
}

.kb-brand__logo {
  display: block;
  height: 72px;
  width: auto;
}

/* Navegación */
.kb-nav {
  display: flex;
  align-items: center;
  gap: clamp(16px, 2.4vw, 36px);
}

.kb-nav__list {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.6vw, 26px);
  list-style: none;
  margin: 0;
  padding: 0;
}

.kb-nav__item {
  position: relative;
}

.kb-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 2px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--color-ink);
  text-decoration: none;
  position: relative;
}

.kb-nav__link::after {
  content: '';
  position: absolute;
  left: 2px;
  right: 2px;
  bottom: 4px;
  height: 1px;
  background: var(--color-rose-hover);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 360ms var(--ease-base);
}

.kb-nav__link:hover::after,
.kb-nav__link--trigger[aria-expanded='true']::after {
  transform: scaleX(1);
}

.kb-chevron {
  color: var(--color-rose-hover);
  transition: transform 320ms var(--ease-base);
}

.kb-chevron.is-open {
  transform: rotate(180deg);
}

.kb-chevron--nested {
  transform: rotate(-90deg);
}

.kb-chevron--nested.is-open {
  transform: rotate(0deg);
}

/* CTA */
.kb-cta {
  display: inline-flex;
  align-items: center;
  padding: 11px 24px;
  border-radius: 999px;
  background: var(--color-rose);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: var(--shadow-cta);
  transition: background-color 320ms var(--ease-base), transform 320ms var(--ease-base), box-shadow 320ms var(--ease-base);
}

.kb-cta:hover {
  background: var(--color-rose-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-cta-hover);
}

.kb-cta:active {
  transform: translateY(0) scale(0.98);
}

/* Dropdown nivel 1 */
.kb-dropdown {
  position: absolute;
  top: calc(100% + 14px);
  left: 50%;
  min-width: 300px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: 16px;
  box-shadow: var(--shadow-popover);
  padding: 10px;
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateX(-50%) translateY(-6px);
  transition: opacity 220ms var(--ease-base), transform 220ms var(--ease-base),
    visibility 0s linear 220ms;
}

.kb-dropdown.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
  transition: opacity 220ms var(--ease-base), transform 220ms var(--ease-base),
    visibility 0s linear;
}

.kb-dropdown__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.kb-dropdown__item {
  position: relative;
  border-radius: 10px;
}

.kb-dropdown__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  background: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
  text-decoration: none;
  cursor: pointer;
  text-align: left;
  border-left: 2px solid transparent;
  transition: background-color 220ms var(--ease-base), border-color 220ms var(--ease-base), padding-left 220ms var(--ease-base);
}

.kb-dropdown__link:hover,
.kb-dropdown__link--trigger[aria-expanded='true'] {
  background: var(--color-rose-soft-wash);
  border-left-color: var(--color-rose);
  padding-left: 18px;
}

/* Submenú (nivel 2) — "Psicología para adultos" */
.kb-submenu-wrap {
  position: absolute;
  top: -10px;
  left: calc(100% + 10px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-6px);
  transition: opacity 220ms var(--ease-base), transform 220ms var(--ease-base),
    visibility 0s linear 220ms;
}

.kb-submenu-wrap.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
  transition: opacity 220ms var(--ease-base), transform 220ms var(--ease-base),
    visibility 0s linear;
}

.kb-submenu {
  min-width: 260px;
  list-style: none;
  margin: 0;
  padding: 10px;
  background: var(--color-paper);
  border: 1px solid var(--color-line);
  border-radius: 14px;
  box-shadow: var(--shadow-popover);
}

.kb-submenu__link {
  display: block;
  padding: 11px 14px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
  text-decoration: none;
  transition: background-color 220ms var(--ease-base);
}

.kb-submenu__link:hover {
  background: var(--color-rose-soft-wash);
}

/* Botón hamburguesa (móvil) */
.kb-burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 20;
}

.kb-burger span {
  display: block;
  width: 22px;
  height: 1.4px;
  background: var(--color-ink);
  transition: transform 380ms var(--ease-base), opacity 240ms var(--ease-base);
}

.kb-burger.is-active span:nth-child(1) {
  transform: translateY(6.4px) rotate(45deg);
}

.kb-burger.is-active span:nth-child(2) {
  opacity: 0;
}

.kb-burger.is-active span:nth-child(3) {
  transform: translateY(-6.4px) rotate(-45deg);
}

.kb-nav-scrim {
  display: none;
}

/* ---------- Responsive ---------- */
@media (max-width: 960px) {
  .kb-burger {
    display: flex;
  }

  .kb-nav-scrim {
    display: block;
    position: fixed;
    inset: 0;
    background: var(--overlay-scrim);
    opacity: 0;
    pointer-events: none;
    transition: opacity 360ms var(--ease-base);
    z-index: 15;
  }

  .kb-nav-scrim.is-visible {
    opacity: 1;
    pointer-events: auto;
  }

  .kb-nav {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: min(360px, 86vw);
    background: var(--color-paper);
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 0;
    padding: 96px 28px 32px;
    box-shadow: var(--shadow-panel-mobile);
    transform: translateX(100%);
    transition: transform 460ms var(--ease-base);
    overflow-y: auto;
    z-index: 18;
  }

  .kb-nav--open {
    transform: translateX(0);
  }

  .kb-nav__list {
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    width: 100%;
  }

  .kb-nav__item {
    width: 100%;
    border-bottom: 1px solid var(--color-line);
  }

  .kb-nav__link {
    width: 100%;
    justify-content: space-between;
    padding: 16px 4px;
    font-size: 15px;
  }

  /* En móvil el desplegable no es un popover flotante, sino un acordeón
     que empuja el resto del menú: se anima con grid-template-rows para
     que la apertura/cierre se note bien (en vez del simple fundido usado
     en el popover de escritorio). */
  .kb-dropdown,
  .kb-submenu-wrap {
    position: static;
    transform: none;
    width: 100%;
    min-width: 0;
    padding: 0;
    box-shadow: none;
    border: none;
    border-radius: 0;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 320ms var(--ease-base);
  }

  .kb-dropdown.is-open,
  .kb-submenu-wrap.is-open {
    grid-template-rows: 1fr;
  }

  .kb-dropdown__list,
  .kb-submenu {
    min-height: 0;
    overflow: hidden;
  }

  .kb-dropdown__list {
    padding: 0 0 8px 12px;
  }

  .kb-submenu {
    min-width: 0;
    padding: 0 0 8px 20px;
    background: none;
    border-radius: 0;
  }

  .kb-cta {
    margin-top: 20px;
    justify-content: center;
    text-align: center;
  }
}
</style>