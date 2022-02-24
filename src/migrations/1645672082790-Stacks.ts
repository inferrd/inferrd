import {MigrationInterface, QueryRunner} from "typeorm";

export class Stacks1645672082790 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      queryRunner.query(
        `INSERT INTO stack (name, "dockerUrl", "available", "createdAt", "updatedAt", "supportGpu")
        VALUES ('Scikit-Learn', 'inferrd/sklearn:latest', true, NOW(), NOW(), false),
        ('TensorFlow 2.0', 'inferrd/tensorflow:latest', true, NOW(), NOW(), true),
        ('ONNX', 'inferrd/onnx:latest', true, NOW(), NOW(), true),`
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
