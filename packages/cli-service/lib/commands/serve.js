const chalk = require('chalk')
const { info } = require('@microprogram/shared-utils')

const defaults = {
  host: '0.0.0.0',
  port: 3000,
  https: false
}

module.exports = (api) => {
  api.registerCommand(
    'serve',
    {
      description: 'start development server',
      usage: 'microprogram-cli-service serve [options] [entry]',
      options: {
        '--mock': `open browser on server start`,
        '--mode': `specify env mode (default: development)`,
        '--port': `specify port (default: ${defaults.port})`
      }
    },
    async function serve(args) {
      info('Starting development server...')

      const portfinder = require('portfinder')
      portfinder.basePort = args.port || defaults.port
      const port = await portfinder.getPortPromise()

      const staticPath = api.resolve('public')
      const Koa = require('koa')
      const static = require('koa-static')
      const server = new Koa()
      server.use(static(staticPath))

      if (args.mock) {
        server.use(
          require('@microprogram/plugin-mock')({
            prefix: '/mock',
            basePath: '/src/apis',
            mockDir: '/mock',
            includes: [/^.*Service/],
            mockFile: true,
            watchFile: true
          })
        )
      }

      server.listen(port)

      const task = require('../task')
      task.execute(['dev'])

      console.log()
      console.log(`  App running at:`)
      console.log(`  - Local:   ${chalk.cyan(`127.0.0.1:${port}`)}`)
      console.log()
    }
  )
}