const host = process.env.TEST_HOST || '127.0.0.1'
const port = process.env.TEST_PORT || '4321'

export const BASE = `http://${host}:${port}`
