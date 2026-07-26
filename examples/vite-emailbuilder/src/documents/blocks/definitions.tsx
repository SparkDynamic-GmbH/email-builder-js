import {
  CircleUserRound,
  CodeXml,
  Columns3,
  Heading as HeadingIcon,
  Image as ImageIcon,
  Minus,
  RectangleHorizontal,
  SquareStack,
  StretchVertical,
  Text as TextIcon,
} from 'lucide-react';
import React from 'react';

import { Avatar, AvatarProps, AvatarPropsSchema } from '@usewaypoint/block-avatar';
import { Button, ButtonPropsSchema } from '@usewaypoint/block-button';
import { Divider, DividerPropsSchema } from '@usewaypoint/block-divider';
import { Heading, HeadingPropsSchema } from '@usewaypoint/block-heading';
import { Html, HtmlPropsSchema } from '@usewaypoint/block-html';
import { Image, ImageProps, ImagePropsSchema } from '@usewaypoint/block-image';
import { Spacer, SpacerPropsSchema } from '@usewaypoint/block-spacer';
import { Text, TextProps, TextPropsSchema } from '@usewaypoint/block-text';
import {
  buildBlockDefinitionDictionary,
  ColumnsContainerReader,
  ContainerReader,
  EmailLayoutReader,
} from '@usewaypoint/email-builder';

import AvatarSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/AvatarSidebarPanel';
import ButtonSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/ButtonSidebarPanel';
import ColumnsContainerSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/ColumnsContainerSidebarPanel';
import ContainerSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/ContainerSidebarPanel';
import DividerSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/DividerSidebarPanel';
import EmailLayoutSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/EmailLayoutSidebarPanel';
import HeadingSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/HeadingSidebarPanel';
import HtmlSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/HtmlSidebarPanel';
import ImageSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/ImageSidebarPanel';
import SpacerSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/SpacerSidebarPanel';
import TextSidebarPanel from '../../App/InspectorDrawer/ConfigurationPanel/input-panels/TextSidebarPanel';

import ButtonEditor from './Button/ButtonEditor';
import ColumnsContainerEditor from './ColumnsContainer/ColumnsContainerEditor';
import ColumnsContainerPropsSchema, { ColumnsContainerProps } from './ColumnsContainer/ColumnsContainerPropsSchema';
import ContainerEditor from './Container/ContainerEditor';
import ContainerPropsSchema from './Container/ContainerPropsSchema';
import EmailLayoutEditor from './EmailLayout/EmailLayoutEditor';
import EmailLayoutPropsSchema from './EmailLayout/EmailLayoutPropsSchema';
import HeadingEditor from './Heading/HeadingEditor';
import ImageEditor from './Image/ImageEditor';
import TextEditor from './Text/TextEditor';

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
