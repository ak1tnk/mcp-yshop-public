import { apiCatalog } from "./catalog.js";

export type Operation = keyof typeof apiCatalog;
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };
export interface ApiDefinition {
  readonly title: string;
  readonly group: string;
  readonly url: string;
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly encoding: "query" | "form" | "xml" | "json" | "multipart";
  readonly readOnly: boolean;
  readonly success: "data" | "status" | "stock";
  readonly response: "data" | "file";
  readonly sellerField: string | null;
  readonly sellerLocation: "body" | "query";
  readonly source: string;
  readonly parameters: readonly string[];
  readonly required: readonly string[];
  readonly uploadKind?: "image" | "zip" | "csv" | "attachment";
  readonly queryFields?: readonly string[];
  readonly jsonSuccess?: string;
  readonly readMode?: { readonly field: string; readonly value: number };
  readonly notes?: string;
}
export const operations: Readonly<Record<Operation, ApiDefinition>> = apiCatalog;
export const operationNames = Object.keys(operations) as [Operation, ...Operation[]];
