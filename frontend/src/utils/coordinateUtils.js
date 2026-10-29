/**
 * Coordinate Transformation & Video Aspect Ratio Utilities
 * 
 * Accurately translates mouse coordinates from the DOM / Viewport to the video's
 * ORIGINAL / NATURAL resolution (e.g., 1920x1080), accounting for:
 * 1. Letterboxing (horizontal black bars at top/bottom)
 * 2. Pillarboxing (vertical black bars at left/right)
 * 3. object-fit: contain rendering calculations
 * 4. Responsive window resizing and aspect-ratio shifts
 */

/**
 * Calculates the exact rendered dimensions and offsets of the video content
 * inside its container element when using `object-fit: contain`.
 *
 * @param {HTMLVideoElement|null} videoElement - The HTML5 video element
 * @param {HTMLElement|null} containerElement - The container DOM element
 * @returns {Object} Render info with native dimensions, rendered dimensions, and offsets
 */
export function getVideoRenderInfo(videoElement, containerElement) {
  if (!containerElement) {
    return {
      videoWidth: 1920,
      videoHeight: 1080,
      containerWidth: 1920,
      containerHeight: 1080,
      renderedWidth: 1920,
      renderedHeight: 1080,
      offsetX: 0,
      offsetY: 0,
      scaleFactorX: 1,
      scaleFactorY: 1,
      isPillarboxed: false,
      isLetterboxed: false
    };
  }

  const containerRect = containerElement.getBoundingClientRect();
  const containerWidth = containerRect.width || 800;
  const containerHeight = containerRect.height || 450;

  // Use natural video dimensions if loaded, otherwise fallback to 16:9 1920x1080 or container aspect
  const videoWidth = (videoElement && videoElement.videoWidth) ? videoElement.videoWidth : 1920;
  const videoHeight = (videoElement && videoElement.videoHeight) ? videoElement.videoHeight : 1080;

  const containerAspect = containerWidth / containerHeight;
  const videoAspect = videoWidth / videoHeight;

  let renderedWidth = containerWidth;
  let renderedHeight = containerHeight;
  let offsetX = 0;
  let offsetY = 0;
  let isPillarboxed = false;
  let isLetterboxed = false;

  if (videoAspect > containerAspect) {
    // Video is wider than container -> Letterbox (black bars on top and bottom)
    renderedWidth = containerWidth;
    renderedHeight = containerWidth / videoAspect;
    offsetX = 0;
    offsetY = (containerHeight - renderedHeight) / 2;
    isLetterboxed = true;
  } else {
    // Video is taller than container -> Pillarbox (black bars on left and right)
    renderedHeight = containerHeight;
    renderedWidth = containerHeight * videoAspect;
    offsetX = (containerWidth - renderedWidth) / 2;
    offsetY = 0;
    isPillarboxed = true;
  }

  const scaleFactorX = videoWidth / renderedWidth;
  const scaleFactorY = videoHeight / renderedHeight;

  return {
    videoWidth,
    videoHeight,
    containerWidth,
    containerHeight,
    renderedWidth,
    renderedHeight,
    offsetX,
    offsetY,
    scaleFactorX,
    scaleFactorY,
    isPillarboxed,
    isLetterboxed
  };
}

/**
 * Converts mouse client coordinates to coordinates relative to the rendered video area.
 * Clamps coordinates within the rendered video boundaries [0, renderedWidth] x [0, renderedHeight].
 *
 * @param {number} clientX - Mouse event clientX
 * @param {number} clientY - Mouse event clientY
 * @param {HTMLElement} containerElement - Container DOM element
 * @param {Object} renderInfo - Result of getVideoRenderInfo
 * @returns {{ rx: number, ry: number, isInsideVideo: boolean }} Rendered-space coordinates
 */
export function clientToRenderedCoords(clientX, clientY, containerElement, renderInfo) {
  if (!containerElement || !renderInfo) return { rx: 0, ry: 0, isInsideVideo: false };

  const containerRect = containerElement.getBoundingClientRect();
  const mouseX = clientX - containerRect.left;
  const mouseY = clientY - containerRect.top;

  // Offset by black bars
  const rxUnclamped = mouseX - renderInfo.offsetX;
  const ryUnclamped = mouseY - renderInfo.offsetY;

  const isInsideVideo =
    rxUnclamped >= 0 &&
    rxUnclamped <= renderInfo.renderedWidth &&
    ryUnclamped >= 0 &&
    ryUnclamped <= renderInfo.renderedHeight;

  // Clamp within the rendered video content
  const rx = Math.max(0, Math.min(renderInfo.renderedWidth, rxUnclamped));
  const ry = Math.max(0, Math.min(renderInfo.renderedHeight, ryUnclamped));

  return { rx, ry, isInsideVideo };
}

/**
 * Converts a drawn rectangle in rendered-video pixel space to original/native video pixel resolution.
 *
 * @param {{ startX: number, startY: number, endX: number, endY: number }} dragBox - Coordinates in rendered-video pixels
 * @param {Object} renderInfo - Result of getVideoRenderInfo
 * @returns {{ x: number, y: number, width: number, height: number, pctX: number, pctY: number, pctW: number, pctH: number }}
 */
export function renderedRectToVideoROI(dragBox, renderInfo) {
  const minX = Math.min(dragBox.startX, dragBox.endX);
  const minY = Math.min(dragBox.startY, dragBox.endY);
  const width = Math.abs(dragBox.endX - dragBox.startX);
  const height = Math.abs(dragBox.endY - dragBox.startY);

  const nativeX = Math.round(minX * renderInfo.scaleFactorX);
  const nativeY = Math.round(minY * renderInfo.scaleFactorY);
  const nativeW = Math.round(width * renderInfo.scaleFactorX);
  const nativeH = Math.round(height * renderInfo.scaleFactorY);

  // Calculate percentages relative to the original video dimensions
  const pctX = (nativeX / renderInfo.videoWidth) * 100;
  const pctY = (nativeY / renderInfo.videoHeight) * 100;
  const pctW = (nativeW / renderInfo.videoWidth) * 100;
  const pctH = (nativeH / renderInfo.videoHeight) * 100;

  return {
    x: nativeX,
    y: nativeY,
    width: nativeW,
    height: nativeH,
    nativeW: renderInfo.videoWidth || 1920,
    nativeH: renderInfo.videoHeight || 1080,
    pctX,
    pctY,
    pctW,
    pctH
  };
}

/**
 * Converts a stored Video ROI (native resolution) into CSS style percentages
 * relative to the rendered video container overlay.
 *
 * @param {{ x: number, y: number, width: number, height: number }} roi
 * @param {number} nativeW - Original video width (default 1920)
 * @param {number} nativeH - Original video height (default 1080)
 * @returns {{ left: string, top: string, width: string, height: string }}
 */
export function videoROIToStyle(roi, nativeW = 1920, nativeH = 1080) {
  const w = nativeW || 1920;
  const h = nativeH || 1080;
  const x = roi?.x || 0;
  const y = roi?.y || 0;
  const width = roi?.width || 100;
  const height = roi?.height || 100;

  return {
    left: `${(x / w) * 100}%`,
    top: `${(y / h) * 100}%`,
    width: `${(width / w) * 100}%`,
    height: `${(height / h) * 100}%`
  };
}
