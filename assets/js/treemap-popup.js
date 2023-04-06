addEventListener("DOMContentLoaded", () => {
  const plotSelector = "svg.treemap";
  const width = 300;
  const targetSelector = ".series";
  const titleSelector = "rect title";

  const plots = document.querySelectorAll(plotSelector);

  plots.forEach((plot) => {
    // Create the popup
    const popup = document.createElement("aside");
    popup.classList.add("popup", "tooltip");
    popup.style.position = "fixed";
    popup.style.background = "#b2b2b2";
    popup.style.padding = "0.5em";
    popup.hidden = true;
    popup.style.opacity = "0";
    popup.style.width = width + "px";
    popup.style.pointerEvents = "none";

    // Add just after the SVG
    plot.after(popup);

    let fader = undefined;
    function hidePopup(fadeTimeout = 0) {
      return () => {
        clearTimeout(fader);
        fader = setTimeout(
          () => {
            popup.style.opacity = "0";
            fader = setTimeout(() => {
              popup.hidden = true;
            }, 1000);
          },
          fadeTimeout,
        );
      };
    }

    addEventListener("scroll", hidePopup());
    plot.addEventListener("mouseleave", hidePopup(1000));

    plot.querySelectorAll(targetSelector).forEach(
      (target) => {
        target.addEventListener("mouseover", function (event) {
          clearTimeout(fader);
          popup.innerHTML = this.querySelector(titleSelector)?.innerHTML || "";
          popup.hidden = false;
          const { left: minX, right: maxX } = plot.getBoundingClientRect();
          const { x, y, width: boxWidth } = this.querySelector("rect")
            .getBoundingClientRect();
          const xPos = Math.min(
            maxX - width,
            Math.max(minX, x + boxWidth / 2 - width / 2),
          );
          popup.style.left = xPos + "px";
          popup.style.top = y + 10 + "px";
          event.target.style.background;
          const rect = event.currentTarget.querySelector('rect');
          popup.style.background = rect.getAttribute('fill');
          setTimeout(() => {
            popup.style.opacity = "1";
          }, 0);
        });
        // target.addEventListener("mousemove", function (event) {
        //   clearTimeout(fader);
        //   popup.style.left = event.clientX - width / 2 + "px";
        //   popup.style.top = event.clientY + "px";
        // });
      },
    );
  });
});
