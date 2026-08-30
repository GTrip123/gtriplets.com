export async function onRequest(context) {
  const response = await context.next();
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const isDriftBoss =
    pathname === "/games/drift-boss" ||
    pathname.startsWith("/games/drift-boss/");
  if (isDriftBoss) {
    return response;
  }
  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(`
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4454994261105400"
     crossorigin="anonymous"></script>
          <style>
           header {
          position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  font-family: Arial, sans-serif;
  z-index: 999999;
}
            header .logo {
              color: white;
              text-decoration: none;
              font-size: 20px;
              font-weight: bold;
            }
            header nav {
              display: flex;
              gap: 20px;
            }
            header nav a {
              color: #9ca3af;
              text-decoration: none;
              font-size: 14px;
              position: relative;
              padding-bottom: 8px;
            }
            header nav a.active::after {
              content: "";
              position: absolute;
              bottom: -8px;
              left: 0;
              width: 100%;
              height: 3px;
              background-color: blue;
            }
            #secret {
            display: none;
            }  
            header nav a:hover {
              color: white;
            }
            /* FOOTER */
            footer {
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              text-align: center;
              padding: 20px;
              color: #9ca3af;
              font-size: 14px;
              font-family: Arial, sans-serif;
              background: rgba(0, 0, 0, 0.2);
              z-index: 9999;
              box-sizing: border-box;
            }
            /* Keep content away from fixed elements */
            body {
              padding-top: 60px;
              padding-bottom: 70px;
            }
          </style>
          <script>
document.addEventListener('DOMContentLoaded', () => {
  const normalize = (path) => path.length > 1 ? path.replace(/\/+$/, '') : path;
  const currentPath = normalize(window.location.pathname);
  console.log('normalized current path:', currentPath);

  document.querySelectorAll('header nav a').forEach(link => {
    const linkPath = normalize(link.getAttribute('href'));
    console.log('checking link:', linkPath, 'match?', linkPath === currentPath);
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });
});
</script>
        `, { html: true });
      }
    })
    .on("body", {
      element(element) {
        element.prepend(`
          <header>
            <a href="/" class="logo">
              g triplets
            </a>
            <nav>
              <a href="/">home</a>
              <a href="/about">about</a>
              <a href="/contact">contact</a>
              <a href="/games">games</a>
              <a href="/live">news</a>
            </nav>
          </header>
        `, { html: true });
        element.append(`
          <footer>
            <a href="/" class="home-button">
              back home
            </a>
            <br>
            © 2026 gtriplets.com. all rights reserved.
          </footer>
        `, { html: true });
      }
    })
    .transform(response);
}
