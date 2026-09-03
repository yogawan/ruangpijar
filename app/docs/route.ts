// app/docs/route.ts
import { ApiReference } from "@scalar/nextjs-api-reference";
import openApiDocument from "@/docs/openapi.json";

export const GET = ApiReference({
  content: openApiDocument,
  metaData: {
    title: "RuangPijar BFF API Reference",
  },
});
