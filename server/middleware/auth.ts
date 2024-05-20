const logger = useLogger('server::middlewares::auth')

export default defineEventHandler((event) => {
  logger.info(event.node.req.url)
})
