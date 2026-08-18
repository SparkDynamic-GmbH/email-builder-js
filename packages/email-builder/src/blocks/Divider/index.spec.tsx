import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Divider } from '.';

describe('Divider', () => {
  it('renders with default values', () => {
    expect(render(<Divider />).asFragment()).toMatchSnapshot();
  });

  it('renders with props', () => {
    expect(
      render(
        <Divider
          style={{
            padding: { top: 1, left: 2, bottom: 3, right: 4 },
            backgroundColor: '#fff000',
          }}
          props={{ lineColor: '#444222', lineHeight: 10 }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders a narrow rule as a table of that width, positioned by the align attribute', () => {
    expect(
      render(<Divider props={{ lineColor: '#8A1338', lineHeight: 3, lineWidth: 72, align: 'center' }} />).asFragment()
    ).toMatchSnapshot();
  });

  it('ignores alignment at full width', () => {
    expect(render(<Divider props={{ align: 'right' }} />).asFragment()).toMatchSnapshot();
  });
});
