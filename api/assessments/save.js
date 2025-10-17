// /api/save/index.js
import { TableClient, AzureSASCredential } from "@azure/data-tables";

export default async (req, context) => {
  if (req.method !== 'POST') return { status: 405, body: 'POST only' };

  const body = await req.json();
  const { student, referenceText, recognizedText, scores, words, timestamp } = body || {};
  if (!student || !timestamp || !scores) return { status: 400, body: 'invalid payload' };

  // 연결 문자열 또는 SAS 사용 — 여기서는 연결 문자열 예시
  const { TABLE_CONN, TABLE_NAME } = process.env; // 애플리케이션 설정에 저장
  const client = TableClient.fromConnectionString(TABLE_CONN, TABLE_NAME);

  // 테이블 없으면 생성(초기 1회)
  await client.createTable({ onResponse: () => {} }).catch(() => {});

  const entity = {
    partitionKey: student,
    rowKey: timestamp,
    referenceText,
    recognizedText,
    overall: scores.overall,
    accuracy: scores.accuracy,
    fluency: scores.fluency,
    completeness: scores.completeness,
    wordsJson: JSON.stringify(words || [])
  };

  await client.upsertEntity(entity, "Merge");
  return { status: 200, jsonBody: { ok: true } };
};
