import { Entity } from './interfaces/schemes';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constant';

export const renderRect = (entity: Entity, canvasContext: CanvasRenderingContext2D | null): void => {
  if (!canvasContext) return;
  canvasContext.fillRect(entity.position.x, entity.position.y, entity.width, entity.height);
};

export const drawScreenOverlay = (
  text: string,
  color: string,
  canvasContext: CanvasRenderingContext2D | null
): void => {
  if (!canvasContext) return;
  canvasContext.fillStyle = 'rgba(0, 0, 0, 0.8)';
  canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  canvasContext.fillStyle = color;
  canvasContext.font = 'bold 14px monospace';
  canvasContext.textAlign = 'center';
  canvasContext.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
};
