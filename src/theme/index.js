function getThemeConfig() {
  return {
    colors: {
      background: "#f5f0e8",
      card: "#faf7f0",
      primary: "#8b7355",
      text: "#2c2c2c",
      muted: "#999",
      danger: "#ef5350",
      divider: "#d4c5a9",
    },
    fonts: {
      heading: '"Source Han Serif SC", "Noto Serif CJK SC", "宋体", serif',
      body: '"Source Han Serif SC", "Noto Serif CJK SC", "宋体", serif',
      accent: '"Source Han Serif SC", "宋体", serif',
    },
    animation: {
      fadeIn: { duration: 600, easing: "ease-out" },
      slideUp: { duration: 400, easing: "ease-out", offsetY: 20 },
    },
  }
}

module.exports = { getThemeConfig };