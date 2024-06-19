export const detectMobile = () => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  const isMobileDevice = toMatch.some((toMatchItem) =>
    navigator.userAgent.match(toMatchItem)
  );
  const isSmallScreen = window.innerWidth <= 800 && window.innerHeight <= 600;

  return isMobileDevice || isSmallScreen;
};
