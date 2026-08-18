/**
 * The editor: an interactive canvas over a document, and an inspector for the
 * selected block. Both work over whatever block set the provider is given, so a
 * host can register blocks of its own.
 *
 * The chrome around them — toolbar, view tabs, loading and saving — is the
 * host's, as `examples/vite-emailbuilder` shows.
 *
 * Bring in `@sparkdynamic/email-builder/styles.css` for the styling.
 */

export {
  DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  EmailBuilderProvider,
  EmailBuilderProviderProps,
  TEditorActions,
  TSaveStatus,
  //
  useBlock,
  useCanRedo,
  useCanSave,
  useCanUndo,
  useDocument,
  useEditorActions,
  useEditorRegistry,
  useInspectorDrawerOpen,
  useIsDirty,
  useSaveError,
  useSaveStatus,
  useSelectedBlockId,
  useSelectedMainTab,
  useSelectedScreenSize,
  useSelectedSidebarTab,
} from './EditorContext';

/**
 * i18n. The editor's chrome is translated from a keyed catalog; pick the
 * language with the provider's `language` prop, and reword or extend it with
 * `translations`. `useTranslate` lets a host's own chrome and blocks read from
 * the same catalog.
 */
export {
  createTranslate,
  DEFAULT_LANGUAGE,
  I18nProvider,
  LANGUAGES,
  TKey,
  TLanguage,
  TTranslate,
  TTranslationKey,
  TTranslationOverrides,
  TTranslations,
  useLanguage,
  useTranslate,
} from './i18n';

/**
 * The image library. Give `EmailBuilderProvider` an `imageLibrary` and the
 * Image block's panel grows an upload/browse picker over it; the pieces are
 * exported so a host's own blocks can reuse the same store.
 */
export {
  ImageLibraryDialog,
  ImageLibraryProvider,
  ImagePickerButton,
  isImageLibraryUsable,
  TImageLibrary,
  TImageLibraryItem,
  TImageLibraryListParams,
  TImageLibraryListResult,
  TImageLibraryUploadParams,
  toImageLibraryItem,
  useImageLibrary,
} from './imageLibrary';

/**
 * The template library. Give `EmailBuilderProvider` a `templateLibrary` and
 * every block grows a "Save as template" action, while the saved set the host
 * hands back is offered in the sidebar and in the add-block menu.
 */
export {
  extractBlockTemplate,
  instantiateBlockTemplate,
  isBlockTemplateContent,
  isTemplateLibraryUsable,
  SaveTemplateButton,
  TBlockTemplate,
  TBlockTemplateContent,
  TBlockTemplateDraft,
  TemplateLibraryPanel,
  TemplateLibraryProvider,
  templateBlockCount,
  templateBlockTypes,
  templateKey,
  TTemplateLibrary,
  useInsertBlockTemplate,
  useIsTemplateSupported,
  useTemplateLibrary,
} from './templateLibrary';

/**
 * JSON import and export. A document is plain JSON, so it can be handed out as
 * a file and read back; the import checks it against the provider's registry.
 */
export {
  documentToJson,
  ExportJsonButton,
  ImportJsonButton,
  ImportJsonDialog,
  parseDocumentJson,
  TParseResult,
} from './json';

/** Saves through the provider's `onSave`, and shows where that got to. */
export { default as SaveButton } from './SaveButton';

/** Steps the document through the provider's undo history. */
export { default as UndoRedoButtons } from './UndoRedoButtons';

export { TEditorBlock, TEditorConfiguration, TEditorRegistry } from './types';

/** The canvas. Render it at the document's root block id. */
export { default as EditorBlock, useCurrentBlockId } from './EditorBlock';

/**
 * The built-in block set. Spread it into your own dictionary, then pass the
 * result through `buildBlockRegistry` from `../extensions`.
 */
export { default as BUILT_IN_BLOCK_DEFINITIONS } from './definitions';

/** Editor chrome for a canvas block: selection outline and the block menu. */
export { default as EditorBlockWrapper } from './helpers/block-wrappers/EditorBlockWrapper';

export { default as InspectorDrawer, INSPECTOR_DRAWER_WIDTH } from './inspector/InspectorDrawer';
export { default as ToggleInspectorPanelButton } from './inspector/ToggleInspectorPanelButton';
export { default as ConfigurationPanel } from './inspector/ConfigurationPanel';
export { default as StylesPanel } from './inspector/StylesPanel';

// Radix + Tailwind primitives the panels are built on, exported so a host's own
// blocks and chrome can match them.
export { default as Button, LinkButton } from './ui/Button';
export { default as cn } from './ui/cn';
export { default as Dialog, DialogActions, DialogContent } from './ui/Dialog';
export { default as Drawer } from './ui/Drawer';
export { default as IconButton, IconLinkButton } from './ui/IconButton';
export { default as Label } from './ui/Label';
export { default as Popover } from './ui/Popover';
export { default as Select, SelectOption } from './ui/Select';
export { default as Slider } from './ui/Slider';
export { default as Switch } from './ui/Switch';
export { default as Tabs, Tab } from './ui/Tabs';
export { default as TextField } from './ui/TextField';
export { default as Toast, ToastProvider } from './ui/Toast';
export { default as ToggleGroup, ToggleButton } from './ui/ToggleGroup';
export { default as Tooltip, TooltipProvider } from './ui/Tooltip';
