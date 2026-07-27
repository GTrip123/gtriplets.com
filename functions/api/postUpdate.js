export async function onRequestPost(context) {
  const updates = JSON.parse(
    (await context.env.UPDATES.get("updates")) || "[]"
  );

  updates.unshift({
    title: "test",
    description: "beta test fixing",
    author: "gtripletsyt",
    date: new Date().toISOString(),
    url: "#"
  });

  await context.env.UPDATES.put(
    "updates",
    JSON.stringify(updates)
  );

  return Response.json({ success: true });
}
