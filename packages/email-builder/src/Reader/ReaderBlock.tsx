import React, { createContext, useContext } from 'react';

/**
 * A block as seen from inside a Reader, where the block set is only known to
 * the Reader that was created for it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TAnyBlock = { type: any; data: any };

type TReaderContextValue = {
  document: Record<string, TAnyBlock>;
  BlockComponent: (block: TAnyBlock) => React.JSX.Element;
};

export const ReaderContext = createContext<TReaderContextValue | null>(null);

export type TReaderBlockProps = { id: string };

/**
 * Renders the block with the given id using the block set of the enclosing
 * Reader. Container blocks call it to recurse into their children.
 */
export function ReaderBlock({ id }: TReaderBlockProps) {
  const context = useContext(ReaderContext);
  if (context === null) {
    throw new Error('ReaderBlock must be rendered inside a Reader');
  }
  const { document, BlockComponent } = context;
  return <BlockComponent {...document[id]} />;
}
