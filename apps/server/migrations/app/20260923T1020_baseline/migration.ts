#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3adbee9615380dba97c84c054f4d183b71bcdba026b324414c7778c676439d27/contract';
import endContract from '../../snapshots/3adbee9615380dba97c84c054f4d183b71bcdba026b324414c7778c676439d27/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'claimant',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('translationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'document',
        columns: [
          col('documentUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'executant',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('translationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'translation',
        columns: [
          col('boundaryDetail', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('considerationValue', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('dateOfExecution', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('documentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('documentNo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('documentRemarks', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('marketValue', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nature', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('plotNo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('prNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('propertyExtent', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('propertyType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scheduleRemarks', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('srNo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('surveyNo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('volNo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('username', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'translation',
        constraint: 'translation_documentId_srNo_key',
        columns: ['documentId', 'srNo'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'claimant',
        index: 'claimant_translationId_idx_5cd3d296',
        columns: ['translationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document',
        index: 'document_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'executant',
        index: 'executant_translationId_idx_5cd3d296',
        columns: ['translationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'translation',
        index: 'translation_documentId_idx_825ef746',
        columns: ['documentId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'claimant',
        foreignKey: {
          name: 'claimant_translationId_fkey',
          columns: ['translationId'],
          references: { schema: 'public', table: 'translation', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'document',
        foreignKey: {
          name: 'document_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'executant',
        foreignKey: {
          name: 'executant_translationId_fkey',
          columns: ['translationId'],
          references: { schema: 'public', table: 'translation', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'translation',
        foreignKey: {
          name: 'translation_documentId_fkey',
          columns: ['documentId'],
          references: { schema: 'public', table: 'document', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
