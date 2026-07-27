import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Card } from '.';

describe('block-card', () => {
  it('renders with default values', () => {
    expect(render(<Card />).asFragment()).toMatchSnapshot();
  });

  it('renders image left with children content', () => {
    expect(
      render(
        <Card
          props={{
            imageUrl: 'https://assets.usewaypoint.com/sample-image.jpg',
            imageAlt: 'Sample product',
            imagePosition: 'left',
          }}
        >
          <h3>New arrival</h3>
          <p>A short description of the product.</p>
        </Card>
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders image right', () => {
    expect(
      render(
        <Card props={{ imageUrl: 'https://assets.usewaypoint.com/sample-image.jpg', imagePosition: 'right' }} />
      ).asFragment()
    ).toMatchSnapshot();
  });
});
