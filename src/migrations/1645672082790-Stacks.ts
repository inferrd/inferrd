import {MigrationInterface, QueryRunner} from "typeorm";

export class Stacks1645672082790 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      queryRunner.query(
        `INSERT INTO stack (name, "humanReadableId", "dockerUrl", "available", "createdAt", "updatedAt", "supportGpu")
        VALUES ('Scikit-Learn', 'sklearn:v8', 'inferrd/sklearn:latest', true, NOW(), NOW(), false),
        ('TensorFlow 2.0', 'tensorflow:latest', 'inferrd/tensorflow:latest', true, NOW(), NOW(), true),
        ('ONNX', 'onnx:latest', 'onnx:latest', true, NOW(), NOW(), true)`
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
