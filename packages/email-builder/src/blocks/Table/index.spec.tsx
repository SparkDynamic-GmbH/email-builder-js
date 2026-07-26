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
