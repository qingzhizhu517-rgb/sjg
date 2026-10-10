import { readFile } from 'node:fs/promises'
import { babelParse, compileScript, parse } from '@vue/compiler-sfc'
import * as vue from 'vue'

// Execute the real SFC setup with injectable network/router boundaries and Vue watchers.
export async function setupPage(relativePath, dependencies, props = {}) {
  const source = await readFile(new URL(`../../src/${relativePath}`, import.meta.url), 'utf8')
  const { descriptor } = parse(source)
  let code = compileScript(descriptor, { id: relativePath, genDefaultAs: 'component' }).content
  const imports = babelParse(code, { sourceType: 'module' }).program.body.filter(node => node.type === 'ImportDeclaration')
  const placeholders = Object.fromEntries(imports.flatMap(node => node.specifiers.map(specifier => [specifier.local.name, {}])))
  const vueBindings = Object.fromEntries(imports.filter(node => node.source.value === 'vue').flatMap(node => node.specifiers.map(specifier => [specifier.local.name, specifier.imported?.name === 'useCssVars' ? () => {} : vue[specifier.imported?.name]])))
  for (const node of imports.reverse()) code = code.slice(0, node.start) + code.slice(node.end)
  const mounted = [], cleanup = []
  const events = []
  const scope = vue.effectScope()
  const { ref, reactive, computed, watch, nextTick } = vue
  const browserEvents = new EventTarget()
  const window = {
    addEventListener: browserEvents.addEventListener.bind(browserEvents),
    removeEventListener: browserEvents.removeEventListener.bind(browserEvents),
    dispatchEvent: browserEvents.dispatchEvent.bind(browserEvents),
  }
  const deps = { ...placeholders, ...vueBindings, ref, reactive, computed, watch, nextTick, window, console: { error() {}, warn() {}, log() {} }, onMounted: fn => mounted.push(fn), onBeforeUnmount: fn => cleanup.push(fn), ...dependencies }
  const component = new Function(...Object.keys(deps), `${code}\nreturn component`)(...Object.values(deps))
  const state = scope.run(() => component.setup(props, { expose() {}, emit: (...args) => events.push(args) }))
  const ready = Promise.all(mounted.map(fn => fn()))
  return { state, ready, events, template: descriptor.template.content, dispose() { cleanup.forEach(fn => fn()); scope.stop() } }
}

export function testRoute(path, query = {}, params = {}) {
  const route = vue.reactive({ path, query, params, get fullPath() {
    const search = new URLSearchParams(Object.entries(this.query).filter(([, value]) => value != null)).toString()
    return this.path + (search ? `?${search}` : '')
  } })
  const destinations = []
  const router = {
    replace: async target => { route.query = Object.fromEntries(Object.entries(target.query || {}).filter(([, value]) => value != null)) },
    push: async target => { destinations.push(target) },
  }
  return { route, router, destinations }
}

export async function settle() { await vue.nextTick(); await new Promise(resolve => setImmediate(resolve)); await vue.nextTick() }
