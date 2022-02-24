import {MigrationInterface, QueryRunner} from "typeorm";
import * as bcrypt from 'bcryptjs'
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet('1234567890abcdef', 20)

export class Admin1645672082791 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      const hash = await bcrypt.hash('admin', 12) 

      queryRunner.query(
        `INSERT INTO "user" (email, "passwordHash", "apiKey", "isAdmin", "createdAt", "updatedAt")
        VALUES ('admin', '${hash}', 'personal_${nanoid()}', true, NOW(), NOW())`
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
