
// Re-export all maze utility functions from their respective files
export { generateMaze, removeWalls, initializeMaze } from './mazeGenerator';
export { canMoveTo } from './playerMovement';
export { generateTreasures, chooseRandomEdgeCell } from './gameElements';
export { findPath } from './pathfinding';
