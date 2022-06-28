import path from 'path'
import fs from 'fs-extra'
import type { Compiler, WebpackPluginInstance } from 'webpack'

export class DeleteSourcePlugin implements WebpackPluginInstance {

  apply(compiler: Compiler) {
    compiler.hooks.environment.tap('DeleteSource', () => {
      compiler.options.devtool = 'hidden-source-map'
    })
    compiler.hooks.done.tapPromise('DeleteSource', async (stats) => {
      try {
        const { compilation } = stats
        const outputPath = compilation.outputOptions.path
        const promises = Object
          .keys(compilation.assets)
          .filter((filename) => filename.endsWith('.js.map') || filename.endsWith('.css.map'))
          .map((filename) => {
            if (!outputPath) return Promise.resolve()
            const filePath = path.join(outputPath, filename)
            return fs.remove(filePath)
          })
        await Promise.all(promises)
        console.info(`⚠️  Deleted ${promises.length} source map files`)
      } catch (err) {
        console.warn('⚠️  DeleteSourcePlugin: Error while deleting source maps after the build')
        console.error(err)
      }
    })
  }
}