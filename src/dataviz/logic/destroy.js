export default function destroy(elements) {
  elements.forEach((el) => {
    el?.remove?.();
    el?.destroy?.();
  });
}
