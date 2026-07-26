import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Table } from '.';

describe('Table', () => {
  it('renders with default values', () => {
    expect(render(<Table />).asFragment()).toMatchSnapshot();
  });

  it('renders a header row, striping and per-column alignment', () => {
    expect(
      render(
        <Table
          props={{
            rows: [
              ['Product', 'Qty', 'Price'],
              ['Widget', '2', '19.00'],
              ['Gadget', '1', '45.00'],
            ],
            headerRow: true,
            columnAlignments: ['left', 'center', 'right'],
            headerBackgroundColor: '#222222',
            headerTextColor: '#ffffff',
            stripedRowColor: '#f7f7f7',
            borderColor: '#444222',
            borderWidth: 2,
            cellPadding: 12,
          }}
          style={{
            color: '#111111',
            backgroundColor: '#fff000',
            fontFamily: 'MONOSPACE',
            fontSize: 12,
            padding: { top: 1, left: 2, bottom: 3, right: 4 },
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders without a header row', () => {
    expect(
      render(
        <Table
          props={{
            rows: [
              ['Monday', '09:00'],
              ['Tuesday', '10:00'],
            ],
            headerRow: false,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders column widths as percentages of their total, and a minimum row height', () => {
    expect(
      render(
        <Table
          props={{
            rows: [
              ['Wide', 'Narrow', 'Narrow'],
              ['a', 'b', 'c'],
            ],
            headerRow: false,
            // Shares, not percentages: 2:1:1 is the same table as 50:25:25.
            columnWidths: [2, 1, 1],
            minRowHeight: 40,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('ignores column widths that do not match the column count', () => {
    const { container } = render(<Table props={{ rows: [['a', 'b', 'c']], headerRow: false, columnWidths: [1, 1] }} />);
    // The outer table is the block's padding wrapper; the cells are in the inner one.
    const cells = container.querySelectorAll('table table td');
    expect(Array.from(cells, (cell) => cell.getAttribute('width'))).toEqual([null, null, null]);
  });

  it('pads short rows so every row has the same number of cells', () => {
    expect(
      render(
        <Table
          props={{
            rows: [['a', 'b', 'c'], ['d'], ['e', 'f']],
            headerRow: false,
            borderWidth: 0,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });
});
