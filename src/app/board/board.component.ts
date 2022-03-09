import { Component, OnInit } from '@angular/core';
import { delay } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  public sudokuBoard: number[][];
  
  constructor() {
    this.sudokuBoard = [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ];
  }

  ngOnInit(): void {
  }

  async solve() {
    await this.solveSudoku(this.sudokuBoard);
  }

  async solveSudoku(board: number[][]) {
    const checker: Checker = new Checker(board);

    if (!(await this.solveSudokuHelper(board, checker, 0, 0))) {
      throw new Error("Unsolvable board");
    }
  }

  async solveSudokuHelper(board: number[][], checker: Checker, i: number, j: number): Promise<boolean> {
    
    
    if (i === 9) {
      return true;
    }

    if (board[i][j] !== 0) {
      return (await this.solveSudokuHelper(board, checker, this.nextI(i, j), this.nextJ(i, j)));
    }

    for (var k: number = 1; k <= 9; k++) {
      if (checker.alreadyHasValue(k, i, j)) {
        continue;
      }
      await checker.placeInChecker(board,k,i,j);
      if (await this.solveSudokuHelper(board, checker, this.nextI(i,j), this.nextJ(i,j))) {
        return true;
      }
      await checker.remove(board, i, j);
    }
    return false;
  }

  nextI(i: number, j: number): number {
    return j == 8 ? i + 1 : i;
  }

  nextJ(i: number, j: number): number {
    return (j + 1) % 9;
  }

  public needsTopBorder(rowIndex: number): boolean {
    return (rowIndex <= 6 && rowIndex % 3 === 0)
  }

  public needsLeftBorder(colIndex: number): boolean {
    return (colIndex <= 6 && colIndex % 3 === 0)
  }

  public isLeftEdge(colIndex: number): boolean {
    return colIndex === 0;
  }

  public isTopEdge(rowIndex: number): boolean {
    return rowIndex === 0;
  }

  public isRightEdge(colIndex: number): boolean {
    return colIndex === 8;
  }

  public isBottomEdge(rowIndex: number): boolean {
    return rowIndex === 8;
  }
}

class Checker {
  private isInRow: boolean[][];
  private isInCol: boolean[][];
  private isInBox: boolean[][];

  constructor(board: number[][]) {
    if (board.length != 9 || board[0].length != 9)
      throw new Error("Invalid board");
    this.isInRow = new Array();
    this.isInBox = new Array();
    this.isInCol = new Array();
    this.fillBooleanArray(this.isInBox);
    this.fillBooleanArray(this.isInCol);
    this.fillBooleanArray(this.isInRow);

    this.fillWithOriginalValues(board);
  }

  public alreadyHasValue(value: number, i: number, j: number): boolean {
    
    return (this.isInRow[i][value] || this.isInCol[j][value] || this.isInBox[this.boxNumber(i, j)][value]);
  }

  public async placeInChecker(board: number[][], value: number, i: number, j: number) {
    this.isInRow[i][value] = true;
    this.isInCol[j][value] = true;
    this.isInBox[this.boxNumber(i, j)][value] = true;
    board[i][j] = value;
    return await this.wait(0.25);
  }

  public async remove(board: number[][], i: number, j: number) {
    const value = board[i][j];
    this.isInBox[this.boxNumber(i, j)][value] = false;
    this.isInCol[j][value] = false;
    this.isInRow[i][value] = false;
    board[i][j] = 0;
    return await this.wait(0.25);
  }

  private fillWithOriginalValues(board: number[][]) {
    for (var i: number = 0; i < board.length; i++) {
      for (var j: number = 0; j < board[0].length; j++) {
        if (board[i][j] === 0) {
          continue;
        }
        if (this.alreadyHasValue(board[i][j], i, j)) {
          throw new Error("Invalid board");
        }
        this.placeInChecker(board, board[i][j], i, j);
      }
    }
  }

  private boxNumber(i: number, j: number): number {
    return (3 * Math.floor(i / 3) + Math.floor(j / 3));
  }

  private fillBooleanArray(array: boolean[][]) {
    for (var i: number = 0; i < 9; i++) {
      var innerArray: boolean[] = new Array();
      for (var j: number = 0; j < 10; j++) {
        innerArray.push(false);
      }
      array.push(innerArray);
    }

  }

  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
