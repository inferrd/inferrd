import debug from 'debug'

const logger = (module: string) => debug(`inferrd/${module}`)

export default logger
