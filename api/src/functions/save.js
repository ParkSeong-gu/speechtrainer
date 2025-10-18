// /api/assessments/index.js
const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");

app.http("assessments", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const body = await request.json();
    const { student, referenceText, recognizedText, scores, words, timestamp } = body || {};
    
    if (!student || !timestamp || !scores) return { status: 400, body: 'invalid payload' };
      
    // 연결 문자열 사용-TABLE_CONN
    const { TABLE_CONN, TABLE_NAME } = process.env; // 애플리케이션 설정에 저장
    // 환경 변수가 없는 경우에 대한 처리
    if (!TABLE_CONN || !TABLE_NAME ) {
      context.log.error("Table storage connection string or table name is no configured.");
      return { status: 500, body: "Server configuration error." };
    }
  
    const client = TableClient.fromConnectionString(TABLE_CONN, TABLE_NAME);
  
    // 테이블 없으면 생성(초기 1회)
    await client.createTable({ onResponse: () => {} }).catch(() => {});
  
    const entity = {
      partitionKey: student,
      rowKey: String(timestamp),
      referenceText,
      recognizedText,
      overall: scores.overall,
      accuracy: scores.accuracy,
      fluency: scores.fluency,
      completeness: scores.completeness,
      wordsJson: JSON.stringify(words || [])
    };
    try {
      await client.upsertEntity(entity, "Merge");
      return { status: 200, jsonBody: { ok: true } };
    } catch (error) {
      context.log.error("Error upserting entity:", error);
      return { status: 500, body: "Failed to save data." };
    }
  }
};
