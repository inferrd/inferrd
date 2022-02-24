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
    migrationsRun: true,
    migrations: [
      process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'docker' ? './dist/migrations/*.js' : './src/migrations/*.ts'    
    ],
    entities: [
      process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'docker' ? './dist/entity/*.js' : './src/entity/**/*.ts'    
    ]
  })
}