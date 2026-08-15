declare module 'ogl' {
  export class Renderer {
    constructor(opts?: Record<string, unknown>)
    gl: WebGL2RenderingContext & { canvas: HTMLCanvasElement }
    setSize(w: number, h: number): void
    render(opts: { scene?: unknown }): void
  }
  export class Program {
    constructor(gl: unknown, opts: { vertex: string; fragment: string; uniforms: Record<string, { value: unknown }> })
    uniforms: Record<string, { value: any }>
  }
  export class Mesh {
    constructor(gl: unknown, opts: { geometry: unknown; program: unknown })
  }
  export class Triangle {
    constructor(gl: unknown)
  }
}