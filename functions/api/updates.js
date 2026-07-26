export async function onRequest(context) {

  const updates = [
    {
      title: "actually putting games on the site",
      description: "ill try to put games on the site, since school is approaching and i just lowk want to do it. see ya in a few hours while i do it",
      author: "gtripletsyt",
      date: "2026-07-25T17:57:23Z",
      url: "#"
    },
    {
      title: "less work on the site",
      description: "hello everyone. so this website will most likely not have a lot of work done on it, since i grinded to get the main part done. i might update this every once in a while to tell yall how im doing, but since there's nothing to add to the site as much, i wont do as much. i might edit some stuff every day but not much. thanks for reading!",
      author: "gtripletsyt",
      date: "2026-07-20T18:15:43Z",
      url: "#"
    },
    {
      title: "testing",
      description: "hopefully this works otherwise im done for",
      author: "gtripletsyt",
      date: "2026-07-19T15:15:02Z",
      url: "#"
    },
  ];
  return Response.json(updates);
  const { UPDATES } = context.env;

    const data = await UPDATES.get("updates");

    return Response.json(JSON.parse(data || "[]"));
}
