<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
const isDropdownOpen = ref<Record<string, boolean>>({
  sobreNosotras: false,
  terapiaOnline: false,
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleDropdown = (dropdown: string) => {
  const wasOpen = isDropdownOpen.value[dropdown]
  // Close all dropdowns first
  Object.keys(isDropdownOpen.value).forEach((key) => {
    isDropdownOpen.value[key] = false
  })
  // Only open if it was closed (toggle behavior)
  if (!wasOpen) {
    isDropdownOpen.value[dropdown] = true
  }
}

defineOptions({
  name: 'MainHeader',
})
</script>

<template>
  <header class="header">
    <!-- Top dark section -->
    <div class="header-top"></div>

    <!-- Main section -->
    <div class="header-main">
      <div class="container">
        <!-- Logo section -->
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" class="brain-logo">
              <path
                d="M50 10 C30 10 15 25 15 45 C15 55 20 65 30 72 C25 78 25 85 30 90 C35 95 45 95 50 90 C55 95 65 95 70 90 C75 85 75 78 70 72 C80 65 85 55 85 45 C85 25 70 10 50 10 Z"
                fill="currentColor"
              />
              <path
                d="M35 30 C35 28 37 26 40 26 C43 26 45 28 45 30 C45 32 43 34 40 34 C37 34 35 32 35 30 Z"
                fill="#f5f5dc"
              />
              <path
                d="M55 30 C55 28 57 26 60 26 C63 26 65 28 65 30 C65 32 63 34 60 34 C57 34 55 32 55 30 Z"
                fill="#f5f5dc"
              />
              <path
                d="M40 45 C40 43 42 41 45 41 C48 41 50 43 50 45 C50 47 48 49 45 49 C42 49 40 47 40 45 Z"
                fill="#f5f5dc"
              />
              <path
                d="M50 55 C50 53 52 51 55 51 C58 51 60 53 60 55 C60 57 58 59 55 59 C52 59 50 57 50 55 Z"
                fill="#f5f5dc"
              />
            </svg>
          </div>
          <h1 class="logo-text">MARÍA B. KANBOURI</h1>
        </div>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <router-link to="/" class="nav-link">Inicio</router-link>
          <div class="nav-item dropdown">
            <button class="nav-link dropdown-toggle" @click="toggleDropdown('sobreNosotras')">
              Sobre Nosotras
              <svg
                class="dropdown-arrow"
                :class="{ open: isDropdownOpen.sobreNosotras }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu" :class="{ open: isDropdownOpen.sobreNosotras }">
              <router-link to="/sobre-nosotras/quienes-somos" class="dropdown-item"
                >Quiénes Somos</router-link
              >
              <router-link to="/sobre-nosotras/nuestra-filosofia" class="dropdown-item"
                >Nuestra Filosofía</router-link
              >
            </div>
          </div>
          <div class="nav-item dropdown">
            <button class="nav-link dropdown-toggle" @click="toggleDropdown('terapiaOnline')">
              Terapia Online
              <svg
                class="dropdown-arrow"
                :class="{ open: isDropdownOpen.terapiaOnline }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu" :class="{ open: isDropdownOpen.terapiaOnline }">
              <router-link to="/terapia-online/como-funciona" class="dropdown-item"
                >Cómo Funciona</router-link
              >
              <router-link to="/terapia-online/servicios" class="dropdown-item"
                >Servicios</router-link
              >
            </div>
          </div>
          <router-link to="/pedir-cita" class="nav-link cta-button">Pedir Cita</router-link>
        </nav>

        <!-- Mobile hamburger button -->
        <button class="hamburger" @click="toggleMobileMenu" :class="{ open: isMobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <nav class="mobile-nav" :class="{ open: isMobileMenuOpen }">
        <router-link to="/" class="mobile-nav-link">Inicio</router-link>
        <div class="mobile-dropdown">
          <button class="mobile-nav-link dropdown-toggle" @click="toggleDropdown('sobreNosotras')">
            Sobre Nosotras
            <svg
              class="dropdown-arrow"
              :class="{ open: isDropdownOpen.sobreNosotras }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="mobile-dropdown-menu" :class="{ open: isDropdownOpen.sobreNosotras }">
            <router-link to="/sobre-nosotras/quienes-somos" class="mobile-dropdown-item"
              >Quiénes Somos</router-link
            >
            <router-link to="/sobre-nosotras/nuestra-filosofia" class="mobile-dropdown-item"
              >Nuestra Filosofía</router-link
            >
          </div>
        </div>
        <div class="mobile-dropdown">
          <button class="mobile-nav-link dropdown-toggle" @click="toggleDropdown('terapiaOnline')">
            Terapia Online
            <svg
              class="dropdown-arrow"
              :class="{ open: isDropdownOpen.terapiaOnline }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="mobile-dropdown-menu" :class="{ open: isDropdownOpen.terapiaOnline }">
            <router-link to="/terapia-online/como-funciona" class="mobile-dropdown-item"
              >Cómo Funciona</router-link
            >
            <router-link to="/terapia-online/servicios" class="mobile-dropdown-item"
              >Servicios</router-link
            >
          </div>
        </div>
        <router-link to="/pedir-cita" class="mobile-nav-link cta-button">Pedir Cita</router-link>
      </nav>
    </div>

    <!-- Bottom dark section -->
    <div class="header-bottom"></div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
}

.header-top {
  height: 8px;
  background-color: #1a1a1a;
}

.header-main {
  background-color: #f5f0e6;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.logo-icon {
  width: 80px;
  height: 80px;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.brain-logo {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 2px;
  text-align: center;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover {
  color: #4a4a4a;
}

.cta-button {
  background-color: #1a1a1a;
  color: #f5f0e6 !important;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #333;
}

/* Dropdown */
.nav-item {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  padding: 0;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  min-width: 200px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0.5rem 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
  z-index: 1000;
}

.dropdown-menu.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #1a1a1a;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f0e6;
}

/* Hamburger button */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger span {
  width: 100%;
  height: 3px;
  background-color: #1a1a1a;
  border-radius: 3px;
  transition: all 0.3s;
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 1rem 2rem;
  background-color: #f5f0e6;
  border-top: 1px solid #e0d5c5;
}

.mobile-nav.open {
  display: flex;
}

.mobile-nav-link {
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e0d5c5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  border-bottom: 1px solid #e0d5c5;
  width: 100%;
  cursor: pointer;
  font-family: inherit;
}

.mobile-nav-link.cta-button {
  background-color: #1a1a1a;
  color: #f5f0e6 !important;
  padding: 1rem;
  text-align: center;
  border-radius: 4px;
  margin-top: 1rem;
}

.mobile-dropdown-menu {
  display: none;
  flex-direction: column;
  padding-left: 1rem;
}

.mobile-dropdown-menu.open {
  display: flex;
}

.mobile-dropdown-item {
  padding: 0.75rem 0;
  text-decoration: none;
  color: #4a4a4a;
  border-bottom: 1px solid #e8e0d5;
}

.header-bottom {
  height: 8px;
  background-color: #1a1a1a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .logo-section {
    flex: 0;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-text {
    font-size: 1.2rem;
  }

  .container {
    justify-content: center;
    position: relative;
  }

  .hamburger {
    position: absolute;
    right: 2rem;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    width: 50px;
    height: 50px;
  }

  .logo-text {
    font-size: 1rem;
  }

  .header-main {
    padding: 1.5rem 0;
  }
}
</style>
