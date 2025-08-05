function extractPathnameSegments(path) {
  const splitUrl = path.split("/");

  // Handle /maps/:lat/:lon route specially
  if (splitUrl[1] === "maps" && splitUrl.length >= 4) {
    return {
      resource: splitUrl[1],
      lat: splitUrl[2],
      lon: splitUrl[3],
    };
  }

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = "";

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  // Handle maps route specially
  if (
    pathSegments.resource === "maps" &&
    pathSegments.lat &&
    pathSegments.lon
  ) {
    return "/maps/:lat/:lon";
  }

  if (pathSegments.id) {
    pathname = pathname.concat("/:id");
  }

  return pathname || "/";
}

export function getActivePathname() {
  // Pastikan mengembalikan path dari location.hash tanpa '#'
  // Dan menghapus trailing slash jika ada, kecuali untuk root path
  const path = location.hash.substring(1) || "/";
  return path === "/" ? path : path.replace(/\/+$/, "");
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  const route = constructRouteFromSegments(urlSegments);
  console.log("Active route:", route, "from pathname:", pathname); // Detailed debug
  return route;
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}

// Tambahkan fungsi untuk ekstrak parameter dari URL
export function getUrlParams(pathname) {
  const segments = pathname.split("/");

  // Handle special case for /maps/:lat/:lon
  if (segments[1] === "maps" && segments.length >= 4) {
    return {
      lat: parseFloat(segments[2]),
      lon: parseFloat(segments[3]),
    };
  }

  // Handle generic /:id case
  if (segments.length >= 3) {
    return { id: segments[2] };
  }

  return {};
}
