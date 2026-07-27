import { z } from 'zod';

import { Avatar, AvatarPropsSchema } from '../blocks/Avatar';
import { Button, ButtonPropsSchema } from '../blocks/Button';
import { CardPropsSchema } from '../blocks/Card';
import CardReader from '../blocks/Card/CardReader';
import ColumnsContainerPropsSchema from '../blocks/ColumnsContainer/ColumnsContainerPropsSchema';
import ColumnsContainerReader from '../blocks/ColumnsContainer/ColumnsContainerReader';
import { ContainerPropsSchema } from '../blocks/Container/ContainerPropsSchema';
import ContainerReader from '../blocks/Container/ContainerReader';
import { Divider, DividerPropsSchema } from '../blocks/Divider';
import { EmailLayoutPropsSchema } from '../blocks/EmailLayout/EmailLayoutPropsSchema';
import EmailLayoutReader from '../blocks/EmailLayout/EmailLayoutReader';
import { Heading, HeadingPropsSchema } from '../blocks/Heading';
import { Html, HtmlPropsSchema } from '../blocks/Html';
import { Image, ImagePropsSchema } from '../blocks/Image';
import { Spacer, SpacerPropsSchema } from '../blocks/Spacer';
import { Table, TablePropsSchema } from '../blocks/Table';
import { Text, TextPropsSchema } from '../blocks/Text';
import { buildBlockConfigurationDictionary } from '../core';

import createReader from './createReader';

export const READER_DICTIONARY = buildBlockConfigurationDictionary({
  ColumnsContainer: {
    schema: ColumnsContainerPropsSchema,
    Component: ColumnsContainerReader,
  },
  Container: {
    schema: ContainerPropsSchema,
    Component: ContainerReader,
  },
  EmailLayout: {
    schema: EmailLayoutPropsSchema,
    Component: EmailLayoutReader,
  },
  Card: {
    schema: CardPropsSchema,
    Component: CardReader,
  },
  //
  Avatar: {
    schema: AvatarPropsSchema,
    Component: Avatar,
  },
  Button: {
    schema: ButtonPropsSchema,
    Component: Button,
  },
  Divider: {
    schema: DividerPropsSchema,
    Component: Divider,
  },
  Heading: {
    schema: HeadingPropsSchema,
    Component: Heading,
  },
  Html: {
    schema: HtmlPropsSchema,
    Component: Html,
  },
  Image: {
    schema: ImagePropsSchema,
    Component: Image,
  },
  Spacer: {
    schema: SpacerPropsSchema,
    Component: Spacer,
  },
  Table: {
    schema: TablePropsSchema,
    Component: Table,
  },
  Text: {
    schema: TextPropsSchema,
    Component: Text,
  },
});

const reader = createReader(READER_DICTIONARY);

export const ReaderBlockSchema = reader.blockSchema;
export type TReaderBlock = z.infer<typeof ReaderBlockSchema>;

export const ReaderDocumentSchema = reader.documentSchema;
export type TReaderDocument = Record<string, TReaderBlock>;

export const renderToStaticMarkup = reader.renderToStaticMarkup;

export type TReaderProps = {
  document: TReaderDocument;
  rootBlockId: string;
};
export default reader.Reader;
