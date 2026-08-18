import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { ColumnsContainer } from '.';

describe('block-columns-container', () => {
  it('renders with default values', () => {
    expect(render(<ColumnsContainer />).asFragment()).toMatchSnapshot();
  });

  it('leaves the stacking class off when the row is told not to stack', () => {
    const { container } = render(<ColumnsContainer props={{ columnsCount: 2, stackOnMobile: false }} />);
    expect(container.querySelectorAll('.eb-column')).toHaveLength(0);
  });

  it('marks every cell for stacking by default', () => {
    const { container } = render(<ColumnsContainer props={{ columnsCount: 3 }} />);
    expect(container.querySelectorAll('.eb-column')).toHaveLength(3);
  });

  describe('columnsCount 2', () => {
    it('renders column children', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<ColumnsContainer props={{ columnsCount: 2 }} columns={columns} />).asFragment()).toMatchSnapshot();
    });

    it('uses padding correctly', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(
        render(
          <ColumnsContainer
            props={{
              columnsGap: 12,
              columnsCount: 2,
            }}
            columns={columns}
          />
        ).asFragment()
      ).toMatchSnapshot();
    });
  });

  describe('columnsCount 3', () => {
    it('renders column children', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(render(<ColumnsContainer props={{ columnsCount: 3 }} columns={columns} />).asFragment()).toMatchSnapshot();
    });

    it('uses padding correctly', () => {
      const columns = [<>bread</>, <>tomato</>, <>lettuce</>];
      expect(
        render(
          <ColumnsContainer
            props={{
              columnsGap: 12,
              columnsCount: 3,
            }}
            columns={columns}
          />
        ).asFragment()
      ).toMatchSnapshot();
    });
  });
});
