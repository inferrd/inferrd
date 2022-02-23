import logger from "./logger";
import { getConnectionOptions, ConnectionOptions, createConnection } from 'typeorm'
import { genSaltSync } from "bcryptjs";

const debug = logger('db')

export async function connect() {
  await createConnection({
    type: 'postgres',
    synchronize: true,
    logging: false,
    url: process.env.DATABASE_URL,
    extra: {
      ssl: process.env.NODE_ENV == 'production' && {
        rejectUnauthorized: false
      }
    },
    entities: [
      process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'docker' ? './dist/entity/*.js' : './src/entity/**/*.ts'    
    ]
  })
}