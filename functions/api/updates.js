export async function onRequest(context) {

  const updates = JSON.parse(
    (await context.env.UPDATES.get("updates")) || "[]"
  );

  return Response.json(updates);

}
