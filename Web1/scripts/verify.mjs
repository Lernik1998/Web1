#!/usr/bin/env node
/**
 * Ejecuta todas las comprobaciones del proyecto (type-check, lint, tests,
 * build, auditoría de dependencias) y muestra un resumen final claro.
 * Termina con código de salida distinto de 0 si algo falla, para que se
 * pueda usar en CI.
 */
import { spawnSync } from 'node:child_process'

const steps = [
  { name: 'Type-check', cmd: 'npx vue-tsc --build --force' },
  { name: 'Lint', cmd: 'npm run lint' },
  { name: 'Tests', cmd: 'npm run test:unit -- --run' },
  { name: 'Build', cmd: 'npm run build' },
  { name: 'Auditoría de dependencias', cmd: 'npm audit' },
]

const results = []

for (const step of steps) {
  console.log(`\n▶ ${step.name}...`)
  const result = spawnSync(step.cmd, { stdio: 'inherit', shell: true })
  const ok = result.status === 0
  results.push({ name: step.name, ok })
  console.log(ok ? `✔ ${step.name} OK` : `✘ ${step.name} FALLÓ`)
}

console.log('\n──────── Resumen ────────')
for (const r of results) {
  console.log(`${r.ok ? '✔' : '✘'} ${r.name}`)
}

const allOk = results.every((r) => r.ok)
console.log(allOk ? '\nTODO OK ✅' : '\nHay comprobaciones que han FALLADO ❌')

process.exit(allOk ? 0 : 1)
