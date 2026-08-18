import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Container } from '.';

describe('block-container', () => {
  it('renders with default values', () => {
    expect(render(<Container />).asFragment()).toMatchSnapshot();
  });

  it('draws a uniform 1px border when only a color is given', () => {
    expect(render(<Container style={{ borderColor: '#E2D9CF' }} />).asFragment()).toMatchSnapshot();
  });

  it('draws only the sides that have a width', () => {
    expect(
      render(
        <Container
          style={{
            backgroundColor: '#F4EEE7',
            borderColor: '#8A1338',
            borderWidth: { top: 0, right: 0, bottom: 0, left: 3 },
            padding: { top: 20, bottom: 20, left: 24, right: 24 },
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });
});
