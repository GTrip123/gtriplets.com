export async function onRequestPost(context) {
  const SECRET = "c3d92b0d-7fe2-4b9b-8a31-your-secret-here";

  try {
    const body = await context.request.json();

    if (body.secret !== SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const updates = JSON.parse(
      (await context.env.UPDATES.get("updates")) || "[]"
    );

    updates.unshift({
      title: body.title,
      description: body.description,
      author: body.author,
      date: new Date().toISOString(),
      url: body.url || "#"
    });

    await context.env.UPDATES.put(
      "updates",
      JSON.stringify(updates)
    );

    return Response.json({
      success: true
    });

  } catch (err) {
    return new Response(err.toString(), {
      status: 500
    });
  }
}
