import {
  CircleUserRound,
  CodeXml,
  Columns3,
  Heading as HeadingIcon,
  Image as ImageIcon,
  LayoutTemplate,
  Minus,
  RectangleHorizontal,
  SquareStack,
  StretchVertical,
  Table as TableIcon,
  Text as TextIcon,
} from 'lucide-react';
import React from 'react';

import ColumnsContainerPropsSchema, {
  ColumnsContainerProps,
} from '../blocks/ColumnsContainer/ColumnsContainerPropsSchema';
import { ContainerPropsSchema } from '../blocks/Container/ContainerPropsSchema';
import { EmailLayoutPropsSchema } from '../blocks/EmailLayout/EmailLayoutPropsSchema';
import { buildBlockDefinitionDictionary } from '../core';
import {
  Avatar,
  AvatarProps,
  AvatarPropsSchema,
  Button,
  ButtonPropsSchema,
  Card,
  CardProps,
  CardPropsSchema,
  ColumnsContainerReader,
  ContainerReader,
  Divider,
  DividerPropsSchema,
  EmailLayoutReader,
  Heading,
  HeadingPropsSchema,
  Html,
  HtmlPropsSchema,
  Image,
  ImageProps,
  ImagePropsSchema,
  Spacer,
  SpacerPropsSchema,
  Table,
  TableProps,
  TablePropsSchema,
  Text,
  TextProps,
  TextPropsSchema,
} from '../exports/blocks';

import ButtonEditor from './blocks/Button/ButtonEditor';
import ColumnsContainerEditor from './blocks/ColumnsContainer/ColumnsContainerEditor';
import ContainerEditor from './blocks/Container/ContainerEditor';
import EmailLayoutEditor from './blocks/EmailLayout/EmailLayoutEditor';
import HeadingEditor from './blocks/Heading/HeadingEditor';
import ImageEditor from './blocks/Image/ImageEditor';
import TableEditor from './blocks/Table/TableEditor';
import TextEditor from './blocks/Text/TextEditor';
import AvatarSidebarPanel from './inspector/ConfigurationPanel/input-panels/AvatarSidebarPanel';
import ButtonSidebarPanel from './inspector/ConfigurationPanel/input-panels/ButtonSidebarPanel';
import CardSidebarPanel from './inspector/ConfigurationPanel/input-panels/CardSidebarPanel';
import ColumnsContainerSidebarPanel from './inspector/ConfigurationPanel/input-panels/ColumnsContainerSidebarPanel';
import ContainerSidebarPanel from './inspector/ConfigurationPanel/input-panels/ContainerSidebarPanel';
import DividerSidebarPanel from './inspector/ConfigurationPanel/input-panels/DividerSidebarPanel';
import EmailLayoutSidebarPanel from './inspector/ConfigurationPanel/input-panels/EmailLayoutSidebarPanel';
import HeadingSidebarPanel from './inspector/ConfigurationPanel/input-panels/HeadingSidebarPanel';
import HtmlSidebarPanel from './inspector/ConfigurationPanel/input-panels/HtmlSidebarPanel';
import ImageSidebarPanel from './inspector/ConfigurationPanel/input-panels/ImageSidebarPanel';
import SpacerSidebarPanel from './inspector/ConfigurationPanel/input-panels/SpacerSidebarPanel';
import TableSidebarPanel from './inspector/ConfigurationPanel/input-panels/TableSidebarPanel';
import TextSidebarPanel from './inspector/ConfigurationPanel/input-panels/TextSidebarPanel';

const DEFAULT_PADDING = { top: 16, bottom: 16, left: 24, right: 24 };
const ICON_CLASS = 'size-6';

/**
 * The block set of the editor. A block is declared once, here, and the reader,
 * the canvas, the inspector and the add-block menu are all derived from it —
 * see `documents/editor/core.tsx`.
 *
 * Key order is the order blocks appear in the add-block menu.
 */
const BLOCK_DEFINITIONS = buildBlockDefinitionDictionary({
  EmailLayout: {
    schema: EmailLayoutPropsSchema,
    Reader: EmailLayoutReader,
    Editor: EmailLayoutEditor,
    SidebarPanel: EmailLayoutSidebarPanel,
    // The layout is the canvas; it has no selection outline of its own.
    chrome: false,
  },
  Heading: {
    schema: HeadingPropsSchema,
    Reader: Heading,
    Editor: HeadingEditor,
    SidebarPanel: HeadingSidebarPanel,
    menu: {
      label: 'Heading',
      icon: <HeadingIcon className={ICON_CLASS} />,
      defaults: () => ({
        props: { text: 'Hello friend' },
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
  Text: {
    schema: TextPropsSchema,
    Reader: Text,
    Editor: TextEditor,
    SidebarPanel: TextSidebarPanel,
    menu: {
      label: 'Text',
      icon: <TextIcon className={ICON_CLASS} />,
      defaults: (): TextProps => ({
        props: { text: 'My new text block' },
        style: { padding: DEFAULT_PADDING, fontWeight: 'normal' },
      }),
    },
  },
  Button: {
    schema: ButtonPropsSchema,
    Reader: Button,
    Editor: ButtonEditor,
    SidebarPanel: ButtonSidebarPanel,
    menu: {
      label: 'Button',
      icon: <RectangleHorizontal className={ICON_CLASS} />,
      defaults: () => ({
        props: { text: 'Button', url: 'https://www.usewaypoint.com' },
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
  Image: {
    schema: ImagePropsSchema,
    Reader: Image,
    Editor: ImageEditor,
    SidebarPanel: ImageSidebarPanel,
    menu: {
      label: 'Image',
      icon: <ImageIcon className={ICON_CLASS} />,
      defaults: (): ImageProps => ({
        props: {
          url: 'https://assets.usewaypoint.com/sample-image.jpg',
          alt: 'Sample product',
          contentAlignment: 'middle',
          linkHref: null,
        },
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
  Card: {
    schema: CardPropsSchema,
    Reader: Card,
    SidebarPanel: CardSidebarPanel,
    menu: {
      label: 'Card',
      icon: <LayoutTemplate className={ICON_CLASS} />,
      defaults: (): CardProps => ({
        props: {
          imageUrl: 'https://assets.usewaypoint.com/sample-image.jpg',
          imageAlt: 'Sample product',
          imagePosition: 'top',
          heading: 'New arrival',
          body: 'A short description of the product goes here.',
          buttonText: 'Shop now',
          buttonUrl: 'https://www.usewaypoint.com',
        },
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
  Avatar: {
    schema: AvatarPropsSchema,
    Reader: Avatar,
    SidebarPanel: AvatarSidebarPanel,
    menu: {
      label: 'Avatar',
      icon: <CircleUserRound className={ICON_CLASS} />,
      defaults: (): AvatarProps => ({
        props: { imageUrl: 'https://ui-avatars.com/api/?size=128', shape: 'circle' },
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
  Divider: {
    schema: DividerPropsSchema,
    Reader: Divider,
    SidebarPanel: DividerSidebarPanel,
    menu: {
      label: 'Divider',
      icon: <Minus className={ICON_CLASS} />,
      defaults: () => ({
        props: { lineColor: '#CCCCCC' },
        style: { padding: { top: 16, right: 0, bottom: 16, left: 0 } },
      }),
    },
  },
  Spacer: {
    schema: SpacerPropsSchema,
    Reader: Spacer,
    SidebarPanel: SpacerSidebarPanel,
    menu: {
      label: 'Spacer',
      icon: <StretchVertical className={ICON_CLASS} />,
      defaults: () => ({}),
    },
  },
  Table: {
    schema: TablePropsSchema,
    Reader: Table,
    Editor: TableEditor,
    SidebarPanel: TableSidebarPanel,
    menu: {
      label: 'Table',
      icon: <TableIcon className={ICON_CLASS} />,
      defaults: (): TableProps => ({
        props: {
          headerRow: true,
          rows: [
            ['Item', 'Qty', 'Price'],
            ['', '', ''],
            ['', '', ''],
          ],
          columnAlignments: ['left', 'center', 'right'],
        },
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
  Html: {
    schema: HtmlPropsSchema,
    Reader: Html,
    SidebarPanel: HtmlSidebarPanel,
    menu: {
      label: 'Html',
      icon: <CodeXml className={ICON_CLASS} />,
      defaults: () => ({
        props: { contents: '<strong>Hello world</strong>' },
        style: { fontSize: 16, textAlign: null, padding: DEFAULT_PADDING },
      }),
    },
  },
  ColumnsContainer: {
    schema: ColumnsContainerPropsSchema,
    Reader: ColumnsContainerReader,
    Editor: ColumnsContainerEditor,
    SidebarPanel: ColumnsContainerSidebarPanel,
    menu: {
      label: 'Columns',
      icon: <Columns3 className={ICON_CLASS} />,
      defaults: (): ColumnsContainerProps => ({
        props: {
          columnsGap: 16,
          columnsCount: 3,
          columns: [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }],
        },
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
  Container: {
    schema: ContainerPropsSchema,
    Reader: ContainerReader,
    Editor: ContainerEditor,
    SidebarPanel: ContainerSidebarPanel,
    menu: {
      label: 'Container',
      icon: <SquareStack className={ICON_CLASS} />,
      defaults: () => ({
        style: { padding: DEFAULT_PADDING },
      }),
    },
  },
});

export default BLOCK_DEFINITIONS;
