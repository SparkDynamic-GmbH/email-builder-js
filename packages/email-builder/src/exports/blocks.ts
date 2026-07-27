/**
 * The built-in block renderers, their zod schemas, props types and defaults.
 * Leaf blocks are self-contained; the container `*Reader` variants resolve
 * their children by id and so only work inside a Reader.
 */
export * from '../blocks/Avatar';
export * from '../blocks/Button';
export * from '../blocks/Card';
export * from '../blocks/Divider';
export * from '../blocks/Heading';
export * from '../blocks/Html';
export * from '../blocks/Image';
export * from '../blocks/Spacer';
export * from '../blocks/Table';
export * from '../blocks/Text';

export * from '../blocks/ColumnsContainer';
export * from '../blocks/Container';
export { default as CardReader } from '../blocks/Card/CardReader';
export { default as ColumnsContainerReader } from '../blocks/ColumnsContainer/ColumnsContainerReader';
export { default as ContainerReader } from '../blocks/Container/ContainerReader';
export { default as EmailLayoutReader } from '../blocks/EmailLayout/EmailLayoutReader';
export { EmailLayoutProps, EmailLayoutPropsSchema } from '../blocks/EmailLayout/EmailLayoutPropsSchema';
